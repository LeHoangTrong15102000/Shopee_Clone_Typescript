import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import path from 'src/constant/path'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { User } from 'src/types/user.type'

interface ProfileCompletionProps {
  user: User | null
  className?: string
  compact?: boolean // For sidebar display
}

// Shimmer effect component for incomplete fields
const ShimmerEffect = () => (
  <motion.div
    className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent'
    animate={{ translateX: ['100%', '-100%'] }}
    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
    aria-hidden='true'
  />
)

// Floating particles for visual interest
interface FloatingParticleProps {
  delay: number
  size: number
  color: string
}

const FloatingParticle = ({ delay, size, color }: FloatingParticleProps) => (
  <motion.div
    className={`absolute rounded-full ${color}`}
    style={{ width: size, height: size }}
    initial={{ opacity: 0, y: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      y: [-5, -15, -25],
      x: [0, Math.random() * 10 - 5, Math.random() * 20 - 10]
    }}
    transition={{
      duration: 2.5,
      repeat: Infinity,
      repeatDelay: 1.5,
      delay,
      ease: 'easeOut'
    }}
    aria-hidden='true'
  />
)

// Golden shimmer sparkle component for 100% completion
interface GoldenSparkleProps {
  delay: number
  x: number
  y: number
  size?: number
}

const GoldenSparkle = ({ delay, x, y, size = 6 }: GoldenSparkleProps) => (
  <motion.div
    className='absolute rounded-full bg-gradient-to-r from-yellow-300 to-amber-400'
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0.5, 1.2, 0.5]
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 2,
      delay,
      ease: 'easeInOut'
    }}
    aria-hidden='true'
  />
)

// SVG Icons for profile fields
const ProfileIcons = {
  name: (className: string) => (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
      />
    </svg>
  ),
  avatar: (className: string) => (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z'
      />
    </svg>
  ),
  phone: (className: string) => (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3'
      />
    </svg>
  ),
  address: (className: string) => (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      aria-hidden='true'
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z' />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'
      />
    </svg>
  ),
  date_of_birth: (className: string) => (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5'
      />
    </svg>
  )
}

const PROFILE_FIELDS = [
  { key: 'name', label: 'Tên', weight: 20 },
  { key: 'avatar', label: 'Ảnh đại diện', weight: 20 },
  { key: 'phone', label: 'Số điện thoại', weight: 20 },
  { key: 'address', label: 'Địa chỉ', weight: 20 },
  { key: 'date_of_birth', label: 'Ngày sinh', weight: 20 }
] as const

type ProfileFieldKey = (typeof PROFILE_FIELDS)[number]['key']

const isFieldComplete = (user: User | null, key: ProfileFieldKey): boolean => {
  if (!user) return false
  const value = user[key]
  if (value === undefined || value === null || value === '') return false
  if (key === 'date_of_birth') {
    const date = new Date(value)
    return !isNaN(date.getTime())
  }
  return true
}

const ProfileCompletion = ({ user, className = '', compact = false }: ProfileCompletionProps) => {
  const reducedMotion = useReducedMotion()

  const { percentage, completedFields, incompleteFields } = useMemo(() => {
    let totalWeight = 0
    const completed: (typeof PROFILE_FIELDS)[number][] = []
    const incomplete: (typeof PROFILE_FIELDS)[number][] = []

    PROFILE_FIELDS.forEach((field) => {
      if (isFieldComplete(user, field.key)) {
        totalWeight += field.weight
        completed.push(field)
      } else {
        incomplete.push(field)
      }
    })

    return {
      percentage: totalWeight,
      completedFields: completed,
      incompleteFields: incomplete
    }
  }, [user])

  // SVG circle properties
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Get status color based on percentage - using beautiful gradient for 100%
  const getStatusColor = () => {
    if (percentage === 100) return { from: '#ee4d2d', to: '#ff6633' } // Shopee orange gradient
    if (percentage >= 60) return { from: '#f97316', to: '#ea580c' }
    return { from: '#f59e0b', to: '#d97706' }
  }
  const statusColor = getStatusColor()

  if (compact) {
    return (
      <div className={`mt-4 px-2 ${className}`}>
        <div className='text-sm font-medium text-gray-600 dark:text-gray-300 mb-2'>
          {percentage === 100 ? (
            <span className='flex items-center gap-1 text-green-600 dark:text-green-400'>
              <svg
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Hồ sơ đã hoàn thành
            </span>
          ) : (
            `Hoàn thành hồ sơ: ${percentage}%`
          )}
        </div>
        <div
          className='h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden'
          role='progressbar'
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Tiến độ hoàn thành hồ sơ: ${percentage}%`}
        >
          <motion.div
            className='h-full rounded-full bg-gradient-to-r from-[#ee4d2d] to-[#ff6633]'
            initial={reducedMotion ? { width: `${percentage}%` } : { width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    )
  }

  // Full version - Enhanced UI
  return (
    <div className={`relative mt-6 overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg ${className}`}>
      {/* Header with gradient */}
      <div className='relative bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 px-6 py-5'>
        {/* Decorative pattern overlay */}
        <div className='absolute inset-0 opacity-20'>
          <div
            className='absolute inset-0'
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
        </div>
        <div className='relative flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-bold text-white'>Tiến độ hoàn thành hồ sơ</h3>
            <p className='mt-1 text-sm text-white/80'>
              {percentage === 100
                ? 'Tuyệt vời! Hồ sơ đã hoàn chỉnh'
                : `Còn ${incompleteFields.length} mục cần cập nhật`}
            </p>
          </div>
          {percentage === 100 && (
            <motion.div
              initial={reducedMotion ? { scale: 1 } : { scale: 0 }}
              animate={{ scale: 1 }}
              className='flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'
              aria-hidden='true'
            >
              <svg
                className='h-7 w-7 text-white'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={1.5}
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z'
                />
              </svg>
            </motion.div>
          )}
        </div>
      </div>

      <div className='p-6'>
        <div className='flex flex-col sm:flex-row items-center gap-8'>
          {/* Circular Progress Ring */}
          <div
            className='relative flex-shrink-0'
            role='progressbar'
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Tiến độ hoàn thành hồ sơ: ${percentage}%`}
          >
            <svg width='120' height='120' className='transform -rotate-90' aria-hidden='true'>
              {/* Background circle */}
              <circle
                cx='60'
                cy='60'
                r={radius}
                fill='none'
                stroke='currentColor'
                strokeWidth='10'
                className='text-gray-200 dark:text-slate-700'
              />
              {/* Progress circle */}
              <motion.circle
                cx='60'
                cy='60'
                r={radius}
                fill='none'
                stroke={`url(#progressGradient-${percentage})`}
                strokeWidth='10'
                strokeLinecap='round'
                strokeDasharray={circumference}
                initial={reducedMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id={`progressGradient-${percentage}`} x1='0%' y1='0%' x2='100%' y2='0%'>
                  <stop offset='0%' stopColor={statusColor.from} />
                  <stop offset='100%' stopColor={statusColor.to} />
                </linearGradient>
              </defs>
            </svg>

            {/* Golden shimmer sparkles for 100% completion */}
            {percentage === 100 && !reducedMotion && (
              <>
                <GoldenSparkle delay={0} x={10} y={20} size={8} />
                <GoldenSparkle delay={0.5} x={95} y={15} size={6} />
                <GoldenSparkle delay={1} x={100} y={85} size={7} />
                <GoldenSparkle delay={1.5} x={5} y={90} size={5} />
                <GoldenSparkle delay={0.8} x={55} y={-5} size={6} />
                <GoldenSparkle delay={1.2} x={50} y={115} size={5} />
              </>
            )}

            {/* Percentage in center */}
            <div className='absolute inset-0 flex flex-col items-center justify-center p-4' aria-hidden='true'>
              <motion.span
                className='text-2xl font-bold'
                style={{ color: statusColor.from }}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {percentage}%
              </motion.span>
              <span className='text-[10px] font-medium mt-0.5' style={{ color: statusColor.from, opacity: 0.75 }}>
                hoàn thành
              </span>
            </div>
          </div>

          {/* Field list - Enhanced with gradients and animations */}
          <div className='flex-grow w-full'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {PROFILE_FIELDS.map((field, index) => {
                const isComplete = completedFields.some((f) => f.key === field.key)
                const IconComponent = ProfileIcons[field.key]
                return (
                  <motion.div
                    key={field.key}
                    className={`relative flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 cursor-default
                      ${
                        isComplete
                          ? 'bg-gradient-to-br from-emerald-50 via-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:via-emerald-900/30 dark:to-teal-900/40 border border-emerald-200/60 dark:border-emerald-700/50 shadow-sm hover:shadow-md hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/30'
                          : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/40 dark:via-amber-900/30 dark:to-yellow-900/40 border border-orange-200/60 dark:border-orange-700/50 shadow-sm hover:shadow-md hover:shadow-orange-100/50 dark:hover:shadow-orange-900/30'
                      }`}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.08 * index, ease: 'easeOut' }}
                    whileHover={reducedMotion ? {} : { scale: 1.03, y: -2 }}
                  >
                    {/* Shimmer effect for incomplete fields */}
                    {!isComplete && !reducedMotion && <ShimmerEffect />}

                    {/* Floating particles for visual interest */}
                    {!isComplete && !reducedMotion && (
                      <div className='absolute inset-0 pointer-events-none'>
                        <FloatingParticle delay={index * 0.3} size={4} color='bg-orange-300/40' />
                        <FloatingParticle delay={index * 0.3 + 0.5} size={3} color='bg-amber-300/40' />
                      </div>
                    )}

                    {/* Icon container with gradient background */}
                    <motion.div
                      className={`relative flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 shadow-sm
                        ${
                          isComplete
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600'
                            : 'bg-gradient-to-br from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600'
                        }`}
                      whileHover={reducedMotion ? {} : { rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      {IconComponent(`h-4 w-4 text-white drop-shadow-sm`)}
                    </motion.div>

                    {/* Label with enhanced typography */}
                    <span
                      className={`flex-1 text-sm font-semibold whitespace-nowrap
                      ${isComplete ? 'text-emerald-700 dark:text-emerald-200' : 'text-gray-700 dark:text-gray-200'}`}
                    >
                      {field.label}
                    </span>

                    {/* Status indicator */}
                    {isComplete ? (
                      <motion.div
                        className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 shadow-md'
                        aria-label='Đã hoàn thành'
                        initial={reducedMotion ? {} : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 * index }}
                      >
                        <svg
                          className='h-3.5 w-3.5 text-white drop-shadow-sm'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth={3}
                          aria-hidden='true'
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                        </svg>
                      </motion.div>
                    ) : (
                      <Link
                        to={path.profile}
                        className='relative flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-1 text-xs font-semibold text-white transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-200/50 dark:hover:shadow-orange-900/30 flex-shrink-0 overflow-hidden group'
                      >
                        <span className='relative z-10'>Cập nhật</span>
                        <svg
                          className='relative z-10 h-3 w-3 transition-transform group-hover:translate-x-0.5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3' />
                        </svg>
                        {/* Button shine effect */}
                        <motion.div
                          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full'
                          animate={{ translateX: ['100%', '-100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                          aria-hidden='true'
                        />
                      </Link>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Benefits panel - Shows when profile is incomplete */}
          {percentage < 100 && (
            <motion.div
              className='hidden lg:flex flex-col gap-3 w-48 flex-shrink-0'
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4 className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Lợi ích khi hoàn thành
              </h4>
              {[
                {
                  id: 'security',
                  icon: (
                    <svg
                      className='h-4 w-4 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={1.5}
                      aria-hidden='true'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
                      />
                    </svg>
                  ),
                  title: 'Bảo mật tài khoản',
                  desc: 'Xác minh danh tính, bảo vệ tài khoản'
                },
                {
                  id: 'rewards',
                  icon: (
                    <svg
                      className='h-4 w-4 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={1.5}
                      aria-hidden='true'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
                      />
                    </svg>
                  ),
                  title: 'Nhận ưu đãi',
                  desc: 'Voucher và khuyến mãi dành riêng'
                },
                {
                  id: 'shipping',
                  icon: (
                    <svg
                      className='h-4 w-4 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={1.5}
                      aria-hidden='true'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12'
                      />
                    </svg>
                  ),
                  title: 'Giao hàng nhanh hơn',
                  desc: 'Địa chỉ sẵn sàng, đặt hàng nhanh'
                }
              ].map((item, i) => (
                <motion.div
                  key={item.id}
                  className='flex items-start gap-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-slate-700/50 dark:to-slate-800/50 p-3 border border-gray-100 dark:border-slate-700/50'
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                >
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex-shrink-0'>
                    {item.icon}
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-gray-700 dark:text-gray-200'>{item.title}</p>
                    <p className='text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight'>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Congratulatory panel - Shows when profile is 100% complete */}
          {percentage === 100 && (
            <motion.div
              className='hidden lg:flex flex-col items-center justify-center gap-3 w-48 flex-shrink-0 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/30 dark:to-orange-900/30 p-5 border border-amber-200/50 dark:border-amber-700/40'
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className='flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-100/50 dark:shadow-amber-900/30'
                animate={reducedMotion ? {} : { scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <svg
                  className='h-7 w-7 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={1.5}
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'
                  />
                </svg>
              </motion.div>
              <div className='text-center'>
                <p className='text-sm font-bold text-amber-700 dark:text-amber-300'>Xuất sắc!</p>
                <p className='text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1 leading-relaxed'>
                  Hồ sơ hoàn chỉnh giúp bạn nhận được nhiều ưu đãi hơn
                </p>
              </div>
              <div className='flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-800/40 px-3 py-1.5 border border-amber-200/50 dark:border-amber-600/30'>
                <div className='h-2 w-2 rounded-full bg-amber-500 animate-pulse' aria-hidden='true' />
                <span className='text-[10px] font-semibold text-amber-700 dark:text-amber-300'>Đã xác minh</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom tip - Enhanced with gradient and icon animation */}
        {percentage < 100 && (
          <motion.div
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.5 }}
            className='mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 px-5 py-4 border border-blue-100/50 dark:border-blue-800/50 shadow-sm'
            role='alert'
          >
            <motion.div
              className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md flex-shrink-0'
              animate={reducedMotion ? {} : { rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <svg
                className='h-5 w-5 text-white'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                />
              </svg>
            </motion.div>
            <div className='flex-1'>
              <p className='text-sm font-semibold text-blue-700 dark:text-blue-200'>Mẹo nhỏ</p>
              <p className='text-xs text-blue-600/80 dark:text-blue-300/80 mt-0.5'>
                Hoàn thành hồ sơ để nhận ưu đãi và bảo mật tài khoản tốt hơn!
              </p>
            </div>
            <Link
              to={path.profile}
              className='flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 flex-shrink-0'
            >
              Hoàn thành ngay
              <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3' />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ProfileCompletion
