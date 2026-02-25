import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import orderApi from 'src/apis/order.api'
import { OrderStatus, Order } from 'src/types/checkout.type'
import OrderCard from 'src/components/OrderCard'
import LiveOrderTracker from 'src/components/LiveOrderTracker'

const orderTabs: { status: OrderStatus | 'all'; label: string }[] = [
  { status: 'all', label: 'Tất cả' },
  { status: 'pending', label: 'Chờ xác nhận' },
  { status: 'confirmed', label: 'Đã xác nhận' },
  { status: 'shipping', label: 'Đang giao' },
  { status: 'delivered', label: 'Đã giao' },
  { status: 'cancelled', label: 'Đã hủy' }
]

export default function OrderList() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set())
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)

  const toggleOrderTracking = (orderId: string) => {
    setExpandedOrderIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  // Check if order can be tracked (pending, confirmed, or shipping)
  const isTrackableOrder = (status: OrderStatus) => {
    return ['pending', 'confirmed', 'shipping'].includes(status)
  }

  // Map OrderStatus string to numeric status for LiveOrderTracker
  const statusToNumber: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    processing: 3,
    shipping: 4,
    delivered: 5,
    cancelled: 6,
    returned: 7
  }

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', { status: activeTab, page }],
    queryFn: () => orderApi.getOrders({
      status: activeTab === 'all' ? undefined : activeTab,
      page,
      limit: 10
    })
  })

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => orderApi.cancelOrder(orderId, reason),
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      handleCloseModal()
    },
    onError: () => {
      toast.error('Hủy đơn hàng thất bại')
    }
  })

  const orders = ordersData?.data.data.orders || []
  const pagination = ordersData?.data.data.pagination

  const handleCancelOrder = (orderId: string) => {
    setCancelOrderId(orderId)
    setShowCancelModal(true)
  }

  const handleConfirmCancel = () => {
    if (cancelOrderId) {
      cancelMutation.mutate({ orderId: cancelOrderId, reason: cancelReason })
    }
  }

  const handleCloseModal = () => {
    setShowCancelModal(false)
    setCancelOrderId(null)
    setCancelReason('')
  }

  const handleReorder = (_order: Order) => {
    toast.info('Tính năng mua lại đang được phát triển')
  }

  const handleTabChange = (status: OrderStatus | 'all') => {
    setActiveTab(status)
    setPage(1)
  }

  return (
    <div className='space-y-4'>
      {/* Tabs */}
      <div className='sticky top-0 z-20 flex items-center rounded-t-sm bg-white dark:bg-slate-800 shadow-sm'>
        {orderTabs.map((tab) => (
          <button
            key={tab.status}
            onClick={() => handleTabChange(tab.status)}
            className={classNames(
              'flex flex-1 items-center justify-center bg-white dark:bg-slate-800 py-4 text-center transition-all hover:text-orange dark:hover:text-orange-400',
              {
                'border-b-2 border-b-orange text-orange dark:border-b-orange-400 dark:text-orange-400': activeTab === tab.status,
                'border-b-2 border-b-gray-200 dark:border-b-slate-600 text-gray-900 dark:text-gray-100': activeTab !== tab.status
              }
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className='space-y-4'>
        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='animate-pulse rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-md border border-gray-100 dark:from-slate-800 dark:to-slate-900 dark:border-slate-600'>
                <div className='flex items-center justify-between border-b pb-3 dark:border-slate-600'>
                  <div className='h-4 w-32 rounded bg-gray-200 dark:bg-slate-600' />
                  <div className='h-6 w-24 rounded-full bg-gray-200 dark:bg-slate-600' />
                </div>
                <div className='mt-4 flex gap-4'>
                  <div className='h-16 w-16 rounded bg-gray-200 dark:bg-slate-600' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-600' />
                    <div className='h-3 w-1/4 rounded bg-gray-200 dark:bg-slate-600' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-white via-orange-50/20 to-amber-50/20 py-16 shadow-md border border-orange-100/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 dark:border-slate-600'
          >
            <div className='text-6xl'>📦</div>
            <p className='mt-4 text-gray-500 dark:text-gray-400'>Chưa có đơn hàng nào</p>
          </motion.div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={handleCancelOrder}
                onReorder={handleReorder}
                isTrackable={isTrackableOrder(order.status)}
                isTrackingExpanded={expandedOrderIds.has(order._id)}
                onToggleTracking={toggleOrderTracking}
                trackingContent={
                  <LiveOrderTracker
                    orderId={order._id}
                    initialStatus={statusToNumber[order.status] || 1}
                    className='bg-gray-50 dark:bg-slate-900'
                  />
                }
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-gray-50 to-white p-4 shadow-md border border-gray-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 dark:border-slate-600'>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-orange hover:text-white hover:border-orange disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-gray-300 dark:disabled:hover:border-slate-600'
          >
            Trước
          </button>
          <span className='px-4 text-sm text-gray-600 dark:text-gray-400'>
            Trang {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-orange hover:text-white hover:border-orange disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-gray-300 dark:disabled:hover:border-slate-600'
          >
            Sau
          </button>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className='mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Hủy đơn hàng</h3>
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                Bạn có chắc chắn muốn hủy đơn hàng này? Đơn hàng sau khi hủy sẽ không thể khôi phục.
              </p>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder='Lý do hủy đơn (không bắt buộc)'
                className='mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-700 outline-none transition-colors focus:border-orange dark:border-slate-600 dark:bg-slate-700 dark:text-gray-200 dark:focus:border-orange-400'
                rows={3}
              />

              <div className='mt-5 flex justify-end gap-3'>
                <button
                  onClick={handleCloseModal}
                  className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
                >
                  Quay lại
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={cancelMutation.isPending}
                  className='rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {cancelMutation.isPending ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

