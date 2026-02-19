import { memo, useMemo, useState, useCallback } from 'react'
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import Input from 'src/components/Input'

export interface PaymentFormData {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
  saveCard?: boolean
}

interface CreditCardFormProps {
  register: UseFormRegister<PaymentFormData>
  errors: FieldErrors<PaymentFormData>
  watch: UseFormWatch<PaymentFormData>
}

type CardType = 'visa' | 'mastercard' | 'jcb' | 'amex' | 'unknown'

const detectCardType = (cardNumber: string): CardType => {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  if (/^4/.test(cleanNumber)) return 'visa'
  if (/^5[1-5]/.test(cleanNumber) || /^2(2[2-9][1-9]|[3-6]|7[0-1]|720)/.test(cleanNumber)) return 'mastercard'
  if (/^3[47]/.test(cleanNumber)) return 'amex'
  if (/^35(2[89]|[3-8])/.test(cleanNumber)) return 'jcb'
  return 'unknown'
}

const luhnValidate = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  if (!/^\d+$/.test(cleanNumber) || cleanNumber.length < 13) return false

  let sum = 0
  let isEven = false

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

const isExpiryValid = (expiryDate: string): boolean => {
  const cleanValue = expiryDate.replace(/\D/g, '')
  if (cleanValue.length < 4) return false

  const month = parseInt(cleanValue.slice(0, 2), 10)
  const year = parseInt(cleanValue.slice(2, 4), 10)

  if (month < 1 || month > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false

  return true
}

const formatCardNumber = (value: string, cardType: CardType): string => {
  const cleanValue = value.replace(/\D/g, '')
  const maxLength = cardType === 'amex' ? 15 : 16
  const trimmed = cleanValue.slice(0, maxLength)

  if (cardType === 'amex') {
    const match = trimmed.match(/^(\d{0,4})(\d{0,6})(\d{0,5})$/)
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(' ')
    }
  }

  const groups = trimmed.match(/.{1,4}/g)
  return groups ? groups.join(' ') : trimmed
}

const formatExpiryDate = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 4)
  if (cleanValue.length >= 2) {
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`
  }
  return cleanValue
}

const VisaSvgIcon = memo(function VisaSvgIcon() {
  return (
    <svg viewBox='0 0 48 32' className='h-6 w-9'>
      <rect width='48' height='32' rx='4' fill='#1A1F71' />
      <path
        d='M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm-4.8 0h-2.8l-2.4-8.4-.3 1.5-.8 4.3c-.1.5-.4 1.6-1.2 2.6h5.5l.4-2.5h2l.6 2.5h2.5l-2.2-10.5h-2.1c-.7 0-1.2.4-1.4 1l-3.4 9.5h2.6zm17.8-6.8c0-1.1.9-1.6 2.4-1.6.9 0 1.9.2 2.8.6l.4-2.4c-.8-.3-1.9-.5-3-.5-3.2 0-5.4 1.7-5.4 4.1 0 1.8 1.6 2.8 2.8 3.4 1.2.6 1.7 1 1.7 1.6 0 .9-.9 1.3-2 1.3-1.2 0-2.5-.4-3.5-.9l-.4 2.4c1 .4 2.4.7 3.8.7 3.4 0 5.6-1.7 5.6-4.2 0-3.2-4.2-3.4-4.2-4.5zm11.5-3.7h-2.1c-.7 0-1.2.4-1.4 1l-4 9.5h2.8l.6-1.6h3.4l.3 1.6h2.5l-2.1-10.5zm-3.5 6.8l1.4-3.8.8 3.8h-2.2z'
        fill='#fff'
      />
    </svg>
  )
})

const MastercardSvgIcon = memo(function MastercardSvgIcon() {
  return (
    <svg viewBox='0 0 48 32' className='h-6 w-9'>
      <rect width='48' height='32' rx='4' fill='#000' />
      <circle cx='18' cy='16' r='10' fill='#EB001B' />
      <circle cx='30' cy='16' r='10' fill='#F79E1B' />
      <path d='M24 8.5a10 10 0 0 0 0 15 10 10 0 0 0 0-15z' fill='#FF5F00' />
    </svg>
  )
})

const AmexSvgIcon = memo(function AmexSvgIcon() {
  return (
    <svg viewBox='0 0 48 32' className='h-6 w-9'>
      <rect width='48' height='32' rx='4' fill='#006FCF' />
      <path
        d='M8 12h4l.8 2 .8-2h4v8h-3v-5l-1.3 3h-1.8l-1.3-3v5H8v-8zm12 0h6v2h-3v1h3v2h-3v1h3v2h-6v-8zm8 0h3l2 3 2-3h3l-3.5 4 3.5 4h-3l-2-3-2 3h-3l3.5-4-3.5-4z'
        fill='#fff'
      />
    </svg>
  )
})

const JcbSvgIcon = memo(function JcbSvgIcon() {
  return (
    <svg viewBox='0 0 48 32' className='h-6 w-9'>
      <rect width='48' height='32' rx='4' fill='#fff' />
      <rect x='6' y='6' width='10' height='20' rx='2' fill='#0E4C96' />
      <rect x='19' y='6' width='10' height='20' rx='2' fill='#E21836' />
      <rect x='32' y='6' width='10' height='20' rx='2' fill='#007940' />
      <text x='11' y='18' fontSize='6' fill='#fff' textAnchor='middle' fontWeight='bold'>J</text>
      <text x='24' y='18' fontSize='6' fill='#fff' textAnchor='middle' fontWeight='bold'>C</text>
      <text x='37' y='18' fontSize='6' fill='#fff' textAnchor='middle' fontWeight='bold'>B</text>
    </svg>
  )
})

const UnknownCardSvgIcon = memo(function UnknownCardSvgIcon() {
  return (
    <svg viewBox='0 0 48 32' className='h-6 w-9'>
      <rect width='48' height='32' rx='4' fill='#E5E7EB' />
      <rect x='6' y='10' width='12' height='8' rx='1' fill='#9CA3AF' />
      <rect x='22' y='12' width='20' height='2' rx='1' fill='#9CA3AF' />
      <rect x='22' y='18' width='14' height='2' rx='1' fill='#9CA3AF' />
    </svg>
  )
})

const CardTypeIcon = memo(function CardTypeIcon({ type }: { type: CardType }) {
  switch (type) {
    case 'visa':
      return <VisaSvgIcon />
    case 'mastercard':
      return <MastercardSvgIcon />
    case 'amex':
      return <AmexSvgIcon />
    case 'jcb':
      return <JcbSvgIcon />
    default:
      return <UnknownCardSvgIcon />
  }
})

const CheckmarkIcon = memo(function CheckmarkIcon() {
  return (
    <svg className='h-5 w-5 text-green-500' viewBox='0 0 20 20' fill='currentColor'>
      <path
        fillRule='evenodd'
        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
        clipRule='evenodd'
      />
    </svg>
  )
})

const InfoIcon = memo(function InfoIcon() {
  return (
    <svg className='h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400' viewBox='0 0 20 20' fill='currentColor'>
      <path
        fillRule='evenodd'
        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
        clipRule='evenodd'
      />
    </svg>
  )
})

const ShieldIcon = memo(function ShieldIcon() {
  return (
    <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
      <path
        fillRule='evenodd'
        d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
        clipRule='evenodd'
      />
    </svg>
  )
})

const LockIcon = memo(function LockIcon() {
  return (
    <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
      <path
        fillRule='evenodd'
        d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
        clipRule='evenodd'
      />
    </svg>
  )
})

const CVVTooltip = memo(function CVVTooltip({
  isVisible,
  onClose,
  cardType
}: {
  isVisible: boolean
  onClose: () => void
  cardType: CardType
}) {
  const cvvLength = cardType === 'amex' ? 4 : 3
  const cvvLocation = cardType === 'amex' ? 'mặt trước thẻ' : 'mặt sau thẻ'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className='absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg bg-white p-4 shadow-xl border border-gray-200 dark:bg-slate-800 dark:border-slate-600'
        >
          <button
            onClick={onClose}
            className='absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
            aria-label='Đóng tooltip'
          >
            <svg className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
              <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
            </svg>
          </button>
          <p className='mb-3 text-sm font-medium text-gray-800 dark:text-gray-200'>CVV là gì?</p>
          <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
            Mã bảo mật {cvvLength} chữ số nằm ở {cvvLocation}
          </p>
          <div className='relative h-20 w-full rounded-lg bg-gradient-to-br from-gray-600 to-gray-800'>
            {cardType === 'amex' ? (
              <div className='absolute right-4 top-4'>
                <div className='rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-gray-800'>
                  {cvvLength} số
                </div>
              </div>
            ) : (
              <>
                <div className='absolute left-0 right-0 top-4 h-6 bg-gray-900' />
                <div className='absolute bottom-4 left-4 right-4 flex items-center justify-end'>
                  <div className='mr-2 h-4 w-24 rounded bg-white' />
                  <div className='rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-gray-800'>
                    {cvvLength} số
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

const CardFront = memo(function CardFront({
  cardNumber,
  cardHolder,
  expiryDate,
  cardType,
  gradient
}: {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cardType: CardType
  gradient: string
}) {
  const displayNumber = cardNumber || '•••• •••• •••• ••••'
  const displayHolder = cardHolder || 'CARDHOLDER NAME'
  const displayExpiry = expiryDate || 'MM/YY'

  return (
    <div
      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} p-6 text-white shadow-xl backface-hidden`}
      style={{ backfaceVisibility: 'hidden' }}
    >
      <div className='absolute right-6 top-6'>
        <CardTypeIcon type={cardType} />
      </div>
      <div className='absolute left-6 top-12 h-10 w-14 rounded bg-gradient-to-br from-yellow-300 to-yellow-500' />
      <div className='absolute bottom-20 left-6 right-6'>
        <p className='font-mono text-xl tracking-widest'>{displayNumber}</p>
      </div>
      <div className='absolute bottom-6 left-6 right-6 flex justify-between'>
        <div>
          <p className='text-xs uppercase text-white/70'>Card Holder</p>
          <p className='font-medium uppercase tracking-wide'>{displayHolder}</p>
        </div>
        <div className='text-right'>
          <p className='text-xs uppercase text-white/70'>Expires</p>
          <p className='font-medium'>{displayExpiry}</p>
        </div>
      </div>
    </div>
  )
})

const CardBack = memo(function CardBack({
  cvv,
  gradient,
  cardType
}: {
  cvv: string
  gradient: string
  cardType: CardType
}) {
  const cvvLength = cardType === 'amex' ? 4 : 3
  const displayCvv = cvv ? cvv.padEnd(cvvLength, '•') : '•'.repeat(cvvLength)

  return (
    <div
      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-xl`}
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
    >
      <div className='absolute left-0 right-0 top-8 h-12 bg-gray-900' />
      <div className='absolute left-6 right-6 top-24'>
        <div className='flex items-center'>
          <div className='h-10 flex-1 rounded bg-white/90' />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className='ml-2 flex h-10 w-16 items-center justify-center rounded bg-yellow-400 font-mono text-lg font-bold text-gray-800'
          >
            {displayCvv}
          </motion.div>
        </div>
        <p className='mt-2 text-right text-xs text-white/70'>CVV/CVC</p>
      </div>
      <div className='absolute bottom-6 left-6 right-6'>
        <div className='h-8 w-12 rounded bg-gradient-to-br from-gray-300 to-gray-400' />
      </div>
    </div>
  )
})

const VisualCardPreview = memo(function VisualCardPreview({
  cardNumber,
  cardHolder,
  expiryDate,
  cardType,
  cvv,
  isFlipped
}: {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cardType: CardType
  cvv: string
  isFlipped: boolean
}) {
  const gradientMap: Record<CardType, string> = {
    visa: 'from-blue-600 to-blue-800',
    mastercard: 'from-red-500 to-orange-600',
    jcb: 'from-green-500 to-teal-600',
    amex: 'from-blue-400 to-blue-600',
    unknown: 'from-gray-600 to-gray-800'
  }

  const gradient = gradientMap[cardType]

  return (
    <div className='h-48 w-full max-w-sm' style={{ perspective: '1000px' }}>
      <motion.div
        className='relative h-full w-full'
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <CardFront
          cardNumber={cardNumber}
          cardHolder={cardHolder}
          expiryDate={expiryDate}
          cardType={cardType}
          gradient={gradient}
        />
        <CardBack cvv={cvv} gradient={gradient} cardType={cardType} />
      </motion.div>
    </div>
  )
})

const SecurityBadges = memo(function SecurityBadges() {
  return (
    <div className='flex items-center justify-center gap-4 pt-4'>
      <div className='flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400'>
        <ShieldIcon />
        <span className='font-medium'>PCI DSS</span>
      </div>
      <div className='flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
        <LockIcon />
        <span className='font-medium'>SSL Secured</span>
      </div>
    </div>
  )
})

const shakeAnimation = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
}

const CreditCardForm = memo(function CreditCardForm({ register, errors, watch }: CreditCardFormProps) {
  const cardNumber = watch('cardNumber') || ''
  const cardHolder = watch('cardHolder') || ''
  const expiryDate = watch('expiryDate') || ''
  const cvv = watch('cvv') || ''

  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [showCvvTooltip, setShowCvvTooltip] = useState(false)
  const [validationState, setValidationState] = useState({
    cardNumber: { touched: false, isValid: false },
    expiryDate: { touched: false, isValid: false },
    cvv: { touched: false, isValid: false }
  })
  const [shakeFields, setShakeFields] = useState({
    cardNumber: false,
    expiryDate: false,
    cvv: false
  })

  const cardType = useMemo(() => detectCardType(cardNumber), [cardNumber])
  const formattedCardNumber = useMemo(() => formatCardNumber(cardNumber, cardType), [cardNumber, cardType])
  const formattedExpiry = useMemo(() => formatExpiryDate(expiryDate), [expiryDate])

  const handleCvvFocus = useCallback(() => {
    setIsCardFlipped(true)
  }, [])

  const handleCvvBlur = useCallback(() => {
    setIsCardFlipped(false)
    const cvvLength = cardType === 'amex' ? 4 : 3
    const isValid = cvv.length === cvvLength
    setValidationState(prev => ({
      ...prev,
      cvv: { touched: true, isValid }
    }))
    if (!isValid && cvv.length > 0) {
      setShakeFields(prev => ({ ...prev, cvv: true }))
      setTimeout(() => setShakeFields(prev => ({ ...prev, cvv: false })), 400)
    }
  }, [cardType, cvv])

  const handleCardNumberBlur = useCallback(() => {
    const cleanNumber = cardNumber.replace(/\s/g, '')
    const minLength = cardType === 'amex' ? 15 : 16
    const isValid = cleanNumber.length >= minLength && luhnValidate(cleanNumber)
    setValidationState(prev => ({
      ...prev,
      cardNumber: { touched: true, isValid }
    }))
    if (!isValid && cleanNumber.length > 0) {
      setShakeFields(prev => ({ ...prev, cardNumber: true }))
      setTimeout(() => setShakeFields(prev => ({ ...prev, cardNumber: false })), 400)
    }
  }, [cardNumber, cardType])

  const handleExpiryBlur = useCallback(() => {
    const isValid = isExpiryValid(expiryDate)
    setValidationState(prev => ({
      ...prev,
      expiryDate: { touched: true, isValid }
    }))
    if (!isValid && expiryDate.length > 0) {
      setShakeFields(prev => ({ ...prev, expiryDate: true }))
      setTimeout(() => setShakeFields(prev => ({ ...prev, expiryDate: false })), 400)
    }
  }, [expiryDate])

  const toggleCvvTooltip = useCallback(() => {
    setShowCvvTooltip(prev => !prev)
  }, [])

  const closeCvvTooltip = useCallback(() => {
    setShowCvvTooltip(false)
  }, [])

  return (
    <div className='space-y-4 md:space-y-6'>
      <div className='flex justify-center'>
        <VisualCardPreview
          cardNumber={formattedCardNumber}
          cardHolder={cardHolder}
          expiryDate={formattedExpiry}
          cardType={cardType}
          cvv={cvv}
          isFlipped={isCardFlipped}
        />
      </div>

      <div className='space-y-3 md:space-y-4'>
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>Số thẻ</label>
          <motion.div
            className='relative'
            animate={shakeFields.cardNumber ? 'shake' : ''}
            variants={shakeAnimation}
          >
            <Input
              type='text'
              placeholder='1234 5678 9012 3456'
              register={register}
              name='cardNumber'
              errorMessage={errors.cardNumber?.message}
              classNameInput={`w-full rounded-lg border px-2 py-2 md:px-3 md:py-3 pr-16 md:pr-20 focus:outline-none ${
                validationState.cardNumber.touched
                  ? validationState.cardNumber.isValid
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-orange'
              }`}
              maxLength={cardType === 'amex' ? 17 : 19}
              autoComplete='cc-number'
              onBlur={handleCardNumberBlur}
            />
            <div className='absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2'>
              {validationState.cardNumber.touched && validationState.cardNumber.isValid && (
                <CheckmarkIcon />
              )}
              <CardTypeIcon type={cardType} />
            </div>
          </motion.div>
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>Tên chủ thẻ</label>
          <Input
            type='text'
            placeholder='NGUYEN VAN A'
            register={register}
            name='cardHolder'
            errorMessage={errors.cardHolder?.message}
            classNameInput='w-full rounded-lg border border-gray-300 px-2 py-2 md:px-3 md:py-3 uppercase focus:border-orange focus:outline-none'
            autoComplete='cc-name'
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>Ngày hết hạn</label>
            <motion.div
              className='relative'
              animate={shakeFields.expiryDate ? 'shake' : ''}
              variants={shakeAnimation}
            >
              <Input
                type='text'
                placeholder='MM/YY'
                register={register}
                name='expiryDate'
                errorMessage={errors.expiryDate?.message}
                classNameInput={`w-full rounded-lg border px-2 py-2 md:px-3 md:py-3 pr-8 md:pr-10 focus:outline-none ${
                  validationState.expiryDate.touched
                    ? validationState.expiryDate.isValid
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-orange'
                }`}
                maxLength={5}
                autoComplete='cc-exp'
                onBlur={handleExpiryBlur}
              />
              {validationState.expiryDate.touched && validationState.expiryDate.isValid && (
                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                  <CheckmarkIcon />
                </div>
              )}
            </motion.div>
          </div>
          <div>
            <div className='mb-1 flex items-center gap-1'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>CVV</label>
              <div className='relative'>
                <button
                  type='button'
                  onClick={toggleCvvTooltip}
                  className='flex items-center'
                  aria-label='CVV là gì?'
                >
                  <InfoIcon />
                </button>
                <CVVTooltip
                  isVisible={showCvvTooltip}
                  onClose={closeCvvTooltip}
                  cardType={cardType}
                />
              </div>
            </div>
            <motion.div
              className='relative'
              animate={shakeFields.cvv ? 'shake' : ''}
              variants={shakeAnimation}
            >
              <Input
                type='password'
                placeholder={cardType === 'amex' ? '••••' : '•••'}
                register={register}
                name='cvv'
                errorMessage={errors.cvv?.message}
                classNameInput={`w-full rounded-lg border px-2 py-2 md:px-3 md:py-3 pr-8 md:pr-10 focus:outline-none ${
                  validationState.cvv.touched
                    ? validationState.cvv.isValid
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-orange'
                }`}
                maxLength={cardType === 'amex' ? 4 : 3}
                autoComplete='cc-csc'
                onFocus={handleCvvFocus}
                onBlur={handleCvvBlur}
              />
              {validationState.cvv.touched && validationState.cvv.isValid && (
                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                  <CheckmarkIcon />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <SecurityBadges />
    </div>
  )
})

export default CreditCardForm

