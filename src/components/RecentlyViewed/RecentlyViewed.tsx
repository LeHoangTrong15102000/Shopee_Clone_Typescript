import { memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { RecentlyViewedProduct } from 'src/hooks/useRecentlyViewed'
import { formatCurrency, generateNameId } from 'src/utils/utils'
import path from 'src/constant/path'
import ProductRating from 'src/components/ProductRating'

interface RecentlyViewedProps {
  products: RecentlyViewedProduct[]
  maxItems?: number
  className?: string
  onRemove?: (productId: string) => void
  onClearAll?: () => void
}

function RecentlyViewed({ products, maxItems = 10, className = '', onRemove, onClearAll }: RecentlyViewedProps) {
  const displayProducts = products.slice(0, maxItems)

  if (displayProducts.length === 0) {
    return null
  }

  return (
    <section className={`bg-white dark:bg-slate-800 p-4 rounded-sm shadow ${className}`} aria-label='Sản phẩm đã xem gần đây'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-gray-500 dark:text-gray-400 uppercase text-sm font-medium'>Sản phẩm đã xem gần đây</h2>
        {onClearAll && displayProducts.length > 0 && (
          <button
            onClick={onClearAll}
            className='text-sm text-[#ee4d2d] hover:text-[#d73211] transition-colors'
            aria-label='Xóa tất cả sản phẩm đã xem'
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className='md:hidden overflow-x-auto scrollbar-hide' aria-live='polite'>
        <div className='flex gap-3' style={{ width: 'max-content' }} role='list' aria-label='Danh sách sản phẩm đã xem'>
          {displayProducts.map((product) => (
            <div key={product._id} className='relative w-32 flex-shrink-0' role='listitem'>
              <ProductCard product={product} onRemove={onRemove} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid 6 columns */}
      <div
        className='hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'
        role='list'
        aria-label='Danh sách sản phẩm đã xem'
        aria-live='polite'
      >
        {displayProducts.map((product) => (
          <div key={product._id} className='relative' role='listitem'>
            <ProductCard product={product} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </section>
  )
}

interface ProductCardProps {
  product: RecentlyViewedProduct
  onRemove?: (productId: string) => void
}

const ProductCard = memo(function ProductCard({ product, onRemove }: ProductCardProps) {
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onRemove?.(product._id)
    },
    [onRemove, product._id]
  )

  return (
    <article className='group relative bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-600 rounded-sm overflow-hidden hover:shadow-md transition-shadow'>
      {onRemove && (
        <button
          onClick={handleRemove}
          className='absolute top-1 right-1 z-10 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70'
          aria-label={`Xóa sản phẩm ${product.name} khỏi danh sách đã xem`}
        >
          <svg
            className='w-3 h-3 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      )}

      <Link
        to={`${path.home}${generateNameId({ name: product.name, id: product._id })}`}
        className='block'
        aria-label={`Xem chi tiết sản phẩm ${product.name}, giá ${formatCurrency(product.price)} đồng`}
      >
        <div className='relative pt-[100%]'>
          <img
            src={product.image}
            alt={`Hình ảnh sản phẩm ${product.name}`}
            className='absolute left-0 top-0 h-full w-full object-cover'
          />
        </div>
        <div className='p-2'>
          <h3 className='text-xs line-clamp-2 min-h-[2rem] text-gray-800 dark:text-gray-200'>{product.name}</h3>
          <div className='mt-1 flex items-center gap-1'>
            <span className='text-[#ee4d2d] text-sm font-medium'>₫{formatCurrency(product.price)}</span>
          </div>
          {product.price_before_discount > product.price && (
            <span className='text-xs text-gray-400 line-through'>
              ₫{formatCurrency(product.price_before_discount)}
            </span>
          )}
          <div className='mt-1 flex items-center gap-1'>
            <ProductRating
              rating={product.rating}
              activeClassname='h-2.5 w-2.5 fill-[#ee4d2d] text-[#ee4d2d]'
              nonActiveClassname='h-2.5 w-2.5 fill-current text-gray-300 dark:text-gray-600'
            />
            <span className='text-xs text-gray-500 dark:text-gray-400'>Đã bán {product.sold}</span>
          </div>
        </div>
      </Link>
    </article>
  )
})

export default memo(RecentlyViewed)

