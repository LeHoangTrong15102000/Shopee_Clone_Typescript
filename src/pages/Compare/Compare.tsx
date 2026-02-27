import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import ComparisonTable from 'src/components/ComparisonTable'
import RecentlyViewed from 'src/components/RecentlyViewed'
import { useProductComparison } from 'src/hooks/useProductComparison'
import { useRecentlyViewed } from 'src/hooks/useRecentlyViewed'
import { useOptimisticAddToCart } from 'src/hooks/optimistic'
import { Product } from 'src/types/product.type'
import path from 'src/constant/path'

const Compare = () => {
  const { compareList } = useProductComparison()
  const { recentlyViewed, removeProduct, clearAll } = useRecentlyViewed()
  const addToCartMutation = useOptimisticAddToCart()

  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate({
      product_id: product._id,
      buy_count: 1
    })
  }

  return (
    <div className='bg-gray-100 dark:bg-slate-900 py-4 sm:py-6 min-h-screen'>
      <Helmet>
        <title>So sánh sản phẩm | Shopee Clone</title>
        <meta name='description' content='So sánh các sản phẩm để tìm ra lựa chọn tốt nhất cho bạn' />
      </Helmet>

      <div className='container'>
        {/* Header */}
        <div className='bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-slate-900/50 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100'>
                So sánh sản phẩm
              </h1>
              <p className='text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1'>
                {compareList.length > 0
                  ? `Đang so sánh ${compareList.length} sản phẩm`
                  : 'Thêm sản phẩm để bắt đầu so sánh'}
              </p>
            </div>
            {compareList.length > 0 && (
              <Link
                to={path.products}
                className='px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base border border-orange dark:border-orange-400 text-orange dark:text-orange-400 rounded hover:bg-orange/5 dark:hover:bg-orange-400/10 transition-colors'
              >
                + Thêm sản phẩm
              </Link>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className='bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-slate-900/50 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6'>
          <ComparisonTable onAddToCart={handleAddToCart} />
        </div>

        {/* Recently Viewed Products */}
        <div className='bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-slate-900/50 p-3 sm:p-4 md:p-6'>
          <h2 className='text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4'>
            Sản phẩm đã xem gần đây
          </h2>
          <RecentlyViewed products={recentlyViewed} maxItems={10} onRemove={removeProduct} onClearAll={clearAll} />
        </div>
      </div>
    </div>
  )
}

export default Compare
