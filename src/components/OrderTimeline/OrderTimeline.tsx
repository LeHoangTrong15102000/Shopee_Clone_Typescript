import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { purchasesStatus } from 'src/constant/purchase'
import { STAGGER_DELAY, ANIMATION_DURATION } from 'src/styles/animations'

interface OrderTimelineProps {
  orderId: string
  currentStatus: number // purchasesStatus value
  className?: string
  timestamps?: Record<number, string> // Optional timestamps for each status
}

interface OrderStep {
  status: number
  label: string
  icon: string
  description: string
}

const StepSvgIcon = ({ iconKey, className }: { iconKey: string; className?: string }) => {
  switch (iconKey) {
    case 'clock':
      return (
        <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      )
    case 'package':
      return (
        <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          />
        </svg>
      )
    case 'truck':
      return (
        <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12'
          />
        </svg>
      )
    case 'check-circle':
      return (
        <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      )
    default:
      return null
  }
}

const ORDER_STEPS: OrderStep[] = [
  {
    status: purchasesStatus.waitForConfirmation,
    label: 'Chờ xác nhận',
    icon: 'clock',
    description: 'Đơn hàng đang chờ người bán xác nhận'
  },
  {
    status: purchasesStatus.waitForGetting,
    label: 'Chờ lấy hàng',
    icon: 'package',
    description: 'Người bán đang chuẩn bị hàng'
  },
  {
    status: purchasesStatus.inProgress,
    label: 'Đang giao',
    icon: 'truck',
    description: 'Đơn hàng đang được vận chuyển'
  },
  { status: purchasesStatus.delivered, label: 'Đã giao', icon: 'check-circle', description: 'Giao hàng thành công' }
]

function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function OrderTimeline({ orderId: _orderId, currentStatus, className, timestamps }: OrderTimelineProps) {
  const reducedMotion = useReducedMotion()
  const isCancelled = currentStatus === purchasesStatus.cancelled

  // Timeline item entrance animation
  const timelineItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * STAGGER_DELAY.normal,
        duration: ANIMATION_DURATION.normal,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  }

  // Progress line animation
  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: { duration: ANIMATION_DURATION.slow, ease: 'easeOut' }
    }
  }

  // Cancelled state
  if (isCancelled) {
    return (
      <div className={classNames('relative', className)}>
        <motion.div
          className='flex items-center gap-4 rounded-xl border border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 p-4'
          initial={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: ANIMATION_DURATION.normal }}
        >
          {/* Cancelled icon */}
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-200 dark:shadow-red-900/50'>
            <svg className='h-6 w-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div>
            <span className='text-lg font-semibold text-red-600 dark:text-red-400'>Đơn hàng đã hủy</span>
            <p className='mt-1 text-sm text-red-500/80 dark:text-red-400/70'>
              Đơn hàng này đã bị hủy bởi người bán hoặc người mua
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Filter steps: only show statuses up to and including the current status
  const visibleSteps = ORDER_STEPS.filter((step) => step.status <= currentStatus)

  return (
    <div className={classNames('relative', className)}>
      {/* Progress bar background */}
      {visibleSteps.length > 0 && (
        <div className='absolute left-[23px] top-6 h-[calc(100%-48px)] w-1 rounded-full bg-gray-100 dark:bg-slate-700 md:left-[27px]' />
      )}

      <AnimatePresence>
        {visibleSteps.map((step, index) => {
          const isCompleted = currentStatus > step.status
          const isCurrent = currentStatus === step.status
          const isLast = index === visibleSteps.length - 1
          const timestamp = timestamps?.[step.status]

          return (
            <motion.div
              key={step.status}
              className='relative flex items-start gap-4 pb-6 last:pb-0'
              custom={index}
              variants={reducedMotion ? undefined : timelineItemVariants}
              initial='hidden'
              animate='visible'
            >
              {/* Progress line */}
              {!isLast && (
                <motion.div
                  className={classNames(
                    'absolute left-[23px] top-12 h-[calc(100%-24px)] w-1 origin-top rounded-full md:left-[27px]',
                    {
                      'bg-gradient-to-b from-green-500 to-green-400': isCompleted,
                      'bg-gradient-to-b from-[#ee4d2d] to-orange-300': isCurrent
                    }
                  )}
                  variants={reducedMotion ? undefined : lineVariants}
                  initial='hidden'
                  animate='visible'
                />
              )}

              {/* Step circle - border only style without animation */}
              <div
                className={classNames(
                  'relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-800 md:h-14 md:w-14',
                  {
                    'border-green-500 text-green-500': isCompleted,
                    'border-[#ee4d2d] text-[#ee4d2d]': isCurrent
                  }
                )}
              >
                {isCompleted ? (
                  <svg
                    className='h-6 w-6 md:h-7 md:w-7'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                  </svg>
                ) : (
                  <StepSvgIcon iconKey={step.icon} className='h-5 w-5 md:h-6 md:w-6' />
                )}
              </div>

              {/* Content */}
              <div className='flex-1 pt-1'>
                <div className='flex items-center gap-2'>
                  <span
                    className={classNames('text-base md:text-lg', {
                      'text-green-600 dark:text-green-400': isCompleted,
                      'text-[#ee4d2d]': isCurrent
                    })}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className='rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-xs font-medium text-[#ee4d2d]'>
                      Hiện tại
                    </span>
                  )}
                </div>
                <p className='mt-1 text-sm text-gray-600 dark:text-gray-300'>{step.description}</p>
                {timestamp && (
                  <p className='mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500'>
                    <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    {formatDateTime(timestamp)}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
