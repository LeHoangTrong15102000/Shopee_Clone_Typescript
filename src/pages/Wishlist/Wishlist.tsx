import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { toast } from 'react-toastify'
import wishlistApi from 'src/apis/wishlist.api'
import purchaseApi from 'src/apis/purchases.api'
import { formatCurrency, formatNumberToSocialStyle, generateNameId } from 'src/utils/utils'
import ProductRating from 'src/components/ProductRating'
import PriceDropBadge from 'src/components/PriceDropBadge'
import WishlistPriceAlert from 'src/components/WishlistPriceAlert'
import path from 'src/constant/path'
import { purchasesStatus } from 'src/constant/purchase'
import Button from 'src/components/Button'

export default function Wishlist() {
  const queryClient = useQueryClient()

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getWishlist({ page: 1, limit: 50 })
  })

  // Memoize wishlist items to prevent unnecessary re-renders
  const wishlistItems = useMemo(() => wishlistData?.data.data.wishlist ?? [], [wishlistData])

  // Extract product IDs for real-time price monitoring
  const productIds = useMemo(() => wishlistItems.map((item) => item.product._id), [wishlistItems])

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Đã xóa khỏi danh sách yêu thích')
    }
  })

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => purchaseApi.addToCart({ product_id: productId, buy_count: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
      toast.success('Đã thêm vào giỏ hàng')
    }
  })

  const clearMutation = useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Đã xóa tất cả sản phẩm yêu thích')
    }
  })

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100 dark:bg-slate-900 py-8'>
        <div className='container'>
          <div className='flex h-64 items-center justify-center'>
            <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-[#ee4d2d]'></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-slate-900 py-8'>
      <Helmet>
        <title>Danh sách yêu thích | Shopee Clone</title>
        <meta name='description' content='Danh sách sản phẩm yêu thích của bạn' />
      </Helmet>

      <div className='container'>
        {/* Real-time price monitoring for wishlist items */}
        <WishlistPriceAlert productIds={productIds} />

        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-100'>Danh sách yêu thích ({wishlistItems.length})</h1>
          {wishlistItems.length > 0 && (
            <Button
              variant='ghost'
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              className='text-sm text-orange dark:text-orange-400 hover:underline'
            >
              Xóa tất cả
            </Button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className='rounded-sm bg-white dark:bg-slate-800 p-16 text-center shadow-sm dark:shadow-slate-900/50'>
            <img
              src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/9bdd8040b334d31946f49e36beaf32db.png'
              alt='Empty wishlist'
              className='mx-auto mb-4 h-32 w-32'
            />
            <p className='mb-4 text-gray-500 dark:text-gray-400'>Chưa có sản phẩm yêu thích</p>
            <Link
              to={path.home}
              className='inline-block rounded-sm bg-[#ee4d2d] px-8 py-2 text-white transition-colors hover:bg-[#d73211]'
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'>
            {wishlistItems.map((item) => (
              <div key={item._id} className='group overflow-hidden rounded-sm bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/50'>
                <Link
                  to={`${path.home}${generateNameId({ name: item.product.name, id: item.product._id })}`}
                  className='block'
                >
                  <div className='relative pt-[100%]'>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className='absolute left-0 top-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  </div>
                  <div className='p-2'>
                    <h3 className='mb-1 min-h-[2.5rem] text-sm line-clamp-2 text-gray-800 dark:text-gray-100'>{item.product.name}</h3>
                    <div className='mb-1 flex flex-wrap items-center gap-1'>
                      <span className='font-medium text-[#ee4d2d]'>₫{formatCurrency(item.product.price)}</span>
                      {item.product.price_before_discount > item.product.price && (
                        <>
                          <span className='text-xs text-gray-400 dark:text-gray-500 line-through'>
                            ₫{formatCurrency(item.product.price_before_discount)}
                          </span>
                          <PriceDropBadge
                            originalPrice={item.product.price_before_discount}
                            currentPrice={item.product.price}
                          />
                        </>
                      )}
                    </div>
                    <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                      <ProductRating rating={item.product.rating} />
                      <span>Đã bán {formatNumberToSocialStyle(item.product.sold)}</span>
                    </div>
                  </div>
                </Link>
                <div className='flex gap-2 p-2 pt-0'>
                  <Button
                    variant='primary'
                    onClick={() => addToCartMutation.mutate(item.product._id)}
                    disabled={addToCartMutation.isPending}
                    className='flex-1 rounded-sm py-2 text-xs'
                  >
                    Thêm vào giỏ
                  </Button>
                  <Button
                    variant='secondary'
                    onClick={() => removeMutation.mutate(item.product._id)}
                    disabled={removeMutation.isPending}
                    className='rounded-sm px-3 py-2'
                    title='Xóa khỏi yêu thích'
                  >
                    <svg className='h-4 w-4 text-gray-500 dark:text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

