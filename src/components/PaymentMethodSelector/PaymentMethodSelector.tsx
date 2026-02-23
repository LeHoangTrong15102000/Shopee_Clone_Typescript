import { memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PaymentMethod, PaymentMethodType } from 'src/types/checkout.type'
import checkoutApi from 'src/apis/checkout.api'

const PaymentIcon = ({ type, className }: { type: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    cod: (
      <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z'
          stroke='#ee4d2d'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
    bank_transfer: (
      <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z'
          stroke='#ee4d2d'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
    e_wallet: (
      <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3'
          stroke='#ee4d2d'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
    credit_card: (
      <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z'
          stroke='#ee4d2d'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    )
  }
  if (!icons[type]) {
    return <span className='text-xl'>{type}</span>
  }
  return <>{icons[type]}</>
}

interface PaymentMethodSelectorProps {
  selectedMethodType: PaymentMethodType | null
  onSelect: (method: PaymentMethod) => void
}

const PaymentMethodSelector = memo(function PaymentMethodSelector({
  selectedMethodType,
  onSelect
}: PaymentMethodSelectorProps) {
  const { data: methodsData, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const res = await checkoutApi.getPaymentMethods()
      return res.data.data
    }
  })

  const methods = methodsData || []

  if (isLoading) {
    return (
      <div className='animate-pulse space-y-3'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='h-16 rounded-lg bg-gray-200 dark:bg-slate-700' />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Title removed - using SectionHeader in parent */}

      <div className='space-y-3'>
        {methods.map((method) => (
          <motion.div
            key={method._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`cursor-pointer rounded-lg border-2 p-3 md:p-4 transition-all bg-white dark:bg-slate-800 ${
              !method.isAvailable
                ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50 dark:border-slate-700 dark:bg-slate-900'
                : selectedMethodType === method.type
                  ? 'border-orange'
                  : 'border-gray-200 hover:border-gray-300 dark:border-slate-600 dark:hover:border-slate-500'
            }`}
            onClick={() => method.isAvailable && onSelect(method)}
            role='button'
            tabIndex={method.isAvailable ? 0 : -1}
            aria-pressed={selectedMethodType === method.type}
            aria-disabled={!method.isAvailable}
            onKeyDown={(e) => e.key === 'Enter' && method.isAvailable && onSelect(method)}
          >
            <div className='flex items-center gap-4'>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  selectedMethodType === method.type ? 'border-orange' : 'border-gray-300 dark:border-slate-500'
                }`}
              >
                {selectedMethodType === method.type && <div className='h-3 w-3 rounded-full bg-orange' />}
              </div>

              <div className='flex items-center gap-3'>
                <PaymentIcon type={method.type} className='h-6 w-6' />
                <div>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>{method.name}</span>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>{method.description}</p>
                </div>
              </div>

              {!method.isAvailable && (
                <span className='ml-auto rounded bg-gray-200 px-2 py-1 text-xs text-gray-600 dark:bg-slate-700 dark:text-gray-400'>
                  Không khả dụng
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedMethodType === 'bank_transfer' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30'
        >
          <h4 className='font-medium text-blue-900 dark:text-blue-300'>Thông tin chuyển khoản</h4>
          <div className='mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200'>
            <p>Ngân hàng: <span className='font-medium'>Vietcombank</span></p>
            <p>Số tài khoản: <span className='font-medium'>1234567890</span></p>
            <p>Chủ tài khoản: <span className='font-medium'>SHOPEE CLONE</span></p>
            <p className='mt-2 text-xs text-blue-600 dark:text-blue-400'>
              * Vui lòng chuyển khoản trong vòng 24h sau khi đặt hàng
            </p>
          </div>
        </motion.div>
      )}

      {selectedMethodType === 'e_wallet' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='rounded-xl bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 ring-1 ring-purple-100 dark:from-purple-900/30 dark:via-slate-800 dark:to-pink-900/30 dark:ring-purple-800'
        >
          <h4 className='font-medium text-purple-900 dark:text-purple-300'>Chọn ví điện tử</h4>
          <div className='mt-3 flex gap-3'>
            <button className='flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-pink-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/40'>
              MoMo
            </button>
            <button className='flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40'>
              ZaloPay
            </button>
            <button className='flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/40'>
              VNPay
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
})

export default PaymentMethodSelector

