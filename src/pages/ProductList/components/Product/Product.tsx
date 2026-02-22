import { Fragment, memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductRating from 'src/components/ProductRating'
import OptimizedImage from 'src/components/OptimizedImage'
import WishlistButton from 'src/components/WishlistButton'
import path from 'src/constant/path'
import { Product as ProductType } from 'src/types/product.type'
import { formatCurrency, formatNumberToSocialStyle, generateNameId } from 'src/utils/utils'
import { scrollManager } from 'src/hooks/useScrollRestoration'
import { useHoverPrefetch } from 'src/hooks/useHoverPrefetch'
import NotFound from 'src/pages/NotFound'

interface Props {
  product: ProductType
}

const Product = ({ product }: Props) => {
  const navigate = useNavigate()

  // Hover prefetching với optimal strategy
  const {
    handleMouseEnter,
    handleMouseLeave,
    handleClick: handlePrefetchClick,
    isPrefetched
  } = useHoverPrefetch(product._id, {
    delay: 300, // 300ms delay cho balance tốt
    strategy: 'delayed', // Sử dụng delayed strategy
    enabled: true
  })

  const handleProductClick = useCallback(() => {
    // Trigger prefetch nếu chưa prefetch
    handlePrefetchClick()

    // Lưu vị trí scroll hiện tại trước khi navigate
    scrollManager.savePosition(window.location.pathname, window.location.search, window.scrollY)

    // Navigate đến product detail
    navigate(`${path.home}${generateNameId({ name: product.name, id: product._id })}`)
  }, [navigate, product.name, product._id, handlePrefetchClick])

  return (
    // Khi nhấn vào thì truyền lên cái _id của sản phẩm
    <Fragment>
      {product ? (
        <motion.div
          role="link"
          tabIndex={0}
          aria-label={`${product.name} - ₫${formatCurrency(product.price)}`}
          onClick={handleProductClick}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleProductClick(); } }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange ${isPrefetched ? 'ring-1 ring-orange-200' : ''}`}
          whileHover={{
            y: -5,
            transition: { duration: 0.2 }
          }}
        >
          <div className='overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/20 hover:shadow-md transition-shadow h-full'>
            {/* Ảnh sản phẩm */}
            <motion.div
              className='relative w-full overflow-hidden'
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <OptimizedImage
                src={product.image}
                alt={product.name}
                aspectRatio='1:1'
                loading='lazy'
                className='rounded-tl-sm rounded-tr-sm bg-white dark:bg-slate-700 transition-transform duration-300 hover:scale-110'
                showSkeleton={true}
                blurPlaceholder={true}
              />
              {/* Nút yêu thích */}
              <div className='absolute top-2 right-2 z-10'>
                <WishlistButton
                  productId={product._id}
                  productName={product.name}
                  size='sm'
                />
              </div>
            </motion.div>
            {/* Thông tin sản phẩm */}
            <div className='overflow-hidden p-2'>
              <div className='min-h-[1.9rem] text-xs sm:text-sm line-clamp-2 dark:text-gray-200'>{product.name}</div>
              {/* price */}
              <div className='mt-3 flex items-center' aria-label={`Giá gốc ${formatCurrency(product.price_before_discount)} đồng, giá khuyến mãi ${formatCurrency(product.price)} đồng`}>
                <div className='max-w-[50%] truncate text-gray-500 dark:text-gray-400 line-through' aria-label={`Giá gốc ${formatCurrency(product.price_before_discount)} đồng`}>
                  <span className='text-xs'>₫</span>
                  <span className='text-xs sm:text-sm'>{formatCurrency(product.price_before_discount)}</span>
                </div>
                <div className='ml-[5px] max-w-[50%] truncate text-orange dark:text-orange-400' aria-label={`Giá khuyến mãi ${formatCurrency(product.price)} đồng`}>
                  <span className='text-xs'>₫</span>
                  <span className='text-xs sm:text-sm'>{formatCurrency(product.price)}</span>
                </div>
              </div>
              {/* rating start */}
              <div className='mt-3 flex items-center justify-start'>
                {/* chứa ngôi sao */}
                <ProductRating rating={product.rating} />
                {/* số lượng bán */}
                <div className='ml-2 text-xs sm:text-sm dark:text-gray-300'>
                  <span className=''>Đã bán</span>
                  <span className='ml-1'>{formatNumberToSocialStyle(product.sold)}</span>
                </div>
              </div>
            </div>
            {/* Đia điểm bán */}
            <div className='p-2'>
              <div className='flex items-center justify-start'>
                <span className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>{product.location}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <NotFound />
      )}
    </Fragment>
  )
}

export default memo(Product)
