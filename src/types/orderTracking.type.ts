export type OrderStatus =
  | 'pending' // Chờ xác nhận
  | 'confirmed' // Đã xác nhận
  | 'processing' // Đang xử lý
  | 'shipped' // Đã giao cho ĐVVC
  | 'in_transit' // Đang vận chuyển
  | 'out_for_delivery' // Đang giao hàng
  | 'delivered' // Đã giao
  | 'cancelled' // Đã hủy
  | 'returned' // Đã trả hàng

export interface TrackingEvent {
  _id: string
  status: OrderStatus
  description: string
  location?: string
  timestamp: string
}

export interface OrderTracking {
  order_id: string
  tracking_number: string
  carrier: string
  carrier_logo?: string
  current_status: OrderStatus
  estimated_delivery: string
  events: TrackingEvent[]
  last_updated: string
}

export interface OrderTrackingConfig {
  order_id?: string
  tracking_number?: string
}

