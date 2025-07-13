// Main export file for all optimistic hooks
// This provides a clean, centralized import point for components

// Cart-related optimistic hooks
export { useOptimisticAddToCart, useOptimisticUpdateQuantity, useOptimisticRemoveFromCart } from './cart'

// Review-related optimistic hooks
export { useOptimisticReviewLike } from './review'

// Shared utilities and types (optional exports for advanced usage)
export type {
  AddToCartPayload,
  UpdateQuantityPayload,
  AddToCartContext,
  UpdateQuantityContext,
  RemoveFromCartContext,
  ReviewLikeContext,
  OptimisticContext,
  ToastConfig
} from './shared/types'

export {
  findProductInCache,
  createOptimisticPurchase,
  updatePurchasesCache,
  createExtendedPurchase,
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  logOptimisticError,
  TOAST_CONFIG
} from './shared/utils'

export { TOAST_MESSAGES, TEMP_ID_PREFIX, DEFAULT_USER_PLACEHOLDER } from './shared/constants'
