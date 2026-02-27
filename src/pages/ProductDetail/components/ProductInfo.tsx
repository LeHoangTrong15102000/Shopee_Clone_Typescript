import { motion } from 'framer-motion'
import ProductRating from 'src/components/ProductRating'
import ShareButton from 'src/components/ShareButton'
import ViewerCountBadge from 'src/components/ViewerCountBadge'
import LivePriceTag from 'src/components/LivePriceTag'
import { Product as ProductType } from 'src/types/product.type'
import { formatCurrency, formatNumberToSocialStyle, rateSale } from 'src/utils/utils'
import { staggerItem } from 'src/styles/animations'

interface ProductInfoProps {
  product: ProductType
  reducedMotion: boolean
  livePrice: number | null
  livePriceBeforeDiscount: number | null
  priceHasChanged: boolean
  previousPrice: number | null
  viewerCount: number
  isPopular: boolean
  infoContainerVariants: any
}

const ProductInfo = ({
  product,
  reducedMotion,
  livePrice,
  livePriceBeforeDiscount,
  priceHasChanged,
  previousPrice,
  viewerCount,
  isPopular,
  infoContainerVariants
}: ProductInfoProps) => {
  return (
    <motion.div
      variants={reducedMotion ? undefined : infoContainerVariants}
      initial={reducedMotion ? undefined : 'hidden'}
      animate={reducedMotion ? undefined : 'visible'}
    >
      {/* Title */}
      <motion.div variants={reducedMotion ? undefined : staggerItem}>
        <h1 className='text-xl font-medium capitalize text-gray-900 dark:text-gray-100'>{product?.name}</h1>
      </motion.div>
      {/* Viewer count badge - real-time */}
      <motion.div variants={reducedMotion ? undefined : staggerItem}>
        <ViewerCountBadge viewerCount={viewerCount} isPopular={isPopular} className='mt-2' />
      </motion.div>
      {/* Rating and Stats */}
      <motion.div variants={reducedMotion ? undefined : staggerItem}>
        <div className='mt-6 flex items-center'>
          {/* Rating */}
          <div className='flex items-center'>
            <span className='mr-1 border-b border-b-orange text-orange dark:text-orange-400'>{product?.rating}</span>
            <ProductRating
              rating={product?.rating}
              activeClassname='h-4 w-4 fill-orange text-orange dark:text-orange-400'
              nonActiveClassname='h-4 w-4 fill-current text-gray-300 dark:text-gray-600'
            />
          </div>
          <div className='mx-4 h-7 w-[1px] bg-gray-300/80 dark:bg-slate-600'></div>
          {/* Reviews */}
          <div className='flex items-center'>
            <span className='mr-1 border-b border-b-black/90 dark:border-b-gray-300 text-black/90 dark:text-gray-200'>
              3k
            </span>
            <span className='text-sm capitalize text-black/60 dark:text-gray-400'>Đánh giá</span>
          </div>
          <div className='mx-4 h-7 w-[1px] bg-gray-300/80 dark:bg-slate-600'></div>
          {/* Sold */}
          <div className='flex items-center'>
            <span className='mr-1 text-black/90 dark:text-gray-200'>{formatNumberToSocialStyle(product.sold)}</span>
            <span className='text-sm capitalize text-black/60 dark:text-gray-400'>Đã bán</span>
          </div>
          {/* Share & Report */}
          <div className='ml-auto flex items-center gap-3'>
            <ShareButton
              url={window.location.href}
              title={product.name}
              description={product.description?.slice(0, 150)}
              image={product.image}
            />
            <button className='text-sm text-black/60 dark:text-gray-400 hover:text-orange dark:hover:text-orange-400 transition-colors'>
              Tố cáo
            </button>
          </div>
        </div>
      </motion.div>
      {/* Price Section - Live Price Updates */}
      <motion.div variants={reducedMotion ? undefined : staggerItem}>
        <div className='mt-3 bg-[#fafafa] dark:bg-slate-700'>
          <div className='flex flex-col items-start justify-center px-4 py-3 md:px-5 md:py-4'>
            <div className='flex items-center'>
              <div className='flex min-h-[1.875rem] w-full flex-wrap items-center'>
                {/* Original Price */}
                <div
                  className='mr-3 text-sm md:text-base text-[#929292] dark:text-gray-400 line-through'
                  aria-label={`Giá gốc ${formatCurrency(livePriceBeforeDiscount ?? product?.price_before_discount)} đồng`}
                >
                  ₫{formatCurrency(livePriceBeforeDiscount ?? product?.price_before_discount)}
                </div>
                {/* Live Price Tag */}
                <div className='flex items-center'>
                  <LivePriceTag
                    currentPrice={product?.price}
                    livePrice={livePrice}
                    previousPrice={previousPrice}
                    hasChanged={priceHasChanged}
                    priceBeforeDiscount={livePriceBeforeDiscount ?? product?.price_before_discount}
                    className='text-xl md:text-[1.875rem]'
                  />
                  <div className='ml-4 rounded bg-orange py-0.5 px-1 text-xs font-semibold uppercase text-white'>
                    {rateSale(livePrice ?? product?.price, livePriceBeforeDiscount ?? product?.price_before_discount)}{' '}
                    giảm
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-3 flex items-center'></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProductInfo
