import { useState } from 'react'
import Popover from 'src/components/Popover'
import NotificationItem from './NotificationItem'
import NotificationBadge from './NotificationBadge'

// Mock data - sau này sẽ thay thế bằng API thực
const mockNotifications = [
  {
    id: '1',
    title: 'Khuyến mãi đặc biệt',
    message: 'Giảm giá đến 50% cho tất cả sản phẩm điện tử. Nhanh tay kẻo lỡ!',
    time: '2 phút trước',
    isRead: false,
    type: 'promotion' as const,
    image: 'https://down-vn.img.susercontent.com/file/7638c2acc113ee59802edd214fc81fbe'
  },
  {
    id: '2',
    title: 'Đơn hàng đã được xác nhận',
    message: 'Đơn hàng #SP123456 của bạn đã được xác nhận và đang chuẩn bị giao.',
    time: '1 giờ trước',
    isRead: false,
    type: 'order' as const
  },
  {
    id: '3',
    title: 'Flash Sale sắp bắt đầu',
    message: 'Flash Sale 12:00 sắp bắt đầu với hàng ngàn sản phẩm giá shock.',
    time: '3 giờ trước',
    isRead: true,
    type: 'sale' as const
  }
]

const NotificationDropdown = () => {
  const [notifications] = useState(mockNotifications)
  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const renderNotifications = () => (
    <div className='relative max-w-[400px] rounded-sm border border-gray-200 bg-white shadow-lg'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
        <h3 className='text-sm font-medium text-gray-900'>Thông báo mới nhận</h3>
        {unreadCount > 0 && <span className='text-xs text-[#ee4d2d]'>{unreadCount} thông báo mới</span>}
      </div>

      {/* Notification List */}
      <div className='max-h-[400px] overflow-y-auto'>
        {notifications.length > 0 ? (
          notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} />)
        ) : (
          <div className='flex flex-col items-center justify-center py-8 px-4'>
            <svg className='w-12 h-12 text-gray-300 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M15 17h5l-5-5 5-5h-5m-6 10h5l-5-5 5-5H9'
              />
            </svg>
            <p className='text-sm text-gray-500 text-center'>Chưa có thông báo nào</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className='px-4 py-3 border-t border-gray-100'>
          <button className='text-sm text-[#ee4d2d] hover:text-[#d73527] w-full text-center'>
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  )

  return (
    <Popover className='relative' renderPopover={renderNotifications()} placement='bottom-end'>
      <button className='relative flex items-center justify-center text-white hover:text-white/80 transition-colors'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-6 h-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0'
          />
        </svg>
        <NotificationBadge count={unreadCount} />
      </button>
    </Popover>
  )
}

export default NotificationDropdown
