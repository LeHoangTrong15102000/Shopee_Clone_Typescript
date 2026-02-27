import { memo, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import classNames from 'classnames'
import { formatCurrency } from 'src/utils/utils'
import { Voucher } from 'src/types/voucher.type'

interface VoucherCardProps {
  voucher: Pick<
    Voucher,
    | '_id'
    | 'code'
    | 'name'
    | 'description'
    | 'discount_type'
    | 'discount_value'
    | 'min_order_value'
    | 'max_discount'
    | 'end_date'
    | 'is_active'
  >
  isSaved?: boolean
  onSave?: (voucherId: string) => void
  onApply?: (code: string) => void
  isLoading?: boolean
}

type VoucherStatus = 'active' | 'expired' | 'saved'

const getVoucherStatus = (voucher: VoucherCardProps['voucher'], isSaved?: boolean): VoucherStatus => {
  if (!voucher.is_active || new Date(voucher.end_date) < new Date()) {
    return 'expired'
  }
  if (isSaved) {
    return 'saved'
  }
  return 'active'
}

const formatExpiryDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const getDaysRemaining = (dateString: string): number => {
  const endDate = new Date(dateString)
  const now = new Date()
  const diffTime = endDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function VoucherCard({ voucher, isSaved = false, onSave, onApply, isLoading = false }: VoucherCardProps) {
  const status = useMemo(() => getVoucherStatus(voucher, isSaved), [voucher, isSaved])

  const daysRemaining = useMemo(() => getDaysRemaining(voucher.end_date), [voucher.end_date])

  const isExpired = status === 'expired'

  const discountDisplay = useMemo(
    () =>
      voucher.discount_type === 'percentage'
        ? `${voucher.discount_value}%`
        : `₫${formatCurrency(voucher.discount_value)}`,
    [voucher.discount_type, voucher.discount_value]
  )

  const handleButtonClick = useCallback(() => {
    if (isLoading || isExpired) return

    if (isSaved && onApply) {
      onApply(voucher.code)
    } else if (!isSaved && onSave) {
      onSave(voucher._id)
    }
  }, [isLoading, isExpired, isSaved, onApply, onSave, voucher.code, voucher._id])

  const buttonText = isLoading ? 'Đang xử lý...' : isSaved ? 'Sử dụng' : 'Lưu'

  const buttonAriaLabel = useMemo(() => {
    if (isExpired) return `Voucher ${voucher.name} đã hết hạn`
    if (isLoading) return 'Đang xử lý'
    return isSaved
      ? `Sử dụng voucher ${voucher.name} giảm ${discountDisplay}`
      : `Lưu voucher ${voucher.name} giảm ${discountDisplay}`
  }, [isExpired, isLoading, isSaved, voucher.name, discountDisplay])

  return (
    <motion.div
      role='article'
      aria-label={`Voucher ${voucher.name} - Giảm ${discountDisplay}`}
      className={classNames('relative flex overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-sm', {
        'opacity-60': isExpired
      })}
      whileHover={!isExpired ? { scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } : {}}
      whileTap={!isExpired ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      <div
        className='absolute left-0 top-0 bottom-0 w-1 border-l-4 border-dashed border-[#ee4d2d]'
        aria-hidden='true'
      />

      <div
        className='flex w-20 sm:w-24 flex-shrink-0 flex-col items-center justify-center bg-gradient-to-br from-[#ee4d2d] to-[#ff6633] p-2 sm:p-3 text-white'
        aria-hidden='true'
      >
        <span className='text-xs font-medium uppercase'>
          {voucher.discount_type === 'percentage' ? 'Giảm' : 'Giảm'}
        </span>
        <span className='text-lg sm:text-xl font-bold'>{discountDisplay}</span>
        {voucher.discount_type === 'percentage' && voucher.max_discount && (
          <span className='mt-1 text-[10px] opacity-90'>Tối đa ₫{formatCurrency(voucher.max_discount)}</span>
        )}
      </div>

      <div className='flex flex-1 flex-col justify-between p-2 sm:p-3'>
        <div>
          <h3 className='line-clamp-1 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100'>
            {voucher.name}
          </h3>
          <p className='mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400'>{voucher.description}</p>
          <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
            Đơn tối thiểu ₫{formatCurrency(voucher.min_order_value)}
          </p>
        </div>

        <div className='mt-2 flex items-center justify-between'>
          <div className='flex flex-col'>
            <span className='text-[10px] text-gray-400 dark:text-gray-500'>Mã: {voucher.code}</span>
            <span
              className={classNames('text-[10px]', {
                'text-red-500 dark:text-red-400': daysRemaining <= 3 && !isExpired,
                'text-gray-400 dark:text-gray-500': daysRemaining > 3 || isExpired
              })}
            >
              {isExpired
                ? 'Đã hết hạn'
                : daysRemaining <= 0
                  ? 'Hết hạn hôm nay'
                  : `HSD: ${formatExpiryDate(voucher.end_date)}`}
            </span>
          </div>

          <motion.button
            type='button'
            onClick={handleButtonClick}
            disabled={isLoading || isExpired}
            aria-label={buttonAriaLabel}
            aria-disabled={isLoading || isExpired}
            className={classNames('rounded px-3 py-1.5 sm:px-4 text-xs font-medium transition-colors', {
              'bg-[#ee4d2d] text-white hover:bg-[#d73211]': !isExpired && !isSaved,
              'border border-[#ee4d2d] text-[#ee4d2d] hover:bg-[#ee4d2d]/10': !isExpired && isSaved,
              'cursor-not-allowed bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500': isExpired,
              'cursor-not-allowed opacity-50': isLoading
            })}
            whileHover={!isExpired && !isLoading ? { scale: 1.05 } : {}}
            whileTap={!isExpired && !isLoading ? { scale: 0.95 } : {}}
          >
            {buttonText}
          </motion.button>
        </div>
      </div>

      {isExpired && (
        <div
          className='absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50'
          aria-hidden='true'
        >
          <span className='rotate-[-15deg] rounded border-2 border-gray-400 dark:border-gray-500 px-3 py-1 text-sm font-bold uppercase text-gray-400 dark:text-gray-500'>
            Hết hạn
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default memo(VoucherCard)
