import { Purchase } from 'src/types/purchases.type'

// Base optimistic context type
export interface OptimisticContext {
  previousData?: any
  [key: string]: any
}

// Cart-related types
export interface AddToCartPayload {
  product_id: string
  buy_count: number
}

export interface UpdateQuantityPayload {
  product_id: string
  buy_count: number
}

export interface AddToCartContext extends OptimisticContext {
  previousPurchases?: any
  optimisticPurchase?: any
}

export interface UpdateQuantityContext extends OptimisticContext {
  previousData?: any
  product_id?: string
}

export interface RemoveFromCartContext extends OptimisticContext {
  previousData?: any
  removedItems?: Purchase[]
  undoToast?: any
}

// Review-related types
export interface ReviewLikeContext extends OptimisticContext {
  previousReviews?: any
  reviewId?: string
}

// Wishlist-related types
export interface WishlistContext extends OptimisticContext {
  previousWishlistCheck?: any
  previousWishlistData?: any
  previousWishlistCount?: any
  productId?: string
}

// Notification-related types
export interface NotificationContext extends OptimisticContext {
  previousNotifications?: any
  notificationId?: string
}

export interface MarkAllAsReadContext extends OptimisticContext {
  previousNotifications?: any
  previousUnreadCount?: number
}

// Toast configurations
export interface ToastConfig {
  autoClose: number
  position: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left'
}

// Query keys
export const QUERY_KEYS = {
  PURCHASES_IN_CART: ['purchases', { status: 'inCart' }] as any[],
  PRODUCT_REVIEWS: (productId: string) => ['product-reviews', productId] as any[],
  PRODUCTS: ['products'] as any[],
  PRODUCT: ['product'] as any[],
  WISHLIST: ['wishlist'] as any[],
  WISHLIST_CHECK: (productId: string) => ['wishlist', 'check', productId] as any[],
  WISHLIST_COUNT: ['wishlist', 'count'] as any[],
  NOTIFICATIONS: ['notifications'] as any[]
}
