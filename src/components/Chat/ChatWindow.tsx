import { useState, useEffect } from 'react'
import classNames from 'classnames'
import useChat from 'src/hooks/useChat'
import useTypingIndicator from 'src/hooks/useTypingIndicator'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'

interface ChatWindowProps {
  conversationId?: string
  sellerName?: string
  currentUserId?: string
}

export default function ChatWindow({ conversationId, sellerName = 'Người bán', currentUserId }: ChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(true)
  const { messages, currentChatId, isLoading, isConnected, joinChat, leaveChat, sendMessage } = useChat()
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(currentChatId)

  useEffect(() => {
    if (conversationId && !isMinimized && isConnected) {
      joinChat(conversationId)
    }
    return () => {
      if (currentChatId) {
        leaveChat()
      }
    }
  }, [conversationId, isMinimized, isConnected])

  const handleToggle = () => {
    setIsMinimized((prev) => !prev)
  }

  const handleClose = () => {
    setIsMinimized(true)
    if (currentChatId) {
      leaveChat()
    }
  }

  const getConnectionStatus = () => {
    if (isLoading) return 'Kết nối...'
    if (!isConnected) return 'Không có kết nối'
    return 'Trực tuyến'
  }

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-400'
    if (!isConnected) return 'bg-red-400'
    return 'bg-green-400'
  }

  if (isMinimized) {
    return (
      <button
        onClick={handleToggle}
        className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-orange shadow-lg transition-transform hover:scale-105 hover:bg-[#d73211]'
      >
        <svg className='h-6 w-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
      </button>
    )
  }

  return (
    <div className='fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 flex h-[100dvh] w-full sm:h-[480px] sm:w-[350px] flex-col overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-2xl'>
      <div className='flex items-center justify-between bg-orange px-4 py-3 text-white'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white/20'>
            <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clipRule='evenodd' />
            </svg>
          </div>
          <div>
            <h3 className='text-xs sm:text-sm font-medium'>{sellerName}</h3>
            <div className='flex items-center gap-1.5'>
              <span className={classNames('h-2 w-2 rounded-full', getStatusColor())} />
              <span className='text-xs text-white/80'>{getConnectionStatus()}</span>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <button onClick={handleToggle} className='rounded p-1.5 transition-colors hover:bg-white/20' title='Thu nhỏ'>
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18 12H6' />
            </svg>
          </button>
          <button onClick={handleClose} className='rounded p-1.5 transition-colors hover:bg-white/20' title='Đóng'>
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      </div>

      <div className='flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-slate-900'>
        <MessageList messages={messages} isLoading={isLoading} currentUserId={currentUserId} />
        <TypingIndicator typingUsers={typingUsers} />
      </div>

      <MessageInput
        onSendMessage={sendMessage}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
        disabled={!isConnected}
      />
    </div>
  )
}
