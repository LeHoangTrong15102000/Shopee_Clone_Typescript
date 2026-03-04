# 🏗️ Phân Tích Design Patterns — Shopee Clone TypeScript

> **Tài liệu phân tích toàn diện** các design pattern đã được áp dụng trong hệ thống, kèm ví dụ code thực tế và đề xuất cải tiến.
>
> **Ngày cập nhật:** 2026-03-04 | **Tech Stack:** React 19.2 · TypeScript 5.9 · TanStack Query v5 · Vite 7 · Tailwind CSS v4 · Zod v4

---

## 📑 Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Design Patterns Đã Áp Dụng](#2-design-patterns-đã-áp-dụng)
   - 2.1 [Provider Pattern (Context API)](#21-provider-pattern-context-api)
   - 2.2 [Singleton Pattern](#22-singleton-pattern)
   - 2.3 [Observer Pattern (EventTarget)](#23-observer-pattern-eventtarget)
   - 2.4 [Interceptor / Chain of Responsibility Pattern](#24-interceptor--chain-of-responsibility-pattern)
   - 2.5 [Custom Hook Pattern (Encapsulation)](#25-custom-hook-pattern-encapsulation)
   - 2.6 [Optimistic Update Pattern](#26-optimistic-update-pattern)
   - 2.7 [Factory Pattern (Query Filters)](#27-factory-pattern-query-filters)
   - 2.8 [Strategy Pattern (Prefetching)](#28-strategy-pattern-prefetching)
   - 2.9 [Memoization Pattern](#29-memoization-pattern)
   - 2.10 [Lazy Loading & Code Splitting Pattern](#210-lazy-loading--code-splitting-pattern)
   - 2.11 [Error Boundary Pattern](#211-error-boundary-pattern)
   - 2.12 [Guard Pattern (Protected Routes)](#212-guard-pattern-protected-routes)
   - 2.13 [Schema Validation Pattern (Zod)](#213-schema-validation-pattern-zod)
   - 2.14 [Adapter Pattern (nuqs)](#214-adapter-pattern-nuqs)
   - 2.15 [Compound Component / Layout Composition Pattern](#215-compound-component--layout-composition-pattern)
   - 2.16 [Internationalization Pattern (i18n Lazy Loading)](#216-internationalization-pattern-i18n-lazy-loading)
   - 2.17 [Graceful Degradation / Fallback Pattern](#217-graceful-degradation--fallback-pattern)
   - 2.18 [Generic Type Pattern (Polymorphic Components)](#218-generic-type-pattern-polymorphic-components)
   - 2.19 [Barrel Export Pattern](#219-barrel-export-pattern)
   - 2.20 [Debounce Pattern](#220-debounce-pattern)
3. [Sơ Đồ Kiến Trúc Tổng Thể](#3-sơ-đồ-kiến-trúc-tổng-thể)
4. [Đề Xuất Mở Rộng — Nên Áp Dụng Thêm](#4-đề-xuất-mở-rộng--nên-áp-dụng-thêm)
5. [Kết Luận](#5-kết-luận)

---

## 1. Tổng Quan Kiến Trúc

### Cấu trúc thư mục chính

```
src/
├── @types/          → TypeScript declaration files (i18next, vitest, web-apis)
├── apis/            → API layer — tách biệt logic gọi API + mock fallback
├── components/      → Reusable UI components (~80+ components)
├── config/          → App configuration (orderStatus)
├── constant/        → Constants & enums (config, path, httpStatusCode)
├── contexts/        → React Context providers (App, Theme, Socket)
├── data/            → Static data (vietnamLocations)
├── hooks/           → Custom hooks (~40+ hooks)
│   ├── nuqs/        → URL state management hooks (type-safe search params)
│   └── optimistic/  → Optimistic update hooks (cart, review, wishlist, notification)
│       └── shared/  → Shared types, utils, constants cho optimistic hooks
├── i18n/            → Internationalization config + lazy language loading
├── layouts/         → Layout components (Main, Register, Cart)
├── locales/         → Translation files (vi/, en/) — 11 namespaces
├── msw/             → Mock Service Worker handlers (auth, cart, product, user, checkout)
├── pages/           → Page-level components (Home, Cart, User, ProductDetail, ...)
├── router/          → Route loaders (prefetch data trước khi render)
├── services/        → Business services (NavigationService — Singleton)
├── stories/         → Storybook stories
├── styles/          → Animation configurations
├── types/           → TypeScript type definitions (~20 type files)
├── utils/           → Utility functions (http, auth, rules, queryFilters, ...)
├── App.tsx          → Root component — global widgets + routing
├── main.tsx         → Entry point — Provider tree + QueryClient config
└── useRouteElements.tsx → Route definitions + lazy loading
```

### Provider Tree (Thứ tự wrap)

```tsx
// src/main.tsx — 8 lớp Provider lồng nhau
<React.StrictMode>
  <BrowserRouter>
    <NuqsAdapter>              {/* URL State Sync */}
      <ThemeProvider>           {/* Dark/Light Mode — ít re-render nhất */}
        <QueryClientProvider>   {/* TanStack Query — Server State */}
          <AppProvider>         {/* Auth + Cart — Client State */}
            <SocketProvider>    {/* WebSocket — cần auth state */}
              <HelmetProvider>  {/* SEO Meta Tags */}
                <HeroUIProvider> {/* UI Component Library */}
                  <LazyMotion features={domAnimation}> {/* Animation Engine */}
                    <ErrorBoundary>  {/* Error Catching — trong cùng */}
                      <App />
                    </ErrorBoundary>
                  </LazyMotion>
                </HeroUIProvider>
              </HelmetProvider>
            </SocketProvider>
          </AppProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </NuqsAdapter>
  </BrowserRouter>
</React.StrictMode>
```

**Nguyên tắc sắp xếp:**
- Provider ít thay đổi nhất → ngoài cùng (`ThemeProvider`)
- Provider phụ thuộc provider khác → bên trong (`SocketProvider` cần `AppProvider`)
- `ErrorBoundary` → trong cùng để catch mọi lỗi từ App

---

## 2. Design Patterns Đã Áp Dụng

### 2.1 Provider Pattern (Context API)

**Định nghĩa:** Sử dụng React Context để chia sẻ state toàn cục mà không cần prop drilling.

**Có 3 Context Providers chính trong hệ thống:**

#### a) AppContext — Authentication & Cart State (`src/contexts/app.context.tsx`)

```typescript
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAppContext.isAuthenticated)
  const [extendedPurchases, setExtendedPurchases] = useState<ExtendedPurchase[]>([])
  const [profile, setProfile] = useState<User | null>(initialAppContext.profile)

  // useCallback: reset function KHÔNG BAO GIỜ thay đổi reference
  const reset = useCallback(() => {
    setIsAuthenticated(false)
    setExtendedPurchases([])
    setProfile(null)
  }, [])

  // useMemo: Tránh tạo object mới mỗi lần render → ngăn re-render children không cần thiết
  const value = useMemo(
    () => ({ isAuthenticated, setIsAuthenticated, profile, setProfile,
             extendedPurchases, setExtendedPurchases, reset }),
    [isAuthenticated, profile, extendedPurchases, reset]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
```

**Điểm hay:** `useMemo` cho value object + `useCallback` cho reset → tránh re-render không cần thiết.

#### b) ThemeContext — Dark/Light Mode (`src/contexts/theme.context.tsx`)

```typescript
// Kỹ thuật chống flicker khi chuyển theme:
const applyTheme = (resolvedTheme: ResolvedTheme) => {
  // 1. Inject CSS tạm thời disable ALL transitions + animations
  const css = document.createElement('style')
  css.appendChild(document.createTextNode(
    `*,*::before,*::after{transition:none!important;animation:none!important}`
  ))
  document.head.appendChild(css)

  // 2. Atomic class swap
  root.classList.replace(currentTheme, resolvedTheme)

  // 3. Force reflow + double rAF để đảm bảo browser đã paint
  document.body.offsetHeight // Force synchronous reflow
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      css.parentNode?.removeChild(css) // Re-enable transitions
    })
  })
}
```

**Điểm hay:**
- Sử dụng `system` preference detection qua `matchMedia`
- Double `requestAnimationFrame` trick để tránh flicker
- Custom hook `useTheme()` với error boundary khi dùng ngoài provider

#### c) SocketContext — WebSocket Connection (`src/contexts/socket.context.tsx`)

```typescript
// Dynamic import socket.io-client — chỉ load khi thực sự cần kết nối
const { io } = await import('socket.io-client')

// Mock mode: Khi không có backend, giả lập trạng thái 'connected'
if (!config.enableSocket) {
  setConnectionStatus('connected')
  return
}
```

**Điểm hay:**
- Dynamic import `socket.io-client` → giảm initial bundle size
- Mock mode cho frontend-only development
- Tự động connect/disconnect theo auth state

---

### 2.2 Singleton Pattern

**Định nghĩa:** Đảm bảo một class chỉ có duy nhất một instance trong toàn bộ ứng dụng.

**Áp dụng tại 2 nơi:**

#### a) Http Client (`src/utils/http.ts`)

```typescript
export class Http {
  readonly instance: AxiosInstance
  private accessToken: string
  private refreshToken: string
  private refreshTokenRequest: Promise<string> | null  // Mutex cho refresh token

  constructor(options?: HttpOptions) {
    this.accessToken = getAccessTokenFromLS()
    this.refreshToken = getRefreshTokenFromLS()
    this.refreshTokenRequest = null  // Đảm bảo chỉ 1 refresh request tại 1 thời điểm
    // ... interceptors setup
  }
}

// Singleton instance — toàn bộ app dùng chung 1 instance
const http = new Http().instance
export default http
```

**Điểm hay:** `refreshTokenRequest` hoạt động như một **Mutex** — khi nhiều request cùng gặp lỗi 401, chỉ có 1 refresh token request được gửi đi, các request khác chờ kết quả.

#### b) NavigationService (`src/services/navigation.service.ts`)

```typescript
class NavigationService {
  private navigate: ((path: string, options?: {...}) => void) | null = null

  init(navigateFn: ...) { this.navigate = navigateFn }
  to(path: string, options?: NavigationOptions) { ... }
  toLogin(returnUrl?: string) { ... }
  handlePostLoginRedirect() { ... }
  goBack() { ... }
  buildUrl(basePath: string, params: Record<string, string | number | undefined>): string { ... }
}

// Singleton instance
export const navigationService = new NavigationService()
```

**Điểm hay:** Cho phép navigate từ bất kỳ đâu (kể cả ngoài React component tree), quản lý navigation history và redirect after login.

---

### 2.3 Observer Pattern (EventTarget)

**Định nghĩa:** Cho phép các đối tượng đăng ký lắng nghe sự kiện và được thông báo khi sự kiện xảy ra.

**Áp dụng tại:** `src/utils/auth.ts` + `src/App.tsx`

```typescript
// src/utils/auth.ts — Publisher
export const LocalStorageEventTarget = new EventTarget()

export const clearLS = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('profile')

  // Dispatch event khi clear localStorage
  const clearLSEvent = new Event('clearLS')
  LocalStorageEventTarget.dispatchEvent(clearLSEvent)
}

// src/App.tsx — Subscriber
function App() {
  const { reset } = useContext(AppContext)

  useEffect(() => {
    // Lắng nghe sự kiện clearLS → reset toàn bộ app state
    LocalStorageEventTarget.addEventListener('clearLS', reset)
    return () => LocalStorageEventTarget.removeEventListener('clearLS', reset)
  }, [reset])
}
```

**Tại sao dùng EventTarget thay vì window.location.reload()?**
- Không cần reload trang → UX mượt hơn
- Tách biệt logic clear storage và reset state
- Nhiều subscriber có thể lắng nghe cùng 1 event

---

### 2.4 Interceptor / Chain of Responsibility Pattern

**Định nghĩa:** Xử lý request/response qua chuỗi các handler, mỗi handler quyết định xử lý hoặc chuyển tiếp.

**Áp dụng tại:** `src/utils/http.ts` — Axios Interceptors

```typescript
// REQUEST Interceptor — Tự động gắn access_token
this.instance.interceptors.request.use((config) => {
  if (this.accessToken && config.headers) {
    config.headers.authorization = this.accessToken
  }
  return config
})

// RESPONSE Interceptor — Xử lý theo URL và status code
this.instance.interceptors.response.use(
  (response) => {
    const { url } = response.config
    if (url === URL_LOGIN || url === URL_REGISTER) {
      // Lưu tokens + profile vào localStorage
      this.accessToken = data.access_token
      setAccessTokenToLS(this.accessToken)
      setProfileToLS(data.user)
    } else if (url === URL_LOGOUT) {
      clearLS()
      this.accessToken = ''
    }
    return response
  },
  async (error: AxiosError) => {
    // Chain: 422 → toast error → 401 expired → refresh token → 401 other → clear & redirect
    if (isAxiosExpiredTokenError(error) && url !== URL_REFRESH_TOKEN) {
      // Mutex pattern: chỉ 1 refresh request tại 1 thời điểm
      this.refreshTokenRequest = this.refreshTokenRequest
        ? this.refreshTokenRequest
        : this.handleRefreshToken().finally(() => { this.refreshTokenRequest = null })

      return this.refreshTokenRequest.then((access_token) => {
        return this.instance({ ...config, headers: { authorization: access_token } })
      })
    }
    // Nếu không phải expired token → clear LS + redirect login
    clearLS()
    return Promise.reject(error)
  }
)
```

**Luồng xử lý lỗi 401:**
```
Request → 401 Error
  ├─ Token expired? → Refresh token (Mutex) → Retry original request
  └─ Token invalid? → Clear LS → Dispatch clearLS event → Redirect login
```


### 2.5 Custom Hook Pattern (Encapsulation)

**Định nghĩa:** Đóng gói logic phức tạp vào custom hooks, tách biệt business logic khỏi UI.

**Dự án có ~40+ custom hooks.** Một số ví dụ tiêu biểu:

#### a) useSearchProducts — Kết hợp form + URL state + query cancellation

```typescript
// src/hooks/useSearchProducts.tsx
const useSearchProducts = () => {
  const [searchValue, setSearchValue] = useState('')
  const [filters, setFilters] = useProductQueryStates()  // nuqs — URL state

  const { handleSubmit, register } = useForm<FormData>({
    resolver: zodResolver(searchSchema)  // Zod validation
  })

  const onSubmitSearch = handleSubmit((data) => {
    if (filters.order) {
      setFilters({ name: data.name, order: null, sort_by: 'createdAt' })
    } else {
      setFilters({ name: data.name })
    }
    // TanStack Query tự động hủy request cũ khi queryKey thay đổi
  })

  return { onSubmitSearch, register, searchValue, setSearchValue }
}
```

#### b) useQueryInvalidation — Centralized cache invalidation

```typescript
// src/hooks/useQueryInvalidation.ts
export const useQueryInvalidation = () => {
  const queryClient = useQueryClient()

  return {
    invalidateProducts: () => queryClient.invalidateQueries(QueryFilters.products.all()),
    invalidateProductDetail: (id: string) => queryClient.invalidateQueries(QueryFilters.products.detail(id)),
    invalidateCart: () => queryClient.invalidateQueries(QueryFilters.purchases.cart()),
    invalidateUserSpecificData: () => queryClient.invalidateQueries({
      predicate: QueryPredicates.userSpecificData()
    }),
    batchInvalidate: (operations: (() => void)[]) => operations.forEach(op => op()),
    // ... 15+ invalidation methods
  }
}
```

#### c) useHoverPrefetch — Strategy-based prefetching

```typescript
// src/hooks/useHoverPrefetch.ts
export const useHoverPrefetch = (productId: string, options: UseHoverPrefetchOptions = {}) => {
  const { delay = 300, strategy = 'delayed' } = options

  const handleMouseEnter = useCallback(() => {
    switch (strategy) {
      case 'immediate': prefetchProduct(productId); break
      case 'intent-detection':
        // Hover nhiều lần = quan tâm → prefetch
        if (hoverCount >= 2 || now - lastHoverTime < 2000) { ... }
        break
      case 'delayed':
        timeoutRef.current = setTimeout(() => {
          prefetchProduct(productId)
          smartPrefetch.relatedProducts(productId)  // Prefetch thêm related
        }, delay)
    }
  }, [...])

  return { handleMouseEnter, handleMouseLeave, handleClick, isPrefetched }
}
```

**Điểm hay:** Tách biệt hoàn toàn business logic khỏi UI → component chỉ cần gọi hook và render.

---

### 2.6 Optimistic Update Pattern

**Định nghĩa:** Cập nhật UI ngay lập tức trước khi server xác nhận, rollback nếu thất bại.

**Áp dụng tại:** `src/hooks/optimistic/` — 5 modules: cart, review, wishlist, notification

```
src/hooks/optimistic/
├── cart/
│   ├── useOptimisticAddToCart.ts
│   ├── useOptimisticRemoveFromCart.ts
│   └── useOptimisticUpdateQuantity.ts
├── review/
│   └── useOptimisticReviewLike.ts
├── wishlist/
│   └── useOptimisticWishlist.ts
├── notification/
│   └── useOptimisticNotification.ts
└── shared/
    ├── types.ts      → Shared interfaces (AddToCartContext, PurchasesQueryData, ...)
    ├── utils.ts       → Shared utilities (findProductInCache, createOptimisticPurchase, ...)
    └── constants.ts   → Toast messages, query keys
```

**Ví dụ: useOptimisticAddToCart** (`src/hooks/optimistic/cart/useOptimisticAddToCart.ts`)

```typescript
export const useOptimisticAddToCart = () => {
  const queryClient = useQueryClient()
  const { setExtendedPurchases } = useContext(AppContext)

  return useMutation({
    mutationFn: purchaseApi.addToCart,

    // BƯỚC 1: Optimistic update TRƯỚC KHI server response
    onMutate: async (newItem: AddToCartPayload): Promise<AddToCartContext> => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PURCHASES_IN_CART })
      const previousPurchases = queryClient.getQueryData(QUERY_KEYS.PURCHASES_IN_CART)

      // Tìm product data từ cache (không cần gọi API thêm)
      const productData = findProductInCache(queryClient, newItem.product_id)

      if (productData) {
        const optimisticPurchase = createOptimisticPurchase(productData, newItem.buy_count)
        updatePurchasesCache(queryClient, QUERY_KEYS.PURCHASES_IN_CART, (old) => ({
          ...old, data: { ...old.data, data: [...(old.data?.data || []), optimisticPurchase] }
        }))
        showSuccessToast('Đã thêm vào giỏ hàng')  // Feedback ngay lập tức
      }

      return { previousPurchases, optimisticPurchase }
    },

    // BƯỚC 2: Rollback nếu server trả lỗi
    onError: (err, _newItem, context) => {
      if (context?.previousPurchases) {
        queryClient.setQueryData(QUERY_KEYS.PURCHASES_IN_CART, context.previousPurchases)
      }
      showErrorToast('Thêm vào giỏ hàng thất bại')
    },

    // BƯỚC 3: Thay thế data tạm bằng data thật từ server
    onSuccess: (data) => {
      const realPurchase = data.data.data
      updatePurchasesCache(queryClient, QUERY_KEYS.PURCHASES_IN_CART, (old) => ({
        ...old, data: { ...old.data,
          data: old.data?.data?.map(item =>
            item._id.startsWith('temp-') ? realPurchase : item
          )
        }
      }))
    },

    // BƯỚC 4: Luôn invalidate cache để đảm bảo sync
    onSettled: () => { invalidateCart() }
  })
}
```

**Luồng Optimistic Update:**
```
User click "Thêm vào giỏ" →
  1. Cancel pending queries
  2. Snapshot current data (để rollback)
  3. Tìm product info từ cache
  4. Tạo temp purchase (id: "temp-xxx")
  5. Update cache + UI ngay lập tức
  6. Show success toast
  7. Gửi request lên server
     ├─ Success → Thay temp bằng real data
     └─ Error → Rollback về snapshot
  8. Invalidate cache (đảm bảo sync)
```

---

### 2.7 Factory Pattern (Query Filters)

**Định nghĩa:** Sử dụng factory functions để tạo ra các query key objects một cách nhất quán.

**Áp dụng tại:** `src/utils/queryFilters.ts`

```typescript
export const QueryFilters = {
  products: {
    all: () => ({ queryKey: ['products'] }),
    lists: () => ({ queryKey: ['products', 'list'] }),
    list: (filters: ProductListConfig) => ({ queryKey: ['products', 'list', filters] }),
    detail: (id: string) => ({ queryKey: ['products', 'detail', id] }),
    trending: () => ({ queryKey: ['products', 'trending'] }),
    related: (categoryId: string) => ({ queryKey: ['products', 'related', categoryId] }),
  },
  purchases: {
    all: () => ({ queryKey: ['purchases'] }),
    cart: () => ({ queryKey: ['purchases', { status: -1 }] }),
    byStatus: (status: PurchaseListStatus) => ({ queryKey: ['purchases', { status }] }),
  },
  // ... categories, user, search, reviews, notifications
}

// Predicate functions cho advanced filtering
export const QueryPredicates = {
  productsByCategory: (categoryId: string) => (query: Query) => {
    const [entity, type, filters] = query.queryKey
    return entity === 'products' && type === 'list' && filters?.category === categoryId
  },
  userSpecificData: () => (query: Query) => {
    const [entity] = query.queryKey
    return entity === 'user' || entity === 'purchases' || entity === 'notifications'
  },
  affectedByProductUpdate: (productId: string) => (query: Query) => { ... }
}
```

**Ưu điểm:**
- Query keys nhất quán trong toàn bộ app
- Hỗ trợ selective invalidation (chỉ invalidate đúng queries cần thiết)
- Predicate functions cho advanced cache management
- Dễ refactor khi cần thay đổi cấu trúc query key

---

### 2.8 Strategy Pattern (Prefetching)

**Định nghĩa:** Cho phép chọn thuật toán/chiến lược tại runtime.

**Áp dụng tại:** `src/hooks/useHoverPrefetch.ts` — 3 strategies

```typescript
type Strategy = 'immediate' | 'delayed' | 'intent-detection'

// Strategy 1: Immediate — prefetch ngay khi hover
// Strategy 2: Delayed — chờ 300ms rồi mới prefetch
// Strategy 3: Intent Detection — phân tích hành vi user
//   - Hover >= 2 lần → quan tâm → prefetch
//   - Re-hover trong < 2s → quan tâm → prefetch
//   - Đã cached → skip
```

**Thêm 3 hooks prefetching khác:**
- `useProgressivePrefetch` — Batch prefetch với queue (max 3 items/batch)
- `useIntersectionPrefetch` — Prefetch khi element vào viewport (IntersectionObserver)
- `usePrefetch` — Central prefetch hub với smart prefetching (next page, related, trending)

---

### 2.9 Memoization Pattern

**Định nghĩa:** Cache kết quả tính toán để tránh re-compute không cần thiết.

**Áp dụng rộng rãi trong dự án:**

```typescript
// 1. useMemo — Memoize context value (src/contexts/app.context.tsx)
const value = useMemo(
  () => ({ isAuthenticated, profile, extendedPurchases, reset }),
  [isAuthenticated, profile, extendedPurchases, reset]
)

// 2. useCallback — Memoize functions (src/contexts/theme.context.tsx)
const setTheme = useCallback((newTheme: Theme) => {
  applyTheme(resolveTheme(newTheme))
  setThemeState(newTheme)
}, [])

// 3. React.memo — Memoize component (src/layouts/MainLayout/MainLayout.tsx)
const MainLayoutInner = ({ children }: Props) => { ... }
const MainLayout = memo(MainLayoutInner)

// 4. TanStack Query staleTime/gcTime — Server-side memoization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,  // Data fresh trong 3 phút
      gcTime: 10 * 60 * 1000     // Cache giữ 10 phút sau khi inactive
    }
  }
})
```

---

### 2.10 Lazy Loading & Code Splitting Pattern

**Định nghĩa:** Tải code theo nhu cầu thay vì tải tất cả cùng lúc.

**Áp dụng ở 4 cấp độ:**

#### Cấp 1: Route-level lazy loading (`src/useRouteElements.tsx`)

```typescript
// Tất cả pages đều lazy load
const Home = lazy(() => import('./pages/Home'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
// ... 15+ lazy loaded pages
```

#### Cấp 2: Component-level lazy loading (`src/App.tsx`, `src/layouts/MainLayout/MainLayout.tsx`)

```typescript
// Heavy components lazy load với fallback={null}
const ChatbotWidget = lazy(() => import('./components/ChatbotWidget'))
const SellerDashboardPanel = lazy(() => import('./components/SellerDashboardPanel'))
const CompareFloatingBar = lazy(() => import('src/components/CompareFloatingBar'))
const BackToTop = lazy(() => import('src/components/BackToTop'))
```

#### Cấp 3: Library-level lazy loading (`src/main.tsx`, `src/contexts/socket.context.tsx`)

```typescript
// DevTools chỉ load trong development
const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then(mod => ({ default: mod.ReactQueryDevtools }))
)

// socket.io-client chỉ load khi cần kết nối
const { io } = await import('socket.io-client')
```

#### Cấp 4: i18n lazy loading (`src/i18n/i18n.ts`)

```typescript
// Vietnamese (default) — eager load
// English — lazy load khi user chuyển ngôn ngữ
export async function loadLanguage(lng: string): Promise<void> {
  if (lng === 'vi') { await i18n.changeLanguage('vi'); return }

  const [commonModule, homeModule, ...] = await Promise.all([
    import('src/locales/en/common.json'),
    import('src/locales/en/home.json'),
    // ... 11 namespaces
  ])
  // addResourceBundle cho từng namespace
}
```

#### Cấp 5: Vendor chunk splitting (`vite.config.ts`)

```typescript
manualChunks(id) {
  if (id.includes('react/') || id.includes('react-dom/')) return 'react-vendor'
  if (id.includes('react-router') || id.includes('nuqs')) return 'router-vendor'
  if (id.includes('framer-motion')) return 'motion-vendor'
  if (id.includes('@heroui/')) return 'heroui-vendor'
  if (id.includes('react-hook-form') || id.includes('zod')) return 'form-vendor'
  if (id.includes('axios') || id.includes('@tanstack/react-query')) return 'http-vendor'
  // ... 12 vendor chunks
}
```

---

### 2.11 Error Boundary Pattern

**Định nghĩa:** Bắt lỗi JavaScript trong component tree và hiển thị fallback UI thay vì crash toàn bộ app.

**Áp dụng tại:** `src/components/ErrorBoundary/` — 2 loại Error Boundary

#### a) Global ErrorBoundary (`ErrorBoundary.tsx`)

```typescript
// Class component — React yêu cầu Error Boundary phải là class component
export default class ErrorBoundary extends Component<Props, State> {
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error: ', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main>
          <h1>500</h1>
          {/* Chi tiết lỗi chỉ hiển thị trong development */}
          {import.meta.env.DEV && this.state.error && (
            <pre>{this.state.error.stack}</pre>
          )}
          <Button onClick={() => window.location.href = path.home}>Go Home</Button>
        </main>
      )
    }
    return this.props.children
  }
}
```

#### b) QueryErrorBoundary (`QueryErrorBoundary.tsx`)

```typescript
// Kết hợp React Error Boundary + TanStack Query error reset
export default function QueryErrorBoundary({ children, fallback, onReset }) {
  const { reset } = useQueryErrorResetBoundary()  // TanStack Query hook

  return (
    <QueryErrorBoundaryInner
      resetBoundary={reset}  // Reset query errors khi retry
      fallback={fallback}
      onReset={onReset}
    >
      {children}
    </QueryErrorBoundaryInner>
  )
}
```

**Điểm hay:** QueryErrorBoundary tích hợp `useQueryErrorResetBoundary` → khi user click "Thử lại", cả React state và TanStack Query cache đều được reset.

---

### 2.12 Guard Pattern (Protected Routes)

**Định nghĩa:** Kiểm tra điều kiện trước khi cho phép truy cập route.

**Áp dụng tại:** `src/useRouteElements.tsx`

```typescript
// Guard cho routes yêu cầu đăng nhập
function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

// Guard cho routes chỉ dành cho guest (login, register)
function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

// Sử dụng trong route config
const routeElements = useRoutes([
  { path: '', element: <MainLayout />, children: [...] },           // Public routes
  { path: '', element: <ProtectedRoute />, children: [...] },       // Auth required
  { path: '', element: <RejectedRoute />, children: [...] },        // Guest only
])
```

---

### 2.13 Schema Validation Pattern (Zod)

**Định nghĩa:** Sử dụng schema-based validation để validate data tại compile-time và runtime.

**Áp dụng tại:** `src/utils/rules.ts`

```typescript
// Base schema — dùng .pick() để tạo sub-schemas
export const baseSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không đúng định dạng')
    .min(5, 'Độ dài từ 5 đến 160 ký tự').max(160, 'Độ dài từ 5 đến 160 ký tự'),
  password: z.string().min(1, 'Password là bắt buộc').min(6).max(160),
  confirm_password: z.string().min(1).min(6).max(160),
  price_min: z.string().optional(),
  price_max: z.string().optional(),
  name: z.string().trim().min(1, 'Tên sản phẩm là bắt buộc')
})

// Derived schemas — .pick() + .superRefine()
export const loginSchema = baseSchema.pick({ email: true, password: true })
export const registerSchema = baseSchema
  .pick({ email: true, password: true, confirm_password: true })
  .superRefine((data, ctx) => {
    if (data.confirm_password !== data.password) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nhập lại password không khớp!!', path: ['confirm_password'] })
    }
  })

// Auto-generate TypeScript types từ Zod schemas
export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
```

**Ưu điểm:**
- Single source of truth cho validation rules
- Type-safe — TypeScript types tự động sinh từ schema
- Composable — `.pick()`, `.superRefine()` để tạo sub-schemas
- Runtime validation + compile-time type checking

---

### 2.14 Adapter Pattern (nuqs)

**Định nghĩa:** Chuyển đổi interface của một hệ thống sang interface mà client mong đợi.

**Áp dụng tại:** `src/hooks/nuqs/productSearchParams.ts`

```typescript
// nuqs adapter: URL search params ↔ TypeScript typed state
export const productSearchParsers = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  sort_by: parseAsStringLiteral(['createdAt', 'view', 'sold', 'price'] as const).withDefault('createdAt'),
  order: parseAsStringLiteral(['asc', 'desc'] as const),
  name: parseAsString,
  price_min: parseAsInteger,
  price_max: parseAsInteger,
  category: parseAsString
}

export type ProductQueryConfig = inferParserType<typeof productSearchParsers>

// Hook wrapper — URL params trở thành React state
export function useProductQueryStates() {
  const [filters, setFilters] = useQueryStates(productSearchParsers)
  return [filters, setFilters] as const
}

// Normalize function — đảm bảo tương thích với TanStack Query cache
export function normalizeProductQueryKey(filters: ProductQueryConfig): Record<string, string | undefined> {
  return {
    page: String(filters.page),
    limit: String(filters.limit),
    sort_by: filters.sort_by,
    order: filters.order ?? undefined,
    // ... convert typed values → string values cho queryKey compatibility
  }
}
```

**Ưu điểm:**
- URL là single source of truth cho filter state
- Type-safe — `parseAsInteger`, `parseAsStringLiteral` đảm bảo đúng kiểu
- Shareable URLs — copy URL = share filter state
- Browser back/forward hoạt động đúng

---

### 2.15 Compound Component / Layout Composition Pattern

**Định nghĩa:** Kết hợp nhiều components nhỏ thành một layout phức tạp, sử dụng `<Outlet />` cho nested routing.

**Áp dụng tại:** `src/layouts/`, `src/useRouteElements.tsx`

```typescript
// MainLayout — Header + Content (Outlet) + Footer
const MainLayout = memo(({ children }: Props) => (
  <div className='min-h-screen bg-gray-100 dark:bg-slate-900'>
    <Header />
    <ConnectionStatus />
    <PageTransition>
      {children}
      <Outlet />  {/* Nested route content */}
    </PageTransition>
    <Footer />
    <CompareFloatingBar />
    <BackToTop />
  </div>
))

// CartLayout — nhận children + config props
<CartLayout headerTitle='sản phẩm yêu thích' showStepper={false}>
  <Wishlist />
</CartLayout>

// UserLayout — nested trong MainLayout
{ path: path.user, element: <MainLayout />, children: [
  { path: '', element: <UserLayout />, children: [
    { path: path.profile, element: <Profile /> },
    { path: path.changePassword, element: <ChangePassword /> },
    // ... 7+ nested routes
  ]}
]}
```

---

### 2.16 Internationalization Pattern (i18n Lazy Loading)

**Đã mô tả ở mục 2.10 Cấp 4.** Tóm tắt:
- Default language (Vietnamese) — eager load
- Non-default languages — lazy load qua `Promise.all` + `addResourceBundle`
- 11 namespaces: common, home, product, nav, auth, cart, user, payment, notification, chat, order
- Test environment detection để skip i18n init

---

### 2.17 Graceful Degradation / Fallback Pattern

**Định nghĩa:** Khi service không khả dụng, hệ thống vẫn hoạt động với dữ liệu mock.

**Áp dụng tại:** Tất cả API files (`src/apis/*.api.ts`)

```typescript
// src/apis/product.api.ts — Mỗi API method đều có try/catch + mock fallback
const productApi = {
  getProducts: async (params: ProductListConfig, options?: ApiOptions) => {
    try {
      return await http.get<SuccessResponseApi<ProductList>>('/products', { params, signal: options?.signal })
    } catch (error) {
      console.warn('⚠️ [getProducts] API not available, using mock data')
      return {
        data: {
          message: 'Lấy danh sách sản phẩm thành công (mock)',
          data: { products: mockProducts, pagination: { page: 1, limit: 20, page_size: 1 } }
        }
      }
    }
  },
  // ... tất cả methods đều có pattern tương tự
}
```

**Ưu điểm:**
- Frontend hoạt động độc lập khi backend chưa sẵn sàng
- Demo/presentation không cần backend
- Development experience tốt hơn

---

### 2.18 Generic Type Pattern (Polymorphic Components)

**Định nghĩa:** Sử dụng TypeScript generics để tạo components type-safe với nhiều kiểu dữ liệu.

**Áp dụng tại:** `src/components/Input/Input.tsx`, `src/components/Button/Button.tsx`

```typescript
// Input component với Generic Type — đảm bảo type-safety giữa name và register
const Input = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name, register, rules, errorMessage, ...rest
}: Props<TFieldValues, TName>) => {
  const registerResult = register && name
    ? register(name, rules as RegisterOptions<TFieldValues, TName>)
    : null
  // ...
}

// Button component — Polymorphic (render as button hoặc Link)
type ButtonProps = ButtonAsButton | ButtonAsLink

interface ButtonAsButton extends BaseButtonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button'
  to?: never  // Không cho phép `to` khi as='button'
}

interface ButtonAsLink extends BaseButtonProps {
  as: 'link'
  to: string  // Bắt buộc `to` khi as='link'
}
```

**Ưu điểm:**
- Compile-time type checking — IDE báo lỗi ngay khi truyền sai props
- Generic `TFieldValues` đảm bảo `name` phải là key hợp lệ của form data
- Discriminated union (`as: 'button' | 'link'`) cho polymorphic rendering

---

### 2.19 Barrel Export Pattern

**Định nghĩa:** Sử dụng `index.ts` để re-export modules, tạo clean import paths.

**Áp dụng tại:** Hầu hết các thư mục component và hook

```typescript
// src/hooks/optimistic/index.ts
export { useOptimisticAddToCart } from './cart'
export { useOptimisticRemoveFromCart } from './cart'
export { useOptimisticUpdateQuantity } from './cart'
export { useOptimisticReviewLike } from './review'
export { useOptimisticWishlist } from './wishlist'
export { useOptimisticNotification } from './notification'

// src/services/index.ts
export { default as navigationService, PATHS } from './navigation.service'
export type { NavigationOptions, RedirectConfig } from './navigation.service'

// src/components/ErrorBoundary/index.ts
export { default } from './ErrorBoundary'
export { default as QueryErrorBoundary } from './QueryErrorBoundary'
export { default as ErrorFallback } from './ErrorFallback'
```

---

### 2.20 Debounce Pattern

**Định nghĩa:** Trì hoãn thực thi function cho đến khi user ngừng trigger trong một khoảng thời gian.

**Áp dụng tại:** `src/hooks/useDebounce.tsx`

```typescript
const useDebounce = (value: null | string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value?.trim() as string), delay)
    return () => clearTimeout(handler)  // Cleanup: hủy timeout cũ khi value thay đổi
  }, [value])

  return debouncedValue
}
```

**Sử dụng cho:** Search input — chỉ gọi API sau khi user ngừng gõ 500ms.

---

## 3. Sơ Đồ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│                                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │ Layouts  │  │Components│  │ Stories  │              │
│  │ (lazy)   │  │ (memo)   │  │ (80+)    │  │(Storybook│              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘              │
│       │              │              │                                   │
│       └──────────────┴──────────────┘                                   │
│                      │                                                  │
├──────────────────────┼──────────────────────────────────────────────────┤
│                      ▼                                                  │
│                 BUSINESS LOGIC LAYER                                    │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Custom Hooks │  │  Contexts    │  │  Services    │                 │
│  │ (40+ hooks)  │  │ (App/Theme/  │  │ (Navigation) │                 │
│  │              │  │  Socket)     │  │              │                 │
│  │ • usePrefetch│  │              │  │              │                 │
│  │ • useOptimi- │  │              │  │              │                 │
│  │   stic*      │  │              │  │              │                 │
│  │ • useQuery-  │  │              │  │              │                 │
│  │   Invalidate │  │              │  │              │                 │
│  │ • useSearch  │  │              │  │              │                 │
│  │ • useDebounce│  │              │  │              │                 │
│  └──────┬───────┘  └──────────────┘  └──────────────┘                 │
│         │                                                              │
├─────────┼──────────────────────────────────────────────────────────────┤
│         ▼                                                              │
│                    DATA ACCESS LAYER                                   │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  APIs Layer  │  │ TanStack     │  │ Query        │                 │
│  │ (19 api files│  │ Query Client │  │ Filters      │                 │
│  │  + mock      │  │ (staleTime,  │  │ (Factory     │                 │
│  │  fallback)   │  │  gcTime,     │  │  Pattern)    │                 │
│  │              │  │  retry)      │  │              │                 │
│  └──────┬───────┘  └──────────────┘  └──────────────┘                 │
│         │                                                              │
│         ▼                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  HTTP Client │  │  Auth Utils  │  │  Validation  │                 │
│  │ (Singleton + │  │ (EventTarget │  │  (Zod        │                 │
│  │  Interceptor)│  │  + LocalStor)│  │   Schemas)   │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                                 │
│                                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Vite    │  │ Tailwind │  │  i18n    │  │  MSW     │              │
│  │ (build + │  │ CSS v4 + │  │ (lazy   │  │ (mock    │              │
│  │  chunks) │  │ HeroUI)  │  │  load)  │  │  server) │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Đề Xuất Mở Rộng — Nên Áp Dụng Thêm

### 4.1 🔴 Ưu Tiên Cao — Nên Áp Dụng Ngay

#### a) Zustand thay thế Context cho Cart State

**Vấn đề hiện tại:** `AppContext` chứa cả auth state lẫn cart state (`extendedPurchases`). Khi cart thay đổi, tất cả components subscribe AppContext đều re-render.

**Giải pháp:**

```typescript
// Tách cart state sang Zustand store
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface CartStore {
  extendedPurchases: ExtendedPurchase[]
  setExtendedPurchases: (purchases: ExtendedPurchase[]) => void
  toggleCheck: (index: number) => void
  checkAll: (checked: boolean) => void
}

export const useCartStore = create<CartStore>()(
  immer((set) => ({
    extendedPurchases: [],
    setExtendedPurchases: (purchases) => set({ extendedPurchases: purchases }),
    toggleCheck: (index) => set((state) => {
      state.extendedPurchases[index].isChecked = !state.extendedPurchases[index].isChecked
    }),
    checkAll: (checked) => set((state) => {
      state.extendedPurchases.forEach(p => { p.isChecked = checked })
    }),
  }))
)

// Component chỉ subscribe đúng slice cần thiết → tránh re-render thừa
const CartItem = () => {
  const toggleCheck = useCartStore(state => state.toggleCheck)  // Chỉ re-render khi toggleCheck thay đổi
}
```

**Lợi ích:**
- Selective subscription → giảm re-render
- Immer middleware → immutable updates dễ viết
- Không cần Provider wrapper
- DevTools support

#### b) Repository Pattern cho API Layer

**Vấn đề hiện tại:** Mỗi API file chứa cả mock data lẫn API calls, khiến file rất dài (ví dụ `purchases.api.ts` = 617 dòng).

**Giải pháp:**

```typescript
// src/repositories/product.repository.ts — Interface
export interface ProductRepository {
  getProducts(params: ProductListConfig, options?: ApiOptions): Promise<ProductListResponse>
  getProductDetail(id: string, options?: ApiOptions): Promise<ProductDetailResponse>
  getSearchSuggestions(params: { q: string }, options?: ApiOptions): Promise<SuggestionsResponse>
}

// src/repositories/product.api.repository.ts — Real implementation
export class ProductApiRepository implements ProductRepository {
  async getProducts(params: ProductListConfig, options?: ApiOptions) {
    return http.get<SuccessResponseApi<ProductList>>('/products', { params, signal: options?.signal })
  }
  // ...
}

// src/repositories/product.mock.repository.ts — Mock implementation
export class ProductMockRepository implements ProductRepository {
  async getProducts(params: ProductListConfig) {
    return { data: { message: 'Mock', data: { products: mockProducts, pagination: {...} } } }
  }
  // ...
}

// src/repositories/index.ts — Factory
export const createProductRepository = (): ProductRepository => {
  if (import.meta.env.VITE_USE_MOCK === 'true') return new ProductMockRepository()
  return new ProductApiRepository()
}
```

**Lợi ích:**
- Tách biệt mock data khỏi production code
- Dễ switch giữa real API và mock
- Dễ test — inject mock repository
- File gọn hơn, dễ maintain

#### c) React Compiler (React 19.x)

**Vấn đề hiện tại:** Phải manually thêm `useMemo`, `useCallback`, `memo` ở nhiều nơi.

**Giải pháp:** Bật React Compiler — tự động memoize tại compile time.

```typescript
// vite.config.ts
import reactCompiler from 'babel-plugin-react-compiler'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [reactCompiler]
      }
    })
  ]
})
```

**Lợi ích:**
- Tự động memoize → bỏ được hầu hết `useMemo`, `useCallback`, `memo`
- Performance tốt hơn vì compiler optimize chính xác hơn manual
- Giảm boilerplate code

---

### 4.2 🟡 Ưu Tiên Trung Bình — Nên Áp Dụng Khi Có Thời Gian

#### a) Command Pattern cho User Actions

**Mục đích:** Undo/Redo cho các thao tác quan trọng (xóa sản phẩm khỏi giỏ, thay đổi số lượng).

```typescript
interface Command {
  execute(): Promise<void>
  undo(): Promise<void>
  description: string
}

class RemoveFromCartCommand implements Command {
  constructor(
    private purchaseIds: string[],
    private previousData: Purchase[],
    private queryClient: QueryClient
  ) {}

  async execute() {
    await purchaseApi.deletePurchase(this.purchaseIds)
    this.queryClient.invalidateQueries(QueryFilters.purchases.cart())
  }

  async undo() {
    // Re-add items to cart
    for (const purchase of this.previousData) {
      await purchaseApi.addToCart({
        product_id: purchase.product._id,
        buy_count: purchase.buy_count
      })
    }
    this.queryClient.invalidateQueries(QueryFilters.purchases.cart())
  }

  get description() { return `Xóa ${this.purchaseIds.length} sản phẩm khỏi giỏ hàng` }
}

// Hook sử dụng
const useCommandHistory = () => {
  const [history, setHistory] = useState<Command[]>([])
  const [pointer, setPointer] = useState(-1)

  const execute = async (command: Command) => {
    await command.execute()
    setHistory(prev => [...prev.slice(0, pointer + 1), command])
    setPointer(prev => prev + 1)
  }

  const undo = async () => {
    if (pointer >= 0) {
      await history[pointer].undo()
      setPointer(prev => prev - 1)
    }
  }

  return { execute, undo, canUndo: pointer >= 0 }
}
```

#### b) Mediator Pattern cho Cross-Component Communication

**Mục đích:** Khi nhiều components cần giao tiếp mà không muốn tạo thêm Context.

```typescript
// Event Bus — Mediator
type EventHandler = (...args: unknown[]) => void

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>()

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
    return () => this.handlers.get(event)?.delete(handler)  // Unsubscribe
  }

  emit(event: string, ...args: unknown[]) {
    this.handlers.get(event)?.forEach(handler => handler(...args))
  }
}

export const eventBus = new EventBus()

// Hook wrapper
const useEventBus = (event: string, handler: EventHandler) => {
  useEffect(() => {
    const unsubscribe = eventBus.on(event, handler)
    return unsubscribe
  }, [event, handler])
}

// Sử dụng
// Component A: eventBus.emit('cart:updated', { count: 5 })
// Component B: useEventBus('cart:updated', (data) => { ... })
```

#### c) State Machine Pattern cho Complex UI Flows

**Mục đích:** Quản lý trạng thái phức tạp (checkout flow, order tracking) một cách rõ ràng.

```typescript
// Checkout flow state machine
type CheckoutState = 'cart' | 'address' | 'payment' | 'review' | 'confirmed' | 'error'
type CheckoutEvent =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'CONFIRM' }
  | { type: 'ERROR'; error: string }

const checkoutMachine = {
  cart:      { NEXT: 'address' },
  address:   { NEXT: 'payment', BACK: 'cart' },
  payment:   { NEXT: 'review', BACK: 'address' },
  review:    { CONFIRM: 'confirmed', BACK: 'payment', ERROR: 'error' },
  confirmed: {},  // Terminal state
  error:     { BACK: 'review' }
}

const useCheckoutMachine = () => {
  const [state, setState] = useState<CheckoutState>('cart')

  const send = useCallback((event: CheckoutEvent) => {
    const nextState = checkoutMachine[state]?.[event.type]
    if (nextState) setState(nextState as CheckoutState)
  }, [state])

  return { state, send, isTerminal: state === 'confirmed' }
}
```

---

### 4.3 🟢 Ưu Tiên Thấp — Nice to Have

#### a) Decorator Pattern cho API Logging/Metrics

```typescript
// Decorator tự động log API calls + measure performance
function withLogging<T extends (...args: any[]) => Promise<any>>(fn: T, name: string): T {
  return (async (...args: Parameters<T>) => {
    const start = performance.now()
    console.log(`[API] ${name} started`)
    try {
      const result = await fn(...args)
      console.log(`[API] ${name} completed in ${(performance.now() - start).toFixed(0)}ms`)
      return result
    } catch (error) {
      console.error(`[API] ${name} failed in ${(performance.now() - start).toFixed(0)}ms`, error)
      throw error
    }
  }) as T
}

// Sử dụng
const productApi = {
  getProducts: withLogging(
    (params: ProductListConfig) => http.get('/products', { params }),
    'getProducts'
  )
}
```

#### b) Proxy Pattern cho Feature Flags

```typescript
// Feature flag proxy — enable/disable features tại runtime
const featureFlags = {
  enableChatbot: true,
  enableDarkMode: true,
  enablePWA: false,
  enableLiveTracking: false,
}

const featureFlagProxy = new Proxy(featureFlags, {
  get(target, prop: string) {
    // Có thể fetch từ remote config
    const value = target[prop as keyof typeof target]
    console.log(`[Feature] ${prop} = ${value}`)
    return value
  }
})

// Sử dụng trong component
{featureFlagProxy.enableChatbot && <ChatbotWidget />}
```

#### c) Composite Pattern cho Form Validation

```typescript
// Composable validators
type Validator<T> = (value: T) => string | null

const required: Validator<string> = (v) => v ? null : 'Trường này là bắt buộc'
const minLength = (min: number): Validator<string> => (v) =>
  v.length >= min ? null : `Tối thiểu ${min} ký tự`
const email: Validator<string> = (v) =>
  /^\S+@\S+\.\S+$/.test(v) ? null : 'Email không hợp lệ'

// Compose validators
const compose = <T>(...validators: Validator<T>[]): Validator<T> => (value) => {
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return null
}

// Sử dụng
const validateEmail = compose(required, minLength(5), email)
const error = validateEmail('test')  // "Tối thiểu 5 ký tự"
```

---

### 4.4 📊 Bảng Tổng Hợp Đề Xuất

| Pattern | Ưu Tiên | Lợi Ích Chính | Độ Phức Tạp |
|---------|---------|---------------|-------------|
| Zustand cho Cart | 🔴 Cao | Giảm re-render 50%+ | Thấp |
| Repository Pattern | 🔴 Cao | Tách mock/real, dễ test | Trung bình |
| React Compiler | 🔴 Cao | Auto-memoize, giảm boilerplate | Thấp |
| Command Pattern | 🟡 TB | Undo/Redo support | Trung bình |
| Mediator/Event Bus | 🟡 TB | Cross-component communication | Thấp |
| State Machine | 🟡 TB | Complex flow management | Trung bình |
| Decorator (Logging) | 🟢 Thấp | API monitoring | Thấp |
| Feature Flags | 🟢 Thấp | Runtime feature toggle | Thấp |
| Composite Validators | 🟢 Thấp | Reusable validation | Thấp |

---

## 5. Kết Luận

### Tổng kết Design Patterns đã áp dụng

Dự án Shopee Clone TypeScript đã áp dụng **20 design patterns** một cách có hệ thống:

| Nhóm | Patterns | Số lượng |
|------|----------|----------|
| Architectural | Provider, Singleton, Observer, Interceptor | 4 |
| React-specific | Custom Hook, Memoization, Error Boundary, Guard, Lazy Loading, Compound Component | 6 |
| Data Management | Optimistic Update, Factory (Query Filters), Strategy (Prefetch), Adapter (nuqs) | 4 |
| Code Quality | Schema Validation (Zod), Generic Types, Barrel Export, Debounce | 4 |
| Resilience | Graceful Degradation (Mock Fallback), i18n Lazy Loading | 2 |

### Điểm mạnh nổi bật

1. **Hệ thống Optimistic Updates** hoàn chỉnh với shared utilities, rollback, và cache sync
2. **Multi-level Lazy Loading** (route → component → library → i18n → vendor chunks)
3. **Centralized Query Management** với QueryFilters factory + QueryPredicates + useQueryInvalidation
4. **Type-safe toàn diện** từ API response → Zod schema → form validation → URL state
5. **Graceful Degradation** — frontend hoạt động độc lập với mock data khi backend không khả dụng

### Điểm cần cải thiện

1. **AppContext quá tải** — nên tách cart state sang Zustand
2. **API files quá dài** — nên áp dụng Repository Pattern tách mock/real
3. **Manual memoization** — nên bật React Compiler
4. **Thiếu Undo/Redo** — nên áp dụng Command Pattern cho cart operations

---

> 📝 **Ghi chú:** Tài liệu này được tạo dựa trên phân tích code thực tế trong dự án. Mọi ví dụ code đều trích từ các file cụ thể đã được ghi chú đường dẫn.