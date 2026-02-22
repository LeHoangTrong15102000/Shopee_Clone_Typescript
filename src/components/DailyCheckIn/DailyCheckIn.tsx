import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import useDailyCheckIn from 'src/hooks/useDailyCheckIn'
import { DEFAULT_CHECKIN_CONFIG } from 'src/types/checkin.type'

interface DailyCheckInProps {
  className?: string
}

const DailyCheckIn = memo(function DailyCheckIn({ className }: DailyCheckInProps) {
  const { streak, totalCoins, canCheckInToday, checkIn, getMonthCalendar, nextReward, streakProgress } =
    useDailyCheckIn()

  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckIn = useCallback(async () => {
    if (!canCheckInToday || isChecking) return

    setIsChecking(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const reward = checkIn()
    if (reward) {
      toast.success(`🎉 Điểm danh thành công! +${reward.value} xu`, {
        autoClose: 3000,
        position: 'top-center'
      })
    }
    setIsChecking(false)
  }, [canCheckInToday, isChecking, checkIn])

  const calendar = getMonthCalendar(currentMonth.year, currentMonth.month)
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  const firstDayOfMonth = new Date(currentMonth.year, currentMonth.month, 1).getDay()

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { ...prev, month: prev.month - 1 }
    })
  }

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { ...prev, month: prev.month + 1 }
    })
  }

  const milestones = Object.keys(DEFAULT_CHECKIN_CONFIG.streakBonuses).map(Number).sort((a, b) => a - b)

  return (
    <div className={classNames('bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-lg shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className='bg-gradient-to-r from-orange to-[#ff6633] p-4 text-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-base md:text-lg font-bold'>Điểm danh hàng ngày</h3>
            <p className='text-sm text-white/80'>Điểm danh mỗi ngày để nhận xu</p>
          </div>
          <div className='text-right'>
            <div className='flex items-center gap-1'>
              <svg className='w-5 h-5 text-yellow-300' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0H8z' />
              </svg>
              <span className='text-lg md:text-xl font-bold'>{totalCoins}</span>
            </div>
            <p className='text-xs text-white/70'>Xu của bạn</p>
          </div>
        </div>
      </div>

      {/* Streak Info */}
      <div className='p-4 border-b border-gray-100 dark:border-slate-700'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>🔥</span>
            <div>
              <p className='font-medium text-gray-900 dark:text-gray-100'>Chuỗi {streak.current} ngày</p>
              <p className='text-xs text-gray-500 dark:text-gray-300'>Kỷ lục: {streak.longest} ngày</p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-600 dark:text-gray-300'>Phần thưởng tiếp theo</p>
            <p className='font-bold text-orange dark:text-orange-400'>+{nextReward.value} xu</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='relative'>
          <div className='h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden'>
            <motion.div
              className='h-full bg-gradient-to-r from-orange to-[#ff6633]'
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(streakProgress.progress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {/* Milestones */}
          <div className='flex justify-between mt-1'>
            {milestones.map((milestone) => (
              <div key={milestone} className='text-center' style={{ width: `${100 / milestones.length}%` }}>
                <div className={classNames('text-xs', streak.current >= milestone ? 'text-orange' : 'text-gray-400 dark:text-gray-500')}>
                  {milestone} ngày
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check-in Button */}
      <div className='p-4'>
        {canCheckInToday ? (
          <motion.button
            onClick={handleCheckIn}
            disabled={isChecking}
            whileTap={{ scale: 0.95 }}
            className='w-full py-3 rounded-lg font-bold text-lg transition-all bg-gradient-to-r from-orange to-[#ff6633] text-white hover:shadow-lg'
          >
            {isChecking ? (
              <span className='flex items-center justify-center gap-2'>
                <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                </svg>
                Đang điểm danh...
              </span>
            ) : (
              `Điểm danh nhận ${nextReward.value} xu`
            )}
          </motion.button>
        ) : (
          /* Checked-in Success State - Beautiful Gradient Design */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-[2px]'
          >
            <div className='relative rounded-[10px] bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/30 dark:to-cyan-900/30 px-4 py-3'>
              <div className='flex items-center justify-center gap-3'>
                {/* Animated Checkmark Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className='relative'
                >
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50'>
                    <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={3}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </div>
                  {/* Sparkle effect */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    className='absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full'
                  />
                </motion.div>

                {/* Gradient Text */}
                <div className='text-center'>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='font-bold text-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent'
                  >
                    Đã điểm danh hôm nay
                  </motion.span>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className='text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5'
                  >
                    Quay lại vào ngày mai nhé! 🎉
                  </motion.p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-200/30 dark:from-cyan-400/10 to-transparent rounded-bl-full' />
              <div className='absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-emerald-200/30 dark:from-emerald-400/10 to-transparent rounded-tr-full' />
            </div>
          </motion.div>
        )}

        {/* Toggle Calendar */}
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className='w-full mt-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-orange transition-colors flex items-center justify-center gap-1'
        >
          <svg className={classNames('w-4 h-4 transition-transform', showCalendar && 'rotate-180')} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
          {showCalendar ? 'Ẩn lịch' : 'Xem lịch điểm danh'}
        </button>
      </div>

      {/* Calendar */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden border-t border-gray-100 dark:border-slate-700'
          >
            <div className='p-4'>
              {/* Month Navigation */}
              <div className='flex items-center justify-between mb-4'>
                <button onClick={goToPrevMonth} className='p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded'>
                  <svg className='w-5 h-5 dark:text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
                <span className='font-medium dark:text-gray-200'>
                  {monthNames[currentMonth.month]} {currentMonth.year}
                </span>
                <button onClick={goToNextMonth} className='p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded'>
                  <svg className='w-5 h-5 dark:text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                  </svg>
                </button>
              </div>

              {/* Day Names */}
              <div className='grid grid-cols-7 gap-1 mb-2'>
                {dayNames.map((day) => (
                  <div key={day} className='text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1'>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className='grid grid-cols-7 gap-1'>
                {/* Empty cells for days before first day of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className='aspect-square' />
                ))}
                {/* Calendar days */}
                {calendar.map((day) => {
                  const dayNum = parseInt(day.date.split('-')[2])
                  const isToday = day.date === new Date().toISOString().split('T')[0]
                  return (
                    <div
                      key={day.date}
                      className={classNames(
                        'aspect-square flex items-center justify-center rounded-full text-xs md:text-sm relative',
                        day.checked && 'bg-orange text-white',
                        isToday && !day.checked && 'ring-2 ring-orange',
                        !day.checked && !isToday && 'text-gray-600 dark:text-gray-300'
                      )}
                    >
                      {dayNum}
                      {day.checked && (
                        <span className='absolute -top-1 -right-1 text-xs'>✓</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default DailyCheckIn

