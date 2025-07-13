// Toast messages
export const TOAST_MESSAGES = {
  // Cart messages
  ADD_TO_CART_SUCCESS: '🛒 Đã thêm vào giỏ hàng!',
  ADD_TO_CART_ERROR: '❌ Không thể thêm vào giỏ hàng',
  UPDATE_QUANTITY_ERROR: '❌ Không thể cập nhật số lượng',
  REMOVE_FROM_CART_SUCCESS: (count: number) =>
    `🗑️ Đã xóa ${count > 1 ? `${count} sản phẩm` : 'sản phẩm'} khỏi giỏ hàng`,
  REMOVE_FROM_CART_ERROR: '❌ Không thể xóa sản phẩm khỏi giỏ hàng',
  REMOVE_FROM_CART_FINAL_SUCCESS: (count: number) =>
    `✅ Đã xóa ${count > 1 ? `${count} sản phẩm` : 'sản phẩm'} thành công`,
  RESTORE_ITEMS: '↩️ Đã khôi phục sản phẩm',

  // Review messages
  REVIEW_LIKE_SUCCESS: '❤️ Đã thích đánh giá!',
  REVIEW_UNLIKE_SUCCESS: '💔 Đã bỏ thích đánh giá',
  REVIEW_LIKE_ERROR: '❌ Không thể thực hiện thao tác',

  // Generic messages
  GENERIC_ERROR: '❌ Có lỗi xảy ra, vui lòng thử lại'
} as const

// Temporary ID prefixes
export const TEMP_ID_PREFIX = 'temp-'

// Default user placeholder
export const DEFAULT_USER_PLACEHOLDER = 'current-user'
