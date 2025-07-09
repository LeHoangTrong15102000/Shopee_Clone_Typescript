import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

import HeroBanner from 'src/components/HeroBanner'
import { FlashSaleTimer } from 'src/components/FlashSale'
import categoryApi from 'src/apis/category.api'
import productApi from 'src/apis/product.api'
import path from 'src/constant/path'
import { generateNameId } from 'src/utils/utils'

const Home = () => {
  // Lấy danh mục sản phẩm
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
    staleTime: 5 * 60 * 1000 // Cache 5 phút
  })

  // Lấy sản phẩm nổi bật (top 20)
  const { data: featuredProductsData } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productApi.getProducts({ page: 1, limit: 20, sort_by: 'sold', order: 'desc' }),
    staleTime: 5 * 60 * 1000
  })

  // Lấy sản phẩm mới (top 20)
  const { data: newProductsData } = useQuery({
    queryKey: ['newProducts'],
    queryFn: () => productApi.getProducts({ page: 1, limit: 20, sort_by: 'createdAt', order: 'desc' }),
    staleTime: 5 * 60 * 1000
  })

  const categories = categoriesData?.data.data || []
  const featuredProducts = featuredProductsData?.data.data.products || []
  const newProducts = newProductsData?.data.data.products || []

  return (
    <div className='bg-gray-50'>
      <Helmet>
        <title>Shopee Clone - Mua Sắm Online Số 1 Việt Nam</title>
        <meta
          name='description'
          content='Mua sắm trực tuyến hàng triệu sản phẩm ở tất cả ngành hàng. Giá tốt & Ưu đãi. Mua và bán online trong 30 giây. Shopee Đảm Bảo | Freeship Xtra | Hoàn Xu Xtra'
        />
      </Helmet>

      {/* Hero Banner */}
      <div className='bg-white'>
        <div className='container py-6'>
          <HeroBanner />
        </div>
      </div>

      {/* Category Section */}
      <div className='bg-white mt-4'>
        <div className='container py-6'>
          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-gray-800 mb-2'>Danh Mục</h2>
            <p className='text-gray-600'>Khám phá các danh mục sản phẩm hàng đầu</p>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4'>
            {categories.slice(0, 16).map((category) => (
              <Link
                key={category._id}
                to={`${path.products}?category=${category._id}`}
                className='flex flex-col items-center p-4 rounded-lg border border-gray-200 
                  hover:border-[#ee4d2d] hover:shadow-md transition-all duration-300 group'
              >
                <div
                  className='w-12 h-12 mb-3 bg-gradient-to-br from-[#ee4d2d] to-[#f53d2d] 
                  rounded-full flex items-center justify-center text-white font-bold text-lg
                  group-hover:scale-110 transition-transform duration-300'
                >
                  {category.name.charAt(0)}
                </div>
                <span className='text-sm text-gray-700 text-center font-medium group-hover:text-[#ee4d2d]'>
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Flash Sale Section - Giả lập */}
      <div className='bg-white mt-4'>
        <div className='container py-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center'>
              <h2 className='text-xl font-semibold text-[#ee4d2d] mr-4'>FLASH SALE</h2>
              <FlashSaleTimer />
            </div>
            <Link
              to={`${path.products}?sort_by=sold&order=desc`}
              className='text-[#ee4d2d] hover:text-[#d73527] font-medium'
            >
              Xem tất cả →
            </Link>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {featuredProducts.slice(0, 6).map((product) => (
              <Link
                key={product._id}
                to={`${path.home}${generateNameId({ name: product.name, id: product._id })}`}
                className='bg-white border border-gray-200 rounded-lg overflow-hidden 
                  hover:shadow-lg transition-all duration-300 group'
              >
                <div className='relative overflow-hidden'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                  <div className='absolute top-2 left-2 bg-[#ee4d2d] text-white text-xs px-2 py-1 rounded'>
                    -
                    {Math.round(
                      ((product.price_before_discount - product.price) / product.price_before_discount) * 100
                    )}
                    %
                  </div>
                </div>
                <div className='p-3'>
                  <h3 className='text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-[#ee4d2d]'>
                    {product.name}
                  </h3>
                  <div className='flex items-center justify-between'>
                    <span className='text-[#ee4d2d] font-bold'>₫{product.price.toLocaleString()}</span>
                    <span className='text-xs text-gray-500'>Đã bán {product.sold}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sản phẩm mới Section */}
      <div className='bg-white mt-4'>
        <div className='container py-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>Sản Phẩm Mới</h2>
              <p className='text-gray-600'>Những sản phẩm mới nhất được cập nhật</p>
            </div>
            <Link
              to={`${path.products}?sort_by=createdAt&order=desc`}
              className='text-[#ee4d2d] hover:text-[#d73527] font-medium'
            >
              Xem tất cả →
            </Link>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
            {newProducts.slice(0, 12).map((product) => (
              <Link
                key={product._id}
                to={`${path.home}${generateNameId({ name: product.name, id: product._id })}`}
                className='bg-white border border-gray-200 rounded-lg overflow-hidden 
                  hover:shadow-lg transition-all duration-300 group'
              >
                <div className='relative overflow-hidden'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                  <div className='absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded'>Mới</div>
                </div>
                <div className='p-3'>
                  <h3 className='text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-[#ee4d2d]'>
                    {product.name}
                  </h3>
                  <div className='flex items-center justify-between'>
                    <span className='text-[#ee4d2d] font-bold'>₫{product.price.toLocaleString()}</span>
                    <div className='flex items-center'>
                      <svg className='w-3 h-3 text-yellow-400 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                      <span className='text-xs text-gray-500'>{product.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className='bg-gradient-to-r from-[#ee4d2d] to-[#f53d2d] mt-4'>
        <div className='container py-12'>
          <div className='text-center text-white'>
            <h2 className='text-2xl md:text-3xl font-bold mb-4'>Khám phá hàng triệu sản phẩm với giá tốt nhất</h2>
            <p className='text-lg mb-6 opacity-90'>Mua sắm thông minh, tiết kiệm hơn mỗi ngày</p>
            <Link
              to={`${path.products}?sort_by=sold&order=desc`}
              className='inline-flex items-center px-8 py-3 bg-white text-[#ee4d2d] font-semibold 
                rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105'
            >
              <span>Mua sắm ngay</span>
              <svg className='w-5 h-5 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
