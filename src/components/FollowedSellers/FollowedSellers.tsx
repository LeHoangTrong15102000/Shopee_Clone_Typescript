import { memo } from 'react'
import { Link } from 'react-router'
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
      <div className={classNames('rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800', className)}>
        <h3 className='mb-4 text-base font-medium text-gray-900 sm:text-lg dark:text-gray-100'>Shop đang theo dõi</h3>
        <div className='py-8 text-center'>
          <svg
            className='mx-auto mb-4 h-12 w-12 text-gray-300 sm:h-16 sm:w-16 dark:text-gray-600'
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
          <p className='mb-2 text-sm text-gray-500 sm:text-base dark:text-gray-400'>Bạn chưa theo dõi shop nào</p>
          <p className='text-sm text-gray-400 dark:text-gray-500'>
            Theo dõi các shop yêu thích để nhận thông báo về sản phẩm mới
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={classNames('rounded-lg bg-white shadow-sm dark:bg-slate-800', className)}>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-100 p-4 dark:border-slate-700'>
        <h3 className='text-base font-medium text-gray-900 sm:text-lg dark:text-gray-100'>
          Shop đang theo dõi <span className='text-sm text-gray-500 dark:text-gray-400'>({followedCount})</span>
        </h3>
        {showClearAll && followedCount > 0 && (
          <button
            onClick={clearAllFollowed}
            className='text-sm text-red-500 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
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
        <div className='border-t border-gray-100 p-3 text-center sm:p-4 dark:border-slate-700'>
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
      className='flex items-center gap-3 p-3 transition-colors hover:bg-gray-50 sm:gap-4 sm:p-4 dark:hover:bg-slate-700'
    >
      {/* Avatar */}
      <div className='shrink-0'>
        <img
          src={seller.avatar || FALLBACK_IMAGES.avatar}
          alt={seller.name}
          className='h-10 w-10 rounded-full border border-gray-200 bg-gray-100 object-contain sm:h-12 sm:w-12 dark:border-slate-600 dark:bg-slate-700'
          onError={(e) => {
            const img = e.target as HTMLImageElement
            if (img.src !== FALLBACK_IMAGES.avatar) {
              img.src = FALLBACK_IMAGES.avatar
            }
          }}
        />
      </div>

      {/* Info */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <h4 className='truncate font-medium text-gray-900 dark:text-gray-100'>{seller.name}</h4>
          {seller.is_official && <span className='rounded-sm bg-orange px-1.5 py-0.5 text-xs text-white'>Mall</span>}
        </div>
        <div className='mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
          {seller.location && <span>{seller.location}</span>}
          {seller.products_count !== undefined && <span>{seller.products_count} sản phẩm</span>}
          {seller.rating !== undefined && (
            <span className='flex items-center gap-0.5'>
              <svg className='h-3 w-3 fill-current text-yellow-400' viewBox='0 0 20 20'>
                <path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
              </svg>
              {seller.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Follow Button */}
      <div className='shrink-0'>
        <SellerFollowButton seller={seller} size='sm' variant='outline' />
      </div>
    </motion.div>
  )
})

export default FollowedSellers
