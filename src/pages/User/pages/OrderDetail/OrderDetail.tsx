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
        <p className='text-gray-500 dark:text-gray-300'>Không tìm thấy đơn hàng</p>
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
        className='relative rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-800 dark:border dark:border-slate-700 overflow-hidden'
      >
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange via-rose-500 to-amber-500' />
        <div className='flex items-center justify-between'>
          <div>
            <motion.button
              onClick={() => navigate(-1)}
              className='mb-2 flex items-center gap-1.5 text-sm text-gray-500 transition-colors duration-200 hover:text-orange dark:text-gray-400 dark:hover:text-orange-400 cursor-pointer'
              whileHover={shouldReduceMotion ? {} : { x: -3 }}
              transition={{ duration: ANIMATION_DURATION.fast }}
              aria-label='Quay lại trang trước'
            >
              <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
              </svg>
              Quay lại
            </motion.button>
            <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>Chi tiết đơn hàng</h1>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-300'>
              Mã đơn hàng: <span className='font-medium'>{order._id.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          {/* Status badge with scale-in and pulse animation */}
          <motion.div
            variants={shouldReduceMotion ? reducedMotionVariants : statusBadgeVariants}
            animate={isActiveStatus && !shouldReduceMotion ? 'pulse' : 'visible'}
            {...(isActiveStatus && !shouldReduceMotion ? pulseVariants : {})}
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${status.bgColor} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-current/20 shadow-sm`}
          >
            <span className={`font-semibold ${status.color}`}>{status.label}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Order Tracking Timeline */}
      {tracking && (
        <motion.div
          variants={sectionItemVariants}
          className='rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-800 dark:border dark:border-slate-700 overflow-hidden'
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
        className='relative rounded-xl bg-gradient-to-br from-white via-orange-50/5 to-white dark:from-slate-800 dark:via-orange-950/10 dark:to-amber-950/5 p-5 shadow-sm transition-all duration-200 border border-gray-100 dark:border-slate-700 overflow-hidden'
      >
        <div className='absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange via-rose-500 to-amber-500 rounded-r' />
        <h2 className='mb-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3'>
          <span className='inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-orange to-rose-500 shadow-md shadow-orange-200/40 dark:shadow-orange-800/30'>
            <svg className='w-3.5 h-3.5 text-white' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
            </svg>
          </span>
          Địa chỉ nhận hàng
        </h2>
        <div className='ml-12 space-y-1.5 text-sm'>
          <p className='font-semibold text-gray-900 dark:text-gray-100 text-base'>{order.shippingAddress.fullName}</p>
          <p className='text-gray-600 dark:text-gray-300 flex items-center gap-1.5'>
            <svg className='w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z' />
            </svg>
            {order.shippingAddress.phone}
          </p>
          <p className='text-gray-600 dark:text-gray-300 flex items-start gap-1.5'>
            <svg className='w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z' />
              <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' />
            </svg>
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
          className='rounded-xl bg-white p-5 shadow-sm transition-all duration-200 dark:bg-slate-800 dark:border dark:border-slate-700'
        >
          <h2 className='mb-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2.5'>
            <span className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-200/40 dark:shadow-violet-800/30'>
              <svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' />
              </svg>
            </span>
            Thanh toán
          </h2>
          <p className='ml-10.5 text-sm text-gray-600 dark:text-gray-300'>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</p>
        </motion.div>
        <motion.div
          whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
          transition={{ duration: ANIMATION_DURATION.fast }}
          className='rounded-xl bg-white p-5 shadow-sm transition-all duration-200 dark:bg-slate-800 dark:border dark:border-slate-700'
        >
          <h2 className='mb-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2.5'>
            <span className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shadow-sky-200/40 dark:shadow-sky-800/30'>
              <svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.375m0 0V11.25m0 3H12M5.625 11.25H3.375m2.25 0V8.625c0-.621.504-1.125 1.125-1.125h5.25M12 11.25V8.625' />
              </svg>
            </span>
            Vận chuyển
          </h2>
          <div className='ml-10.5'>
            <p className='text-sm text-gray-600 dark:text-gray-300'>{order.shippingMethod.name}</p>
            <p className='text-xs text-gray-400 dark:text-slate-400 mt-1'>{order.shippingMethod.estimatedDays}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        variants={sectionItemVariants}
        whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
        transition={{ duration: ANIMATION_DURATION.fast }}
        className='relative rounded-xl bg-white p-5 shadow-sm transition-all duration-200 dark:bg-slate-800 dark:border dark:border-slate-700 overflow-hidden'
      >
        <div className='absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500' />
        <h2 className='mb-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2.5'>
          <span className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200/40 dark:shadow-emerald-800/30'>
            <svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' />
            </svg>
          </span>
          Tổng cộng
        </h2>
        <div className='space-y-3 text-sm'>
          <div className='flex justify-between items-center'>
            <span className='text-gray-500 dark:text-gray-300'>Tạm tính</span>
            <span className='text-gray-700 dark:text-gray-200'>₫{formatCurrency(order.subtotal)}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-gray-500 dark:text-gray-300'>Phí vận chuyển</span>
            <span className='text-gray-700 dark:text-gray-200'>₫{formatCurrency(order.shippingFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className='flex justify-between items-center text-green-600 dark:text-green-400'>
              <span className='flex items-center gap-1'>
                <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z' />
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 6h.008v.008H6V6z' />
                </svg>
                Giảm giá voucher
              </span>
              <span className='font-medium'>-₫{formatCurrency(order.discount)}</span>
            </div>
          )}
          {order.coinsDiscount > 0 && (
            <div className='flex justify-between items-center text-amber-600 dark:text-amber-400'>
              <span className='flex items-center gap-1'>
                <svg className='w-3.5 h-3.5' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.798 7.45c.512-.67 1.135-.95 1.702-.95s1.19.28 1.702.95a.75.75 0 001.192-.91C12.637 5.55 11.5 5 10.5 5s-2.137.55-2.894 1.54A5.205 5.205 0 006.83 8H5.75a.75.75 0 000 1.5h.77a6.333 6.333 0 000 1h-.77a.75.75 0 000 1.5h1.08c.183.528.442 1.023.776 1.46.757.99 1.894 1.54 2.894 1.54s2.137-.55 2.894-1.54a.75.75 0 00-1.192-.91c-.512.67-1.135.95-1.702.95s-1.19-.28-1.702-.95a3.505 3.505 0 01-.343-.55h1.795a.75.75 0 000-1.5H8.026a4.835 4.835 0 010-1h2.224a.75.75 0 000-1.5H8.455c.098-.195.212-.38.343-.55z' />
                </svg>
                Giảm giá xu ({order.coinsUsed} xu)
              </span>
              <span className='font-medium'>-₫{formatCurrency(order.coinsDiscount)}</span>
            </div>
          )}
          <div className='border-t-2 border-dashed border-gray-200 pt-3 dark:border-slate-600'>
            <div className='flex justify-between items-center'>
              <span className='font-semibold text-gray-900 dark:text-gray-100 text-base'>Tổng tiền</span>
              <span className='text-2xl font-bold bg-gradient-to-r from-orange to-rose-500 bg-clip-text text-transparent'>₫{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Order Info */}
      <motion.div
        variants={sectionItemVariants}
        whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
        transition={{ duration: ANIMATION_DURATION.fast }}
        className='rounded-xl bg-white p-5 shadow-sm transition-all duration-200 dark:bg-slate-800 dark:border dark:border-slate-700'
      >
        <h2 className='mb-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2.5'>
          <span className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200/40 dark:shadow-indigo-800/30'>
            <svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z' />
            </svg>
          </span>
          Thông tin đơn hàng
        </h2>
        <div className='grid gap-4 text-sm md:grid-cols-2'>
          <div className='flex items-center gap-2'>
            <svg className='w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' />
            </svg>
            <div>
              <span className='text-gray-500 dark:text-gray-300'>Ngày đặt hàng:</span>
              <span className='ml-2 font-medium text-gray-900 dark:text-gray-100'>{formatDate(order.createdAt)}</span>
            </div>
          </div>
          {order.note && (
            <div className='flex items-start gap-2'>
              <svg className='w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' />
              </svg>
              <div>
                <span className='text-gray-500 dark:text-gray-300'>Ghi chú:</span>
                <span className='ml-2 text-gray-900 dark:text-gray-100'>{order.note}</span>
              </div>
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
              aria-label='Hủy đơn hàng'
              className='rounded-xl border-2 border-red-400/80 bg-white px-6 py-2.5 text-red-500 font-medium transition-all duration-200 hover:bg-red-50 hover:border-red-500 hover:shadow-md hover:shadow-red-100/50 dark:bg-slate-800 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:border-red-400 dark:hover:shadow-red-900/20 cursor-pointer'
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
      className='relative rounded-xl bg-white p-5 shadow-sm transition-all duration-200 dark:bg-slate-800 dark:border dark:border-slate-700 overflow-hidden'
    >
      <div className='absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange via-amber-500 to-yellow-400' />
      <h2 className='mb-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2.5'>
        <span className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange to-amber-600 shadow-md shadow-orange-200/40 dark:shadow-orange-800/30'>
          <svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' />
          </svg>
        </span>
        Sản phẩm
        <span className='ml-auto text-xs font-normal text-gray-400 dark:text-gray-500'>{order.items.length} sản phẩm</span>
      </h2>
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='space-y-3'
      >
        {order.items.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={shouldReduceMotion ? {} : {
              scale: 1.01,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}
            transition={{ duration: ANIMATION_DURATION.fast }}
            className='flex gap-4 rounded-xl bg-gray-50/50 dark:bg-slate-700/30 p-3 transition-all duration-200 border border-gray-100 dark:border-slate-600/50 hover:border-orange/20 dark:hover:border-orange-500/20'
          >
            <div className='h-18 w-18 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm'>
              <ImageWithFallback
                src={item.product?.image || ''}
                alt={item.product?.name || 'Product'}
                className='h-full w-full object-cover'
              />
            </div>
            <div className='flex-1 min-w-0'>
              <Link
                to={`/${item.product?.name?.replace(/\s+/g, '-')}-i-${item.product?._id}`}
                className='font-medium text-gray-900 transition-colors duration-200 hover:text-orange dark:text-gray-100 dark:hover:text-orange-400 line-clamp-2'
              >
                {item.product?.name || 'Sản phẩm'}
              </Link>
              <p className='mt-1.5 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1'>
                <svg className='w-3.5 h-3.5 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25' />
                </svg>
                x{item.buyCount}
              </p>
              <div className='mt-2 flex items-center gap-2'>
                {item.priceBeforeDiscount > item.price && (
                  <span className='text-xs text-gray-400 line-through dark:text-gray-500'>
                    ₫{formatCurrency(item.priceBeforeDiscount)}
                  </span>
                )}
                <span className='font-semibold text-orange dark:text-orange-400'>₫{formatCurrency(item.price)}</span>
              </div>
            </div>
            <div className='text-right flex flex-col justify-center'>
              <span className='text-xs text-gray-400 dark:text-gray-500'>Thành tiền</span>
              <span className='font-bold text-orange dark:text-orange-400 text-base'>₫{formatCurrency(item.price * item.buyCount)}</span>
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
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
      onClick={onClose}
    >
      <motion.div
        variants={shouldReduceMotion ? reducedMotionVariants : modalContentVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
        onClick={(e) => e.stopPropagation()}
        className='relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 dark:border dark:border-slate-700 overflow-hidden'
      >
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-rose-500 to-pink-500' />
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer'
          aria-label='Đóng modal'
        >
          <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
        {/* Warning icon */}
        <div className='flex items-center gap-3 mb-4'>
          <span className='inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-200/50 dark:shadow-red-900/30'>
            <svg className='w-5 h-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' />
            </svg>
          </span>
          <div>
            <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>Hủy đơn hàng</h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>Bạn có chắc chắn muốn hủy đơn hàng này? Đơn hàng sau khi hủy sẽ không thể khôi phục.</p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder='Lý do hủy đơn (không bắt buộc)'
          className='w-full rounded-xl border border-gray-200 p-3 text-sm transition-all duration-200 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-orange-400 resize-none'
          rows={3}
        />
        <div className='mt-5 flex justify-end gap-3'>
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            transition={{ duration: ANIMATION_DURATION.fast }}
          >
            <Button
              onClick={onClose}
              className='rounded-xl border border-gray-200 px-5 py-2.5 text-gray-700 font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:border-slate-500 cursor-pointer'
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
              className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 text-white font-medium transition-all duration-200 hover:from-red-600 hover:to-rose-700 hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
              {isPending ? (
                <>
                  <svg className='w-4 h-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  Xác nhận hủy
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

