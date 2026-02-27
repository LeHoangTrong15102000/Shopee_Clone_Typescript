export interface Notification {
  _id: string
  title: string
  content: string
  type:
    | 'promotion'
    | 'order'
    | 'system'
    | 'other'
    | 'new_message'
    | 'order_update'
    | 'flash_sale_alert'
    | 'flash_sale_soldout'
  isRead: boolean
  link?: string
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
