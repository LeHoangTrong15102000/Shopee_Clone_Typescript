import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import classNames from 'classnames'
import { FollowedSeller } from 'src/types/seller.type'
import useSellerFollowing from 'src/hooks/useSellerFollowing'
import SellerFollowButton from 'src/components/SellerFollowButton'
import { FALLBACK_IMAGES } from 'src/utils/imageUtils'

interface FollowedSellersProps {
  className?: string
  maxDisplay?: number
  showClearAll?: boolean
}

const FollowedSellers = memo(function FollowedSellers({
  className,
  maxDisplay = 10,
  showClearAll = true
}: FollowedSellersProps) {
  const { followedSellers, followedCount, clearAllFollowed } = useSellerFollowing()

  const displayedSellers = followedSellers.slice(0, maxDisplay)

  if (followedCount === 0) {
    return (
      <div className={classNames('bg-white dark:bg-slate-800 rounded-lg shadow p-6', className)}>
        <h3 className='text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-4'>Shop đang theo dõi</h3>
        <div className='text-center py-8'>
          <svg
            className='w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
            />
          </svg>
          <p className='text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-2'>Bạn chưa theo dõi shop nào</p>
          <p className='text-sm text-gray-400 dark:text-gray-500'>
            Theo dõi các shop yêu thích để nhận thông báo về sản phẩm mới
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={classNames('bg-white dark:bg-slate-800 rounded-lg shadow', className)}>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700'>
        <h3 className='text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100'>
          Shop đang theo dõi <span className='text-sm text-gray-500 dark:text-gray-400'>({followedCount})</span>
        </h3>
        {showClearAll && followedCount > 0 && (
          <button
            onClick={clearAllFollowed}
            className='text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors'
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Seller List */}
      <div className='divide-y divide-gray-100 dark:divide-slate-700'>
        <AnimatePresence mode='popLayout'>
          {displayedSellers.map((seller) => (
            <SellerCard key={seller._id} seller={seller} />
          ))}
        </AnimatePresence>
      </div>

      {/* Show more link */}
      {followedCount > maxDisplay && (
        <div className='p-3 sm:p-4 border-t border-gray-100 dark:border-slate-700 text-center'>
          <Link to='/user/followed-shop' className='text-sm text-orange hover:underline'>
            Xem tất cả {followedCount} shop →
          </Link>
        </div>
      )}
    </div>
  )
})

// Seller Card Component
const SellerCard = memo(function SellerCard({ seller }: { seller: FollowedSeller }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='flex items-center gap-3 p-3 sm:gap-4 sm:p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors'
    >
      {/* Avatar */}
      <div className='flex-shrink-0'>
        <img
          src={seller.avatar || FALLBACK_IMAGES.avatar}
          alt={seller.name}
          className='w-10 h-10 sm:w-12 sm:h-12 rounded-full object-contain border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700'
          onError={(e) => {
            const img = e.target as HTMLImageElement
            if (img.src !== FALLBACK_IMAGES.avatar) {
              img.src = FALLBACK_IMAGES.avatar
            }
          }}
        />
      </div>

      {/* Info */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <h4 className='font-medium text-gray-900 dark:text-gray-100 truncate'>{seller.name}</h4>
          {seller.is_official && <span className='px-1.5 py-0.5 bg-orange text-white text-xs rounded'>Mall</span>}
        </div>
        <div className='flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400'>
          {seller.location && <span>{seller.location}</span>}
          {seller.products_count !== undefined && <span>{seller.products_count} sản phẩm</span>}
          {seller.rating !== undefined && (
            <span className='flex items-center gap-0.5'>
              <svg className='w-3 h-3 text-yellow-400 fill-current' viewBox='0 0 20 20'>
                <path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
              </svg>
              {seller.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Follow Button */}
      <div className='flex-shrink-0'>
        <SellerFollowButton seller={seller} size='sm' variant='outline' />
      </div>
    </motion.div>
  )
})

export default FollowedSellers
