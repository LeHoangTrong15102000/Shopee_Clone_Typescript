# GcTime - Khi Nào Bắt Đầu Đếm?

## 1. Khái Niệm "Không Sử Dụng" (Inactive)

### 1.1 Query Trở Thành Inactive Khi Nào?

```typescript
// Query chỉ INACTIVE khi:
// ❌ KHÔNG còn component nào đang subscribe (useQuery)
// ❌ KHÔNG còn observer nào active

// Ví dụ:
function HomePage() {
  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    gcTime: 10 * 60 * 1000 // 10 phút
  })
}

// Trạng thái query:
// - Component mount → Query ACTIVE
// - Component unmount → Query INACTIVE → gcTime bắt đầu đếm
```

## 2. Timeline Chi Tiết: GcTime Hoạt Động

```
📱 User Action                    🔄 Query Status              ⏰ GcTime Status
─────────────────────────────────────────────────────────────────────────────

T0: Vào HomePage                  Query: ACTIVE               GcTime: KHÔNG đếm
    → Component mount             Observer: 1                 (đang có observer)
    → Gọi API listProduct

T1: Vào ProductDetail page       Query: ACTIVE               GcTime: KHÔNG đếm
    → HomePage unmount            Observer: 0                 (vừa mới unmount)
    → Không còn observer          Query: INACTIVE ←───────    GcTime: BẮT ĐẦU đếm

T2: Vào About page               Query: INACTIVE             GcTime: Đang đếm
    → Vẫn không có observer       Observer: 0                 (7 phút còn lại)

T3: Quay lại HomePage            Query: ACTIVE               GcTime: DỪNG đếm
    → Component mount lại         Observer: 1                 (có observer trở lại)
    → Data STALE → Background refetch
```

## 3. Ví Dụ Cụ Thể: Multiple Pages

### 3.1 Scenario: User Navigate Giữa Các Trang

```typescript
// HomePage.tsx
function HomePage() {
  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 3 * 60 * 1000,  // 3 phút
    gcTime: 10 * 60 * 1000     // 10 phút
  })
}

// AboutPage.tsx - KHÔNG có useQuery['products']
function AboutPage() {
  return <div>About us...</div>
}

// ContactPage.tsx - KHÔNG có useQuery['products']
function ContactPage() {
  return <div>Contact...</div>
}
```

### 3.2 Timeline Thực Tế

```
09:00 - HomePage mount
        → Query ['products']: ACTIVE
        → Observer count: 1
        → GcTime: KHÔNG đếm

09:02 - Navigate to AboutPage
        → HomePage unmount
        → Query ['products']: INACTIVE ←── BẮT ĐẦU ĐÂY
        → Observer count: 0
        → GcTime: BẮT ĐẦU đếm (10 phút)

09:05 - Navigate to ContactPage
        → Query ['products']: vẫn INACTIVE
        → Observer count: vẫn 0
        → GcTime: tiếp tục đếm (7 phút còn lại)

09:08 - Quay lại HomePage
        → HomePage mount
        → Query ['products']: ACTIVE trở lại
        → Observer count: 1
        → GcTime: DỪNG đếm
        → Data STALE (> 3 phút) → Background refetch
```

## 4. Trường Hợp Đặc Biệt

### 4.1 Multiple Components Cùng Query

```typescript
// HomePage.tsx
function HomePage() {
  const { data } = useQuery({ queryKey: ['products'], ... })
}

// Sidebar.tsx
function Sidebar() {
  const { data } = useQuery({ queryKey: ['products'], ... }) // CÙNG KEY
}

// Timeline:
// - HomePage mount → Observer: 1
// - Sidebar mount → Observer: 2
// - HomePage unmount → Observer: 1 (vẫn ACTIVE)
// - Sidebar unmount → Observer: 0 (mới INACTIVE)
```

### 4.2 Prefetch Không Ảnh Hưởng GcTime

```typescript
// Prefetch KHÔNG tạo observer
queryClient.prefetchQuery({
  queryKey: ['products'],
  queryFn: fetchProducts
})

// Query vẫn INACTIVE nếu không có useQuery nào subscribe
```

## 5. Key Points

### 5.1 GcTime Chỉ Đếm Khi

- ✅ Observer count = 0 (không còn useQuery nào)
- ✅ Query status = INACTIVE
- ✅ Component đã unmount hoàn toàn

### 5.2 GcTime KHÔNG Đếm Khi

- ❌ Còn ít nhất 1 component đang useQuery
- ❌ Query status = ACTIVE
- ❌ Component chỉ re-render (không unmount)

### 5.3 Behavior Khi Query INACTIVE + STALE

```typescript
// Khi user quay lại sau khi query đã STALE nhưng chưa hết gcTime:

// 1. Trả về cached data NGAY LẬP TỨC (UX tốt)
// 2. Chạy background refetch (data fresh)
// 3. Update UI khi có data mới
// 4. Query trở thành ACTIVE trở lại
```

## 6. Công Thức Nhớ

```
GcTime bắt đầu đếm = Observer count = 0

Nghĩa là:
- Có component dùng → KHÔNG đếm
- Không có component dùng → BẮT ĐẦU đếm
- Có component dùng trở lại → DỪNG đếm
```

Vậy câu trả lời cho câu hỏi của bạn là: **GcTime chỉ bắt đầu đếm khi không còn component nào đang subscribe đến query đó, không phải khi user navigate ra trang khác.**
