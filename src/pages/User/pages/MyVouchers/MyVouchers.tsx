import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import voucherApi from 'src/apis/voucher.api'
import VoucherCard from 'src/components/VoucherCard'
import { VoucherStatus, VoucherCategory } from 'src/types/voucher.type'

type TabStatus = VoucherStatus | 'all'

const statusTabs: { status: TabStatus; label: string }[] = [
  { status: 'all', label: 'Tất cả' },
  { status: 'available', label: 'Có thể sử dụng' },
  { status: 'used', label: 'Đã sử dụng' },
  { status: 'expired', label: 'Hết hạn' }
]

const categoryTabs: { category: VoucherCategory; label: string }[] = [
  { category: 'all', label: 'Tất cả' },
  { category: 'shop', label: 'Voucher Shop' },
  { category: 'shipping', label: 'Miễn phí vận chuyển' },
  { category: 'shopee', label: 'Shopee' }
]

export default function MyVouchers() {
  const [activeStatus, setActiveStatus] = useState<TabStatus>('all')
  const [activeCategory, setActiveCategory] = useState<VoucherCategory>('all')

  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ['my-vouchers', activeStatus, activeCategory],
    queryFn: () =>
      voucherApi.getMyVouchers({
        status: activeStatus === 'all' ? undefined : activeStatus
      })
  })

  const applyVoucherMutation = useMutation({
    mutationFn: (code: string) => voucherApi.applyVoucher({ code, order_total: 0 }),
    onSuccess: () => {
      toast.success('Đã sao chép mã voucher!', { autoClose: 1500 })
    }
  })

  const vouchers = vouchersData?.data.data.vouchers || []

  const filteredVouchers =
    activeCategory === 'all'
      ? vouchers
      : vouchers.filter((v) => {
          if (activeCategory === 'shipping') return v.discount_type === 'shipping'
          if (activeCategory === 'shop') return v.discount_type === 'shop'
          return true
        })

  const handleApplyVoucher = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã: ${code}`, { autoClose: 1500 })
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800'>
        <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>Kho Voucher</h1>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Quản lý các voucher của bạn</p>
      </div>

      <div className='rounded-lg bg-white shadow-sm dark:bg-slate-800'>
        <div className='flex flex-wrap gap-2 border-b p-3 dark:border-slate-600'>
          {categoryTabs.map((tab) => (
            <button
              key={tab.category}
              onClick={() => setActiveCategory(tab.category)}
              className={classNames(
                'rounded-full px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-medium transition-colors',
                {
                  'bg-[#ee4d2d] text-white': activeCategory === tab.category,
                  'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-900 dark:text-gray-400 dark:hover:bg-slate-700':
                    activeCategory !== tab.category
                }
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className='flex overflow-x-auto border-b dark:border-slate-600'>
          {statusTabs.map((tab) => (
            <button
              key={tab.status}
              onClick={() => setActiveStatus(tab.status)}
              className={classNames(
                'relative flex-shrink-0 px-3 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm font-medium transition-colors',
                activeStatus === tab.status
                  ? 'text-[#ee4d2d] dark:text-orange-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
              {activeStatus === tab.status && (
                <motion.div
                  layoutId='activeVoucherTab'
                  className='absolute bottom-0 left-0 right-0 h-0.5 bg-[#ee4d2d] dark:bg-orange-400'
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='animate-pulse rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800'>
                <div className='flex gap-4'>
                  <div className='h-20 w-20 rounded bg-gray-200 dark:bg-slate-600' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-600' />
                    <div className='h-3 w-1/2 rounded bg-gray-200 dark:bg-slate-600' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVouchers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center justify-center rounded-lg bg-white py-16 shadow-sm dark:bg-slate-800'
          >
            <div className='text-6xl'>🎫</div>
            <p className='mt-4 text-gray-500 dark:text-gray-400'>Chưa có voucher nào</p>
            <a href='/vouchers' className='mt-4 text-[#ee4d2d] hover:underline dark:text-orange-400'>
              Thu thập voucher ngay
            </a>
          </motion.div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {filteredVouchers.map((voucher) => (
              <motion.div
                key={voucher._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <VoucherCard
                  voucher={voucher}
                  isSaved={true}
                  onApply={handleApplyVoucher}
                  isLoading={applyVoucherMutation.isPending}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
