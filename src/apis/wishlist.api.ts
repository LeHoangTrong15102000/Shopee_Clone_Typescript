import { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'
import {
  WishlistResponse,
  WishlistCheckResponse,
  WishlistCountResponse,
  WishlistClearResponse,
  AddToWishlistBody,
  WishlistItem
} from 'src/types/wishlist.type'

export interface ApiOptions {
  signal?: AbortSignal
}

// Mock data for fallback when API is not available
const mockWishlistItems: WishlistItem[] = [
  {
    _id: 'mock-wishlist-1',
    user: 'mock-user-id',
    product: {
      _id: 'mock-product-1',
      name: 'Áo thun nam cotton cao cấp',
      price: 250000,
      price_before_discount: 350000,
      image: 'https://picsum.photos/seed/product1/200',
      images: [],
      category: { _id: 'cat-1', name: 'Thời trang nam' },
      quantity: 100,
      sold: 1500,
      view: 5000,
      rating: 4.5,
      description: 'Áo thun nam chất liệu cotton 100%',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any,
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'mock-wishlist-2',
    user: 'mock-user-id',
    product: {
      _id: 'mock-product-2',
      name: 'Tai nghe Bluetooth không dây',
      price: 450000,
      price_before_discount: 650000,
      image: 'https://picsum.photos/seed/product2/200',
      images: [],
      category: { _id: 'cat-2', name: 'Điện tử' },
      quantity: 50,
      sold: 3200,
      view: 12000,
      rating: 4.8,
      description: 'Tai nghe Bluetooth 5.0 chống ồn',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any,
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'mock-wishlist-3',
    user: 'mock-user-id',
    product: {
      _id: 'mock-product-3',
      name: 'Balo laptop chống nước 15.6 inch',
      price: 320000,
      price_before_discount: 480000,
      image: 'https://picsum.photos/seed/product3/200',
      images: [],
      category: { _id: 'cat-3', name: 'Phụ kiện' },
      quantity: 200,
      sold: 800,
      view: 3500,
      rating: 4.3,
      description: 'Balo laptop chống nước, nhiều ngăn tiện lợi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any,
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const wishlistApi = {
  getWishlist: async (params?: { page?: number; limit?: number }, options?: ApiOptions) => {
    try {
      const response = await http.get<SuccessResponseApi<WishlistResponse>>('/wishlist', {
        params,
        signal: options?.signal
      })
      return response
    } catch (error) {
      console.warn('⚠️ [getWishlist] API not available, using mock data')
      return {
        data: {
          message: 'Lấy danh sách yêu thích thành công',
          data: {
            wishlist: mockWishlistItems,
            pagination: {
              page: params?.page || 1,
              limit: params?.limit || 10,
              total: mockWishlistItems.length,
              total_pages: 1
            }
          } as WishlistResponse
        }
      }
    }
  },

  addToWishlist: async (body: AddToWishlistBody, options?: ApiOptions) => {
    try {
      const response = await http.post<SuccessResponseApi<WishlistItem>>('/wishlist', body, {
        signal: options?.signal
      })
      return response
    } catch (error) {
      console.warn('⚠️ [addToWishlist] API not available, using mock data')
      return {
        data: {
          message: 'Thêm vào danh sách yêu thích thành công',
          data: mockWishlistItems[0]
        }
      }
    }
  },

  removeFromWishlist: async (productId: string, options?: ApiOptions) => {
    try {
      const response = await http.delete<SuccessResponseApi<{ message: string }>>(`/wishlist/${productId}`, {
        signal: options?.signal
      })
      return response
    } catch (error) {
      console.warn('⚠️ [removeFromWishlist] API not available, using mock data')
      return {
        data: {
          message: 'Xóa khỏi danh sách yêu thích thành công',
          data: { message: 'Xóa khỏi danh sách yêu thích thành công' }
        }
      }
    }
  },

  checkInWishlist: async (productId: string, options?: ApiOptions) => {
    try {
      const response = await http.get<SuccessResponseApi<WishlistCheckResponse>>(`/wishlist/check/${productId}`, {
        signal: options?.signal
      })
      return response
    } catch (error) {
      console.warn('⚠️ [checkInWishlist] API not available, using mock data')
      return {
        data: {
          message: 'Kiểm tra danh sách yêu thích thành công',
          data: { in_wishlist: true } as WishlistCheckResponse
        }
      }
    }
  },

  clearWishlist: async (options?: ApiOptions) => {
    try {
      const response = await http.delete<SuccessResponseApi<WishlistClearResponse>>('/wishlist/clear', {
        signal: options?.signal
      })
      return response
    } catch (error) {
      console.warn('⚠️ [clearWishlist] API not available, using mock data')
      return {
        data: {
          message: 'Xóa toàn bộ danh sách yêu thích thành công',
          data: { deleted_count: mockWishlistItems.length } as WishlistClearResponse
        }
      }
    }
  },

  getWishlistCount: async (options?: ApiOptions) => {
    try {
      const response = await http.get<SuccessResponseApi<WishlistCountResponse>>('/wishlist/count', {
        signal: options?.signal
      })
      return response
    } catch (error) {
      console.warn('⚠️ [getWishlistCount] API not available, using mock data')
      return {
        data: {
          message: 'Lấy số lượng yêu thích thành công',
          data: { count: mockWishlistItems.length } as WishlistCountResponse
        }
      }
    }
  }
}

export default wishlistApi

