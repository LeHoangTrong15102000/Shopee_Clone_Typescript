import { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { AppContext } from 'src/contexts/app.context'
import { Address, ShippingMethod, PaymentMethodType, CreateOrderBody } from 'src/types/checkout.type'
import checkoutApi from 'src/apis/checkout.api'
import path from 'src/constant/path'
import AddressSelector from 'src/components/AddressSelector'
import ShippingMethodSelector from 'src/components/ShippingMethodSelector'
import PaymentMethodSelector from 'src/components/PaymentMethodSelector'
import OrderSummary from 'src/components/OrderSummary'
import OrderPreview from 'src/components/OrderPreview'
import Button from 'src/components/Button'
import { scrollToTop } from 'src/utils/utils'
import { useReducedMotion } from 'src/hooks/useReducedMotion'

const CHECKOUT_STEPS = [
  { id: 1, name: 'Địa chỉ', icon: 'location' },
  { id: 2, name: 'Vận chuyển', icon: 'truck' },
  { id: 3, name: 'Thanh toán', icon: 'payment' },
  { id: 4, name: 'Xác nhận', icon: 'check' }
]

const CheckoutProgressStepper = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className='mb-6 md:mb-8'>
      <div className='mx-auto flex max-w-2xl items-center justify-center'>
        {CHECKOUT_STEPS.map((step, index) => (
          <div key={step.id} className='flex flex-1 items-center'>
            <div className='flex flex-col items-center'>
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors md:h-10 md:w-10 ${
                  currentStep >= step.id
                    ? 'border-orange bg-orange text-white'
                    : 'border-gray-300 bg-white text-gray-400 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-300'
                }`}
              >
                {currentStep > step.id ? (
                  <svg className='h-4 w-4 md:h-5 md:w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                ) : (
                  <span className='text-xs font-semibold md:text-sm'>{step.id}</span>
                )}
              </motion.div>
              <span
                className={`mt-1 text-xs font-medium md:mt-2 md:text-sm ${
                  currentStep >= step.id ? 'text-orange' : 'text-gray-400 dark:text-gray-300'
                }`}
              >
                {step.name}
              </span>
            </div>
            {index < CHECKOUT_STEPS.length - 1 && (
              <div className='mx-1 h-0.5 flex-1 bg-gray-200 md:mx-2 dark:bg-slate-600'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  className='h-full bg-orange'
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const SectionHeader = ({ number, title }: { number: number; title: string }) => (
  <div className='mb-4 flex items-center gap-3'>
    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange text-sm font-bold text-white shadow-lg shadow-orange/30 dark:shadow-slate-900/50'>
      {number}
    </div>
    <h2 className='text-base font-semibold text-gray-800 md:text-lg dark:text-gray-100'>{title}</h2>
  </div>
)

const SecurityBadge = () => (
  <div className='mt-4 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 transition-all dark:border-slate-600 dark:bg-slate-700/50'>
    <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500'>
      <svg className='h-3 w-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
        />
      </svg>
    </div>
    <span className='text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-300'>
      Thanh toán an toàn & bảo mật
    </span>
  </div>
)

const PaymentIcons = () => (
  <div className='flex flex-wrap items-center justify-center gap-2 md:gap-3'>
    <div className='flex h-8 items-center rounded-lg bg-linear-to-r from-blue-50 to-blue-100 px-3 shadow-xs ring-1 ring-blue-200/50 transition-all hover:shadow-md hover:ring-blue-300 md:h-9 dark:from-blue-900/30 dark:to-blue-800/30 dark:shadow-slate-900/50 dark:ring-blue-700/50 dark:hover:ring-blue-600'>
      <span className='text-xs font-bold text-blue-600 dark:text-blue-300'>VISA</span>
    </div>
    <div className='flex h-8 items-center rounded-lg bg-linear-to-r from-red-50 to-orange-50 px-3 shadow-xs ring-1 ring-red-200/50 transition-all hover:shadow-md hover:ring-red-300 md:h-9 dark:from-red-900/30 dark:to-orange-900/30 dark:shadow-slate-900/50 dark:ring-red-700/50 dark:hover:ring-red-600'>
      <span className='text-xs font-bold text-red-500 dark:text-red-300'>Master</span>
    </div>
    <div className='flex h-8 items-center rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 px-3 shadow-xs ring-1 ring-blue-200/50 transition-all hover:shadow-md hover:ring-blue-300 md:h-9 dark:from-blue-900/30 dark:to-indigo-900/30 dark:shadow-slate-900/50 dark:ring-blue-700/50 dark:hover:ring-blue-600'>
      <span className='text-xs font-bold text-blue-800 dark:text-blue-200'>JCB</span>
    </div>
    <div className='flex h-8 items-center rounded-lg bg-linear-to-r from-pink-50 to-rose-100 px-3 shadow-xs ring-1 ring-pink-200/50 transition-all hover:shadow-md hover:ring-pink-300 md:h-9 dark:from-pink-900/30 dark:to-rose-900/30 dark:shadow-slate-900/50 dark:ring-pink-700/50 dark:hover:ring-pink-600'>
      <span className='text-xs font-bold text-pink-600 dark:text-pink-300'>MoMo</span>
    </div>
    <div className='flex h-8 items-center rounded-lg bg-linear-to-r from-blue-50 to-cyan-50 px-3 shadow-xs ring-1 ring-blue-200/50 transition-all hover:shadow-md hover:ring-blue-300 md:h-9 dark:from-blue-900/30 dark:to-cyan-900/30 dark:shadow-slate-900/50 dark:ring-blue-700/50 dark:hover:ring-blue-600'>
      <span className='text-xs font-bold text-blue-500 dark:text-blue-300'>ZaloPay</span>
    </div>
    <div className='flex h-8 items-center rounded-lg bg-linear-to-r from-blue-50 to-indigo-100 px-3 shadow-xs ring-1 ring-blue-200/50 transition-all hover:shadow-md hover:ring-blue-300 md:h-9 dark:from-blue-900/30 dark:to-indigo-900/30 dark:shadow-slate-900/50 dark:ring-blue-700/50 dark:hover:ring-blue-600'>
      <span className='text-xs font-bold text-blue-700 dark:text-blue-200'>VNPay</span>
    </div>
  </div>
)

const TrustIndicators = () => (
  <div className='mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 dark:border-slate-700'>
    <div className='flex flex-col items-center gap-1.5 rounded-lg bg-linear-to-b from-blue-50 to-white p-2 dark:from-blue-900/30 dark:to-slate-800'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-blue-500 to-cyan-500 shadow-xs shadow-blue-500/30 dark:shadow-slate-900/50'>
        <svg className='h-5 w-5 text-white' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
            clipRule='evenodd'
          />
        </svg>
      </div>
      <span className='text-center text-[10px] font-medium text-gray-600 md:text-xs dark:text-gray-300'>
        Chính hãng
      </span>
    </div>
    <div className='flex flex-col items-center gap-1.5 rounded-lg bg-linear-to-b from-green-50 to-white p-2 dark:from-green-900/30 dark:to-slate-800'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-green-500 to-emerald-500 shadow-xs shadow-green-500/30 dark:shadow-slate-900/50'>
        <svg className='h-5 w-5 text-white' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
          <path
            fillRule='evenodd'
            d='M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0v2.43l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z'
            clipRule='evenodd'
          />
        </svg>
      </div>
      <span className='text-center text-[10px] font-medium text-gray-600 md:text-xs dark:text-gray-300'>
        Đổi trả 7 ngày
      </span>
    </div>
    <div className='flex flex-col items-center gap-1.5 rounded-lg bg-linear-to-b from-orange-50 to-white p-2 dark:from-orange-900/30 dark:to-slate-800'>
      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-orange-500 to-amber-500 shadow-xs shadow-orange-500/30 dark:shadow-slate-900/50'>
        {/* Lightning bolt icon - Heroicons mini */}
        <svg className='h-5 w-5 text-white' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
          <path d='M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z' />
        </svg>
      </div>
      <span className='text-center text-[10px] font-medium text-gray-600 md:text-xs dark:text-gray-300'>
        Giao nhanh
      </span>
    </div>
  </div>
)

const CHECKOUT_SESSION_KEY = 'checkout_items'

const Checkout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { extendedPurchases, setExtendedPurchases } = useContext(AppContext)
  const prefersReducedMotion = useReducedMotion()

  // Restore checkout items từ sessionStorage khi F5
  useEffect(() => {
    const savedItems = sessionStorage.getItem(CHECKOUT_SESSION_KEY)
    if (savedItems && extendedPurchases.length === 0) {
      try {
        const parsedItems = JSON.parse(savedItems)
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setExtendedPurchases(parsedItems)
        }
      } catch {
        sessionStorage.removeItem(CHECKOUT_SESSION_KEY)
      }
    }
  }, [])

  const checkedItems = useMemo(() => extendedPurchases.filter((item) => item.isChecked), [extendedPurchases])

  // Save checkout items vào sessionStorage khi có thay đổi
  useEffect(() => {
    if (checkedItems.length > 0) {
      sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(extendedPurchases))
    }
  }, [checkedItems, extendedPurchases])

  // Chỉ redirect nếu không có items và không có saved session
  useEffect(() => {
    const savedItems = sessionStorage.getItem(CHECKOUT_SESSION_KEY)
    const hasSavedItems = savedItems && JSON.parse(savedItems).some((item: { isChecked: boolean }) => item.isChecked)

    if (checkedItems.length === 0 && !hasSavedItems) {
      toast.warning('Vui lòng chọn sản phẩm để thanh toán')
      navigate(path.cart)
    }
  }, [checkedItems.length, navigate])

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [coinsUsed, setCoinsUsed] = useState(0)
  const [note, setNote] = useState('')
  const [showReview, setShowReview] = useState(false)

  const createOrderMutation = useMutation({
    mutationFn: (body: CreateOrderBody) => checkoutApi.createOrder(body),
    onSuccess: () => {
      toast.success('Đặt hàng thành công!')
      sessionStorage.removeItem(CHECKOUT_SESSION_KEY) // Clear session khi đặt hàng thành công
      setExtendedPurchases((prev) => prev.filter((item) => !item.isChecked))
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      navigate(`/user/purchase?status=1`)
    },
    onError: () => {
      toast.error('Đặt hàng thất bại. Vui lòng thử lại!')
    }
  })

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address)
  }

  const handleShippingSelect = (method: ShippingMethod) => {
    setSelectedShippingMethod(method)
  }

  const handlePaymentSelect = (method: { type: PaymentMethodType }) => {
    setSelectedPaymentMethod(method.type)
  }

  const handleApplyVoucher = () => {
    if (voucherCode.trim()) {
      const code = voucherCode.toUpperCase()
      if (code === 'GIAM10') {
        setVoucherDiscount(10000)
        toast.success('Áp dụng voucher thành công! Giảm 10.000đ')
      } else if (code === 'GIAM50K') {
        setVoucherDiscount(50000)
        toast.success('Áp dụng voucher thành công! Giảm 50.000đ')
      } else if (code === 'DISCOUNT50') {
        setVoucherDiscount(50000)
        toast.success('Áp dụng voucher thành công! Giảm 50.000đ')
      } else if (code === 'FREESHIP') {
        setVoucherDiscount(30000)
        toast.success('Áp dụng voucher thành công! Miễn phí vận chuyển')
      } else if (code === 'NEWUSER') {
        setVoucherDiscount(100000)
        toast.success('Áp dụng voucher thành công! Giảm 100.000đ cho khách hàng mới')
      } else {
        toast.error('Mã voucher không hợp lệ. Thử: GIAM10, GIAM50K, DISCOUNT50, FREESHIP, NEWUSER')
      }
    }
  }

  const handleRemoveVoucher = () => {
    setVoucherCode('')
    setVoucherDiscount(0)
    toast.info('Đã xóa mã giảm giá')
  }

  const handleBackToStep3 = () => {
    // Go back from review to form
    setShowReview(false)
    scrollToTop(prefersReducedMotion)
  }

  const handleGoToReview = () => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng')
      return
    }
    if (!selectedShippingMethod) {
      toast.error('Vui lòng chọn phương thức vận chuyển')
      return
    }
    if (!selectedPaymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán')
      return
    }
    setShowReview(true)
    scrollToTop(prefersReducedMotion)
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng')
      return
    }
    if (!selectedShippingMethod) {
      toast.error('Vui lòng chọn phương thức vận chuyển')
      return
    }
    if (!selectedPaymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán')
      return
    }

    const orderBody: CreateOrderBody = {
      items: checkedItems.map((item) => ({
        productId: item.product._id,
        buyCount: item.buy_count
      })),
      shippingAddressId: selectedAddress._id,
      shippingMethodId: selectedShippingMethod._id,
      paymentMethod: selectedPaymentMethod,
      voucherCode: voucherCode || undefined,
      coinsUsed: coinsUsed || undefined,
      note: note || undefined
    }

    createOrderMutation.mutate(orderBody)
  }

  const isFormValid = selectedAddress && selectedShippingMethod && selectedPaymentMethod && checkedItems.length > 0

  const currentStep = useMemo(() => {
    if (!selectedAddress) return 1
    if (!selectedShippingMethod) return 2
    if (!selectedPaymentMethod) return 3
    return 4
  }, [selectedAddress, selectedShippingMethod, selectedPaymentMethod])

  const totalAmount = useMemo(() => {
    const itemsTotal = checkedItems.reduce((sum, item) => sum + item.product.price * item.buy_count, 0)
    const shippingFee = selectedShippingMethod?.price || 0
    return itemsTotal + shippingFee - voucherDiscount - coinsUsed
  }, [checkedItems, selectedShippingMethod, voucherDiscount, coinsUsed])

  if (checkedItems.length === 0) {
    return null
  }

  return (
    <div className='min-h-screen bg-linear-to-b from-neutral-100 via-orange-50/10 to-neutral-100 py-4 md:py-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900'>
      <div className='container'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-4 overflow-hidden rounded-lg bg-linear-to-r from-orange via-orange/90 to-orange-400 p-3 shadow-lg sm:rounded-xl sm:p-4 md:mb-6 md:p-6'
        >
          <div className='flex items-center gap-2.5 sm:gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs sm:h-11 sm:w-11 md:h-12 md:w-12'>
              <svg
                className='h-[18px] w-[18px] text-white sm:h-5 sm:w-5 md:h-6 md:w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
            <div className='min-w-0 flex-1'>
              <h1 className='truncate text-base leading-tight font-bold text-white sm:text-lg md:text-2xl'>
                Thanh toán
              </h1>
              <p className='mt-0.5 truncate text-[11px] leading-snug text-white/80 sm:text-xs md:text-sm'>
                Hoàn tất đơn hàng của bạn
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='mb-6 rounded-xl border border-orange-100/30 bg-linear-to-r from-white via-orange-50/20 to-white p-4 shadow-lg md:p-6 dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 dark:shadow-slate-900/50'
        >
          <CheckoutProgressStepper currentStep={currentStep} />
        </motion.div>

        {/* Show OrderPreview when user clicks "Đặt hàng ngay", otherwise show the form */}
        {showReview ? (
          <OrderPreview
            items={checkedItems}
            selectedAddress={selectedAddress}
            selectedShippingMethod={selectedShippingMethod}
            selectedPaymentMethod={selectedPaymentMethod}
            voucherCode={voucherCode}
            voucherDiscount={voucherDiscount}
            coinsUsed={coinsUsed}
            note={note}
            onPlaceOrder={handlePlaceOrder}
            onBack={handleBackToStep3}
            isPlacingOrder={createOrderMutation.isPending}
          />
        ) : (
          <div className='grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3'>
            <div className='space-y-4 md:space-y-6 lg:col-span-2'>
              {/* Address Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className='rounded-xl border border-gray-100/50 bg-linear-to-br from-white to-gray-50/50 p-4 shadow-md transition-shadow hover:shadow-lg md:p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 dark:shadow-slate-900/50'
              >
                <SectionHeader number={1} title='Địa chỉ giao hàng' />
                <AddressSelector selectedAddressId={selectedAddress?._id || null} onSelect={handleAddressSelect} />
              </motion.div>

              {/* Shipping Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='rounded-xl border border-gray-100/50 bg-linear-to-br from-white to-gray-50/50 p-4 shadow-md transition-shadow hover:shadow-lg md:p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 dark:shadow-slate-900/50'
              >
                <SectionHeader number={2} title='Phương thức vận chuyển' />
                <ShippingMethodSelector
                  selectedMethodId={selectedShippingMethod?._id || null}
                  onSelect={handleShippingSelect}
                />
              </motion.div>

              {/* Payment Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className='rounded-xl border border-gray-100/50 bg-linear-to-br from-white to-gray-50/50 p-4 shadow-md transition-shadow hover:shadow-lg md:p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 dark:shadow-slate-900/50'
              >
                <SectionHeader number={3} title='Phương thức thanh toán' />
                <PaymentMethodSelector selectedMethodType={selectedPaymentMethod} onSelect={handlePaymentSelect} />
                <SecurityBadge />
              </motion.div>

              {/* Voucher & Coins Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='rounded-xl border border-gray-100/50 bg-linear-to-br from-white to-gray-50/50 p-4 shadow-md transition-shadow hover:shadow-lg md:p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 dark:shadow-slate-900/50'
              >
                <SectionHeader number={4} title='Mã giảm giá & Shopee Xu' />

                <div className='mb-4'>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>Mã voucher</label>
                  <div className='flex flex-col gap-2 sm:flex-row'>
                    <input
                      type='text'
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder='Nhập mã voucher'
                      className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-orange focus:outline-hidden dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400'
                    />
                    <Button
                      onClick={handleApplyVoucher}
                      className='rounded-lg bg-orange px-4 py-2 text-white hover:bg-orange/90'
                    >
                      Áp dụng
                    </Button>
                  </div>
                  <AnimatePresence>
                    {voucherDiscount > 0 && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='mt-2 text-sm text-green-600 dark:text-green-400'
                      >
                        ✓ Đã áp dụng giảm ₫{voucherDiscount.toLocaleString()}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                    Sử dụng Shopee Xu
                  </label>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
                    <input
                      type='number'
                      value={coinsUsed}
                      onChange={(e) => setCoinsUsed(Math.max(0, parseInt(e.target.value) || 0))}
                      min={0}
                      max={10000}
                      className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-orange focus:outline-hidden sm:w-32 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100'
                    />
                    <span className='text-sm text-gray-500 dark:text-gray-400'>
                      Bạn có 10,000 xu (tối đa 10,000 xu)
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Note Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className='rounded-xl border border-gray-100/50 bg-linear-to-br from-white to-gray-50/50 p-4 shadow-md transition-shadow hover:shadow-lg md:p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 dark:shadow-slate-900/50'
              >
                <SectionHeader number={5} title='Ghi chú đơn hàng' />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder='Ghi chú cho người bán (không bắt buộc)'
                  rows={3}
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-orange focus:outline-hidden dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400'
                />
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className='lg:col-span-1'>
              <div className='sticky top-4 space-y-4'>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <OrderSummary
                    items={checkedItems}
                    shippingMethod={selectedShippingMethod}
                    voucherDiscount={voucherDiscount}
                    voucherCode={voucherCode}
                    onRemoveVoucher={handleRemoveVoucher}
                    coinsUsed={coinsUsed}
                  />
                </motion.div>

                {/* Enhanced Order Button Area */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className='rounded-xl border border-orange-100/30 bg-linear-to-br from-white via-orange-50/10 to-amber-50/10 p-4 shadow-lg md:p-6 dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 dark:shadow-slate-900/50'
                >
                  {/* Total Amount Display */}
                  <div className='mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-slate-700'>
                    <span className='text-base font-medium text-gray-700 md:text-lg dark:text-gray-200'>
                      Tổng thanh toán:
                    </span>
                    <span className='text-xl font-bold text-orange md:text-2xl'>
                      ₫{totalAmount.toLocaleString('vi-VN')}
                    </span>
                  </div>

                  {/* Secure Checkout Badge */}
                  <div className='mb-4 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 py-2 dark:border-green-800/40 dark:bg-green-900/20'>
                    <svg
                      className='h-4 w-4 text-green-600 dark:text-green-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                    <span className='text-xs font-medium text-green-700 md:text-sm dark:text-green-300'>
                      Thanh toán an toàn
                    </span>
                  </div>

                  <Button
                    onClick={handleGoToReview}
                    disabled={!isFormValid}
                    className='w-full rounded-xl bg-linear-to-r from-orange via-orange to-amber-500 py-3 text-base font-semibold text-white shadow-lg shadow-orange/30 transition-all hover:from-orange-600 hover:via-orange-500 hover:to-amber-400 hover:shadow-xl hover:shadow-orange/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none md:py-4 md:text-lg dark:shadow-slate-900/50'
                  >
                    Đặt hàng ngay
                  </Button>

                  <p className='mt-3 text-center text-[10px] text-gray-500 md:text-xs dark:text-gray-400'>
                    Nhấn "Đặt hàng ngay" để xem lại và xác nhận đơn hàng
                  </p>

                  {/* Payment Icons */}
                  <div className='mt-4 border-t border-gray-100 pt-4 dark:border-slate-700'>
                    <p className='mb-2 text-center text-[10px] text-gray-500 md:text-xs dark:text-gray-400'>
                      Chấp nhận thanh toán
                    </p>
                    <PaymentIcons />
                  </div>

                  {/* Trust Indicators */}
                  <TrustIndicators />
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout
