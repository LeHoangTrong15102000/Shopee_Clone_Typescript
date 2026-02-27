import { memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchHistoryItem } from 'src/hooks/useSearchHistory'

interface SearchHistoryProps {
  history: SearchHistoryItem[]
  trendingSearches?: string[]
  onSelect: (query: string) => void
  onRemove: (query: string) => void
  onClearAll: () => void
}

const SearchHistory = memo(function SearchHistory({
  history,
  trendingSearches = ['iPhone 15', 'Áo thun nam', 'Laptop gaming', 'Tai nghe bluetooth', 'Giày sneaker'],
  onSelect,
  onRemove,
  onClearAll
}: SearchHistoryProps) {
  const handleRemove = useCallback(
    (e: React.MouseEvent, query: string) => {
      e.stopPropagation()
      onRemove(query)
    },
    [onRemove]
  )

  return (
    <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 z-50 overflow-hidden'>
      {/* Search History Section */}
      {history.length > 0 && (
        <div className='p-3 border-b border-gray-100 dark:border-slate-600'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Lịch sử tìm kiếm</span>
            <button onClick={onClearAll} className='text-xs text-blue-500 hover:text-blue-600 transition-colors'>
              Xóa tất cả
            </button>
          </div>
          <AnimatePresence mode='popLayout'>
            {history.map((item) => (
              <motion.div
                key={item.query}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className='flex items-center justify-between py-2 px-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded cursor-pointer group'
                onClick={() => onSelect(item.query)}
              >
                <div className='flex items-center gap-2'>
                  <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>{item.query}</span>
                </div>
                <button
                  onClick={(e) => handleRemove(e, item.query)}
                  className='opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1'
                  aria-label={`Xóa "${item.query}" khỏi lịch sử`}
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Trending Searches Section */}
      <div className='p-3'>
        <div className='flex items-center gap-2 mb-2'>
          <svg className='w-4 h-4 text-orange dark:text-orange-400' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M17.56 21a1 1 0 01-.46-.11L12 18.22l-5.1 2.67a1 1 0 01-1.45-1.06l1-5.63-4.12-4a1 1 0 01-.25-1 1 1 0 01.81-.68l5.7-.83 2.51-5.13a1 1 0 011.8 0l2.54 5.12 5.7.83a1 1 0 01.81.68 1 1 0 01-.25 1l-4.12 4 1 5.63a1 1 0 01-.4 1 1 1 0 01-.62.21z' />
          </svg>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Tìm kiếm phổ biến</span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {trendingSearches.map((term) => (
            <button
              key={term}
              onClick={() => onSelect(term)}
              className='px-3 py-1.5 bg-gray-100 dark:bg-slate-900 hover:bg-orange hover:text-white text-sm text-gray-600 dark:text-gray-400 rounded-full transition-colors'
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})

export default SearchHistory
