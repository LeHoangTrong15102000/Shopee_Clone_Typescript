import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import notificationApi from 'src/apis/notification.api'
import { Notification } from 'src/types/notification.type'
import { formatTimeAgo } from 'src/utils/utils'

interface NotificationListProps {
  className?: string
}

const NotificationList = ({ className }: NotificationListProps) => {
  const queryClient = useQueryClient()

  // Query để lấy danh sách thông báo
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    staleTime: 5 * 60 * 1000 // 5 phút
  })

  // Mutation để đánh dấu thông báo đã đọc
  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Mutation để đánh dấu tất cả thông báo đã đọc
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    }
  })

  const notifications = notificationsData?.data.data.notifications || []
  const unreadCount = notificationsData?.data.data.unreadCount || 0

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  if (isLoading) {
    return (
      <div
        className={`relative max-w-[400px] rounded-sm border border-gray-200 bg-white text-sm shadow-md before:absolute before:left-0 before:top-0 before:h-[15px] before:w-full before:translate-y-[-100%] before:bg-transparent before:content-[""] ${className}`}
      >
        <div className='flex h-[250px] w-[400px] items-center justify-center'>
          <div className='text-sm text-gray-500'>Đang tải thông báo...</div>
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div
        className={`relative max-w-[400px] rounded-sm border border-gray-200 bg-white text-sm shadow-md before:absolute before:left-0 before:top-0 before:h-[15px] before:w-full before:translate-y-[-100%] before:bg-transparent before:content-[""] ${className}`}
      >
        <div className='flex h-[250px] w-[400px] flex-col items-center justify-center p-2'>
          <svg className='h-16 w-16 text-gray-300' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z' />
          </svg>
          <span className='mt-2 text-sm text-gray-500'>Bạn hiện chưa có thông báo nào</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative max-w-[400px] rounded-sm border border-gray-200 bg-white text-sm shadow-md before:absolute before:left-0 before:top-0 before:h-[15px] before:w-full before:translate-y-[-100%] before:bg-transparent before:content-[""] ${className}`}
    >
      <div className='py-[10px] pl-[10px] pr-[15px]'>
        <div className='capitalize text-[rgba(0,0,0,.26)]'>Thông báo mới nhận</div>

        {/* Notification List */}
        <div className='mt-5 max-h-[300px] overflow-y-auto'>
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`mt-2 flex cursor-pointer py-2 pr-2 transition-all duration-200 hover:bg-gray-100 hover:shadow-sm animate-fade-in ${
                !notification.isRead ? 'bg-[#fff5f5] border-l-2 border-[#ee4d2d]' : 'hover:scale-[1.01]'
              }`}
              onClick={() =>
                !notification.isRead && !markAsReadMutation.isPending && handleMarkAsRead(notification._id)
              }
            >
              {/* Icon */}
              <div className='flex-shrink-0'>
                <div
                  className={`h-[2.5rem] w-[2.5rem] rounded-full flex items-center justify-center ${
                    notification.type === 'order'
                      ? 'bg-green-100'
                      : notification.type === 'promotion'
                        ? 'bg-red-100'
                        : notification.type === 'system'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                  }`}
                >
                  {notification.type === 'order' && (
                    <svg className='h-5 w-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
                    </svg>
                  )}
                  {notification.type === 'promotion' && (
                    <svg className='h-5 w-5 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                  {notification.type === 'system' && (
                    <svg className='h-5 w-5 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                  {notification.type === 'other' && (
                    <svg className='h-5 w-5 text-gray-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className='ml-2 flex-grow overflow-hidden'>
                <div className='flex items-start justify-between'>
                  <div
                    className={`truncate text-sm ${!notification.isRead ? 'font-medium text-black' : 'text-gray-700'}`}
                  >
                    {notification.title}
                  </div>
                  {!notification.isRead && <div className='ml-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#ee4d2d]'></div>}
                </div>
                <div className='mt-1 text-xs text-gray-500 line-clamp-2'>{notification.content}</div>
                <div className='mt-1 text-xs text-gray-400'>{formatTimeAgo(notification.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className='mt-6 flex items-center justify-between text-gray-500'>
          <div className='text-xs capitalize'>
            {unreadCount > 0 ? (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className='text-[#ee4d2d] hover:text-[#ee4d2d]/80 disabled:opacity-50 transition-colors'
                title='Đánh dấu tất cả thông báo là đã đọc'
              >
                {markAllAsReadMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu đã đọc tất cả'}
              </button>
            ) : (
              <span className='text-green-600'>✓ Tất cả đã đọc</span>
            )}
          </div>
          <button className='rounded-sm bg-[#ee4d2d] px-4 py-2 text-xs capitalize text-white hover:bg-opacity-90'>
            Xem tất cả
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationList
