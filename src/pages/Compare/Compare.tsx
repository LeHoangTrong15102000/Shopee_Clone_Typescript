import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
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
    <div className='min-h-screen bg-gray-100 py-4 sm:py-6 dark:bg-slate-900'>
      <Helmet>
        <title>So sánh sản phẩm | Shopee Clone</title>
        <meta name='description' content='So sánh các sản phẩm để tìm ra lựa chọn tốt nhất cho bạn' />
      </Helmet>

      <div className='container'>
        {/* Header */}
        <div className='mb-4 rounded-lg bg-white p-3 shadow-xs sm:mb-6 sm:p-4 md:p-6 dark:bg-slate-800 dark:shadow-slate-900/50'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-lg font-bold text-gray-800 sm:text-xl md:text-2xl dark:text-gray-100'>
                So sánh sản phẩm
              </h1>
              <p className='mt-1 text-sm text-gray-500 sm:text-base dark:text-gray-400'>
                {compareList.length > 0
                  ? `Đang so sánh ${compareList.length} sản phẩm`
                  : 'Thêm sản phẩm để bắt đầu so sánh'}
              </p>
            </div>
            {compareList.length > 0 && (
              <Link
                to={path.products}
                className='rounded-sm border border-orange px-3 py-1.5 text-sm text-orange transition-colors hover:bg-orange/5 sm:px-4 sm:py-2 sm:text-base dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400/10'
              >
                + Thêm sản phẩm
              </Link>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className='mb-4 rounded-lg bg-white p-3 shadow-xs sm:mb-6 sm:p-4 md:p-6 dark:bg-slate-800 dark:shadow-slate-900/50'>
          <ComparisonTable onAddToCart={handleAddToCart} />
        </div>

        {/* Recently Viewed Products */}
        <div className='rounded-lg bg-white p-3 shadow-xs sm:p-4 md:p-6 dark:bg-slate-800 dark:shadow-slate-900/50'>
          <h2 className='mb-4 text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-100'>
            Sản phẩm đã xem gần đây
          </h2>
          <RecentlyViewed products={recentlyViewed} maxItems={10} onRemove={removeProduct} onClearAll={clearAll} />
        </div>
      </div>
    </div>
  )
}

export default Compare
