export interface Notification {
  _id: string
  title: string
  content: string
  type: 'promotion' | 'order' | 'system' | 'other'
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationResponse {
  message: string
  data: {
    notifications: Notification[]
    totalCount: number
    unreadCount: number
  }
}
