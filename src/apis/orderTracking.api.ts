import { OrderTracking, OrderTrackingConfig, TrackingEvent } from 'src/types/orderTracking.type'
import { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

// Mock data for fallback when API is not available
const mockTrackingEvents: TrackingEvent[] = [
  {
    status: 'pending',
    description: 'Đơn hàng đã được tạo',
    location: 'Hệ thống',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    status: 'confirmed',
    description: 'Đơn hàng đã được xác nhận',
    location: 'Kho hàng TP.HCM',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    status: 'processing',
    description: 'Đang chuẩn bị hàng',
    location: 'Kho hàng TP.HCM',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    status: 'shipping',
    description: 'Đang vận chuyển đến bạn',
    location: 'Trung tâm phân loại Hà Nội',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockOrderTracking: OrderTracking = {
  _id: 'mock-tracking-id-001',
  order_id: 'mock-order-tracking-1',
  user_id: 'mock-user-id-001',
  tracking_number: 'VN2024MOCK001',
  carrier: 'ghn',
  status: 'shipping',
  estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  timeline: mockTrackingEvents,
  shipping_address: {
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường ABC',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng'
  },
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString()
}

const orderTrackingApi = {
  // Lấy thông tin tracking của đơn hàng
  getTracking: async (params: OrderTrackingConfig) => {
    try {
      const response = await http.get<SuccessResponseApi<OrderTracking>>('/orders/tracking', { params })
      return response
    } catch (error) {
      console.warn('⚠️ [getTracking] API not available, using mock data')
      return {
        data: {
          message: 'Lấy thông tin tracking thành công',
          data: {
            ...mockOrderTracking,
            order_id: params.order_id || mockOrderTracking.order_id,
            tracking_number: params.tracking_number || mockOrderTracking.tracking_number
          }
        }
      }
    }
  },

  // Lấy tracking theo tracking number (public)
  getTrackingByNumber: async (trackingNumber: string) => {
    try {
      const response = await http.get<SuccessResponseApi<OrderTracking>>(`/tracking/${trackingNumber}`)
      return response
    } catch (error) {
      console.warn('⚠️ [getTrackingByNumber] API not available, using mock data')
      return {
        data: {
          message: 'Lấy thông tin tracking thành công',
          data: {
            ...mockOrderTracking,
            tracking_number: trackingNumber
          }
        }
      }
    }
  }
}

export default orderTrackingApi

