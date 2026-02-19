import { useState, useRef, useCallback } from 'react'
import classNames from 'classnames'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onTypingStart: () => void
  onTypingStop: () => void
  disabled?: boolean
}

export default function MessageInput({ onSendMessage, onTypingStart, onTypingStop, disabled }: MessageInputProps) {
  const [inputValue, setInputValue] = useState('')
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const clearTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value.trim() && !isTypingRef.current) {
      isTypingRef.current = true
      onTypingStart()
    }

    clearTypingTimeout()

    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false
        onTypingStop()
      }, 2000)
    } else if (isTypingRef.current) {
      isTypingRef.current = false
      onTypingStop()
    }
  }

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim()
    if (!trimmedValue || disabled) return

    clearTypingTimeout()
    if (isTypingRef.current) {
      isTypingRef.current = false
      onTypingStop()
    }

    onSendMessage(trimmedValue)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className='border-t dark:border-slate-700 bg-white dark:bg-slate-800 p-3'>
      <div className='flex gap-2'>
        <input
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder='Nhập tin nhắn...'
          disabled={disabled}
          className={classNames(
            'flex-1 rounded-full border px-4 py-2 text-sm transition-colors focus:outline-none',
            disabled
              ? 'cursor-not-allowed border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
              : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:border-orange'
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || disabled}
          className={classNames(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors',
            inputValue.trim() && !disabled
              ? 'bg-orange text-white hover:bg-[#d73211]'
              : 'cursor-not-allowed bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-gray-500'
          )}
        >
          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
          </svg>
        </button>
      </div>
    </div>
  )
}

