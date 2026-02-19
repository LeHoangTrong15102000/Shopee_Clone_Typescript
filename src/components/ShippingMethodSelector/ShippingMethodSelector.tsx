import { memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ShippingMethod } from 'src/types/checkout.type'
import checkoutApi from 'src/apis/checkout.api'
import { formatCurrency } from 'src/utils/utils'
import { getEstimatedDeliveryDate } from 'src/utils/date'

interface ShippingMethodSelectorProps {
  selectedMethodId: string | null
  onSelect: (method: ShippingMethod) => void
}

const ShippingIcon = ({ type, className }: { type: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    truck: (
      <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' stroke='#ee4d2d' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ),
    rocket: (
      <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' stroke='#ee4d2d' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ),
    lightning: (
      <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' stroke='#ee4d2d' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ),
    express: (
      <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' stroke='#ee4d2d' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ),
    fast: (
      <svg className={className} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' stroke='#ee4d2d' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    )
  }
  if (!icons[type]) {
    return <span className='text-xl'>{type}</span>
  }
  return <>{icons[type]}</>
}

const ShippingMethodSelector = memo(function ShippingMethodSelector({
  selectedMethodId,
  onSelect
}: ShippingMethodSelectorProps) {
  const { data: methodsData, isLoading } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: async () => {
      const res = await checkoutApi.getShippingMethods()
      return res.data.data
    }
  })

  const methods = methodsData || []

  if (isLoading) {
    return (
      <div className='animate-pulse space-y-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-20 rounded-lg bg-gray-200 dark:bg-slate-700' />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {methods.map((method) => (
        <motion.div
          key={method._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`cursor-pointer rounded-lg border-2 p-3 md:p-4 transition-all bg-white dark:bg-slate-800 ${
            selectedMethodId === method._id
              ? 'border-orange'
              : 'border-gray-200 hover:border-gray-300 dark:border-slate-600 dark:hover:border-slate-500'
          }`}
          onClick={() => onSelect(method)}
          role='button'
          tabIndex={0}
          aria-pressed={selectedMethodId === method._id}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(method)}
        >
          <div className='flex items-center gap-4'>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                selectedMethodId === method._id ? 'border-orange' : 'border-gray-300 dark:border-slate-500'
              }`}
            >
              {selectedMethodId === method._id && <div className='h-3 w-3 rounded-full bg-orange' />}
            </div>

            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <ShippingIcon type={method.icon} className='h-6 w-6' />
                <span className='font-medium text-gray-900 dark:text-gray-100'>{method.name}</span>
              </div>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{method.description}</p>
              <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                Thời gian giao hàng: <span className='font-medium'>{method.estimatedDays}</span>
              </p>
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='mt-1.5 flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400'
              >
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <span>Dự kiến giao: {getEstimatedDeliveryDate(method.estimatedDays)}</span>
              </motion.p>
            </div>

            <div className='text-right'>
              <span className='text-lg font-semibold text-orange'>₫{formatCurrency(method.price)}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
})

export default ShippingMethodSelector

