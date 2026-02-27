import { formatDistanceToNow } from 'date-fns'
import vi from 'date-fns/locale/vi'
import { NotificationPayload } from 'src/types/socket.types'

interface Props {
  notification: NotificationPayload
  onMarkAsRead?: (id: string) => void
}

const NotificationItem = ({ notification, onMarkAsRead }: Props) => {
  const getTypeIcon = (type: NotificationPayload['type']) => {
    switch (type) {
      case 'promotion':
        return (
          <div className='w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center'>
            <svg
              className='w-4 h-4 text-yellow-600 dark:text-yellow-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
              />
            </svg>
          </div>
        )
      case 'order':
        return (
          <div className='w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center'>
            <svg
              className='w-4 h-4 text-green-600 dark:text-green-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
              />
            </svg>
          </div>
        )
      case 'system':
        return (
          <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
            <svg
              className='w-4 h-4 text-blue-600 dark:text-blue-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
        )
      case 'new_message':
        return (
          <div className='w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center'>
            <svg
              className='w-4 h-4 text-purple-600 dark:text-purple-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
          </div>
        )
      case 'other':
      default:
        return (
          <div className='w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center'>
            <svg
              className='w-4 h-4 text-gray-600 dark:text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
              />
            </svg>
          </div>
        )
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi })
    } catch {
      return dateString
    }
  }

  const handleClick = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification._id)
    }
  }

  return (
    <div
      onClick={handleClick}
      className='flex items-start p-4 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-700 last:border-b-0 bg-blue-50 dark:bg-slate-700/50 cursor-pointer'
    >
      <div className='flex-shrink-0 mr-3'>{getTypeIcon(notification.type)}</div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between'>
          <h4 className='text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1'>{notification.title}</h4>
          <div className='w-2 h-2 bg-orange rounded-full ml-2 flex-shrink-0'></div>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>{notification.content}</p>
        <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>{formatTime(notification.created_at)}</p>
      </div>
    </div>
  )
}

export default NotificationItem
