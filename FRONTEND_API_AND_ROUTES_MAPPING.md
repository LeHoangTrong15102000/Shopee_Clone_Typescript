# Shopee Clone TypeScript - Frontend API & Routes Mapping

## Project Overview
- **Framework**: React + TypeScript + React Router
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Custom axios wrapper (`src/utils/http.ts`)
- **Base URL**: Configured in `src/constant/config.ts`

---

## Routes Configuration

### Public Routes (No Authentication Required)
| Path | Component | Features |
|------|-----------|----------|
| `/` | Home | Homepage with featured products |
| `/products` | ProductList | Product listing with filters, pagination, infinite scroll |
| `/:nameId` | ProductDetail | Product details, reviews, Q&A, price history |
| `/compare` | Compare | Product comparison page |
| `/login` | Login | User login |
| `/register` | Register | User registration |
| `/forgot-password` | ForgotPassword | Password recovery |
| `/reset-password` | ResetPassword | Reset password with token |

### Protected Routes (Authentication Required)
| Path | Component | Features |
|------|-----------|----------|
| `/cart` | Cart | Shopping cart management |
| `/checkout` | Checkout | Order checkout with shipping/payment |
| `/wishlist` | Wishlist | Saved products list |
| `/user/profile` | Profile | User profile management |
| `/user/password` | ChangePassword | Change password |
| `/user/purchase` | HistoryPurchases | Purchase history |
| `/user/order` | OrderList | Order list by status |
| `/user/order/:orderId` | OrderDetail | Order details & tracking |
| `/user/voucher` | MyVouchers | User's collected vouchers |
| `/user/daily-checkin` | DailyCheckIn | Daily check-in rewards |
| `/user/address` | AddressBook | Shipping address management |
| `/user/notification` | Notifications | User notifications |

---

## API Endpoints & Functions

### 1. Authentication (`auth.api.ts`)
- `registerAccount(email, password)` → POST `/register`
- `loginAccount(email, password)` → POST `/login`
- `logoutAccount()` → POST `/logout`
- `refreshAccessToken(refresh_token)` → POST `/refresh-access-token`

### 2. User Profile (`user.api.ts`)
- `getProfile()` → GET `/me`
- `updateProfile(body)` → PUT `/user`
- `uploadAvatar(formData)` → POST `/user/upload-avatar`

### 3. Products (`product.api.ts`)
- `getProducts(params)` → GET `/products`
- `getProductDetail(id)` → GET `/products/{id}`
- `getSearchSuggestions(q)` → GET `/products/search/suggestions`
- `getSearchHistory()` → GET `/products/search/history`
- `saveSearchHistory(keyword)` → POST `/products/search/save-history`
- `deleteSearchHistory()` → DELETE `/products/search/history`
- `deleteSearchHistoryItem(keyword)` → DELETE `/products/search/history/{keyword}`

### 4. Categories (`category.api.ts`)
- `getCategories()` → GET `/categories`

### 5. Cart & Purchases (`purchases.api.ts`)
- `addToCart(product_id, buy_count)` → POST `/purchases/add-to-cart`
- `getPurchases(status)` → GET `/purchases`
- `buyPurchases(items)` → POST `/purchases/buy-products`
- `updatePurchase(product_id, buy_count)` → PUT `/purchases/update-purchase`
- `deletePurchase(purchaseIds)` → DELETE `/purchases`

### 6. Orders (`order.api.ts`)
- `getOrders(params)` → GET `/orders`
- `getOrderById(id)` → GET `/orders/{id}`
- `cancelOrder(id, reason)` → PUT `/orders/{id}/cancel`
- `returnOrder(id, reason)` → PUT `/orders/{id}/return`
- `confirmReceived(id)` → PUT `/orders/{id}/confirm-received`

### 7. Checkout (`checkout.api.ts`)
- `getShippingMethods()` → GET `/orders/shipping/methods`
- `getPaymentMethods()` → GET `/orders/payment/methods`
- `calculateSummary(body)` → POST `/checkout/summary`
- `createOrder(body)` → POST `/checkout/create-order`

### 8. Wishlist (`wishlist.api.ts`)
- `getWishlist(params)` → GET `/wishlist`
- `addToWishlist(product_id)` → POST `/wishlist`
- `removeFromWishlist(product_id)` → DELETE `/wishlist/{product_id}`
- `checkInWishlist(product_id)` → GET `/wishlist/check/{product_id}`
- `clearWishlist()` → DELETE `/wishlist/clear`
- `getWishlistCount()` → GET `/wishlist/count`

### 9. Reviews (`review.api.ts`)
- `createReview(body)` → POST `/reviews`
- `updateReview(reviewId, body)` → PUT `/reviews/{reviewId}`
- `deleteReview(reviewId)` → DELETE `/reviews/{reviewId}`
- `voteReview(reviewId, vote)` → POST `/reviews/{reviewId}/vote`
- `getProductReviews(productId, params)` → GET `/reviews/product/{productId}`
- `toggleReviewLike(reviewId)` → POST `/reviews/like/{reviewId}`
- `createComment(body)` → POST `/reviews/comment`
- `getReviewComments(reviewId, params)` → GET `/reviews/comments/{reviewId}`
- `canReviewPurchase(purchaseId)` → GET `/reviews/can-review/{purchaseId}`

### 10. Q&A (`qa.api.ts`)
- `getQuestions(params)` → GET `/qa/questions`
- `askQuestion(product_id, question)` → POST `/qa/questions`
- `answerQuestion(questionId, answer)` → POST `/qa/questions/{questionId}/answers`
- `voteQuestion(questionId)` → POST `/qa/questions/{questionId}/vote`
- `likeQuestion(questionId)` → POST `/qa/questions/{questionId}/like`
- `likeAnswer(questionId, answerId)` → POST `/qa/questions/{questionId}/answers/{answerId}/like`

### 11. Addresses (`address.api.ts`)
- `getAddresses()` → GET `/addresses`
- `getAddressById(id)` → GET `/addresses/{id}`
- `createAddress(body)` → POST `/addresses`
- `updateAddress(id, body)` → PUT `/addresses/{id}`
- `deleteAddress(id)` → DELETE `/addresses/{id}`
- `setDefaultAddress(id)` → PUT `/addresses/{id}/default`

### 12. Vouchers (`voucher.api.ts`)
- `getVouchers(params)` → GET `/vouchers`
- `getAvailableVouchers(params)` → GET `/vouchers/available`
- `getMyVouchers(params)` → GET `/vouchers/my-vouchers`
- `getVoucherByCode(code)` → GET `/vouchers/code/{code}`
- `collectVoucher(voucherId)` → POST `/vouchers/{voucherId}/collect`
- `saveVoucher(voucherId)` → POST `/vouchers/{voucherId}/save`
- `getSavedVouchers()` → GET `/vouchers/saved`
- `applyVoucher(code, order_total)` → POST `/vouchers/apply`
- `validateVoucher(code, order_total)` → POST `/vouchers/validate`

### 13. Check-in (`checkin.api.ts`)
- `checkIn()` → POST `/checkin`
- `getStreak()` → GET `/checkin/streak`
- `getHistory(params)` → GET `/checkin/history`

### 14. Notifications (`notification.api.ts`)
- `getNotifications()` → GET `/notifications`
- `markAsRead(notificationId)` → PUT `/notifications/{notificationId}/read`
- `markAllAsRead()` → PUT `/notifications/read-all`
- `deleteNotification(notificationId)` → DELETE `/notifications/{notificationId}`
- `getUnreadCount()` → GET `/notifications/unread-count`

### 15. Loyalty Points (`loyalty.api.ts`)
- `getPoints()` → GET `/loyalty/points`
- `getTransactions(params)` → GET `/loyalty/transactions`
- `getRewards()` → GET `/loyalty/rewards`
- `redeemPoints(rewardId)` → POST `/loyalty/redeem/{rewardId}`

### 16. Price History (`priceHistory.api.ts`)
- `getPriceHistory(productId, params)` → GET `/products/{productId}/price-history`
- `createPriceAlert(product_id, target_price)` → POST `/price-alerts`
- `getPriceAlerts()` → GET `/price-alerts`
- `deletePriceAlert(alertId)` → DELETE `/price-alerts/{alertId}`

### 17. Order Tracking (`orderTracking.api.ts`)
- `getTracking(params)` → GET `/orders/tracking`
- `getTrackingByNumber(trackingNumber)` → GET `/tracking/{trackingNumber}`

### 18. Password Reset (`password-reset.api.ts`)
- `forgotPassword(email)` → POST `/forgot-password`
- `resetPassword(token, password, confirmPassword)` → POST `/reset-password`

### 19. Chatbot (`chatbot.api.ts`)
- `getConversations(params)` → GET `/conversations`
- `getConversation(id)` → GET `/conversations/{id}`
- `createConversation(body)` → POST `/conversations`
- `sendMessage(conversationId, body)` → POST `/conversations/{conversationId}/messages`
- `updateConversation(id, body)` → PUT `/conversations/{id}`
- `deleteConversation(id)` → DELETE `/conversations/{id}`
- `testChatbot(body)` → POST `/conversations/test`
- `testChatbotStream(body)` → POST `/conversations/test/stream`

---

## Key Features by Page

### Home Page
- Display featured products
- Flash sales
- Categories
- Hero banner

### Product List
- Filter by category, price, rating
- Sort by relevance, price, newest
- Pagination & infinite scroll
- Search with suggestions & history

### Product Detail
- Product images gallery
- Price & discount info
- Reviews with ratings
- Q&A section
- Related products
- Price history chart
- Add to cart/wishlist

### Cart
- View cart items
- Update quantities
- Remove items
- Calculate totals
- Proceed to checkout

### Checkout
- Select shipping address
- Choose shipping method
- Select payment method
- Apply vouchers
- Use loyalty points
- Order summary

### User Dashboard
- Profile management
- Password change
- Order history with filtering
- Order tracking
- Wishlist management
- Address book
- Voucher collection
- Daily check-in
- Notifications
- Loyalty points

---

## Authentication Flow
1. User registers/logs in
2. Backend returns `access_token` & `refresh_token`
3. Tokens stored in localStorage
4. `access_token` sent in Authorization header
5. On expiry, `refresh_token` used to get new `access_token`
6. Protected routes check `isAuthenticated` context

---

## Mock Data Fallback
All APIs have mock data fallback when backend is unavailable, ensuring frontend works independently for development/testing.

