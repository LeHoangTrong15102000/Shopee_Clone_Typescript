import { memo, useCallback } from 'react'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { Seller } from 'src/types/seller.type'
import useSellerFollowing from 'src/hooks/useSellerFollowing'

interface SellerFollowButtonProps {
  seller: Seller
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  variant?: 'default' | 'outline' | 'text'
}

const SellerFollowButton = memo(function SellerFollowButton({
  seller,
  className,
  size = 'md',
  showIcon = true,
  variant = 'default'
}: SellerFollowButtonProps) {
  const { isFollowing, followSeller, unfollowSeller } = useSellerFollowing()
  const isFollowed = isFollowing(seller._id)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (isFollowed) {
        unfollowSeller(seller._id)
        toast.info(`Đã bỏ theo dõi ${seller.name}`, { autoClose: 2000, position: 'top-center' })
      } else {
        followSeller(seller)
        toast.success(`Đã theo dõi ${seller.name}`, { autoClose: 2000, position: 'top-center' })
      }
    },
    [isFollowed, seller, followSeller, unfollowSeller]
  )

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const variantClasses = {
    default: isFollowed
      ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'
      : 'bg-[#ee4d2d] text-white border border-[#ee4d2d] hover:bg-[#ee4d2d]/90',
    outline: isFollowed
      ? 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
      : 'bg-white dark:bg-slate-800 text-[#ee4d2d] dark:text-orange-400 border border-[#ee4d2d] dark:border-orange-400 hover:bg-[#ee4d2d]/5 dark:hover:bg-orange-400/10',
    text: isFollowed
      ? 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
      : 'text-[#ee4d2d] dark:text-orange-400 hover:text-[#ee4d2d]/80 dark:hover:text-orange-300'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <motion.button
      type='button'
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      className={classNames(
        'inline-flex items-center justify-center gap-1.5 rounded-xs font-medium transition-colors',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={isFollowed ? `Bỏ theo dõi ${seller.name}` : `Theo dõi ${seller.name}`}
      aria-pressed={isFollowed}
    >
      {showIcon && (
        <svg
          className={iconSizeClasses[size]}
          fill={isFollowed ? 'currentColor' : 'none'}
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          {isFollowed ? (
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          ) : (
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          )}
        </svg>
      )}
      <span>{isFollowed ? 'Đang theo dõi' : 'Theo dõi'}</span>
    </motion.button>
  )
})

export default SellerFollowButton
