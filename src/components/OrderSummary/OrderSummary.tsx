import { memo, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from 'src/utils/utils'
import { getEstimatedDeliveryDate } from 'src/utils/date'
import { ExtendedPurchase } from 'src/types/purchases.type'
import { ShippingMethod } from 'src/types/checkout.type'
import ImageWithFallback from 'src/components/ImageWithFallback'

interface OrderSummaryProps {
  items: ExtendedPurchase[]
  shippingMethod: ShippingMethod | null
  voucherDiscount?: number
  voucherCode?: string
  onRemoveVoucher?: () => void
  coinsUsed?: number
  coinsValue?: number
}

const VISIBLE_ITEMS_COUNT = 2
const VAT_RATE = 0.1

// Shipping icon component to render proper SVG icons instead of text
const ShippingIcon = ({ type, className }: { type: string; className?: string }) => {
  // Default truck icon for fallback
  const truckIcon = (
    <svg className={className} viewBox='0 0 24 24' fill='none'>
      <path stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' />
    </svg>
  )

  const icons: Record<string, React.ReactNode> = {
    truck: truckIcon,
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
        <path stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' />
      </svg>
    )
  }

  // Return the icon or fallback to truck
  return <>{icons[type] || truckIcon}</>
}

const OrderSummary = memo(function OrderSummary({
  items,
  shippingMethod,
  voucherDiscount = 0,
  voucherCode,
  onRemoveVoucher,
  coinsUsed = 0,
  coinsValue = 1
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.buy_count, 0)
  }, [items])

  const originalTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price_before_discount * item.buy_count, 0)
  }, [items])

  // Số sản phẩm unique (không tính số lượng mua)
  const uniqueProductCount = items.length

  const productDiscount = originalTotal - subtotal
  const shippingFee = shippingMethod?.price || 0
  const coinsDiscount = coinsUsed * coinsValue
  const vatAmount = 0
  const totalDiscount = productDiscount + voucherDiscount + coinsDiscount
  const total = subtotal + shippingFee + vatAmount - voucherDiscount - coinsDiscount

  const estimatedDeliveryDate = useMemo(() => {
    if (!shippingMethod) return null
    return getEstimatedDeliveryDate(shippingMethod.estimatedDays)
  }, [shippingMethod])

  const visibleItems = isExpanded ? items : items.slice(0, VISIBLE_ITEMS_COUNT)
  const hiddenItemsCount = items.length - VISIBLE_ITEMS_COUNT

  return (
    <div className='overflow-hidden rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg'>
      {/* Header with item count badge */}
      <div className='border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-orange/5 to-transparent px-6 py-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Đơn hàng của bạn</h3>
          <span className='inline-flex items-center gap-1 rounded-full bg-orange/10 px-3 py-1 text-sm font-medium text-orange'>
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
            </svg>
            {uniqueProductCount} sản phẩm
          </span>
        </div>
      </div>

      <div className='p-6'>
        {/* Collapsible Product List */}
        <div className='space-y-3'>
          <AnimatePresence initial={false}>
            {visibleItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className='flex gap-3 rounded-lg bg-gray-50 dark:bg-slate-900 p-3'
              >
                <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-slate-600'>
                  <ImageWithFallback
                    src={item.product.image}
                    alt={item.product.name}
                    className='h-full w-full object-cover'
                  />
                  <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-xs font-medium text-white'>
                    {item.buy_count}
                  </span>
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100'>{item.product.name}</p>
                  <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>SL: {item.buy_count}</p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-semibold text-orange'>₫{formatCurrency(item.price * item.buy_count)}</p>
                  {item.price_before_discount > item.price && (
                    <p className='text-xs text-gray-400 dark:text-gray-500 line-through'>
                      ₫{formatCurrency(item.price_before_discount * item.buy_count)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Expand/Collapse button */}
          {hiddenItemsCount > 0 && (
            <motion.button
              type='button'
              onClick={() => setIsExpanded(!isExpanded)}
              className='flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:border-orange hover:bg-orange/5 hover:text-orange'
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isExpanded ? (
                <>
                  <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
                  </svg>
                  Thu gọn
                </>
              ) : (
                <>
                  <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                  Xem thêm {hiddenItemsCount} sản phẩm
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Voucher Success Indicator */}
        {voucherDiscount > 0 && voucherCode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3'
          >
            <div className='flex items-center gap-2'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white'>
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </span>
              <div>
                <p className='text-sm font-medium text-green-800'>Mã "{voucherCode}" đã được áp dụng</p>
                <p className='text-xs text-green-600'>Giảm ₫{formatCurrency(voucherDiscount)}</p>
              </div>
            </div>
            {onRemoveVoucher && (
              <button
                type='button'
                onClick={onRemoveVoucher}
                className='rounded p-1 text-green-600 transition-colors hover:bg-green-100 hover:text-red-500'
                aria-label='Xóa mã giảm giá'
              >
                <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            )}
          </motion.div>
        )}

        {/* Price Breakdown Section */}
        <div className='mt-6 space-y-3 rounded-lg bg-gray-50 dark:bg-slate-900 p-4'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600 dark:text-gray-300'>Tạm tính</span>
            <span className='font-medium text-gray-900 dark:text-gray-100'>₫{formatCurrency(subtotal)}</span>
          </div>

          {productDiscount > 0 && (
            <div className='flex justify-between text-sm'>
              <span className='text-green-600'>Giảm giá sản phẩm</span>
              <span className='font-medium text-green-600'>-₫{formatCurrency(productDiscount)}</span>
            </div>
          )}

          <div className='flex justify-between text-sm'>
            <span className='text-gray-600 dark:text-gray-300'>Phí vận chuyển</span>
            <span className='font-medium text-gray-900 dark:text-gray-100'>
              {shippingMethod ? `₫${formatCurrency(shippingFee)}` : <span className='text-gray-400 dark:text-gray-500'>Chưa chọn</span>}
            </span>
          </div>

          {voucherDiscount > 0 && (
            <div className='flex justify-between text-sm'>
              <span className='text-green-600'>Voucher giảm giá</span>
              <span className='font-medium text-green-600'>-₫{formatCurrency(voucherDiscount)}</span>
            </div>
          )}

          {coinsDiscount > 0 && (
            <div className='flex justify-between text-sm'>
              <span className='text-yellow-600'>Shopee Xu ({coinsUsed} xu)</span>
              <span className='font-medium text-yellow-600'>-₫{formatCurrency(coinsDiscount)}</span>
            </div>
          )}

          {/* VAT Display */}
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500 dark:text-gray-400'>VAT ({VAT_RATE * 100}%)</span>
            <span className='text-gray-500 dark:text-gray-400'>₫{formatCurrency(vatAmount)}</span>
          </div>
        </div>

        {/* Total Section */}
        <div className='mt-4 rounded-lg border-2 border-orange/20 bg-gradient-to-r from-orange/5 to-orange/10 dark:from-orange/10 dark:to-orange/20 p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-base font-semibold text-gray-900 dark:text-gray-100'>Tổng thanh toán</span>
            <div className='text-right'>
              <motion.span
                key={total}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className='text-2xl font-bold text-orange'
              >
                ₫{formatCurrency(Math.max(0, total))}
              </motion.span>
              {totalDiscount > 0 && (
                <p className='mt-1 text-xs font-medium text-green-600'>
                  🎉 Tiết kiệm ₫{formatCurrency(totalDiscount)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Estimated Delivery Date */}
        {shippingMethod && estimatedDeliveryDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-4 rounded-lg border border-green-200 bg-green-50 p-4'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-white'>
                <ShippingIcon type={shippingMethod.icon} className='h-5 w-5 text-green-500' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-semibold text-green-800'>{shippingMethod.name}</p>
                <p className='mt-0.5 text-sm font-medium text-green-600'>
                  📦 Dự kiến giao: <span className='font-semibold'>{estimatedDeliveryDate}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Money-back Guarantee Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4'
        >
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-white'>
            <svg className='h-5 w-5 text-emerald-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
            </svg>
          </div>
          <div className='flex-1'>
            <p className='text-sm font-semibold text-emerald-800'>Đảm bảo hoàn tiền</p>
            <p className='text-xs text-emerald-600'>Hoàn tiền 100% nếu hàng không như mô tả</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
})

export default OrderSummary

