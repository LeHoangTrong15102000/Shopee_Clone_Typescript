import { memo, useCallback, useMemo } from 'react'
import { Link } from 'react-router'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { Product } from 'src/types/product.type'
import { useProductComparison } from 'src/hooks/useProductComparison'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { formatCurrency, formatNumberToSocialStyle, generateNameId } from 'src/utils/utils'
import ProductRating from 'src/components/ProductRating'
import path from 'src/constant/path'

interface ComparisonTableProps {
  className?: string
  onAddToCart?: (product: Product) => void
}

interface BestValues {
  bestPrice: number
  bestRating: number
  bestSold: number
  bestDiscount: number
  bestStock: number
  recommendedProductId: string | null
}

// Helper function to calculate discount percentage
const getDiscountPercent = (product: Product): number => {
  if (product.price_before_discount <= product.price) return 0
  return Math.round(((product.price_before_discount - product.price) / product.price_before_discount) * 100)
}

// Helper function to determine the "best" value for each attribute
const getBestValues = (products: Product[]): BestValues | null => {
  if (products.length < 2) return null

  const prices = products.map((p) => p.price)
  const ratings = products.map((p) => p.rating)
  const soldCounts = products.map((p) => p.sold)
  const discounts = products.map((p) => getDiscountPercent(p))
  const stocks = products.map((p) => p.quantity)

  const maxPrice = Math.max(...prices)
  const maxSold = Math.max(...soldCounts)

  // Calculate recommendation score for each product
  const scores = products.map((product) => {
    const discount = getDiscountPercent(product)
    const priceScore = maxPrice > 0 ? (1 - product.price / maxPrice) * 30 : 0
    const ratingScore = (product.rating / 5) * 30
    const soldScore = maxSold > 0 ? (product.sold / maxSold) * 20 : 0
    const discountScore = (discount / 100) * 20
    return priceScore + ratingScore + soldScore + discountScore
  })

  const maxScore = Math.max(...scores)
  const recommendedIndex = scores.indexOf(maxScore)

  return {
    bestPrice: Math.min(...prices),
    bestRating: Math.max(...ratings),
    bestSold: Math.max(...soldCounts),
    bestDiscount: Math.max(...discounts),
    bestStock: Math.max(...stocks),
    recommendedProductId: products[recommendedIndex]?._id || null
  }
}

// Badge component with optional animation
interface BestBadgeProps {
  label: string
  reduceMotion: boolean
}

const BestBadge = ({ label, reduceMotion }: BestBadgeProps) => {
  const badgeContent = (
    <span className='ml-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400'>
      ⭐ {label}
    </span>
  )

  if (reduceMotion) {
    return badgeContent
  }

  return (
    <motion.span
      className='ml-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400'
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      ⭐ {label}
    </motion.span>
  )
}

function ComparisonTable({ className, onAddToCart }: ComparisonTableProps) {
  const { compareList, removeFromCompare, clearCompare } = useProductComparison()
  const reduceMotion = useReducedMotion()

  // Calculate best values using useMemo
  const bestValues = useMemo(() => getBestValues(compareList), [compareList])

  // Generate comparison summary
  const comparisonSummary = useMemo(() => {
    if (!bestValues || compareList.length < 2) return null

    const summaryParts: { text: string; productName: string; color: string }[] = []

    // Find product with best price
    const bestPriceProduct = compareList.find((p) => p.price === bestValues.bestPrice)
    if (bestPriceProduct) {
      summaryParts.push({
        text: 'có giá tốt nhất',
        productName: bestPriceProduct.name,
        color: 'text-green-600'
      })
    }

    // Find product with best rating
    const bestRatingProduct = compareList.find((p) => p.rating === bestValues.bestRating)
    if (bestRatingProduct && bestRatingProduct._id !== bestPriceProduct?._id) {
      summaryParts.push({
        text: 'có đánh giá cao nhất',
        productName: bestRatingProduct.name,
        color: 'text-blue-600'
      })
    }

    // Find product with most sold
    const bestSoldProduct = compareList.find((p) => p.sold === bestValues.bestSold)
    if (
      bestSoldProduct &&
      bestSoldProduct._id !== bestPriceProduct?._id &&
      bestSoldProduct._id !== bestRatingProduct?._id
    ) {
      summaryParts.push({
        text: 'bán chạy nhất',
        productName: bestSoldProduct.name,
        color: 'text-orange-600'
      })
    }

    return summaryParts
  }, [bestValues, compareList])

  const handleAddToCart = useCallback(
    (product: Product) => {
      onAddToCart?.(product)
    },
    [onAddToCart]
  )

  if (compareList.length === 0) {
    return (
      <div className={classNames('py-12 text-center', className)} role='region' aria-label='Bảng so sánh sản phẩm'>
        <svg
          className='mx-auto h-16 w-16 text-gray-400 dark:text-gray-500'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          aria-hidden='true'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
        <p className='mt-4 text-gray-500 dark:text-gray-400' aria-live='polite'>
          Chưa có sản phẩm nào để so sánh
        </p>
        <Link to={path.home} className='mt-4 inline-block text-orange hover:underline'>
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className={classNames('overflow-x-auto', className)} role='region' aria-label='Bảng so sánh sản phẩm'>
      {/* Comparison Summary */}
      {comparisonSummary && comparisonSummary.length > 0 && (
        <div className='mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-900/20'>
          <span className='font-medium text-gray-700 dark:text-gray-200'>Tóm tắt so sánh: </span>
          {comparisonSummary.map((item, index) => (
            <span key={index}>
              <span className={classNames('font-medium', item.color)}>{item.productName}</span>
              <span className='text-gray-600 dark:text-gray-300'> {item.text}</span>
              {index < comparisonSummary.length - 1 && <span className='text-gray-400 dark:text-gray-500'>, </span>}
            </span>
          ))}
        </div>
      )}

      <div className='mb-4 flex justify-end'>
        <button
          onClick={clearCompare}
          className='text-sm text-gray-500 transition-colors hover:text-orange dark:text-gray-400'
          aria-label='Xóa tất cả sản phẩm khỏi bảng so sánh'
        >
          Xóa tất cả
        </button>
      </div>

      {/* Mobile card layout */}
      <div className='space-y-4 md:hidden'>
        {compareList.map((product) => (
          <div
            key={product._id}
            className='rounded-lg border border-gray-200 bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800'
          >
            <div className='mb-3 flex items-center justify-between'>
              <Link
                to={`${path.home}${generateNameId({ name: product.name, id: product._id })}`}
                className='flex items-center gap-3'
              >
                <img
                  src={product.image}
                  alt={`Hình ảnh sản phẩm ${product.name}`}
                  className='h-16 w-16 rounded-lg object-cover'
                />
                <span className='line-clamp-2 text-sm font-medium dark:text-gray-200'>{product.name}</span>
              </Link>
              <button
                onClick={() => removeFromCompare(product._id)}
                className='shrink-0 rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700'
                aria-label={`Xóa ${product.name} khỏi so sánh`}
              >
                <svg
                  className='h-4 w-4 text-gray-400 dark:text-gray-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500 dark:text-gray-400'>Giá</span>
                <span className='font-medium text-orange'>₫{formatCurrency(product.price)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 dark:text-gray-400'>Đánh giá</span>
                <span className='dark:text-gray-200'>{product.rating} ⭐</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 dark:text-gray-400'>Đã bán</span>
                <span className='dark:text-gray-200'>{formatNumberToSocialStyle(product.sold)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <table className='hidden w-full border-collapse md:table' role='table' aria-label='So sánh sản phẩm'>
        <thead className='sticky top-0 z-10 bg-white dark:bg-slate-800'>
          <tr role='row'>
            <th
              scope='col'
              className='w-32 border-b p-3 text-left text-sm font-medium text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='columnheader'
            >
              Thuộc tính
            </th>
            {compareList.map((product) => (
              <th
                key={product._id}
                scope='col'
                className='relative min-w-[200px] border-b p-3 text-center dark:border-slate-700'
                role='columnheader'
              >
                <button
                  onClick={() => removeFromCompare(product._id)}
                  className='absolute top-2 right-2 rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700'
                  aria-label={`Xóa ${product.name} khỏi so sánh`}
                >
                  <svg
                    className='h-4 w-4 text-gray-400 dark:text-gray-500'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    aria-hidden='true'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody aria-live='polite'>
          <tr role='row'>
            <th
              scope='row'
              className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='rowheader'
            >
              Hình ảnh
            </th>
            {compareList.map((product) => (
              <td key={product._id} className='border-b p-3 text-center dark:border-slate-700' role='cell'>
                <Link
                  to={`${path.home}${generateNameId({ name: product.name, id: product._id })}`}
                  aria-label={`Xem chi tiết sản phẩm ${product.name}`}
                >
                  <img
                    src={product.image}
                    alt={`Hình ảnh sản phẩm ${product.name}`}
                    className='mx-auto h-24 w-24 rounded-lg object-cover transition-opacity hover:opacity-80'
                  />
                </Link>
              </td>
            ))}
          </tr>
          <tr role='row'>
            <th
              scope='row'
              className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='rowheader'
            >
              Tên sản phẩm
            </th>
            {compareList.map((product) => (
              <td key={product._id} className='border-b p-3 text-center dark:border-slate-700' role='cell'>
                <Link
                  to={`${path.home}${generateNameId({ name: product.name, id: product._id })}`}
                  className='line-clamp-2 text-sm font-medium text-gray-800 hover:text-orange dark:text-gray-200'
                  aria-label={`Xem chi tiết sản phẩm ${product.name}`}
                >
                  {product.name}
                </Link>
              </td>
            ))}
          </tr>
          <tr role='row'>
            <th
              scope='row'
              className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='rowheader'
            >
              Giá
            </th>
            {compareList.map((product) => {
              const isBest = bestValues && product.price === bestValues.bestPrice
              return (
                <td
                  key={product._id}
                  className={classNames('border-b p-3 text-center dark:border-slate-700', {
                    'bg-green-50 dark:bg-green-900/20': isBest
                  })}
                  role='cell'
                >
                  <span className='font-semibold text-orange'>₫{formatCurrency(product.price)}</span>
                  {isBest && <BestBadge label='Giá tốt nhất' reduceMotion={reduceMotion} />}
                </td>
              )
            })}
          </tr>
          <tr role='row'>
            <th
              scope='row'
              className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='rowheader'
            >
              Giá gốc
            </th>
            {compareList.map((product) => (
              <td key={product._id} className='border-b p-3 text-center dark:border-slate-700' role='cell'>
                <span className='text-sm text-gray-400 line-through dark:text-gray-500'>
                  ₫{formatCurrency(product.price_before_discount)}
                </span>
              </td>
            ))}
          </tr>
          <tr role='row'>
            <th
              scope='row'
              className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='rowheader'
            >
              Giảm giá
            </th>
            {compareList.map((product) => {
              const discount = getDiscountPercent(product)
              const isBest = bestValues && discount === bestValues.bestDiscount && discount > 0
              return (
                <td
                  key={product._id}
                  className={classNames('border-b p-3 text-center dark:border-slate-700', {
                    'bg-green-50 dark:bg-green-900/20': isBest
                  })}
                  role='cell'
                >
                  {discount > 0 ? (
                    <>
                      <span className='font-medium text-red-500 dark:text-red-400'>-{discount}%</span>
                      {isBest && <BestBadge label='Giảm nhiều nhất' reduceMotion={reduceMotion} />}
                    </>
                  ) : (
                    <span className='text-gray-400 dark:text-gray-500'>-</span>
                  )}
                </td>
              )
            })}
          </tr>
          <tr role='row'>
            <th
              scope='row'
              className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='rowheader'
            >
              Đánh giá
            </th>
            {compareList.map((product) => {
              const isBest = bestValues && product.rating === bestValues.bestRating
              return (
                <td
                  key={product._id}
                  className={classNames('border-b p-3 dark:border-slate-700', {
                    'bg-green-50 dark:bg-green-900/20': isBest
                  })}
                  role='cell'
                >
                  <div className='flex flex-wrap items-center justify-center gap-1'>
                    <ProductRating rating={product.rating} />
                    <span className='text-sm text-gray-500 dark:text-gray-400'>({product.rating})</span>
                    {isBest && <BestBadge label='Đánh giá cao nhất' reduceMotion={reduceMotion} />}
                  </div>
                </td>
              )
            })}
          </tr>
          <tr role='row'>
            <th
              scope='row'
              className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='rowheader'
            >
              Đã bán
            </th>
            {compareList.map((product) => {
              const isBest = bestValues && product.sold === bestValues.bestSold
              return (
                <td
                  key={product._id}
                  className={classNames('border-b p-3 text-center dark:border-slate-700', {
                    'bg-green-50 dark:bg-green-900/20': isBest
                  })}
                  role='cell'
                >
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {formatNumberToSocialStyle(product.sold)}
                  </span>
                  {isBest && <BestBadge label='Bán chạy nhất' reduceMotion={reduceMotion} />}
                </td>
              )
            })}
          </tr>
          <tr role='row'>
            <th
              scope='row'
              className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='rowheader'
            >
              Tồn kho
            </th>
            {compareList.map((product) => {
              const isBest = bestValues && product.quantity === bestValues.bestStock
              return (
                <td
                  key={product._id}
                  className={classNames('border-b p-3 text-center dark:border-slate-700', {
                    'bg-green-50 dark:bg-green-900/20': isBest
                  })}
                  role='cell'
                >
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {formatNumberToSocialStyle(product.quantity)}
                  </span>
                  {isBest && <BestBadge label='Còn nhiều nhất' reduceMotion={reduceMotion} />}
                </td>
              )
            })}
          </tr>
          <tr role='row'>
            <th
              scope='row'
              className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
              role='rowheader'
            >
              Danh mục
            </th>
            {compareList.map((product) => (
              <td key={product._id} className='border-b p-3 text-center dark:border-slate-700' role='cell'>
                <span className='text-sm text-gray-700 dark:text-gray-300'>{product.category?.name || '-'}</span>
              </td>
            ))}
          </tr>
          {/* Recommendation Row */}
          {bestValues && (
            <tr role='row'>
              <th
                scope='row'
                className='border-b p-3 text-left text-sm font-normal text-gray-600 dark:border-slate-700 dark:text-gray-300'
                role='rowheader'
              >
                Đề xuất
              </th>
              {compareList.map((product) => {
                const isRecommended = product._id === bestValues.recommendedProductId
                return (
                  <td
                    key={product._id}
                    className={classNames('border-b p-3 text-center dark:border-slate-700', {
                      'bg-orange-50 dark:bg-orange-900/20': isRecommended
                    })}
                    role='cell'
                  >
                    {isRecommended ? (
                      reduceMotion ? (
                        <span className='rounded-full bg-orange px-3 py-1 text-sm font-medium text-white'>
                          ⭐ Đề xuất
                        </span>
                      ) : (
                        <motion.span
                          className='inline-block rounded-full bg-orange px-3 py-1 text-sm font-medium text-white'
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          ⭐ Đề xuất
                        </motion.span>
                      )
                    ) : (
                      <span className='text-gray-400 dark:text-gray-500'>-</span>
                    )}
                  </td>
                )
              })}
            </tr>
          )}
          <tr role='row'>
            <td className='p-3 text-sm text-gray-600 dark:text-gray-300' role='cell'></td>
            {compareList.map((product) => (
              <td key={product._id} className='p-3 text-center' role='cell'>
                <div className='flex flex-col gap-2'>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className='w-full rounded-sm bg-orange px-4 py-2 text-sm text-white transition-colors hover:bg-[#d73211]'
                    aria-label={`Thêm ${product.name} vào giỏ hàng`}
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={() => removeFromCompare(product._id)}
                    className='w-full rounded-sm border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
                    aria-label={`Xóa ${product.name} khỏi bảng so sánh`}
                  >
                    Xóa khỏi so sánh
                  </button>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default memo(ComparisonTable)
