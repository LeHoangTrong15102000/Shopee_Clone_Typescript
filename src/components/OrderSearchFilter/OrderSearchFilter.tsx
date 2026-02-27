import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import classNames from 'classnames'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { ANIMATION_DURATION } from 'src/styles/animations'
import { formatCurrency } from 'src/utils/utils'

export interface OrderSearchFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  dateRange: { from: string; to: string } | null
  onDateRangeChange: (range: { from: string; to: string } | null) => void
  priceRange: { min: number; max: number } | null
  onPriceRangeChange: (range: { min: number; max: number } | null) => void
  onClearAll: () => void
  activeFilterCount: number
  totalResults?: number
  className?: string
}

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8, x: -10 },
  visible: { opacity: 1, scale: 1, x: 0, transition: { duration: ANIMATION_DURATION.normal } },
  exit: { opacity: 0, scale: 0.8, x: 10, transition: { duration: ANIMATION_DURATION.fast } }
}

const panelVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: ANIMATION_DURATION.normal } },
  exit: { opacity: 0, height: 0, transition: { duration: ANIMATION_DURATION.fast } }
}

export default function OrderSearchFilter({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  priceRange,
  onPriceRangeChange,
  onClearAll,
  activeFilterCount,
  totalResults,
  className
}: OrderSearchFilterProps) {
  const reducedMotion = useReducedMotion()
  const [inputValue, setInputValue] = useState(searchQuery)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // Local state for filter inputs
  const [dateFrom, setDateFrom] = useState(dateRange?.from || '')
  const [dateTo, setDateTo] = useState(dateRange?.to || '')
  const [priceMin, setPriceMin] = useState(priceRange?.min?.toString() || '')
  const [priceMax, setPriceMax] = useState(priceRange?.max?.toString() || '')

  // Sync external state changes
  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    setDateFrom(dateRange?.from || '')
    setDateTo(dateRange?.to || '')
  }, [dateRange])

  useEffect(() => {
    setPriceMin(priceRange?.min?.toString() || '')
    setPriceMax(priceRange?.max?.toString() || '')
  }, [priceRange])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchQuery) {
        onSearchChange(inputValue)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, searchQuery, onSearchChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleClearSearch = useCallback(() => {
    setInputValue('')
    onSearchChange('')
  }, [onSearchChange])

  // Date range handlers
  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrom = e.target.value
    setDateFrom(newFrom)
    if (newFrom && dateTo) {
      onDateRangeChange({ from: newFrom, to: dateTo })
    } else if (!newFrom && !dateTo) {
      onDateRangeChange(null)
    }
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTo = e.target.value
    setDateTo(newTo)
    if (dateFrom && newTo) {
      onDateRangeChange({ from: dateFrom, to: newTo })
    } else if (!dateFrom && !newTo) {
      onDateRangeChange(null)
    }
  }

  const handleClearDateRange = useCallback(() => {
    setDateFrom('')
    setDateTo('')
    onDateRangeChange(null)
  }, [onDateRangeChange])

  // Price range handlers
  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPriceMin(value)
    const min = parseFloat(value)
    const max = parseFloat(priceMax)
    if (!isNaN(min) && !isNaN(max)) {
      onPriceRangeChange({ min, max })
    } else if (value === '' && priceMax === '') {
      onPriceRangeChange(null)
    }
  }

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPriceMax(value)
    const min = parseFloat(priceMin)
    const max = parseFloat(value)
    if (!isNaN(min) && !isNaN(max)) {
      onPriceRangeChange({ min, max })
    } else if (priceMin === '' && value === '') {
      onPriceRangeChange(null)
    }
  }

  const handleClearPriceRange = useCallback(() => {
    setPriceMin('')
    setPriceMax('')
    onPriceRangeChange(null)
  }, [onPriceRangeChange])

  const handleClearAllFilters = useCallback(() => {
    setInputValue('')
    setDateFrom('')
    setDateTo('')
    setPriceMin('')
    setPriceMax('')
    onClearAll()
  }, [onClearAll])

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen((prev) => !prev)
  }

  const hasSearchFilter = searchQuery.trim().length > 0
  const hasDateFilter = dateRange !== null
  const hasPriceFilter = priceRange !== null
  const hasAnyFilter = activeFilterCount > 0

  return (
    <div className={classNames('bg-white dark:bg-slate-800 rounded-sm shadow-sm p-4', className)}>
      {/* Search Input Row */}
      <div className='flex flex-col sm:flex-row gap-3'>
        {/* Search Input */}
        <div className='relative flex-1'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-5 h-5 text-gray-400 dark:text-gray-500'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
              />
            </svg>
          </div>
          <input
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Tìm kiếm đơn hàng theo tên sản phẩm...'
            className='w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-slate-600 rounded-sm bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] focus:bg-white dark:focus:bg-slate-800 transition-colors'
            aria-label='Tìm kiếm đơn hàng'
          />
          {inputValue && (
            <button
              type='button'
              onClick={handleClearSearch}
              className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
              aria-label='Xóa tìm kiếm'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-5 h-5'
                aria-hidden='true'
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          type='button'
          onClick={toggleFilterPanel}
          className={classNames(
            'relative flex items-center gap-2 px-4 py-2.5 border rounded-sm text-sm font-medium transition-colors',
            {
              'border-[#ee4d2d] text-[#ee4d2d] bg-[#ee4d2d]/5 dark:bg-[#ee4d2d]/10': isFilterPanelOpen || hasAnyFilter,
              'border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-slate-500':
                !isFilterPanelOpen && !hasAnyFilter
            }
          )}
          aria-expanded={isFilterPanelOpen}
          aria-label='Mở bộ lọc nâng cao'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-5 h-5'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75'
            />
          </svg>
          <span>Bộ lọc</span>
          {activeFilterCount > 0 && (
            <span className='absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-[#ee4d2d] text-white text-xs font-bold rounded-full'>
              {activeFilterCount}
            </span>
          )}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            className={classNames('w-4 h-4 transition-transform', {
              'rotate-180': isFilterPanelOpen
            })}
            aria-hidden='true'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
          </svg>
        </button>
      </div>

      {/* Collapsible Filter Panel */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div
            variants={reducedMotion ? undefined : panelVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='overflow-hidden'
          >
            <div className='mt-4 p-4 border border-gray-200 dark:border-slate-700 rounded-sm bg-gray-50/50 dark:bg-slate-900/50'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Date Range Filter */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Khoảng thời gian
                  </label>
                  <div className='flex items-center gap-2'>
                    <div className='flex-1'>
                      <input
                        type='date'
                        value={dateFrom}
                        onChange={handleDateFromChange}
                        className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-sm text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] transition-colors'
                        aria-label='Từ ngày'
                      />
                    </div>
                    <span className='text-gray-400 dark:text-gray-500'>-</span>
                    <div className='flex-1'>
                      <input
                        type='date'
                        value={dateTo}
                        onChange={handleDateToChange}
                        className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-sm text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] transition-colors'
                        aria-label='Đến ngày'
                      />
                    </div>
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Khoảng giá</label>
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 relative'>
                      <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500 text-sm'>
                        ₫
                      </span>
                      <input
                        type='number'
                        value={priceMin}
                        onChange={handlePriceMinChange}
                        placeholder='Từ'
                        min='0'
                        className='w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-sm text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] transition-colors'
                        aria-label='Giá tối thiểu'
                      />
                    </div>
                    <span className='text-gray-400 dark:text-gray-500'>-</span>
                    <div className='flex-1 relative'>
                      <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500 text-sm'>
                        ₫
                      </span>
                      <input
                        type='number'
                        value={priceMax}
                        onChange={handlePriceMaxChange}
                        placeholder='Đến'
                        min='0'
                        className='w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-sm text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] transition-colors'
                        aria-label='Giá tối đa'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters & Results Count */}
      <div className='mt-3 flex items-center justify-between flex-wrap gap-2'>
        <div className='flex items-center gap-2 flex-wrap'>
          {totalResults !== undefined && (
            <span className='text-sm text-gray-600 dark:text-gray-300'>Tìm thấy {totalResults} đơn hàng</span>
          )}

          {/* Filter Chips */}
          <AnimatePresence mode='popLayout'>
            {hasSearchFilter && (
              <motion.div
                key='search-chip'
                variants={reducedMotion ? undefined : chipVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                className='inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-[#ee4d2d] rounded-full text-xs font-medium'
              >
                <span className='max-w-[150px] truncate'>"{searchQuery}"</span>
                <button
                  type='button'
                  onClick={handleClearSearch}
                  className='hover:bg-[#ee4d2d]/20 rounded-full p-0.5 transition-colors'
                  aria-label='Xóa bộ lọc tìm kiếm'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={2}
                    stroke='currentColor'
                    className='w-3 h-3'
                    aria-hidden='true'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
                  </svg>
                </button>
              </motion.div>
            )}

            {hasDateFilter && (
              <motion.div
                key='date-chip'
                variants={reducedMotion ? undefined : chipVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                className='inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-[#ee4d2d] rounded-full text-xs font-medium'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-3 h-3'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5'
                  />
                </svg>
                <span>
                  {dateRange?.from} - {dateRange?.to}
                </span>
                <button
                  type='button'
                  onClick={handleClearDateRange}
                  className='hover:bg-[#ee4d2d]/20 rounded-full p-0.5 transition-colors'
                  aria-label='Xóa bộ lọc ngày'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={2}
                    stroke='currentColor'
                    className='w-3 h-3'
                    aria-hidden='true'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
                  </svg>
                </button>
              </motion.div>
            )}

            {hasPriceFilter && (
              <motion.div
                key='price-chip'
                variants={reducedMotion ? undefined : chipVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                className='inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-[#ee4d2d] rounded-full text-xs font-medium'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-3 h-3'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                  />
                </svg>
                <span>
                  ₫{formatCurrency(priceRange?.min || 0)} - ₫{formatCurrency(priceRange?.max || 0)}
                </span>
                <button
                  type='button'
                  onClick={handleClearPriceRange}
                  className='hover:bg-[#ee4d2d]/20 rounded-full p-0.5 transition-colors'
                  aria-label='Xóa bộ lọc giá'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={2}
                    stroke='currentColor'
                    className='w-3 h-3'
                    aria-hidden='true'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear All Button */}
        {hasAnyFilter && (
          <button
            type='button'
            onClick={handleClearAllFilters}
            className='text-sm text-[#ee4d2d] hover:text-[#d73211] font-medium underline transition-colors'
          >
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>
    </div>
  )
}
