import { NotificationResponse } from 'src/types/notification.type'
import http from 'src/utils/http'

// API giả để lấy danh sách thông báo
const notificationApi = {
  getNotifications: () => {
    // Tạo dữ liệu giả cho thông báo
    const mockNotifications = {
      message: 'Lấy danh sách thông báo thành công',
      data: {
        notifications: [
          {
            _id: '1',
            title: 'Đơn hàng của bạn đã được xác nhận',
            content: 'Đơn hàng #SP123456 đã được xác nhận và đang được chuẩn bị. Dự kiến giao hàng trong 2-3 ngày.',
            type: 'order' as const,
            isRead: false,
            createdAt: new Date(Date.now() - 60000).toISOString(), // 1 phút trước
            updatedAt: new Date(Date.now() - 60000).toISOString()
          },
          {
            _id: '2',
            title: 'Flash Sale 12.12 - Giảm giá đến 50%',
            content: 'Sự kiện Flash Sale 12.12 đã bắt đầu! Hàng ngàn sản phẩm giảm giá đến 50%. Mua ngay kẻo lỡ!',
            type: 'promotion' as const,
            isRead: false,
            createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 giờ trước
            updatedAt: new Date(Date.now() - 7200000).toISOString()
          },
          {
            _id: '3',
            title: 'Cập nhật chính sách bảo mật',
            content:
              'Chúng tôi đã cập nhật chính sách bảo mật để bảo vệ thông tin của bạn tốt hơn. Vui lòng xem chi tiết.',
            type: 'system' as const,
            isRead: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 ngày trước
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: '4',
            title: 'Voucher miễn phí vận chuyển',
            content: 'Bạn có 1 voucher miễn phí vận chuyển cho đơn hàng từ 100k. Áp dụng đến hết ngày mai.',
            type: 'promotion' as const,
            isRead: true,
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 ngày trước
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            _id: '5',
            title: 'Đánh giá sản phẩm và nhận xu',
            content: 'Đánh giá sản phẩm bạn đã mua để nhận xu Shopee. Xu có thể dùng để mua sắm tiếp theo.',
            type: 'other' as const,
            isRead: true,
            createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 ngày trước
            updatedAt: new Date(Date.now() - 259200000).toISOString()
          }
        ],
        totalCount: 5,
        unreadCount: 2
      }
    }

    // Giả lập API call với Promise
    return new Promise<{ data: NotificationResponse }>((resolve) => {
      setTimeout(() => {
        resolve({ data: mockNotifications })
      }, 500) // Giả lập độ trễ API
    })
  },

  markAsRead: (notificationId: string) => {
    // API giả để đánh dấu thông báo đã đọc
    return new Promise<{ data: { message: string } }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            message: 'Đánh dấu đã đọc thành công'
          }
        })
      }, 200)
    })
  },

  markAllAsRead: () => {
    // API giả để đánh dấu tất cả thông báo đã đọc
    return new Promise<{ data: { message: string } }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            message: 'Đánh dấu tất cả đã đọc thành công'
          }
        })
      }, 300)
    })
  }
}

export default notificationApi
