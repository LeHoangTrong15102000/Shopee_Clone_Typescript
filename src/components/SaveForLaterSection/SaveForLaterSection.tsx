import { memo, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { differenceInDays } from 'date-fns'
import { SavedItem } from 'src/hooks/useSaveForLater'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { formatCurrency, generateNameId } from 'src/utils/utils'
import ImageWithFallback from 'src/components/ImageWithFallback'
import path from 'src/constant/path'

interface SaveForLaterSectionProps {
  savedItems: SavedItem[]
  onMoveToCart: (item: SavedItem) => void
  onRemove: (productId: string) => void
  onClear: () => void
}

// Bookmark icon component
const BookmarkIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className={className}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z' />
  </svg>
)

// Calculate days since saved
const getDaysSinceSaved = (savedAt: string): string => {
  const days = differenceInDays(new Date(), new Date(savedAt))
  if (days === 0) return 'Hôm nay'
  if (days === 1) return 'Hôm qua'
  return `${days} ngày trước`
}

const SaveForLaterSection = memo(({ savedItems, onMoveToCart, onRemove, onClear }: SaveForLaterSectionProps) => {
  const prefersReducedMotion = useReducedMotion()
  const [isExpanded, setIsExpanded] = useState(savedItems.length > 0)

  // Animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 }
    }
  }), [prefersReducedMotion])

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      x: -20,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 }
    }
  }), [prefersReducedMotion])

  if (savedItems.length === 0) {
    return (
      <div className='bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mt-6'>
        <div className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
          <BookmarkIcon className='w-5 h-5' />
          <span className='font-medium'>Đã lưu để mua sau</span>
        </div>
        <div className='flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500'>
          <BookmarkIcon className='w-12 h-12 mb-3 opacity-50' />
          <p>Chưa có sản phẩm nào được lưu</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mt-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-[#ee4d2d] transition-colors'
        >
          <BookmarkIcon className='w-5 h-5 text-[#ee4d2d]' />
          <span className='font-medium'>Đã lưu để mua sau ({savedItems.length})</span>
          <motion.svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            className='w-4 h-4'
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' />
          </motion.svg>
        </button>
        {savedItems.length > 0 && (
          <button
            onClick={onClear}
            className='text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors'
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Saved Items List */}
      <AnimatePresence mode='wait'>
        {isExpanded && (
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='space-y-3 overflow-hidden'
          >
            <AnimatePresence mode='popLayout'>
              {savedItems.map((item) => (
                <motion.div
                  key={item.product._id}
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  layout
                  className='flex gap-3 p-3 border border-gray-100 dark:border-slate-700 rounded-lg hover:border-gray-200 dark:hover:border-slate-600 transition-colors'
                >
                  {/* Product Image */}
                  <Link
                    to={`${path.home}${generateNameId({ name: item.product.name, id: item.product._id })}`}
                    className='h-20 w-20 flex-shrink-0'
                  >
                    <ImageWithFallback
                      src={item.product.image}
                      alt={item.product.name}
                      className='h-full w-full object-cover rounded'
                      loading='lazy'
                    />
                  </Link>

                  {/* Product Details */}
                  <div className='flex-1 min-w-0'>
                    <Link
                      to={`${path.home}${generateNameId({ name: item.product.name, id: item.product._id })}`}
                      className='line-clamp-2 text-sm text-gray-800 dark:text-gray-200 hover:text-[#ee4d2d] transition-colors'
                    >
                      {item.product.name}
                    </Link>

                    {/* Price */}
                    <div className='mt-1 flex items-center gap-2 text-sm'>
                      <span className='text-gray-400 dark:text-gray-500 line-through'>
                        ₫{formatCurrency(item.product.price_before_discount)}
                      </span>
                      <span className='text-[#ee4d2d] font-medium'>
                        ₫{formatCurrency(item.product.price)}
                      </span>
                    </div>

                    {/* Saved time */}
                    <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
                      Đã lưu {getDaysSinceSaved(item.savedAt)} • SL: {item.originalBuyCount}
                    </p>

                    {/* Action Buttons */}
                    <div className='mt-2 flex items-center gap-3'>
                      <motion.button
                        onClick={() => onMoveToCart(item)}
                        className='px-3 py-1.5 text-sm bg-[#ee4d2d] text-white rounded hover:bg-[#d73211] transition-colors'
                        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                      >
                        Thêm vào giỏ
                      </motion.button>
                      <button
                        onClick={() => onRemove(item.product._id)}
                        className='text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors'
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

SaveForLaterSection.displayName = 'SaveForLaterSection'

export default SaveForLaterSection

