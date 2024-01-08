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
import { Helmet } from 'react-helmet-async'

const ProductList = () => {
  const queryConfig = useQueryConfig()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [queryConfig])

  // Tại sao nó lạ quá vậy t cũng không rõ nữa quá là mơ hồ về cuộc sống này

  const { data: productsData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    },
    // onSuccess: (data) => {
    //   // console.log(data.data)
    //   if (data.data.data.products.length === 0 && data.data.data.pagination.page !== 1) {
    //     return navigate({
    //       pathname: path.home,
    //       search: createSearchParams({
    //         ...queryConfig,
    //         page: '1'
    //       }).toString()
    //     })
    //   }
    // },
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000 // 3 phut
  })

  // console.log(productsData?.data.data) //  trả về cái mảng các phần tử trong đây

  // Gọi Api cho Category
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => {
      return categoryApi.getCategories()
    }
  })

  // console.log(data)
  // console.log(queryConfig) // Khi render lại component thì cái clg này chạy lại
  return (
    <div className='bg-black/5 py-6'>
      <Helmet>
        <title data-testid='title-element'>Trang chủ | Shopee Clone</title>
        <meta
          name='description'
          content='Mua sắm trực tuyến hàng triệu sản phẩm ở tất cả ngành hàng. Giá tốt &amp; Ưu đãi. Mua và bán online trong 30 giây. Shopee Đảm Bảo | Freeship Xtra | Hoàn Xu Xtra'
        />
      </Helmet>
      <div className='container'>
        {/* Có data thì render ra danh sách sản phẩm */}
        {productsData && (
          <div className='grid grid-cols-12 gap-6'>
            {/* AsideFilter */}
            <div className='col-span-3'>
              <AsideFilter queryConfig={queryConfig} categories={categoriesData?.data.data || []} />
            </div>
            {/* ProductListFilter */}
            <div className='col-span-9'>
              <SortProductList queryConfig={queryConfig} pageSize={productsData.data.data.pagination.page_size} />
              <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {productsData.data.data.products.map((product, index) => (
                  <div className='col-span-1' key={product._id}>
                    <Product product={product} />
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <Pagination queryConfig={queryConfig} pageSize={productsData.data.data.pagination.page_size} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
