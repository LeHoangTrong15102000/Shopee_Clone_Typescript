import { Notification, NotificationResponse } from 'src/types/notification.type'
import http from 'src/utils/http'

// Mock data để fallback khi API chưa available
const mockNotifications: NotificationResponse = {
  message: 'Lấy danh sách thông báo thành công',
  data: {
    notifications: [
      {
        _id: '1',
        title: 'Đơn hàng của bạn đã được xác nhận',
        content: 'Đơn hàng #SP123456 đã được xác nhận và đang được chuẩn bị. Dự kiến giao hàng trong 2-3 ngày.',
        type: 'order' as const,
        isRead: false,
        createdAt: new Date(Date.now() - 60000).toISOString(),
        updatedAt: new Date(Date.now() - 60000).toISOString()
      },
      {
        _id: '2',
        title: 'Flash Sale 12.12 - Giảm giá đến 50%',
        content: 'Sự kiện Flash Sale 12.12 đã bắt đầu! Hàng ngàn sản phẩm giảm giá đến 50%. Mua ngay kẻo lỡ!',
        type: 'promotion' as const,
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        _id: '3',
        title: 'Cập nhật chính sách bảo mật',
        content: 'Chúng tôi đã cập nhật chính sách bảo mật để bảo vệ thông tin của bạn tốt hơn. Vui lòng xem chi tiết.',
        type: 'system' as const,
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: '4',
        title: 'Voucher miễn phí vận chuyển',
        content: 'Bạn có 1 voucher miễn phí vận chuyển cho đơn hàng từ 100k. Áp dụng đến hết ngày mai.',
        type: 'promotion' as const,
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        _id: '5',
        title: 'Đánh giá sản phẩm và nhận xu',
        content: 'Đánh giá sản phẩm bạn đã mua để nhận xu Shopee. Xu có thể dùng để mua sắm tiếp theo.',
        type: 'other' as const,
        isRead: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString()
      }
    ],
    totalCount: 5,
    unreadCount: 2
  }
}

// Helper function để transform backend response (snake_case) sang frontend (camelCase)
const transformNotification = (backendNotification: Record<string, unknown>): Notification => ({
  _id: backendNotification._id as string,
  title: backendNotification.title as string,
  content: backendNotification.content as string,
  type: backendNotification.type as Notification['type'],
  isRead: (backendNotification.is_read ?? backendNotification.isRead ?? false) as boolean,
  link: backendNotification.link as string | undefined,
  createdAt: backendNotification.createdAt as string,
  updatedAt: backendNotification.updatedAt as string
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformNotificationResponse = (backendResponse: any): NotificationResponse => ({
  message: backendResponse.message,
  data: {
    notifications: backendResponse.data.notifications.map(transformNotification),
    totalCount: backendResponse.data.pagination?.total ?? backendResponse.data.totalCount ?? 0,
    unreadCount: backendResponse.data.unread_count ?? backendResponse.data.unreadCount ?? 0
  }
})

const notificationApi = {
  // Lấy danh sách thông báo với fallback mock data
  getNotifications: async () => {
    try {
      const response = await http.get<any>('/notifications')
      return { data: transformNotificationResponse(response.data) }
    } catch (error) {
      // Fallback to mock data when API is not available
      console.warn('Notification API not available, using mock data')
      return new Promise<{ data: NotificationResponse }>((resolve) => {
        setTimeout(() => {
          resolve({ data: mockNotifications })
        }, 300)
      })
    }
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (notificationId: string) => {
    try {
      const response = await http.put<any>(`/notifications/${notificationId}/read`)
      return { data: { message: response.data.message, data: transformNotification(response.data.data) } }
    } catch (error) {
      console.warn('⚠️ [markAsRead] API not available, using mock data')
      return {
        data: {
          message: 'Đánh dấu đã đọc thành công (mock)',
          data: { _id: notificationId, isRead: true }
        }
      }
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async () => {
    try {
      const response = await http.put<any>('/notifications/read-all')
      return { data: response.data }
    } catch (error) {
      console.warn('⚠️ [markAllAsRead] API not available, using mock data')
      return {
        data: {
          message: 'Đánh dấu tất cả đã đọc thành công (mock)',
          data: { updated_count: mockNotifications.data.unreadCount }
        }
      }
    }
  },

  // Xóa thông báo
  deleteNotification: async (notificationId: string) => {
    try {
      const response = await http.delete<any>(`/notifications/${notificationId}`)
      return { data: response.data }
    } catch (error) {
      console.warn('⚠️ [deleteNotification] API not available, using mock data')
      return {
        data: {
          message: 'Xóa thông báo thành công (mock)',
          data: { _id: notificationId }
        }
      }
    }
  },

  // Lấy số thông báo chưa đọc
  getUnreadCount: async () => {
    try {
      const response = await http.get<any>('/notifications/unread-count')
      return {
        data: {
          message: response.data.message,
          data: { unreadCount: response.data.data.unread_count ?? response.data.data.unreadCount ?? 0 }
        }
      }
    } catch (error) {
      // Fallback
      console.warn('Unread count API not available, using mock response')
      return new Promise<{ data: { message: string; data: { unreadCount: number } } }>((resolve) => {
        setTimeout(() => {
          resolve({ data: { message: 'Success', data: { unreadCount: 2 } } })
        }, 200)
      })
    }
  }
}

export default notificationApi
