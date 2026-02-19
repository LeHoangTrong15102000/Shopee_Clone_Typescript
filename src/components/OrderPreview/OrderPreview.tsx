import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from 'src/utils/utils'
import { getEstimatedDeliveryDate } from 'src/utils/date'
import { ExtendedPurchase } from 'src/types/purchases.type'
import { Address, ShippingMethod, PaymentMethodType } from 'src/types/checkout.type'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { staggerContainer, staggerItem, STAGGER_DELAY } from 'src/styles/animations'
import ImageWithFallback from 'src/components/ImageWithFallback'
import Button from 'src/components/Button'

interface OrderPreviewProps {
  items: ExtendedPurchase[]
  selectedAddress: Address | null
  selectedShippingMethod: ShippingMethod | null
  selectedPaymentMethod: PaymentMethodType | null
  voucherCode?: string
  voucherDiscount?: number
  coinsUsed?: number
  note?: string
  onPlaceOrder: () => void
  onBack: () => void
  isPlacingOrder: boolean
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  e_wallet: 'Ví điện tử (MoMo, ZaloPay, VNPay)',
  credit_card: 'Thẻ tín dụng/Ghi nợ'
}

const PAYMENT_METHOD_ICONS: Record<PaymentMethodType, string> = {
  cod: '💵',
  bank_transfer: '🏦',
  e_wallet: '📱',
  credit_card: '💳'
}

// Shipping icon component to render proper SVG icons instead of text
const ShippingIcon = ({ type, className }: { type: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    truck: (
      <svg className={className} viewBox='0 0 24 24' fill='none'>
        <path stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' />
      </svg>
    ),
    rocket: (
      <svg className={className} viewBox='0 0 24 24' fill='none'>
        <path stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' d='M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
      </svg>
    ),
    lightning: (
      <svg className={className} viewBox='0 0 24 24' fill='none'>
        <path stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' />
      </svg>
    ),
    express: (
      <svg className={className} viewBox='0 0 24 24' fill='none'>
        <path stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' />
      </svg>
    ),
    fast: (
      <svg className={className} viewBox='0 0 24 24' fill='none'>
        <path stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' d='M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
      </svg>
    )
  }
  return <>{icons[type] || icons.truck}</>
}

const SectionWrapper = memo(function SectionWrapper({
  title,
  children,
  reducedMotion,
  gradient
}: {
  title: string
  children: React.ReactNode
  reducedMotion: boolean
  gradient?: string
}) {
  return (
    <motion.div
      variants={reducedMotion ? undefined : staggerItem}
      className={`rounded-xl border border-gray-100/50 dark:border-slate-700 p-4 shadow-md md:p-6 ${gradient || 'bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/50'}`}
    >
      <h3 className='mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100'>{title}</h3>
      {children}
    </motion.div>
  )
})

const OrderPreview = memo(function OrderPreview({
  items,
  selectedAddress,
  selectedShippingMethod,
  selectedPaymentMethod,
  voucherCode,
  voucherDiscount = 0,
  coinsUsed = 0,
  note,
  onPlaceOrder,
  onBack,
  isPlacingOrder
}: OrderPreviewProps) {
  const reducedMotion = useReducedMotion()
  const containerVariants = staggerContainer(STAGGER_DELAY.normal)

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.buy_count, 0)
  }, [items])

  const shippingFee = selectedShippingMethod?.price || 0
  const coinsDiscount = coinsUsed
  const totalDiscount = voucherDiscount + coinsDiscount
  const total = subtotal + shippingFee - totalDiscount

  const estimatedDeliveryDate = useMemo(() => {
    if (!selectedShippingMethod) return null
    return getEstimatedDeliveryDate(selectedShippingMethod.estimatedDays)
  }, [selectedShippingMethod])

  const totalItemCount = useMemo(() => {
    return items.reduce((count, item) => count + item.buy_count, 0)
  }, [items])

  return (
    <motion.div
      variants={reducedMotion ? undefined : containerVariants}
      initial={reducedMotion ? undefined : 'hidden'}
      animate={reducedMotion ? undefined : 'visible'}
      className='space-y-4'
    >
      {/* Section 1: Địa chỉ giao hàng */}
      <SectionWrapper title='Địa chỉ giao hàng' reducedMotion={reducedMotion} gradient='bg-gradient-to-br from-white via-orange-50/20 to-amber-50/10 dark:from-slate-800 dark:via-orange-900/10 dark:to-amber-900/5'>
        {selectedAddress ? (
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange to-amber-500 shadow-md shadow-orange/30'>
              <svg className='h-5 w-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-gray-900 dark:text-gray-100'>{selectedAddress.fullName}</span>
                <span className='text-gray-400 dark:text-gray-500'>|</span>
                <span className='text-gray-600 dark:text-gray-300'>{selectedAddress.phone}</span>
                {selectedAddress.isDefault && (
                  <span className='rounded-full bg-gradient-to-r from-orange to-amber-500 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm'>Mặc định</span>
                )}
              </div>
              <p className='mt-1 text-sm text-gray-600 dark:text-gray-300'>
                {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
              </p>
            </div>
          </div>
        ) : (
          <p className='text-gray-500 dark:text-gray-400'>Chưa chọn địa chỉ giao hàng</p>
        )}
      </SectionWrapper>

      {/* Section 2: Sản phẩm */}
      <SectionWrapper title={`Sản phẩm (${totalItemCount})`} reducedMotion={reducedMotion} gradient='bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/50'>
        <div className='space-y-3'>
          {items.map((item) => (
            <div key={item._id} className='flex gap-3 rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 p-3 border border-gray-100 dark:border-slate-700'>
              <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm'>
                <ImageWithFallback
                  src={item.product.image}
                  alt={item.product.name}
                  className='h-full w-full object-cover'
                />
                <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange to-amber-500 text-xs font-medium text-white shadow-sm'>
                  {item.buy_count}
                </span>
              </div>
              <div className='min-w-0 flex-1'>
                <p className='line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100'>{item.product.name}</p>
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>Số lượng: {item.buy_count}</p>
              </div>
              <div className='text-right'>
                <p className='text-sm font-bold text-orange'>₫{formatCurrency(item.price * item.buy_count)}</p>
                {item.price_before_discount > item.price && (
                  <p className='text-xs text-gray-400 dark:text-gray-500 line-through'>
                    ₫{formatCurrency(item.price_before_discount * item.buy_count)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Section 3: Phương thức vận chuyển */}
      <SectionWrapper title='Phương thức vận chuyển' reducedMotion={reducedMotion} gradient='bg-gradient-to-br from-white via-green-50/20 to-emerald-50/10 dark:from-slate-800 dark:via-green-900/10 dark:to-emerald-900/5'>
        {selectedShippingMethod ? (
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-md shadow-green-500/30'>
              <ShippingIcon type={selectedShippingMethod.icon} className='h-5 w-5 text-white' />
            </div>
            <div className='flex-1'>
              <p className='font-semibold text-gray-900 dark:text-gray-100'>{selectedShippingMethod.name}</p>
              <p className='mt-0.5 text-sm text-gray-600 dark:text-gray-300'>{selectedShippingMethod.description}</p>
              {estimatedDeliveryDate && (
                <p className='mt-1 inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-1 text-sm font-medium text-green-700 dark:text-green-400'>
                  📦 Dự kiến giao: <span className='font-semibold'>{estimatedDeliveryDate}</span>
                </p>
              )}
            </div>
            <div className='text-right'>
              <p className='font-bold text-green-600'>₫{formatCurrency(shippingFee)}</p>
            </div>
          </div>
        ) : (
          <p className='text-gray-500 dark:text-gray-400'>Chưa chọn phương thức vận chuyển</p>
        )}
      </SectionWrapper>

      {/* Section 4: Phương thức thanh toán */}
      <SectionWrapper title='Phương thức thanh toán' reducedMotion={reducedMotion} gradient='bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 dark:from-slate-800 dark:via-blue-900/10 dark:to-indigo-900/5'>
        {selectedPaymentMethod ? (
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/30'>
              <span className='text-lg'>{PAYMENT_METHOD_ICONS[selectedPaymentMethod]}</span>
            </div>
            <div className='flex-1'>
              <p className='font-semibold text-gray-900 dark:text-gray-100'>{PAYMENT_METHOD_LABELS[selectedPaymentMethod]}</p>
            </div>
          </div>
        ) : (
          <p className='text-gray-500 dark:text-gray-400'>Chưa chọn phương thức thanh toán</p>
        )}
      </SectionWrapper>

      {/* Section 5: Ghi chú */}
      {note && (
        <SectionWrapper title='Ghi chú đơn hàng' reducedMotion={reducedMotion} gradient='bg-gradient-to-br from-white via-yellow-50/20 to-amber-50/10 dark:from-slate-800 dark:via-yellow-900/10 dark:to-amber-900/5'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md shadow-yellow-500/30'>
              <svg className='h-5 w-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                />
              </svg>
            </div>
            <p className='flex-1 text-sm text-gray-700 dark:text-gray-300'>{note}</p>
          </div>
        </SectionWrapper>
      )}

      {/* Section 6: Tổng kết đơn hàng */}
      <SectionWrapper title='Tổng kết đơn hàng' reducedMotion={reducedMotion} gradient='bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 dark:from-slate-800 dark:via-orange-900/20 dark:to-amber-900/10'>
        <div className='space-y-3'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600 dark:text-gray-300'>Tạm tính ({totalItemCount} sản phẩm)</span>
            <span className='font-medium text-gray-900 dark:text-gray-100'>₫{formatCurrency(subtotal)}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600 dark:text-gray-300'>Phí vận chuyển</span>
            <span className='font-medium text-gray-900 dark:text-gray-100'>₫{formatCurrency(shippingFee)}</span>
          </div>
          {voucherDiscount > 0 && (
            <div className='flex justify-between text-sm'>
              <span className='text-green-600'>Voucher giảm giá {voucherCode && `(${voucherCode})`}</span>
              <span className='font-medium text-green-600'>-₫{formatCurrency(voucherDiscount)}</span>
            </div>
          )}
          {coinsDiscount > 0 && (
            <div className='flex justify-between text-sm'>
              <span className='text-yellow-600'>Shopee Xu ({coinsUsed} xu)</span>
              <span className='font-medium text-yellow-600'>-₫{formatCurrency(coinsDiscount)}</span>
            </div>
          )}
          <div className='border-t-2 border-orange/20 pt-3'>
            <div className='flex items-center justify-between'>
              <span className='text-base font-semibold text-gray-900 dark:text-gray-100'>Tổng thanh toán</span>
              <span className='text-2xl font-bold bg-gradient-to-r from-orange to-red-500 bg-clip-text text-transparent'>₫{formatCurrency(Math.max(0, total))}</span>
            </div>
            {totalDiscount > 0 && (
              <p className='mt-1 text-right text-xs font-medium text-green-600'>
                🎉 Tiết kiệm ₫{formatCurrency(totalDiscount)}
              </p>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* Action Buttons */}
      <motion.div
        variants={reducedMotion ? undefined : staggerItem}
        className='flex flex-col gap-3 rounded-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/50 p-4 shadow-lg border border-gray-100/50 dark:border-slate-700 md:flex-row md:p-6'
      >
        <Button
          onClick={onBack}
          className='flex-1 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-3 font-medium text-gray-700 dark:text-gray-200 transition-all hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
        >
          <span className='flex items-center justify-center gap-2'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Quay lại
          </span>
        </Button>
        <Button
          onClick={onPlaceOrder}
          disabled={isPlacingOrder}
          isLoading={isPlacingOrder}
          className='flex-1 rounded-xl bg-gradient-to-r from-orange via-orange to-amber-500 py-3 font-semibold text-white shadow-lg shadow-orange/30 transition-all hover:shadow-xl hover:shadow-orange/40 hover:from-orange-600 hover:via-orange-500 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none md:flex-[2]'
        >
          {isPlacingOrder ? 'Đang xử lý...' : 'Đặt hàng'}
        </Button>
      </motion.div>

      {/* Terms notice */}
      <motion.p
        variants={reducedMotion ? undefined : staggerItem}
        className='text-center text-xs text-gray-500 dark:text-gray-400'
      >
        Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo{' '}
        <a href='#' className='text-orange hover:underline'>
          Điều khoản Shopee
        </a>
      </motion.p>
    </motion.div>
  )
})

export default OrderPreview

