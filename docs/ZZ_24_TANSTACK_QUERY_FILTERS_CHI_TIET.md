# Phân Tích Chi Tiết Kỹ Thuật Filters (Queries) Trong TanStack Query

## Tổng Quan

**Filters (Queries)** là một kỹ thuật cực kỳ quan trọng trong TanStack Query, cho phép chúng ta quản lý cache một cách thông minh và selective. Thay vì phải làm việc với từng query riêng lẻ, Filters giúp chúng ta có thể:

- **Tìm kiếm** và **lọc** các queries dựa trên patterns
- **Invalidate** (làm mất hiệu lực) nhiều queries cùng lúc
- **Refetch** các queries có liên quan
- **Quản lý cache** một cách thống nhất và hiệu quả

## Tại Sao Cần Filters?

### Vấn Đề Khi Không Có Filters

```typescript
// ❌ Cách làm KHÔNG hiệu quả - phải invalidate từng query một
const updateProduct = useMutation({
  mutationFn: updateProductApi,
  onSuccess: (updatedProduct) => {
    // Phải invalidate từng query riêng lẻ
    queryClient.invalidateQueries(['products', updatedProduct.id])
    queryClient.invalidateQueries(['products', 'list'])
    queryClient.invalidateQueries(['products', 'search'])
    queryClient.invalidateQueries(['products', 'trending'])
    queryClient.invalidateQueries(['products', 'related', updatedProduct.category])
    // ... còn nhiều queries khác nữa
  }
})
```

### Giải Pháp Với Filters

```typescript
// ✅ Cách làm HIỆU QUẢ - sử dụng filters để invalidate thông minh
const updateProduct = useMutation({
  mutationFn: updateProductApi,
  onSuccess: (updatedProduct) => {
    // Invalidate TẤT CẢ queries liên quan đến products
    queryClient.invalidateQueries({
      queryKey: ['products'] // Tất cả queries bắt đầu bằng 'products'
    })
  }
})
```

## Phân Tích Chi Tiết Code QueryFilters

### 1. Khai Báo QueryFilters Object

```typescript
// src/utils/queryFilters.ts
export const QueryFilters = {
  // Products
  products: {
    all: () => ({ queryKey: ['products'] }),
    lists: () => ({ queryKey: ['products', 'list'] }),
    list: (filters: ProductFilters) => ({
      queryKey: ['products', 'list', filters]
    }),
    details: () => ({ queryKey: ['products', 'detail'] }),
    detail: (id: string) => ({
      queryKey: ['products', 'detail', id]
    }),
    search: (term: string) => ({
      queryKey: ['products', 'search', term]
    })
  }
  // ... các entities khác
}
```

**Giải thích từng phần:**

#### `products.all()`

```typescript
all: () => ({ queryKey: ['products'] })
```

- **Mục đích**: Tạo filter để match với **TẤT CẢ** queries liên quan đến products
- **Cách hoạt động**: Khi sử dụng `['products']`, nó sẽ match với:
  - `['products', 'list', {...}]`
  - `['products', 'detail', 'id123']`
  - `['products', 'search', 'iphone']`
  - Bất kỳ query nào bắt đầu bằng `['products']`

#### `products.lists()`

```typescript
lists: () => ({ queryKey: ['products', 'list'] })
```

- **Mục đích**: Match với **TẤT CẢ** product lists (với bất kỳ filters nào)
- **Cách hoạt động**: Match với:
  - `['products', 'list', { category: 'electronics' }]`
  - `['products', 'list', { price_min: 100, price_max: 500 }]`
  - `['products', 'list', { page: 2, limit: 20 }]`

#### `products.list(filters)`

```typescript
list: (filters: ProductFilters) => ({
  queryKey: ['products', 'list', filters]
})
```

- **Mục đích**: Match với một product list **cụ thể** có filters chính xác
- **Cách hoạt động**: Chỉ match chính xác query có filters giống hệt
- **Ví dụ**: `QueryFilters.products.list({ category: 'electronics' })` chỉ match với query có key `['products', 'list', { category: 'electronics' }]`

### 2. Hook useQueryInvalidation

```typescript
// src/hooks/useQueryInvalidation.ts
import { useQueryClient } from '@tanstack/react-query'
import { QueryFilters } from '../utils/queryFilters'

export const useQueryInvalidation = () => {
  const queryClient = useQueryClient()

  return {
    // Invalidate all products
    invalidateProducts: () => {
      queryClient.invalidateQueries(QueryFilters.products.all())
    },

    // Invalidate specific product detail
    invalidateProductDetail: (productId: string) => {
      queryClient.invalidateQueries(QueryFilters.products.detail(productId))
    },

    // Invalidate product lists with specific filters
    invalidateProductLists: () => {
      queryClient.invalidateQueries(QueryFilters.products.lists())
    }
  }
}
```

**Giải thích từng method:**

#### `invalidateProducts()`

```typescript
invalidateProducts: () => {
  queryClient.invalidateQueries(QueryFilters.products.all())
}
```

- **Chức năng**: Invalidate **TẤT CẢ** queries liên quan đến products
- **Khi nào dùng**: Khi có thay đổi lớn ảnh hưởng đến toàn bộ hệ thống products
- **Ví dụ**: Khi user đăng xuất, thay đổi currency, hoặc có system update

#### `invalidateProductDetail(productId)`

```typescript
invalidateProductDetail: (productId: string) => {
  queryClient.invalidateQueries(QueryFilters.products.detail(productId))
}
```

- **Chức năng**: Chỉ invalidate một product detail cụ thể
- **Khi nào dùng**: Khi update thông tin của một sản phẩm cụ thể
- **Ví dụ**: User thay đổi quantity, add review cho sản phẩm

#### `invalidateProductLists()`

```typescript
invalidateProductLists: () => {
  queryClient.invalidateQueries(QueryFilters.products.lists())
}
```

- **Chức năng**: Invalidate tất cả product lists (nhưng không ảnh hưởng product details)
- **Khi nào dùng**: Khi có sản phẩm mới được thêm/xóa, price thay đổi
- **Ví dụ**: Admin thêm sản phẩm mới, thay đổi category

## Advanced Filtering với Predicate Functions

### 1. Complex Filtering Scenarios

```typescript
// Invalidate products in specific category
invalidateProductsByCategory: (categoryId: string) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const [entity, type, filters] = query.queryKey
      return entity === 'products' && type === 'list' && filters?.category === categoryId
    }
  })
}
```

**Giải thích Predicate Function:**

```typescript
predicate: (query) => {
  const [entity, type, filters] = query.queryKey
  // Destructure queryKey thành các phần
  // Ví dụ: ['products', 'list', { category: 'electronics', page: 1 }]
  // entity = 'products'
  // type = 'list'
  // filters = { category: 'electronics', page: 1 }

  return entity === 'products' && type === 'list' && filters?.category === categoryId
  // Chỉ return true nếu:
  // 1. Query về products
  // 2. Query là product list
  // 3. Query có category khớp với categoryId
}
```

### 2. Price Range Filtering

```typescript
// Invalidate products in price range
invalidateProductsByPriceRange: (minPrice: number, maxPrice: number) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const [entity, type, filters] = query.queryKey as any[]
      if (entity !== 'products' || type !== 'list') return false

      const filterPriceMin = filters?.price_min
      const filterPriceMax = filters?.price_max

      return filterPriceMin >= minPrice && filterPriceMax <= maxPrice
    }
  })
}
```

**Cách hoạt động:**

1. **Kiểm tra entity và type**: Chỉ xét queries về product lists
2. **Extract price filters**: Lấy `price_min` và `price_max` từ filters
3. **So sánh ranges**: Chỉ invalidate nếu price range của query nằm trong range cần invalidate

## Ví Dụ Thực Tế Trong Shopee Clone

### Scenario 1: User Thêm Sản Phẩm Vào Cart

```typescript
const addToCart = useMutation({
  mutationFn: addToCartApi,
  onSuccess: (data, variables) => {
    const { invalidateCart, invalidateProductDetail } = useQueryInvalidation()

    // 1. Invalidate cart để update số lượng items
    invalidateCart()

    // 2. Invalidate product detail để update stock quantity
    invalidateProductDetail(variables.productId)

    // 3. Không cần invalidate tất cả product lists vì stock thay đổi ít ảnh hưởng
  }
})
```

### Scenario 2: Admin Cập Nhật Giá Sản Phẩm

```typescript
const updateProductPrice = useMutation({
  mutationFn: updateProductPriceApi,
  onSuccess: (updatedProduct) => {
    const { invalidateProductDetail, invalidateProductsByPriceRange } = useQueryInvalidation()

    // 1. Invalidate product detail cụ thể
    invalidateProductDetail(updatedProduct.id)

    // 2. Invalidate các product lists có price range ảnh hưởng
    invalidateProductsByPriceRange(updatedProduct.oldPrice, updatedProduct.newPrice)

    // 3. Invalidate trending products nếu là sản phẩm hot
    if (updatedProduct.isTrending) {
      queryClient.invalidateQueries(['products', 'trending'])
    }
  }
})
```

### Scenario 3: User Đăng Xuất

```typescript
const logout = useMutation({
  mutationFn: logoutApi,
  onSuccess: () => {
    const { invalidateProducts, invalidateUser } = useQueryInvalidation()

    // 1. Invalidate tất cả user data
    invalidateUser()

    // 2. Invalidate cart và wishlist
    queryClient.invalidateQueries(['purchases'])
    queryClient.invalidateQueries(['wishlist'])

    // 3. Không invalidate products vì data vẫn valid cho anonymous user
    // Chỉ invalidate user-specific product data
    queryClient.invalidateQueries({
      predicate: (query) => {
        const [entity, type] = query.queryKey
        return (
          (entity === 'products' && type === 'recommendations') || (entity === 'products' && type === 'personalized')
        )
      }
    })
  }
})
```

## So Sánh: Manual vs Filters Approach

### Manual Approach (Không Khuyến Nghị)

```typescript
// ❌ Phải remember tất cả queries liên quan
const updateProduct = useMutation({
  onSuccess: (product) => {
    queryClient.invalidateQueries(['products', product.id])
    queryClient.invalidateQueries(['products', 'list'])
    queryClient.invalidateQueries(['products', 'search'])
    queryClient.invalidateQueries(['products', 'trending'])
    queryClient.invalidateQueries(['categories', product.category])
    // Dễ quên hoặc miss một số queries
  }
})
```

### Filters Approach (Khuyến Nghị)

```typescript
// ✅ Systematic và không bỏ sót
const updateProduct = useMutation({
  onSuccess: (product) => {
    const { invalidateProducts, invalidateProductsByCategory } = useQueryInvalidation()

    // Invalidate tất cả products
    invalidateProducts()

    // Hoặc chỉ invalidate category cụ thể
    invalidateProductsByCategory(product.category)
  }
})
```

## Best Practices

### 1. Thiết Kế Query Key Structure

```typescript
// ✅ Cấu trúc tốt - dễ filter
;['entity', 'operation', 'parameters'][('products', 'list', { category: 'electronics' })][
  ('products', 'detail', 'product-123')
][('users', 'profile')][
  // ❌ Cấu trúc không tốt - khó filter
  ('getProductList', 'electronics', 1, 20)
]['productDetail_123']['userProfile']
```

### 2. Granular Invalidation

```typescript
// ✅ Specific invalidation khi có thể
invalidateProductDetail(productId) // Chỉ ảnh hưởng 1 product

// ✅ Broad invalidation khi cần thiết
invalidateProducts() // Ảnh hưởng tất cả khi có major changes

// ❌ Quá broad khi không cần thiết
queryClient.invalidateQueries() // Invalidate TẤT CẢ queries!
```

### 3. Performance Considerations

```typescript
// ✅ Batch invalidations
const updateMultipleProducts = useMutation({
  onSuccess: (updatedProducts) => {
    // Chỉ invalidate 1 lần cuối cùng
    invalidateProductLists()

    // Thay vì invalidate từng product
    // updatedProducts.forEach(p => invalidateProductDetail(p.id))
  }
})
```

## Kết Luận

**Filters (Queries)** trong TanStack Query là một công cụ mạnh mẽ giúp:

1. **Quản lý cache hiệu quả**: Invalidate đúng queries cần thiết
2. **Code dễ maintain**: Centralized query management
3. **Performance tốt hơn**: Tránh over-invalidation hoặc under-invalidation
4. **Scalability**: Dễ dàng thêm queries mới mà không phá vỡ logic hiện tại

Trong dự án Shopee Clone, việc áp dụng Filters sẽ giúp quản lý cache cho products, cart, user data một cách thống nhất và hiệu quả.
