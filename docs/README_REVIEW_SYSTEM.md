# Hệ thống Đánh giá Sản phẩm - Shopee Clone

## Tổng quan

Hệ thống đánh giá sản phẩm đã được tích hợp hoàn chỉnh vào dự án Shopee Clone, bao gồm cả Frontend (React/TypeScript) và Backend (Node.js/Express/MongoDB).

## Tính năng chính

### ✅ Đã hoàn thành:

1. **Tạo đánh giá sản phẩm**

   - Chỉ những đơn hàng đã hoàn thành (status = DELIVERED) mới có thể đánh giá
   - Giao diện modal giống Shopee với rating stars, comment, upload ảnh placeholder
   - Validation business logic: 1 purchase chỉ có thể đánh giá 1 lần

2. **Hiển thị đánh giá**

   - Component `ProductReviews` hiển thị trong trang chi tiết sản phẩm
   - Statistics overview: average rating, rating breakdown
   - Pagination và filtering theo rating (1-5 sao)
   - Sorting: newest, oldest, highest rating, lowest rating, most helpful

3. **Tương tác với đánh giá**

   - Like/Unlike đánh giá
   - Comment và nested comments (như Facebook)
   - Reply đến comments

4. **Tích hợp với Purchase History**
   - Tab "Hoàn thành" hiển thị nút "Đánh Giá Sản Phẩm" cho đơn hàng chưa đánh giá
   - Nút "Xem Đánh Giá Shop" cho đơn hàng đã đánh giá

## Cấu trúc Files

### Backend (api-ecom/)

```
├── @types/
│   └── review.type.d.ts           # Type definitions
├── controllers/
│   └── review.controller.ts       # API controllers
├── middleware/
│   └── review.middleware.ts       # Validation middleware
├── routes/
│   └── user/
│       └── review.route.ts        # API routes
├── database/models/
│   ├── review.model.ts            # Review model
│   ├── review-comment.model.ts    # Comment model
│   └── review-like.model.ts       # Like model
```

### Frontend (src/)

```
├── components/
│   ├── ProductReviews/            # Component hiển thị đánh giá
│   │   ├── ProductReviews.tsx
│   │   └── index.ts
│   └── ProductReviewModal/        # Modal tạo đánh giá
│       ├── ProductReviewModal.tsx
│       └── index.ts
├── apis/
│   └── review.api.ts              # API functions
├── types/
│   └── review.type.ts             # Frontend types
```

## API Endpoints

### Reviews

- `POST /reviews` - Tạo đánh giá mới
- `GET /reviews/product/:product_id` - Lấy đánh giá của sản phẩm
- `POST /reviews/like/:review_id` - Like/Unlike đánh giá
- `GET /reviews/can-review/:purchase_id` - Kiểm tra quyền đánh giá

### Comments

- `POST /reviews/comment` - Tạo comment
- `GET /reviews/comments/:review_id` - Lấy comments của review

## Business Logic

### Quy tắc đánh giá:

1. **Điều kiện đánh giá:**

   - Purchase phải có status = "DELIVERED"
   - Mỗi purchase chỉ được đánh giá 1 lần
   - User phải đăng nhập

2. **Validation:**

   - Rating: bắt buộc, từ 1-5 sao
   - Comment: bắt buộc, tối thiểu 10 ký tự
   - Images: tùy chọn, tối đa 5 ảnh

3. **Cập nhật product rating:**
   - Tự động tính lại average rating khi có review mới
   - Cập nhật rating breakdown (1-5 stars)

## Cách sử dụng

### 1. Tạo đánh giá (HistoryPurchases)

```tsx
import ProductReviewModal from 'src/components/ProductReviewModal'

// Trong component HistoryPurchases
const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)

// Mở modal đánh giá
const openReviewModal = (purchase: Purchase) => {
  setSelectedPurchase(purchase)
  setIsReviewModalOpen(true)
}

// JSX
;<ProductReviewModal
  isOpen={isReviewModalOpen}
  onClose={() => setIsReviewModalOpen(false)}
  purchase={selectedPurchase}
/>
```

### 2. Hiển thị đánh giá (ProductDetail)

```tsx
import ProductReviews from 'src/components/ProductReviews'

// Trong component ProductDetail
;<ProductReviews productId={product._id} />
```

### 3. API Usage

```typescript
import reviewApi from 'src/apis/review.api'

// Tạo đánh giá
const createReview = async (data: CreateReviewData) => {
  const response = await reviewApi.createReview(data)
  return response.data
}

// Lấy đánh giá sản phẩm
const getReviews = async (productId: string, page = 1) => {
  const response = await reviewApi.getProductReviews(productId, { page, limit: 10 })
  return response.data
}
```

## Dependencies cần cài đặt

```bash
# Thêm vào package.json dependencies
npm install date-fns

# Hoặc
yarn add date-fns
```

## Cấu hình

### Backend Environment Variables

```env
# Đã có sẵn trong config hiện tại
MONGODB_URI=mongodb://localhost:27017/shopee-clone
JWT_SECRET=your-jwt-secret
```

### Frontend Configuration

```typescript
// src/constant/config.ts
export const baseURL = 'http://localhost:4000/api'
```

## Testing

### Test Cases đã cover:

1. ✅ Tạo review với purchase đã hoàn thành
2. ✅ Không thể tạo review duplicate
3. ✅ Validation input (rating, comment length)
4. ✅ Like/Unlike functionality
5. ✅ Nested comments system
6. ✅ Pagination và filtering

### Manual Testing:

1. Tạo đơn hàng và đánh dấu status = "DELIVERED"
2. Vào HistoryPurchases > tab "Hoàn thành"
3. Click "Đánh Giá Sản Phẩm"
4. Điền form và submit
5. Kiểm tra đánh giá hiển thị trong ProductDetail

## Notes

### Temporary Solutions:

- `formatDistanceToNow`: Đang dùng implementation tạm thời, cần install `date-fns` để có format tốt hơn
- Image upload: Placeholder hiện tại, cần implement actual upload service

### Future Enhancements:

- [ ] Real-time notifications khi có review mới
- [ ] Review analytics cho seller
- [ ] Report review functionality
- [ ] Image upload với cloud storage
- [ ] Review moderation system

## Troubleshooting

### Common Issues:

1. **Date formatting error:** Install `date-fns` package
2. **Type errors:** Ensure all review types are imported correctly
3. **API errors:** Check backend server is running và JWT token valid

### Debug Commands:

```bash
# Check build errors
npm run build

# Run development server
npm run dev

# Check TypeScript types
npx tsc --noEmit
```

---

**Tác giả:** AI Assistant  
**Ngày cập nhật:** 27/06/2025  
**Version:** 1.0.0
