// Sử dụng thuật toán range 2 để tạo ra pagination cho app

import classNames from 'classnames'
import { Link, createSearchParams } from 'react-router-dom'
import path from 'src/constant/path'
import { useProductQueryStates } from 'src/hooks/nuqs'

interface Props {
  pageSize?: number
  basePath?: string
}

const RANGE = 2
const Pagination = ({ pageSize = 20, basePath = path.home }: Props) => {
  const [filters] = useProductQueryStates()

  const filtersAsStrings = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])
  ) as Record<string, string>

  const page = filters.page
  const safePage = page > 0 ? page : 1
  const safePageSize = pageSize && pageSize > 0 ? pageSize : 20

  // Viết function handle việc paginate cho trang sẽ được thực hiện ở đây
  const renderPagination = () => {
    let dotAfter = false
    let dotBefore = false
    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true
        return (
          <span className='flex items-center justify-center border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-2 md:px-3 md:py-3 text-sm md:text-base shadow-sm dark:text-gray-300' key={index}>
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
          <span className='flex items-center justify-center border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-2 md:px-3 md:py-3 text-sm md:text-base shadow-sm dark:text-gray-300' key={index}>
            ...
          </span>
        )
      }
      return null
    }
    return Array(safePageSize)
      .fill(0)
      .map((_, index) => {
        const pageNumber = index + 1
        // Trường hợp đầu tiênm, điều kiện để return về ...
        if (safePage <= RANGE * 2 + 1 && pageNumber > safePage + RANGE && pageNumber < safePageSize - RANGE + 1) {
          return renderDotAfter(index)
        } else if (safePage > RANGE * 2 + 1 && safePage < safePageSize - RANGE * 2) {
          if (pageNumber < safePage - RANGE && pageNumber > RANGE) {
            return renderDotBefore(index)
          } else if (pageNumber > safePage + RANGE && pageNumber < safePageSize - RANGE + 1) {
            return renderDotAfter(index)
          }
        } else if (safePage >= safePageSize - RANGE * 2 && pageNumber > RANGE && pageNumber < safePage - RANGE) {
          return renderDotBefore(index)
        }
        // Nó sẽ trả về một cái mảng chứa các JSX là các thẻ Link
        return (
          <Link
            to={{
              pathname: basePath,
              search: createSearchParams({
                ...filtersAsStrings,
                page: pageNumber.toString()
              }).toString()
            }}
            aria-label={`Trang ${pageNumber}`}
            aria-current={pageNumber === safePage ? 'page' : undefined}
            className={classNames('flex cursor-pointer items-center justify-center px-2 py-2 text-sm md:px-4 md:py-3 md:text-[18px] transition-all duration-150', {
              'bg-orange text-white hover:bg-orange': pageNumber === safePage,
              'border-transparent text-black/50 dark:text-gray-400 hover:text-orange hover:scale-110 active:scale-95': pageNumber !== safePage
            })}
            key={index}
          >
            {pageNumber}
          </Link>
        )
      })
  }
  return (
    <nav
      className='mt-6 flex flex-wrap items-center justify-center'
      role='navigation'
      aria-label='Pagination Navigation'
    >
      {safePage === 1 ? (
        <span
          aria-label="Trang trước"
          aria-disabled="true"
          className='flex cursor-not-allowed items-center justify-center rounded-tl-sm rounded-bl-sm border-transparent px-2 py-2 md:px-4 md:py-3 opacity-40 transition-opacity duration-150'
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
        </span>
      ) : (
        <Link
          to={{
            pathname: basePath,
            search: createSearchParams({
              ...filtersAsStrings,
              page: (safePage - 1).toString()
            }).toString()
          }}
          className='flex cursor-pointer items-center justify-center rounded-tl-sm rounded-bl-sm border-transparent px-2 py-2 md:px-4 md:py-3 transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95'
          aria-label='Go to previous page'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-5 w-5 text-[rgba(0,0,0,0.6)] dark:text-gray-400'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
          </svg>
        </Link>
      )}
      {/* {page === } */}
      {renderPagination()}
      {safePage === safePageSize ? (
        <span
          aria-label="Trang sau"
          aria-disabled="true"
          className='flex cursor-not-allowed items-center justify-center rounded-tr-sm rounded-br-sm border-transparent px-2 py-2 md:px-4 md:py-3 opacity-40 transition-opacity duration-150'
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
        </span>
      ) : (
        <Link
          to={{
            pathname: basePath,
            search: createSearchParams({
              ...filtersAsStrings,
              page: (safePage + 1).toString()
            }).toString()
          }}
          className='flex cursor-pointer items-center justify-center rounded-tr-sm rounded-br-sm border-transparent px-2 py-2 md:px-4 md:py-3 transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95'
          aria-label='Go to next page'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-5 w-5 text-[rgba(0,0,0,.6)] dark:text-gray-400'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
          </svg>
        </Link>
      )}
    </nav>
  )
}

export default Pagination
