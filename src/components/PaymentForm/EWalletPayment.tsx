import { memo, useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from 'src/components/Button'

type WalletType = 'momo' | 'zalopay' | 'vnpay'
type PaymentFlowState = 'select' | 'qr_display' | 'waiting' | 'success' | 'failed' | 'timeout'

interface WalletInfo {
  id: WalletType
  name: string
  color: string
  bgColor: string
  borderColor: string
  balance: number
  isLinked: boolean
  deepLink: string
}

interface EWalletPaymentProps {
  amount?: number
  onPaymentComplete?: () => void
  onPaymentFailed?: (error: string) => void
}

const WALLETS: WalletInfo[] = [
  {
    id: 'momo',
    name: 'MoMo',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-500',
    balance: 2500000,
    isLinked: true,
    deepLink: 'momo://payment'
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    balance: 1800000,
    isLinked: true,
    deepLink: 'zalopay://payment'
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    color: 'text-red-600',
    bgColor: 'bg-gradient-to-r from-red-50 to-blue-50',
    borderColor: 'border-red-500',
    balance: 3200000,
    isLinked: false,
    deepLink: 'vnpay://payment'
  }
]

const QR_EXPIRATION_SECONDS = 300

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

const WalletLogo = memo(function WalletLogo({ wallet }: { wallet: WalletType }) {
  const logoConfig: Record<WalletType, { gradient: string; text: string }> = {
    momo: { gradient: 'from-pink-500 to-pink-600', text: 'M' },
    zalopay: { gradient: 'from-blue-500 to-blue-600', text: 'Z' },
    vnpay: { gradient: 'from-red-500 to-blue-600', text: 'V' }
  }

  const config = logoConfig[wallet]

  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}
    >
      <span className='text-xl font-bold text-white'>{config.text}</span>
    </div>
  )
})

const LinkedBadge = memo(function LinkedBadge({ isLinked }: { isLinked: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isLinked
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
      }`}
    >
      {isLinked ? 'Đã liên kết' : 'Chưa liên kết'}
    </span>
  )
})

const WalletCard = memo(function WalletCard({
  wallet,
  isSelected,
  onSelect
}: {
  wallet: WalletInfo
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type='button'
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full rounded-xl border-2 p-4 text-left transition-all ${
        isSelected
          ? `${wallet.borderColor} ${wallet.bgColor}`
          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
      }`}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500'
        >
          <svg className='h-4 w-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </motion.div>
      )}

      <div className='flex items-center gap-3'>
        <WalletLogo wallet={wallet.id} />
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <span className={`font-semibold ${wallet.color}`}>{wallet.name}</span>
            <LinkedBadge isLinked={wallet.isLinked} />
          </div>
          <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
            Số dư: <span className='font-medium'>{formatCurrency(wallet.balance)}</span>
          </p>
        </div>
      </div>
    </motion.button>
  )
})

const LinkNewWalletButton = memo(function LinkNewWalletButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type='button'
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className='flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-4 text-gray-500 transition-all hover:border-gray-400 hover:text-gray-700 dark:border-slate-600 dark:text-gray-400 dark:hover:border-slate-500 dark:hover:text-gray-300'
    >
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
      </svg>
      <span className='font-medium'>Liên kết ví mới</span>
    </motion.button>
  )
})

const QRCodePlaceholder = memo(function QRCodePlaceholder({ walletName }: { walletName: string }) {
  return (
    <div className='relative'>
      <svg viewBox='0 0 200 200' className='h-48 w-48'>
        <rect fill='white' width='200' height='200' />
        {/* QR Code pattern simulation */}
        <g fill='#1a1a1a'>
          {/* Position detection patterns - top left */}
          <rect x='10' y='10' width='40' height='40' />
          <rect x='15' y='15' width='30' height='30' fill='white' />
          <rect x='20' y='20' width='20' height='20' />
          {/* Position detection patterns - top right */}
          <rect x='150' y='10' width='40' height='40' />
          <rect x='155' y='15' width='30' height='30' fill='white' />
          <rect x='160' y='20' width='20' height='20' />
          {/* Position detection patterns - bottom left */}
          <rect x='10' y='150' width='40' height='40' />
          <rect x='15' y='155' width='30' height='30' fill='white' />
          <rect x='20' y='160' width='20' height='20' />
          {/* Data modules - random pattern */}
          {Array.from({ length: 15 }, (_, i) =>
            Array.from({ length: 15 }, (_, j) => {
              const x = 55 + j * 6
              const y = 55 + i * 6
              const show = (i + j) % 3 !== 0 && Math.random() > 0.3
              return show ? <rect key={`${i}-${j}`} x={x} y={y} width='5' height='5' /> : null
            })
          )}
        </g>
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='rounded-lg bg-white p-1 shadow-sm dark:bg-slate-700'>
          <span className='text-xs font-bold text-gray-800 dark:text-gray-200'>{walletName}</span>
        </div>
      </div>
    </div>
  )
})

const CountdownTimer = memo(function CountdownTimer({ seconds, isExpired }: { seconds: number; isExpired: boolean }) {
  const progressPercent = (seconds / QR_EXPIRATION_SECONDS) * 100
  const isWarning = seconds <= 60

  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='relative h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700'>
        <motion.div
          className={`absolute left-0 top-0 h-full ${isWarning ? 'bg-red-500' : 'bg-green-500'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span
        className={`text-sm font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}
      >
        {isExpired ? 'Đã hết hạn' : `Còn lại: ${formatTime(seconds)}`}
      </span>
    </div>
  )
})

const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className='h-12 w-12 rounded-full border-4 border-gray-200 border-t-orange'
    />
  )
})

const SuccessAnimation = memo(function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className='flex h-20 w-20 items-center justify-center rounded-full bg-green-100'
    >
      <motion.svg
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='h-10 w-10 text-green-600'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <motion.path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
      </motion.svg>
    </motion.div>
  )
})

const FailedAnimation = memo(function FailedAnimation() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className='flex h-20 w-20 items-center justify-center rounded-full bg-red-100'
    >
      <svg className='h-10 w-10 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
      </svg>
    </motion.div>
  )
})

const WalletSelectionView = memo(function WalletSelectionView({
  selectedWallet,
  onSelectWallet,
  onLinkNewWallet,
  onProceed
}: {
  selectedWallet: WalletType | null
  onSelectWallet: (wallet: WalletType) => void
  onLinkNewWallet: () => void
  onProceed: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-4'
    >
      <h4 className='font-medium text-gray-900 dark:text-gray-100'>Chọn ví điện tử</h4>
      <div className='grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {WALLETS.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            isSelected={selectedWallet === wallet.id}
            onSelect={() => onSelectWallet(wallet.id)}
          />
        ))}
      </div>
      <LinkNewWalletButton onClick={onLinkNewWallet} />

      {selectedWallet && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className='pt-4'>
          <Button
            type='button'
            onClick={onProceed}
            className='w-full rounded-lg bg-orange px-6 py-3 text-white hover:bg-orange/90'
          >
            Tiếp tục thanh toán
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
})

const QRDisplayView = memo(function QRDisplayView({
  wallet,
  amount,
  timeRemaining,
  isMobile,
  onOpenApp,
  onCancel
}: {
  wallet: WalletInfo
  amount: number
  timeRemaining: number
  isMobile: boolean
  onOpenApp: () => void
  onCancel: () => void
}) {
  const isExpired = timeRemaining <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='flex flex-col items-center space-y-6'
    >
      <div className='text-center'>
        <h4 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Quét mã QR để thanh toán</h4>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Mở ứng dụng <span className={`font-semibold ${wallet.color}`}>{wallet.name}</span> và quét mã bên dưới
        </p>
      </div>

      <div className={`rounded-2xl border-4 ${wallet.borderColor} bg-white p-4 shadow-lg`}>
        <QRCodePlaceholder walletName={wallet.name} />
      </div>

      <div className='text-center'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>Số tiền thanh toán</p>
        <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{formatCurrency(amount)}</p>
      </div>

      <CountdownTimer seconds={timeRemaining} isExpired={isExpired} />

      <div className='w-full space-y-3'>
        {isMobile && (
          <Button
            type='button'
            onClick={onOpenApp}
            disabled={isExpired}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-white ${
              isExpired
                ? 'cursor-not-allowed bg-gray-400'
                : `bg-gradient-to-r ${
                    wallet.id === 'momo'
                      ? 'from-pink-500 to-pink-600'
                      : wallet.id === 'zalopay'
                        ? 'from-blue-500 to-blue-600'
                        : 'from-red-500 to-blue-600'
                  } hover:opacity-90`
            }`}
          >
            <WalletLogo wallet={wallet.id} />
            <span>Mở ứng dụng {wallet.name}</span>
          </Button>
        )}

        <Button
          type='button'
          onClick={onCancel}
          className='w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
        >
          Hủy thanh toán
        </Button>
      </div>

      <p className='text-center text-xs text-gray-400 dark:text-gray-500'>
        {isMobile
          ? `Nhấn nút "Mở ứng dụng ${wallet.name}" hoặc quét mã QR bằng ứng dụng ${wallet.name}`
          : `Quét mã QR bằng ứng dụng ${wallet.name} trên điện thoại của bạn`}
      </p>
    </motion.div>
  )
})

const WaitingView = memo(function WaitingView({ walletName }: { walletName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='flex flex-col items-center space-y-6 py-8'
    >
      <LoadingSpinner />
      <div className='text-center'>
        <h4 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Đang chờ thanh toán...</h4>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Vui lòng hoàn tất thanh toán trên ứng dụng {walletName}
        </p>
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'
      >
        <span className='h-2 w-2 rounded-full bg-orange' />
        <span>Đang xử lý giao dịch</span>
      </motion.div>
    </motion.div>
  )
})

const SuccessView = memo(function SuccessView({ amount }: { amount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='flex flex-col items-center space-y-6 py-8'
    >
      <SuccessAnimation />
      <div className='text-center'>
        <h4 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Thanh toán thành công!</h4>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Bạn đã thanh toán thành công {formatCurrency(amount)}
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className='rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400'
      >
        Đơn hàng của bạn đang được xử lý
      </motion.div>
    </motion.div>
  )
})

const FailedView = memo(function FailedView({
  message,
  onRetry,
  onCancel
}: {
  message: string
  onRetry: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='flex flex-col items-center space-y-6 py-8'
    >
      <FailedAnimation />
      <div className='text-center'>
        <h4 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Thanh toán thất bại</h4>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{message}</p>
      </div>
      <div className='flex w-full flex-col gap-3 sm:flex-row sm:justify-center'>
        <Button
          type='button'
          onClick={onRetry}
          className='rounded-lg bg-orange px-6 py-3 text-white hover:bg-orange/90'
        >
          Thử lại
        </Button>
        <Button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
        >
          Chọn phương thức khác
        </Button>
      </div>
    </motion.div>
  )
})

const TimeoutView = memo(function TimeoutView({
  onRegenerateQR,
  onCancel
}: {
  onRegenerateQR: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='flex flex-col items-center space-y-6 py-8'
    >
      <div className='flex h-20 w-20 items-center justify-center rounded-full bg-orange/10'>
        <svg className='h-10 w-10 text-orange' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      </div>
      <div className='text-center'>
        <h4 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Mã QR đã hết hạn</h4>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Mã QR thanh toán đã hết hạn. Vui lòng tạo mã mới để tiếp tục.
        </p>
      </div>
      <div className='flex w-full flex-col gap-3 sm:flex-row sm:justify-center'>
        <Button
          type='button'
          onClick={onRegenerateQR}
          className='rounded-lg bg-orange px-6 py-3 text-white hover:bg-orange/90'
        >
          Tạo mã QR mới
        </Button>
        <Button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
        >
          Hủy
        </Button>
      </div>
    </motion.div>
  )
})

const EWalletPayment = memo(function EWalletPayment({
  amount = 150000,
  onPaymentComplete,
  onPaymentFailed
}: EWalletPaymentProps) {
  const [flowState, setFlowState] = useState<PaymentFlowState>('select')
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(QR_EXPIRATION_SECONDS)
  const [errorMessage, setErrorMessage] = useState('')
  const isMobile = useIsMobile()

  const selectedWalletInfo = useMemo(() => WALLETS.find((w) => w.id === selectedWallet) || null, [selectedWallet])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (flowState === 'qr_display' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setFlowState('timeout')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [flowState, timeRemaining])

  const handleSelectWallet = useCallback((wallet: WalletType) => {
    setSelectedWallet(wallet)
  }, [])

  const handleLinkNewWallet = useCallback(() => {
    alert('Chức năng liên kết ví mới sẽ được triển khai sau')
  }, [])

  const handleProceedToQR = useCallback(() => {
    if (!selectedWallet) return
    setTimeRemaining(QR_EXPIRATION_SECONDS)
    setFlowState('qr_display')
  }, [selectedWallet])

  const handleOpenApp = useCallback(() => {
    if (!selectedWalletInfo) return

    // Simulate opening the app via deep link
    window.location.href = selectedWalletInfo.deepLink

    // After attempting to open app, show waiting state
    setTimeout(() => {
      setFlowState('waiting')

      // Simulate payment processing (for demo purposes)
      setTimeout(() => {
        const isSuccess = Math.random() > 0.3
        if (isSuccess) {
          setFlowState('success')
          onPaymentComplete?.()
        } else {
          setErrorMessage('Giao dịch bị từ chối bởi ví điện tử')
          setFlowState('failed')
          onPaymentFailed?.('Giao dịch bị từ chối')
        }
      }, 3000)
    }, 1000)
  }, [selectedWalletInfo, onPaymentComplete, onPaymentFailed])

  const handleCancel = useCallback(() => {
    setFlowState('select')
    setSelectedWallet(null)
    setTimeRemaining(QR_EXPIRATION_SECONDS)
    setErrorMessage('')
  }, [])

  const handleRetry = useCallback(() => {
    setErrorMessage('')
    setTimeRemaining(QR_EXPIRATION_SECONDS)
    setFlowState('qr_display')
  }, [])

  const handleRegenerateQR = useCallback(() => {
    setTimeRemaining(QR_EXPIRATION_SECONDS)
    setFlowState('qr_display')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className='rounded-lg bg-purple-50/50 p-4 dark:bg-purple-900/20'
    >
      <AnimatePresence mode='wait'>
        {flowState === 'select' && (
          <WalletSelectionView
            key='select'
            selectedWallet={selectedWallet}
            onSelectWallet={handleSelectWallet}
            onLinkNewWallet={handleLinkNewWallet}
            onProceed={handleProceedToQR}
          />
        )}

        {flowState === 'qr_display' && selectedWalletInfo && (
          <QRDisplayView
            key='qr_display'
            wallet={selectedWalletInfo}
            amount={amount}
            timeRemaining={timeRemaining}
            isMobile={isMobile}
            onOpenApp={handleOpenApp}
            onCancel={handleCancel}
          />
        )}

        {flowState === 'waiting' && selectedWalletInfo && (
          <WaitingView key='waiting' walletName={selectedWalletInfo.name} />
        )}

        {flowState === 'success' && <SuccessView key='success' amount={amount} />}

        {flowState === 'failed' && (
          <FailedView key='failed' message={errorMessage} onRetry={handleRetry} onCancel={handleCancel} />
        )}

        {flowState === 'timeout' && (
          <TimeoutView key='timeout' onRegenerateQR={handleRegenerateQR} onCancel={handleCancel} />
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export default EWalletPayment
export type { EWalletPaymentProps, WalletType, PaymentFlowState }
