# Sửa Lỗi Infinite Loop Sau Khi Migrate Cart Sang Zustand

## 1. Tổng Quan Vấn Đề

Sau khi migrate cart state từ React Context sang Zustand, trang `/cart` gặp lỗi nghiêm trọng:

- **Triệu chứng**: Browser hiển thị 500 error page
- **Console error**: `Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.`
- **Nguyên nhân**: Infinite re-render loop - React phát hiện component re-render hơn 50 lần liên tiếp

---

## 2. Nguyên Nhân Gốc (Root Cause Analysis)

### Nguyên nhân 1: `useCartStore()` không có selector

Trong `Cart.tsx`, code cũ sử dụng:

```typescript
// ❌ SAI - Subscribe toàn bộ store
const { items: extendedPurchases, setItems, toggleCheck, selectAll, updateQuantity } = useCartStore()
```

**Vấn đề**: Khi gọi `useCartStore()` không có selector, component sẽ subscribe vào TOÀN BỘ store. Bất kỳ thay đổi nào trong store đều trigger re-render.

**Flow tạo infinite loop:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. purchasesInCart data arrives từ React Query                     │
│                           ↓                                         │
│  2. useEffect chạy → gọi setItems(newItems)                        │
│                           ↓                                         │
│  3. setItems thay đổi state.items trong Zustand store              │
│                           ↓                                         │
│  4. useCartStore() (không selector) detect store change            │
│                           ↓                                         │
│  5. Component RE-RENDER                                             │
│                           ↓                                         │
│  6. useEffect chạy LẠI vì component vừa re-render                  │
│                           ↓                                         │
│  7. Gọi setItems LẠI → Quay lại bước 3                             │
│                           ↓                                         │
│  ∞ INFINITE LOOP! React throw error sau 50+ updates                │
└─────────────────────────────────────────────────────────────────────┘
```

### Nguyên nhân 2: `useCheckedItems` selector tạo array reference mới mỗi lần

```typescript
// ❌ SAI - .filter() LUÔN trả về array reference mới
export const useCheckedItems = () => useCartStore((s) => s.items.filter((item) => item.isChecked))
```

**Vấn đề**:
- `.filter()` LUÔN LUÔN trả về một array mới, kể cả khi nội dung giống hệt
- Zustand dùng `Object.is()` để so sánh kết quả selector cũ vs mới
- Array mới `!==` Array cũ → Zustand nghĩ state đã thay đổi → trigger re-render

```typescript
// Ví dụ minh họa
const arr1 = [1, 2, 3].filter(x => x > 0)  // [1, 2, 3]
const arr2 = [1, 2, 3].filter(x => x > 0)  // [1, 2, 3]
console.log(arr1 === arr2)  // false! Khác reference
```

### Nguyên nhân 3: Cùng pattern sai ở các optimistic hooks và useCheckout

```typescript
// ❌ useOptimisticAddToCart.ts
const { addOptimisticItem, replaceTempItems, removeTempItems } = useCartStore()

// ❌ useOptimisticRemoveFromCart.ts
const { removeItems, restoreItems } = useCartStore()

// ❌ useOptimisticUpdateQuantity.ts
const { updateQuantity } = useCartStore()

// ❌ useCheckout.ts
const { items: extendedPurchases, setItems: setExtendedPurchases, clearCheckedItems } = useCartStore()
```

Tất cả đều subscribe toàn bộ store thay vì chỉ những gì cần thiết.

---

## 3. Cách Fix (Solution)

### Fix 1: `src/stores/cart.store.ts` - Thêm `useShallow`

```typescript
// ✅ ĐÚNG - Import useShallow
import { useShallow } from 'zustand/react/shallow'

// ✅ ĐÚNG - Dùng useShallow cho derived arrays
export const useCheckedItems = () => 
  useCartStore(useShallow((s) => s.items.filter((item) => item.isChecked)))
```

**Giải thích**: `useShallow` thực hiện shallow equality comparison trên nội dung array thay vì so sánh reference. Nếu các phần tử trong array giống nhau, sẽ không trigger re-render.

### Fix 2: `src/pages/Cart/Cart.tsx` - Selective subscriptions

**Before:**
```typescript
// ❌ SAI
const { items: extendedPurchases, setItems, toggleCheck, selectAll, updateQuantity } = useCartStore()
```

**After:**
```typescript
// ✅ ĐÚNG - Subscribe riêng từng thứ cần
const extendedPurchases = useCartItems()
const setItems = useCartStore((s) => s.setItems)
const toggleCheck = useCartStore((s) => s.toggleCheck)
const selectAll = useCartStore((s) => s.selectAll)
const updateQuantity = useCartStore((s) => s.updateQuantity)
```

**Giải thích**:
- `useCartItems()` chỉ subscribe vào `items`, không phải toàn bộ store
- Mỗi action selector (`s.setItems`, `s.toggleCheck`...) trả về **STABLE reference** - actions trong Zustand không bao giờ thay đổi

### Fix 3: Optimistic hooks - Individual selectors

**Before:**
```typescript
// ❌ useOptimisticAddToCart.ts
const { addOptimisticItem, replaceTempItems, removeTempItems } = useCartStore()
```

**After:**
```typescript
// ✅ useOptimisticAddToCart.ts
const addOptimisticItem = useCartStore((s) => s.addOptimisticItem)
const replaceTempItems = useCartStore((s) => s.replaceTempItems)
const removeTempItems = useCartStore((s) => s.removeTempItems)
```

Tương tự cho các hooks khác:

```typescript
// ✅ useOptimisticRemoveFromCart.ts
const removeItems = useCartStore((s) => s.removeItems)
const restoreItems = useCartStore((s) => s.restoreItems)

// ✅ useOptimisticUpdateQuantity.ts
const updateQuantity = useCartStore((s) => s.updateQuantity)
```

### Fix 4: `src/hooks/useCheckout.ts`

**Before:**
```typescript
// ❌ SAI
const { items: extendedPurchases, setItems: setExtendedPurchases, clearCheckedItems } = useCartStore()
```

**After:**
```typescript
// ✅ ĐÚNG
const extendedPurchases = useCartItems()
const setExtendedPurchases = useCartStore((s) => s.setItems)
const clearCheckedItems = useCartStore((s) => s.clearCheckedItems)
```

---

## 4. Tại Sao Fix Này Hoạt Động (Why This Works)

**Flow SAU KHI fix:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. purchasesInCart data arrives từ React Query                     │
│                           ↓                                         │
│  2. useEffect chạy → gọi setItems(newItems)                        │
│                           ↓                                         │
│  3. setItems thay đổi state.items trong Zustand store              │
│                           ↓                                         │
│  4. useCartItems() detect items changed → component RE-RENDER      │
│                           ↓                                         │
│  5. useEffect CHECK dependencies:                                   │
│     - purchasesInCart: KHÔNG đổi (React Query cache)               │
│     - setItems: KHÔNG đổi (stable reference từ selector)           │
│     - pathname, navigate: KHÔNG đổi                                │
│                           ↓                                         │
│  6. useEffect KHÔNG chạy lại vì dependencies không đổi             │
│                           ↓                                         │
│  ✅ KHÔNG CÓ INFINITE LOOP!                                         │
└─────────────────────────────────────────────────────────────────────┘
```

**Điểm mấu chốt**: `setItems` giờ là stable reference vì được lấy qua individual selector `useCartStore((s) => s.setItems)`. Actions trong Zustand store KHÔNG BAO GIỜ thay đổi reference.

---

## 5. Các Pattern Quan Trọng Khi Dùng Zustand

| Pattern | Đúng ✅ | Sai ❌ |
|---------|---------|--------|
| Lấy state | `useStore((s) => s.items)` | `useStore()` |
| Lấy action | `useStore((s) => s.setItems)` | `const { setItems } = useStore()` |
| Derived array | `useStore(useShallow((s) => s.items.filter(...)))` | `useStore((s) => s.items.filter(...))` |
| Đọc không subscribe | `useStore.getState().items` | - |

### Quy tắc vàng:

1. **KHÔNG BAO GIỜ** dùng `useStore()` không có selector
2. **LUÔN** dùng `useShallow` cho derived arrays/objects (filter, map, reduce...)
3. **Select actions riêng lẻ** - actions là stable references
4. **Dùng `useStore.getState()`** khi cần đọc state mà không cần subscribe (trong event handlers, callbacks)
5. **Return primitive values** (boolean, number, string) từ selectors khi có thể - primitives so sánh bằng value, không phải reference

---

## 6. Danh Sách Files Đã Sửa

| File | Thay đổi |
|------|----------|
| `src/stores/cart.store.ts` | Thêm `useShallow` cho `useCheckedItems` selector |
| `src/pages/Cart/Cart.tsx` | Đổi từ destructuring sang individual selectors |
| `src/hooks/useOptimisticAddToCart.ts` | Đổi sang individual selectors cho actions |
| `src/hooks/useOptimisticRemoveFromCart.ts` | Đổi sang individual selectors cho actions |
| `src/hooks/useOptimisticUpdateQuantity.ts` | Đổi sang individual selector cho `updateQuantity` |
| `src/hooks/useCheckout.ts` | Đổi sang `useCartItems()` và individual selectors |

---

## 7. Bài Học Rút Ra (Lessons Learned)

### Khi migrate từ React Context sang Zustand:

1. **PHẢI dùng selective subscriptions** - đây là điểm mạnh chính của Zustand so với Context

2. **`useStore()` không có selector = subscribe toàn bộ store** - giống hệt như dùng Context Provider, mất hết lợi ích của Zustand

3. **Zustand mạnh ở selective subscriptions**, nhưng chỉ khi dùng đúng cách. Dùng sai thì còn tệ hơn Context vì dễ tạo infinite loop

4. **`useShallow` là BẮT BUỘC** cho derived state (filter, map, reduce trả về object/array mới)

5. **Actions là stable references** - có thể destructure actions nếu muốn, nhưng tốt nhất vẫn dùng individual selectors để consistent

### Quick checklist khi dùng Zustand:

- [ ] Không có `useStore()` không selector trong codebase
- [ ] Tất cả derived arrays/objects dùng `useShallow`
- [ ] Actions được select riêng lẻ
- [ ] Không có infinite loop warnings trong console

---

*Tài liệu này được tạo sau khi fix bug infinite loop trên trang Cart. Lưu lại để tham khảo cho các lần migrate state management trong tương lai.*

