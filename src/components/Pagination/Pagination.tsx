// Sử dụng thuật toán range 2 để tạo ra pagination cho app

import classNames from 'classnames'
import { Link, createSearchParams } from 'react-router-dom'
import path from 'src/constant/path'
import { QueryConfig } from 'src/hooks/useQueryConfig'

interface Props {
  queryConfig: QueryConfig
  pageSize: number
}

const RANGE = 2
const Pagination = ({ queryConfig, pageSize }: Props) => {
  const page = Number(queryConfig.page)

  // Viết function handle việc paginate cho trang sẽ được thực hiện ở đây
  const renderPagination = () => {
    let dotAfter = false
    let dotBefore = false
    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true
        return (
          <span className='flex items-center justify-center border bg-white px-3 py-2 shadow-sm' key={index}>
            ...
          </span>
        )
      }
      return null
    }
    const renderDotAfter = (index: number) => {
      if (!dotAfter) {
        dotAfter = true
        return (
          <span className='flex items-center justify-center border bg-white px-3 py-2 shadow-sm' key={index}>
            ...
          </span>
        )
      }
      return null
    }
    return Array(pageSize)
      .fill(0)
      .map((_, index) => {
        const pageNumber = index + 1
        // Trường hợp đầu tiênm, điều kiện để return về ...
        if (page <= RANGE * 2 + 1 && pageNumber > page + RANGE && pageNumber < pageSize - RANGE + 1) {
          return renderDotAfter(index)
        } else if (page > RANGE * 2 + 1 && page < pageSize - RANGE * 2) {
          if (pageNumber < page - RANGE && pageNumber > RANGE) {
            return renderDotBefore(index)
          } else if (pageNumber > page + RANGE && pageNumber < pageSize - RANGE + 1) {
            return renderDotAfter(index)
          }
        } else if (page >= pageSize - RANGE * 2 && pageNumber > RANGE && pageNumber < page - RANGE) {
          return renderDotBefore(index)
        }
        // Nó sẽ trả về một cái mảng chứa các JSX là các thẻ Link
        return (
          <Link
            to={{
              pathname: path.home,
              search: createSearchParams({
                ...queryConfig,
                page: pageNumber.toString() // cần type string
              }).toString()
            }}
            className={classNames('flex cursor-pointer items-center justify-center px-4 py-2 text-[18px]', {
              'bg-[#ee4d2d] text-white hover:bg-[#ee4d2d]': pageNumber === page,
              'border-transparent text-black/50 hover:text-[#ee4e2d]': pageNumber !== page
            })}
            key={index}
          >
            {pageNumber}
          </Link>
        )
      })
  }
  return (
    <div className='mt-6 flex flex-wrap items-center justify-center'>
      {page === 1 ? (
        <span className='flex cursor-not-allowed items-center justify-center rounded-tl-sm rounded-bl-sm border-transparent px-4 py-2 '>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-5 w-5 text-[rgba(0,0,0,0.6)]'
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
          className='flex cursor-pointer items-center justify-center rounded-tl-sm rounded-bl-sm border-transparent px-4 py-2 '
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-5 w-5 text-[rgba(0,0,0,0.6)]'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
          </svg>
        </Link>
      )}
      {/* {page === } */}
      {renderPagination()}
      {page === pageSize ? (
        <span className='flex cursor-not-allowed items-center justify-center rounded-tr-sm rounded-br-sm border-transparent  px-4 py-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-5 w-5 text-[rgba(0,0,0,.6)] '
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
          className='flex cursor-pointer items-center justify-center rounded-tr-sm rounded-br-sm border-transparent  px-4 py-2 '
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-5 w-5 text-[rgba(0,0,0,.6)] '
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
          </svg>
        </Link>
      )}
      {/* <button className='flex cursor-pointer items-center justify-center rounded border bg-white px-3 py-2 shadow-sm'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-5 w-5 text-[rgba(0,0,0,0.6)]'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
        </svg>
      </button> */}
      {/* <button className='flex cursor-pointer items-center justify-center rounded border bg-white px-3 py-2 shadow-sm'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-5 w-5 text-[rgba(0,0,0,.6)] '
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
        </svg>
      </button> */}
    </div>
  )
}

export default Pagination
