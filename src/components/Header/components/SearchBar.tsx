import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SearchSuggestions from '../SearchSuggestions'
import SearchHistory from 'src/components/SearchHistory'
import { useProductQueryStates } from 'src/hooks/nuqs'
import useSearchHistory from 'src/hooks/useSearchHistory'

interface SearchBarProps {
  filters: ReturnType<typeof useProductQueryStates>[0]
  setFilters: ReturnType<typeof useProductQueryStates>[1]
}

const SearchBar = ({ filters, setFilters }: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [showSearchHistory, setShowSearchHistory] = useState<boolean>(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowSearchHistory(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false)
        setShowSearchHistory(false)
        inputRef.current?.blur()
      }
    }

    if (showSuggestions || showSearchHistory) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showSuggestions, showSearchHistory])

  const handleChangeInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSearchValue(value)
    if (value.trim()) {
      setShowSearchHistory(false)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setShowSearchHistory(true)
    }
  }, [])

  const handleFocusInput = useCallback(() => {
    if (!searchValue.trim()) {
      setShowSearchHistory(true)
      setShowSuggestions(false)
    } else {
      setShowSuggestions(true)
      setShowSearchHistory(false)
    }
  }, [searchValue])

  const handleBlurInput = useCallback(() => {
    setTimeout(() => {
      if (!searchContainerRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setShowSearchHistory(false)
      }
    }, 150)
  }, [])

  const searchParamsName = useMemo(() => filters.name ?? '', [filters.name])

  useEffect(() => {
    if (searchParamsName) {
      setSearchValue(searchParamsName)
    }
  }, [searchParamsName])

  const handleHideSuggestions = useCallback(() => {
    setShowSuggestions(false)
    setShowSearchHistory(false)
  }, [])

  const handleSearchSubmit = useCallback(
    (searchTerm?: string) => {
      const finalSearchValue = searchTerm || searchValue.trim()

      if (!finalSearchValue) return

      addToHistory(finalSearchValue)

      if (filters.order) {
        setFilters({ name: finalSearchValue, order: null, sort_by: 'createdAt' as const })
      } else {
        setFilters({ name: finalSearchValue })
      }

      setShowSuggestions(false)
      setShowSearchHistory(false)
      inputRef.current?.blur()
    },
    [searchValue, addToHistory, filters.order, setFilters]
  )

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      setSearchValue(suggestion)
      handleSearchSubmit(suggestion)
    },
    [handleSearchSubmit]
  )

  const handleSelectHistoryItem = useCallback(
    (query: string) => {
      setSearchValue(query)
      setShowSearchHistory(false)
      handleSearchSubmit(query)
    },
    [handleSearchSubmit]
  )

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      handleSearchSubmit()
    },
    [handleSearchSubmit]
  )

  return (
    <div className='col-span-7 md:col-span-8 relative' ref={searchContainerRef}>
      <form onSubmit={handleFormSubmit}>
        <div className='flex rounded-sm bg-white dark:bg-slate-800 p-1'>
          <input
            ref={inputRef}
            id='main-search-input'
            value={searchValue}
            type='text'
            className='flex-grow border-none bg-transparent px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm text-[rgba(0,0,0,.95)] dark:text-gray-100 outline-none dark:placeholder-gray-500'
            placeholder='Đăng ký và nhận voucher bạn mới đến 70k!'
            onChange={handleChangeInput}
            onFocus={handleFocusInput}
            onBlur={handleBlurInput}
          />
          <button
            type='submit'
            className='flex-shrink-0 rounded-sm bg-[linear-gradient(-180deg,#f53d2d,#f63)] py-1 md:py-2 px-3 md:px-6 hover:opacity-90'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-4 w-4 md:h-5 md:w-5'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
              />
            </svg>
          </button>
        </div>
      </form>

      <SearchSuggestions
        searchValue={searchValue}
        isVisible={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        onHide={handleHideSuggestions}
      />

      {showSearchHistory && !searchValue.trim() && (
        <SearchHistory
          history={searchHistory}
          onSelect={handleSelectHistoryItem}
          onRemove={removeFromHistory}
          onClearAll={clearHistory}
        />
      )}
    </div>
  )
}

export default SearchBar

