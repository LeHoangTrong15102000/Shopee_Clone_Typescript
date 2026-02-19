import { SuccessResponseApi } from 'src/types/utils.type'
import {
  ShippingMethod,
  PaymentMethod,
  Order,
  CreateOrderBody,
  CheckoutSummary,
  OrderListResponse
} from 'src/types/checkout.type'
import http from 'src/utils/http'

// Mock shipping methods
const mockShippingMethods: ShippingMethod[] = [
  {
    _id: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    description: 'Giao hàng trong 3-5 ngày làm việc',
    price: 30000,
    estimatedDays: '3-5 ngày',
    icon: 'truck'
  },
  {
    _id: 'express',
    name: 'Giao hàng nhanh',
    description: 'Giao hàng trong 1-2 ngày làm việc',
    price: 50000,
    estimatedDays: '1-2 ngày',
    icon: 'rocket'
  },
  {
    _id: 'same_day',
    name: 'Giao hàng trong ngày',
    description: 'Nhận hàng trong ngày (đặt trước 12h)',
    price: 80000,
    estimatedDays: 'Trong ngày',
    icon: 'lightning'
  }
]

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    _id: 'cod',
    type: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: '💵',
    isAvailable: true
  },
  {
    _id: 'bank_transfer',
    type: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản qua tài khoản ngân hàng',
    icon: '🏦',
    isAvailable: true
  },
  {
    _id: 'e_wallet',
    type: 'e_wallet',
    name: 'Ví điện tử',
    description: 'Thanh toán qua MoMo, ZaloPay, VNPay',
    icon: '📱',
    isAvailable: true
  },
  {
    _id: 'credit_card',
    type: 'credit_card',
    name: 'Thẻ tín dụng/Ghi nợ',
    description: 'Visa, Mastercard, JCB',
    icon: '💳',
    isAvailable: true
  }
]

const checkoutApi = {
  getShippingMethods: async () => {
    try {
      const response = await http.get<SuccessResponseApi<ShippingMethod[]>>('/shipping/methods')
      return response
    } catch (error) {
      console.warn('Shipping API not available, using mock data')
      return {
        data: {
          message: 'Lấy phương thức vận chuyển thành công',
          data: mockShippingMethods
        }
      }
    }
  },

  getPaymentMethods: async () => {
    try {
      const response = await http.get<SuccessResponseApi<PaymentMethod[]>>('/payment/methods')
      return response
    } catch (error) {
      console.warn('Payment API not available, using mock data')
      return {
        data: {
          message: 'Lấy phương thức thanh toán thành công',
          data: mockPaymentMethods
        }
      }
    }
  },

  calculateSummary: async (body: {
    items: { productId: string; buyCount: number }[]
    shippingMethodId: string
    voucherCode?: string
    coinsUsed?: number
  }) => {
    try {
      const response = await http.post<SuccessResponseApi<CheckoutSummary>>('/checkout/calculate', body)
      return response
    } catch (error) {
      const shippingMethod = mockShippingMethods.find((m) => m._id === body.shippingMethodId) || mockShippingMethods[0]
      return {
        data: {
          message: 'Tính toán thành công',
          data: {
            items: [],
            subtotal: 0,
            shippingFee: shippingMethod.price,
            discount: 0,
            coinsDiscount: body.coinsUsed || 0,
            total: shippingMethod.price
          }
        }
      }
    }
  },

  createOrder: async (body: CreateOrderBody) => {
    try {
      const response = await http.post<SuccessResponseApi<Order>>('/orders', body)
      return response
    } catch (error) {
      console.warn('⚠️ [createOrder] API not available, using mock data')
      const mockOrder: Order = {
        _id: `order-${Date.now()}`,
        userId: 'mock-user-id',
        items: [],
        shippingAddress: {
          _id: '1',
          userId: 'mock-user-id',
          fullName: 'Nguyễn Văn A',
          phone: '0901234567',
          province: 'Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          street: '123 Nguyễn Huệ',
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        shippingMethod: mockShippingMethods[0],
        paymentMethod: body.paymentMethod,
        subtotal: 0,
        shippingFee: mockShippingMethods[0].price,
        discount: 0,
        coinsUsed: body.coinsUsed || 0,
        coinsDiscount: body.coinsUsed || 0,
        total: mockShippingMethods[0].price,
        status: 'pending',
        note: body.note,
        voucherCode: body.voucherCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return {
        data: {
          message: 'Tạo đơn hàng thành công (mock)',
          data: mockOrder
        }
      }
    }
  },

  getOrders: async (params: { status?: string; page?: number; limit?: number }) => {
    try {
      const response = await http.get<SuccessResponseApi<OrderListResponse>>('/orders', { params })
      return response
    } catch (error) {
      console.warn('Orders API not available, using mock data')
      return {
        data: {
          message: 'Lấy danh sách đơn hàng thành công',
          data: {
            orders: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        }
      }
    }
  },

  getOrderById: async (id: string) => {
    try {
      const response = await http.get<SuccessResponseApi<Order>>(`/orders/${id}`)
      return response
    } catch (error) {
      console.warn('⚠️ [getOrderById] API not available, using mock data')
      const mockOrder: Order = {
        _id: id,
        userId: 'mock-user-id',
        items: [],
        shippingAddress: {
          _id: '1',
          userId: 'mock-user-id',
          fullName: 'Nguyễn Văn A',
          phone: '0901234567',
          province: 'Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          street: '123 Nguyễn Huệ',
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        shippingMethod: mockShippingMethods[0],
        paymentMethod: 'cod',
        subtotal: 500000,
        shippingFee: 30000,
        discount: 0,
        coinsUsed: 0,
        coinsDiscount: 0,
        total: 530000,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return {
        data: {
          message: 'Lấy chi tiết đơn hàng thành công (mock)',
          data: mockOrder
        }
      }
    }
  },

  cancelOrder: async (id: string, reason?: string) => {
    try {
      const response = await http.put<SuccessResponseApi<Order>>(`/orders/${id}/cancel`, { reason })
      return response
    } catch (error) {
      console.warn('⚠️ [cancelOrder] API not available, using mock data')
      const mockOrder: Order = {
        _id: id,
        userId: 'mock-user-id',
        items: [],
        shippingAddress: {
          _id: '1',
          userId: 'mock-user-id',
          fullName: 'Nguyễn Văn A',
          phone: '0901234567',
          province: 'Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          street: '123 Nguyễn Huệ',
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        shippingMethod: mockShippingMethods[0],
        paymentMethod: 'cod',
        subtotal: 500000,
        shippingFee: 30000,
        discount: 0,
        coinsUsed: 0,
        coinsDiscount: 0,
        total: 530000,
        status: 'cancelled',
        note: reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return {
        data: {
          message: 'Hủy đơn hàng thành công (mock)',
          data: mockOrder
        }
      }
    }
  }
}

export default checkoutApi

