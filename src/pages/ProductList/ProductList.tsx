import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ProductListConfig } from 'src/types/product.type'
import { createSearchParams, useNavigate } from 'react-router-dom'

import categoryApi from 'src/apis/category.api'
import productApi from 'src/apis/product.api'

import AsideFilter from './components/AsideFilter'
import SortProductList from './components/SortProductList'
import Pagination from 'src/components/Pagination'
import Product from './components/Product/Product'

import path from 'src/constant/path'
import useQueryConfig from 'src/hooks/useQueryConfig'
import { useScrollRestoration } from 'src/hooks/useScrollRestoration'
import { Helmet } from 'react-helmet-async'
import Loader from 'src/components/Loader'

/**
 * ProductList Component với Query Cancellation
 * Tự động hủy request cũ khi queryConfig thay đổi (filter, search, pagination)
 */
const ProductList = () => {
  const queryConfig = useQueryConfig()
  const navigate = useNavigate()

  // Scroll Restoration - tự động lưu và khôi phục vị trí scroll
  const { saveCurrentPosition, scrollToTop } = useScrollRestoration(`product-list-${JSON.stringify(queryConfig)}`, true)

  // Scroll to top chỉ khi có thay đổi filter/search/sort (không phải pagination)
  useEffect(() => {
    const { page, ...restConfig } = queryConfig
    const isFilterChange = Object.values(restConfig).some((value) => value && value !== '')

    // Chỉ scroll to top khi có filter change, không scroll khi chỉ thay đổi page
    if (isFilterChange && page === '1') {
      scrollToTop()
    }
  }, [queryConfig, scrollToTop])

  /**
   * Query Products với automatic cancellation
   * TanStack Query sẽ tự động hủy request cũ khi queryKey ['products', queryConfig] thay đổi
   */
  const {
    data: productsData,
    isLoading,
    isFetching,
    error
  } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: ({ signal }) => {
      // Truyền AbortSignal vào API call để support cancellation
      return productApi.getProducts(queryConfig as ProductListConfig, { signal })
    },
    placeholderData: (previousData) => previousData, // Giữ data cũ khi loading
    staleTime: 3 * 60 * 1000, // 3 phút
    retry: (failureCount, error: any) => {
      // Không retry nếu request bị abort (do cancellation)
      if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
        return false
      }
      // Không retry cho lỗi 404 (không tìm thấy sản phẩm)
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2 // Retry tối đa 2 lần cho các lỗi khác
    }
  })

  // console.log('ProductList - productsData:', productsData?.data.data) //  trả về cái mảng các phần tử trong đây

  /**
   * Query Categories với Query Cancellation
   * Cache lâu hơn vì categories ít thay đổi
   */
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => {
      // Truyền AbortSignal vào API call
      return categoryApi.getCategories({ signal })
    },
    staleTime: 15 * 60 * 1000, // Cache 15 phút vì categories ít thay đổi
    retry: (failureCount, error: any) => {
      if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
        return false
      }
      return failureCount < 1
    }
  })

  // Handle error và empty state
  useEffect(() => {
    if (
      productsData?.data.data.products.length === 0 &&
      productsData?.data.data.pagination.page !== 1 &&
      !isLoading &&
      !error
    ) {
      // Redirect về trang 1 nếu không có sản phẩm và không phải trang 1
      navigate({
        pathname: path.home,
        search: createSearchParams({
          ...queryConfig,
          page: '1'
        }).toString()
      })
    }
  }, [productsData, isLoading, error, navigate, queryConfig])

  // Loading state - hiển thị loader khi lần đầu load
  if (isLoading && !productsData) {
    return (
      <div className='bg-gray-200 py-6'>
        <div className='container'>
          <Loader />
        </div>
      </div>
    )
  }

  // Error state
  if (error && !productsData) {
    return (
      <div className='bg-gray-200 py-6'>
        <div className='container'>
          <div className='text-center py-12'>
            <h2 className='text-xl font-semibold text-gray-700 mb-2'>Có lỗi xảy ra khi tải danh sách sản phẩm</h2>
            <p className='text-gray-500 mb-4'>Vui lòng thử lại sau</p>
            <button
              onClick={() => window.location.reload()}
              className='bg-orange hover:bg-orange/90 text-white px-6 py-2 rounded-sm transition-colors'
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  const products = productsData?.data.data.products || []
  const pagination = productsData?.data.data.pagination
  const categories = categoriesData?.data.data || []

  return (
    <div className='bg-gray-200 py-6'>
      <Helmet>
        <title>Tất cả sản phẩm | Shopee Clone</title>
        <meta name='description' content='Mua sắm online hàng triệu sản phẩm ở tất cả ngành hàng' />
      </Helmet>

      <div className='container'>
        {/* Loading indicator khi đang fetch data mới (không phải lần đầu load) */}
        {isFetching && productsData && (
          <div className='fixed top-20 right-4 z-50 bg-white shadow-lg rounded-lg p-3 border border-gray-200'>
            <div className='flex items-center space-x-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-orange'></div>
              <span className='text-sm text-gray-600'>Đang cập nhật...</span>
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-3'>
              <AsideFilter queryConfig={queryConfig} categories={categories} />
            </div>
            <div className='col-span-9'>
              <SortProductList queryConfig={queryConfig} pageSize={pagination?.page_size || 0} />
              <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {products.map((product) => (
                  <div className='col-span-1' key={product._id}>
                    <Product product={product} />
                  </div>
                ))}
              </div>
              {pagination && <Pagination queryConfig={queryConfig} pageSize={pagination.page_size} />}
            </div>
          </div>
        )}

        {/* Empty state */}
        {products.length === 0 && !isLoading && !isFetching && (
          <div className='text-center py-16'>
            <div className='mx-auto w-24 h-24 mb-4'>
              <svg className='w-full h-full text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-gray-600 mb-2'>Không tìm thấy sản phẩm nào</h3>
            <p className='text-gray-500 mb-6'>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn</p>
            <button
              onClick={() => {
                navigate({
                  pathname: path.home,
                  search: createSearchParams({ page: '1' }).toString()
                })
              }}
              className='bg-orange hover:bg-orange/90 text-white px-6 py-3 rounded-sm transition-colors'
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
