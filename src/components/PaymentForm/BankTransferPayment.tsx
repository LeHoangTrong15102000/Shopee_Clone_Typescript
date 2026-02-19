import { memo, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Button from 'src/components/Button'

type BankId = 'vcb' | 'tcb' | 'bidv' | 'vtb' | 'mb' | 'acb' | 'stb' | 'tpb'
type PaymentState = 'select_bank' | 'payment_info' | 'verification_pending' | 'expired'

interface BankInfo {
  id: BankId
  name: string
  shortName: string
  color: string
  bgColor: string
  accountNumber: string
  accountHolder: string
  branch: string
}

interface BankTransferPaymentProps {
  amount?: number
  orderId?: string
  onPaymentConfirmed?: () => void
  onPaymentExpired?: () => void
}

const BANKS: BankInfo[] = [
  { id: 'vcb', name: 'Vietcombank', shortName: 'VCB', color: 'text-green-700', bgColor: 'bg-green-50', accountNumber: '1234567890123', accountHolder: 'CONG TY SHOPEE CLONE', branch: 'Chi nhánh Hà Nội' },
  { id: 'tcb', name: 'Techcombank', shortName: 'TCB', color: 'text-red-600', bgColor: 'bg-red-50', accountNumber: '19035678901234', accountHolder: 'CONG TY SHOPEE CLONE', branch: 'Chi nhánh HCM' },
  { id: 'bidv', name: 'BIDV', shortName: 'BIDV', color: 'text-blue-700', bgColor: 'bg-blue-50', accountNumber: '31410001234567', accountHolder: 'CONG TY SHOPEE CLONE', branch: 'Chi nhánh Đống Đa' },
  { id: 'vtb', name: 'VietinBank', shortName: 'CTG', color: 'text-blue-800', bgColor: 'bg-blue-50', accountNumber: '108001234567', accountHolder: 'CONG TY SHOPEE CLONE', branch: 'Chi nhánh Cầu Giấy' },
  { id: 'mb', name: 'MB Bank', shortName: 'MB', color: 'text-purple-700', bgColor: 'bg-purple-50', accountNumber: '0801234567890', accountHolder: 'CONG TY SHOPEE CLONE', branch: 'Chi nhánh Thanh Xuân' },
  { id: 'acb', name: 'ACB', shortName: 'ACB', color: 'text-blue-600', bgColor: 'bg-blue-50', accountNumber: '12345678901', accountHolder: 'CONG TY SHOPEE CLONE', branch: 'Chi nhánh Tân Bình' },
  { id: 'stb', name: 'Sacombank', shortName: 'STB', color: 'text-blue-500', bgColor: 'bg-cyan-50', accountNumber: '060123456789', accountHolder: 'CONG TY SHOPEE CLONE', branch: 'Chi nhánh Quận 1' },
  { id: 'tpb', name: 'TPBank', shortName: 'TPB', color: 'text-purple-600', bgColor: 'bg-purple-50', accountNumber: '01234567890', accountHolder: 'CONG TY SHOPEE CLONE', branch: 'Chi nhánh Hoàn Kiếm' }
]

const PAYMENT_DEADLINE_HOURS = 24
const PAYMENT_DEADLINE_SECONDS = PAYMENT_DEADLINE_HOURS * 60 * 60
const WARNING_THRESHOLD_SECONDS = 60 * 60
const LOCAL_STORAGE_KEY = 'shopee_last_selected_bank'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const formatTime = (seconds: number): { hours: number; minutes: number; secs: number } => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return { hours, minutes, secs }
}

const generateTransferContent = (orderId: string): string => {
  return `SHOPEE ${orderId.toUpperCase()}`
}

// Bank Logo Component
const BankLogo = memo(function BankLogo({ bank, size = 'md' }: { bank: BankInfo; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base'
  }

  const gradientMap: Record<BankId, string> = {
    vcb: 'from-green-500 to-green-700',
    tcb: 'from-red-500 to-red-700',
    bidv: 'from-blue-600 to-blue-800',
    vtb: 'from-blue-700 to-blue-900',
    mb: 'from-purple-500 to-purple-700',
    acb: 'from-blue-400 to-blue-600',
    stb: 'from-cyan-500 to-blue-600',
    tpb: 'from-purple-400 to-purple-600'
  }

  return (
    <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${gradientMap[bank.id]} ${sizeClasses[size]} font-bold text-white shadow-md`}>
      {bank.shortName}
    </div>
  )
})

// Searchable Bank Dropdown
const BankDropdown = memo(function BankDropdown({
  selectedBank,
  onSelectBank,
  isOpen,
  onToggle
}: {
  selectedBank: BankInfo | null
  onSelectBank: (bank: BankInfo) => void
  isOpen: boolean
  onToggle: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return BANKS
    const query = searchQuery.toLowerCase()
    return BANKS.filter(
      (bank) =>
        bank.name.toLowerCase().includes(query) ||
        bank.shortName.toLowerCase().includes(query)
    )
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onToggle])

  const handleSelectBank = useCallback((bank: BankInfo) => {
    onSelectBank(bank)
    setSearchQuery('')
    onToggle()
  }, [onSelectBank, onToggle])

  return (
    <div ref={dropdownRef} className='relative'>
      <button
        type='button'
        onClick={onToggle}
        className='flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-left transition-all hover:border-blue-300 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-400'
      >
        {selectedBank ? (
          <div className='flex items-center gap-3'>
            <BankLogo bank={selectedBank} size='sm' />
            <div>
              <p className={`font-medium ${selectedBank.color}`}>{selectedBank.name}</p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>{selectedBank.shortName}</p>
            </div>
          </div>
        ) : (
          <span className='text-gray-500 dark:text-gray-400'>Chọn ngân hàng...</span>
        )}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className='h-5 w-5 text-gray-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className='absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-800'
          >
            <div className='border-b border-gray-100 p-3 dark:border-slate-700'>
              <div className='relative'>
                <svg className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Tìm ngân hàng...'
                  className='w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-gray-200'
                  autoFocus
                />
              </div>
            </div>
            <div className='max-h-64 overflow-y-auto p-2'>
              {filteredBanks.length > 0 ? (
                filteredBanks.map((bank) => (
                  <motion.button
                    key={bank.id}
                    type='button'
                    onClick={() => handleSelectBank(bank)}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      selectedBank?.id === bank.id ? bank.bgColor : ''
                    }`}
                  >
                    <BankLogo bank={bank} size='sm' />
                    <div className='flex-1'>
                      <p className={`font-medium ${bank.color}`}>{bank.name}</p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>{bank.shortName}</p>
                    </div>
                    {selectedBank?.id === bank.id && (
                      <svg className='h-5 w-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                      </svg>
                    )}
                  </motion.button>
                ))
              ) : (
                <p className='py-4 text-center text-sm text-gray-500 dark:text-gray-400'>Không tìm thấy ngân hàng</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// VietQR Code Component
const VietQRCode = memo(function VietQRCode({ bank, amount, transferContent: _transferContent }: { bank: BankInfo; amount: number; transferContent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className='flex flex-col items-center'
    >
      <div className='relative rounded-2xl border-4 border-blue-500 bg-white p-4 shadow-lg'>
        <svg viewBox='0 0 200 200' className='h-48 w-48'>
          <rect fill='white' width='200' height='200' />
          <g fill='#1a1a1a'>
            <rect x='10' y='10' width='40' height='40' />
            <rect x='15' y='15' width='30' height='30' fill='white' />
            <rect x='20' y='20' width='20' height='20' />
            <rect x='150' y='10' width='40' height='40' />
            <rect x='155' y='15' width='30' height='30' fill='white' />
            <rect x='160' y='20' width='20' height='20' />
            <rect x='10' y='150' width='40' height='40' />
            <rect x='15' y='155' width='30' height='30' fill='white' />
            <rect x='20' y='160' width='20' height='20' />
            {Array.from({ length: 12 }, (_, i) =>
              Array.from({ length: 12 }, (_, j) => {
                const x = 58 + j * 7
                const y = 58 + i * 7
                const show = ((i + j) % 2 === 0 || (i * j) % 3 === 0) && Math.random() > 0.25
                return show ? <rect key={`${i}-${j}`} x={x} y={y} width='6' height='6' /> : null
              })
            )}
          </g>
        </svg>
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='rounded-lg bg-white p-1 shadow-sm'>
            <BankLogo bank={bank} size='sm' />
          </div>
        </div>
      </div>
      <div className='mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
        <svg className='h-5 w-5 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' />
        </svg>
        <span>Quét mã VietQR để thanh toán</span>
      </div>
      <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>Mã QR đã bao gồm số tiền {formatCurrency(amount)}</p>
    </motion.div>
  )
})

// Copy Button Component
const CopyButton = memo(function CopyButton({ text, label }: { text: string; label: string }) {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`Đã sao chép ${label}`, { autoClose: 1500, position: 'top-center' })
    } catch {
      toast.error('Không thể sao chép', { autoClose: 1500, position: 'top-center' })
    }
  }, [text, label])

  return (
    <motion.button
      type='button'
      onClick={handleCopy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className='rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-slate-600 dark:hover:text-gray-200'
      title={`Sao chép ${label}`}
    >
      <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
      </svg>
    </motion.button>
  )
})

// Account Info Card Component
const AccountInfoCard = memo(function AccountInfoCard({ bank, amount, transferContent }: { bank: BankInfo; amount: number; transferContent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl ${bank.bgColor} p-4 shadow-sm`}
    >
      <h4 className={`mb-4 font-semibold ${bank.color}`}>Thông tin chuyển khoản</h4>
      <div className='space-y-3'>
        <div className='flex items-center justify-between rounded-lg bg-white/80 px-3 py-2'>
          <div>
            <p className='text-xs text-gray-500'>Ngân hàng</p>
            <p className='font-medium text-gray-800'>{bank.name}</p>
          </div>
          <BankLogo bank={bank} size='sm' />
        </div>
        <div className='flex items-center justify-between rounded-lg bg-white/80 px-3 py-2'>
          <div>
            <p className='text-xs text-gray-500'>Số tài khoản</p>
            <p className='font-mono font-medium text-gray-800'>{bank.accountNumber}</p>
          </div>
          <CopyButton text={bank.accountNumber} label='số tài khoản' />
        </div>
        <div className='flex items-center justify-between rounded-lg bg-white/80 px-3 py-2'>
          <div>
            <p className='text-xs text-gray-500'>Chủ tài khoản</p>
            <p className='font-medium text-gray-800'>{bank.accountHolder}</p>
          </div>
          <CopyButton text={bank.accountHolder} label='tên chủ tài khoản' />
        </div>
        <div className='flex items-center justify-between rounded-lg bg-white/80 px-3 py-2'>
          <div>
            <p className='text-xs text-gray-500'>Số tiền</p>
            <p className='font-semibold text-orange'>{formatCurrency(amount)}</p>
          </div>
          <CopyButton text={amount.toString()} label='số tiền' />
        </div>
        <div className='flex items-center justify-between rounded-lg bg-white/80 px-3 py-2'>
          <div>
            <p className='text-xs text-gray-500'>Nội dung chuyển khoản</p>
            <p className='font-mono font-semibold text-blue-600'>{transferContent}</p>
          </div>
          <CopyButton text={transferContent} label='nội dung chuyển khoản' />
        </div>
      </div>
      <p className='mt-4 text-xs text-gray-500'>
        <span className='text-red-500'>*</span> Vui lòng nhập chính xác nội dung chuyển khoản để đơn hàng được xử lý tự động
      </p>
    </motion.div>
  )
})

// Countdown Timer Component
const CountdownTimer = memo(function CountdownTimer({
  seconds,
  onExpired
}: {
  seconds: number
  onExpired: () => void
}) {
  const isWarning = seconds <= WARNING_THRESHOLD_SECONDS && seconds > 0
  const isExpired = seconds <= 0
  const { hours, minutes, secs } = formatTime(Math.max(0, seconds))

  useEffect(() => {
    if (isExpired) {
      onExpired()
    }
  }, [isExpired, onExpired])

  const progressPercent = (seconds / PAYMENT_DEADLINE_SECONDS) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 ${isExpired ? 'bg-red-50' : isWarning ? 'bg-orange-50' : 'bg-blue-50'}`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <svg className={`h-5 w-5 ${isExpired ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-blue-500'}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <span className={`text-sm font-medium ${isExpired ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-blue-700'}`}>
            {isExpired ? 'Đã hết hạn thanh toán' : 'Thời hạn thanh toán'}
          </span>
        </div>
        {!isExpired && (
          <div className='flex items-center gap-1 font-mono text-lg font-bold'>
            <span className={`rounded px-2 py-1 ${isWarning ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>
              {hours.toString().padStart(2, '0')}
            </span>
            <span className={isWarning ? 'text-orange-600' : 'text-blue-600'}>:</span>
            <span className={`rounded px-2 py-1 ${isWarning ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>
              {minutes.toString().padStart(2, '0')}
            </span>
            <span className={isWarning ? 'text-orange-600' : 'text-blue-600'}>:</span>
            <span className={`rounded px-2 py-1 ${isWarning ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>
              {secs.toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {!isExpired && (
        <div className='mt-3'>
          <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
            <motion.div
              className={`h-full ${isWarning ? 'bg-orange-500' : 'bg-blue-500'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {isWarning && !isExpired && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='mt-2 flex items-center gap-1 text-xs text-orange-600'
        >
          <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
          </svg>
          Sắp hết hạn! Vui lòng hoàn tất chuyển khoản ngay.
        </motion.p>
      )}

      {isExpired && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='mt-2 text-sm text-red-600'
        >
          Đơn hàng đã bị hủy do quá thời hạn thanh toán. Vui lòng đặt hàng lại.
        </motion.p>
      )}
    </motion.div>
  )
})

// Upload Receipt Component (UI Only)
const UploadReceipt = memo(function UploadReceipt({
  onFileSelect
}: {
  onFileSelect: (file: File | null) => void
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    onFileSelect(file)

    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }, [onFileSelect])

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null)
    setPreviewUrl(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onFileSelect])

  return (
    <div className='space-y-3'>
      <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>Tải lên biên lai chuyển khoản (không bắt buộc)</p>

      {!selectedFile ? (
        <motion.label
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className='flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/30'
        >
          <svg className='mb-2 h-10 w-10 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
          </svg>
          <span className='text-sm text-gray-600 dark:text-gray-400'>Nhấn để tải ảnh biên lai</span>
          <span className='mt-1 text-xs text-gray-400 dark:text-gray-500'>PNG, JPG tối đa 5MB</span>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='hidden'
          />
        </motion.label>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='relative rounded-xl border border-gray-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800'
        >
          <div className='flex items-center gap-3'>
            {previewUrl && (
              <img src={previewUrl} alt='Receipt preview' className='h-16 w-16 rounded-lg object-cover' />
            )}
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>{selectedFile.name}</p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type='button'
              onClick={handleRemoveFile}
              className='rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
})

// Verification Pending View
const VerificationPendingView = memo(function VerificationPendingView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center space-y-4 py-8'
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'
      >
        <svg className='h-8 w-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      </motion.div>
      <div className='text-center'>
        <h4 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Đang xác minh thanh toán</h4>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Chúng tôi đang kiểm tra giao dịch của bạn. Quá trình này có thể mất vài phút.
        </p>
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className='flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-600'
      >
        <span className='h-2 w-2 rounded-full bg-blue-500' />
        <span>Đang xử lý...</span>
      </motion.div>
    </motion.div>
  )
})

// Main BankTransferPayment Component
const BankTransferPayment = memo(function BankTransferPayment({
  amount = 500000,
  orderId = 'ORD' + Date.now().toString().slice(-8),
  onPaymentConfirmed,
  onPaymentExpired
}: BankTransferPaymentProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>('select_bank')
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(PAYMENT_DEADLINE_SECONDS)
  const [_receiptFile, setReceiptFile] = useState<File | null>(null)

  const transferContent = useMemo(() => generateTransferContent(orderId), [orderId])

  // Load last selected bank from localStorage
  useEffect(() => {
    const savedBankId = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedBankId) {
      const bank = BANKS.find((b) => b.id === savedBankId)
      if (bank) setSelectedBank(bank)
    }
  }, [])

  // Save selected bank to localStorage
  useEffect(() => {
    if (selectedBank) {
      localStorage.setItem(LOCAL_STORAGE_KEY, selectedBank.id)
    }
  }, [selectedBank])

  // Countdown timer
  useEffect(() => {
    if (paymentState === 'expired') return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentState])

  const handleSelectBank = useCallback((bank: BankInfo) => {
    setSelectedBank(bank)
  }, [])

  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev)
  }, [])

  const handleProceedToPayment = useCallback(() => {
    if (selectedBank) {
      setPaymentState('payment_info')
    }
  }, [selectedBank])

  const handleConfirmTransfer = useCallback(() => {
    setPaymentState('verification_pending')
    onPaymentConfirmed?.()
  }, [onPaymentConfirmed])

  const handleExpired = useCallback(() => {
    setPaymentState('expired')
    onPaymentExpired?.()
  }, [onPaymentExpired])

  const handleFileSelect = useCallback((file: File | null) => {
    setReceiptFile(file)
  }, [])

  // Bank Selection View
  if (paymentState === 'select_bank') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className='space-y-6'
      >
        <div className='rounded-xl bg-blue-50 p-4 dark:bg-blue-900/30'>
          <h4 className='font-medium text-blue-900 dark:text-blue-300'>Chuyển khoản ngân hàng</h4>
          <p className='mt-1 text-sm text-blue-700 dark:text-blue-200'>
            Chọn ngân hàng bạn muốn chuyển khoản để nhận thông tin tài khoản
          </p>
        </div>

        <div className='space-y-4'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Chọn ngân hàng</label>
          <BankDropdown
            selectedBank={selectedBank}
            onSelectBank={handleSelectBank}
            isOpen={isDropdownOpen}
            onToggle={handleToggleDropdown}
          />
        </div>

        {selectedBank && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className='pt-2'
          >
            <Button
              type='button'
              onClick={handleProceedToPayment}
              className='w-full rounded-xl bg-orange px-6 py-3 font-medium text-white hover:bg-orange/90'
            >
              Tiếp tục
            </Button>
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Verification Pending View
  if (paymentState === 'verification_pending') {
    return <VerificationPendingView />
  }

  // Expired View
  if (paymentState === 'expired') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='flex flex-col items-center space-y-4 py-8'
      >
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
          <svg className='h-8 w-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        </div>
        <div className='text-center'>
          <h4 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Đơn hàng đã hết hạn</h4>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Thời hạn thanh toán đã hết. Vui lòng đặt hàng lại.
          </p>
        </div>
      </motion.div>
    )
  }

  // Payment Info View (main view with QR, account info, timer)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
    >
      <CountdownTimer seconds={timeRemaining} onExpired={handleExpired} />

      {selectedBank && (
        <>
          <div className='grid gap-6 lg:grid-cols-2'>
            <VietQRCode bank={selectedBank} amount={amount} transferContent={transferContent} />
            <AccountInfoCard bank={selectedBank} amount={amount} transferContent={transferContent} />
          </div>

          <UploadReceipt onFileSelect={handleFileSelect} />

          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button
              type='button'
              onClick={() => setPaymentState('select_bank')}
              className='flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
            >
              Đổi ngân hàng
            </Button>
            <Button
              type='button'
              onClick={handleConfirmTransfer}
              className='flex-1 rounded-xl bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700'
            >
              <span className='flex items-center justify-center gap-2'>
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                Tôi đã chuyển khoản
              </span>
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
})

export default BankTransferPayment

