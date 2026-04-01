# TanStack Router vs React Router — Phân Tích Toàn Diện (2026)

> **Ngữ cảnh**: Tài liệu này được viết dựa trên việc phân tích trực tiếp codebase **Shopee Clone TypeScript** (React 19, React Router v7.13, TanStack Query v5, nuqs v2, Vite) và nghiên cứu so sánh hai thư viện tính đến tháng 4/2026.

---

## Mục lục

1. [Tổng quan nhanh](#1-tổng-quan-nhanh)
2. [Phân tích React Router trong dự án này](#2-phân-tích-react-router-trong-dự-án-này)
3. [TanStack Router là gì?](#3-tanstack-router-là-gì)
4. [So sánh chi tiết từng tính năng](#4-so-sánh-chi-tiết-từng-tính-năng)
5. [Điểm mạnh của TanStack Router](#5-điểm-mạnh-của-tanstack-router)
6. [Điểm yếu và hạn chế của TanStack Router](#6-điểm-yếu-và-hạn-chế-của-tanstack-router)
7. [Khi nào nên dùng TanStack Router thay vì React Router?](#7-khi-nào-nên-dùng-tanstack-router-thay-vì-react-router)
8. [Tác động đến dự án Shopee Clone này](#8-tác-động-đến-dự-án-shopee-clone-này)
9. [Kết luận và khuyến nghị](#9-kết-luận-và-khuyến-nghị)

---

## 1. Tổng quan nhanh

| Tiêu chí | React Router v7 | TanStack Router |
|---|---|---|
| Weekly Downloads (2026) | ~12M (ổn định) | ~1.2M (+120% YoY) |
| Bundle Size | ~32KB | ~40KB |
| Type Safety | Partial (codegen hoặc manual) | End-to-end tự động |
| Search Params Typing | ❌ Không có | ✅ Zod schema validation |
| Path Params Typing | ✅ Có (manual cast) | ✅ Tự động, zero config |
| Loader Data Typing | Manual cast | ✅ Tự động |
| File-based Routing | ✅ Built-in | ✅ Via plugin |
| SSR / Server Components | ✅ (Framework mode) | 🔶 Partial |
| React Server Components | 🟡 Experimental | ❌ Không hỗ trợ |
| SWR Loader Caching | ❌ | ✅ Built-in |
| DevTools | 🟠 Community | ✅ Official |
| Trạng thái bảo trì (2026) | ⚠️ Chậm lại | ✅ Đang phát triển mạnh |

---

## 2. Phân tích React Router trong dự án này

### 2.1 Cách dự án đang dùng React Router

Dự án Shopee Clone đang dùng **React Router v7.13.1** theo pattern **code-based routing** với `useRoutes()` hook:

```
src/
├── useRouteElements.tsx     ← Toàn bộ route config nằm ở đây
├── router/
│   └── loaders.ts           ← React Router loaders cho prefetch
├── constant/
│   └── path.ts              ← Centralized path constants
└── main.tsx                 ← BrowserRouter wrapper
```

**Kiến trúc routing hiện tại:**

```
BrowserRouter (main.tsx)
└── App (App.tsx)
    └── useRouteElements() → useRoutes([...])
        ├── Public Routes (MainLayout)
        │   ├── /                → Home
        │   ├── /products        → ProductList
        │   ├── /:nameId         → ProductDetail
        │   └── /compare         → Compare
        ├── Protected Routes (ProtectedRoute guard)
        │   ├── /cart            → Cart
        │   ├── /checkout        → Checkout
        │   ├── /wishlist        → Wishlist
        │   └── /user/*          → UserLayout
        │       ├── /user/profile
        │       ├── /user/password
        │       ├── /user/purchase
        │       └── ... (10+ sub-routes)
        └── Rejected Routes (RejectedRoute guard)
            └── RegisterLayout
                ├── /login
                ├── /register
                ├── /forgot-password
                └── /reset-password
```

### 2.2 Điểm đáng chú ý trong codebase hiện tại

**1. Lazy loading được áp dụng triệt để:**
```tsx
// useRouteElements.tsx
const Login = lazy(() => import('./pages/Login'))
const Home = lazy(() => import('./pages/Home'))
// ... 20+ lazy imports
```
Tất cả pages đều được lazy load — đây là best practice tốt.

**2. Custom route guards bằng component:**
```tsx
function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}
```
Pattern này hoạt động tốt với React Router nhưng **không có type safety**.

**3. Loaders đã được viết nhưng chưa kết nối vào routes:**
File `src/router/loaders.ts` có đầy đủ loaders (`homeLoader`, `productDetailLoader`, `cartLoader`...) nhưng trong `useRouteElements.tsx` **không thấy chúng được gắn vào route config**. Đây là một điểm chưa hoàn chỉnh.

**4. nuqs đang xử lý search params:**
```tsx
// src/hooks/nuqs/productSearchParams.ts
export const productSearchParsers = {
  page: parseAsInteger.withDefault(1),
  sort_by: parseAsStringLiteral(['createdAt', 'view', 'sold', 'price'] as const),
  // ...
}
```
nuqs đang làm công việc mà TanStack Router có thể làm natively — đây là điểm quan trọng khi so sánh.

**5. Path constants không type-safe:**
```tsx
// constant/path.ts — chỉ là string, không có type inference
const path = {
  productDetail: ':nameId',  // Không biết params là gì
  orderDetail: '/user/order/:orderId',  // Không biết orderId type
} as const
```

---

## 3. TanStack Router là gì?

TanStack Router là routing library cho React được xây dựng bởi **Tanner Linsley** (tác giả của TanStack Query/React Query). Ra mắt stable v1 vào năm 2024, hiện đang ở v1.x với tốc độ phát triển rất nhanh.

### Triết lý thiết kế

TanStack Router được xây dựng với **"type-safety first"** — mọi thứ từ path params, search params, loader data đến navigation đều được TypeScript infer tự động, không cần casting hay codegen.

### Hai cách định nghĩa routes

**Code-based (giống dự án hiện tại):**
```tsx
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

const rootRoute = createRootRoute({ component: RootLayout })

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  loader: async ({ params }) => fetchProduct(params.productId), // params.productId: string ✅
  component: ProductDetail,
})

const router = createRouter({ routeTree: rootRoute.addChildren([homeRoute, productDetailRoute]) })
```

**File-based (với plugin):**
```
src/routes/
├── __root.tsx
├── index.tsx                    → /
├── products/
│   ├── index.tsx                → /products
│   └── $productId.tsx           → /products/$productId
└── user/
    ├── profile.tsx              → /user/profile
    └── order.$orderId.tsx       → /user/order/$orderId
```

---

## 4. So sánh chi tiết từng tính năng

### 4.1 Type Safety cho Path Params

**React Router v7:**
```tsx
// useParams() trả về Record<string, string | undefined> — phải cast thủ công
function ProductDetail() {
  const { nameId } = useParams()
  // nameId: string | undefined — phải tự handle undefined
  // Không biết tên param là gì nếu không nhìn vào route config
}
```

**TanStack Router:**
```tsx
// params được infer từ path definition — zero config
const productDetailRoute = createRoute({
  path: '/products/$productId',
  // ...
})

function ProductDetail() {
  const { productId } = productDetailRoute.useParams()
  // productId: string — guaranteed, không bao giờ undefined
  // TypeScript báo lỗi ngay nếu gõ sai tên param
}
```

**Verdict:** TanStack Router thắng rõ ràng. React Router v7 đã cải thiện nhưng vẫn cần manual typing.

---

### 4.2 Type Safety cho Search Params (Killer Feature)

Đây là điểm **khác biệt lớn nhất** giữa hai thư viện.

**React Router v7 (cách dự án đang làm với nuqs):**
```tsx
// Cần thư viện bên thứ 3 (nuqs) để có type safety
const productSearchParsers = {
  page: parseAsInteger.withDefault(1),
  sort_by: parseAsStringLiteral(['createdAt', 'view', 'sold', 'price'] as const),
}

function ProductList() {
  const [filters, setFilters] = useProductQueryStates() // từ nuqs
  // filters.page: number ✅ (nhờ nuqs)
  // filters.sort_by: 'createdAt' | 'view' | 'sold' | 'price' ✅ (nhờ nuqs)
}
```

**TanStack Router (native, không cần nuqs):**
```tsx
import { z } from 'zod'

const productListRoute = createRoute({
  path: '/products',
  validateSearch: z.object({
    page: z.number().catch(1),
    sort_by: z.enum(['createdAt', 'view', 'sold', 'price']).catch('createdAt'),
    order: z.enum(['asc', 'desc']).optional(),
    name: z.string().optional(),
    price_min: z.number().optional(),
    price_max: z.number().optional(),
    category: z.string().optional(),
  }),
})

function ProductList() {
  const { page, sort_by, name } = productListRoute.useSearch()
  // Tất cả đều typed ✅ — không cần nuqs, không cần thư viện bên ngoài
  
  const navigate = useNavigate()
  navigate({
    to: '/products',
    search: (prev) => ({ ...prev, page: prev.page + 1 })
    // prev được typed đầy đủ ✅
  })
}
```

**Verdict:** TanStack Router thắng. Dự án hiện tại phải dùng nuqs để bù đắp cho thiếu sót của React Router — TanStack Router có sẵn tính năng này.

---

### 4.3 Loader Data Typing

**React Router v7:**
```tsx
// src/router/loaders.ts (dự án hiện tại)
export const productDetailLoader: LoaderFunction = async ({ params }) => {
  const queryClient = createPrefetchQueryClient()
  // ...
  return queryClient // return type: QueryClient
}

// Trong component — phải cast thủ công
function ProductDetail() {
  const queryClient = useLoaderData() as QueryClient // ⚠️ unsafe cast
}
```

**TanStack Router:**
```tsx
const productDetailRoute = createRoute({
  loader: async ({ params }) => {
    const product = await fetchProduct(params.productId)
    return { product } // TypeScript infers return type
  },
  component: ProductDetail,
})

function ProductDetail() {
  const { product } = productDetailRoute.useLoaderData()
  // product: Product — fully typed, zero casting ✅
}
```

**Verdict:** TanStack Router thắng. Không cần `as` casting.

---

### 4.4 Type-Safe Navigation

**React Router v7:**
```tsx
const navigate = useNavigate()

// Không có type checking — typo sẽ fail silently ở runtime
navigate('/user/profle')        // ⚠️ Typo không bị bắt
navigate(`/user/order/${id}`)   // ⚠️ Template string không safe
navigate(path.profile)          // ✅ Dùng constant — cách dự án đang làm
```

**TanStack Router:**
```tsx
const navigate = useNavigate()

// TypeScript bắt lỗi tại compile time
navigate({ to: '/user/profle' })        // ❌ TypeScript Error: không có route này
navigate({ to: '/user/order/$orderId', params: { orderId: id } }) // ✅
navigate({ to: '/user/order/$orderId' }) // ❌ TypeScript Error: thiếu orderId
```

**Verdict:** TanStack Router thắng. Dự án hiện tại dùng `path` constants như một workaround — TanStack Router giải quyết vấn đề này ở tầng type system.

---

### 4.5 Data Loading và Caching

**React Router v7:**
```tsx
// Loaders chạy trước khi render — không có caching
export const productDetailLoader: LoaderFunction = async ({ params }) => {
  return fetch(`/api/products/${params.productId}`).then(r => r.json())
  // Mỗi lần navigate đến route này → fetch lại từ đầu
  // Muốn cache → phải kết hợp TanStack Query (như dự án đang làm)
}
```

**TanStack Router:**
```tsx
const productDetailRoute = createRoute({
  loader: async ({ params }) => fetchProduct(params.productId),
  // SWR caching built-in: data được cache, revalidate in background
  // staleTime, gcTime có thể config
  // Không cần TanStack Query chỉ để cache loader data
})
```

**Tuy nhiên**, dự án này đã dùng **TanStack Query** rất tốt. Khi dùng TanStack Router + TanStack Query cùng nhau, pattern sẽ là:

```tsx
const productDetailRoute = createRoute({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(productDetailQuery(params.productId)),
  // Loader chỉ đảm bảo data có trong cache
  // Component dùng useQuery() để subscribe — vẫn có refetch, invalidation
})
```

**Verdict:** Hòa. Dự án đang dùng TanStack Query cho caching — pattern này hoạt động tốt với cả hai router.

---

### 4.6 Route Guards / Authentication

**React Router v7 (cách dự án đang làm):**
```tsx
function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}
// Đơn giản, dễ hiểu, nhưng không có type safety
```

**TanStack Router:**
```tsx
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
})
// beforeLoad chạy trước khi render — không có flash of unauthenticated content
// context được typed đầy đủ
```

**Verdict:** TanStack Router có approach tốt hơn với `beforeLoad`, nhưng pattern của dự án hiện tại cũng hoạt động ổn.

---

### 4.7 DevTools

**React Router v7:** Không có official devtools. Community có một số tools nhưng không chính thức.

**TanStack Router:** Có `@tanstack/router-devtools` chính thức, tương tự TanStack Query DevTools — hiển thị route tree, active routes, search params, loader state.

**Verdict:** TanStack Router thắng rõ ràng.

---

### 4.8 SSR và Server Components

**React Router v7 (Framework mode):**
```tsx
// Hỗ trợ đầy đủ SSR, Streaming SSR, React Server Components (experimental)
// Đây là nền tảng của Remix v2
export async function loader({ params }: Route.LoaderArgs) {
  return db.product.findUnique({ where: { id: params.productId } })
}
```

**TanStack Router:**
- SSR: ✅ Hỗ trợ qua TanStack Start
- Streaming SSR: ✅
- React Server Components: ❌ Không hỗ trợ (tính đến 2026)
- Server Actions: ✅ Qua TanStack Start

**Verdict:** React Router v7 thắng cho full-stack/SSR. Dự án này là SPA nên không ảnh hưởng.

---

### 4.9 Ecosystem và Community

| Metric | React Router v7 | TanStack Router |
|---|---|---|
| GitHub Stars | ~55K | ~9K |
| Weekly Downloads | ~12M | ~1.2M |
| Age | ~10 năm | ~3 năm (stable) |
| Stack Overflow Q&A | Rất nhiều | Ít hơn |
| Tutorials/Courses | Hàng nghìn | Đang tăng |
| Maintenance pace | ⚠️ Chậm lại | ✅ Rất active |

**Verdict:** React Router thắng về ecosystem hiện tại. TanStack Router đang bắt kịp nhanh.

---

## 5. Điểm mạnh của TanStack Router

### ✅ 1. End-to-End Type Safety (Killer Feature)
Đây là lý do chính để chọn TanStack Router. Toàn bộ routing layer — path params, search params, loader data, navigation — đều được TypeScript infer tự động. Không cần casting, không cần codegen, không cần thư viện bên thứ 3.

### ✅ 2. Search Params như First-Class Citizens
TanStack Router coi search params là **state** thực sự, không chỉ là string. Có schema validation (Zod), structural sharing (không re-render nếu giá trị không đổi), JSON serialization cho complex types.

### ✅ 3. SWR Loader Caching Built-in
Loader data được cache theo SWR pattern. Navigate đến route đã visit → data hiển thị ngay, revalidate in background. Không cần TanStack Query chỉ để cache loader data (dù vẫn có thể dùng cùng nhau).

### ✅ 4. DevTools Chính Thức
`@tanstack/router-devtools` hiển thị toàn bộ route tree, active routes, search params, loader state — rất hữu ích trong development.

### ✅ 5. Tích hợp TanStack Ecosystem
TanStack Router + TanStack Query + TanStack Table = một ecosystem nhất quán, cùng tác giả, cùng triết lý. Integration pattern được document rõ ràng.

### ✅ 6. Active Development
Tanner Linsley và team đang phát triển TanStack Router rất tích cực. Không có vấn đề "PR unmerged 6 tháng" như React Router.

### ✅ 7. Route Context
```tsx
const router = createRouter({
  routeTree,
  context: { queryClient, auth } // Typed context cho toàn bộ route tree
})
// Mọi route đều có access đến context với đầy đủ type
```

### ✅ 8. beforeLoad Hook
```tsx
createRoute({
  beforeLoad: async ({ context, location }) => {
    // Chạy trước khi render — perfect cho auth guards
    // Có thể throw redirect() để redirect
    // Có thể return data để merge vào context
  }
})
```

---

## 6. Điểm yếu và hạn chế của TanStack Router

### ❌ 1. Không hỗ trợ React Server Components
Đây là hạn chế lớn nhất. Nếu dự án cần RSC (Next.js style), TanStack Router không phải lựa chọn. Tuy nhiên, với SPA thuần, đây không phải vấn đề.

### ❌ 2. Ecosystem nhỏ hơn
Ít tutorials, ít Stack Overflow answers, ít third-party integrations so với React Router. Khi gặp vấn đề lạ, khó tìm giải pháp hơn.

### ❌ 3. Migration Cost Cao
Migrating từ React Router sang TanStack Router không phải chỉ thay import. Phải:
- Rewrite toàn bộ route config (API khác nhau)
- Update mọi component dùng `useParams`, `useSearchParams`, `useNavigate`
- Rewrite route guards
- Rewrite loaders
- Ước tính: **2-4 tuần** cho dự án medium, **4-8 tuần** cho dự án lớn

### ❌ 4. Boilerplate Nhiều Hơn
```tsx
// TanStack Router — nhiều code hơn để setup
const rootRoute = createRootRoute({ component: RootLayout })
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home })
const router = createRouter({ routeTree: rootRoute.addChildren([homeRoute]) })

// Phải declare module cho type inference
declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
```

### ❌ 5. Không có Runtime Route Manipulation (Fog of War)
React Router v7 hỗ trợ "Fog of War" — load route definitions lazily at runtime. TanStack Router chưa hỗ trợ tính năng này.

### ❌ 6. nuqs Compatibility Cần Chú Ý
Nếu dự án đang dùng nuqs với React Router, khi migrate sang TanStack Router cần dùng nuqs adapter cho TanStack Router. Có một bug về serialization đã được fix (PR #1128, Sep 2025) nhưng cần test kỹ.

### ❌ 7. Learning Curve
Mặc dù concept tương tự, API của TanStack Router khác hoàn toàn React Router. Team cần thời gian làm quen với:
- `createRootRoute`, `createRoute`, `createRouter`
- `beforeLoad` vs component-based guards
- `validateSearch` pattern
- Route context system

### ❌ 8. Parallel Routes Chưa Hỗ Trợ
Next.js có Parallel Routes (render nhiều route cùng lúc trong cùng layout). TanStack Router chưa có tính năng này.

---

## 7. Khi nào nên dùng TanStack Router thay vì React Router?

### Nên dùng TanStack Router khi:

```
✅ Dự án là React SPA (client-side only) — không cần SSR
✅ TypeScript là bắt buộc và type safety là ưu tiên cao
✅ Search params phức tạp (nhiều filters, pagination, sorting)
✅ Dự án mới — không có migration cost
✅ Team đã quen với TanStack ecosystem (React Query, Table, Virtual)
✅ Muốn integrated devtools cho routing
✅ Cần route-level data loading với caching
✅ Dự án dài hạn, cần maintainability tốt
✅ Muốn tránh phụ thuộc vào nuqs cho search params typing
```

### Nên giữ React Router khi:

```
✅ Cần SSR / Server Components / Remix architecture
✅ Dự án đang chạy ổn, không có pain points về type safety
✅ Team không quen TypeScript hoặc không cần strict typing
✅ Deadline gấp, không có thời gian migration
✅ Dự án nhỏ, ít routes, ít complexity
✅ Cần ecosystem rộng, nhiều tutorials, nhiều support
✅ Dự án đang dùng Remix hoặc có kế hoạch dùng Remix
✅ Cần React Server Components
```

### Framework Decision Matrix:

```
Bạn cần SSR/RSC?
├── Có → React Router v7 (Remix) hoặc Next.js
└── Không (SPA)
    ├── TypeScript strict + search params phức tạp?
    │   ├── Có → TanStack Router ✅
    │   └── Không
    │       ├── Dự án mới? → TanStack Router (future-proof)
    │       └── Dự án cũ đang chạy? → React Router (giữ nguyên)
```

---

## 8. Tác động đến dự án Shopee Clone này

### 8.1 Phân tích hiện trạng

Dự án hiện tại có những đặc điểm sau:

| Đặc điểm | Giá trị | Tác động khi migrate |
|---|---|---|
| Số routes | ~25 routes | Migration effort: Medium |
| Search params | Dùng nuqs (typed) | Có thể replace bằng TanStack Router native |
| Loaders | Viết sẵn nhưng chưa kết nối | Cần rewrite theo TanStack Router API |
| Route guards | Component-based (ProtectedRoute) | Cần rewrite thành `beforeLoad` |
| Path constants | `constant/path.ts` | Có thể bỏ — TanStack Router tự type-safe |
| TanStack Query | ✅ Đã dùng | Integration với TanStack Router rất tốt |
| React 19 | ✅ | TanStack Router hỗ trợ |
| nuqs | ✅ Đang dùng | Cần switch sang TanStack Router adapter |

### 8.2 Những gì sẽ thay đổi nếu migrate

**Bỏ được:**
- `src/constant/path.ts` — không cần nữa vì navigation type-safe
- `nuqs` dependency (hoặc giảm scope) — TanStack Router handle search params natively
- Manual type casting trong components (`useLoaderData() as QueryClient`)
- `ProtectedRoute` / `RejectedRoute` components — replace bằng `beforeLoad`

**Thêm vào:**
- `@tanstack/react-router` + `@tanstack/router-plugin`
- Route context setup cho `queryClient` và `auth`
- `declare module '@tanstack/react-router'` cho type registration

**Rewrite:**
- `useRouteElements.tsx` → route tree với `createRoute`
- `src/router/loaders.ts` → integrate vào route definitions
- Mọi component dùng `useParams()`, `useSearchParams()`, `useNavigate()`

### 8.3 Ví dụ migration cho ProductList route

**Hiện tại (React Router + nuqs):**
```tsx
// useRouteElements.tsx
{
  path: path.products,
  element: <Suspense fallback={<Loader />}><ProductList /></Suspense>
}

// ProductList.tsx
function ProductList() {
  const [filters, setFilters] = useProductQueryStates() // từ nuqs
  const { data } = useQuery({
    queryKey: ['products', normalizeProductQueryKey(filters)],
    queryFn: () => productApi.getProducts(filters)
  })
}
```

**Sau khi migrate (TanStack Router):**
```tsx
// routes/products/index.tsx
import { z } from 'zod'

export const Route = createFileRoute('/products/')({
  validateSearch: z.object({
    page: z.number().catch(1),
    sort_by: z.enum(['createdAt', 'view', 'sold', 'price']).catch('createdAt'),
    order: z.enum(['asc', 'desc']).optional(),
    name: z.string().optional(),
    price_min: z.number().optional(),
    price_max: z.number().optional(),
    category: z.string().optional(),
  }),
  loader: ({ context: { queryClient }, search }) =>
    queryClient.ensureQueryData(productListQuery(search)),
  component: ProductList,
})

function ProductList() {
  const search = Route.useSearch() // Fully typed, no nuqs needed
  const { data } = useQuery(productListQuery(search))
  
  const navigate = useNavigate({ from: Route.fullPath })
  // navigate({ search: prev => ({ ...prev, page: prev.page + 1 }) }) ✅ typed
}
```

### 8.4 Khuyến nghị cho dự án này

**Ngắn hạn (hiện tại):** Giữ React Router v7. Dự án đang hoạt động tốt, nuqs đã giải quyết vấn đề search params typing, loaders đã được viết sẵn. Không có lý do cấp bách để migrate.

**Trung hạn (3-6 tháng):** Nếu dự án tiếp tục phát triển thêm nhiều routes và search params phức tạp hơn, hãy xem xét migrate sang TanStack Router. Ưu tiên:
1. Kết nối loaders đã viết vào route config (quick win với React Router hiện tại)
2. Evaluate TanStack Router cho feature mới nhất

**Dài hạn:** TanStack Router là hướng đi tốt hơn cho SPA TypeScript-first. React Router đang chậm lại về maintenance, TanStack Router đang phát triển mạnh.

---

## 9. Kết luận và khuyến nghị

### Tóm tắt so sánh

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VERDICT CUỐI CÙNG                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TanStack Router THẮNG ở:                                           │
│  ✅ Type safety (search params, path params, loader data)           │
│  ✅ Developer Experience (devtools, autocomplete, error catching)   │
│  ✅ Tích hợp TanStack ecosystem                                     │
│  ✅ Active maintenance và development pace                          │
│  ✅ Built-in SWR caching cho loaders                                │
│                                                                     │
│  React Router THẮNG ở:                                              │
│  ✅ Ecosystem size và community support                             │
│  ✅ SSR / React Server Components                                   │
│  ✅ Remix architecture (full-stack)                                 │
│  ✅ Ít boilerplate hơn cho setup đơn giản                          │
│  ✅ Không có migration cost (nếu đang dùng rồi)                    │
│                                                                     │
│  KHUYẾN NGHỊ:                                                       │
│  → Dự án mới, SPA, TypeScript → TanStack Router                    │
│  → Dự án cũ đang chạy tốt → Giữ React Router                      │
│  → Cần SSR/RSC → React Router v7 (Remix) hoặc Next.js             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Câu trả lời thực tế

**TanStack Router không phải "React Router killer"** — nó là một công cụ khác nhau cho use case khác nhau.

Nếu bạn đang xây dựng một **React SPA TypeScript-first** và type safety là ưu tiên, TanStack Router là lựa chọn tốt hơn trong 2026. Nếu bạn cần full-stack, SSR, hoặc đang migrate dần sang Remix architecture, React Router v7 vẫn là lựa chọn đúng đắn.

Với dự án **Shopee Clone này** — một SPA phức tạp với nhiều search params, TypeScript strict, và đã dùng TanStack Query — TanStack Router sẽ là upgrade tự nhiên khi có thời gian và resources để migrate.

---

## Tài liệu tham khảo

- [TanStack Router Official Docs](https://tanstack.com/router/latest)
- [TanStack Router vs React Router — Official Comparison](https://tanstack.com/router/latest/docs/comparison)
- [React Router v7 Docs](https://reactrouter.com/)
- [TanStack Router Migration Guide from React Router](https://tanstack.com/router/latest/docs/how-to/migrate-from-react-router)
- [nuqs TanStack Router Adapter](https://nuqs.dev/)
- [PkgPulse: TanStack Router vs React Router v7 (2026)](https://www.pkgpulse.com/blog/tanstack-router-vs-react-router-v7-2026)
- [BSWEN: React Router vs TanStack Router — Should You Migrate? (2026)](https://docs.bswen.com/blog/2026-03-11-react-router-vs-tanstack-router)

---

*Tài liệu này được tạo ngày 01/04/2026 dựa trên phân tích codebase thực tế và nghiên cứu so sánh hai thư viện.*
