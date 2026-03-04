# Phân Tích Thư Viện nuqs - Quản Lý URL Search Params Type-Safe

## 1. nuqs là gì?

**nuqs** (phát âm: "nukes") là một thư viện React giúp quản lý URL search params với type-safe. Thay vì phải tự parse và serialize các giá trị từ URL, nuqs tự động làm điều đó cho bạn với đầy đủ hỗ trợ TypeScript.

**Version đang sử dụng trong dự án:** `2.8.8`

### So sánh với cách truyền thống (useSearchParams từ React Router)

| Đặc điểm | useSearchParams (React Router) | nuqs |
|----------|-------------------------------|------|
| Type Safety | ❌ Không có - luôn trả về string | ✅ Tự động infer type từ parser |
| Default Values | ❌ Phải tự xử lý | ✅ Có sẵn `.withDefault()` |
| Parse/Serialize | ❌ Phải tự làm | ✅ Tự động |
| Validation | ❌ Không có | ✅ Có sẵn với literal types |
| DX (Developer Experience) | ⚠️ Nhiều boilerplate | ✅ Clean và ngắn gọn |

---

## 2. Tại sao cần nuqs?

### Các vấn đề nuqs giải quyết:

**1. URL search params mặc định là string**
```typescript
// Truyền thống: phải parse thủ công
const page = Number(searchParams.get('page')) || 1  // Dễ quên, dễ bug
```

**2. Không có type safety**
```typescript
// Truyền thống: TypeScript không biết giá trị thực sự là gì
const sortBy = searchParams.get('sort_by')  // string | null - không biết có hợp lệ không
```

**3. Không có default values tự động**
```typescript
// Truyền thống: phải check null/undefined mọi nơi
const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
```

**4. Phải tự serialize/deserialize**
```typescript
// Truyền thống: khi update URL
setSearchParams({ page: String(newPage), limit: String(newLimit) })  // Phải convert về string
```

**5. Khó maintain khi có nhiều params**
```typescript
// Truyền thống: 10 params = 10 lần parse, 10 lần check null, 10 lần convert
```

---

## 3. Cách cấu hình nuqs trong dự án

### Setup NuqsAdapter trong `src/main.tsx`:

```typescript
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { BrowserRouter } from 'react-router'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <NuqsAdapter>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AppProvider>
              {/* ... rest of app */}
            </AppProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </BrowserRouter>
  </React.StrictMode>
)
```

### Tại sao cần NuqsAdapter?

**NuqsAdapter** là cầu nối giữa nuqs và router của bạn. Nó:
- Đọc URL search params từ router
- Cập nhật URL khi state thay đổi
- Đảm bảo sync giữa nuqs state và URL

### Tại sao NuqsAdapter nằm trong BrowserRouter?

NuqsAdapter cần truy cập vào router context để:
1. Đọc `location.search` hiện tại
2. Sử dụng `navigate()` để update URL
3. Lắng nghe thay đổi URL (back/forward button)

**Thứ tự quan trọng:**
```
BrowserRouter (cung cấp router context)
  └── NuqsAdapter (sử dụng router context)
       └── App (sử dụng nuqs hooks)
```

---

## 4. Các Parser có sẵn trong nuqs

### Parsers đang sử dụng trong dự án:

#### `parseAsInteger` - Parse URL param thành number
```typescript
import { parseAsInteger } from 'nuqs'

// URL: ?page=2
const pageParser = parseAsInteger  // "2" → 2 (number)
```

#### `parseAsString` - Parse URL param thành string
```typescript
import { parseAsString } from 'nuqs'

// URL: ?name=iphone
const nameParser = parseAsString  // "iphone" → "iphone" (string | null)
```

#### `parseAsStringLiteral` - Parse URL param thành union type cụ thể
```typescript
import { parseAsStringLiteral } from 'nuqs'

// URL: ?sort_by=price
const sortByParser = parseAsStringLiteral(['createdAt', 'view', 'sold', 'price'] as const)
// "price" → "price" (type: 'createdAt' | 'view' | 'sold' | 'price' | null)
// "invalid" → null (tự động reject giá trị không hợp lệ)
```

#### `.withDefault()` - Đặt giá trị mặc định
```typescript
const pageParser = parseAsInteger.withDefault(1)
// URL: ?page=2 → 2
// URL: (không có page) → 1 (default)
// Kiểu trả về: number (không còn null)
```

### Parsers có sẵn nhưng chưa sử dụng:

| Parser | Mô tả | Ví dụ |
|--------|-------|-------|
| `parseAsBoolean` | Parse "true"/"false" thành boolean | `?active=true` → `true` |
| `parseAsFloat` | Parse số thập phân | `?price=99.99` → `99.99` |
| `parseAsArrayOf` | Parse array từ URL | `?tags=a,b,c` → `['a','b','c']` |
| `parseAsJson` | Parse JSON string | `?filter={"min":0}` → `{min:0}` |
| `parseAsIsoDateTime` | Parse ISO date string | `?date=2024-01-01` → `Date` |
| `parseAsTimestamp` | Parse Unix timestamp | `?ts=1704067200` → `Date` |

---

## 5. useQueryState vs useQueryStates

### `useQueryState` - Quản lý 1 param duy nhất

Sử dụng khi chỉ cần quản lý một search param đơn lẻ.

**Ví dụ từ dự án - Purchase Status:**
```typescript
// src/hooks/nuqs/purchaseSearchParams.ts
import { parseAsInteger, useQueryState } from 'nuqs'

export const purchaseStatusParser = parseAsInteger.withDefault(0)

export function usePurchaseStatus() {
  return useQueryState('status', purchaseStatusParser)
}

// Sử dụng trong component:
const [status, setStatus] = usePurchaseStatus()
// URL: ?status=2
// status = 2 (number)
// setStatus(3) → URL: ?status=3
```

**Ví dụ từ dự án - Order Status:**
```typescript
// src/hooks/nuqs/orderSearchParams.ts
import { parseAsInteger, useQueryState } from 'nuqs'

export const orderStatusParser = parseAsInteger.withDefault(0)

export function useOrderStatus() {
  return useQueryState('status', orderStatusParser)
}
```

### `useQueryStates` - Quản lý nhiều params cùng lúc

Sử dụng khi cần quản lý nhiều search params liên quan với nhau.

**Ví dụ từ dự án - Product Search (10 params):**
```typescript
// src/hooks/nuqs/productSearchParams.ts
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
  inferParserType,
  createSerializer
} from 'nuqs'

export const productSearchParsers = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  sort_by: parseAsStringLiteral(['createdAt', 'view', 'sold', 'price'] as const).withDefault('createdAt'),
  order: parseAsStringLiteral(['asc', 'desc'] as const),
  exclude: parseAsString,
  name: parseAsString,
  price_min: parseAsInteger,
  price_max: parseAsInteger,
  rating_filter: parseAsInteger,
  category: parseAsString
}

export function useProductQueryStates() {
  const [filters, setFilters] = useQueryStates(productSearchParsers)
  return [filters, setFilters] as const
}

// Sử dụng trong component:
const [filters, setFilters] = useProductQueryStates()
// URL: ?page=2&category=abc&sort_by=price&order=desc
// filters = {
//   page: 2,
//   limit: 20,
//   sort_by: 'price',
//   order: 'desc',
//   category: 'abc',
//   name: null,
//   ...
// }
```

### So sánh useQueryState vs useQueryStates

| Đặc điểm | useQueryState | useQueryStates |
|----------|---------------|----------------|
| Số params | 1 | Nhiều |
| Return type | `[value, setValue]` | `[object, setObject]` |
| Update | `setValue(newValue)` | `setFilters({ key: value })` |
| Use case | Status tabs, single filter | Complex filters, search pages |

---

## 6. Type Safety với inferParserType

nuqs cung cấp utility type `inferParserType` để tự động suy ra kiểu dữ liệu từ parsers:

```typescript
import { inferParserType } from 'nuqs'

export type ProductQueryConfig = inferParserType<typeof productSearchParsers>

// TypeScript tự động infer ra:
// {
//   page: number;                                    // always number (có default)
//   limit: number;                                   // always number (có default)
//   sort_by: 'createdAt' | 'view' | 'sold' | 'price'; // literal union (có default)
//   order: 'asc' | 'desc' | null;                   // nullable (không có default)
//   exclude: string | null;                         // nullable
//   name: string | null;                            // nullable
//   price_min: number | null;                       // nullable
//   price_max: number | null;                       // nullable
//   rating_filter: number | null;                   // nullable
//   category: string | null;                        // nullable
// }
```

### Lợi ích của Type Inference:

1. **Không cần định nghĩa type thủ công** - TypeScript tự động biết
2. **Sync với parsers** - Thay đổi parser = type tự động update
3. **IDE autocomplete** - Gợi ý chính xác các giá trị hợp lệ
4. **Compile-time errors** - Bắt lỗi sớm khi dùng sai type

---

## 7. createSerializer - Tạo URL từ params

`createSerializer` tạo một function để serialize object thành URL search string:

```typescript
import { createSerializer } from 'nuqs'

export const createProductSearchURL = createSerializer(productSearchParsers)

// Sử dụng:
const url = createProductSearchURL({
  page: 2,
  category: 'electronics',
  sort_by: 'price'
})
// Kết quả: "?page=2&category=electronics&sort_by=price"

// Với base URL:
const fullUrl = createProductSearchURL('/products', {
  page: 2,
  category: 'electronics'
})
// Kết quả: "/products?page=2&category=electronics"
```

### Use cases:

1. **Tạo link cho navigation**
2. **Share URL với filters**
3. **Programmatic navigation**
4. **SEO-friendly URLs**

---

## 8. normalizeProductQueryKey - Tích hợp với React Query

### Vấn đề cần giải quyết:

React Query sử dụng `queryKey` để cache và invalidate queries. Khi dùng nuqs, các giá trị đã được parse (number, literal types) cần được normalize về string để đảm bảo queryKey nhất quán.

### Implementation trong dự án:

```typescript
// src/hooks/nuqs/productSearchParams.ts

/**
 * Normalizes ProductQueryConfig values back to strings for TanStack Query key compatibility.
 * During the migration transition, this ensures queryKey format stays consistent
 * so existing cache entries (with string values) are still matched.
 * Can be removed after cache transition period (gcTime = 10 min).
 */
export function normalizeProductQueryKey(filters: ProductQueryConfig): Record<string, string | undefined> {
  return {
    page: String(filters.page),
    limit: String(filters.limit),
    sort_by: filters.sort_by,
    order: filters.order ?? undefined,
    exclude: filters.exclude ?? undefined,
    name: filters.name ?? undefined,
    price_min: filters.price_min != null ? String(filters.price_min) : undefined,
    price_max: filters.price_max != null ? String(filters.price_max) : undefined,
    rating_filter: filters.rating_filter != null ? String(filters.rating_filter) : undefined,
    category: filters.category ?? undefined
  }
}
```

### Sử dụng trong ProductList.tsx:

```typescript
import { useProductQueryStates, normalizeProductQueryKey } from 'src/hooks/nuqs'

const ProductList = () => {
  const [filters, setFilters] = useProductQueryStates()

  const { data: productsData } = useQuery({
    // queryKey sử dụng normalized values để đảm bảo cache consistency
    queryKey: ['products', normalizeProductQueryKey(filters)],
    queryFn: ({ signal }) => {
      return productApi.getProducts(filters as ProductListConfig, { signal })
    }
  })
}
```

### Tại sao cần normalize?

1. **Cache consistency** - Đảm bảo `{ page: 2 }` và `{ page: "2" }` match cùng cache entry
2. **Migration safety** - Không break cache cũ khi chuyển từ string sang typed values
3. **Predictable behavior** - QueryKey luôn có format nhất quán

---

## 9. Flow hoạt động chi tiết

### Ví dụ thực tế với URL đầy đủ:

```
User truy cập: /products?page=2&category=abc123&sort_by=price&order=desc
```

### Bước 1: URL → nuqs parsers

```typescript
// nuqs tự động parse từng param theo parser đã định nghĩa:
page: "2"       → parseAsInteger           → 2 (number)
category: "abc123" → parseAsString         → "abc123" (string)
sort_by: "price"   → parseAsStringLiteral  → "price" (literal type)
order: "desc"      → parseAsStringLiteral  → "desc" (literal type)
name: undefined    → parseAsString         → null (không có trong URL)
limit: undefined   → parseAsInteger.withDefault(20) → 20 (default value)
```

### Bước 2: nuqs → React Component

```typescript
const [filters, setFilters] = useProductQueryStates()

// filters object đã được parse và typed:
// {
//   page: 2,                    // number
//   limit: 20,                  // number (default)
//   sort_by: 'price',           // 'createdAt' | 'view' | 'sold' | 'price'
//   order: 'desc',              // 'asc' | 'desc' | null
//   category: 'abc123',         // string | null
//   name: null,                 // string | null
//   exclude: null,
//   price_min: null,
//   price_max: null,
//   rating_filter: null
// }
```

### Bước 3: React Component → React Query

```typescript
const { data } = useQuery({
  queryKey: ['products', normalizeProductQueryKey(filters)],
  // queryKey = ['products', {
  //   page: '2',
  //   limit: '20',
  //   sort_by: 'price',
  //   order: 'desc',
  //   category: 'abc123',
  //   name: undefined,
  //   ...
  // }]
  queryFn: ({ signal }) => productApi.getProducts(filters as ProductListConfig, { signal })
})
```

### Bước 4: React Query → API

```typescript
// productApi.getProducts() gọi API với params:
// GET /products?page=2&limit=20&sort_by=price&order=desc&category=abc123
```

### Bước 5: User thay đổi filter

```typescript
// User click "Sắp xếp theo: Bán chạy"
setFilters({ sort_by: 'sold' })

// Kết quả:
// 1. URL tự động update: /products?page=2&category=abc123&sort_by=sold&order=desc
// 2. filters object update → queryKey thay đổi
// 3. React Query tự động refetch vì queryKey khác
// 4. UI re-render với data mới
```

### Bước 6: User reset về trang 1 khi đổi category

```typescript
// User chọn category mới
setFilters({ page: 1, category: 'xyz789' })

// URL: /products?page=1&category=xyz789&sort_by=sold&order=desc
// Merge với state hiện tại, chỉ update page và category
```

---

## 10. So sánh: Trước và Sau khi dùng nuqs

### TRƯỚC (useSearchParams từ React Router):

```typescript
import { useSearchParams } from 'react-router-dom'

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Phải parse thủ công từng param
  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 20
  const sort_by = searchParams.get('sort_by') || 'createdAt'
  const order = searchParams.get('order')  // string | null
  const category = searchParams.get('category')
  const name = searchParams.get('name')
  const price_min = searchParams.get('price_min')
    ? Number(searchParams.get('price_min'))
    : undefined
  const price_max = searchParams.get('price_max')
    ? Number(searchParams.get('price_max'))
    : undefined
  const rating_filter = searchParams.get('rating_filter')
    ? Number(searchParams.get('rating_filter'))
    : undefined
  const exclude = searchParams.get('exclude')

  // Không có type safety cho sort_by - có thể là bất kỳ string nào
  // Dễ bug khi quên parse number
  // Phải tự handle default values

  // Update cũng phức tạp
  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage))
      return prev
    })
  }
}
```

**Vấn đề:**
- ❌ ~30 dòng code chỉ để parse params
- ❌ Không có type safety
- ❌ Dễ quên parse, dễ bug
- ❌ Phải tự handle default values
- ❌ Update URL phức tạp

### SAU (nuqs):

```typescript
import { useProductQueryStates } from 'src/hooks/nuqs'

const ProductList = () => {
  const [filters, setFilters] = useProductQueryStates()

  // Tất cả đã được parse và typed sẵn!
  // filters.page → number (auto-parsed, có default)
  // filters.sort_by → 'createdAt' | 'view' | 'sold' | 'price' (type-safe)
  // filters.category → string | null (nullable)
  // filters.price_min → number | null

  // Update đơn giản
  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage })
  }

  // TypeScript báo lỗi nếu dùng sai
  // setFilters({ sort_by: 'invalid' })  // ❌ Error: Type '"invalid"' is not assignable
  // setFilters({ page: 'abc' })         // ❌ Error: Type 'string' is not assignable to 'number'
}
```

**Lợi ích:**
- ✅ 1 dòng code để có tất cả params
- ✅ Full type safety
- ✅ Không thể quên parse
- ✅ Default values tự động
- ✅ Update URL đơn giản

---

## 11. Các nơi sử dụng nuqs trong dự án

### 1. ProductList.tsx - 10 params

**File:** `src/pages/ProductList/ProductList.tsx`

**Params quản lý:**
| Param | Parser | Default | Mô tả |
|-------|--------|---------|-------|
| `page` | parseAsInteger | 1 | Trang hiện tại |
| `limit` | parseAsInteger | 20 | Số sản phẩm/trang |
| `sort_by` | parseAsStringLiteral | 'createdAt' | Sắp xếp theo |
| `order` | parseAsStringLiteral | null | Thứ tự (asc/desc) |
| `exclude` | parseAsString | null | Loại trừ product ID |
| `name` | parseAsString | null | Tìm theo tên |
| `price_min` | parseAsInteger | null | Giá tối thiểu |
| `price_max` | parseAsInteger | null | Giá tối đa |
| `rating_filter` | parseAsInteger | null | Lọc theo rating |
| `category` | parseAsString | null | Lọc theo category |

**Code:**
```typescript
import { useProductQueryStates, normalizeProductQueryKey } from 'src/hooks/nuqs'

const ProductList = () => {
  const [filters, setFilters] = useProductQueryStates()

  const { data: productsData } = useQuery({
    queryKey: ['products', normalizeProductQueryKey(filters)],
    queryFn: ({ signal }) => productApi.getProducts(filters as ProductListConfig, { signal })
  })
  // ...
}
```

### 2. HistoryPurchases.tsx - 1 param

**File:** `src/pages/User/pages/HistoryPurchases/HistoryPurchases.tsx`

**Param quản lý:**
| Param | Parser | Default | Mô tả |
|-------|--------|---------|-------|
| `status` | parseAsInteger | 0 | Trạng thái đơn hàng (0=all, 1=pending, ...) |

**Code:**
```typescript
import { usePurchaseStatus } from 'src/hooks/nuqs'

const HistoryPurchases = () => {
  const [status, setStatus] = usePurchaseStatus() // nuqs: typed integer, default 0 (all)

  const { data: purchasesInCartData } = useQuery({
    queryKey: ['purchases', { status }],
    // ...
  })
  // ...
}
```

### 3. OrderList.tsx - 1 param

**File:** `src/pages/User/pages/OrderList/OrderList.tsx`

**Param quản lý:**
| Param | Parser | Default | Mô tả |
|-------|--------|---------|-------|
| `status` | parseAsInteger | 0 | Trạng thái order (0=all, 1=pending, ...) |

**Code:**
```typescript
import { useOrderStatus } from 'src/hooks/nuqs/orderSearchParams'

export default function OrderList() {
  const [activeTab, setActiveTab] = useOrderStatus() // nuqs: syncs numeric status with URL query param
  // ...
}
```

---

## 12. Lợi ích chính của nuqs

### 1. Type Safety
TypeScript tự động infer type từ parser. Không thể gán sai kiểu dữ liệu.

```typescript
const [filters, setFilters] = useProductQueryStates()
filters.page      // number (không phải string | null)
filters.sort_by   // 'createdAt' | 'view' | 'sold' | 'price'
```

### 2. Default Values
Không cần check null/undefined. Parser với `.withDefault()` luôn trả về giá trị.

```typescript
parseAsInteger.withDefault(1)  // Luôn trả về number, không bao giờ null
```

### 3. URL Sync
State tự động sync với URL. Thay đổi state = URL update, và ngược lại.

```typescript
setFilters({ page: 2 })  // URL tự động update thành ?page=2
```

### 4. Shareable URLs
User có thể share URL với filter. Người nhận sẽ thấy đúng kết quả filter.

```
https://shopee.com/products?category=electronics&sort_by=price&order=asc
```

### 5. Back/Forward Navigation
Browser history hoạt động đúng. Back button = quay lại filter trước đó.

### 6. SSR Ready
nuqs hỗ trợ server-side rendering. Có thể đọc params từ URL trên server.

### 7. Automatic Serialization
Tự động serialize/deserialize. Không cần `String()` hay `Number()`.

```typescript
// nuqs tự động:
// URL "?page=2" → filters.page = 2 (number)
// setFilters({ page: 3 }) → URL "?page=3"
```

### 8. React Query Integration
Dễ dàng tích hợp làm query key với `normalizeProductQueryKey()`.

```typescript
queryKey: ['products', normalizeProductQueryKey(filters)]
// Cache tự động invalidate khi filters thay đổi
```

---

## Tổng kết

nuqs là một thư viện mạnh mẽ giúp quản lý URL search params trong React với:
- **Type safety** hoàn toàn
- **Developer experience** tuyệt vời
- **Tích hợp** dễ dàng với React Query
- **Giảm boilerplate** đáng kể

Trong dự án Shopee Clone, nuqs được sử dụng để quản lý:
- **Product filters** (10 params) - trang danh sách sản phẩm
- **Purchase status** (1 param) - lịch sử mua hàng
- **Order status** (1 param) - danh sách đơn hàng

Việc sử dụng nuqs giúp code clean hơn, ít bug hơn, và dễ maintain hơn so với cách truyền thống sử dụng `useSearchParams` từ React Router.

