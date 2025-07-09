import React from 'react'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  isRead: boolean
  type: 'promotion' | 'order' | 'sale'
  image?: string
}

interface Props {
  notification: Notification
}

const NotificationItem = ({ notification }: Props) => {
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'promotion':
        return (
          <div className='w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center'>
            <svg className='w-4 h-4 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
          <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
            <svg className='w-4 h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
              />
            </svg>
          </div>
        )
      case 'sale':
        return (
          <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
            <svg className='w-4 h-4 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
              />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`flex items-start p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${!notification.isRead ? 'bg-blue-50' : ''}`}
    >
      {/* Icon hoặc hình ảnh */}
      <div className='flex-shrink-0 mr-3'>
        {notification.image ? (
          <img src={notification.image} alt={notification.title} className='w-8 h-8 rounded object-cover' />
        ) : (
          getTypeIcon(notification.type)
        )}
      </div>

      {/* Nội dung thông báo */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between'>
          <h4
            className={`text-sm font-medium text-gray-900 line-clamp-1 ${!notification.isRead ? 'font-semibold' : ''}`}
          >
            {notification.title}
          </h4>
          {!notification.isRead && <div className='w-2 h-2 bg-[#ee4d2d] rounded-full ml-2 flex-shrink-0'></div>}
        </div>
        <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{notification.message}</p>
        <p className='text-xs text-gray-400 mt-1'>{notification.time}</p>
      </div>
    </div>
  )
}

export default NotificationItem
