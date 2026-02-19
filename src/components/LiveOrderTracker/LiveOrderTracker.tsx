import { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import OrderTimeline from 'src/components/OrderTimeline'
import useOrderTracking from 'src/hooks/useOrderTracking'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { purchasesStatus } from 'src/constant/purchase'
import { ANIMATION_DURATION, STAGGER_DELAY } from 'src/styles/animations'

interface LiveOrderTrackerProps {
  orderId: string
  initialStatus: number
  className?: string
  trackingNumber?: string
  carrier?: string
}

// Map from socket status strings to purchasesStatus numbers
const STATUS_MAP: Record<string, number> = {
  pending: purchasesStatus.waitForConfirmation,
  confirmed: purchasesStatus.waitForGetting,
  shipping: purchasesStatus.inProgress,
  delivered: purchasesStatus.delivered,
  cancelled: purchasesStatus.cancelled
}

// Status labels for toast notifications
const STATUS_LABELS: Record<number, string> = {
  [purchasesStatus.waitForConfirmation]: 'Chờ xác nhận',
  [purchasesStatus.waitForGetting]: 'Chờ lấy hàng',
  [purchasesStatus.inProgress]: 'Đang giao',
  [purchasesStatus.delivered]: 'Đã giao',
  [purchasesStatus.cancelled]: 'Đã hủy'
}

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: STAGGER_DELAY.normal, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: ANIMATION_DURATION.normal } }
}

export default function LiveOrderTracker({
  orderId,
  initialStatus,
  className,
  trackingNumber = 'VN2024SHOP001',
  carrier = 'Giao Hàng Nhanh'
}: LiveOrderTrackerProps) {
  const reducedMotion = useReducedMotion()
  const [currentStatus, setCurrentStatus] = useState(initialStatus)
  const [timestamps, setTimestamps] = useState<Record<number, string>>({})

  // Use the existing order tracking hook for real-time updates
  const { currentStatus: socketStatus, lastUpdate, isSubscribed } = useOrderTracking(orderId)

  // Handle real-time status updates from socket
  useEffect(() => {
    if (socketStatus) {
      const mappedStatus = STATUS_MAP[socketStatus]
      if (mappedStatus !== undefined && mappedStatus !== currentStatus) {
        setCurrentStatus(mappedStatus)

        // Update timestamp for this status
        if (lastUpdate) {
          setTimestamps((prev) => ({
            ...prev,
            [mappedStatus]: lastUpdate
          }))
        }

        // Show toast notification for status change
        const statusLabel = STATUS_LABELS[mappedStatus] || 'Cập nhật'
        if (mappedStatus === purchasesStatus.delivered) {
          toast.success(`🎉 Đơn hàng ${statusLabel}!`, { autoClose: 5000 })
        } else if (mappedStatus === purchasesStatus.cancelled) {
          toast.warning(`Đơn hàng ${statusLabel}`, { autoClose: 5000 })
        } else {
          toast.info(`Đơn hàng: ${statusLabel}`, { autoClose: 4000 })
        }
      }
    }
  }, [socketStatus, lastUpdate, currentStatus])

  // Calculate estimated delivery time (mock: 2-3 days from now for in-progress orders)
  const getEstimatedDelivery = useCallback(() => {
    if (currentStatus === purchasesStatus.inProgress) {
      const now = new Date()
      const minDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      const maxDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      return `${minDate.toLocaleDateString('vi-VN')} - ${maxDate.toLocaleDateString('vi-VN')}`
    }
    return null
  }, [currentStatus])

  const estimatedDelivery = getEstimatedDelivery()
  const isDelivered = currentStatus === purchasesStatus.delivered
  const isCancelled = currentStatus === purchasesStatus.cancelled

  return (
    <motion.div
      className={classNames(
        'overflow-hidden rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm',
        className
      )}
      variants={reducedMotion ? undefined : containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Header with gradient */}
      <motion.div
        className={classNames(
          'relative px-4 py-4 md:px-6',
          isDelivered
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : isCancelled
              ? 'bg-gradient-to-r from-red-500 to-rose-500'
              : 'bg-gradient-to-r from-[#ee4d2d] to-[#ff6b4a]'
        )}
        variants={reducedMotion ? undefined : itemVariants}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {/* Tracking Icon */}
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm'>
              <svg className={classNames('h-5 w-5', isDelivered ? 'text-green-500' : isCancelled ? 'text-red-500' : 'text-[#ee4d2d]')} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' />
              </svg>
            </div>
            <div>
              <h4 className='font-semibold text-white'>Theo dõi đơn hàng</h4>
              <p className='text-xs text-white/80'>Mã vận đơn: {trackingNumber}</p>
            </div>
          </div>

          {/* Live Badge */}
          {isSubscribed && !isDelivered && !isCancelled && (
            <motion.div
              className='flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm'
              initial={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
              animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: ANIMATION_DURATION.normal }}
            >
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-white' />
              </span>
              <span className='text-xs font-medium text-white'>LIVE</span>
            </motion.div>
          )}

          {/* Delivered Badge */}
          {isDelivered && (
            <div className='flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm'>
              <svg className='h-4 w-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
              </svg>
              <span className='text-xs font-medium text-white'>Hoàn thành</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className='p-4 md:p-6'>
        {/* Carrier Info */}
        <motion.div
          className='mb-4 flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-slate-700 p-3'
          variants={reducedMotion ? undefined : itemVariants}
        >
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-600 shadow-sm'>
            <svg className='h-5 w-5 text-[#ee4d2d]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.375m0 0V11.25m0 3H12M5.625 11.25H3.375m2.25 0V8.625c0-.621.504-1.125 1.125-1.125h5.25M12 11.25V8.625' />
            </svg>
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>{carrier}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Đơn vị vận chuyển</p>
          </div>
          <div className='text-right'>
            <p className='text-sm font-medium text-[#ee4d2d]'>{trackingNumber}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Mã vận đơn</p>
          </div>
        </motion.div>

        {/* Estimated delivery time for in-progress orders */}
        <AnimatePresence>
          {estimatedDelivery && (
            <motion.div
              className='mb-4 overflow-hidden rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'
              initial={reducedMotion ? undefined : { opacity: 0, height: 0 }}
              animate={reducedMotion ? undefined : { opacity: 1, height: 'auto' }}
              exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: ANIMATION_DURATION.normal }}
            >
              <div className='flex items-center gap-3 p-4'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-100'>
                  <span className='text-xl'>🚚</span>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Dự kiến giao hàng</p>
                  <p className='text-base font-semibold text-[#ee4d2d]'>{estimatedDelivery}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Timeline */}
        <motion.div variants={reducedMotion ? undefined : itemVariants}>
          <OrderTimeline orderId={orderId} currentStatus={currentStatus} timestamps={timestamps} />
        </motion.div>

        {/* Last update info */}
        {lastUpdate && (
          <motion.div
            className='mt-4 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-slate-700 pt-3'
            variants={reducedMotion ? undefined : itemVariants}
          >
            <svg className='h-4 w-4 text-gray-400 dark:text-gray-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              Cập nhật lần cuối:{' '}
              {new Date(lastUpdate).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

