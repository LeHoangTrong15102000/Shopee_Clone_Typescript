# TanStack Query - Hiểu Sâu Về Cơ Chế Caching

## 1. Tổng Quan Về Caching Trong TanStack Query

### 1.1 Tại Sao Caching Quan Trọng?

TanStack Query không chỉ là một thư viện để fetch data, mà còn là một **hệ thống quản lý state phức tạp** với cơ chế caching thông minh. Caching giúp:

- **Giảm số lượng request không cần thiết** đến server
- **Cải thiện performance** bằng cách trả về data từ memory
- **Tạo UX mượt mà** với instant loading cho data đã có
- **Đồng bộ data** giữa các component khác nhau

### 1.2 Kiến Trúc Cache Của TanStack Query

```
┌─────────────────────────────────────────────────────────────────┐
│                        QueryClient                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Query Cache   │  │  Mutation Cache │  │  Observer List  │  │
│  │                 │  │                 │  │                 │  │
│  │ ['todos'] → {   │  │ addTodo → {     │  │ Component A     │  │
│  │   data: [...],  │  │   status,       │  │ Component B     │  │
│  │   status,       │  │   variables     │  │ Component C     │  │
│  │   staleTime,    │  │ }               │  │                 │  │
│  │   gcTime        │  │                 │  │                 │  │
│  │ }               │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Các Khái Niệm Cốt Lõi

### 2.1 `staleTime` - Thời Gian "Tươi" Của Data

**Định nghĩa**: Khoảng thời gian mà data được coi là "fresh" (tươi) và không cần fetch lại.

```typescript
// Ví dụ minh họa
const { data } = useQuery({
  queryKey: ['user-profile'],
  queryFn: fetchUserProfile,
  staleTime: 5 * 60 * 1000 // 5 phút
})
```

**Cách hoạt động chi tiết**:

```
Thời gian →  0s    30s   1m    2m    3m    4m    5m    6m    7m
            │     │     │     │     │     │     │     │     │
Data fetch  ●─────┼─────┼─────┼─────┼─────┼─────●─────┼─────┼
Status      │◄────────── FRESH ──────────►│◄─── STALE ────►│
            │                             │                 │
            │                             │                 │
Component   │  Trả về cache ngay lập tức  │  Trả về cache + │
Request     │  KHÔNG gọi API              │  gọi API ngầm   │
```

**Các giá trị phổ biến**:

- `0` (mặc định): Data ngay lập tức trở thành stale
- `5 * 60 * 1000`: 5 phút - phù hợp cho user profile
- `60 * 60 * 1000`: 1 giờ - phù hợp cho static data
- `Infinity`: Không bao giờ stale - cho data không thay đổi

### 2.2 `gcTime` (Garbage Collection Time)

**Định nghĩa**: Thời gian data được giữ trong cache sau khi không còn component nào sử dụng.

```typescript
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  gcTime: 10 * 60 * 1000 // 10 phút
})
```

**Vòng đời chi tiết**:

```
Component Lifecycle:   Mount ────────────────── Unmount ────────── Mount
                         │                        │                 │
Query Status:           Active ──────────────── Inactive ────── Active
                         │                        │                 │
Cache Status:           In Use ──────────────── GC Timer ─────── In Use
                         │                        │                 │
                         │                        │◄─ 10 phút ─►   │
                         │                        │                 │
                         │                     Nếu không          │
                         │                     có component       │
                         │                     nào mount          │
                         │                        │                 │
                         │                    ● DELETED           │
```

### 2.3 Query States (Trạng Thái Query)

TanStack Query có **hai hệ thống trạng thái độc lập**:

#### A. `status` - Trạng thái của data

```typescript
type QueryStatus = 'pending' | 'error' | 'success'
```

#### B. `fetchStatus` - Trạng thái của việc fetch

```typescript
type FetchStatus = 'fetching' | 'paused' | 'idle'
```

**Ma trận trạng thái**:

| status  | fetchStatus | Ý nghĩa                              | Hiển thị UI          |
| ------- | ----------- | ------------------------------------ | -------------------- |
| pending | fetching    | Lần đầu fetch, chưa có data          | Loading spinner      |
| pending | idle        | Chưa có data, không fetch (disabled) | Nothing              |
| success | fetching    | Có data cũ, đang fetch data mới      | Data + loading badge |
| success | idle        | Có data, không fetch                 | Data only            |
| error   | fetching    | Có lỗi, đang retry                   | Error + loading      |
| error   | idle        | Có lỗi, không retry                  | Error message        |

## 3. Cơ Chế Caching Chi Tiết

### 3.1 Cache Key System

TanStack Query sử dụng **hierarchical key system**:

```typescript
// Các ví dụ về query key
;['todos'][('todos', 'list')][('todos', 'detail', 123)][('todos', { status: 'completed', page: 1 })] // Tất cả todos // Danh sách todos // Chi tiết todo với ID 123 // Todos với filter
```

**Cách TanStack Query so sánh keys**:

```typescript
// Sử dụng deep equality
JSON.stringify(['todos', { page: 1, status: 'active' }]) === JSON.stringify(['todos', { status: 'active', page: 1 }])
// → true (thứ tự không quan trọng trong object)
```

### 3.2 Cache Lookup Process

Khi component gọi `useQuery`, TanStack Query thực hiện:

```
1. Tính toán query key
   ↓
2. Tìm kiếm trong cache
   ↓
3a. Cache HIT (có data)        3b. Cache MISS (không có data)
    ↓                              ↓
4a. Kiểm tra staleTime         4b. Tạo query mới
    ↓                              ↓
5a. Fresh? → Trả về ngay      5b. Fetch từ server
5b. Stale? → Trả về + fetch ngầm   ↓
    ↓                          6b. Lưu vào cache
6a. Update cache khi có data mới   ↓
    ↓                          7b. Notify observers
7a. Notify observers
```

### 3.3 Observer Pattern

TanStack Query sử dụng **Observer Pattern** để đồng bộ data:

```typescript
// Khi có 3 component cùng sử dụng một query
function ComponentA() {
  const { data } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
  // Observer A được đăng ký
}

function ComponentB() {
  const { data } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
  // Observer B được đăng ký
}

function ComponentC() {
  const { data } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
  // Observer C được đăng ký
}
```

**Khi data thay đổi**:

```
Server Response → Query Cache → Notify All Observers → Re-render Components
                     ↓
                ['todos'] = {
                  data: newData,
                  observers: [A, B, C]
                }
```

## 4. Các Tình Huống Caching Thực Tế

### 4.1 Scenario 1: Component Mount/Unmount

```typescript
// Timeline: Component lifecycle và cache behavior
const timeline = `
T0: ComponentA mount
    → Cache miss → Fetch API → Cache data
    → Query status: active
    
T1: ComponentB mount (cùng query key)
    → Cache hit → Trả về data ngay lập tức
    → Nếu data stale → Background refetch
    → Query có 2 observers
    
T2: ComponentA unmount
    → Query còn 1 observer (ComponentB)
    → Query vẫn active
    
T3: ComponentB unmount
    → Query không còn observer
    → Query status: inactive
    → Bắt đầu đếm gcTime
    
T4: ComponentC mount (trong thời gian gcTime)
    → Cache hit → Trả về data ngay lập tức
    → Query status: active lại
    
T5: ComponentC unmount + hết gcTime
    → Cache bị xóa hoàn toàn
`
```

### 4.2 Scenario 2: Background Refetch

```typescript
// Khi nào background refetch xảy ra?
const backgroundRefetchTriggers = {
  windowFocus: 'Khi user focus lại tab/window',
  networkReconnect: 'Khi mạng được kết nối lại',
  intervalRefetch: 'Theo refetchInterval được set',
  manualInvalidate: 'Khi gọi queryClient.invalidateQueries()'
}

// Ví dụ chi tiết
function TodoList() {
  const { data, isFetching } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    staleTime: 1 * 60 * 1000, // 1 phút
    refetchOnWindowFocus: true
  })

  // Khi user chuyển tab rồi quay lại:
  // - Nếu data chưa stale (< 1 phút): Không refetch
  // - Nếu data đã stale (> 1 phút): Background refetch, isFetching = true

  return (
    <div>
      {data?.map(todo => <TodoItem key={todo.id} todo={todo} />)}
      {isFetching && <div className="loading-badge">Updating...</div>}
    </div>
  )
}
```

### 4.3 Scenario 3: Parallel Queries

```typescript
function Dashboard() {
  // 3 queries chạy song song, mỗi query có cache riêng
  const todosQuery = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos
  })

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  })

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  })

  // Cache structure:
  // {
  //   'todos': { data: [...], status: 'success', ... },
  //   'users': { data: [...], status: 'success', ... },
  //   'projects': { data: [...], status: 'success', ... }
  // }
}
```

## 5. Advanced Caching Strategies

### 5.1 Structural Sharing

TanStack Query sử dụng **structural sharing** để tối ưu re-render:

```typescript
// Khi server trả về data mới
const oldData = [
  { id: 1, title: 'Todo 1', completed: false },
  { id: 2, title: 'Todo 2', completed: false }
]

const newData = [
  { id: 1, title: 'Todo 1', completed: false }, // Không thay đổi
  { id: 2, title: 'Todo 2 Updated', completed: true } // Thay đổi
]

// TanStack Query sẽ:
// - Giữ nguyên object với id: 1 (reference không đổi)
// - Tạo object mới cho id: 2
// - Component chỉ re-render nếu sử dụng item id: 2
```

### 5.2 Select Function

```typescript
// Tối ưu re-render với select
const { data: completedTodos } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (data) => data.filter((todo) => todo.completed)
  // Component chỉ re-render khi danh sách completed todos thay đổi
  // Không re-render khi các todo khác thay đổi
})
```

### 5.3 Query Invalidation

```typescript
// Chiến lược invalidation thông minh
const queryClient = useQueryClient()

// Invalidate tất cả queries bắt đầu với 'todos'
queryClient.invalidateQueries({
  queryKey: ['todos'],
  exact: false // Sẽ invalidate: ['todos'], ['todos', 'list'], ['todos', 'detail', 123]
})

// Invalidate chính xác một query
queryClient.invalidateQueries({
  queryKey: ['todos', 'detail', 123],
  exact: true // Chỉ invalidate query này
})

// Invalidate với predicate function
queryClient.invalidateQueries({
  predicate: (query) => {
    return query.queryKey[0] === 'todos' && query.queryKey[1] === 'detail' && query.queryKey[2] > 100
  }
})
```

## 6. Memory Management

### 6.1 Cache Size Control

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000, // 5 phút
      staleTime: 1 * 60 * 1000 // 1 phút
    }
  }
})

// Với 1000 queries, mỗi query 10KB data:
// - Active queries: Unlimited (đang sử dụng)
// - Inactive queries: Tối đa 5 phút * số lượng = có thể rất lớn
// - Cần monitor memory usage trong production
```

### 6.2 Manual Cache Management

```typescript
// Xóa cache thủ công
queryClient.removeQueries({ queryKey: ['todos'] })

// Clear toàn bộ cache
queryClient.clear()

// Set data thủ công
queryClient.setQueryData(['todos'], newTodosData)

// Get data từ cache
const cachedTodos = queryClient.getQueryData(['todos'])
```

## 7. Performance Optimizations

### 7.1 Query Key Best Practices

```typescript
// ❌ Không tốt - key không consistent
const { data } = useQuery({
  queryKey: ['todos', Math.random()], // Key luôn thay đổi
  queryFn: fetchTodos
})

// ✅ Tốt - key stable và meaningful
const { data } = useQuery({
  queryKey: ['todos', { status, page, sortBy }],
  queryFn: () => fetchTodos({ status, page, sortBy })
})
```

### 7.2 Memoization

```typescript
// Memoize query options để tránh re-create
const queryOptions = useMemo(
  () => ({
    queryKey: ['todos', filters],
    queryFn: () => fetchTodos(filters),
    staleTime: 5 * 60 * 1000
  }),
  [filters]
)

const { data } = useQuery(queryOptions)
```

## 8. Debugging Cache

### 8.1 DevTools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
```

### 8.2 Cache Inspection

```typescript
// Inspect cache programmatically
const queryCache = queryClient.getQueryCache()
const allQueries = queryCache.getAll()

console.log(
  'Current cache:',
  allQueries.map((query) => ({
    key: query.queryKey,
    data: query.state.data,
    status: query.state.status,
    observersCount: query.observers.length
  }))
)
```

## 9. Kết Luận

### 9.1 Key Takeaways

1. **Cache là trái tim của TanStack Query**: Hiểu cache = hiểu TanStack Query
2. **staleTime vs gcTime**: Hai khái niệm khác nhau, phục vụ mục đích khác nhau
3. **Observer Pattern**: Cho phép đồng bộ data giữa nhiều component
4. **Structural Sharing**: Tối ưu performance tự động
5. **Memory Management**: Cần cân nhắc trong ứng dụng lớn

### 9.2 Best Practices Summary

- Set `staleTime` phù hợp với tính chất data (không để mặc định 0)
- Sử dụng `select` để tối ưu re-render
- Thiết kế query key hierarchy thông minh
- Monitor memory usage trong production
- Sử dụng DevTools để debug cache behavior

TanStack Query không chỉ là thư viện fetch data, mà là một **hệ thống quản lý state client-side** với cơ chế caching thông minh, giúp xây dựng ứng dụng có performance cao và UX tốt.
