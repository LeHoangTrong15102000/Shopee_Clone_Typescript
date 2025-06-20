import classNames from 'classnames'
import { useForm, Controller } from 'react-hook-form'
import { Link, createSearchParams, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import _ from 'lodash'
import omit from 'lodash/omit'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import InputNumber from 'src/components/InputNumber'
import path from 'src/constant/path'

import { Category } from 'src/types/category.type'
import { InputNumberSchema, inputNumberSchema } from 'src/utils/rules'
import { NoUndefinedField } from 'src/types/utils.type'
import RatingStars from 'src/pages/ProductList/components/RatingStars'
import { QueryConfig } from 'src/hooks/useQueryConfig'
import InputV2 from 'src/components/InputV2'
import { useTranslation } from 'react-i18next'

interface Props {
  queryConfig: QueryConfig
  categories: Category[]
}

// Loại bỏ các kiểu dữ liệu undefined và null trong InputNumberSchema
type FormData = NoUndefinedField<InputNumberSchema>
// có thể khai báo như này type FormData = Pick<Schema, 'price_max' | 'price_min'> -> cú pháp của thằng typescript

// inputNumberShema có thể được viết như sau
// const priceSchema = schema.pick(['price_min', 'price_max'])

const AsideFilter = ({ categories, queryConfig }: Props) => {
  const { t } = useTranslation('home') // Trong trường hợp ko khai báo gì thì chúng ta đang sử dụng namespace mặc định
  const { category, sort_by } = queryConfig // Lấy ra category config -> lấy ra cái categoriesId
  const {
    control,
    handleSubmit,
    trigger,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      //  Lấy hàm reset của react-hook-form để reset lại giá trị trong ô input
      price_max: '',
      price_min: ''
    },
    resolver: yupResolver(inputNumberSchema) as any,
    shouldFocusError: false
  })
  const navigate = useNavigate()

  const onSubmit = handleSubmit(
    (data) => {
      navigate({
        pathname: path.home,
        search: createSearchParams({
          ...queryConfig,
          price_max: data.price_max,
          price_min: data.price_min
        }).toString()
      })
    },
    (err) => {
      console.log(err)
      // err.price_max.ref.focus()
      // err.price_min.ref.focus()
    }
  )
  // },
  // // Khi mà onSubmit mà bị lỗi thì nó sẽ chạy function này
  // // function này gọi là function handle lỗi của handleSubmit
  // (err) => {
  //   // err.price_max?.ref?.focus()
  //   console.log(err)
  // }

  //  Chỉ filter AsideFilter, còn sortFilterProduct thì vẫn giữ nguyên
  const handleRemoveAsideFilter = () => {
    reset() // Nhấn vào reset thì price_max và price_min sẽ trả về chuỗi rỗng
    navigate({
      pathname: path.home,
      search: createSearchParams(
        omit({ ...queryConfig }, ['price_min', 'price_max', 'category', 'rating_filter'])
      ).toString()
    })
  }

  return (
    <div className='py-4 text-[rgba(0,0,0,.8)]'>
      {/* Tất cả danh mục */}
      <Link
        to={path.home}
        className={classNames('flex items-center font-bold', {
          'text-orange': !category // active khi không có query category
        })}
      >
        <svg viewBox='0 0 12 10' className='mr-2 h-4 w-3 fill-current'>
          <g fillRule='evenodd' stroke='none' strokeWidth={1}>
            <g transform='translate(-373 -208)'>
              <g transform='translate(155 191)'>
                <g transform='translate(218 17)'>
                  <path d='m0 2h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
                  <path d='m0 6h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
                  <path d='m0 10h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
                </g>
              </g>
            </g>
          </g>
        </svg>
        <span className='capitalize'>{t('aside filter.all categories')}</span>
      </Link>
      <div className='my-4 h-[1px] bg-gray-300'></div>
      <ul>
        {categories.map((categoryItem) => {
          const isActive = category === categoryItem._id
          return (
            <li className='py-2 pl-2' key={categoryItem._id}>
              <Link
                to={{
                  pathname: path.home,
                  search: createSearchParams({
                    ...queryConfig, // nó sẽ lấy lại tất cả config như sort_by,order
                    category: categoryItem._id
                  }).toString()
                }}
                className={classNames('relative px-2', {
                  'font-semibold text-orange': isActive
                })}
              >
                {isActive && (
                  <svg viewBox='0 0 4 7' className='absolute top-1 left-[-5px] mr-3 h-2 w-2 fill-orange'>
                    <polygon points='4 3.5 0 0 0 7' />
                  </svg>
                )}
                {categoryItem.name}
              </Link>
            </li>
          )
        })}
        {/* <li className='py-2 pl-2'>
          <Link to={path.home} className='relative px-2'>
            Điện thoại
          </Link>
        </li> */}
      </ul>
      {/* Bộ lọc tìm kiếm */}
      <Link to={path.home} className='mt-4 flex items-center font-bold uppercase'>
        <svg
          enableBackground='new 0 0 15 15'
          viewBox='0 0 15 15'
          x={0}
          y={0}
          className='mr-3 h-4 w-3 fill-current stroke-current'
        >
          <g>
            <polyline
              fill='none'
              points='5.5 13.2 5.5 5.8 1.5 1.2 13.5 1.2 9.5 5.8 9.5 10.2'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeMiterlimit={10}
            />
          </g>
        </svg>
        <span className=''>{t('aside filter.search filter')}</span>
      </Link>
      <div className='my-4 h-[1px] bg-gray-300'></div>
      {/* Filter theo khoảng giá */}
      <div className='my-4'>
        <div className='capitalize'>Khoảng giá</div>
        <form className='mt-2' onSubmit={onSubmit}>
          <div className='flex items-start'>
            <Controller
              control={control}
              name='price_min'
              render={({ field }) => {
                return (
                  <InputNumber
                    type='text'
                    className='grow'
                    classNameError='hidden'
                    placeholder='₫ TỪ'
                    classNameInput='px-1 py-1 text-sm w-full outline-none border rounded-sm border-gray-300 focus:border-gray-500 focus:shadow-sm'
                    // onChange={(event) => field.onChange(event)} // onChange trong field có nhận vào cái event
                    {...field}
                    onChange={(event) => {
                      field.onChange(event)
                      trigger('price_max')
                    }} // có thể viết gọn lại như này
                    /** 
                     *  Nó vẫn sẽ hiểu là có hai thằng này trong thẻ Input
                     *  // value={field.value}
                        // ref={field.ref}
                     */
                  />
                )
              }}
            />
            {/* shrink-0 cho nó đừng có bị co lại */}
            <div className='mx-[0.625rem] shrink-0 text-[#bdbdbd]'>--</div>
            {/* <InputV2
              control={control}
              name='price_max'
              type='number'
              className='grow'
              classNameError='hidden'
              placeholder='₫ ĐẾN'
              classNameInput='px-1 py-1 text-sm w-full outline-none border rounded-sm border-gray-300 focus:border-gray-500 focus:shadow-sm'
              maxValue={'50000000'}
              onChange={() => {
                trigger('price_min')
              }}
            /> */}
            <Controller
              control={control}
              name='price_max'
              render={({ field }) => {
                return (
                  <InputNumber
                    type='text'
                    className='grow'
                    classNameError='hidden'
                    placeholder='₫ ĐẾN'
                    classNameInput='px-1 py-1 text-sm w-full outline-none border rounded-sm border-gray-300 focus:border-gray-500 focus:shadow-sm'
                    maxValue={'50000000'}
                    {...field}
                    onChange={(event) => {
                      field.onChange(event)
                      trigger('price_min')
                    }}
                  />
                )
              }}
            />
          </div>
          <div className='mt-1 min-h-[1.25rem] text-center text-sm text-red-600'>{errors.price_min?.message}</div>
          <Button className='flex w-full items-center justify-center bg-[rgba(238,77,45)] p-2 text-sm uppercase text-white hover:bg-[rgba(238,77,45)]/80'>
            áp dụng
          </Button>
          <div className='my-4 h-[1px] bg-gray-300 '></div>
        </form>
        {/* Đánh giá */}
        <div className='my-4'>
          <div className=' capitalize'>đánh giá</div>
        </div>
      </div>
      {/* Sao đánh giá sản phẩm */}
      <RatingStars queryConfig={queryConfig} />
      {/* Button Xóa tất cả filter */}
      <div className='my-4 h-[1px] bg-gray-300'></div>
      <Button
        onClick={handleRemoveAsideFilter}
        className='flex w-full items-center justify-center bg-[rgba(238,77,45)] p-2 text-sm uppercase text-white hover:bg-[rgba(238,77,45)]/80'
      >
        xóa tất cả
      </Button>
    </div>
  )
}

export default AsideFilter
