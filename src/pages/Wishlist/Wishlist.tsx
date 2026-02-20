import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import wishlistApi from 'src/apis/wishlist.api'
import purchaseApi from 'src/apis/purchases.api'
import { formatCurrency, formatNumberToSocialStyle, generateNameId } from 'src/utils/utils'
import ProductRating from 'src/components/ProductRating'
import WishlistPriceAlert from 'src/components/WishlistPriceAlert'
import path from 'src/constant/path'
import { purchasesStatus } from 'src/constant/purchase'
import Button from 'src/components/Button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = wishlistItems.length
    const totalValue = wishlistItems.reduce((sum, item) => sum + item.product.price, 0)
    const totalSavings = wishlistItems.reduce(
      (sum, item) => sum + (item.product.price_before_discount - item.product.price),
      0
    )
    return { totalItems, totalValue, totalSavings }
  }, [wishlistItems])

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
      <div className='min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-200'>
        <div className='container'>
          <div className='flex h-64 items-center justify-center'>
            <div className='h-12 w-12 animate-spin rounded-full border-4 border-orange/30 border-t-orange dark:border-orange-400/30 dark:border-t-orange-400'></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200'>
      <Helmet>
        <title>Danh sách yêu thích | Shopee Clone</title>
        <meta name='description' content='Danh sách sản phẩm yêu thích của bạn' />
      </Helmet>

      {/* Hero Header Section */}
      <div className='bg-gradient-to-r from-orange via-orange/90 to-orange-500 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 py-8 md:py-12'>
        <div className='container'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div className='text-white dark:text-gray-100'>
              <div className='flex items-center gap-3 mb-2'>
                <svg className='h-8 w-8 md:h-10 md:w-10' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
                </svg>
                <h1 className='text-2xl md:text-3xl font-bold'>Danh sách yêu thích</h1>
              </div>
              <p className='text-white/80 dark:text-gray-300 text-sm md:text-base'>
                Lưu giữ những sản phẩm bạn yêu thích và theo dõi giá
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <Button
                variant='ghost'
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className='self-start md:self-center px-4 py-2 text-sm text-white dark:text-gray-200 border border-white/30 dark:border-slate-600 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700 transition-colors duration-200'
              >
                <svg className='h-4 w-4 mr-2 inline' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                </svg>
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time price monitoring for wishlist items */}
      <div className='container py-4'>
        <WishlistPriceAlert productIds={productIds} />
      </div>

      {/* Statistics Section */}
      {wishlistItems.length > 0 && (
        <div className='container pb-6'>
          <div className='grid grid-cols-3 gap-3 md:gap-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 transition-colors duration-200'
            >
              <div className='flex items-center gap-3'>
                <div className='p-2 md:p-3 bg-orange/10 dark:bg-orange-400/10 rounded-lg'>
                  <svg className='h-5 w-5 md:h-6 md:w-6 text-orange dark:text-orange-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                  </svg>
                </div>
                <div>
                  <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400'>Sản phẩm</p>
                  <p className='text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100'>{stats.totalItems}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 transition-colors duration-200'
            >
              <div className='flex items-center gap-3'>
                <div className='p-2 md:p-3 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg'>
                  <svg className='h-5 w-5 md:h-6 md:w-6 text-blue-500 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <div>
                  <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400'>Tổng giá trị</p>
                  <p className='text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100'>₫{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 transition-colors duration-200'
            >
              <div className='flex items-center gap-3'>
                <div className='p-2 md:p-3 bg-green-500/10 dark:bg-green-400/10 rounded-lg'>
                  <svg className='h-5 w-5 md:h-6 md:w-6 text-green-500 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <div>
                  <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400'>Tiết kiệm</p>
                  <p className='text-lg md:text-2xl font-bold text-green-600 dark:text-green-400'>₫{formatCurrency(stats.totalSavings)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <div className='container pb-8'>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='rounded-xl bg-white dark:bg-slate-800 p-12 md:p-16 text-center shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 transition-colors duration-200'
          >
            <div className='mx-auto mb-6 w-32 h-32 md:w-40 md:h-40 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center'>
              <svg className='h-16 w-16 md:h-20 md:w-20 text-gray-300 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
              </svg>
            </div>
            <h3 className='text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2'>Chưa có sản phẩm yêu thích</h3>
            <p className='mb-6 text-gray-500 dark:text-gray-400 max-w-md mx-auto'>
              Hãy khám phá và thêm những sản phẩm bạn yêu thích vào danh sách để theo dõi giá và mua sắm dễ dàng hơn
            </p>
            <Link
              to={path.home}
              className='inline-flex items-center gap-2 rounded-lg bg-orange dark:bg-orange-500 px-8 py-3 text-white font-medium transition-all duration-200 hover:bg-orange/90 dark:hover:bg-orange-400 hover:shadow-lg'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
              </svg>
              Mua sắm ngay
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode='wait'>
            <motion.div
              className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              variants={containerVariants}
              initial='hidden'
              animate='visible'
            >
              {wishlistItems.map((item) => (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                  className='group overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg dark:hover:shadow-slate-900/70 hover:-translate-y-1'
                >
                  <Link
                    to={`${path.home}${generateNameId({ name: item.product.name, id: item.product._id })}`}
                    className='block'
                  >
                    <div className='relative pt-[100%] overflow-hidden'>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className='absolute left-0 top-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                      />
                      {/* Discount badge */}
                      {item.product.price_before_discount > item.product.price && (
                        <div className='absolute top-2 left-2 bg-orange dark:bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded'>
                          -{Math.round(((item.product.price_before_discount - item.product.price) / item.product.price_before_discount) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className='p-3'>
                      <h3 className='mb-2 min-h-[2.5rem] text-sm line-clamp-2 text-gray-800 dark:text-gray-100 group-hover:text-orange dark:group-hover:text-orange-400 transition-colors duration-200'>
                        {item.product.name}
                      </h3>
                      <div className='mb-2 flex flex-wrap items-center gap-1'>
                        <span className='font-semibold text-orange dark:text-orange-400'>₫{formatCurrency(item.product.price)}</span>
                        {item.product.price_before_discount > item.product.price && (
                          <span className='text-xs text-gray-400 dark:text-gray-500 line-through'>
                            ₫{formatCurrency(item.product.price_before_discount)}
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                        <ProductRating rating={item.product.rating} />
                        <span>Đã bán {formatNumberToSocialStyle(item.product.sold)}</span>
                      </div>
                    </div>
                  </Link>
                  <div className='flex gap-2 p-3 pt-0 border-t border-gray-100 dark:border-slate-700'>
                    <Button
                      variant='primary'
                      onClick={() => addToCartMutation.mutate(item.product._id)}
                      disabled={addToCartMutation.isPending}
                      className='flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-200'
                    >
                      <svg className='h-4 w-4 mr-1 inline' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
                      </svg>
                      Thêm giỏ
                    </Button>
                    <Button
                      variant='secondary'
                      onClick={() => removeMutation.mutate(item.product._id)}
                      disabled={removeMutation.isPending}
                      className='rounded-lg px-3 py-2 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800'
                      title='Xóa khỏi yêu thích'
                    >
                      <svg className='h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

