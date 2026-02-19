import React from 'react'

interface Props {
  historyItem: string
  onSelect: () => void
  onDelete?: () => void
}

const SearchHistoryItem = ({ historyItem, onSelect, onDelete }: Props) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <div
      className='flex items-center py-2 px-4 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors group'
      onClick={onSelect}
    >
      <svg
        className='w-3 h-3 md:w-4 md:h-4 text-gray-400 dark:text-gray-500 mr-2 md:mr-3 flex-shrink-0'
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
      <span className='text-xs md:text-sm text-gray-600 dark:text-gray-300 flex-1 leading-tight'>{historyItem}</span>
      {onDelete && (
        <button
          onClick={handleDelete}
          className='opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-all'
          title='Xóa khỏi lịch sử'
        >
          <svg className='w-3 h-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      )}
    </div>
  )
}

export default SearchHistoryItem
