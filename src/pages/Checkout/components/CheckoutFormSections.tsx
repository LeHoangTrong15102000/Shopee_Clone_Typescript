import { motion, AnimatePresence } from 'framer-motion'
import { Address, ShippingMethod, PaymentMethodType } from 'src/types/checkout.type'
import AddressSelector from 'src/components/AddressSelector'
import ShippingMethodSelector from 'src/components/ShippingMethodSelector'
import PaymentMethodSelector from 'src/components/PaymentMethodSelector'
import Button from 'src/components/Button'
import { SecurityBadge } from './TrustIndicators'

const SectionHeader = ({ number, title }: { number: number; title: string }) => (
  <div className='mb-4 flex items-center gap-3'>
    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange text-sm font-bold text-white shadow-lg shadow-orange/30 dark:shadow-slate-900/50'>
      {number}
    </div>
    <h2 className='text-base font-semibold text-gray-800 md:text-lg dark:text-gray-100'>{title}</h2>
  </div>
)

const sectionClass =
  'rounded-xl border border-gray-100/50 bg-linear-to-br from-white to-gray-50/50 p-4 shadow-md transition-shadow hover:shadow-lg md:p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 dark:shadow-slate-900/50'

interface CheckoutFormSectionsProps {
  selectedAddress: Address | null
  selectedShippingMethod: ShippingMethod | null
  selectedPaymentMethod: PaymentMethodType | null
  voucherCode: string
  voucherDiscount: number
  coinsUsed: number
  note: string
  onAddressSelect: (address: Address) => void
  onShippingSelect: (method: ShippingMethod) => void
  onPaymentSelect: (method: { type: PaymentMethodType }) => void
  onApplyVoucher: () => void
  onVoucherCodeChange: (code: string) => void
  onCoinsChange: (coins: number) => void
  onNoteChange: (note: string) => void
}

export const CheckoutFormSections = ({
  selectedAddress,
  selectedShippingMethod,
  selectedPaymentMethod,
  voucherCode,
  voucherDiscount,
  coinsUsed,
  note,
  onAddressSelect,
  onShippingSelect,
  onPaymentSelect,
  onApplyVoucher,
  onVoucherCodeChange,
  onCoinsChange,
  onNoteChange
}: CheckoutFormSectionsProps) => {
  return (
    <div className='space-y-4 md:space-y-6 lg:col-span-2'>
      {/* Address Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={sectionClass}
      >
        <SectionHeader number={1} title='Địa chỉ giao hàng' />
        <AddressSelector selectedAddressId={selectedAddress?._id || null} onSelect={onAddressSelect} />
      </motion.div>

      {/* Shipping Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={sectionClass}
      >
        <SectionHeader number={2} title='Phương thức vận chuyển' />
        <ShippingMethodSelector selectedMethodId={selectedShippingMethod?._id || null} onSelect={onShippingSelect} />
      </motion.div>

      {/* Payment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={sectionClass}
      >
        <SectionHeader number={3} title='Phương thức thanh toán' />
        <PaymentMethodSelector selectedMethodType={selectedPaymentMethod} onSelect={onPaymentSelect} />
        <SecurityBadge />
      </motion.div>

      {/* Voucher & Coins Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={sectionClass}
      >
        <SectionHeader number={4} title='Mã giảm giá & Shopee Xu' />
        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>Mã voucher</label>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <input
              type='text'
              value={voucherCode}
              onChange={(e) => onVoucherCodeChange(e.target.value)}
              placeholder='Nhập mã voucher'
              className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-orange focus:outline-hidden dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400'
            />
            <Button onClick={onApplyVoucher} className='rounded-lg bg-orange px-4 py-2 text-white hover:bg-orange/90'>
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
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>Sử dụng Shopee Xu</label>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
            <input
              type='number'
              value={coinsUsed}
              onChange={(e) => onCoinsChange(Math.max(0, parseInt(e.target.value) || 0))}
              min={0}
              max={10000}
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-orange focus:outline-hidden sm:w-32 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100'
            />
            <span className='text-sm text-gray-500 dark:text-gray-400'>Bạn có 10,000 xu (tối đa 10,000 xu)</span>
          </div>
        </div>
      </motion.div>

      {/* Note Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={sectionClass}
      >
        <SectionHeader number={5} title='Ghi chú đơn hàng' />
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder='Ghi chú cho người bán (không bắt buộc)'
          rows={3}
          className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-orange focus:outline-hidden dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400'
        />
      </motion.div>
    </div>
  )
}
