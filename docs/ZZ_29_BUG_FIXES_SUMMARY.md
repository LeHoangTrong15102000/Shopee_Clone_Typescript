# Báo Cáo Sửa Lỗi Build - Shopee Clone TypeScript

## Tổng Quan

Trong quá trình build dự án, đã xuất hiện 8 lỗi TypeScript chính trong 3 files. Tất cả các lỗi đã được phân tích chi tiết và sửa chữa hoàn toàn.

## Chi Tiết Các Lỗi Và Cách Giải Quyết

### 1. Lỗi useRef thiếu initialValue

**File:** `src/hooks/useHoverPrefetch.ts:28`

**Mô tả lỗi:**

```typescript
const timeoutRef = useRef<NodeJS.Timeout>()
// Error: Expected 1 arguments, but got 0.
```

**Nguyên nhân:** React 19 yêu cầu useRef phải có initialValue khi sử dụng với generic type.

**Cách sửa:**

```typescript
// TRƯỚC
const timeoutRef = useRef<NodeJS.Timeout>()

// SAU
const timeoutRef = useRef<NodeJS.Timeout | null>(null)
```

**Giải thích:** Thêm `| null` vào type và cung cấp `null` như initialValue để tuân thủ React 19 type requirements.

---

### 2. Lỗi userApi.getProfile() nhận signal parameter

**Files liên quan:**

- `src/hooks/usePrefetch.ts:96`
- `src/router/loaders.ts:177`
- `src/router/loaders.ts:207`

**Mô tả lỗi:**

```typescript
userApi.getProfile({ signal })
// Error: Expected 0 arguments, but got 1.
```

**Nguyên nhân:** Hàm `getProfile()` trong `user.api.ts` không nhận bất kỳ parameter nào:

```typescript
getProfile: () => {
  return http.get<SuccessResponseApi<User>>('/me')
}
```

**Cách sửa:**

```typescript
// TRƯỚC
queryFn: ({ signal }) => userApi.getProfile({ signal })

// SAU
queryFn: () => userApi.getProfile()
```

**Giải thích:** Bỏ signal parameter vì API không hỗ trợ cancellation cho endpoint này.

---

### 3. Lỗi purchasesApi.getPurchases() nhận signal parameter

**Files liên quan:**

- `src/hooks/usePrefetch.ts:111`
- `src/router/loaders.ts:213`

**Mô tả lỗi:**

```typescript
purchasesApi.getPurchases({ status: purchasesStatus.inCart }, { signal })
// Error: Expected 1 arguments, but got 2.
```

**Nguyên nhân:** Hàm `getPurchases()` trong `purchases.api.ts` chỉ nhận 1 parameter:

```typescript
getPurchases: (params: { status: PurchaseListStatus }) => {
  return http.get<SuccessResponseApi<Purchase[]>>('/purchases', { params })
}
```

**Cách sửa:**

```typescript
// TRƯỚC
queryFn: ({ signal }) => purchasesApi.getPurchases({ status: purchasesStatus.inCart }, { signal })

// SAU
queryFn: () => purchasesApi.getPurchases({ status: purchasesStatus.inCart })
```

**Giải thích:** Bỏ signal parameter thứ hai vì API chỉ nhận params object.

---

### 4. Lỗi Type Mismatch cho sort_by trong ProductListConfig

**Files liên quan:**

- `src/hooks/usePrefetch.ts:162`
- `src/router/loaders.ts:263`

**Mô tả lỗi:**

```typescript
const trendingFilters = { sort_by: 'sold', order: 'desc', limit: '20' }
// Error: Type 'string' is not assignable to type '"createdAt" | "view" | "sold" | "price" | undefined'
```

**Nguyên nhân:** TypeScript infer kiểu `sort_by` như `string` thay vì union type cụ thể từ `ProductListConfig`.

**Cách sửa:**

```typescript
// TRƯỚC
const trendingFilters = { sort_by: 'sold', order: 'desc', limit: '20' }

// SAU
const trendingFilters: ProductListConfig = { sort_by: 'sold', order: 'desc', limit: '20' }
```

**Giải thích:** Thêm explicit type annotation để TypeScript hiểu đúng kiểu dữ liệu cần thiết.

---

## Tóm Tắt Các Thay Đổi

### Files đã được sửa:

1. **`src/hooks/useHoverPrefetch.ts`**

   - Sửa useRef initialization với null value

2. **`src/hooks/usePrefetch.ts`**

   - Bỏ signal parameter khỏi userApi.getProfile()
   - Bỏ signal parameter khỏi purchasesApi.getPurchases()
   - Thêm type annotation cho trendingFilters

3. **`src/router/loaders.ts`**
   - Bỏ signal parameter khỏi userApi.getProfile() (2 chỗ)
   - Bỏ signal parameter khỏi purchasesApi.getPurchases()
   - Thêm type annotation cho trendingFilters

## Kiểm Tra Kết Quả

Sau khi sửa tất cả các lỗi, dự án đã build thành công:

```bash
$ pnpm run build
✓ 2311 modules transformed.
✓ built in 19.93s
```

## Bài Học Rút Ra

1. **React 19 Type Changes:** Cần chú ý các breaking changes trong React 19, đặc biệt là useRef yêu cầu initialValue.

2. **API Signature Consistency:** Cần đảm bảo việc gọi API methods phù hợp với signature đã định nghĩa.

3. **TypeScript Inference:** Khi làm việc với union types phức tạp, nên sử dụng explicit type annotations.

4. **Signal Parameter Handling:** Cần kiểm tra xem API có hỗ trợ AbortController signal hay không trước khi truyền.

## Khuyến Nghị

1. **Code Review:** Nên có process review code để catch những lỗi type mismatch sớm.

2. **Type Testing:** Cân nhắc thêm type-only tests để đảm bảo type safety.

3. **API Documentation:** Nên document rõ ràng API signatures để tránh confusion.

4. **Incremental Build:** Sử dụng `tsc --noEmit` thường xuyên để catch type errors sớm.

---

**Tất cả các lỗi đã được sửa hoàn toàn và dự án đã build thành công! 🎉**
