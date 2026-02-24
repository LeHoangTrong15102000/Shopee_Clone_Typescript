import classNames from 'classnames'
import { ORDER_STATUS_CONFIG, OrderStatus } from 'src/config/orderStatus'
import { OrderTracking, getCarrierDisplayName } from 'src/types/orderTracking.type'

interface OrderTrackingTimelineProps {
  tracking: OrderTracking
  className?: string
}

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipping',
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
  const currentStatusIndex = getStatusIndex(tracking.status)
  const isCancelled = tracking.status === 'cancelled'
  const isReturned = tracking.status === 'returned'

  return (
    <div className={classNames('bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-xl shadow-sm overflow-hidden', className)}>
      {/* Carrier Info Card */}
      <div className='p-4 md:p-5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/30 dark:from-orange-950/20 dark:via-slate-800 dark:to-amber-950/10'>
        <div className='flex items-center gap-3'>
          <div className='flex-1'>
            <h3 className='font-medium text-gray-900 dark:text-gray-100'>{getCarrierDisplayName(tracking.carrier)}</h3>
            <p className='text-sm text-gray-500 dark:text-gray-300'>
              Mã vận đơn: <span className='font-semibold text-orange dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-md text-xs'>{tracking.tracking_number}</span>
            </p>
          </div>
        </div>

        {/* Estimated Delivery */}
        {!isCancelled && !isReturned && tracking.status !== 'delivered' && (
          <div className='mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 rounded-lg'>
            <div className='flex items-center gap-2'>
              <svg className='h-4 w-4 text-orange dark:text-orange-400 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' />
              </svg>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                Dự kiến giao hàng:{' '}
                <span className='font-semibold text-orange dark:text-orange-400'>{formatDateTime(tracking.estimated_delivery)}</span>
              </p>
            </div>
          </div>
        )}

        {tracking.status === 'delivered' && (
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
          {tracking.timeline.map((event, index) => {
            const isLast = index === tracking.timeline.length - 1
            const isCurrent = event.status === tracking.status
            const eventStatusIndex = getStatusIndex(event.status as OrderStatus)
            const isPassed = eventStatusIndex < currentStatusIndex
            const isError = event.status === 'cancelled' || event.status === 'returned'

            return (
              <div key={`${event.timestamp}-${index}`} className='relative flex gap-3 md:gap-4'>
                {/* Timeline Line */}
                {!isLast && (
                  <div
                    className={classNames('absolute left-[11px] top-6 w-0.5 h-full -translate-x-1/2', {
                      'bg-green-500': isPassed && !isError,
                      'bg-orange': isCurrent && !isError,
                      'bg-gray-200 dark:bg-slate-600': !isPassed && !isCurrent,
                      'bg-red-500': isError
                    })}
                  />
                )}

                {/* Timeline Node */}
                <div className='relative z-10 flex-shrink-0'>
                  <div
                    className={classNames('w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center', {
                      'bg-green-500 shadow-sm shadow-green-300/50 dark:shadow-green-500/20': isPassed && !isError,
                      'bg-orange shadow-md shadow-orange-300/50 dark:shadow-orange-500/30': isCurrent && !isError,
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
                      'text-orange dark:text-orange-400': isCurrent && !isError,
                      'text-gray-400 dark:text-slate-400': !isPassed && !isCurrent && !isError,
                      'text-red-600 dark:text-red-400': isError
                    })}
                  >
                    {ORDER_STATUS_CONFIG[event.status as OrderStatus]?.label ?? event.status}
                  </div>
                  <p className='text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1'>{event.description}</p>
                  {event.location && (
                    <p className='text-xs text-gray-600 dark:text-gray-300 mt-1.5 flex items-center gap-1.5'>
                      <span className='inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex-shrink-0'>
                        <svg className='w-2.5 h-2.5 text-white' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
                        </svg>
                      </span>
                      {event.location}
                    </p>
                  )}
                  <p className='text-xs text-gray-500 dark:text-slate-400 mt-1'>{formatDateTime(event.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Last Updated */}
      <div className='px-3 pb-3 md:px-4 md:pb-4'>
        <p className='text-xs text-gray-500 dark:text-slate-400 text-right'>Cập nhật lần cuối: {formatDateTime(tracking.updatedAt)}</p>
      </div>
    </div>
  )
}

