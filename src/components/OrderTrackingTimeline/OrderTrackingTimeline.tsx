import classNames from 'classnames'
import { ORDER_STATUS_CONFIG, OrderStatus } from 'src/config/orderStatus'
import { OrderTracking } from 'src/types/orderTracking.type'

interface OrderTrackingTimelineProps {
  tracking: OrderTracking
  className?: string
}

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered'
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

function getStatusIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status)
}

export default function OrderTrackingTimeline({ tracking, className }: OrderTrackingTimelineProps) {
  const currentStatusIndex = getStatusIndex(tracking.current_status)
  const isCancelled = tracking.current_status === 'cancelled'
  const isReturned = tracking.current_status === 'returned'

  return (
    <div className={classNames('bg-white dark:bg-slate-800 rounded-lg shadow-sm', className)}>
      {/* Carrier Info Card */}
      <div className='p-3 md:p-4 border-b border-gray-100 dark:border-slate-700'>
        <div className='flex items-center gap-3'>
          {tracking.carrier_logo && (
            <img src={tracking.carrier_logo} alt={tracking.carrier} className='w-10 h-10 md:w-12 md:h-12 object-contain rounded' />
          )}
          <div className='flex-1'>
            <h3 className='font-medium text-gray-900 dark:text-gray-100'>{tracking.carrier}</h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Mã vận đơn: <span className='font-medium text-[#ee4d2d]'>{tracking.tracking_number}</span>
            </p>
          </div>
        </div>

        {/* Estimated Delivery */}
        {!isCancelled && !isReturned && tracking.current_status !== 'delivered' && (
          <div className='mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg'>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Dự kiến giao hàng:{' '}
              <span className='font-semibold text-[#ee4d2d]'>{formatDateTime(tracking.estimated_delivery)}</span>
            </p>
          </div>
        )}

        {tracking.current_status === 'delivered' && (
          <div className='mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
            <p className='text-sm text-green-700 dark:text-green-400 font-medium'>✓ Đơn hàng đã được giao thành công</p>
          </div>
        )}

        {isCancelled && (
          <div className='mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg'>
            <p className='text-sm text-red-700 dark:text-red-400 font-medium'>✕ Đơn hàng đã bị hủy</p>
          </div>
        )}

        {isReturned && (
          <div className='mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg'>
            <p className='text-sm text-red-700 dark:text-red-400 font-medium'>↩ Đơn hàng đã được trả lại</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className='p-3 md:p-4'>
        <h4 className='font-medium text-gray-900 dark:text-gray-100 mb-4'>Trạng thái đơn hàng</h4>

        <div className='relative'>
          {tracking.events.map((event, index) => {
            const isLast = index === tracking.events.length - 1
            const isCurrent = event.status === tracking.current_status
            const eventStatusIndex = getStatusIndex(event.status)
            const isPassed = eventStatusIndex < currentStatusIndex
            const isError = event.status === 'cancelled' || event.status === 'returned'

            return (
              <div key={event._id} className='relative flex gap-3 md:gap-4'>
                {/* Timeline Line */}
                {!isLast && (
                  <div
                    className={classNames('absolute left-[11px] top-6 w-0.5 h-full -translate-x-1/2', {
                      'bg-green-500': isPassed && !isError,
                      'bg-[#ee4d2d]': isCurrent && !isError,
                      'bg-gray-200 dark:bg-slate-600': !isPassed && !isCurrent,
                      'bg-red-500': isError
                    })}
                  />
                )}

                {/* Timeline Node */}
                <div className='relative z-10 flex-shrink-0'>
                  <div
                    className={classNames('w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center', {
                      'bg-green-500': isPassed && !isError,
                      'bg-[#ee4d2d]': isCurrent && !isError,
                      'bg-gray-200 dark:bg-slate-600': !isPassed && !isCurrent && !isError,
                      'bg-red-500': isError
                    })}
                  >
                    {isPassed && !isError && (
                      <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    )}
                    {isCurrent && !isError && <div className='w-2 h-2 bg-white rounded-full' />}
                    {isError && (
                      <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Event Content */}
                <div className={classNames('flex-1 pb-6', { 'pb-0': isLast })}>
                  <div
                    className={classNames('font-medium', {
                      'text-green-600 dark:text-green-400': isPassed && !isError,
                      'text-[#ee4d2d]': isCurrent && !isError,
                      'text-gray-400 dark:text-gray-500': !isPassed && !isCurrent && !isError,
                      'text-red-600 dark:text-red-400': isError
                    })}
                  >
                    {ORDER_STATUS_CONFIG[event.status]?.label ?? event.status}
                  </div>
                  <p className='text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1'>{event.description}</p>
                  {event.location && <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>📍 {event.location}</p>}
                  <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>{formatDateTime(event.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Last Updated */}
      <div className='px-3 pb-3 md:px-4 md:pb-4'>
        <p className='text-xs text-gray-400 dark:text-gray-500 text-right'>Cập nhật lần cuối: {formatDateTime(tracking.last_updated)}</p>
      </div>
    </div>
  )
}

