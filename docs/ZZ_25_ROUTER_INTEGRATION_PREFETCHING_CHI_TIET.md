# Router Integration với React Router - Giải Thích Chi Tiết

## Tổng Quan

Trong phần này, tôi sẽ giải thích chi tiết về cách tích hợp TanStack Query với React Router để thực hiện **prefetching** (tải trước dữ liệu) và tại sao phải return `queryClient` trong các loader functions.

## 1. Khái Niệm Cơ Bản

### 1.1 Prefetching là gì?

**Prefetching** là kỹ thuật tải trước dữ liệu **TRƯỚC KHI** user thực sự cần đến nó. Điều này giúp:

- ✅ Trang web load nhanh hơn
- ✅ User experience mượt mà hơn
- ✅ Giảm thời gian chờ đợi
- ✅ Tạo cảm giác "instant navigation"

### 1.2 Router Loader Functions là gì?

Trong **React Router v6**, `loader` functions cho phép bạn load dữ liệu **TRƯỚC KHI** component được render. Đây chính là nơi lý tưởng để thực hiện prefetching.

```typescript
// Loader function chạy TRƯỚC khi component render
export const productDetailLoader: LoaderFunction = async ({ params }) => {
  // Load dữ liệu ở đây
  // Component sẽ nhận được dữ liệu đã sẵn sàng
  return data
}
```

## 2. Tại Sao Phải Return QueryClient?

### 2.1 Vấn Đề Cần Giải Quyết

Khi sử dụng TanStack Query, dữ liệu được lưu trong **QueryClient cache**. Nhưng có một vấn đề:

❌ **Vấn đề**: Loader function chạy **TRƯỚC** khi React component mount
❌ **Vấn đề**: QueryClient của component chưa được khởi tạo  
❌ **Vấn đề**: Dữ liệu prefetch không thể share với component

### 2.2 Giải Pháp: Return QueryClient

✅ **Giải pháp**: Tạo QueryClient trong loader và return về
✅ **Kết quả**: Component sẽ nhận được QueryClient đã có sẵn dữ liệu
✅ **Lợi ích**: Không cần fetch lại, dữ liệu hiển thị ngay lập tức

## 3. Phân Tích Code Chi Tiết

### 3.1 ProductDetailLoader Function

```typescript
export const productDetailLoader: LoaderFunction = async ({ params, request }) => {
  // 🔸 BƯỚC 1: Tạo QueryClient mới
  const queryClient = new QueryClient()

  // 🔸 BƯỚC 2: Lấy productId từ URL params
  const productId = params.productId!

  // 🔸 BƯỚC 3: Prefetch nhiều dữ liệu song song
  await Promise.allSettled([
    // Prefetch thông tin sản phẩm
    queryClient.prefetchQuery({
      queryKey: ['products', productId],
      queryFn: () => productApi.getProductDetail(productId)
    }),

    // Prefetch reviews của sản phẩm
    queryClient.prefetchQuery({
      queryKey: ['reviews', productId],
      queryFn: () => reviewApi.getProductReviews(productId)
    }),

    // Prefetch thông tin cửa hàng
    queryClient.prefetchQuery({
      queryKey: ['stores', 'by-product', productId],
      queryFn: () => storeApi.getStoreByProduct(productId)
    })
  ])

  // 🔸 BƯỚC 4: Return QueryClient chứa dữ liệu đã prefetch
  return queryClient
}
```

### 3.2 Tại Sao Dùng Promise.allSettled?

```typescript
// ❌ CÁCH KHÔNG TỐT: Dùng Promise.all
await Promise.all([
  queryClient.prefetchQuery(...),
  queryClient.prefetchQuery(...),
  queryClient.prefetchQuery(...)
])
// Nếu 1 query fail → TẤT CẢ fail → Trang không load được

// ✅ CÁCH TỐT: Dùng Promise.allSettled
await Promise.allSettled([
  queryClient.prefetchQuery(...),
  queryClient.prefetchQuery(...),
  queryClient.prefetchQuery(...)
])
// Nếu 1 query fail → Các query khác vẫn tiếp tục
// Trang vẫn load được với dữ liệu có sẵn
```

## 4. Cách Router Sử Dụng QueryClient

### 4.1 Định Nghĩa Routes

```typescript
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'products/:productId',
        element: <ProductDetail />,
        loader: productDetailLoader, // 🔸 Loader chạy trước
      },
      {
        path: 'products',
        element: <ProductList />,
        loader: productListLoader, // 🔸 Loader chạy trước
      }
    ]
  }
])
```

### 4.2 Component Nhận QueryClient

```typescript
// src/pages/ProductDetail/ProductDetail.tsx
import { useLoaderData } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function ProductDetail() {
  // 🔸 Nhận QueryClient từ loader
  const queryClient = useLoaderData() as QueryClient

  return (
    <QueryClientProvider client={queryClient}>
      <ProductDetailContent />
    </QueryClientProvider>
  )
}

function ProductDetailContent() {
  const { productId } = useParams()

  // 🔸 Query này SẼ KHÔNG fetch lại vì dữ liệu đã có trong cache
  const { data: product } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductDetail(productId!),
  })

  // 🔸 Dữ liệu hiển thị NGAY LẬP TỨC vì đã được prefetch
  return (
    <div>
      <h1>{product?.name}</h1>
      <p>{product?.description}</p>
    </div>
  )
}
```

## 5. Flow Hoạt Động Hoàn Chỉnh

### 5.1 Timeline Chi Tiết

```
User click vào link "/products/123"
           ⬇️
React Router khởi động navigation
           ⬇️
productDetailLoader được gọi
           ⬇️
Tạo QueryClient mới
           ⬇️
Prefetch 3 queries song song:
- Product detail (products/123)
- Product reviews (reviews/123)
- Store info (stores/by-product/123)
           ⬇️
QueryClient cache đã chứa dữ liệu
           ⬇️
Return QueryClient về cho React Router
           ⬇️
ProductDetail component render
           ⬇️
Component nhận QueryClient từ useLoaderData()
           ⬇️
Wrap component với QueryClientProvider
           ⬇️
Child components dùng useQuery
           ⬇️
useQuery tìm thấy dữ liệu trong cache
           ⬇️
Dữ liệu hiển thị NGAY LẬP TỨC ⚡
```

### 5.2 So Sánh Với/Không Có Prefetching

```typescript
// ❌ KHÔNG CÓ PREFETCHING
function ProductDetailWithoutPrefetch() {
  const { productId } = useParams()

  // 🔸 Fetch khi component mount
  const { data: product, isLoading } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductDetail(productId!),
  })

  if (isLoading) {
    return <div>Loading...</div> // User phải chờ đợi
  }

  return <div>{product?.name}</div>
}

// ✅ CÓ PREFETCHING
function ProductDetailWithPrefetch() {
  const queryClient = useLoaderData() as QueryClient
  const { productId } = useParams()

  return (
    <QueryClientProvider client={queryClient}>
      <ProductContent productId={productId} />
    </QueryClientProvider>
  )
}

function ProductContent({ productId }: { productId: string }) {
  // 🔸 Dữ liệu đã có sẵn, không cần loading
  const { data: product } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductDetail(productId),
  })

  // 🔸 Hiển thị ngay lập tức
  return <div>{product?.name}</div>
}
```

## 6. Lợi Ích Của Approach Này

### 6.1 Performance Benefits

1. **Faster Page Loads**: Dữ liệu load song song với navigation
2. **No Loading Spinners**: User thấy content ngay lập tức
3. **Better UX**: Trải nghiệm mượt mà, không bị gián đoạn
4. **Reduced Network Requests**: Tránh duplicate requests

### 6.2 Developer Experience

1. **Separation of Concerns**: Logic prefetch tách biệt khỏi UI
2. **Type Safety**: Full TypeScript support
3. **Error Handling**: Centralized error handling trong loader
4. **Testability**: Dễ test loader functions riêng biệt

## 7. Advanced Patterns

### 7.1 Conditional Prefetching

```typescript
export const productDetailLoader: LoaderFunction = async ({ params, request }) => {
  const queryClient = new QueryClient()
  const productId = params.productId!
  const url = new URL(request.url)

  // 🔸 Luôn prefetch product detail
  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: ['products', productId],
      queryFn: () => productApi.getProductDetail(productId)
    })
  ]

  // 🔸 Conditional prefetch dựa trên query params
  if (url.searchParams.get('includeReviews') === 'true') {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: ['reviews', productId],
        queryFn: () => reviewApi.getProductReviews(productId)
      })
    )
  }

  if (url.searchParams.get('includeRelated') === 'true') {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: ['products', 'related', productId],
        queryFn: () => productApi.getRelatedProducts(productId)
      })
    )
  }

  await Promise.allSettled(prefetchPromises)
  return queryClient
}
```

### 7.2 Error Handling Strategies

```typescript
export const productDetailLoader: LoaderFunction = async ({ params }) => {
  const queryClient = new QueryClient()
  const productId = params.productId!

  try {
    // 🔸 Critical data - phải thành công
    await queryClient.prefetchQuery({
      queryKey: ['products', productId],
      queryFn: () => productApi.getProductDetail(productId)
    })

    // 🔸 Non-critical data - fail cũng được
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['reviews', productId],
        queryFn: () => reviewApi.getProductReviews(productId)
      }),
      queryClient.prefetchQuery({
        queryKey: ['stores', 'by-product', productId],
        queryFn: () => storeApi.getStoreByProduct(productId)
      })
    ])
  } catch (error) {
    // 🔸 Nếu critical data fail, redirect về 404
    if (error.response?.status === 404) {
      throw new Response('Product not found', { status: 404 })
    }

    // 🔸 Các lỗi khác, log và continue
    console.error('Prefetch error:', error)
  }

  return queryClient
}
```

## 8. Best Practices

### 8.1 QueryClient Configuration

```typescript
export const createPrefetchQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 phút
        gcTime: 10 * 60 * 1000, // 10 phút
        retry: (failureCount, error: any) => {
          // Không retry trong prefetch nếu 404
          if (error?.response?.status === 404) return false
          return failureCount < 2 // Ít retry hơn để loader nhanh hơn
        }
      }
    }
  })
}

export const productDetailLoader: LoaderFunction = async ({ params }) => {
  const queryClient = createPrefetchQueryClient()
  // ... rest of the code
}
```

### 8.2 Stale Time Strategy

```typescript
const prefetchConfig = {
  // Critical data - fresh hơn
  product: { staleTime: 2 * 60 * 1000 }, // 2 phút

  // Semi-critical data
  reviews: { staleTime: 5 * 60 * 1000 }, // 5 phút

  // Non-critical data - stale longer
  related: { staleTime: 15 * 60 * 1000 }, // 15 phút
  store: { staleTime: 30 * 60 * 1000 } // 30 phút
}

await Promise.allSettled([
  queryClient.prefetchQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductDetail(productId),
    ...prefetchConfig.product
  }),
  queryClient.prefetchQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.getProductReviews(productId),
    ...prefetchConfig.reviews
  })
])
```

## 9. Kết Luận

**Router Integration với React Router** trong TanStack Query hoạt động theo nguyên lý:

1. 🎯 **Loader function** chạy trước khi component render
2. 🎯 **Tạo QueryClient** và prefetch dữ liệu vào cache
3. 🎯 **Return QueryClient** về cho component
4. 🎯 **Component sử dụng** QueryClient đã có sẵn dữ liệu
5. 🎯 **useQuery tìm thấy** dữ liệu trong cache và hiển thị ngay

Điều này giúp tạo ra trải nghiệm **"instant navigation"** - user thấy content ngay lập tức mà không cần chờ đợi loading.
