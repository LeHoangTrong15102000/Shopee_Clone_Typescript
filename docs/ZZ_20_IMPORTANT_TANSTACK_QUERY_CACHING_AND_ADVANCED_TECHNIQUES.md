# TanStack Query - Cơ Chế Caching và Các Kỹ Thuật Nâng Cao

## 1. Phân Tích Chi Tiết Cơ Chế Caching

### 1.1 Các Khái Niệm Cốt Lõi

#### A. `staleTime` (Thời gian dữ liệu được coi là "tươi")

- **Default**: `0` ms (tức là ngay lập tức coi là cũ)
- **Mục đích**: Xác định khoảng thời gian mà dữ liệu được coi là "fresh" (tươi)
- **Hoạt động**:
  - Khi dữ liệu vẫn còn "fresh", TanStack Query sẽ trả về data từ cache mà không gọi API
  - Khi dữ liệu trở thành "stale", sẽ kích hoạt refetch trong các điều kiện nhất định

```typescript
// Ví dụ: Dữ liệu sẽ được coi là "fresh" trong 5 phút
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 5 * 60 * 1000 // 5 phút
})
```

#### B. `gcTime` (Garbage Collection Time - trước đây là `cacheTime`)

- **Default**: `5 phút` (300,000 ms)
- **Mục đích**: Thời gian dữ liệu sẽ được giữ trong cache sau khi không còn observer nào sử dụng
- **Hoạt động**:
  - Chỉ bắt đầu đếm ngược khi query trở thành "inactive" (không còn component nào subscribe)
  - Sau khi hết thời gian, dữ liệu sẽ bị xóa khỏi memory

```typescript
// Ví dụ: Giữ dữ liệu trong cache 10 phút sau khi không sử dụng
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  gcTime: 10 * 60 * 1000 // 10 phút
})
```

#### C. Trạng thái `inactive`

- Xảy ra khi không còn component nào subscribe đến query đó
- Lúc này `gcTime` bắt đầu đếm ngược
- Nếu có component mới subscribe trước khi `gcTime` hết, dữ liệu sẽ được sử dụng lại ngay lập tức

### 1.2 Vòng Đời Cache (Cache Lifecycle)

```typescript
// Kịch bản chi tiết:
function ComponentA() {
  const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
}

function ComponentB() {
  const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
}

function ComponentC() {
  const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
}
```

**Bước 1**: ComponentA mount

- Không có cache cho `['todos']` → gọi API
- Khi fetch xong → lưu vào cache với key `['todos']`
- Đánh dấu data là `stale` ngay lập tức (do staleTime = 0)

**Bước 2**: ComponentB mount

- Cache `['todos']` đã tồn tại → trả về ngay lập tức
- Do data đã `stale` → gọi API ngầm (background refetch)
- Cả ComponentA và ComponentB đều được update với data mới

**Bước 3**: ComponentA và B unmount

- Query `['todos']` trở thành `inactive`
- Bắt đầu đếm ngược `gcTime` (5 phút)

**Bước 4**: ComponentC mount (trong vòng 5 phút)

- Trả về cached data ngay lập tức
- Chạy fetchTodos ngầm và update

**Bước 5**: ComponentC unmount

- Nếu không có component nào sử dụng trong 5 phút tiếp theo
- Cache `['todos']` bị xóa hoàn toàn

### 1.3 Sự Khác Biệt Giữa `status` và `fetchStatus`

#### `status` - Trạng thái của data

- `pending`: Chưa có data
- `error`: Có lỗi xảy ra
- `success`: Có data thành công

#### `fetchStatus` - Trạng thái của việc fetch

- `fetching`: Đang gọi API
- `paused`: Muốn fetch nhưng bị tạm dừng
- `idle`: Không làm gì cả

```typescript
const { data, status, fetchStatus, isLoading, isFetching } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos
})

// Các trường hợp có thể xảy ra:
// status: 'success', fetchStatus: 'fetching' → Có data cũ, đang fetch data mới
// status: 'pending', fetchStatus: 'fetching' → Chưa có data, đang fetch lần đầu
// status: 'success', fetchStatus: 'idle' → Có data, không fetch
```

## 2. Sự Khác Biệt Giữa TanStack Query v4 và v5

### 2.1 Thay Đổi Về Caching

#### A. Đổi tên `cacheTime` thành `gcTime`

```typescript
// v4
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  cacheTime: 5 * 60 * 1000 // ❌ Không còn sử dụng
})

// v5
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  gcTime: 5 * 60 * 1000 // ✅ Tên mới, rõ ràng hơn
})
```

#### B. Thay đổi `keepPreviousData` thành `placeholderData`

```typescript
// v4
useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetchTodos(page),
  keepPreviousData: true // ❌ Bị loại bỏ
})

// v5
import { keepPreviousData } from '@tanstack/react-query'

useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetchTodos(page),
  placeholderData: keepPreviousData // ✅ Cách mới
})
```

#### C. Thay đổi trạng thái loading

```typescript
// v4
const { isLoading, isInitialLoading } = useQuery(...)

// v5
const { isPending, isLoading } = useQuery(...)
// isPending: thay thế isLoading cũ
// isLoading: bây giờ là isPending && isFetching
```

### 2.2 Cải Tiến API

#### A. Unified Object Syntax

```typescript
// v4 - Nhiều cách gọi
useQuery(['todos'], fetchTodos, options)
useQuery({ queryKey: ['todos'], queryFn: fetchTodos, ...options })

// v5 - Chỉ có một cách
useQuery({ queryKey: ['todos'], queryFn: fetchTodos, ...options })
```

#### B. Loại bỏ callbacks từ useQuery

```typescript
// v4
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  onSuccess: (data) => {}, // ❌ Bị loại bỏ
  onError: (error) => {}, // ❌ Bị loại bỏ
  onSettled: () => {} // ❌ Bị loại bỏ
})

// v5 - Sử dụng useEffect thay thế
const { data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos
})

useEffect(() => {
  if (data) {
    // Handle success
  }
}, [data])

useEffect(() => {
  if (error) {
    // Handle error
  }
}, [error])
```

## 3. Các Kỹ Thuật Nâng Cao

### 3.1 Optimistic Updates (Cập Nhật Lạc Quan)

#### A. Optimistic Updates Truyền Thống (Cache Manipulation)

```typescript
const updateTodoMutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Hủy các query đang chạy
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // Lưu data cũ để rollback nếu cần
    const previousTodos = queryClient.getQueryData(['todos'])

    // Cập nhật cache lạc quan
    queryClient.setQueryData(['todos'], (old) => old.map((todo) => (todo.id === newTodo.id ? newTodo : todo)))

    return { previousTodos }
  },
  onError: (err, newTodo, context) => {
    // Rollback nếu có lỗi
    queryClient.setQueryData(['todos'], context.previousTodos)
  },
  onSettled: () => {
    // Luôn invalidate để đảm bảo data đồng bộ
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }
})
```

#### B. Simplified Optimistic Updates (v5)

```typescript
const addTodoMutation = useMutation({
  mutationFn: (newTodo: string) => axios.post('/api/todos', { text: newTodo }),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})

// Trong UI
{addTodoMutation.isPending && (
  <li style={{ opacity: 0.5 }}>
    {addTodoMutation.variables} {/* Hiển thị data đang được gửi */}
  </li>
)}
```

### 3.2 Query Cancellation (Hủy Query)

```typescript
const fetchTodos = async ({ signal }: { signal?: AbortSignal }) => {
  const response = await fetch('/api/todos', { signal })
  return response.json()
}

const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos
})

// TanStack Query tự động hủy request khi:
// - Component unmount
// - Query key thay đổi
// - Có request mới cho cùng query key
```

### 3.3 Scroll Restoration (Khôi Phục Vị Trí Cuộn)

```typescript
import { useScrollRestoration } from '@tanstack/react-query'

function TodoList() {
  useScrollRestoration('todo-list')

  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  return (
    <div>
      {data?.map(todo => <TodoItem key={todo.id} todo={todo} />)}
    </div>
  )
}
```

### 3.4 Filters (Lọc Queries)

```typescript
// Invalidate tất cả queries bắt đầu với 'todos'
queryClient.invalidateQueries({
  queryKey: ['todos'],
  exact: false // Lọc tất cả queries có prefix 'todos'
})

// Invalidate chỉ query chính xác
queryClient.invalidateQueries({
  queryKey: ['todos', 'list'],
  exact: true // Chỉ query có key chính xác này
})

// Sử dụng predicate function
queryClient.invalidateQueries({
  predicate: (query) => {
    return query.queryKey[0] === 'todos' && query.queryKey[1] === 'detail'
  }
})
```

### 3.5 Performance & Request Waterfalls

#### A. Parallel Queries

```typescript
function Dashboard() {
  // Chạy song song
  const todosQuery = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects })

  if (todosQuery.isLoading || usersQuery.isLoading || projectsQuery.isLoading) {
    return <Loading />
  }

  return <DashboardContent />
}
```

#### B. Dependent Queries

```typescript
function UserProfile({ userId }: { userId: string }) {
  const userQuery = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  })

  const postsQuery = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!userQuery.data, // Chỉ chạy khi có user data
  })

  return <div>...</div>
}
```

### 3.6 Prefetching & Router Integration

#### A. Prefetching trong Component

```typescript
function TodosPage() {
  const queryClient = useQueryClient()

  const prefetchTodoDetail = (todoId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['todos', todoId],
      queryFn: () => fetchTodoDetail(todoId),
      staleTime: 10 * 1000, // 10 giây
    })
  }

  return (
    <div>
      {todos.map(todo => (
        <Link
          key={todo.id}
          to={`/todos/${todo.id}`}
          onMouseEnter={() => prefetchTodoDetail(todo.id)}
        >
          {todo.title}
        </Link>
      ))}
    </div>
  )
}
```

#### B. Router Integration với Next.js

```typescript
// app/todos/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

export default async function TodosPage() {
  const queryClient = new QueryClient()

  // Prefetch trên server
  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodosList />
    </HydrationBoundary>
  )
}
```

### 3.7 Server Rendering & Hydration

#### A. SSR Setup

```typescript
// _app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 phút
        retry: false, // Không retry trên server
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
```

#### B. Hydration Boundary

```typescript
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

// Trên server
const dehydratedState = dehydrate(queryClient)

// Trên client
return (
  <HydrationBoundary state={dehydratedState}>
    <App />
  </HydrationBoundary>
)
```

### 3.8 Advanced Server Rendering

#### A. Streaming với React 18

```typescript
// app/layout.tsx
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {children}
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  )
}
```

#### B. Server Components Integration

```typescript
// app/todos/page.tsx
import { useSuspenseQuery } from '@tanstack/react-query'

async function TodosServerComponent() {
  // Chạy trên server
  const todos = await fetchTodos()

  return <TodosClientComponent initialData={todos} />
}

function TodosClientComponent({ initialData }: { initialData: Todo[] }) {
  const { data } = useSuspenseQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    initialData,
  })

  return <div>{/* Render todos */}</div>
}
```

### 3.9 Caching Strategies

#### A. Stale-While-Revalidate

```typescript
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 5 * 60 * 1000, // 5 phút
  gcTime: 10 * 60 * 1000 // 10 phút
})
```

#### B. Cache-First

```typescript
useQuery({
  queryKey: ['static-data'],
  queryFn: fetchStaticData,
  staleTime: Infinity, // Không bao giờ cũ
  gcTime: Infinity // Không bao giờ xóa
})
```

#### C. Network-First

```typescript
useQuery({
  queryKey: ['real-time-data'],
  queryFn: fetchRealTimeData,
  staleTime: 0, // Luôn cũ
  gcTime: 0, // Xóa ngay khi không dùng
  refetchInterval: 1000 // Refetch mỗi giây
})
```

### 3.10 Render Optimizations

#### A. Select Data Transformation

```typescript
const { data: todoTitles } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (data) => data.map((todo) => todo.title) // Chỉ re-render khi titles thay đổi
})
```

#### B. Memoization

```typescript
const memoizedQueryOptions = useMemo(
  () => ({
    queryKey: ['todos', filter, sort],
    queryFn: () => fetchTodos(filter, sort),
    staleTime: 5 * 60 * 1000
  }),
  [filter, sort]
)

const { data } = useQuery(memoizedQueryOptions)
```

### 3.11 Default Query Function

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey, signal }) => {
        const url = Array.isArray(queryKey) ? queryKey.join('/') : queryKey
        const response = await fetch(`/api/${url}`, { signal })
        if (!response.ok) throw new Error('Network response was not ok')
        return response.json()
      }
    }
  }
})

// Sử dụng
const { data } = useQuery({ queryKey: ['todos'] }) // Tự động gọi /api/todos
const { data } = useQuery({ queryKey: ['users', userId] }) // Tự động gọi /api/users/userId
```

### 3.12 Suspense Support

#### A. useSuspenseQuery (v5)

```typescript
function TodosList() {
  // Data luôn có giá trị, không bao giờ undefined
  const { data } = useSuspenseQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

// Wrap với Suspense boundary
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <TodosList />
    </Suspense>
  )
}
```

#### B. Error Boundaries

```typescript
import { QueryErrorResetBoundary } from '@tanstack/react-query'

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <div>
              There was an error!
              <button onClick={resetErrorBoundary}>Try again</button>
            </div>
          )}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <TodosList />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

## 4. Áp Dụng Vào Dự Án Shopee Clone

### 4.1 Cấu Hình QueryClient Tối Ưu

```typescript
// src/contexts/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút
      gcTime: 10 * 60 * 1000, // 10 phút
      retry: (failureCount, error) => {
        if (error?.status === 404) return false
        return failureCount < 3
      },
      refetchOnWindowFocus: false // Tắt refetch khi focus window
    },
    mutations: {
      retry: 1
    }
  }
})
```

### 4.2 Prefetching Cho Product Details

```typescript
// src/pages/ProductList/components/Product/Product.tsx
function Product({ product }: { product: Product }) {
  const queryClient = useQueryClient()

  const prefetchProductDetail = () => {
    queryClient.prefetchQuery({
      queryKey: ['product', product.id],
      queryFn: () => productApi.getProductDetail(product.id),
      staleTime: 10 * 60 * 1000, // 10 phút
    })
  }

  return (
    <Link
      to={`/products/${product.id}`}
      onMouseEnter={prefetchProductDetail}
      onFocus={prefetchProductDetail}
    >
      <ProductCard product={product} />
    </Link>
  )
}
```

### 4.3 Optimistic Updates Cho Cart

```typescript
// src/hooks/optimistic/cart/useOptimisticAddToCart.ts
export const useOptimisticAddToCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: purchasesApi.addToCart,
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: ['purchases', { status: purchaseStatus.inCart }] })

      const previousPurchases = queryClient.getQueryData(['purchases', { status: purchaseStatus.inCart }])

      // Optimistic update
      queryClient.setQueryData(['purchases', { status: purchaseStatus.inCart }], (old: any) => {
        if (old) {
          return {
            ...old,
            data: [...old.data, { ...body, id: Date.now() }] // Temporary ID
          }
        }
        return old
      })

      return { previousPurchases }
    },
    onError: (err, variables, context) => {
      if (context?.previousPurchases) {
        queryClient.setQueryData(['purchases', { status: purchaseStatus.inCart }], context.previousPurchases)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
    }
  })
}
```

### 4.4 Infinite Scrolling Với maxPages

```typescript
// src/hooks/useInfiniteProducts.ts
export const useInfiniteProducts = (config: ProductListConfig) => {
  return useInfiniteQuery({
    queryKey: ['products', config],
    queryFn: ({ pageParam = 1 }) => productApi.getProducts({ ...config, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1
      return nextPage <= lastPage.data.pagination.page_size ? nextPage : undefined
    },
    maxPages: 5, // Giới hạn 5 trang để tối ưu memory
    staleTime: 2 * 60 * 1000 // 2 phút
  })
}
```

### 4.5 Background Sync Cho User Profile

```typescript
// src/pages/User/pages/Profile/Profile.tsx
function Profile() {
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getProfile,
    staleTime: 30 * 1000, // 30 giây
    refetchInterval: 5 * 60 * 1000, // Sync mỗi 5 phút
    refetchIntervalInBackground: true
  })

  // ...
}
```

## 5. Kết Luận và Khuyến Nghị

### 5.1 Best Practices

1. **Đặt staleTime phù hợp**: Không để mặc định 0, nên set ít nhất 1-5 phút
2. **Sử dụng select để tối ưu re-render**: Chỉ select data cần thiết
3. **Prefetch các route quan trọng**: Cải thiện UX
4. **Implement proper error handling**: Sử dụng Error Boundaries
5. **Monitor performance**: Sử dụng React DevTools và TanStack Query DevTools

### 5.2 Lưu Ý Khi Migrate Lên v5

1. **Cập nhật syntax**: Sử dụng object syntax cho tất cả hooks
2. **Thay đổi naming**: `cacheTime` → `gcTime`, `isLoading` → `isPending`
3. **Remove callbacks**: Thay bằng useEffect
4. **Update TypeScript**: Yêu cầu TS 4.7+
5. **Test thoroughly**: Kiểm tra kỹ behavior changes

### 5.3 Performance Tips

1. **Sử dụng structural sharing**: Mặc định đã enable, giữ nguyên
2. **Implement proper query key structure**: Consistent và predictable
3. **Use query filters effectively**: Invalidate và refetch chính xác
4. **Consider data transformation**: Sử dụng select function
5. **Monitor bundle size**: TanStack Query v5 nhỏ hơn 20% so với v4

TanStack Query v5 mang lại nhiều cải tiến đáng kể về performance, DX và consistency. Việc hiểu rõ cơ chế caching và áp dụng đúng các kỹ thuật nâng cao sẽ giúp xây dựng ứng dụng có hiệu suất cao và UX tốt.
