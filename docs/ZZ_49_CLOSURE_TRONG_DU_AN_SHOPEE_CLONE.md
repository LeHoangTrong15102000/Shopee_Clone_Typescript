# Closure trong Dự án Shopee Clone TypeScript

> Tài liệu phân tích chi tiết về JavaScript/TypeScript Closures được sử dụng trong dự án Shopee Clone.
> Được sắp xếp từ **ĐƠN GIẢN** đến **PHỨC TẠP**.

---

## Mục lục

1. [Closure là gì? (Giải thích đơn giản nhất)](#1-closure-là-gì-giải-thích-đơn-giản-nhất)
2. [Closure trong Event Handler (Dễ nhất trong dự án)](#2-closure-trong-event-handler-dễ-nhất-trong-dự-án)
3. [Closure trong Array Methods (map, filter, some)](#3-closure-trong-array-methods-map-filter-some)
4. [Closure trong useCallback (Memoized Closures)](#4-closure-trong-usecallback-memoized-closures)
5. [Closure trong useEffect Cleanup](#5-closure-trong-useeffect-cleanup)
6. [Closure trong React Query (queryFn, onMutate, onError)](#6-closure-trong-react-query-queryfn-onmutate-onerror)
7. [Closure trong Optimistic Updates (Complex)](#7-closure-trong-optimistic-updates-complex)
8. [Closure trong HTTP Interceptors (Advanced)](#8-closure-trong-http-interceptors-advanced)
9. [Closure trong Form Handling (Nested Closures)](#9-closure-trong-form-handling-nested-closures)
10. [Closure Trap (Stale Closure) - Cạm bẫy phổ biến](#10-closure-trap-stale-closure---cạm-bẫy-phổ-biến)
11. [Tổng kết - Bảng tóm tắt các loại Closure trong dự án](#11-tổng-kết---bảng-tóm-tắt-các-loại-closure-trong-dự-án)
12. [Quy tắc vàng khi làm việc với Closure](#12-quy-tắc-vàng-khi-làm-việc-với-closure)

---

## 1. Closure là gì? (Giải thích đơn giản nhất)

### Ví von dễ hiểu

**Closure giống như một "chiếc ba lô" mà function mang theo:**

- Khi function được tạo ra, nó "đóng gói" (close over) các biến từ scope bên ngoài vào ba lô
- Dù function đi đâu, nó vẫn truy cập được các biến trong ba lô
- Các biến trong ba lô không bị garbage collected vì function vẫn giữ reference đến chúng

### Ví dụ đơn giản nhất

```typescript
function createCounter() {
  let count = 0  // biến trong scope ngoài
  
  return function increment() {
    count++  // closure: truy cập 'count' từ scope ngoài
    return count
  }
}

const counter = createCounter()
counter() // 1
counter() // 2
counter() // 3
// 'count' vẫn sống trong closure, không bị garbage collected
```

**Giải thích:**
- `increment()` là một closure vì nó "nhớ" biến `count` từ scope của `createCounter()`
- Mỗi lần gọi `counter()`, nó vẫn truy cập được `count` dù `createCounter()` đã chạy xong
- Biến `count` được "đóng gói" trong closure và tồn tại suốt vòng đời của `counter`

### Tại sao cần hiểu Closure?

Trong React và TypeScript, closure xuất hiện **ở khắp nơi**:
- Event handlers
- useCallback, useMemo, useEffect
- Array methods (map, filter, reduce)
- API callbacks
- Form handling

---

## 2. Closure trong Event Handler (Dễ nhất trong dự án)

### Ví dụ 1: onClick đơn giản

```typescript
// src/pages/ProductList/ProductList.tsx (dòng 203)
onClick={() => setIsFilterDrawerOpen(true)}
```

**Phân tích:**
- Arrow function `() => ...` là một closure
- Nó "bắt" (capture) biến `setIsFilterDrawerOpen` từ component scope
- Khi user click, function này vẫn truy cập được `setIsFilterDrawerOpen`

### Ví dụ 2: onClick với nhiều biến

```typescript
// src/pages/ProductList/ProductList.tsx (dòng 332-337)
onClick={() => {
  navigate({
    pathname: path.home,
    search: ''
  })
}}
```

**Closure captures:**
- `navigate` - hook từ react-router
- `path` - constant import từ module khác

**Tại sao đây là closure?**
- Arrow function được tạo trong component
- Nó "nhớ" `navigate` và `path` từ scope bên ngoài
- Khi user click (có thể sau vài giây), function vẫn truy cập được các biến này

### Ví dụ 3: onClose callback

```typescript
// src/pages/ProductList/ProductList.tsx (dòng 292)
onClose={() => setIsFilterDrawerOpen(false)}
```

**Closure captures:** `setIsFilterDrawerOpen`

---

## 3. Closure trong Array Methods (map, filter, some)

### Ví dụ 1: filter với biến từ outer scope

```typescript
// src/hooks/useNotifications.ts (dòng 86)
setRealtimeNotifications((prev) => prev.filter((n) => n._id !== notificationId))
//                                                              ^^^^^^^^^^^^^^^^
//                                                              closure captures notificationId
```

**Phân tích:**
- `notificationId` đến từ parameter của function `markAsRead`
- Callback trong `filter()` là một closure
- Nó "bắt" `notificationId` từ outer scope để so sánh

### Ví dụ 2: map với nested closure

```typescript
// src/hooks/useChat.ts (dòng 70-71)
messages: prev.messages.map((msg) =>
  msg._id === data.message_id ? { ...msg, status: 'delivered' as const } : msg
)
// closure captures: data.message_id từ outer scope
```

**Phân tích:**
- `data` là parameter của `handleMessageDelivered`
- Callback trong `map()` truy cập `data.message_id`
- Đây là closure vì callback "nhớ" biến từ scope bên ngoài

### Ví dụ 3: some với useCallback

```typescript
// src/hooks/useProductComparison.ts (dòng 44-49)
const isInCompare = useCallback(
  (productId: string) => {
    return compareList.some((p) => p._id === productId)
    //                                       ^^^^^^^^^
    //                                       closure captures productId
  },
  [compareList]
)
```

**Phân tích:**
- `productId` là parameter của outer function
- Callback trong `some()` là closure, capture `productId`
- Đây là **nested closure**: useCallback tạo closure, bên trong có closure của `some()`

---

## 4. Closure trong useCallback (Memoized Closures)

### Khái niệm

`useCallback` tạo ra một **memoized closure** - closure được cache lại để tránh tạo mới mỗi render.

**Mối quan hệ giữa closure và dependency array:**
- `useCallback` tạo 1 closure
- Dependency array quyết định **KHI NÀO** tạo closure **MỚI**
- Nếu dependencies thay đổi → tạo closure mới với giá trị mới
- Nếu không thay đổi → giữ closure cũ (tối ưu performance)

### Ví dụ 1: emit trong useSocket

```typescript
// src/hooks/useSocket.ts (dòng 7-14)
const emit = useCallback(
  (event: string, data?: unknown) => {
    if (socket && isConnected) {  // closure captures: socket, isConnected
      socket.emit(event, data)
    }
  },
  [socket, isConnected]  // dependency array = "khi nào tạo closure mới"
)
```

**Phân tích:**
- Closure capture: `socket`, `isConnected`
- Khi `socket` hoặc `isConnected` thay đổi → React tạo closure mới
- Closure mới sẽ có giá trị mới của `socket` và `isConnected`

### Ví dụ 2: sendMessage trong useChat

```typescript
// src/hooks/useChat.ts (dòng 40-51)
const sendMessage = useCallback(
  (message: string) => {
    if (!chatState.currentChatId || !message.trim()) return
    const payload: SendMessagePayload = {
      chat_id: chatState.currentChatId,  // closure captures chatState.currentChatId
      message: message.trim(),
      message_type: 'text'
    }
    emit(SocketEvent.SEND_MESSAGE, payload)  // closure captures emit
  },
  [chatState.currentChatId, emit]
)
```

**Closure captures:**
- `chatState.currentChatId` - ID của chat hiện tại
- `emit` - function từ useSocket (cũng là closure!)

### Ví dụ 3: addToCompare với nested closure

```typescript
// src/hooks/useProductComparison.ts (dòng 21-29)
const addToCompare = useCallback((product: Product) => {
  setCompareList((prev) => {
    if (prev.length >= MAX_COMPARE_ITEMS) return prev  // closure captures MAX_COMPARE_ITEMS
    if (prev.some((p) => p._id === product._id)) return prev  // nested closure captures product._id
    const updated = [...prev, product]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))  // closure captures STORAGE_KEY
    return updated
  })
}, [])
```

**Phân tích chi tiết:**
- **Outer closure** (useCallback): captures `setCompareList`, `MAX_COMPARE_ITEMS`, `STORAGE_KEY`
- **Inner closure** (callback của setCompareList): captures `product` từ parameter
- **Nested closure** (callback của some): captures `product._id`

**Tại sao dependency array rỗng `[]`?**
- `MAX_COMPARE_ITEMS` và `STORAGE_KEY` là constants, không thay đổi
- `setCompareList` là stable (React đảm bảo không thay đổi reference)
- Không cần tạo closure mới vì không có dependency nào thay đổi

---

## 5. Closure trong useEffect Cleanup

### Khái niệm

Cleanup function trong useEffect là một closure - nó "nhớ" các biến từ lúc useEffect chạy.

### Ví dụ 1: Socket event cleanup

```typescript
// src/hooks/useChat.ts (dòng 53-90)
useEffect(() => {
  if (!socket) return

  const handleMessageReceived = (data: MessageReceivedPayload) => {
    if (data.chat_id === chatState.currentChatId) {  // closure captures chatState.currentChatId
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, data],
        isLoading: false
      }))
    }
  }

  socket.on(SocketEvent.MESSAGE_RECEIVED, handleMessageReceived)

  return () => {
    // cleanup closure captures: socket, handleMessageReceived
    socket.off(SocketEvent.MESSAGE_RECEIVED, handleMessageReceived)
  }
}, [socket, chatState.currentChatId])
```

**Phân tích:**
- Cleanup function được tạo **TRONG** useEffect
- Nó capture `socket` và `handleMessageReceived` từ scope đó
- Khi React gọi cleanup (unmount hoặc trước re-run), nó dùng giá trị đã capture

### Ví dụ 2: Flash Sale cleanup với nhiều biến

```typescript
// src/hooks/useFlashSale.ts (dòng 84-90)
return () => {
  socket.emit(SocketEvent.UNSUBSCRIBE_FLASH_SALE, { sale_id: saleId })  // captures saleId
  socket.off(SocketEvent.FLASH_SALE_TICK, handleFlashSaleTick)  // captures handleFlashSaleTick
  socket.off(SocketEvent.FLASH_SALE_STOCK_UPDATE, handleStockUpdate)
  setIsConnectedToServer(false)
  if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)  // captures fallbackTimerRef
}
```

**Closure captures:**
- `socket` - WebSocket instance
- `saleId` - ID của flash sale
- `handleFlashSaleTick`, `handleStockUpdate` - event handlers
- `fallbackTimerRef` - ref cho fallback timer

### Ví dụ 3: Debounce cleanup (đơn giản nhất)

```typescript
// src/hooks/useDebounce.tsx (dòng 14-18)
useEffect(() => {
  const handler = setTimeout(() => setDebouncedValue(value?.trim() as string), delay)

  return () => clearTimeout(handler)  // closure captures handler
}, [value])
```

**Phân tích:**
- `handler` là timeout ID được tạo trong useEffect
- Cleanup closure capture `handler` để clear timeout
- Mỗi lần `value` thay đổi, cleanup được gọi với `handler` cũ, sau đó tạo `handler` mới

---

## 6. Closure trong React Query (queryFn, onMutate, onError)

### Ví dụ 1: queryFn capture filters

```typescript
// src/pages/ProductList/ProductList.tsx (dòng 76-81)
const { data } = useQuery({
  queryKey: ['products', normalizeProductQueryKey(filters)],
  queryFn: ({ signal }) => {
    // closure captures: filters từ component scope
    return productApi.getProducts(filters as ProductListConfig, { signal })
  }
})
```

**Phân tích:**
- `queryFn` là một closure
- Nó capture `filters` từ component scope
- Khi React Query gọi `queryFn`, nó dùng giá trị `filters` hiện tại

### Ví dụ 2: queryFn capture id từ useParams

```typescript
// src/pages/ProductDetail/ProductDetail.tsx (dòng 92-94)
queryFn: ({ signal }) => {
  // closure captures: id từ useParams()
  return productApi.getProductDetail(id as string, { signal })
}
```

**Phân tích:**
- `id` được lấy từ `useParams()` hook
- `queryFn` closure capture `id`
- Khi user navigate sang product khác, `id` thay đổi → queryKey thay đổi → query mới

### Ví dụ 3: Mutation callbacks

```typescript
// src/pages/Login/Login.tsx (dòng 58-66)
const loginAccountMutation = useMutation({
  mutationFn: (body: FormData) => authApi.loginAccount(body),
  onSuccess: () => {
    toast.success(t('login.success'), { autoClose: 1000 })  // closure captures t
  },
  onError: () => {
    toast.error(t('login.error'), { autoClose: 1000 })  // closure captures t
  }
})
```

**Closure captures:** `t` (translation function từ i18n)

---

## 7. Closure trong Optimistic Updates (Complex)

### Khái niệm

Optimistic Updates sử dụng nhiều closure lồng nhau để:
1. Lưu data cũ (rollback nếu lỗi)
2. Cập nhật UI ngay lập tức
3. Rollback nếu server trả về lỗi

### Ví dụ: useOptimisticUpdateQuantity

```typescript
// src/hooks/optimistic/cart/useOptimisticUpdateQuantity.ts (dòng 18-93)
return useMutation({
  mutationFn: purchaseApi.updatePurchase,

  onMutate: async ({ product_id, buy_count }: UpdateQuantityPayload): Promise<UpdateQuantityContext> => {
    // Closure captures: queryClient, QUERY_KEYS từ module scope
    await queryClient.cancelQueries({
      queryKey: QUERY_KEYS.PURCHASES_IN_CART
    })

    // Closure captures: queryClient, QUERY_KEYS
    const previousData = queryClient.getQueryData(QUERY_KEYS.PURCHASES_IN_CART)

    // Nested closure trong updatePurchasesCache
    updatePurchasesCache(queryClient, QUERY_KEYS.PURCHASES_IN_CART, (old) => ({
      ...old,
      data: {
        ...old.data,
        data:
          old.data?.data?.map((purchase: Purchase) =>
            // Closure captures: product_id, buy_count từ onMutate parameter
            purchase.product._id === product_id ? { ...purchase, buy_count } : purchase
          ) || []
      }
    }))

    // Closure captures: setExtendedPurchases từ context
    setExtendedPurchases(
      produce((draft) => {
        // Closure captures: product_id, buy_count
        const item = draft.find((p) => p.product._id === product_id)
        if (item) {
          item.buy_count = buy_count
          item.disabled = false
        }
      })
    )

    // Return context cho onError sử dụng
    return { previousData: previousData as PurchasesQueryData | undefined, product_id }
  },

  onError: (err, _variables, context) => {
    // Closure captures: queryClient, QUERY_KEYS
    if (context?.previousData) {
      queryClient.setQueryData(QUERY_KEYS.PURCHASES_IN_CART, context.previousData)
    }

    // Closure captures: setExtendedPurchases
    setExtendedPurchases(
      produce((draft) => {
        // Closure captures: context từ onError parameter
        const item = draft.find((p) => p.product._id === context?.product_id)
        if (item && context?.previousData) {
          const originalItem = (context.previousData as PurchasesQueryData | undefined)?.data?.data?.find(
            (p: Purchase) => p.product._id === context.product_id
          )
          if (originalItem) {
            item.buy_count = originalItem.buy_count
            item.disabled = false
          }
        }
      })
    )

    showErrorToast(TOAST_MESSAGES.UPDATE_QUANTITY_ERROR)
  },

  onSettled: (_data, _error, variables) => {
    // Closure captures: invalidateProductDetail
    if (variables.product_id) {
      invalidateProductDetail(variables.product_id)
    }
  }
})
```

**Phân tích closure chain:**

1. **onMutate closure:**
   - Captures: `queryClient`, `QUERY_KEYS`, `setExtendedPurchases`
   - Tạo nested closure trong `map()` capture `product_id`, `buy_count`

2. **onError closure:**
   - Captures: `queryClient`, `QUERY_KEYS`, `setExtendedPurchases`
   - Nhận `context` từ return của `onMutate`
   - Tạo nested closure trong `produce()` capture `context`

3. **onSettled closure:**
   - Captures: `invalidateProductDetail`
   - Nhận `variables` từ mutation call

---

## 8. Closure trong HTTP Interceptors (Advanced)

### Đặc điểm

HTTP Interceptors là closure đặc biệt vì:
- Được tạo trong constructor của class
- Capture `this` (class instance)
- Được gọi bởi axios sau này, không phải ngay lập tức

### Ví dụ: Request Interceptor

```typescript
// src/utils/http.ts (dòng 57-70)
this.instance.interceptors.request.use(
  (config) => {
    // Closure captures: this.accessToken (class instance property)
    if (this.accessToken && config.headers) {
      config.headers.authorization = this.accessToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

**Phân tích:**
- Arrow function capture `this` từ constructor scope
- `this.accessToken` được truy cập mỗi khi có request
- Giá trị `this.accessToken` có thể thay đổi, nhưng closure vẫn truy cập được giá trị mới nhất

### Ví dụ: Response Interceptor

```typescript
// src/utils/http.ts (dòng 71-89)
this.instance.interceptors.response.use(
  (response) => {
    // Closure captures: this (entire class instance)
    const { url } = response.config

    if (url === URL_LOGIN || url === URL_REGISTER) {
      const { data } = response.data as AuthResponse
      this.accessToken = data.access_token  // modifies captured variable
      this.refreshToken = data.refresh_token
      setAccessTokenToLS(this.accessToken)
      setRefreshTokenToLS(this.refreshToken)
      setProfileToLS(data.user)
    } else if (url === URL_LOGOUT) {
      clearLS()
      this.accessToken = ''  // modifies captured variable
      this.refreshToken = ''
    }

    return response
  }
)
```

**Điểm đặc biệt:**
- Closure không chỉ **đọc** mà còn **ghi** vào `this.accessToken`, `this.refreshToken`
- Đây là closure với **mutable captured variables**
- Mỗi request/response đều dùng cùng một closure, nhưng giá trị `this.accessToken` có thể khác nhau

### Tại sao dùng arrow function?

```typescript
// ✅ Arrow function - this được bind đúng
(config) => {
  if (this.accessToken) { ... }  // this = Http instance
}

// ❌ Regular function - this sẽ bị mất
function(config) {
  if (this.accessToken) { ... }  // this = undefined hoặc global
}
```

---

## 9. Closure trong Form Handling (Nested Closures)

### Ví dụ: Login form với 3 cấp closure

```typescript
// src/pages/Login/Login.tsx (dòng 69-103)
const onSubmit = handleSubmit((data) => {
  // Level 1: Outer closure
  // Captures: loginAccountMutation, setIsAuthenticated, setProfile, navigate,
  //           purchaseIdFromLocation, purchaseNameFromLocation

  loginAccountMutation.mutate(data, {
    onSuccess: (data) => {
      // Level 2: Nested closure trong onSuccess
      // Captures: setIsAuthenticated, setProfile, navigate,
      //           purchaseIdFromLocation, purchaseNameFromLocation
      setIsAuthenticated(true)
      setProfile(data.data.data.user)
      navigate(
        purchaseIdFromLocation
          ? `${path.home}${generateNameId({
              name: purchaseNameFromLocation as string,
              id: purchaseIdFromLocation
            })}`
          : '/'
      )
    },
    onError: (error) => {
      // Level 2: Nested closure trong onError
      // Captures: setError
      if (isAxiosUnprocessableEntityError<ErrorResponseApi<FormData>>(error)) {
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            // Level 3: Triple-nested closure trong forEach
            // Captures: setError, formError
            setError(key as keyof FormData, {
              message: formError[key as keyof FormData],
              type: 'Server'
            })
          })
        }
      }
    }
  })
})
```

**Phân tích cấu trúc closure:**

```
handleSubmit callback (Level 1)
├── Captures: loginAccountMutation, setIsAuthenticated, setProfile, navigate, ...
│
├── onSuccess callback (Level 2)
│   └── Captures: setIsAuthenticated, setProfile, navigate, purchaseIdFromLocation, ...
│
└── onError callback (Level 2)
    ├── Captures: setError
    │
    └── forEach callback (Level 3)
        └── Captures: setError, formError
```

**Tại sao cần nhiều cấp closure?**
- Mỗi cấp xử lý một giai đoạn khác nhau của form submission
- Các biến được "truyền xuống" qua closure chain
- Không cần pass props hay context, closure tự động "nhớ" các biến cần thiết

---

## 10. Closure Trap (Stale Closure) - Cạm bẫy phổ biến

### Stale Closure là gì?

**Stale Closure** xảy ra khi closure "nhớ" giá trị cũ của biến, không phải giá trị mới nhất.

### Ví dụ lỗi phổ biến

```typescript
// ❌ Stale closure problem
const [count, setCount] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    console.log(count)  // ALWAYS logs 0! Stale closure!
    setCount(count + 1)  // ALWAYS sets to 1! Stale closure!
  }, 1000)
  return () => clearInterval(interval)
}, [])  // empty deps = closure created once, captures count = 0 forever
```

**Tại sao lỗi?**
- `useEffect` chỉ chạy 1 lần (dependency array rỗng)
- Closure được tạo với `count = 0`
- Dù `count` thay đổi, closure vẫn "nhớ" giá trị cũ `count = 0`

### Cách fix: Functional Update

```typescript
// ✅ Fix với functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1)  // functional update, không cần closure
  }, 1000)
  return () => clearInterval(interval)
}, [])
```

**Tại sao fix được?**
- `prev => prev + 1` không capture `count` từ outer scope
- React truyền giá trị hiện tại vào `prev`
- Không có stale closure vì không có closure nào capture `count`

### Ví dụ trong dự án: Tránh stale closure

```typescript
// src/hooks/useProductComparison.ts (dòng 21-29)
// ✅ Dùng functional update để tránh stale closure
setCompareList((prev) => {  // prev luôn là giá trị hiện tại
  if (prev.length >= MAX_COMPARE_ITEMS) return prev
  if (prev.some((p) => p._id === product._id)) return prev
  const updated = [...prev, product]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
})
```

**Phân tích:**
- Không capture `compareList` trực tiếp
- Dùng `prev` từ functional update
- `prev` luôn là giá trị mới nhất, không bao giờ stale

### Ví dụ khác: useFlashSale

```typescript
// src/hooks/useFlashSale.ts (dòng 32-41)
setRemainingSeconds((prev) => {  // ✅ Functional update
  if (prev <= 1) {
    setIsEnded(true)
    setIsActive(false)
    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
    return 0
  }
  return prev - 1
})
```

### Khi nào cần cẩn thận với Stale Closure?

1. **setInterval/setTimeout** - callback được tạo 1 lần, chạy nhiều lần
2. **Event listeners** - được add 1 lần, trigger nhiều lần
3. **useEffect với dependency array rỗng** - closure chỉ được tạo 1 lần
4. **useCallback với dependency array thiếu** - closure không được update

---

## 11. Tổng kết - Bảng tóm tắt các loại Closure trong dự án

| Loại Closure | Ví dụ | Biến được capture | Mức độ |
|---|---|---|---|
| **Event Handler** | `onClick={() => setOpen(true)}` | setState functions | 🟢 Dễ |
| **Array Method** | `.filter((n) => n._id !== id)` | `id` từ outer scope | 🟢 Dễ |
| **useCallback** | `useCallback(() => {...}, [deps])` | deps variables | 🟡 Trung bình |
| **useEffect Cleanup** | `return () => socket.off(...)` | socket, handlers | 🟡 Trung bình |
| **React Query** | `queryFn: () => api.get(id)` | `id`, `filters` | 🟡 Trung bình |
| **Optimistic Update** | `onMutate/onError/onSettled` | queryClient, queryKey, context | 🔴 Khó |
| **HTTP Interceptor** | `interceptors.use((config) => ...)` | `this` (class instance) | 🔴 Khó |
| **Nested Closure** | `handleSubmit → mutate → onSuccess` | Multiple levels | 🔴 Khó |

### Closure Flow trong dự án

```
Component Render
│
├── useState/useContext → tạo state/context variables
│
├── useCallback/useMemo → tạo memoized closures
│   └── Capture: state, props, context
│
├── useEffect → tạo effect closures
│   ├── Setup closure: capture dependencies
│   └── Cleanup closure: capture setup variables
│
├── Event Handlers → tạo inline closures
│   └── Capture: state, handlers, navigate
│
└── React Query → tạo query/mutation closures
    ├── queryFn: capture filters, id
    ├── onMutate: capture queryClient, previousData
    ├── onError: capture context từ onMutate
    └── onSettled: capture invalidation functions
```

---

## 12. Quy tắc vàng khi làm việc với Closure

### 1. Luôn kiểm tra dependency array

```typescript
// ❌ Thiếu dependency
useCallback(() => {
  doSomething(value)  // value không có trong deps
}, [])

// ✅ Đầy đủ dependency
useCallback(() => {
  doSomething(value)
}, [value])
```

### 2. Dùng functional update thay vì truy cập state trực tiếp

```typescript
// ❌ Có thể stale
setCount(count + 1)

// ✅ Luôn đúng
setCount(prev => prev + 1)
```

### 3. Cẩn thận với setInterval/setTimeout

```typescript
// ❌ Stale closure
useEffect(() => {
  const id = setInterval(() => {
    console.log(count)  // stale!
  }, 1000)
  return () => clearInterval(id)
}, [])

// ✅ Dùng ref hoặc functional update
const countRef = useRef(count)
countRef.current = count

useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current)  // always fresh
  }, 1000)
  return () => clearInterval(id)
}, [])
```

### 4. Hiểu rằng mỗi render tạo ra closure MỚI

```typescript
const MyComponent = () => {
  const [count, setCount] = useState(0)

  // Mỗi render tạo ra handleClick MỚI
  const handleClick = () => {
    console.log(count)  // count của render này
  }

  // useCallback giữ closure CŨ nếu deps không đổi
  const memoizedClick = useCallback(() => {
    console.log(count)  // count của lần tạo closure
  }, [count])

  return <button onClick={handleClick}>Click</button>
}
```

### 5. Debug closure với console.log

```typescript
useCallback(() => {
  console.log('Closure created with:', { value, count, data })
  // ... logic
}, [value, count, data])
```

---

## Kết luận

Closure là một trong những khái niệm quan trọng nhất trong JavaScript/TypeScript và React. Trong dự án Shopee Clone:

1. **Closure xuất hiện ở khắp nơi** - từ event handlers đơn giản đến optimistic updates phức tạp
2. **Hiểu closure giúp debug dễ hơn** - đặc biệt với stale closure bugs
3. **Dependency array là chìa khóa** - quyết định khi nào closure được tạo mới
4. **Functional update là best practice** - tránh stale closure trong setState

Khi gặp bug liên quan đến "giá trị cũ" hoặc "không update", hãy nghĩ đến closure trước tiên!


