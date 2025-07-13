# Phân Tích Các Kỹ Thuật Nâng Cao TanStack Query Cho Dự Án Shopee Clone

## Tổng Quan

Dựa vào hình ảnh bạn gửi, tôi sẽ phân tích từng kỹ thuật nâng cao trong TanStack Query và đánh giá mức độ phù hợp cho dự án Shopee Clone của bạn.

## 1. Query Cancellation (Hủy Query)

### Mô tả

Query Cancellation cho phép hủy các request HTTP đang chạy khi không còn cần thiết, giúp tiết kiệm băng thông và tránh race conditions.

### Mức độ phù hợp: ⭐⭐⭐⭐⭐ (Rất quan trọng)

### Lý do áp dụng cho Shopee Clone:

- **Tìm kiếm sản phẩm**: Khi user gõ nhanh, hủy các request cũ
- **Navigation**: Khi user chuyển trang nhanh, hủy request trang trước
- **Filter products**: Khi thay đổi filter liên tục

### Ví dụ Implementation:

```typescript
// src/hooks/useSearchProducts.tsx
import { useQuery } from '@tanstack/react-query'
import { productApi } from '../apis/product.api'

export const useSearchProducts = (searchTerm: string) => {
  return useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async ({ signal }) => {
      // Truyền AbortSignal vào fetch request
      return productApi.searchProducts(searchTerm, { signal })
    },
    enabled: searchTerm.length > 0,
    staleTime: 30 * 1000, // 30 giây
  })
}

// src/apis/product.api.ts
export const searchProducts = async (
  searchTerm: string,
  options?: { signal?: AbortSignal }
) => {
  const response = await fetch(`/api/products/search?q=${searchTerm}`, {
    signal: options?.signal, // Quan trọng: truyền signal vào fetch
  })

  if (!response.ok) {
    throw new Error('Search failed')
  }

  return response.json()
}

// src/components/Header/SearchSuggestions/SearchSuggestions.tsx
function SearchSuggestions() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Tự động hủy request cũ khi searchTerm thay đổi
  const { data, isLoading } = useSearchProducts(debouncedSearchTerm)

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
      />
      {isLoading && <div>Đang tìm kiếm...</div>}
      {data?.map(product => (
        <SearchResultItem key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Race Condition Prevention:

```typescript
// Ví dụ về race condition và cách giải quyết
function ProductFilters() {
  const [category, setCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')

  // TanStack Query tự động hủy request cũ khi key thay đổi
  const { data: products } = useQuery({
    queryKey: ['products', 'filtered', { category, priceRange }],
    queryFn: ({ signal }) => {
      return productApi.getFilteredProducts({
        category,
        priceRange
      }, { signal })
    },
  })

  // Khi user thay đổi filter nhanh:
  // Request 1: category="electronics", priceRange=""
  // Request 2: category="electronics", priceRange="100-500"
  // → Request 1 sẽ bị hủy tự động

  return (
    <div>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Tất cả danh mục</option>
        <option value="electronics">Điện tử</option>
        <option value="fashion">Thời trang</option>
      </select>

      <select
        value={priceRange}
        onChange={(e) => setPriceRange(e.target.value)}
      >
        <option value="">Tất cả giá</option>
        <option value="0-100">0 - 100k</option>
        <option value="100-500">100k - 500k</option>
      </select>

      <ProductList products={products} />
    </div>
  )
}
```

## 2. Scroll Restoration (Khôi Phục Vị Trí Cuộn)

### Mô tả

Khôi phục vị trí cuộn trang khi user quay lại từ trang detail về trang list.

### Mức độ phù hợp: ⭐⭐⭐⭐⭐ (Rất quan trọng cho UX)

### Lý do áp dụng cho Shopee Clone:

- **Product List**: Giữ vị trí cuộn khi xem chi tiết sản phẩm
- **Search Results**: Khôi phục vị trí sau khi back
- **Category Browse**: UX tốt hơn khi duyệt nhiều sản phẩm

### Ví dụ Implementation:

```typescript
// src/hooks/useScrollRestoration.ts
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export const useScrollRestoration = (key: string) => {
  const location = useLocation()
  const scrollPositions = useRef<Record<string, number>>({})

  useEffect(() => {
    // Lưu vị trí cuộn hiện tại
    const saveScrollPosition = () => {
      scrollPositions.current[key] = window.scrollY
    }

    // Khôi phục vị trí cuộn
    const restoreScrollPosition = () => {
      const savedPosition = scrollPositions.current[key]
      if (savedPosition !== undefined) {
        window.scrollTo(0, savedPosition)
      }
    }

    // Khôi phục khi component mount
    const timer = setTimeout(restoreScrollPosition, 100)

    // Lưu vị trí khi component unmount
    window.addEventListener('beforeunload', saveScrollPosition)

    return () => {
      clearTimeout(timer)
      saveScrollPosition()
      window.removeEventListener('beforeunload', saveScrollPosition)
    }
  }, [key, location.pathname])

  return {
    savePosition: () => {
      scrollPositions.current[key] = window.scrollY
    }
  }
}

// src/pages/ProductList/ProductList.tsx
function ProductList() {
  const location = useLocation()
  const { data: productsData } = useQuery({
    queryKey: ['products', location.search],
    queryFn: () => productApi.getProducts(parseQueryString(location.search)),
    staleTime: 5 * 60 * 1000,
  })

  // Khôi phục scroll cho trang product list
  const { savePosition } = useScrollRestoration(`product-list-${location.search}`)

  const handleProductClick = (productId: string) => {
    // Lưu vị trí trước khi navigate
    savePosition()
    navigate(`/products/${productId}`)
  }

  return (
    <div className="product-list">
      {productsData?.data.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => handleProductClick(product.id)}
        />
      ))}
    </div>
  )
}
```

### Tích hợp với React Router:

```typescript
// src/utils/scrollRestoration.ts
interface ScrollPosition {
  pathname: string
  search: string
  scrollY: number
  timestamp: number
}

class ScrollRestorationManager {
  private positions: Map<string, ScrollPosition> = new Map()
  private maxAge = 30 * 60 * 1000 // 30 phút

  savePosition(pathname: string, search: string) {
    const key = `${pathname}${search}`
    this.positions.set(key, {
      pathname,
      search,
      scrollY: window.scrollY,
      timestamp: Date.now()
    })

    // Cleanup old positions
    this.cleanup()
  }

  restorePosition(pathname: string, search: string): number | null {
    const key = `${pathname}${search}`
    const position = this.positions.get(key)

    if (position && Date.now() - position.timestamp < this.maxAge) {
      return position.scrollY
    }

    return null
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, position] of this.positions) {
      if (now - position.timestamp > this.maxAge) {
        this.positions.delete(key)
      }
    }
  }
}

export const scrollManager = new ScrollRestorationManager()

// src/components/ScrollRestoration.tsx
function ScrollRestoration() {
  const location = useLocation()
  const prevLocation = useRef(location)

  useEffect(() => {
    // Lưu vị trí của trang trước
    if (prevLocation.current !== location) {
      scrollManager.savePosition(prevLocation.current.pathname, prevLocation.current.search)
    }

    // Khôi phục vị trí của trang hiện tại
    const savedPosition = scrollManager.restorePosition(location.pathname, location.search)

    if (savedPosition !== null) {
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition)
      })
    } else {
      window.scrollTo(0, 0) // Cuộn về đầu trang cho trang mới
    }

    prevLocation.current = location
  }, [location])

  return null
}
```

## 3. Filters (Lọc Queries)

### Mô tả

Hệ thống filter mạnh mẽ để quản lý, invalidate và refetch queries một cách selective.

### Mức độ phù hợp: ⭐⭐⭐⭐⭐ (Cực kỳ quan trọng)

### Lý do áp dụng cho Shopee Clone:

- **Cache Management**: Quản lý cache phức tạp với nhiều loại data
- **Real-time Updates**: Invalidate specific data khi có thay đổi
- **Performance**: Tránh refetch không cần thiết

### Ví dụ Implementation:

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
  },

  // Cart & Purchases
  purchases: {
    all: () => ({ queryKey: ['purchases'] }),
    byStatus: (status: PurchaseStatus) => ({
      queryKey: ['purchases', { status }]
    }),
    cart: () => ({
      queryKey: ['purchases', { status: purchaseStatus.inCart }]
    })
  },

  // User
  user: {
    all: () => ({ queryKey: ['user'] }),
    profile: () => ({ queryKey: ['user', 'profile'] }),
    addresses: () => ({ queryKey: ['user', 'addresses'] })
  },

  // Categories
  categories: {
    all: () => ({ queryKey: ['categories'] }),
    tree: () => ({ queryKey: ['categories', 'tree'] })
  }
}

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
    },

    // Invalidate cart
    invalidateCart: () => {
      queryClient.invalidateQueries(QueryFilters.purchases.cart())
    },

    // Invalidate user data
    invalidateUser: () => {
      queryClient.invalidateQueries(QueryFilters.user.all())
    },

    // Advanced: Invalidate products in specific category
    invalidateProductsByCategory: (categoryId: string) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const [entity, type, filters] = query.queryKey
          return entity === 'products' && type === 'list' && filters?.category === categoryId
        }
      })
    },

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
  }
}
```

### Selective Cache Updates:

```typescript
// src/hooks/useProductMutations.ts
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  const { invalidateProductDetail, invalidateProductLists } = useQueryInvalidation()

  return useMutation({
    mutationFn: (data: { productId: string; updates: ProductUpdate }) =>
      productApi.updateProduct(data.productId, data.updates),

    onMutate: async ({ productId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(QueryFilters.products.detail(productId))

      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(QueryFilters.products.detail(productId).queryKey)

      // Optimistically update
      queryClient.setQueryData(QueryFilters.products.detail(productId).queryKey, (old: any) => ({ ...old, ...updates }))

      return { previousProduct, productId }
    },

    onError: (err, { productId }, context) => {
      // Rollback
      if (context?.previousProduct) {
        queryClient.setQueryData(QueryFilters.products.detail(productId).queryKey, context.previousProduct)
      }
    },

    onSettled: (data, error, { productId }) => {
      // Always refetch to ensure consistency
      invalidateProductDetail(productId)

      // If price or category changed, invalidate lists
      if (data?.price !== undefined || data?.category !== undefined) {
        invalidateProductLists()
      }
    }
  })
}
```

### Complex Filtering Scenarios:

```typescript
// src/hooks/useAdvancedFilters.ts
export const useAdvancedFilters = () => {
  const queryClient = useQueryClient()

  return {
    // Remove all cached searches
    clearSearchCache: () => {
      queryClient.removeQueries({
        predicate: (query) => {
          const [entity, type] = query.queryKey
          return entity === 'products' && type === 'search'
        }
      })
    },

    // Get all cached product lists
    getCachedProductLists: () => {
      return queryClient.getQueriesData({
        predicate: (query) => {
          const [entity, type] = query.queryKey
          return entity === 'products' && type === 'list'
        }
      })
    },

    // Prefetch related products based on current filters
    prefetchRelatedProducts: (currentFilters: ProductFilters) => {
      // Prefetch similar categories
      if (currentFilters.category) {
        const relatedCategories = getRelatedCategories(currentFilters.category)

        relatedCategories.forEach((category) => {
          queryClient.prefetchQuery({
            queryKey: ['products', 'list', { ...currentFilters, category }],
            queryFn: () => productApi.getProducts({ ...currentFilters, category }),
            staleTime: 30 * 1000
          })
        })
      }

      // Prefetch nearby price ranges
      if (currentFilters.price_min && currentFilters.price_max) {
        const nearbyRanges = getNearbyPriceRanges(currentFilters.price_min, currentFilters.price_max)

        nearbyRanges.forEach((range) => {
          queryClient.prefetchQuery({
            queryKey: [
              'products',
              'list',
              {
                ...currentFilters,
                price_min: range.min,
                price_max: range.max
              }
            ],
            queryFn: () =>
              productApi.getProducts({
                ...currentFilters,
                price_min: range.min,
                price_max: range.max
              }),
            staleTime: 30 * 1000
          })
        })
      }
    }
  }
}
```

## 4. Performance & Request Waterfalls

### Mô tả

Tối ưu hóa performance bằng cách tránh request waterfalls và sử dụng parallel queries.

### Mức độ phù hợp: ⭐⭐⭐⭐⭐ (Cực kỳ quan trọng)

### Lý do áp dụng cho Shopee Clone:

- **Page Load Speed**: Load multiple data sources đồng thời
- **User Experience**: Giảm loading time
- **Resource Efficiency**: Tối ưu network requests

### Ví dụ Implementation:

```typescript
// TRƯỚC: Request Waterfall (Chậm) ❌
function ProductDetailPageBad({ productId }: { productId: string }) {
  // Step 1: Load product detail
  const { data: product } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductDetail(productId),
  })

  // Step 2: Chỉ load reviews sau khi có product (WATERFALL!)
  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.getProductReviews(productId),
    enabled: !!product, // Phụ thuộc vào product
  })

  // Step 3: Chỉ load related products sau khi có product (WATERFALL!)
  const { data: relatedProducts } = useQuery({
    queryKey: ['products', 'related', product?.category],
    queryFn: () => productApi.getRelatedProducts(product.category),
    enabled: !!product?.category, // Phụ thuộc vào product
  })

  return <ProductDetailContent />
}

// SAU: Parallel Queries (Nhanh) ✅
function ProductDetailPage({ productId }: { productId: string }) {
  // Tất cả queries chạy song song
  const productQuery = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductDetail(productId),
    staleTime: 5 * 60 * 1000,
  })

  const reviewsQuery = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.getProductReviews(productId),
    staleTime: 2 * 60 * 1000,
  })

  // Prefetch category info để lấy related products
  const categoryQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoryApi.getAllCategories(),
    staleTime: 10 * 60 * 1000,
  })

  // Related products query - không cần chờ product detail
  const relatedProductsQuery = useQuery({
    queryKey: ['products', 'related', productId],
    queryFn: async () => {
      // Lấy category từ cache hoặc fetch product detail
      const cachedProduct = queryClient.getQueryData(['products', productId])
      if (cachedProduct?.category) {
        return productApi.getRelatedProducts(cachedProduct.category)
      }

      // Fallback: fetch product detail to get category
      const product = await productApi.getProductDetail(productId)
      return productApi.getRelatedProducts(product.category)
    },
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = productQuery.isLoading || reviewsQuery.isLoading

  return (
    <div>
      {isLoading ? (
        <ProductDetailSkeleton />
      ) : (
        <ProductDetailContent
          product={productQuery.data}
          reviews={reviewsQuery.data}
          relatedProducts={relatedProductsQuery.data}
        />
      )}
    </div>
  )
}
```

### Dashboard với Multiple Data Sources:

```typescript
// src/pages/Home/Home.tsx
function HomePage() {
  // Tất cả queries chạy song song để load dashboard
  const queries = {
    banners: useQuery({
      queryKey: ['banners', 'home'],
      queryFn: () => bannerApi.getHomeBanners(),
      staleTime: 10 * 60 * 1000,
    }),

    flashSale: useQuery({
      queryKey: ['flash-sale', 'current'],
      queryFn: () => flashSaleApi.getCurrentFlashSale(),
      staleTime: 30 * 1000, // 30 giây vì flash sale thay đổi nhanh
      refetchInterval: 60 * 1000, // Refetch mỗi phút
    }),

    categories: useQuery({
      queryKey: ['categories', 'featured'],
      queryFn: () => categoryApi.getFeaturedCategories(),
      staleTime: 15 * 60 * 1000,
    }),

    trendingProducts: useQuery({
      queryKey: ['products', 'trending'],
      queryFn: () => productApi.getTrendingProducts(),
      staleTime: 5 * 60 * 1000,
    }),

    newProducts: useQuery({
      queryKey: ['products', 'new'],
      queryFn: () => productApi.getNewProducts(),
      staleTime: 5 * 60 * 1000,
    }),

    userRecommendations: useQuery({
      queryKey: ['recommendations', 'user'],
      queryFn: () => recommendationApi.getUserRecommendations(),
      staleTime: 10 * 60 * 1000,
      enabled: !!user, // Chỉ load nếu user đã login
    }),
  }

  // Check if critical data is loading
  const isCriticalLoading = queries.banners.isLoading || queries.categories.isLoading

  // Check if any query has error
  const hasError = Object.values(queries).some(query => query.isError)

  if (isCriticalLoading) {
    return <HomePageSkeleton />
  }

  if (hasError) {
    return <ErrorFallback onRetry={() => {
      Object.values(queries).forEach(query => query.refetch())
    }} />
  }

  return (
    <div className="home-page">
      <HeroBanner banners={queries.banners.data} />
      <FlashSaleSection
        flashSale={queries.flashSale.data}
        isLoading={queries.flashSale.isLoading}
      />
      <CategoryGrid categories={queries.categories.data} />
      <ProductSection
        title="Sản phẩm trending"
        products={queries.trendingProducts.data}
        isLoading={queries.trendingProducts.isLoading}
      />
      <ProductSection
        title="Sản phẩm mới"
        products={queries.newProducts.data}
        isLoading={queries.newProducts.isLoading}
      />
      {user && (
        <ProductSection
          title="Gợi ý cho bạn"
          products={queries.userRecommendations.data}
          isLoading={queries.userRecommendations.isLoading}
        />
      )}
    </div>
  )
}
```

### Smart Loading States:

```typescript
// src/hooks/useSmartLoading.ts
export const useSmartLoading = (queries: Record<string, any>) => {
  const loadingStates = {
    // Critical data that blocks UI
    critical: Object.entries(queries)
      .filter(([key]) => ['product', 'user', 'categories'].includes(key))
      .some(([, query]) => query.isLoading),

    // Secondary data that can load in background
    secondary: Object.entries(queries)
      .filter(([key]) => ['reviews', 'related', 'recommendations'].includes(key))
      .some(([, query]) => query.isLoading),

    // Any query is loading
    any: Object.values(queries).some(query => query.isLoading),

    // All queries completed
    complete: Object.values(queries).every(query =>
      query.isSuccess || query.isError
    ),

    // Progress percentage
    progress: () => {
      const total = Object.keys(queries).length
      const completed = Object.values(queries).filter(query =>
        query.isSuccess || query.isError
      ).length
      return Math.round((completed / total) * 100)
    }
  }

  return loadingStates
}

// Usage in component
function ProductPage({ productId }: { productId: string }) {
  const queries = {
    product: useProductDetail(productId),
    reviews: useProductReviews(productId),
    related: useRelatedProducts(productId),
    recommendations: useUserRecommendations(),
  }

  const loading = useSmartLoading(queries)

  if (loading.critical) {
    return <ProductPageSkeleton />
  }

  return (
    <div>
      <ProductDetail product={queries.product.data} />

      <ProductReviews
        reviews={queries.reviews.data}
        isLoading={loading.secondary}
      />

      <RelatedProducts
        products={queries.related.data}
        isLoading={queries.related.isLoading}
      />

      {/* Loading progress indicator */}
      {loading.any && (
        <LoadingProgress percentage={loading.progress()} />
      )}
    </div>
  )
}
```

## 5. Prefetching & Router Integration

### Mô tả

Prefetching giúp tải trước dữ liệu để cải thiện UX, đặc biệt khi kết hợp với router.

### Mức độ phù hợp: ⭐⭐⭐⭐⭐ (Cực kỳ quan trọng cho UX)

### Lý do áp dụng cho Shopee Clone:

- **Instant Navigation**: Page transitions nhanh hơn
- **Hover Prefetch**: Tải dữ liệu khi user hover vào links
- **Route-based Prefetching**: Tự động prefetch cho routes tiếp theo

### Ví dụ Implementation:

```typescript
// src/hooks/usePrefetch.ts
import { useQueryClient } from '@tanstack/react-query'
import { QueryFilters } from '../utils/queryFilters'

export const usePrefetch = () => {
  const queryClient = useQueryClient()

  return {
    // Prefetch product detail
    prefetchProduct: (productId: string) => {
      queryClient.prefetchQuery({
        ...QueryFilters.products.detail(productId),
        queryFn: () => productApi.getProductDetail(productId),
        staleTime: 5 * 60 * 1000,
      })
    },

    // Prefetch product list with filters
    prefetchProductList: (filters: ProductFilters) => {
      queryClient.prefetchQuery({
        ...QueryFilters.products.list(filters),
        queryFn: () => productApi.getProducts(filters),
        staleTime: 2 * 60 * 1000,
      })
    },

    // Prefetch user data
    prefetchUserProfile: () => {
      queryClient.prefetchQuery({
        ...QueryFilters.user.profile(),
        queryFn: () => userApi.getProfile(),
        staleTime: 5 * 60 * 1000,
      })
    },

    // Prefetch cart
    prefetchCart: () => {
      queryClient.prefetchQuery({
        ...QueryFilters.purchases.cart(),
        queryFn: () => purchasesApi.getPurchases({ status: purchaseStatus.inCart }),
        staleTime: 30 * 1000,
      })
    },

    // Smart prefetch based on user behavior
    smartPrefetch: {
      // Prefetch next page in pagination
      nextPage: (currentPage: number, filters: ProductFilters) => {
        const nextPageFilters = { ...filters, page: currentPage + 1 }
        queryClient.prefetchQuery({
          ...QueryFilters.products.list(nextPageFilters),
          queryFn: () => productApi.getProducts(nextPageFilters),
          staleTime: 2 * 60 * 1000,
        })
      },

      // Prefetch popular products in same category
      relatedProducts: (categoryId: string) => {
        queryClient.prefetchQuery({
          queryKey: ['products', 'popular', categoryId],
          queryFn: () => productApi.getPopularProducts(categoryId),
          staleTime: 10 * 60 * 1000,
        })
      },

      // Prefetch frequently viewed together
      frequentlyViewedTogether: (productId: string) => {
        queryClient.prefetchQuery({
          queryKey: ['products', 'frequently-viewed', productId],
          queryFn: () => analyticsApi.getFrequentlyViewedTogether(productId),
          staleTime: 30 * 60 * 1000,
        })
      }
    }
  }
}

// src/components/ProductCard/ProductCard.tsx
function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { prefetchProduct, smartPrefetch } = usePrefetch()
  const [isPrefetched, setIsPrefetched] = useState(false)

  const handleMouseEnter = useCallback(() => {
    if (!isPrefetched) {
      // Prefetch product detail
      prefetchProduct(product.id)

      // Prefetch related data
      smartPrefetch.relatedProducts(product.category.id)
      smartPrefetch.frequentlyViewedTogether(product.id)

      setIsPrefetched(true)
    }
  }, [product.id, product.category.id, isPrefetched])

  const handleClick = () => {
    navigate(`/products/${product.id}`)
  }

  return (
    <div
      className="product-card"
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter} // Accessibility
      onClick={handleClick}
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">{formatPrice(product.price)}</p>
      <div className="rating">
        <StarRating rating={product.rating} />
        <span>({product.sold})</span>
      </div>
    </div>
  )
}
```

### Router Integration với React Router:

```typescript
// src/router/routerPrefetch.tsx
import { QueryClient } from '@tanstack/react-query'
import { LoaderFunction } from 'react-router-dom'

// Loader functions cho React Router v6
export const productDetailLoader: LoaderFunction = async ({ params, request }) => {
  const queryClient = new QueryClient()
  const productId = params.productId!
  const url = new URL(request.url)

  // Prefetch multiple data sources
  await Promise.allSettled([
    // Product detail
    queryClient.prefetchQuery({
      queryKey: ['products', productId],
      queryFn: () => productApi.getProductDetail(productId),
    }),

    // Product reviews
    queryClient.prefetchQuery({
      queryKey: ['reviews', productId],
      queryFn: () => reviewApi.getProductReviews(productId),
    }),

    // Store info
    queryClient.prefetchQuery({
      queryKey: ['stores', 'by-product', productId],
      queryFn: () => storeApi.getStoreByProduct(productId),
    })
  ])

  return queryClient
}

export const productListLoader: LoaderFunction = async ({ request }) => {
  const queryClient = new QueryClient()
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams)

  // Prefetch product list
  await queryClient.prefetchQuery({
    queryKey: ['products', 'list', searchParams],
    queryFn: () => productApi.getProducts(searchParams),
  })

  // Prefetch categories for filters
  await queryClient.prefetchQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoryApi.getAllCategories(),
  })

  return queryClient
}

// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader,
      },
      {
        path: 'products',
        element: <ProductList />,
        loader: productListLoader,
      },
      {
        path: 'products/:productId',
        element: <ProductDetail />,
        loader: productDetailLoader,
      },
      {
        path: 'cart',
        element: <Cart />,
        loader: cartLoader,
      }
    ]
  }
])
```

### Intelligent Prefetching với Intersection Observer:

```typescript
// src/hooks/useIntersectionPrefetch.ts
import { useEffect, useRef } from 'react'
import { usePrefetch } from './usePrefetch'

export const useIntersectionPrefetch = (
  productId: string,
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const { prefetchProduct } = usePrefetch()
  const hasPrefetched = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element || hasPrefetched.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPrefetched.current) {
            prefetchProduct(productId)
            hasPrefetched.current = true
            observer.unobserve(element)
          }
        })
      },
      {
        rootMargin: '50px', // Prefetch khi còn cách 50px
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [productId, prefetchProduct])

  return elementRef
}

// Usage trong ProductCard
function ProductCard({ product }: { product: Product }) {
  const prefetchRef = useIntersectionPrefetch(product.id)

  return (
    <div ref={prefetchRef} className="product-card">
      {/* Product content */}
    </div>
  )
}
```

### Link Component với Prefetching:

```typescript
// src/components/PrefetchLink/PrefetchLink.tsx
interface PrefetchLinkProps {
  to: string
  children: React.ReactNode
  prefetchData?: () => Promise<void>
  className?: string
}

export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  to,
  children,
  prefetchData,
  className
}) => {
  const [isPrefetched, setIsPrefetched] = useState(false)

  const handleMouseEnter = useCallback(async () => {
    if (!isPrefetched && prefetchData) {
      try {
        await prefetchData()
        setIsPrefetched(true)
      } catch (error) {
        console.warn('Prefetch failed:', error)
      }
    }
  }, [isPrefetched, prefetchData])

  return (
    <Link
      to={to}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
    >
      {children}
    </Link>
  )
}

// Usage
function CategoryMenu() {
  const { prefetchProductList } = usePrefetch()

  return (
    <nav>
      {categories.map(category => (
        <PrefetchLink
          key={category.id}
          to={`/products?category=${category.id}`}
          prefetchData={() => prefetchProductList({ category: category.id })}
        >
          {category.name}
        </PrefetchLink>
      ))}
    </nav>
  )
}
```

## 6. Server Rendering & Hydration

### Mô tả

SSR và hydration để cải thiện SEO và initial page load performance.

### Mức độ phù hợp: ⭐⭐⭐⭐ (Quan trọng cho SEO)

### Lý do áp dụng cho Shopee Clone:

- **SEO**: Product pages cần được index tốt
- **Initial Load**: Faster first contentful paint
- **Social Sharing**: Meta tags động cho sản phẩm

### Ví dụ Implementation cho Next.js:

```typescript
// app/products/[productId]/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { productApi } from '@/apis/product.api'
import { ProductDetailClient } from './ProductDetailClient'

export async function generateMetadata({ params }: { params: { productId: string } }) {
  try {
    const product = await productApi.getProductDetail(params.productId)

    return {
      title: `${product.name} - Shopee Clone`,
      description: product.description.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.image],
        type: 'product',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        images: [product.image],
      }
    }
  } catch {
    return {
      title: 'Sản phẩm không tồn tại - Shopee Clone'
    }
  }
}

export default async function ProductDetailPage({
  params
}: {
  params: { productId: string }
}) {
  const queryClient = new QueryClient()

  try {
    // Prefetch on server
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['products', params.productId],
        queryFn: () => productApi.getProductDetail(params.productId),
      }),

      queryClient.prefetchQuery({
        queryKey: ['reviews', params.productId],
        queryFn: () => reviewApi.getProductReviews(params.productId),
      }),

      queryClient.prefetchQuery({
        queryKey: ['stores', 'by-product', params.productId],
        queryFn: () => storeApi.getStoreByProduct(params.productId),
      })
    ])
  } catch (error) {
    console.error('Server prefetch failed:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailClient productId={params.productId} />
    </HydrationBoundary>
  )
}

// app/products/[productId]/ProductDetailClient.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { QueryFilters } from '@/utils/queryFilters'

export function ProductDetailClient({ productId }: { productId: string }) {
  // Client-side queries will use prefetched data from server
  const { data: product, isLoading } = useQuery({
    ...QueryFilters.products.detail(productId),
    queryFn: () => productApi.getProductDetail(productId),
    staleTime: 5 * 60 * 1000,
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.getProductReviews(productId),
    staleTime: 2 * 60 * 1000,
  })

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return <ProductNotFound />
  }

  return (
    <div>
      <ProductDetail product={product} />
      <ProductReviews reviews={reviews} />
    </div>
  )
}
```

### Hydration với Error Handling:

```typescript
// app/providers/QueryProvider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error: any) => {
          // Don't retry on server
          if (typeof window === 'undefined') return false

          // Don't retry on 404
          if (error?.status === 404) return false

          return failureCount < 3
        },
        retryOnMount: true,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

// app/components/ErrorBoundary.tsx
'use client'

import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

export function QueryErrorBoundary({ children, fallback }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallback={fallback || <ErrorFallback onReset={reset} />}
          onReset={reset}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  return (
    <div className="error-fallback">
      <h2>Có lỗi xảy ra</h2>
      <p>Vui lòng thử lại sau.</p>
      <button onClick={onReset}>Thử lại</button>
    </div>
  )
}
```

## 7. Advanced Server Rendering

### Mô tả

Streaming SSR và React Server Components để tối ưu performance.

### Mức độ phù hợp: ⭐⭐⭐ (Tùy thuộc vào requirements)

### Lý do cân nhắc cho Shopee Clone:

- **Complexity**: Tăng độ phức tạp đáng kể
- **Benefits**: Cải thiện performance cho large pages
- **Trade-offs**: Cần đánh giá cost vs benefit

### Ví dụ Implementation:

```typescript
// app/products/[productId]/loading.tsx
export default function ProductDetailLoading() {
  return (
    <div className="product-detail-loading">
      <ProductDetailSkeleton />
    </div>
  )
}

// app/products/[productId]/page.tsx với Streaming
import { Suspense } from 'react'
import { ProductHeader } from './components/ProductHeader'
import { ProductReviews } from './components/ProductReviews'
import { RelatedProducts } from './components/RelatedProducts'

export default async function ProductDetailPage({
  params
}: {
  params: { productId: string }
}) {
  return (
    <div>
      {/* Critical content loads first */}
      <Suspense fallback={<ProductHeaderSkeleton />}>
        <ProductHeader productId={params.productId} />
      </Suspense>

      {/* Secondary content streams in */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={params.productId} />
      </Suspense>

      {/* Tertiary content streams last */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts productId={params.productId} />
      </Suspense>
    </div>
  )
}

// components/ProductHeader.tsx (Server Component)
async function ProductHeader({ productId }: { productId: string }) {
  const product = await productApi.getProductDetail(productId)

  return (
    <header className="product-header">
      <h1>{product.name}</h1>
      <div className="price">{formatPrice(product.price)}</div>
      <div className="rating">
        <StarRating rating={product.rating} />
      </div>
    </header>
  )
}
```

## 8. Caching

### Mô tả

Advanced caching strategies với structural sharing và custom logic.

### Mức độ phù hợp: ⭐⭐⭐⭐ (Quan trọng cho performance)

### Ví dụ Implementation:

```typescript
// src/utils/customCaching.ts
import { QueryClient } from '@tanstack/react-query'

// Custom structural sharing for products
const productStructuralSharing = (oldData: any, newData: any) => {
  if (!oldData || !newData) return newData

  // So sánh products array
  if (Array.isArray(oldData) && Array.isArray(newData)) {
    if (oldData.length !== newData.length) return newData

    // Kiểm tra từng product
    const hasChanges = oldData.some((oldProduct, index) => {
      const newProduct = newData[index]
      return (
        oldProduct.id !== newProduct.id ||
        oldProduct.price !== newProduct.price ||
        oldProduct.stock !== newProduct.stock ||
        oldProduct.rating !== newProduct.rating
      )
    })

    return hasChanges ? newData : oldData
  }

  return newData
}

// Smart cache invalidation
export class SmartCacheManager {
  constructor(private queryClient: QueryClient) {}

  // Invalidate related queries when product updates
  invalidateProductEcosystem(productId: string, changes: Partial<Product>) {
    // Always invalidate the specific product
    this.queryClient.invalidateQueries({
      queryKey: ['products', productId]
    })

    // If price changed, invalidate price-based queries
    if (changes.price !== undefined) {
      this.queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as string[]
          return key[0] === 'products' && key[1] === 'list' && key[2]?.price_min !== undefined
        }
      })
    }

    // If category changed, invalidate category-based queries
    if (changes.category !== undefined) {
      this.queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as string[]
          return (key[0] === 'products' && key[1] === 'list' && key[2]?.category) || key[1] === 'related'
        }
      })
    }

    // If stock changed to 0, invalidate availability queries
    if (changes.stock === 0) {
      this.queryClient.invalidateQueries({
        queryKey: ['products', 'available']
      })
    }
  }

  // Precompute and cache expensive operations
  async cacheExpensiveComputations(productId: string) {
    const product = this.queryClient.getQueryData(['products', productId]) as Product

    if (product) {
      // Cache computed recommendations
      this.queryClient.setQueryData(
        ['recommendations', 'computed', productId],
        await this.computeRecommendations(product),
        {
          staleTime: 30 * 60 * 1000 // 30 minutes
        }
      )

      // Cache price history analysis
      this.queryClient.setQueryData(
        ['analytics', 'price-history', productId],
        await this.analyzePriceHistory(productId),
        {
          staleTime: 60 * 60 * 1000 // 1 hour
        }
      )
    }
  }

  private async computeRecommendations(product: Product) {
    // Expensive computation logic here
    return recommendationEngine.compute(product)
  }

  private async analyzePriceHistory(productId: string) {
    // Price analysis logic here
    return priceAnalyzer.analyze(productId)
  }
}
```

## 9. Render Optimizations

### Mô tả

Tối ưu rendering với select, memoization và các techniques khác.

### Mức độ phù hợp: ⭐⭐⭐⭐⭐ (Cực kỳ quan trọng)

### Ví dụ Implementation:

```typescript
// src/hooks/useOptimizedQueries.ts
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

// Optimized product list với select
export const useOptimizedProductList = (filters: ProductFilters) => {
  const queryKey = useMemo(() => ['products', 'list', filters], [filters])

  return useQuery({
    queryKey,
    queryFn: () => productApi.getProducts(filters),
    select: useCallback((data: ProductListResponse) => {
      // Chỉ select fields cần thiết để giảm re-renders
      return {
        products: data.data.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          rating: product.rating,
          sold: product.sold_count
        })),
        pagination: data.pagination,
        totalResults: data.pagination.total
      }
    }, []),
    staleTime: 2 * 60 * 1000
  })
}

// Optimized search với debounce và select
export const useOptimizedSearch = (searchTerm: string) => {
  const debouncedTerm = useDebounce(searchTerm, 300)

  return useQuery({
    queryKey: ['products', 'search', debouncedTerm],
    queryFn: ({ signal }) => productApi.searchProducts(debouncedTerm, { signal }),
    enabled: debouncedTerm.length > 2,
    select: useCallback((data: SearchResponse) => {
      // Transform data để UI dễ consume
      return {
        suggestions: data.suggestions.map((item) => ({
          id: item.id,
          text: item.name,
          type: item.type,
          url: `/products/${item.id}`
        })),
        products: data.products.slice(0, 10), // Limit results for performance
        totalCount: data.total_count
      }
    }, []),
    staleTime: 30 * 1000
  })
}

// Memoized component selectors
export const useProductSelectors = (productId: string) => {
  const { data: product } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductDetail(productId)
  })

  // Memoize expensive computations
  const selectors = useMemo(
    () => ({
      basicInfo: product
        ? {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
          }
        : null,

      availability: product
        ? {
            inStock: product.quantity > 0,
            quantity: product.quantity,
            maxOrder: Math.min(product.quantity, 10)
          }
        : null,

      pricing: product
        ? {
            currentPrice: product.price,
            originalPrice: product.price_before_discount,
            discountPercentage: product.price_before_discount
              ? Math.round((1 - product.price / product.price_before_discount) * 100)
              : 0,
            savings: product.price_before_discount ? product.price_before_discount - product.price : 0
          }
        : null,

      ratings: product?.rating
        ? {
            average: product.rating,
            count: product.rating_count,
            distribution: product.rating_distribution,
            stars: Math.round(product.rating)
          }
        : null
    }),
    [product]
  )

  return selectors
}
```

## 10. Default Query Function

### Mô tả

Centralized query function để standardize API calls.

### Mức độ phù hợp: ⭐⭐⭐⭐ (Rất hữu ích cho consistency)

### Ví dụ Implementation:

```typescript
// src/utils/defaultQueryFn.ts
import { QueryFunctionContext } from '@tanstack/react-query'
import { http } from './http'

export const defaultQueryFn = async ({ queryKey, signal, meta }: QueryFunctionContext) => {
  // Convert query key to URL
  const [entity, type, ...params] = queryKey as string[]

  let url = `/api/${entity}`

  // Build URL based on query structure
  switch (type) {
    case 'list':
      // ['products', 'list', filters] → /api/products?filter=...
      if (params[0]) {
        const searchParams = new URLSearchParams(params[0] as Record<string, string>)
        url += `?${searchParams.toString()}`
      }
      break

    case 'detail':
      // ['products', 'detail', id] → /api/products/id
      url += `/${params[0]}`
      break

    case 'search':
      // ['products', 'search', term] → /api/products/search?q=term
      url += `/search?q=${encodeURIComponent(params[0] as string)}`
      break

    default:
      // ['products', 'trending'] → /api/products/trending
      if (type) url += `/${type}`
      if (params.length > 0) url += `/${params.join('/')}`
  }

  // Add cache busting for real-time data
  if (meta?.realtime) {
    const separator = url.includes('?') ? '&' : '?'
    url += `${separator}_t=${Date.now()}`
  }

  try {
    const response = await http.get(url, { signal })
    return response.data
  } catch (error: any) {
    // Enhanced error handling
    if (error.response?.status === 404) {
      throw new Error(`${entity} not found`)
    }
    if (error.response?.status === 403) {
      throw new Error('Unauthorized access')
    }
    throw error
  }
}

// src/contexts/queryClient.ts
import { QueryClient } from '@tanstack/react-query'
import { defaultQueryFn } from '../utils/defaultQueryFn'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('not found')) return false
        if (error?.message?.includes('Unauthorized')) return false
        return failureCount < 3
      }
    }
  }
})

// Usage examples - Simplified API calls
export const useSimplifiedQueries = () => {
  // Automatic URL construction
  const products = useQuery({
    queryKey: ['products', 'list', { category: 'electronics', page: 1 }]
    // No queryFn needed! URL: /api/products?category=electronics&page=1
  })

  const productDetail = useQuery({
    queryKey: ['products', 'detail', 'product-123']
    // URL: /api/products/product-123
  })

  const searchResults = useQuery({
    queryKey: ['products', 'search', 'iphone'],
    enabled: searchTerm.length > 0
    // URL: /api/products/search?q=iphone
  })

  const trendingProducts = useQuery({
    queryKey: ['products', 'trending']
    // URL: /api/products/trending
  })

  const userProfile = useQuery({
    queryKey: ['users', 'profile']
    // URL: /api/users/profile
  })

  const cartItems = useQuery({
    queryKey: ['purchases', 'list', { status: 'in_cart' }]
    // URL: /api/purchases?status=in_cart
  })

  // Real-time data with cache busting
  const notifications = useQuery({
    queryKey: ['notifications', 'unread'],
    meta: { realtime: true },
    refetchInterval: 30 * 1000
    // URL: /api/notifications/unread?_t=1234567890
  })

  return {
    products,
    productDetail,
    searchResults,
    trendingProducts,
    userProfile,
    cartItems,
    notifications
  }
}
```

## 11. Suspense

### Mô tả

React Suspense integration cho data fetching với loading states tốt hơn.

### Mức độ phù hợp: ⭐⭐⭐ (Tùy thuộc team và requirements)

### Ví dụ Implementation:

```typescript
// src/hooks/useSuspenseQueries.ts
import { useSuspenseQuery } from '@tanstack/react-query'

export const useSuspenseProductDetail = (productId: string) => {
  // Data never undefined with useSuspenseQuery
  const { data: product } = useSuspenseQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductDetail(productId),
    staleTime: 5 * 60 * 1000,
  })

  return { product } // product is always defined
}

// src/components/ProductDetailSuspense.tsx
function ProductDetailContent({ productId }: { productId: string }) {
  const { product } = useSuspenseProductDetail(productId)

  // No need to check if product exists!
  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <img src={product.image} alt={product.name} />
      <p className="price">{formatPrice(product.price)}</p>
      <p className="description">{product.description}</p>
    </div>
  )
}

// Parent component with Suspense boundary
function ProductDetailPage({ productId }: { productId: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={<ProductDetailError />}
        >
          <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductDetailContent productId={productId} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

## Kết Luận và Khuyến Nghị

### Kỹ Thuật Nên Áp Dụng Ngay (Priority 1)

1. **Query Cancellation** ⭐⭐⭐⭐⭐
2. **Scroll Restoration** ⭐⭐⭐⭐⭐
3. **Filters** ⭐⭐⭐⭐⭐
4. **Performance & Request Waterfalls** ⭐⭐⭐⭐⭐
5. **Prefetching & Router Integration** ⭐⭐⭐⭐⭐
6. **Render Optimizations** ⭐⭐⭐⭐⭐

### Kỹ Thuật Nên Cân Nhắc (Priority 2)

7. **Server Rendering & Hydration** ⭐⭐⭐⭐
8. **Caching** ⭐⭐⭐⭐
9. **Default Query Function** ⭐⭐⭐⭐

### Kỹ Thuật Có Thể Bỏ Qua (Priority 3)

10. **Advanced Server Rendering** ⭐⭐⭐
11. **Suspense** ⭐⭐⭐

### Roadmap Implementation

1. **Phase 1**: Query Cancellation, Filters, Performance Optimizations
2. **Phase 2**: Prefetching, Render Optimizations, Scroll Restoration
3. **Phase 3**: SSR/Hydration, Advanced Caching
4. **Phase 4**: Advanced Server Rendering, Suspense (nếu cần)

Bạn có muốn tôi bắt đầu implement các kỹ thuật Priority 1 vào dự án của bạn không?
