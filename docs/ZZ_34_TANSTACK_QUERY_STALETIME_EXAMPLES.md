# TanStack Query - Ví Dụ Cụ Thể Về StaleTime Với ListProduct

## 1. Tình Huống Thực Tế: User Duyệt Sản Phẩm

Giả sử user đang duyệt trang web Shopee Clone của bạn:

### 1.1 Setup Query Cho Product List

```typescript
// src/pages/ProductList/ProductList.tsx
const { data: productList } = useQuery({
  queryKey: ['products', { page: 1, category: 'electronics' }],
  queryFn: () => productApi.getProducts({ page: 1, category: 'electronics' }),
  staleTime: 3 * 60 * 1000, // 3 phút
  gcTime: 10 * 60 * 1000 // 10 phút
})
```

## 2. Timeline Chi Tiết: Caching Behavior

### 2.1 Scenario: User Thao Tác Trên Trang Web

```
⏰ Timeline                   📱 User Action              🔄 TanStack Query Behavior
────────────────────────────────────────────────────────────────────────────────

T0: 09:00:00                 Vào trang ProductList       ❌ Cache MISS
                                                         → Gọi API fetch products
                                                         → Lưu data vào cache
                                                         → Data: FRESH (staleTime = 3 phút)

T1: 09:01:30                 Click vào Product Detail    ✅ Cache HIT cho ProductList
                            (rồi quay lại)               → Data vẫn FRESH (< 3 phút)
                                                         → KHÔNG gọi API
                                                         → Trả về data từ cache ngay lập tức

T2: 09:03:30                 Refresh trang ProductList   ✅ Cache HIT nhưng data STALE
                                                         → Data đã STALE (> 3 phút)
                                                         → Trả về data cũ từ cache NGAY LẬP TỨC
                                                         → Đồng thời gọi API ngầm (background refetch)
                                                         → Update UI khi có data mới

T3: 09:05:00                 Navigate ra trang khác      🗑️ Query trở thành INACTIVE
                                                         → Bắt đầu đếm gcTime (10 phút)
                                                         → Data vẫn còn trong memory

T4: 09:08:00                 Quay lại ProductList        ✅ Cache HIT (trong gcTime)
                            (trong vòng 10 phút)         → Data STALE nhưng vẫn có trong cache
                                                         → Trả về data cũ + background refetch

T5: 09:16:00                 Quay lại ProductList        ❌ Cache MISS (hết gcTime)
                            (sau 10 phút)                → Data đã bị xóa khỏi memory
                                                         → Gọi API fetch từ đầu
```

## 3. Ví Dụ Code Thực Tế

### 3.1 Component ProductList

```typescript
function ProductList() {
  const [page, setPage] = useState(1)

  const {
    data: productList,
    isFetching,     // true khi đang gọi API (kể cả background)
    isLoading,      // true chỉ khi lần đầu load (pending + fetching)
    status
  } = useQuery({
    queryKey: ['products', { page, category: 'electronics' }],
    queryFn: () => productApi.getProducts({ page, category: 'electronics' }),
    staleTime: 3 * 60 * 1000, // 3 phút
    gcTime: 10 * 60 * 1000    // 10 phút
  })

  return (
    <div>
      {/* Hiển thị data ngay lập tức từ cache */}
      {productList?.data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}

      {/* Badge hiển thị khi background refetch */}
      {isFetching && !isLoading && (
        <div className="bg-blue-500 text-white px-2 py-1 rounded-sm">
          Đang cập nhật sản phẩm...
        </div>
      )}
    </div>
  )
}
```

### 3.2 Các Trạng Thái UI Khác Nhau

```typescript
// Case 1: Lần đầu load (T0)
// status: 'pending', isFetching: true, isLoading: true
// → Hiển thị loading spinner

// Case 2: Có data, đang background refetch (T2, T4)
// status: 'success', isFetching: true, isLoading: false
// → Hiển thị data + badge "Đang cập nhật..."

// Case 3: Có data, không fetch (T1)
// status: 'success', isFetching: false, isLoading: false
// → Chỉ hiển thị data
```

## 4. So Sánh Các Tình Huống StaleTime

### 4.1 StaleTime = 0 (Mặc định)

```typescript
// ❌ Không tối ưu
staleTime: 0

// Behavior:
// - Data ngay lập tức trở thành STALE
// - Mỗi lần mount component → Background refetch
// - Nhiều request không cần thiết
```

### 4.2 StaleTime = 3 phút (Tối ưu)

```typescript
// ✅ Tối ưu cho product list
staleTime: 3 * 60 * 1000

// Behavior:
// - Data FRESH trong 3 phút đầu
// - User navigate qua lại → Không refetch
// - Giảm 80% số request không cần thiết
```

### 4.3 StaleTime = Infinity (Static data)

```typescript
// ✅ Cho data ít thay đổi (categories, settings)
staleTime: Infinity

// Behavior:
// - Data không bao giờ STALE
// - Chỉ refetch khi manual invalidate
// - Tiết kiệm tối đa bandwidth
```

## 5. Ví Dụ Thực Tế: Multiple Components

### 5.1 Cùng Query Key → Share Cache

```typescript
// Component A: ProductList page
function ProductListPage() {
  const { data } = useQuery({
    queryKey: ['products', { page: 1 }],
    queryFn: () => fetchProducts({ page: 1 }),
    staleTime: 3 * 60 * 1000
  })
}

// Component B: Home page (featured products)
function HomePage() {
  const { data } = useQuery({
    queryKey: ['products', { page: 1 }], // ← CÙNG KEY
    queryFn: () => fetchProducts({ page: 1 }),
    staleTime: 3 * 60 * 1000
  })
}

// Kết quả:
// - Chỉ 1 request duy nhất cho cả 2 components
// - Data được share giữa ProductListPage và HomePage
// - Khi data update → cả 2 components đều re-render
```

### 5.2 Khác Query Key → Separate Cache

```typescript
// Component A: Page 1
const { data: page1 } = useQuery({
  queryKey: ['products', { page: 1 }],
  queryFn: () => fetchProducts({ page: 1 })
})

// Component B: Page 2
const { data: page2 } = useQuery({
  queryKey: ['products', { page: 2 }], // ← KHÁC KEY
  queryFn: () => fetchProducts({ page: 2 })
})

// Kết quả:
// - 2 request riêng biệt
// - 2 cache entries riêng biệt
// - Mỗi page có lifecycle riêng
```

## 6. Memory Timeline: GcTime Hoạt Động

```
Component Lifecycle:    Mount ──────── Unmount ──────────── Mount
                          │              │                   │
Query Status:           Active ────── Inactive ────────── Active
                          │              │                   │
Cache Memory:           In Use ────── GC Timer ─────────── In Use
                          │              │                   │
                          │              │◄─── 10 phút ───►  │
                          │              │                   │
User Experience:        Instant ───── Instant ──────────── Instant
                        Loading       (from cache)         (from cache)
                          │              │                   │
                          │              │                   │
                       Nếu > 10 phút:    │                   │
                       Cache bị xóa ─────┴─── Loading ──────┘
                       Phải fetch lại
```

## 7. Best Practices Cho Shopee Clone

### 7.1 Phân Loại Data Theo StaleTime

```typescript
// 🔄 Data thay đổi thường xuyên
const productPricesQuery = useQuery({
  queryKey: ['product-prices'],
  queryFn: fetchProductPrices,
  staleTime: 30 * 1000 // 30 giây
})

// 📦 Data ít thay đổi
const productListQuery = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  staleTime: 5 * 60 * 1000 // 5 phút
})

// 🏷️ Data hiếm khi thay đổi
const categoriesQuery = useQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
  staleTime: 60 * 60 * 1000 // 1 giờ
})
```

### 7.2 Tối Ưu UX Với Prefetch

```typescript
function ProductCard({ product }) {
  const queryClient = useQueryClient()

  const prefetchProductDetail = () => {
    queryClient.prefetchQuery({
      queryKey: ['product', product.id],
      queryFn: () => fetchProductDetail(product.id),
      staleTime: 10 * 60 * 1000 // 10 phút
    })
  }

  return (
    <Link
      to={`/product/${product.id}`}
      onMouseEnter={prefetchProductDetail} // Hover = prefetch
    >
      <img src={product.image} alt={product.name} />
    </Link>
  )
}

// Kết quả:
// - User hover → Prefetch detail
// - User click → Data đã có sẵn trong cache
// - Instant navigation, không loading
```

## 8. Key Takeaways

### 8.1 StaleTime Hiểu Đơn Giản

- **Fresh (< staleTime)**: Dùng cache, KHÔNG gọi API
- **Stale (> staleTime)**: Dùng cache + gọi API ngầm
- **No Cache**: Gọi API + hiển thị loading

### 8.2 Công Thức Tối Ưu

```
StaleTime = Thời gian user có thể chấp nhận data "cũ"

Ví dụ:
- Product prices: 30s (giá cần cập nhật thường xuyên)
- Product list: 5 phút (danh sách ít thay đổi)
- Categories: 1 giờ (danh mục rất ít thay đổi)
```

### 8.3 Memory Management

```
GcTime = Thời gian giữ cache sau khi không sử dụng

Quy tắc:
- gcTime > staleTime (luôn luôn)
- gcTime = 2-3 lần staleTime (khuyến nghị)
- Ví dụ: staleTime: 5 phút → gcTime: 15 phút
```

Với cách hiểu này, bạn có thể tối ưu performance và UX cho Shopee Clone một cách hiệu quả!
