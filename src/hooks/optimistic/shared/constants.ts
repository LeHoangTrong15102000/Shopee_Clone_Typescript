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

  // Save for Later messages
  SAVE_FOR_LATER_SUCCESS: '🔖 Đã lưu để mua sau',
  SAVE_FOR_LATER_ALREADY_SAVED: '⚠️ Sản phẩm đã được lưu trước đó',
  MOVE_TO_CART_SUCCESS: '🛒 Đã thêm lại vào giỏ hàng',
  CLEAR_SAVED_SUCCESS: '🗑️ Đã xóa tất cả sản phẩm đã lưu',

  // Review messages
  REVIEW_LIKE_SUCCESS: '❤️ Đã thích đánh giá!',
  REVIEW_UNLIKE_SUCCESS: '💔 Đã bỏ thích đánh giá',
  REVIEW_LIKE_ERROR: '❌ Không thể thực hiện thao tác',

  // Wishlist messages
  WISHLIST_ADD_SUCCESS: '❤️ Đã thêm vào danh sách yêu thích!',
  WISHLIST_ADD_ERROR: '❌ Không thể thêm vào danh sách yêu thích',
  WISHLIST_REMOVE_SUCCESS: '💔 Đã xóa khỏi danh sách yêu thích',
  WISHLIST_REMOVE_ERROR: '❌ Không thể xóa khỏi danh sách yêu thích',
  WISHLIST_LOGIN_REQUIRED: '⚠️ Vui lòng đăng nhập để sử dụng tính năng này',

  // Notification messages
  MARK_AS_READ_ERROR: '❌ Không thể đánh dấu đã đọc',
  MARK_ALL_AS_READ_SUCCESS: '✅ Đã đánh dấu tất cả thông báo là đã đọc',
  MARK_ALL_AS_READ_ERROR: '❌ Không thể đánh dấu tất cả đã đọc',

  // Generic messages
  GENERIC_ERROR: '❌ Có lỗi xảy ra, vui lòng thử lại'
} as const

// Temporary ID prefixes
export const TEMP_ID_PREFIX = 'temp-'

// Default user placeholder
export const DEFAULT_USER_PLACEHOLDER = 'current-user'
