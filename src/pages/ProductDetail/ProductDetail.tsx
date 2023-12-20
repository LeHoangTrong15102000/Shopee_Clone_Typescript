import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import productApi from 'src/apis/product.api'

import ProductRating from 'src/components/ProductRating'
import path from 'src/constant/path'

import { Product as ProductType, ProductListConfig } from 'src/types/product.type'
import { formatCurrency, formatNumberToSocialStyle, getIdFromNameId, rateSale } from 'src/utils/utils'
import Product from '../ProductList/components/Product'
import QuantityController from 'src/components/QuantityController'
import purchaseApi from 'src/apis/purchases.api'

import { purchasesStatus } from 'src/constant/purchase'
import { useTranslation } from 'react-i18next'
import { AppContext } from 'src/contexts/app.context'
import NotFound from '../NotFound'
import HTTP_STATUS_CODE from 'src/constant/httpStatusCode.enum'

// Type cho purchase
export type AddToCartType = {
  product_id: string
  buy_count: number
}

const ProductDetail = () => {
  const { t } = useTranslation('product') // i18next
  const [buyCount, setBuyCount] = useState(1)
  const { isAuthenticated } = useContext(AppContext)

  const { nameId } = useParams() // lấy ra cái nameId chứ không còn là id
  // const _value = productId.value
  const id = getIdFromNameId(nameId as string) // tạo ra cái id từ cái nameId
  const navigate = useNavigate()

  // console.log('URL LOCATION', window.location.href)

  const queryClient = useQueryClient()

  const { data: productDetailData } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductDetail(id as string),
    keepPreviousData: true
  })
  // console.log(productDetailData?.status)
  const product = productDetailData?.status === HTTP_STATUS_CODE.NotFound ? null : productDetailData?.data.data // Chỗ này product có thể là undefined, nên sẽ kiểm tra
  // tạo ra state currentIndexImage để quản lí việc click slider
  // console.log(product)
  const imageRef = useRef<HTMLImageElement>(null)
  const [currentIndexImages, setCurrentIndexImages] = useState([0, 5])
  const [activeImage, setActiveImage] = useState('') // currentImage cho hình ảnh sản phẩm chính
  // currentImage cho slider dùng cho button(thay đổi khi mà currentIndexImage thay đổi)
  const currentImages = useMemo(
    () => (product ? product?.images.slice(...currentIndexImages) : []),
    [product, currentIndexImages]
  ) // Thay đổi mỗi khi mà currentIndexImage thay đổi -> render lại slider

  //  Sẽ lấy ra id sản phẩm có cùng danh mục, và gán cái id của categories đó vào cho queryConfig để render ra danh sách sản phẩm cùng category
  const queryConfig: ProductListConfig = { limit: '20', page: '1', category: product?.category._id }
  const { data: productsData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig) // Lấy ra những sản phẩm cùng danh mục, chứa các _id sản phẩm cùng danh mục
    },
    enabled: Boolean(product), // ban đầu product có data, lấy được categories thì mới cho chạy useQuery() này
    staleTime: 3 * 60 * 1000 // Tóm lại cùng Categories khi mà staleTime chưa hết thì nó cũng ko gọi lại Api
  })
  // Ban đầu khi mà category chưa có dữ liệu thì nó sẽ render ra 20 product page 1
  // console.log(productsData?.data.data)

  // Mutation xử lý addToCart
  const addToCartMutation = useMutation({
    mutationFn: (body: AddToCartType) => purchaseApi.addToCart(body)
  })

  useEffect(() => {
    // Khi mà product mà có thì set active ảnh đầu tiên
    if (product && product.images.length > 0) {
      setActiveImage(product.images[0])
    }
  }, [product])

  // func hoverActiveImage -> set lại Image cho ảnh sản phẩm chính khi hover vào
  const hoverActiveImage = (img: string) => {
    setActiveImage(img)
  }

  // func handleNextPrevButton -> set lại currentIndexImage -> currentImages sẽ render lại
  const handleNextSlider = () => {
    if (currentIndexImages[1] < (product as ProductType).images.length) {
      setCurrentIndexImages((prev) => [prev[0] + 1, prev[1] + 1])
    }
  }

  // func handlePrev currentIndexImage[0] > 0 thì mới Prev được
  const handlePrevSlider = () => {
    if (currentIndexImages[0] > 0) {
      setCurrentIndexImages((prev) => [prev[0] - 1, prev[1] - 1])
    }
  }

  // func hanldeZoom
  const handleZoom = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    // console.log(rect)
    const image = imageRef.current as HTMLImageElement // vì chúng ta chắc rằng image ko thể null được
    const { naturalHeight, naturalWidth } = image
    // console.log(event.target)

    // Cách 1 : Lấy offsetX, offsetY đơn giản khi chúng ta đã xử lý được bubble event
    // const { offsetX, offsetY } = event.nativeEvent

    // Cách 2: Lấy offsetX, offsetY khi chúng ta không xử lý được bubble event
    const offsetX = event.pageX - (rect.x + window.scrollX)
    const offsetY = event.pageY - (rect.y + window.scrollY)

    const top = offsetY * (1 - naturalHeight / rect.height) // top là trục Y
    const left = offsetX * (1 - naturalWidth / rect.width) // left là trục X

    image.style.width = naturalWidth + 'px'
    image.style.height = naturalHeight + 'px'
    image.style.maxWidth = 'unset'
    image.style.top = top + 'px'
    image.style.left = left + 'px'
  }

  // func reset sự kiện hoverZoom
  const handleRemoveZoom = () => {
    imageRef.current?.removeAttribute('style')
  }

  // func handle việc tăng giảm số lượng productList
  const handleBuyCount = (value: number) => {
    setBuyCount(value)
  }

  // func xử lý AddToCart
  const addToCart = () => {
    addToCartMutation.mutate(
      { product_id: product?._id as string, buy_count: buyCount },
      {
        // data đầu tiên là data do Axios trả về, do interceptor chúng ta ko cấu hình response.data nên arg data trong onSuccess do AxiosRes trả về trước rồi mới tới data của SuccResponseApi
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
          toast.success(data.data.message, { autoClose: 1000 })
        }
      }
    ) // Nếu undefined thì nó đã return null rồi
  }

  // func xử lý `Mua Ngay`
  const handleBuyNow = async () => {
    const res = await addToCartMutation.mutateAsync(
      { product_id: product?._id as string, buy_count: buyCount },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
          toast.success(data.data.message, { autoClose: 1000 })
        }
      }
    )
    // Khi mà thành công thì sẽ lấy ra cái purchase
    const purchase = res.data.data
    // Khi nhấn vào `Mua Ngay` thì chuyển đến trang Cart kèm theo cái state là purchaseId
    navigate(path.cart, {
      state: {
        purchaseId: purchase._id // lấy ra _id của mỗi sản phẩm trong giỏ
      }
    })
  }

  // console.log(product)
  if (!product) return

  return (
    <div className='bg-gray-200 py-6'>
      {/* Thông tin sản phẩm */}
      <div className='container'>
        <div className='max-h-[896.56px] bg-white p-4 shadow'>
          <div className='grid grid-cols-12 gap-2 lg:gap-9'>
            {/* Ảnh sản phẩm và slider */}
            <div className='col-span-12 md:col-span-5'>
              {/* Ảnh */}
              <div
                aria-hidden='true'
                className='relative w-full cursor-zoom-in overflow-hidden pt-[100%]'
                onMouseMove={handleZoom}
                onMouseLeave={handleRemoveZoom}
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className='pointer-events-none absolute top-0 left-0 h-full w-full cursor-pointer bg-white object-cover'
                  ref={imageRef}
                />
              </div>
              {/* Phần slider sản phẩm */}
              <div className='relative mt-4 grid grid-cols-5 gap-1'>
                <button
                  onClick={handlePrevSlider}
                  className='absolute left-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
                  </svg>
                </button>
                {currentImages.map((img, index) => {
                  // Cái border thì xử lý tại isActive
                  const isActive = img === activeImage
                  return (
                    <div
                      className='relative w-full pt-[100%]'
                      key={index}
                      role='button'
                      tabIndex={0}
                      aria-hidden='true'
                      onMouseEnter={() => hoverActiveImage(img)}
                    >
                      <img
                        src={img}
                        alt='anhSlider'
                        className='absolute top-0 left-0 h-full w-full cursor-pointer bg-white object-cover'
                      />
                      {isActive && <div className='absolute inset-0 border-2 border-[#ee4d2d]'></div>}
                    </div>
                  )
                })}
                <button
                  onClick={handleNextSlider}
                  className='absolute right-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                  </svg>
                </button>
              </div>
            </div>
            {/* Thông tin sản phẩm */}
            <div className='col-span-12 md:col-span-7'>
              {/* title */}
              <h1 className='text-xl font-medium capitalize'>{product.name}</h1>
              {/* đánh giá chung */}
              <div className='mt-6 flex items-center'>
                {/* đánh giá chung */}
                {/* rating */}
                <div className='flex items-center'>
                  <span className='mr-1 border-b border-b-orange text-[#ee4d2d]'>{product.rating}</span>
                  {/* RatingStar component */}
                  <ProductRating
                    rating={product.rating}
                    activeClassname='h-4 w-4 fill-[#ee4d2d] text-[#ee4d2d]'
                    nonActiveClassname='h-4 w-4 fill-current text-gray-300'
                  />
                </div>
                <div className='mx-4 h-7 w-[1px] bg-gray-300/80'></div>
                {/* đánh giá */}
                <div className='flex items-center'>
                  <span className='mr-1 border-b border-b-black/90 text-black/90'>3k</span>
                  <span className='text-sm capitalize text-black/60'>Đánh giá</span>
                </div>
                <div className='mx-4 h-7 w-[1px] bg-gray-300/80'></div>
                {/* đã bán */}
                <div className='flex items-center'>
                  <span className='mr-1 text-black/90'>{formatNumberToSocialStyle(product.sold)}</span>
                  <span className='text-sm capitalize text-black/60'>Đã bán</span>
                </div>
                {/* Tố cáo */}
                <button className='ml-auto text-sm text-black/60'>Tố cáo</button>
              </div>
              {/* Giá tiền sản phẩm */}
              <div className='mt-3 bg-[#fafafa]'>
                <div className='flex flex-col items-start justify-center px-[20px] py-[15px]'>
                  {/* Giá sản phẩm */}
                  <div className='flex items-center'>
                    <div className='flex min-h-[1.875rem] w-[625px] basis-[625px] flex-wrap items-center'>
                      {/* giá trước giảm giá */}
                      <div className='mr-3 text-[1rem] text-[#929292] line-through'>
                        ₫{formatCurrency(product.price_before_discount)}
                      </div>
                      {/* giá sau giảm giá */}
                      <div className='flex items-center'>
                        <div className='text-[1.875rem] font-medium text-[#ee4d2d]'>
                          ₫{formatCurrency(product.price)}
                        </div>
                        <div className='ml-4 rounded bg-[#ee4d2d] py-[2px] px-[4px] text-[0.75rem] font-semibold uppercase text-white'>
                          {rateSale(product.price, product.price_before_discount)} giảm
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Tiêu đề shopee */}
                  <div className='mt-3 flex items-center'></div>
                </div>
              </div>
              {/* Số lượng sản phẩm */}
              <div className='mt-8 flex items-center'>
                <div className='capitalize text-gray-500/80'>Số lượng</div>
                {/* button tăng giảm và input thêm số lượng sản phẩm */}
                <QuantityController
                  max={product.quantity}
                  value={buyCount}
                  onDecrease={handleBuyCount}
                  onIncrease={handleBuyCount}
                  onType={handleBuyCount}
                />
                {/* Sản phẩm có trong kho */}
                <div className='ml-7 flex items-center text-gray-500/80'>
                  {product.quantity} {t('available')}
                </div>
              </div>
              {/* button thêm sản phẩm */}
              <div className='mt-10 flex items-center'>
                {isAuthenticated ? (
                  <button
                    onClick={addToCart}
                    className='flex h-12 items-center justify-center rounded-sm border border-[#ee4d2d] bg-[#ee4d2d]/10 px-5 capitalize shadow-sm hover:bg-[#ee4d2d]/5'
                  >
                    <svg
                      enableBackground='new 0 0 15 15'
                      viewBox='0 0 15 15'
                      x={0}
                      y={0}
                      className='mr-3 h-[1em] w-[1em] fill-current stroke-[#ee4d2d] text-[1.25rem] text-[#ee4d2d]'
                    >
                      <g>
                        <g>
                          <polyline
                            fill='none'
                            points='.5 .5 2.7 .5 5.2 11 12.4 11 14.5 3.5 3.7 3.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeMiterlimit={10}
                          />
                          <circle cx={6} cy='13.5' r={1} stroke='none' />
                          <circle cx='11.5' cy='13.5' r={1} stroke='none' />
                        </g>
                        <line
                          fill='none'
                          strokeLinecap='round'
                          strokeMiterlimit={10}
                          x1='7.5'
                          x2='10.5'
                          y1={7}
                          y2={7}
                        />
                        <line fill='none' strokeLinecap='round' strokeMiterlimit={10} x1={9} x2={9} y1='8.5' y2='5.5' />
                      </g>
                    </svg>
                    <span className='text-[#ee4d2d]'>thêm vào giỏ hàng</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      navigate(path.login, {
                        state: {
                          purchaseId: product._id,
                          purchaseName: product.name
                        }
                      })
                    }
                    className='flex h-12 items-center justify-center rounded-sm border border-[#ee4d2d] bg-[#ee4d2d]/10 px-5 capitalize shadow-sm hover:bg-[#ee4d2d]/5'
                  >
                    <svg
                      enableBackground='new 0 0 15 15'
                      viewBox='0 0 15 15'
                      x={0}
                      y={0}
                      className='mr-3 h-[1em] w-[1em] fill-current stroke-[#ee4d2d] text-[1.25rem] text-[#ee4d2d]'
                    >
                      <g>
                        <g>
                          <polyline
                            fill='none'
                            points='.5 .5 2.7 .5 5.2 11 12.4 11 14.5 3.5 3.7 3.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeMiterlimit={10}
                          />
                          <circle cx={6} cy='13.5' r={1} stroke='none' />
                          <circle cx='11.5' cy='13.5' r={1} stroke='none' />
                        </g>
                        <line
                          fill='none'
                          strokeLinecap='round'
                          strokeMiterlimit={10}
                          x1='7.5'
                          x2='10.5'
                          y1={7}
                          y2={7}
                        />
                        <line fill='none' strokeLinecap='round' strokeMiterlimit={10} x1={9} x2={9} y1='8.5' y2='5.5' />
                      </g>
                    </svg>
                    <span className='text-[#ee4d2d]'>thêm vào giỏ hàng</span>
                  </button>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={handleBuyNow}
                    className='ml-4 flex h-12 min-w-[5rem] items-center justify-center rounded-sm bg-[#ee4d2d] px-4 capitalize text-white shadow-sm outline-none hover:bg-[#ee4d2d]/90'
                  >
                    Mua ngay
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      navigate(path.login, {
                        state: {
                          purchaseId: product._id,
                          purchaseName: product.name
                        }
                      })
                    }
                    className='ml-4 flex h-12 min-w-[5rem] items-center justify-center rounded-sm bg-[#ee4d2d] px-4 capitalize text-white shadow-sm outline-none hover:bg-[#ee4d2d]/90'
                  >
                    Mua ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mô tả sản phẩm */}
      <div className='mt-8'>
        <div className='container'>
          <div className='bg-white p-8 shadow'>
            {/* Title */}
            <div className='rounded text-[1.125rem] font-medium uppercase text-[rgba(0,0,0,.87)]'>
              Chi tiết sản phẩm
            </div>
            {/* Thông tin chi tiết sản phẩm */}
            <div className='mx-4 mt-12 mb-4 text-sm leading-loose'>
              <div
                dangerouslySetInnerHTML={{
                  // __html: DOMPurify.sanitize(`<div onClick={alert('Ok')}>hehe</div>`) -> DOMpurify chống tấn công XSS
                  __html: DOMPurify.sanitize(product.description)
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Mục sản phẩm yêu thích */}
      <div className='mt-8'>
        <div className='container'>
          {/* Title mục yêu thích */}
          <div className='uppercase text-gray-400'>Có thể bạn cũng thích</div>
          {productsData && (
            <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
              {productsData.data.data.products.map((product, index) => (
                <div className='col-span-1' key={product._id}>
                  <Product product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
