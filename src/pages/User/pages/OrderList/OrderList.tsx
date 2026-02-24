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
    mutationFn: (orderId: string) => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: () => {
      toast.error('Hủy đơn hàng thất bại')
    }
  })

  const orders = ordersData?.data.data.orders || []
  const pagination = ordersData?.data.data.pagination

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      cancelMutation.mutate(orderId)
    }
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
      <div className='sticky top-0 z-20 rounded-xl bg-gradient-to-r from-white via-orange-50/30 to-white shadow-md border border-orange-100/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 dark:border-slate-600'>
        <div className='flex overflow-x-auto scrollbar-hide border-b dark:border-slate-600'>
          {orderTabs.map((tab) => (
            <button
              key={tab.status}
              onClick={() => handleTabChange(tab.status)}
              className={classNames(
                'relative flex-1 whitespace-nowrap px-3 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm font-medium transition-colors outline-none focus:outline-none focus-visible:outline-none text-center',
                {
                  'text-orange dark:text-orange-400': activeTab === tab.status,
                  'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300': activeTab !== tab.status
                }
              )}
            >
              {tab.label}
              {activeTab === tab.status && (
                <motion.div
                  layoutId='activeOrderTab'
                  className='absolute bottom-0 left-0 right-0 h-0.5 bg-orange dark:bg-orange-400'
                />
              )}
            </button>
          ))}
        </div>
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
    </div>
  )
}

