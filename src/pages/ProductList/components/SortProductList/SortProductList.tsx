import classNames from 'classnames'
import _ from 'lodash'
import { Link, createSearchParams, useNavigate } from 'react-router-dom'
import path from 'src/constant/path'
import { sortBy, order as orderConstant } from 'src/constant/product'
import { QueryConfig } from 'src/hooks/useQueryConfig'

import { ProductListConfig } from 'src/types/product.type'

interface Props {
  queryConfig: QueryConfig
  pageSize: number
}

const SortProductList = ({ queryConfig, pageSize }: Props) => {
  const page = Number(queryConfig.page) // Là vì chỗ này mà cái pagination và sortProduct đồng bộ
  const { sort_by = sortBy.createdAt, order, category } = queryConfig
  const navigate = useNavigate()

  // function check Active cho button
  const isActiveSortBy = (sortByValue: Exclude<ProductListConfig['sort_by'], undefined>) => {
    return sort_by === sortByValue
  }

  // Viết function Navigate khi mà nhấn vào sẽ tạo ra đường dẫn URL để Active button
  const handleSortNavigate = (sortByValue: Exclude<ProductListConfig['sort_by'], undefined>) => {
    navigate({
      pathname: path.home,
      search: createSearchParams(
        _.omit(
          {
            ...queryConfig,
            sort_by: sortByValue
          },
          ['order']
        )
      ).toString()
    })
  }

  // Function handle cho việc sort order `Giá`
  const handlePriceOrder = (orderValue: Exclude<ProductListConfig['order'], undefined>) => {
    navigate({
      pathname: path.home,
      search: createSearchParams({
        ...queryConfig,
        sort_by: sortBy.price,
        order: orderValue
      }).toString()
    })
  }

  return (
    <div className='bg-gray-300/40 py-4 px-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        {/* sort theo tên: phổ biến - mới nhất - bán chạy */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='text-sm text-[rgba(0,0,0,.7)]'>Sắp xếp theo</div>
          <button
            className={classNames('capitaliz h-8 rounded-sm px-4 text-center text-sm', {
              'bg-[#ee4d2d] text-white hover:bg-[#ee4d2d]': isActiveSortBy(sortBy.view),
              'bg-white text-black/80 hover:bg-slate-100': !isActiveSortBy(sortBy.view)
            })}
            onClick={() => handleSortNavigate(sortBy.view)}
          >
            Phổ biến
          </button>
          <button
            className={classNames('capitaliz h-8 rounded-sm px-4 text-center text-sm', {
              'bg-[#ee4d2d] text-white hover:bg-[#ee4d2d]': isActiveSortBy(sortBy.createdAt),
              'bg-white text-black/80 hover:bg-slate-100': !isActiveSortBy(sortBy.createdAt)
            })}
            onClick={() => handleSortNavigate(sortBy.createdAt)}
          >
            Mới nhất
          </button>
          <button
            className={classNames('capitaliz h-8 rounded-sm px-4 text-center text-sm', {
              'bg-[#ee4d2d] text-white hover:bg-[#ee4d2d]': isActiveSortBy(sortBy.sold),
              'bg-white text-black/80 hover:bg-slate-100': !isActiveSortBy(sortBy.sold)
            })}
            onClick={() => handleSortNavigate(sortBy.sold)}
          >
            Bán chạy
          </button>
          {/* sort productList */}
          <select
            className={classNames('h-8  px-4 text-left text-sm capitalize outline-none ', {
              'bg-white/70 text-[#ee4d2d] hover:bg-slate-100': isActiveSortBy(sortBy.price),
              'bg-white text-black/80 hover:bg-slate-100': !isActiveSortBy(sortBy.price)
            })}
            value={order || ''}
            onChange={(event) => handlePriceOrder(event.target.value as Exclude<ProductListConfig['order'], undefined>)}
          >
            <option value='' className='bg-white text-black/80' disabled>
              Giá
            </option>
            <option value={orderConstant.asc} className='bg-white text-black/80'>
              Giá: Thấp đến cao
            </option>
            <option value={orderConstant.desc} className='bg-white text-black/80'>
              Giá: Cao đến thấp
            </option>
          </select>
        </div>
        {/* tăng giảm số trang hiện tại */}
        <div className='flex items-center'>
          <div className='text-sm'>
            <span className='text-[#ee4d2d]'>{page}</span>
            <span>/{pageSize}</span>
          </div>
          <div className='ml-6 flex items-center'>
            {page === 1 ? (
              <span className='flex h-8 w-9 cursor-not-allowed items-center justify-center rounded-tl-sm rounded-bl-sm bg-white/40 shadow hover:bg-slate-100'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='h-4 w-4'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
                </svg>
              </span>
            ) : (
              <Link
                to={{
                  pathname: path.home,
                  search: createSearchParams({
                    ...queryConfig,
                    page: (page - 1).toString()
                  }).toString()
                }}
                className='flex h-8 w-9 cursor-pointer items-center justify-center rounded-tl-sm rounded-bl-sm bg-white/40  shadow hover:bg-slate-100'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='h-4 w-4'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
                </svg>
              </Link>
            )}
            {page === pageSize ? (
              <span className='flex h-8 w-9 cursor-not-allowed items-center justify-center rounded-tl-sm rounded-bl-sm bg-white/40 shadow hover:bg-slate-100'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='h-4 w-4'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                </svg>
              </span>
            ) : (
              <Link
                to={{
                  pathname: path.home,
                  search: createSearchParams({
                    ...queryConfig,
                    page: (page + 1).toString()
                  }).toString()
                }}
                className='flex h-8 w-9 cursor-pointer items-center justify-center rounded-tl-sm rounded-bl-sm bg-white/40 shadow hover:bg-slate-100'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='h-4 w-4'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                </svg>
              </Link>
            )}
            {/* <button className='h-8 rounded-tr-sm rounded-br-sm bg-white px-3 shadow hover:bg-slate-100'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-4 w-4'
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
              </svg>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SortProductList
