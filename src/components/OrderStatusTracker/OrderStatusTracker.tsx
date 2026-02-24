import classNames from 'classnames'
import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface OrderStatusTrackerProps {
  currentStatus: string | null
  lastUpdate: string | null
  isSubscribed: boolean
  className?: string
}

const StepIcon = ({ type, className, isActive }: { type: string; className?: string; isActive?: boolean }) => {
  const icons: Record<string, React.ReactNode> = {
    pending: (
      <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={isActive ? 2 : 1.5}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
    confirmed: (
      <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={isActive ? 2 : 1.5}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
    processing: (
      <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={isActive ? 2 : 1.5}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z' />
        <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
      </svg>
    ),
    shipping: (
      <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={isActive ? 2 : 1.5}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' />
      </svg>
    ),
    delivered: (
      <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={isActive ? 2 : 1.5}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' />
      </svg>
    )
  }
  return <>{icons[type] || null}</>
}

const ORDER_STEPS = [
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' }
]

const formatLastUpdate = (lastUpdate: string | null): string => {
  if (!lastUpdate) return ''
  const date = new Date(lastUpdate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'Vừa cập nhật'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ngày trước`
}

export default function OrderStatusTracker({
  currentStatus,
  lastUpdate,
  isSubscribed,
  className
}: OrderStatusTrackerProps) {
  const isCancelled = currentStatus === 'cancelled'
  const isReturned = currentStatus === 'returned'
  const isSpecialStatus = isCancelled || isReturned

  const currentStepIndex = useMemo(() => {
    if (!currentStatus || isSpecialStatus) return -1
    return ORDER_STEPS.findIndex((step) => step.key === currentStatus)
  }, [currentStatus, isSpecialStatus])

  return (
    <div className={classNames('relative rounded-2xl bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-orange-950/10 p-4 md:p-6 shadow-lg border border-gray-100/50 dark:border-slate-700 overflow-hidden', className)}>

      {/* Live tracking indicator - Enhanced */}
      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-4 py-2.5 ring-1 ring-green-200/50 dark:ring-green-700/50'
          aria-label='Đang theo dõi trạng thái đơn hàng trực tiếp'
        >
          <span className='relative flex h-2.5 w-2.5'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75'></span>
            <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500'></span>
          </span>
          <span className='text-sm font-medium text-green-700 dark:text-green-400'>Đang theo dõi trực tiếp</span>
          <svg className='h-4 w-4 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
          </svg>
        </motion.div>
      )}

      {/* Special status display - Enhanced */}
      {isSpecialStatus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={classNames(
            'mb-4 flex items-center justify-center gap-3 rounded-xl py-4 px-6',
            isCancelled
              ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 ring-1 ring-red-200/50 dark:ring-red-700/50'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 ring-1 ring-amber-200/50 dark:ring-amber-700/50'
          )}
        >
          <div className={classNames(
            'flex h-10 w-10 items-center justify-center rounded-full',
            isCancelled ? 'bg-red-100 dark:bg-red-900/50' : 'bg-amber-100 dark:bg-amber-900/50'
          )}>
            {isCancelled ? (
              <svg className='h-5 w-5 text-red-600 dark:text-red-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
              </svg>
            ) : (
              <svg className='h-5 w-5 text-amber-600 dark:text-amber-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3' />
              </svg>
            )}
          </div>
          <div>
            <p className={classNames('text-base font-semibold', isCancelled ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400')}>
              {isCancelled ? 'Đơn hàng đã bị hủy' : 'Đơn hàng đã được trả lại'}
            </p>
            <p className={classNames('text-sm', isCancelled ? 'text-red-500 dark:text-red-400/80' : 'text-amber-500 dark:text-amber-400/80')}>
              {isCancelled ? 'Liên hệ hỗ trợ nếu cần giúp đỡ' : 'Hoàn tiền sẽ được xử lý trong 3-5 ngày'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Step progress bar - Enhanced */}
      {!isSpecialStatus && (
        <div className='relative pt-2'>
          {/* Progress line background - connects center of first circle to center of last circle */}
          <div className='absolute left-[22px] right-[22px] md:left-[28px] md:right-[28px] top-7 md:top-8 h-1.5 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700'>
            {/* Animated progress fill */}
            <motion.div
              role='progressbar'
              initial={{ width: 0 }}
              animate={{
                width: currentStepIndex >= 0 ? `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` : '0%'
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className='h-full rounded-full bg-gradient-to-r from-orange via-orange-500 to-rose-500'
              style={{
                boxShadow: '0 0 10px rgba(238, 77, 45, 0.4)'
              }}
            />
          </div>

          {/* Steps */}
          <div className='relative flex justify-between'>
            {ORDER_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isFuture = index > currentStepIndex

              return (
                <div
                  key={step.key}
                  className='flex flex-col items-center'
                >
                  {/* Step circle - border only style without animation */}
                  <div
                    className={classNames(
                      'relative z-10 flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-800',
                      {
                        'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 text-green-600 dark:text-green-400 shadow-sm shadow-green-200/50 dark:shadow-green-800/30': isCompleted,
                        'border-orange bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 text-orange dark:text-orange-400 shadow-md shadow-orange-200/60 dark:shadow-orange-800/40 ring-2 ring-orange-100 dark:ring-orange-900/30': isCurrent,
                        'border-gray-200 dark:border-slate-600 text-gray-300 dark:text-slate-400': isFuture
                      }
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        className='h-5 w-5 md:h-6 md:w-6'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                      </svg>
                    ) : (
                      <StepIcon type={step.key} className='h-5 w-5 md:h-6 md:w-6' isActive={isCurrent} />
                    )}
                  </div>

                  {/* Step label */}
                  <span
                    className={classNames('mt-2 md:mt-3 text-center text-[10px] md:text-xs whitespace-nowrap', {
                      'text-green-600 dark:text-green-400 font-medium': isCompleted,
                      'text-orange dark:text-orange-400 font-semibold': isCurrent,
                      'text-gray-400 dark:text-slate-400 font-medium': isFuture
                    })}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Last update timestamp - Enhanced */}
      {lastUpdate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='mt-5 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-300'
        >
          <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <span>Cập nhật: {formatLastUpdate(lastUpdate)}</span>
        </motion.div>
      )}
    </div>
  )
}

