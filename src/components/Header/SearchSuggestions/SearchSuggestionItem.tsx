import React from 'react'

interface Props {
  suggestion: string
  searchValue: string
  onSelect: () => void
}

const SearchSuggestionItem = ({ suggestion, searchValue, onSelect }: Props) => {
  // Highlight từ khóa tìm kiếm trong suggestion
  const highlightSearchValue = (text: string, searchValue: string) => {
    if (!searchValue) return text

    const regex = new RegExp(`(${searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className='text-[#ee4d2d] font-medium'>
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <div
      className='flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer -mx-2 transition-colors'
      onClick={onSelect}
    >
      <svg
        className='w-3 h-3 md:w-4 md:h-4 text-gray-400 mr-2 md:mr-3 flex-shrink-0'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
        />
      </svg>
      <span className='text-xs md:text-sm text-gray-700 flex-1 leading-tight'>
        {highlightSearchValue(suggestion, searchValue)}
      </span>
    </div>
  )
}

export default SearchSuggestionItem
