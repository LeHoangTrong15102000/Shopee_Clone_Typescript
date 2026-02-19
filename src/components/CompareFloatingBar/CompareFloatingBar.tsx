import { memo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { useProductComparison } from 'src/hooks/useProductComparison'

interface CompareFloatingBarProps {
  className?: string
  comparePath?: string
}

function CompareFloatingBar({ className, comparePath = '/compare' }: CompareFloatingBarProps) {
  const { compareList, removeFromCompare, clearCompare } = useProductComparison()
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const handleRemoveFromCompare = useCallback(
    (productId: string) => {
      removeFromCompare(productId)
    },
    [removeFromCompare]
  )

  const handleClearCompare = useCallback(() => {
    clearCompare()
  }, [clearCompare])

  if (compareList.length === 0) {
    return null
  }

  return (
    <div
      role='region'
      aria-label='Thanh so sánh sản phẩm'
      className={classNames(
        'fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.15)] z-50 transition-transform duration-300',
        { 'translate-y-[calc(100%-48px)]': !isExpanded },
        className
      )}
    >
      <button
        onClick={handleToggleExpand}
        className='absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-t-lg shadow-[0_-4px_12px_rgba(0,0,0,0.1)] flex items-center gap-2'
        aria-label={isExpanded ? 'Thu gọn thanh so sánh' : 'Mở rộng thanh so sánh'}
        aria-expanded={isExpanded}
      >
        <span className='text-sm font-medium text-gray-700'>So sánh ({compareList.length})</span>
        <svg
          className={classNames('w-4 h-4 text-gray-500 transition-transform', { 'rotate-180': isExpanded })}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          aria-hidden='true'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
        </svg>
      </button>

      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3 flex-1 overflow-x-auto' role='list' aria-label='Danh sách sản phẩm so sánh'>
            {compareList.map(product => (
              <div
                key={product._id}
                className='relative flex-shrink-0 group'
                role='listitem'
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className='w-10 h-10 sm:w-14 sm:h-14 object-cover rounded-lg border border-gray-200'
                />
                <button
                  onClick={() => handleRemoveFromCompare(product._id)}
                  className='absolute -top-2 -right-2 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity'
                  aria-label={`Xóa ${product.name} khỏi so sánh`}
                >
                  <svg className='w-3 h-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
                <div
                  className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'
                  role='tooltip'
                  aria-hidden='true'
                >
                  {product.name.length > 30 ? product.name.slice(0, 30) + '...' : product.name}
                </div>
              </div>
            ))}

            {Array.from({ length: 4 - compareList.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className='w-10 h-10 sm:w-14 sm:h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0'
                aria-label='Vị trí trống cho sản phẩm so sánh'
                role='listitem'
              >
                <svg className='w-6 h-6 text-gray-300' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
              </div>
            ))}
          </div>

          <div className='flex items-center gap-3 flex-shrink-0'>
            <button
              onClick={handleClearCompare}
              className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors'
              aria-label='Xóa tất cả sản phẩm khỏi danh sách so sánh'
            >
              Xóa tất cả
            </button>
            <Link
              to={comparePath}
              className={classNames(
                'truncate px-6 py-2 bg-orange text-white text-sm font-medium rounded hover:bg-[#d73211] transition-colors',
                { 'opacity-50 pointer-events-none': compareList.length < 2 }
              )}
              aria-label={`So sánh ${compareList.length} sản phẩm`}
              aria-disabled={compareList.length < 2}
              tabIndex={compareList.length < 2 ? -1 : undefined}
            >
              So sánh ngay ({compareList.length})
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(CompareFloatingBar)

