import React from 'react'

interface Props {
  historyItem: string
  onSelect: () => void
}

const SearchHistoryItem = ({ historyItem, onSelect }: Props) => {
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
          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
      <span className='text-xs md:text-sm text-gray-600 flex-1 leading-tight'>{historyItem}</span>
    </div>
  )
}

export default SearchHistoryItem
