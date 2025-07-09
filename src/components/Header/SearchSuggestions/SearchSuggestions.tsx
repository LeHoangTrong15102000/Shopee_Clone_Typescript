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
    _id: '60afafe76ef5b902180aacb5',
    name: 'Điện thoại Apple iPhone 12 64GB - Hàng chính hãng VNA',
    image: 'https://down-vn.img.susercontent.com/file/2c3cb693e7d5c78d875e82c4a18d1eb9',
    price: 20990000
  },
  {
    _id: '60afb1c76ef5b902180aacba',
    name: 'Điện thoại OPPO A12 (3GB/32GB) - Hàng chính hãng',
    image: 'https://down-vn.img.susercontent.com/file/3fb746c8df6774e65b2d8dd87dd8a15b',
    price: 2590000
  },
  {
    _id: '60afb07e6ef5b902180aacb8',
    name: 'Điện Thoại Xiaomi Redmi 9A 2GB/32GB - Hàng Chính Hãng',
    image: 'https://down-vn.img.susercontent.com/file/bccaf5c5087e89b51b00dcba5f1b181d',
    price: 1949000
  }
]

const SearchSuggestions = ({ searchValue, isVisible, onSelectSuggestion, onHide }: Props) => {
  const debouncedSearchValue = useDebounce(searchValue, 500)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  // State để track các hình ảnh bị lỗi và ngăn re-render liên tục
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Query để lấy search suggestions
  const { data: suggestionsData, isError: suggestionsError } = useQuery({
    queryKey: ['searchSuggestions', debouncedSearchValue],
    queryFn: () => productApi.getSearchSuggestions({ q: debouncedSearchValue || '' }),
    enabled: Boolean(debouncedSearchValue?.trim()),
    staleTime: 30000, // Cache 30 giây
    retry: 1 // Retry tối đa 1 lần nếu lỗi
  })

  // Query để lấy search history
  const { data: historyData, isError: historyError } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: () => productApi.getSearchHistory(),
    staleTime: 60000, // Cache 1 phút
    retry: 1 // Retry tối đa 1 lần nếu lỗi
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
      // Lưu vào search history với error handling
      productApi.saveSearchHistory({ keyword: suggestion }).catch((error) => {
        console.warn('Không thể lưu lịch sử tìm kiếm:', error)
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

  return (
    <div className='absolute top-full left-0 z-50 mt-[-6px] max-h-[350px] md:max-h-[400px] min-h-[50px] w-full min-w-[280px] md:min-w-[300px] overflow-hidden rounded-sm bg-white py-2 shadow-lg border border-gray-200'>
      <div className='max-h-[330px] md:max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400'>
        {searchValue.trim() ? (
          <>
            {/* Gợi ý tìm kiếm */}
            {suggestions.length > 0 && (
              <div className='px-3 md:px-4 py-2'>
                <div className='text-xs text-gray-500 mb-2'>Gợi ý tìm kiếm</div>
                {suggestions.map((suggestion, index) => (
                  <SearchSuggestionItem
                    key={index}
                    suggestion={suggestion}
                    searchValue={searchValue}
                    onSelect={() => handleSelectSuggestion(suggestion)}
                  />
                ))}
              </div>
            )}

            {/* Sản phẩm gợi ý */}
            {products.length > 0 && (
              <div className='border-t border-gray-100 px-3 md:px-4 py-2'>
                <div className='text-xs text-gray-500 mb-2'>Sản phẩm gợi ý</div>
                <div className='space-y-1'>
                  {products.map((product) => (
                    <ProductItem key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Không có kết quả */}
            {suggestions.length === 0 && products.length === 0 && debouncedSearchValue && !suggestionsError && (
              <div className='px-3 md:px-4 py-6 md:py-8 text-center'>
                <svg
                  className='w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                <p className='text-gray-500 text-xs md:text-sm'>Không tìm thấy kết quả cho "{debouncedSearchValue}"</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Lịch sử tìm kiếm */}
            {searchHistory.length > 0 && (
              <div className='px-3 md:px-4 py-2'>
                <div className='text-xs text-gray-500 mb-2'>Tìm kiếm gần đây</div>
                {searchHistory.slice(0, 5).map((historyItem, index) => (
                  <SearchHistoryItem
                    key={index}
                    historyItem={historyItem}
                    onSelect={() => handleSelectSuggestion(historyItem)}
                  />
                ))}
              </div>
            )}

            {/* Thông báo mặc định */}
            {searchHistory.length === 0 && (
              <div className='px-3 md:px-4 py-6 md:py-8 text-center'>
                <svg
                  className='w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                <p className='text-gray-500 text-xs md:text-sm'>Nhập từ khóa để tìm kiếm sản phẩm</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchSuggestions
