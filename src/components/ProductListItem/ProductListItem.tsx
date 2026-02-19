import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductRating from 'src/components/ProductRating'
import OptimizedImage from 'src/components/OptimizedImage'
import WishlistButton from 'src/components/WishlistButton'
import path from 'src/constant/path'
import { Product } from 'src/types/product.type'
import { formatCurrency, formatNumberToSocialStyle, generateNameId } from 'src/utils/utils'
import { scrollManager } from 'src/hooks/useScrollRestoration'
import { useReducedMotion } from 'src/hooks/useReducedMotion'

interface ProductListItemProps {
  product: Product
}

const ProductListItem = ({ product }: ProductListItemProps) => {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  const handleProductClick = useCallback(() => {
    // Lưu vị trí scroll hiện tại trước khi navigate
    scrollManager.savePosition(window.location.pathname, window.location.search, window.scrollY)

    // Navigate đến product detail
    navigate(`${path.home}${generateNameId({ name: product.name, id: product._id })}`)
  }, [navigate, product.name, product._id])

  const hoverAnimation = prefersReducedMotion
    ? {}
    : {
        y: -2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 }
      }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleProductClick()
    }
  }

  return (
    <motion.div
      onClick={handleProductClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='link'
      aria-label={`${product.name} - ₫${formatCurrency(product.price)}`}
      className='flex bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-slate-900/20 hover:shadow-md transition-shadow overflow-hidden cursor-pointer relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'
      whileHover={hoverAnimation}
    >
      {/* Product Image - Left side */}
      <div className='w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex-shrink-0 relative'>
        <OptimizedImage
          src={product.image}
          alt={product.name}
          aspectRatio='1:1'
          loading='lazy'
          className='w-full h-full object-cover'
          showSkeleton={true}
          blurPlaceholder={true}
        />
        {/* Wishlist Button */}
        <div className='absolute top-2 right-2 z-10'>
          <WishlistButton
            productId={product._id}
            productName={product.name}
            size='sm'
          />
        </div>
      </div>

      {/* Product Info - Right side */}
      <div className='flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0'>
        {/* Product Name */}
        <div>
          <h3 className='text-sm sm:text-base font-medium line-clamp-2 text-gray-800 mb-2'>
            {product.name}
          </h3>

          {/* Price Section */}
          <div className='flex items-center gap-2 mb-2'>
            {product.price_before_discount > product.price && (
              <span className='text-gray-400 line-through text-xs sm:text-sm'>
                <span>₫</span>
                {formatCurrency(product.price_before_discount)}
              </span>
            )}
            <span className='text-[#ee4d2d] font-semibold text-sm sm:text-lg'>
              <span className='text-xs sm:text-sm'>₫</span>
              {formatCurrency(product.price)}
            </span>
            {product.price_before_discount > product.price && (
              <span className='bg-[#ee4d2d] text-white text-xs px-1 py-0.5 rounded'>
                -{Math.round(((product.price_before_discount - product.price) / product.price_before_discount) * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Rating and Sold */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4'>
          <div className='flex items-center gap-1'>
            <ProductRating rating={product.rating} />
            <span className='text-xs text-gray-500'>({product.rating.toFixed(1)})</span>
          </div>
          <div className='text-xs sm:text-sm text-gray-500'>
            <span>Đã bán </span>
            <span className='font-medium'>{formatNumberToSocialStyle(product.sold)}</span>
          </div>
        </div>

        {/* Location */}
        <div className='mt-2 flex items-center text-xs sm:text-sm text-gray-500'>
          <svg
            className='w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
            />
          </svg>
          <span className='truncate'>{product.location}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default memo(ProductListItem)

