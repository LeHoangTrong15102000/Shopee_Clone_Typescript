import React from 'react'
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import productApi from 'src/apis/product.api'
import path from 'src/constant/path'
import { generateNameId } from 'src/utils/utils'
import useDebounce from 'src/hooks/useDebounce'
import SearchSuggestionItem from './SearchSuggestionItem'
import SearchHistoryItem from './SearchHistoryItem'

interface Props {
  searchValue: string
  isVisible: boolean
  onSelectSuggestion: (suggestion: string) => void
  onHide: () => void
}

// Mock data để fallback khi API lỗi
const mockProducts = [
  {
    _id: 'mock-1',
    name: 'iPhone 15 Pro Max',
    image: '/src/assets/images/img-product-incart.png',
    price: 28999000
  },
  {
    _id: 'mock-2',
    name: 'Samsung Galaxy S24 Ultra',
    image: '/src/assets/images/img-product-incart.png',
    price: 25999000
  },
  {
    _id: 'mock-3',
    name: 'MacBook Pro M3',
    image: '/src/assets/images/img-product-incart.png',
    price: 45999000
  }
]

/**
 * SearchSuggestions Component với Query Cancellation
 * Tự động hủy các request search cũ khi user gõ tiếp
 */
const SearchSuggestions = ({ searchValue, isVisible, onSelectSuggestion, onHide }: Props) => {
  const debouncedSearchValue = useDebounce(searchValue, 300) // Giảm từ 500ms xuống 300ms cho responsive hơn
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // State để track các hình ảnh bị lỗi và ngăn re-render liên tục
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  /**
   * Query để lấy search suggestions với Query Cancellation
   * TanStack Query sẽ tự động hủy request cũ khi debouncedSearchValue thay đổi
   */
  const {
    data: suggestionsData,
    isError: suggestionsError,
    isFetching
  } = useQuery({
    queryKey: ['searchSuggestions', debouncedSearchValue],
    queryFn: ({ signal }) => {
      // Truyền AbortSignal vào API call để support cancellation
      return productApi.getSearchSuggestions({ q: debouncedSearchValue || '' }, { signal })
    },
    enabled: Boolean(debouncedSearchValue?.trim()) && (debouncedSearchValue?.length ?? 0) > 1,
    staleTime: 30000, // Cache 30 giây
    retry: (failureCount, error: any) => {
      // Không retry nếu request bị abort (do cancellation)
      if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
        return false
      }
      return failureCount < 1 // Retry tối đa 1 lần nếu lỗi khác
    }
  })

  /**
   * Query để lấy search history với Query Cancellation
   */
  const { data: historyData, isError: historyError } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: ({ signal }) => {
      // Truyền AbortSignal vào API call
      return productApi.getSearchHistory({ signal })
    },
    staleTime: 60000, // Cache 1 phút
    retry: (failureCount, error: any) => {
      // Không retry nếu request bị abort
      if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
        return false
      }
      return failureCount < 1
    }
  })

  useEffect(() => {
    if (historyData?.data.data) {
      setSearchHistory(historyData.data.data)
    } else if (historyError) {
      // Fallback với mock data khi API lỗi
      setSearchHistory(['điện thoại', 'áo thun', 'giày thể thao', 'laptop'])
    }
  }, [historyData, historyError])

  // Reset failed images khi search value thay đổi
  useEffect(() => {
    setFailedImages(new Set())
  }, [debouncedSearchValue])

  // Fallback data khi API lỗi - dùng useMemo để tối ưu performance
  const suggestions = useMemo(
    () =>
      suggestionsData?.data.data.suggestions ||
      (suggestionsError && debouncedSearchValue
        ? [
            `${debouncedSearchValue} samsung`,
            `${debouncedSearchValue} iphone`,
            `${debouncedSearchValue} oppo`,
            `${debouncedSearchValue} xiaomi`
          ].filter((item) => item.trim() !== debouncedSearchValue)
        : []),
    [suggestionsData, suggestionsError, debouncedSearchValue]
  )

  const products = useMemo(
    () =>
      suggestionsData?.data.data.products ||
      (suggestionsError && debouncedSearchValue
        ? mockProducts.filter((product) => product.name.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
        : []),
    [suggestionsData, suggestionsError, debouncedSearchValue]
  )

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      onSelectSuggestion(suggestion)

      // Lưu vào search history với error handling và cancellation support
      productApi.saveSearchHistory({ keyword: suggestion }, {}).catch((error) => {
        // Bỏ qua lỗi nếu request bị cancel
        if (error?.name !== 'AbortError' && error?.code !== 'ERR_CANCELED') {
          console.warn('Không thể lưu lịch sử tìm kiếm:', error)
        }
      })
      onHide()
    },
    [onSelectSuggestion, onHide]
  )

  // Xử lý lỗi hình ảnh - chỉ thay đổi source một lần duy nhất
  const handleImageError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>, productId: string) => {
      const img = event.target as HTMLImageElement

      // Kiểm tra xem hình ảnh này đã bị lỗi chưa
      if (!failedImages.has(productId)) {
        // Đánh dấu hình ảnh này đã lỗi
        setFailedImages((prev) => new Set(prev).add(productId))

        // Thay thế bằng hình ảnh placeholder an toàn (base64 SVG)
        img.src =
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMiAxNkwyOCAyNE0yOCAxNkwxMiAyNCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K'
      }
    },
    [failedImages]
  )

  // Tạo component ProductItem để tối ưu rendering
  const ProductItem = React.memo(({ product }: { product: any }) => {
    const imageUrl = failedImages.has(product._id)
      ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMiAxNkwyOCAyNE0yOCAxNkwxMiAyNCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K'
      : product.image

    return (
      <Link
        key={product._id}
        to={`${path.products}${generateNameId({ name: product.name, id: product._id })}`}
        className='flex items-center py-2 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors'
        onClick={onHide}
      >
        <div className='flex-shrink-0 w-8 h-8 md:w-10 md:h-10 mr-2 md:mr-3'>
          <img
            src={imageUrl}
            alt={product.name}
            className='w-full h-full object-cover rounded border border-gray-200 bg-gray-100'
            onError={(e) => handleImageError(e, product._id)}
            loading='lazy'
          />
        </div>
        <div className='flex-1 min-w-0'>
          <div className='text-xs md:text-sm text-gray-900 truncate font-medium leading-tight'>{product.name}</div>
          <div className='text-xs text-[#ee4d2d] font-semibold'>₫{product.price.toLocaleString('vi-VN')}</div>
        </div>
        <div className='flex-shrink-0'>
          <svg className='w-3 h-3 md:w-4 md:h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </div>
      </Link>
    )
  })

  if (!isVisible) return null

  // Hiển thị loading state khi đang fetch
  const showLoading = isFetching && (debouncedSearchValue?.length ?? 0) > 1

  return (
    <div className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'>
      {showLoading && (
        <div className='flex items-center justify-center py-4'>
          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#ee4d2d]'></div>
          <span className='ml-2 text-sm text-gray-600'>Đang tìm kiếm...</span>
        </div>
      )}

      {!showLoading && (debouncedSearchValue?.length ?? 0) > 1 && (
        <>
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className='border-b border-gray-100'>
              <div className='px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                Gợi ý tìm kiếm
              </div>
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <SearchSuggestionItem
                  key={index}
                  suggestion={suggestion}
                  searchValue={debouncedSearchValue || ''}
                  onSelect={() => handleSelectSuggestion(suggestion)}
                />
              ))}
            </div>
          )}

          {/* Product Results */}
          {products.length > 0 && (
            <div>
              <div className='px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                Sản phẩm ({products.length > 5 ? '5+' : products.length})
              </div>
              <div className='px-4 pb-2'>
                {products.slice(0, 5).map((product) => (
                  <ProductItem key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {suggestions.length === 0 && products.length === 0 && !showLoading && (
            <div className='px-4 py-6 text-center text-gray-500'>
              <svg className='mx-auto h-8 w-8 text-gray-400 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
              <p className='text-sm'>Không tìm thấy kết quả cho "{debouncedSearchValue}"</p>
            </div>
          )}
        </>
      )}

      {/* Search History - Hiển thị khi không có search value */}
      {!debouncedSearchValue && searchHistory.length > 0 && (
        <div>
          <div className='px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide'>Lịch sử tìm kiếm</div>
          {searchHistory.slice(0, 5).map((item, index) => (
            <SearchHistoryItem key={index} historyItem={item} onSelect={() => handleSelectSuggestion(item)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchSuggestions
