import { Fragment, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductRating from 'src/components/ProductRating'
import path from 'src/constant/path'
import { Product as ProductType } from 'src/types/product.type'
import { formatCurrency, formatNumberToSocialStyle, generateNameId } from 'src/utils/utils'
import NotFound from 'src/pages/NotFound'

interface Props {
  product: ProductType
}

const Product = ({ product }: Props) => {
  // useEffect(() => {
  //   // 👇️ scroll to top on page load
  //   window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  // }, [product?._id])

  return (
    // Khi nhấn vào thì truyền lên cái _id của sản phẩm
    <Fragment>
      {product ? (
        <Link to={`${path.home}${generateNameId({ name: product.name, id: product._id })}`}>
          <div className='overflow-hidden rounded-sm bg-white shadow transition-transform duration-100 hover:translate-y-[-0.055rem] hover:shadow-md'>
            {/* Ảnh sản phẩm */}
            <div className='relative w-full pt-[100%]'>
              <img
                src={product.image}
                className='absolute top-0 left-0 h-full w-full rounded-tl-sm rounded-tr-sm bg-white object-cover'
                alt={product.name}
              />
            </div>
            {/* Thông tin sản phẩm */}
            <div className='overflow-hidden p-2'>
              <div className='min-h-[1.9rem] text-[12px] line-clamp-2'>{product.name}</div>
              {/* price */}
              <div className='mt-3 flex items-center'>
                <div className='max-w-[50%] truncate text-gray-500 line-through'>
                  <span className='text-xs'>₫</span>
                  <span className='text-[14px]'>{formatCurrency(product.price_before_discount)}</span>
                </div>
                <div className='ml-[5px] max-w-[50%] truncate text-[#ee4d2d]'>
                  <span className='text-xs'>₫</span>
                  <span className='text-[14px]'>{formatCurrency(product.price)}</span>
                </div>
              </div>
              {/* rating start */}
              <div className='mt-3 flex items-center justify-start'>
                {/* chứa ngôi sao */}
                <ProductRating rating={product.rating} />
                {/* số lượng bán */}
                <div className='ml-2 text-[13px]'>
                  <span className=''>Đã bán</span>
                  <span className='ml-1'>{formatNumberToSocialStyle(product.sold)}</span>
                </div>
              </div>
            </div>
            {/* Đia điểm bán */}
            <div className='p-2'>
              <div className='flex items-center justify-start'>
                <span className='text-[13px] text-[rgba(0,0,0,.7)]'>TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <NotFound />
      )}
    </Fragment>
  )
}

export default Product
