import { memo, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import Button from 'src/components/Button'
import CreditCardForm, { PaymentFormData } from './CreditCardForm'
import BankTransferPayment from './BankTransferPayment'
import EWalletPayment from './EWalletPayment'

type PaymentMethodTab = 'credit_card' | 'bank_transfer' | 'e_wallet'

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>
  onCancel?: () => void
  isProcessing?: boolean
  amount?: number
}

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Vui lòng nhập số thẻ')
    .regex(/^[\d\s]{16,19}$/, 'Số thẻ không hợp lệ'),
  cardHolder: z
    .string()
    .min(1, 'Vui lòng nhập tên chủ thẻ')
    .min(2, 'Tên chủ thẻ tối thiểu 2 ký tự')
    .max(50, 'Tên chủ thẻ tối đa 50 ký tự'),
  expiryDate: z
    .string()
    .min(1, 'Vui lòng nhập ngày hết hạn')
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Định dạng MM/YY'),
  cvv: z
    .string()
    .min(1, 'Vui lòng nhập CVV')
    .regex(/^[0-9]{3,4}$/, 'CVV không hợp lệ'),
  saveCard: z.boolean().optional()
})

const paymentTabs: { id: PaymentMethodTab; label: string; icon: string }[] = [
  { id: 'credit_card', label: 'Thẻ tín dụng', icon: '💳' },
  { id: 'bank_transfer', label: 'Chuyển khoản', icon: '🏦' },
  { id: 'e_wallet', label: 'Ví điện tử', icon: '📱' }
]

const SecureBadge = memo(function SecureBadge() {
  return (
    <div className='flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400'>
      <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
          clipRule='evenodd'
        />
      </svg>
      <span>Thanh toán bảo mật SSL 256-bit</span>
    </div>
  )
})

const SuccessFeedback = memo(function SuccessFeedback() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className='flex flex-col items-center justify-center py-12 text-center'
    >
      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
        <svg className='h-8 w-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
        </svg>
      </div>
      <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Thanh toán thành công!</h3>
      <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Đơn hàng của bạn đang được xử lý</p>
    </motion.div>
  )
})

const ErrorFeedback = memo(function ErrorFeedback({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className='flex flex-col items-center justify-center py-12 text-center'
    >
      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
        <svg className='h-8 w-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
        </svg>
      </div>
      <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Thanh toán thất bại</h3>
      <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{message}</p>
      <Button
        type='button'
        onClick={onRetry}
        className='mt-4 rounded-lg bg-orange px-4 py-2 text-white hover:bg-orange/90'
      >
        Thử lại
      </Button>
    </motion.div>
  )
})

const PaymentForm = memo(function PaymentForm({ onSubmit, onCancel, isProcessing = false, amount = 150000 }: PaymentFormProps) {
  const [activeTab, setActiveTab] = useState<PaymentMethodTab>('credit_card')
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      saveCard: false
    }
  })

  const handleFormSubmit = useCallback(
    async (data: PaymentFormData) => {
      setPaymentStatus('processing')
      setErrorMessage('')
      try {
        await onSubmit(data)
        setPaymentStatus('success')
      } catch (error) {
        setPaymentStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Đã có lỗi xảy ra')
      }
    },
    [onSubmit]
  )

  const handleRetry = useCallback(() => {
    setPaymentStatus('idle')
    setErrorMessage('')
  }, [])

  if (paymentStatus === 'success') {
    return <SuccessFeedback />
  }

  if (paymentStatus === 'error') {
    return <ErrorFeedback message={errorMessage} onRetry={handleRetry} />
  }

  const isLoading = paymentStatus === 'processing' || isProcessing

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Thanh toán</h3>
        <SecureBadge />
      </div>

      <div className='flex gap-2 overflow-x-auto border-b border-gray-200 pb-1 dark:border-slate-700'>
        {paymentTabs.map((tab) => (
          <button
            key={tab.id}
            type='button'
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-orange bg-orange/5 text-orange'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className='hidden sm:inline'>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode='wait'>
        {activeTab === 'credit_card' && (
          <motion.form
            key='credit_card'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit(handleFormSubmit)}
            className='space-y-6'
          >
            <CreditCardForm register={register} errors={errors} watch={watch} />

            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='saveCard'
                {...register('saveCard')}
                className='h-4 w-4 rounded border-gray-300 text-orange focus:ring-orange dark:border-slate-600 dark:bg-slate-800'
              />
              <label htmlFor='saveCard' className='text-sm text-gray-700 dark:text-gray-300'>
                Lưu thẻ cho lần thanh toán sau
              </label>
            </div>

            <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
              {onCancel && (
                <Button
                  type='button'
                  onClick={onCancel}
                  disabled={isLoading}
                  className='w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 sm:w-auto dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                >
                  Hủy
                </Button>
              )}
              <Button
                type='submit'
                disabled={isLoading}
                isLoading={isLoading}
                className='w-full rounded-lg bg-orange px-6 py-3 text-white hover:bg-orange/90 disabled:opacity-50 sm:w-auto'
              >
                {isLoading ? 'Đang xử lý...' : 'Thanh toán'}
              </Button>
            </div>
          </motion.form>
        )}

        {activeTab === 'bank_transfer' && (
          <motion.div
            key='bank_transfer'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <BankTransferPayment
              amount={amount}
              onPaymentConfirmed={() => setPaymentStatus('success')}
              onPaymentExpired={() => {
                setErrorMessage('Đơn hàng đã hết hạn thanh toán')
                setPaymentStatus('error')
              }}
            />
          </motion.div>
        )}

        {activeTab === 'e_wallet' && (
          <motion.div
            key='e_wallet'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <EWalletPayment
              amount={amount}
              onPaymentComplete={() => setPaymentStatus('success')}
              onPaymentFailed={(error) => {
                setErrorMessage(error)
                setPaymentStatus('error')
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default PaymentForm

