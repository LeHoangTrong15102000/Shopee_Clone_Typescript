# 🧹 PHÂN TÍCH CHUYÊN SÂU: useEffect Cleanup Function — Thứ Tự Thực Thi & Edge Cases

> **Ngày phân tích**: 2026-03-10
> **Mục tiêu**: Hiểu rõ 100% cơ chế cleanup function trong useEffect — khi nào chạy, thứ tự ra sao, edge cases nào cần biết
> **Đối tượng**: Frontend Developer chuẩn bị phỏng vấn, cần hiểu sâu React internals

---

## 📑 MỤC LỤC

1. [Câu Trả Lời Ngắn — Bạn Hiểu Đúng Rồi](#1-câu-trả-lời-ngắn--bạn-hiểu-đúng-rồi)
2. [Thứ Tự Thực Thi Chi Tiết](#2-thứ-tự-thực-thi-chi-tiết)
3. [3 Trường Hợp Cleanup Được Gọi](#3-ba-trường-hợp-cleanup-được-gọi)
4. [Phân Tích Code Thực Tế Từ Codebase](#4-phân-tích-code-thực-tế-từ-codebase)
5. [React StrictMode — Tại Sao Effect Chạy 2 Lần?](#5-react-strictmode--tại-sao-effect-chạy-2-lần)
6. [Edge Cases Quan Trọng](#6-edge-cases-quan-trọng)
7. [Anti-Patterns & Best Practices](#7-anti-patterns--best-practices)
8. [Tổng Kết Cho Phỏng Vấn](#8-tổng-kết-cho-phỏng-vấn)

---

## 1. Câu Trả Lời Ngắn — Bạn Hiểu Đúng Rồi

Bạn hiểu **hoàn toàn chính xác**. Cleanup function chạy trong 2 trường hợp:

```
┌─────────────────────────────────────────────────────────────────────┐
│              KHI NÀO CLEANUP FUNCTION CHẠY?                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1️⃣  Trước khi component UNMOUNT                                    │
│      → Component bị remove khỏi DOM                                 │
│      → Cleanup chạy để dọn dẹp resources                            │
│                                                                     │
│  2️⃣  Trước khi effect MỚI chạy (khi dependencies thay đổi)         │
│      → Dependencies thay đổi → component re-render                  │
│      → Cleanup CŨ chạy TRƯỚC                                       │
│      → Effect MỚI chạy SAU                                         │
│                                                                     │
│  Thứ tự: Cleanup cũ → Effect mới (LUÔN LUÔN như vậy)              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Nhưng để hiểu **thật sâu**, cần biết thêm nhiều chi tiết quan trọng phía dưới.

---

## 2. Thứ Tự Thực Thi Chi Tiết

### 🔄 Lifecycle đầy đủ của useEffect

```
┌─────────────────────────────────────────────────────────────────────┐
│                LIFECYCLE ĐẦY ĐỦ CỦA useEffect                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  MOUNT (lần đầu render):                                            │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ 1. Component render → tạo Virtual DOM                    │       │
│  │ 2. React commit → update Real DOM                        │       │
│  │ 3. Browser paint → user thấy UI                          │       │
│  │ 4. useEffect callback chạy (SAU paint) ← QUAN TRỌNG     │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                     │
│  UPDATE (dependencies thay đổi):                                    │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ 1. Component re-render → tạo Virtual DOM mới             │       │
│  │ 2. React commit → update Real DOM                        │       │
│  │ 3. Browser paint → user thấy UI mới                      │       │
│  │ 4. Cleanup function CŨ chạy ← DỌN DẸP EFFECT TRƯỚC     │       │
│  │ 5. useEffect callback MỚI chạy ← EFFECT MỚI            │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                     │
│  UNMOUNT:                                                           │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ 1. React bắt đầu unmount component                      │       │
│  │ 2. Cleanup function chạy ← DỌN DẸP LẦN CUỐI            │       │
│  │ 3. Component bị remove khỏi DOM                          │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### ⚠️ Điểm cực kỳ quan trọng: useEffect chạy SAU browser paint

```typescript
// useEffect chạy ASYNCHRONOUSLY — SAU khi browser đã paint
// Điều này khác với componentDidMount/componentDidUpdate trong class components

// Timeline:
// 1. render()        → tạo Virtual DOM
// 2. commit          → update Real DOM
// 3. browser paint   → user THẤY UI (không bị block)
// 4. useEffect()     → side effects chạy ở đây

// Nếu cần chạy TRƯỚC paint → dùng useLayoutEffect
// useLayoutEffect chạy SYNCHRONOUSLY giữa commit và paint
// Timeline:
// 1. render()           → tạo Virtual DOM
// 2. commit             → update Real DOM
// 3. useLayoutEffect()  → chạy ở đây (BLOCK paint)
// 4. browser paint      → user thấy UI
```

### 🔍 Minh họa bằng console.log

```typescript
function Demo({ value }: { value: string }) {
  console.log('1. Render với value =', value)

  useEffect(() => {
    console.log('3. Effect chạy với value =', value)

    return () => {
      console.log('2. Cleanup chạy với value =', value)
      // ⚠️ Cleanup capture giá trị CŨ của value (closure)
    }
  }, [value])

  return <div>{value}</div>
}

// === Khi mount với value = "A" ===
// Output:
// 1. Render với value = A
// 3. Effect chạy với value = A
// (Không có cleanup vì đây là lần đầu)

// === Khi value thay đổi từ "A" → "B" ===
// Output:
// 1. Render với value = B          ← render MỚI
// 2. Cleanup chạy với value = A    ← cleanup CŨ (capture giá trị A)
// 3. Effect chạy với value = B     ← effect MỚI

// === Khi unmount ===
// Output:
// 2. Cleanup chạy với value = B    ← cleanup lần cuối
```

> **Điểm mấu chốt**: Cleanup function luôn capture giá trị **tại thời điểm effect được tạo**, không phải giá trị hiện tại. Đây là bản chất của JavaScript closure.

---

## 3. Ba Trường Hợp Cleanup Được Gọi

### Trường hợp 1: Dependencies thay đổi

```typescript
// Mỗi khi `productId` thay đổi:
// 1. Cleanup CŨ chạy (unsubscribe product CŨ)
// 2. Effect MỚI chạy (subscribe product MỚI)

useEffect(() => {
  socket.emit('subscribe_product', { product_id: productId })

  return () => {
    // Cleanup: unsubscribe product CŨ
    socket.emit('unsubscribe_product', { product_id: productId })
    // ⚠️ productId ở đây là giá trị CŨ (closure)
  }
}, [productId])

// User chuyển từ product "AAA" sang "BBB":
// → cleanup("AAA")  ← unsubscribe AAA
// → effect("BBB")   ← subscribe BBB
```

### Trường hợp 2: Component unmount

```typescript
// Khi component bị remove khỏi DOM (navigate away, conditional render)
// Cleanup chạy 1 lần cuối cùng

useEffect(() => {
  window.addEventListener('scroll', handleScroll)

  return () => {
    // Chạy khi component unmount
    window.removeEventListener('scroll', handleScroll)
  }
}, [])

// User navigate từ /product/123 sang /home:
// → ProductDetail unmount
// → cleanup() chạy → removeEventListener
// → Không còn memory leak
```

### Trường hợp 3: Empty dependency array `[]`

```typescript
// Với [] → effect chỉ chạy 1 lần khi mount
// Cleanup chỉ chạy 1 lần khi unmount

useEffect(() => {
  console.log('Effect: chỉ chạy 1 lần khi mount')

  return () => {
    console.log('Cleanup: chỉ chạy 1 lần khi unmount')
  }
}, []) // Empty deps = mount/unmount only
```

### 📊 Bảng tổng hợp

| Dependency Array | Effect chạy khi | Cleanup chạy khi |
|-----------------|----------------|-----------------|
| Không có `[]` | Mỗi lần render | Trước mỗi re-render + unmount |
| `[]` (empty) | Mount (1 lần) | Unmount (1 lần) |
| `[a, b]` | Mount + khi a hoặc b thay đổi | Trước effect mới + unmount |

---

## 4. Phân Tích Code Thực Tế Từ Codebase

### 📍 Ví dụ 1: `useDebounce` — Cleanup setTimeout

```typescript
// src/hooks/useDebounce.tsx
const useDebounce = (value: null | FormData['name'], delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value?.trim() as string), delay)

    // Cleanup: clear timeout CŨ trước khi tạo timeout MỚI
    return () => clearTimeout(handler)
  }, [value])

  return debouncedValue
}
```

**Timeline khi user gõ "a" → "ab" → "abc" (mỗi ký tự cách 200ms, delay = 500ms):**

```
t=0ms:    value="a"   → Effect: setTimeout(500ms) → handler_1
t=200ms:  value="ab"  → Cleanup: clearTimeout(handler_1) ← HỦY timeout cũ
                       → Effect: setTimeout(500ms) → handler_2
t=400ms:  value="abc" → Cleanup: clearTimeout(handler_2) ← HỦY timeout cũ
                       → Effect: setTimeout(500ms) → handler_3
t=900ms:  handler_3 fires → setDebouncedValue("abc") ← CHỈ GIÁ TRỊ CUỐI

// Kết quả: API chỉ được gọi 1 lần với "abc" thay vì 3 lần
// Đây chính là cơ chế debounce — cleanup function là chìa khóa!
```

**Tại sao cleanup quan trọng ở đây?**
- Không có cleanup → 3 setTimeout chạy song song → `setDebouncedValue` được gọi 3 lần
- Có cleanup → mỗi lần value thay đổi, timeout cũ bị hủy → chỉ timeout cuối cùng chạy

### 📍 Ví dụ 2: `App.tsx` — Cleanup Event Listener

```typescript
// src/App.tsx
function App() {
  const { reset } = useContext(AppContext)

  useEffect(() => {
    // Subscribe: lắng nghe sự kiện clearLS
    LocalStorageEventTarget.addEventListener('clearLS', reset)

    return () => {
      // Cleanup: gỡ event listener
      LocalStorageEventTarget.removeEventListener('clearLS', reset)
    }
  }, [reset])
}
```

**Tại sao dependency là `[reset]`?**

```
Scenario: reset function thay đổi reference (dù useCallback đã wrap)

1. Mount: addEventListener(reset_v1)
2. reset thay đổi reference → re-render
3. Cleanup: removeEventListener(reset_v1)  ← GỠ listener CŨ
4. Effect: addEventListener(reset_v2)       ← GẮN listener MỚI

// Nếu KHÔNG có cleanup:
// → reset_v1 listener vẫn còn attached
// → reset_v2 listener được thêm vào
// → Khi clearLS event fire → CẢ HAI listeners chạy → BUG!
```

### 📍 Ví dụ 3: `useLivePriceUpdate` — Cleanup WebSocket Subscription

```typescript
// src/hooks/useLivePriceUpdate.ts
useEffect(() => {
  if (!socket || !isConnected || !productId) return
  // ⚠️ Early return = KHÔNG có cleanup function (xem edge case bên dưới)

  // Subscribe to product room
  socket.emit(SocketEvent.SUBSCRIBE_PRODUCT, { product_id: productId })

  const handlePriceUpdate = (data: PriceUpdatedPayload) => {
    if (data.product_id === productId) {
      setPrice(data.new_price)
      // ...
    }
  }

  socket.on(SocketEvent.PRICE_UPDATED, handlePriceUpdate)
  socket.on(SocketEvent.PRICE_ALERT_TRIGGERED, handlePriceAlert)

  return () => {
    // Cleanup: unsubscribe + remove listeners + clear timer
    socket.emit(SocketEvent.UNSUBSCRIBE_PRODUCT, { product_id: productId })
    socket.off(SocketEvent.PRICE_UPDATED, handlePriceUpdate)
    socket.off(SocketEvent.PRICE_ALERT_TRIGGERED, handlePriceAlert)

    if (hasChangedTimerRef.current) {
      clearTimeout(hasChangedTimerRef.current)
    }
  }
}, [socket, isConnected, productId])
```

**Timeline khi user chuyển từ product A sang product B:**

```
1. User đang xem product A:
   → socket.emit(SUBSCRIBE_PRODUCT, { product_id: "A" })
   → socket.on(PRICE_UPDATED, handlePriceUpdate_A)

2. User click vào product B → productId thay đổi:
   → CLEANUP chạy:
     → socket.emit(UNSUBSCRIBE_PRODUCT, { product_id: "A" })  ← Hủy sub A
     → socket.off(PRICE_UPDATED, handlePriceUpdate_A)          ← Gỡ listener A
     → clearTimeout(hasChangedTimerRef)                         ← Hủy timer

   → EFFECT MỚI chạy:
     → socket.emit(SUBSCRIBE_PRODUCT, { product_id: "B" })     ← Sub B
     → socket.on(PRICE_UPDATED, handlePriceUpdate_B)            ← Gắn listener B

// Nếu KHÔNG có cleanup:
// → Vẫn nhận price updates của product A (lãng phí bandwidth)
// → handlePriceUpdate_A vẫn chạy → update state sai product
// → Memory leak: listeners tích lũy mỗi lần chuyển product
```

### 📍 Ví dụ 4: `SocketProvider` — Cleanup khi unmount toàn bộ app

```typescript
// src/contexts/socket.context.tsx
useEffect(() => {
  return () => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners()  // Gỡ TẤT CẢ listeners
      socketRef.current.disconnect()           // Đóng connection
      socketRef.current = null                 // Release reference
    }
  }
}, [])
// Empty deps [] → cleanup chỉ chạy khi SocketProvider unmount
// = khi user đóng tab hoặc app bị destroy
```

### 📍 Ví dụ 5: `useSearchWithCancellation` — Cleanup AbortController

```typescript
// src/hooks/useSearchWithCancellation.ts
useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()  // Hủy HTTP request đang pending
    }
  }
}, [queryConfig.name]) // Cleanup khi search term thay đổi

// User gõ "iph" → "ipho" → "iphon" → "iphone":
// Mỗi lần → cleanup abort request CŨ → tạo request MỚI
// → Chỉ request cuối cùng ("iphone") hoàn thành
// → Tránh race condition: response "iph" đến sau "iphone"
```

---

## 5. React StrictMode — Tại Sao Effect Chạy 2 Lần?

### 🔍 Hiện tượng trong Development

Project này dùng `React.StrictMode` trong `src/main.tsx`:

```typescript
// src/main.tsx
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>  {/* ← StrictMode bọc toàn bộ app */}
    <BrowserRouter>
      {/* ... */}
    </BrowserRouter>
  </React.StrictMode>
)
```

**Trong development mode, StrictMode cố tình:**
1. Render component 2 lần
2. Chạy effect → cleanup → effect lại (mount → unmount → mount)

```
┌─────────────────────────────────────────────────────────────────────┐
│           STRICTMODE BEHAVIOR (CHỈ TRONG DEVELOPMENT)               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Bình thường (Production):                                          │
│  Mount → Effect                                                     │
│                                                                     │
│  StrictMode (Development):                                          │
│  Mount → Effect → Cleanup → Effect (lần 2)                         │
│                                                                     │
│  Mục đích: Phát hiện side effects không được cleanup đúng cách     │
│  Nếu effect chạy 2 lần mà app vẫn hoạt động đúng                  │
│  → Cleanup function đã được viết đúng ✅                            │
│  Nếu app bị lỗi khi chạy 2 lần                                    │
│  → Cleanup function có vấn đề ❌                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 💡 Ví dụ: StrictMode phát hiện bug

```typescript
// ❌ BUG: Không cleanup → StrictMode sẽ phát hiện
useEffect(() => {
  // Lần 1: subscribe
  socket.on('price_update', handler)
  // StrictMode cleanup (giả lập unmount) → KHÔNG có cleanup
  // Lần 2: subscribe LẠI → BÂY GIỜ CÓ 2 LISTENERS!
  // → handler chạy 2 lần cho mỗi event → BUG!
}, [])

// ✅ ĐÚNG: Có cleanup → StrictMode chạy 2 lần vẫn OK
useEffect(() => {
  socket.on('price_update', handler)

  return () => {
    socket.off('price_update', handler) // Cleanup
  }
  // StrictMode: subscribe → unsubscribe → subscribe
  // → Chỉ có 1 listener → OK ✅
}, [])
```

> **Lưu ý**: StrictMode double-invocation **CHỈ xảy ra trong development**. Production build chạy bình thường (1 lần).

---

## 6. Edge Cases Quan Trọng

### 🔴 Edge Case 1: Early return — Không có cleanup

```typescript
// src/hooks/useLivePriceUpdate.ts
useEffect(() => {
  if (!socket || !isConnected || !productId) return
  // ⚠️ Khi early return → KHÔNG có cleanup function
  // → React không có gì để gọi khi dependencies thay đổi

  socket.emit(SocketEvent.SUBSCRIBE_PRODUCT, { product_id: productId })
  // ...

  return () => {
    socket.emit(SocketEvent.UNSUBSCRIBE_PRODUCT, { product_id: productId })
    // ...
  }
}, [socket, isConnected, productId])
```

**Scenario nguy hiểm:**

```
1. socket = null, isConnected = false → early return (không subscribe)
2. socket connected → isConnected = true → effect chạy → subscribe
3. socket disconnected → isConnected = false
   → Cleanup CỦA BƯỚC 2 chạy → unsubscribe ✅
4. Lần tiếp theo: socket = null → early return → KHÔNG có cleanup
   → Nhưng không sao vì bước 3 đã cleanup rồi ✅
```

**Tại sao pattern này an toàn?**
- Cleanup chỉ cần thiết khi effect đã thực sự setup side effects
- Nếu early return (không setup gì) → không cần cleanup
- React chỉ gọi cleanup function nếu effect đã return một function

### 🔴 Edge Case 2: Stale Closure trong Cleanup

```typescript
// ❌ NGUY HIỂM: Stale closure
const [count, setCount] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    console.log('Count is:', count) // ⚠️ count luôn = 0 (stale closure)
    setCount(count + 1)             // ⚠️ Luôn set thành 1
  }, 1000)

  return () => {
    console.log('Cleanup count:', count) // ⚠️ count = 0 (closure capture)
    clearInterval(interval)
  }
}, []) // Empty deps → closure capture giá trị ban đầu

// ✅ FIX 1: Dùng functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1) // ✅ Luôn dùng giá trị mới nhất
  }, 1000)

  return () => clearInterval(interval)
}, [])

// ✅ FIX 2: Dùng ref
const countRef = useRef(0)

useEffect(() => {
  const interval = setInterval(() => {
    countRef.current += 1
    setCount(countRef.current) // ✅ Ref luôn có giá trị mới nhất
  }, 1000)

  return () => clearInterval(interval)
}, [])
```

### 🔴 Edge Case 3: Async trong Effect — Race Condition

```typescript
// ❌ NGUY HIỂM: Race condition khi fetch async
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch(`/api/product/${productId}`)
    const data = await response.json()
    setProduct(data) // ⚠️ Có thể set data CŨ nếu productId đã thay đổi
  }

  fetchData()
}, [productId])

// Scenario:
// 1. productId = "A" → fetch("/api/product/A") bắt đầu (mất 3 giây)
// 2. productId = "B" → fetch("/api/product/B") bắt đầu (mất 1 giây)
// 3. Response B đến trước → setProduct(B) ✅
// 4. Response A đến sau → setProduct(A) ❌ HIỂN THỊ SAI!

// ✅ FIX: Dùng boolean flag hoặc AbortController
useEffect(() => {
  let isCancelled = false // Flag để track cleanup

  const fetchData = async () => {
    const response = await fetch(`/api/product/${productId}`)
    const data = await response.json()

    if (!isCancelled) {
      setProduct(data) // Chỉ set nếu effect chưa bị cleanup
    }
  }

  fetchData()

  return () => {
    isCancelled = true // Cleanup: đánh dấu effect này đã bị hủy
  }
}, [productId])

// ✅ FIX TỐT HƠN: AbortController (hủy cả network request)
useEffect(() => {
  const controller = new AbortController()

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/product/${productId}`, {
        signal: controller.signal
      })
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Fetch error:', error)
      }
      // AbortError = request bị hủy bởi cleanup → bỏ qua
    }
  }

  fetchData()

  return () => controller.abort() // Cleanup: hủy network request
}, [productId])
```

### 🔴 Edge Case 4: Nhiều useEffect — Thứ tự cleanup

```typescript
function Component({ id }: { id: string }) {
  useEffect(() => {
    console.log('Effect A chạy')
    return () => console.log('Cleanup A')
  }, [id])

  useEffect(() => {
    console.log('Effect B chạy')
    return () => console.log('Cleanup B')
  }, [id])

  // Khi id thay đổi:
  // Output:
  // Cleanup A    ← Cleanup chạy theo THỨ TỰ KHAI BÁO
  // Cleanup B
  // Effect A     ← Effect mới chạy theo THỨ TỰ KHAI BÁO
  // Effect B

  // Khi unmount:
  // Cleanup A
  // Cleanup B
}
```

> **Quy tắc**: Cleanup và effect chạy theo **thứ tự khai báo** trong component. Effect 1 cleanup trước, rồi effect 2 cleanup, rồi effect 1 mới chạy, rồi effect 2 mới chạy.

### 🔴 Edge Case 5: Cleanup với Ref — Không trigger re-render

```typescript
// src/hooks/useLivePriceUpdate.ts — Pattern thực tế
const hasChangedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

useEffect(() => {
  // ...
  const handlePriceUpdate = (data: PriceUpdatedPayload) => {
    // Clear timer CŨ trước khi tạo timer MỚI
    if (hasChangedTimerRef.current) {
      clearTimeout(hasChangedTimerRef.current)
    }
    hasChangedTimerRef.current = setTimeout(() => {
      setHasChanged(false)
    }, 3000)
  }

  return () => {
    // Cleanup: clear timer khi unmount hoặc deps thay đổi
    if (hasChangedTimerRef.current) {
      clearTimeout(hasChangedTimerRef.current)
    }
  }
}, [socket, isConnected, productId])

// Tại sao dùng ref thay vì state cho timer ID?
// → Thay đổi ref KHÔNG trigger re-render
// → Nếu dùng state: setTimerId(newId) → re-render → effect chạy lại → vòng lặp vô hạn!
```

---

## 7. Anti-Patterns & Best Practices

### ❌ Anti-Pattern 1: Quên cleanup

```typescript
// ❌ Memory leak: event listener không bao giờ được gỡ
useEffect(() => {
  window.addEventListener('resize', handleResize)
  // Không return cleanup function!
}, [])

// ❌ Memory leak: timer không bao giờ được clear
useEffect(() => {
  setInterval(() => {
    fetchLatestPrice()
  }, 1000)
  // Không return cleanup function!
}, [])

// ❌ Memory leak: WebSocket subscription không unsubscribe
useEffect(() => {
  socket.on('price_update', handler)
  // Không return cleanup function!
}, [])
```

### ❌ Anti-Pattern 2: Cleanup sai reference

```typescript
// ❌ BUG: removeEventListener với function khác
useEffect(() => {
  window.addEventListener('scroll', () => {
    console.log('scrolling') // Anonymous function
  })

  return () => {
    window.removeEventListener('scroll', () => {
      console.log('scrolling') // ĐÂY LÀ FUNCTION KHÁC!
    })
    // → removeEventListener KHÔNG hoạt động vì reference khác nhau
  }
}, [])

// ✅ FIX: Dùng named function reference
useEffect(() => {
  const handleScroll = () => {
    console.log('scrolling')
  }

  window.addEventListener('scroll', handleScroll)

  return () => {
    window.removeEventListener('scroll', handleScroll) // Cùng reference ✅
  }
}, [])
```

### ❌ Anti-Pattern 3: Async cleanup function

```typescript
// ❌ SAI: Cleanup function KHÔNG THỂ là async
useEffect(() => {
  // ...

  return async () => {
    await saveDataToServer() // ❌ React KHÔNG await cleanup
    // Cleanup phải synchronous!
  }
}, [])

// ✅ FIX: Fire-and-forget hoặc dùng ref
useEffect(() => {
  return () => {
    // Fire-and-forget: gọi async nhưng không await
    saveDataToServer().catch(console.error)
  }
}, [])
```

### ✅ Best Practice: Checklist cleanup

```
Khi viết useEffect, tự hỏi:
├── [ ] Effect có tạo subscription? → Cleanup: unsubscribe
├── [ ] Effect có addEventListener? → Cleanup: removeEventListener
├── [ ] Effect có setTimeout/setInterval? → Cleanup: clearTimeout/clearInterval
├── [ ] Effect có fetch/API call? → Cleanup: AbortController.abort()
├── [ ] Effect có WebSocket listener? → Cleanup: socket.off()
├── [ ] Effect có modify DOM? → Cleanup: revert changes
└── [ ] Effect có tạo object/connection? → Cleanup: close/destroy/null
```

---

## 8. Tổng Kết Cho Phỏng Vấn

### 📝 Câu trả lời mẫu cho phỏng vấn

**Q: "Cleanup function trong useEffect hoạt động như thế nào?"**

**A:**

> Cleanup function là function được return từ useEffect callback. Nó chạy trong 2 trường hợp:
>
> **Thứ nhất**, khi dependencies thay đổi — React chạy cleanup CŨ trước, rồi mới chạy effect MỚI. Cleanup capture giá trị cũ qua closure, nên nó dọn dẹp đúng side effects của lần chạy trước.
>
> **Thứ hai**, khi component unmount — cleanup chạy lần cuối để giải phóng resources.
>
> Thứ tự quan trọng: render → commit → paint → cleanup cũ → effect mới. useEffect chạy asynchronously SAU browser paint, nên không block UI.
>
> Trong project thực tế, tôi dùng cleanup cho: clearTimeout (debounce), removeEventListener (global events), socket.off (WebSocket), AbortController.abort (cancel HTTP requests).
>
> Một điểm hay là React StrictMode trong development cố tình chạy effect → cleanup → effect để phát hiện side effects không được cleanup đúng.

### 🎯 Key Points cần nhớ

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLEANUP FUNCTION — TÓM TẮT                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Cleanup chạy TRƯỚC effect mới (khi deps thay đổi)              │
│  2. Cleanup chạy khi component unmount                              │
│  3. Cleanup capture giá trị CŨ qua closure                         │
│  4. useEffect chạy SAU browser paint (async)                       │
│  5. useLayoutEffect chạy TRƯỚC paint (sync) — dùng khi cần        │
│  6. Early return = không có cleanup (và không sao cả)              │
│  7. StrictMode: effect → cleanup → effect (chỉ trong dev)          │
│  8. Nhiều useEffect: cleanup theo thứ tự khai báo                  │
│  9. Cleanup PHẢI synchronous (không async)                          │
│  10. Luôn cleanup: listeners, timers, subscriptions, requests      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 📊 So sánh với Class Component

| Aspect | Class Component | useEffect + Cleanup |
|--------|----------------|-------------------|
| Setup | `componentDidMount` | Effect callback |
| Update | `componentDidUpdate` | Effect callback (khi deps thay đổi) |
| Cleanup on update | `componentDidUpdate` (manual) | Cleanup function (automatic) |
| Cleanup on unmount | `componentWillUnmount` | Cleanup function |
| Closure | `this.state` (luôn mới nhất) | Closure capture (giá trị tại thời điểm render) |
| Timing | Sync (block paint) | Async (sau paint) |

> **Ưu điểm lớn nhất của useEffect cleanup**: Mỗi effect "sở hữu" cleanup riêng của nó. Trong class component, bạn phải tự quản lý cleanup trong `componentWillUnmount` và `componentDidUpdate` — dễ quên, dễ sai. Với useEffect, setup và cleanup luôn đi cặp, khó quên hơn.

---

> **Ghi chú**: Tài liệu này phân tích dựa trên React 19 (phiên bản đang dùng trong project). Các concepts này áp dụng cho React 16.8+ (khi hooks được giới thiệu).