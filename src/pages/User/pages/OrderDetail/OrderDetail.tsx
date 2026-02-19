import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'react-toastify'
import orderApi from 'src/apis/order.api'
import orderTrackingApi from 'src/apis/orderTracking.api'
import { Order } from 'src/types/checkout.type'
import { ORDER_STATUS_CONFIG, OrderStatus } from 'src/config/orderStatus'
import { formatCurrency } from 'src/utils/utils'
import ImageWithFallback from 'src/components/ImageWithFallback'
import Button from 'src/components/Button'
import OrderTrackingTimeline from 'src/components/OrderTrackingTimeline'
import useOrderTracking from 'src/hooks/useOrderTracking'
import OrderStatusTracker from 'src/components/OrderStatusTracker'
import { ANIMATION_DURATION, STAGGER_DELAY } from 'src/styles/animations/motion.config'

// Page-level stagger container
const pageContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: STAGGER_DELAY.slow, delayChildren: 0.1 }
  }
}

// Section stagger item with fadeInUp
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: ANIMATION_DURATION.normal, ease: [0.25, 0.46, 0.45, 0.94] } }
}

// Order items container with faster stagger
const itemsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: STAGGER_DELAY.normal, delayChildren: 0.05 }
  }
}

// Individual order item
const orderItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: ANIMATION_DURATION.normal, ease: [0.25, 0.46, 0.45, 0.94] } }
}

// Status badge animation with scale-in and pulse for active
const statusBadgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: ANIMATION_DURATION.normal, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

// Pulse animation for active status
const pulseVariants = {
  pulse: {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
}

// Modal variants with improved entrance
const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: ANIMATION_DURATION.fast } },
  exit: { opacity: 0, transition: { duration: ANIMATION_DURATION.fast } }
}

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: ANIMATION_DURATION.normal, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: ANIMATION_DURATION.fast }
  }
}

// Reduced motion variants
const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } }
}

function getStatusDisplay(status: OrderStatus) {
  const config = ORDER_STATUS_CONFIG[status]
  if (!config) {
    return {
      label: status,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      icon: status
    }
  }
  return {
    label: config.label,
    color: config.color.light,
    bgColor: config.bgColor.light,
    icon: config.icon
  }
}

const StatusIcon = ({ type, className }: { type: string; className?: string }) => {
  const defaultClass = className || 'h-4 w-4'
  switch (type) {
    case 'pending':
      return <svg className={defaultClass} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
    case 'confirmed':
      return <svg className={defaultClass} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
    case 'shipping':
      return <svg className={defaultClass} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.375m0 0V11.25m0 3H12M5.625 11.25H3.375m2.25 0V8.625c0-.621.504-1.125 1.125-1.125h5.25M12 11.25V8.625' /></svg>
    case 'delivered':
      return <svg className={defaultClass} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
    case 'cancelled':
      return <svg className={defaultClass} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
    case 'returned':
      return <svg className={defaultClass} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}><path strokeLinecap='round' strokeLinejoin='round' d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3' /></svg>
    default:
      return null
  }
}

const paymentMethodLabels: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  e_wallet: 'Ví điện tử',
  credit_card: 'Thẻ tín dụng/Ghi nợ'
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const shouldReduceMotion = useReducedMotion()

  // WebSocket: Real-time order status tracking
  const { currentStatus, lastUpdate, isSubscribed } = useOrderTracking(orderId)

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId as string),
    enabled: !!orderId
  })

  const { data: trackingData } = useQuery({
    queryKey: ['orderTracking', orderId],
    queryFn: () => orderTrackingApi.getTracking({ order_id: orderId }),
    enabled: !!orderId
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => orderApi.cancelOrder(id, reason),
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setShowCancelModal(false)
    },
    onError: () => {
      toast.error('Hủy đơn hàng thất bại')
    }
  })

  const order = orderData?.data.data
  const tracking = trackingData?.data.data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCancelOrder = () => {
    if (orderId) {
      cancelMutation.mutate({ id: orderId, reason: cancelReason })
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-orange border-t-transparent' />
      </div>
    )
  }

  if (!order) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center'>
        <p className='text-gray-500 dark:text-gray-400'>Không tìm thấy đơn hàng</p>
        <Link to='/user/purchase' className='mt-4 text-orange hover:underline dark:text-orange-400'>
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    )
  }

  const status = getStatusDisplay(order.status as OrderStatus)
  const canCancel = ['pending', 'confirmed'].includes(order.status)
  const isActiveStatus = ['pending', 'confirmed', 'shipping'].includes(order.status)

  // Select variants based on reduced motion preference
  const containerVariants = shouldReduceMotion ? reducedMotionVariants : pageContainerVariants
  const sectionItemVariants = shouldReduceMotion ? reducedMotionVariants : sectionVariants

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='space-y-4'
    >
      {/* Header */}
      <motion.div
        variants={sectionItemVariants}
        className='rounded-lg bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-800'
      >
        <div className='flex items-center justify-between'>
          <div>
            <motion.button
              onClick={() => navigate(-1)}
              className='mb-2 flex items-center text-sm text-gray-500 transition-colors duration-200 hover:text-orange dark:text-gray-400 dark:hover:text-orange-400'
              whileHover={shouldReduceMotion ? {} : { x: -3 }}
              transition={{ duration: ANIMATION_DURATION.fast }}
            >
              ← Quay lại
            </motion.button>
            <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>Chi tiết đơn hàng</h1>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Mã đơn hàng: <span className='font-medium'>{order._id.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          {/* Status badge with scale-in and pulse animation */}
          <motion.div
            variants={shouldReduceMotion ? reducedMotionVariants : statusBadgeVariants}
            animate={isActiveStatus && !shouldReduceMotion ? 'pulse' : 'visible'}
            {...(isActiveStatus && !shouldReduceMotion ? pulseVariants : {})}
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${status.bgColor}`}
          >
            <StatusIcon type={status.icon} />
            <span className={`font-medium ${status.color}`}>{status.label}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Order Tracking Timeline */}
      {tracking && (
        <motion.div
          variants={sectionItemVariants}
          className='rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-800'
        >
          <OrderTrackingTimeline tracking={tracking} />
        </motion.div>
      )}

      {/* Real-time Order Status Tracker (WebSocket) */}
      <motion.div variants={sectionItemVariants}>
        <OrderStatusTracker
          currentStatus={currentStatus || order.status}
          lastUpdate={lastUpdate}
          isSubscribed={isSubscribed}
          className='mt-4'
        />
      </motion.div>

      {/* Shipping Address */}
      <motion.div
        variants={sectionItemVariants}
        whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
        transition={{ duration: ANIMATION_DURATION.fast }}
        className='rounded-lg bg-white p-4 shadow-sm transition-all duration-200 dark:bg-slate-800'
      >
        <h2 className='mb-3 font-semibold text-gray-900 dark:text-gray-100'>Địa chỉ nhận hàng</h2>
        <div className='text-sm'>
          <p className='font-medium text-gray-900 dark:text-gray-100'>{order.shippingAddress.fullName}</p>
          <p className='text-gray-600 dark:text-gray-400'>{order.shippingAddress.phone}</p>
          <p className='text-gray-600 dark:text-gray-400'>
            {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district},{' '}
            {order.shippingAddress.province}
          </p>
        </div>
      </motion.div>

      {/* Order Items */}
      <OrderItems order={order} shouldReduceMotion={shouldReduceMotion} />

      {/* Payment & Shipping Info */}
      <motion.div variants={sectionItemVariants} className='grid gap-4 md:grid-cols-2'>
        <motion.div
          whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
          transition={{ duration: ANIMATION_DURATION.fast }}
          className='rounded-lg bg-white p-4 shadow-sm transition-all duration-200 dark:bg-slate-800'
        >
          <h2 className='mb-3 font-semibold text-gray-900 dark:text-gray-100'>Phương thức thanh toán</h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</p>
        </motion.div>
        <motion.div
          whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
          transition={{ duration: ANIMATION_DURATION.fast }}
          className='rounded-lg bg-white p-4 shadow-sm transition-all duration-200 dark:bg-slate-800'
        >
          <h2 className='mb-3 font-semibold text-gray-900 dark:text-gray-100'>Phương thức vận chuyển</h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>{order.shippingMethod.name}</p>
          <p className='text-xs text-gray-400'>{order.shippingMethod.estimatedDays}</p>
        </motion.div>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        variants={sectionItemVariants}
        whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
        transition={{ duration: ANIMATION_DURATION.fast }}
        className='rounded-lg bg-white p-4 shadow-sm transition-all duration-200 dark:bg-slate-800'
      >
        <h2 className='mb-4 font-semibold text-gray-900 dark:text-gray-100'>Tổng cộng</h2>
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-gray-500 dark:text-gray-400'>Tạm tính</span>
            <span className='dark:text-gray-200'>₫{formatCurrency(order.subtotal)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500 dark:text-gray-400'>Phí vận chuyển</span>
            <span className='dark:text-gray-200'>₫{formatCurrency(order.shippingFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className='flex justify-between text-green-600'>
              <span>Giảm giá voucher</span>
              <span>-₫{formatCurrency(order.discount)}</span>
            </div>
          )}
          {order.coinsDiscount > 0 && (
            <div className='flex justify-between text-yellow-600'>
              <span>Giảm giá xu ({order.coinsUsed} xu)</span>
              <span>-₫{formatCurrency(order.coinsDiscount)}</span>
            </div>
          )}
          <div className='border-t border-gray-200 pt-2 dark:border-slate-600'>
            <div className='flex justify-between'>
              <span className='font-semibold text-gray-900 dark:text-gray-100'>Tổng tiền</span>
              <span className='text-xl font-bold text-orange dark:text-orange-400'>₫{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Order Info */}
      <motion.div
        variants={sectionItemVariants}
        whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
        transition={{ duration: ANIMATION_DURATION.fast }}
        className='rounded-lg bg-white p-4 shadow-sm transition-all duration-200 dark:bg-slate-800'
      >
        <div className='grid gap-4 text-sm md:grid-cols-2'>
          <div>
            <span className='text-gray-500 dark:text-gray-400'>Ngày đặt hàng:</span>
            <span className='ml-2 text-gray-900 dark:text-gray-100'>{formatDate(order.createdAt)}</span>
          </div>
          {order.note && (
            <div>
              <span className='text-gray-500 dark:text-gray-400'>Ghi chú:</span>
              <span className='ml-2 text-gray-900 dark:text-gray-100'>{order.note}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      {canCancel && (
        <motion.div
          variants={sectionItemVariants}
          className='flex flex-col sm:flex-row justify-end gap-3'
        >
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            transition={{ duration: ANIMATION_DURATION.fast }}
          >
            <Button
              onClick={() => setShowCancelModal(true)}
              className='rounded-lg border border-red-500 bg-white px-6 py-2 text-red-500 transition-all duration-200 hover:bg-red-50'
            >
              Hủy đơn hàng
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <CancelOrderModal
            cancelReason={cancelReason}
            setCancelReason={setCancelReason}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleCancelOrder}
            isPending={cancelMutation.isPending}
            shouldReduceMotion={shouldReduceMotion}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function OrderItems({ order, shouldReduceMotion }: { order: Order; shouldReduceMotion: boolean | null }) {
  const containerVariants = shouldReduceMotion ? reducedMotionVariants : itemsContainerVariants
  const itemVariants = shouldReduceMotion ? reducedMotionVariants : orderItemVariants

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedMotionVariants : sectionVariants}
      whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
      transition={{ duration: ANIMATION_DURATION.fast }}
      className='rounded-lg bg-white p-4 shadow-sm transition-all duration-200 dark:bg-slate-800'
    >
      <h2 className='mb-4 font-semibold text-gray-900 dark:text-gray-100'>Sản phẩm</h2>
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='space-y-4'
      >
        {order.items.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={shouldReduceMotion ? {} : {
              scale: 1.01,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              backgroundColor: 'rgba(249, 250, 251, 1)'
            }}
            transition={{ duration: ANIMATION_DURATION.fast }}
            className='flex gap-4 rounded-lg border-b border-gray-100 p-2 pb-4 transition-all duration-200 last:border-0 last:pb-0 cursor-pointer dark:border-slate-600'
          >
            <div className='h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg border dark:border-slate-600'>
              <ImageWithFallback
                src={item.product?.image || ''}
                alt={item.product?.name || 'Product'}
                className='h-full w-full object-cover'
              />
            </div>
            <div className='flex-1'>
              <Link
                to={`/${item.product?.name?.replace(/\s+/g, '-')}-i-${item.product?._id}`}
                className='font-medium text-gray-900 transition-colors duration-200 hover:text-orange dark:text-gray-100 dark:hover:text-orange-400'
              >
                {item.product?.name || 'Sản phẩm'}
              </Link>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Số lượng: {item.buyCount}</p>
              <div className='mt-2 flex items-center gap-2'>
                {item.priceBeforeDiscount > item.price && (
                  <span className='text-sm text-gray-400 line-through'>
                    ₫{formatCurrency(item.priceBeforeDiscount)}
                  </span>
                )}
                <span className='font-medium text-orange dark:text-orange-400'>₫{formatCurrency(item.price)}</span>
              </div>
            </div>
            <div className='text-right'>
              <span className='font-medium text-orange dark:text-orange-400'>₫{formatCurrency(item.price * item.buyCount)}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

interface CancelOrderModalProps {
  cancelReason: string
  setCancelReason: (reason: string) => void
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
  shouldReduceMotion: boolean | null
}

function CancelOrderModal({ cancelReason, setCancelReason, onClose, onConfirm, isPending, shouldReduceMotion }: CancelOrderModalProps) {
  return (
    <motion.div
      variants={shouldReduceMotion ? reducedMotionVariants : modalBackdropVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={onClose}
    >
      <motion.div
        variants={shouldReduceMotion ? reducedMotionVariants : modalContentVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
        onClick={(e) => e.stopPropagation()}
        className='mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-slate-800'
      >
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Hủy đơn hàng</h3>
        <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder='Lý do hủy đơn (không bắt buộc)'
          className='mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm transition-all duration-200 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-orange-400'
          rows={3}
        />
        <div className='mt-4 flex justify-end gap-3'>
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            transition={{ duration: ANIMATION_DURATION.fast }}
          >
            <Button
              onClick={onClose}
              className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
            >
              Đóng
            </Button>
          </motion.div>
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            transition={{ duration: ANIMATION_DURATION.fast }}
          >
            <Button
              onClick={onConfirm}
              disabled={isPending}
              className='rounded-lg bg-red-500 px-4 py-2 text-white transition-all duration-200 hover:bg-red-600 disabled:opacity-50'
            >
              {isPending ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

