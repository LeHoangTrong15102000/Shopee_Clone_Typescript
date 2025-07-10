# 🚀 Higher Order Functions & Closures trong Shopee Clone TypeScript

## 📖 Mục Lục

1. [Giới thiệu về Higher Order Functions](#giới-thiệu-về-higher-order-functions)
2. [Giới thiệu về Closures](#giới-thiệu-về-closures)
3. [Higher Order Functions trong dự án](#higher-order-functions-trong-dự-án)
4. [Closures trong dự án](#closures-trong-dự-án)
5. [React Hooks và Closures](#react-hooks-và-closures)
6. [Performance và Memory Management](#performance-và-memory-management)
7. [Best Practices](#best-practices)
8. [Kết luận](#kết-luận)

---

## 🎯 Giới thiệu về Higher Order Functions

### 📚 **Định nghĩa**

**Higher Order Function (HOF)** là một function có ít nhất một trong những đặc điểm sau:

1. **Nhận một hoặc nhiều functions làm arguments**
2. **Return về một function**

### 🔍 **Tại sao HOF quan trọng?**

- ✅ **Code Reusability**: Tái sử dụng logic
- ✅ **Functional Programming**: Lập trình hàm
- ✅ **Abstraction**: Trừu tượng hóa logic phức tạp
- ✅ **Composition**: Kết hợp các functions

---

## 🔐 Giới thiệu về Closures

### 📚 **Định nghĩa**

**Closure** là một function có thể **truy cập vào variables từ outer scope** ngay cả khi outer function đã kết thúc thực thi.

### 🧠 **Cách hoạt động**

```javascript
function outerFunction(x) {
  // Outer scope variable
  return function innerFunction(y) {
    // Inner function có thể truy cập x từ outer scope
    return x + y
  }
}

const addFive = outerFunction(5) // x = 5 được "đóng gói" trong closure
console.log(addFive(10)) // 15 - x vẫn được nhớ!
```

---

## 🛍️ Higher Order Functions trong dự án

### 1. **Array Methods - Map, Filter, Reduce**

#### 📍 **Trong ProductList.tsx**

```typescript
// src/pages/ProductList/ProductList.tsx (dòng 82-86)
{productsData.data.data.products.map((product, index) => (
  <div className='col-span-1' key={product._id}>
    <Product product={product} />
  </div>
))}
```

**Phân tích:**

- `map()` là Higher Order Function
- Nhận vào một **callback function** `(product, index) => JSX`
- Return về array mới của JSX elements

#### 📍 **Trong Cart.tsx - Complex Data Processing**

```typescript
// src/pages/Cart/Cart.tsx (dòng 83-87)
const checkedPurchases = useMemo(() => extendedPurchases.filter((purchase) => purchase.isChecked), [extendedPurchases])

// Tính tổng tiền (dòng 92-97)
const totalCheckedPurchasePrice = useMemo(
  () =>
    checkedPurchases.reduce((result, currentPurchase) => result + currentPurchase.price * currentPurchase.buy_count, 0),
  [checkedPurchases]
)

// Tính tiền tiết kiệm (dòng 101-107)
const totalCheckedPurchaseSavingPrice = useMemo(
  () =>
    checkedPurchases.reduce(
      (result, currentPurchase) =>
        result + (currentPurchase.price_before_discount - currentPurchase.price) * currentPurchase.buy_count,
      0
    ),
  [checkedPurchases]
)
```

**Phân tích HOF:**

1. **`filter()`**: HOF nhận callback `(purchase) => purchase.isChecked`
2. **`reduce()`**: HOF nhận callback `(result, currentPurchase) => calculation`
3. **`useMemo()`**: HOF nhận callback function để memoize kết quả

#### 📍 **Trong Home.tsx - Data Slicing**

```typescript
// src/pages/Home/Home.tsx
{categories.slice(0, 16).map((category) => (
  <CategoryCard key={category._id} category={category} />
))}

{featuredProducts.slice(0, 6).map((product) => (
  <ProductCard key={product._id} product={product} />
))}

{newProducts.slice(0, 12).map((product) => (
  <ProductCard key={product._id} product={product} />
))}
```

**Phân tích:**

- **`slice()`**: HOF method để cắt array
- **`map()`**: HOF để transform data

### 2. **Lodash Higher Order Functions**

#### 📍 **omitBy trong useQueryConfig.tsx**

```typescript
// src/hooks/useQueryConfig.tsx (dòng 13-25)
const queryConfig: QueryConfig = omitBy(
  {
    page: queryParams.page || '1',
    limit: queryParams.limit || '20',
    sort_by: queryParams.sort_by,
    exclude: queryParams.exclude,
    name: queryParams.name,
    order: queryParams.order,
    price_max: queryParams.price_max,
    price_min: queryParams.price_min,
    rating_filter: queryParams.rating_filter,
    category: queryParams.category
  },
  isUndefined // Predicate function
)
```

**Phân tích:**

- `omitBy()` là HOF từ Lodash
- Nhận **predicate function** `isUndefined`
- Return object mới sau khi loại bỏ properties undefined

#### 📍 **keyBy trong Cart.tsx**

```typescript
// src/pages/Cart/Cart.tsx (dòng 114-115)
const extendedPurchasesObject = keyBy(prev, '_id')
// Tương đương với:
// keyBy(array, iteratee) - iteratee có thể là function hoặc property path
```

**Phân tích:**

- `keyBy()` là HOF từ Lodash
- Có thể nhận function làm iteratee: `keyBy(array, item => item.id)`
- Hoặc property path: `keyBy(array, '_id')`

#### 📍 **omit trong nhiều components**

```typescript
// src/pages/Register/Register.tsx (dòng 54)
const body = omit(data, ['confirm_password'])

// src/pages/User/pages/ChangePassword/ChangePassword.tsx (dòng 42)
const res = await updateProfileMutation.mutateAsync(omit(data, ['confirm_password']))

// src/hooks/useSearchProducts.tsx (dòng 35-36)
const config = queryConfig.order
  ? omit({ ...queryConfig, name: data.name }, ['order', 'sort_by'])
  : { ...queryConfig, name: data.name }
```

**Phân tích:**

- `omit()` là HOF utility function
- Loại bỏ specified properties từ object
- Return new object (immutable operation)

### 3. **Custom Higher Order Functions**

#### 📍 **Event Handler Factories (Currying Pattern)**

```typescript
// src/pages/Cart/Cart.tsx (dòng 148-152)
const handleChecked = (purchaseIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
  setExtendedPurchases(
    produce((draft) => {
      draft[purchaseIndex].isChecked = event.target.checked
    })
  )
}
```

**Phân tích Currying:**

- **Level 1**: `handleChecked(purchaseIndex)`
- **Level 2**: Return function `(event) => {...}`
- **Closure**: Inner function có thể access `purchaseIndex`
- **Usage**: `handleChecked(index)` creates specific handler

#### 📍 **More Currying Examples**

```typescript
// src/pages/Cart/Cart.tsx (dòng 171-175)
const handleTypeQuantity = (purchaseIndex: number) => (value: number) => {
  setExtendedPurchases(
    produce((draft) => {
      draft[purchaseIndex].buy_count = value
    })
  )
}

// src/pages/Cart/Cart.tsx (dòng 194-203)
const handleDelete = (purchaseIndex: number) => () => {
  const purchaseId = extendedPurchases[purchaseIndex]._id
  deletePurchasesMutation.mutate([purchaseId], {
    onSuccess: () => {
      toast.success('Xoá sản phẩm thành công!')
    }
  })
}
```

**Tại sao sử dụng Currying?**

- ✅ **Partial Application**: Apply arguments từng bước
- ✅ **Event Handler Optimization**: Tạo stable references
- ✅ **Code Reusability**: Tái sử dụng với different parameters
- ✅ **Better Performance**: Tránh tạo anonymous functions trong render

---

## 🔐 Closures trong dự án

### 1. **useDebounce Hook - Classic Closure Example**

```typescript
// src/hooks/useDebounce.tsx
const useDebounce = (value: null | FormData['name'], delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Closure: handler function có thể access value và setDebouncedValue
    const handler = setTimeout(() => setDebouncedValue(value?.trim() as string), delay)

    // Cleanup closure: return function có thể access handler
    return () => clearTimeout(handler)
  }, [value])

  return debouncedValue
}
```

**Phân tích Closure:**

1. **Outer scope**: `value`, `delay`, `setDebouncedValue`
2. **Inner functions**:
   - `setTimeout callback`: access `value`, `setDebouncedValue`
   - `cleanup function`: access `handler`
3. **Persistence**: Variables được "nhớ" qua các lần re-render

### 2. **Event Handlers with Closure**

#### 📍 **SearchSuggestions Component**

```typescript
// src/components/Header/SearchSuggestions/SearchSuggestions.tsx (dòng 98-108)
const handleSelectSuggestion = useCallback(
  (suggestion: string) => {
    onSelectSuggestion(suggestion) // Closure: access prop function
    productApi.saveSearchHistory({ keyword: suggestion }).catch((error) => {
      console.warn('Không thể lưu lịch sử tìm kiếm:', error)
    })
    onHide() // Closure: access prop function
  },
  [onSelectSuggestion, onHide] // Dependencies captured in closure
)

const handleImageError = useCallback(
  (event: React.SyntheticEvent<HTMLImageElement>, productId: string) => {
    const img = event.target as HTMLImageElement

    // Closure: access state variable
    if (!failedImages.has(productId)) {
      // Closure: access setState function
      setFailedImages((prev) => new Set(prev).add(productId))
      img.src = 'data:image/svg+xml;base64,...'
    }
  },
  [failedImages] // Closure dependency
)
```

**Closure Analysis:**

- **Captured variables**: `onSelectSuggestion`, `onHide`, `failedImages`, `setFailedImages`
- **useCallback**: Memoizes closures để tránh unnecessary re-renders
- **Dependencies**: Khi dependencies thay đổi, closure được tạo lại

### 3. **Component State Closures**

#### 📍 **ProductReviews Component**

```typescript
// src/components/ProductReviews/ProductReviews.tsx (dòng 75-85)
const handleLike = (reviewId: string) => {
  likeMutation.mutate(reviewId, {
    onSuccess: () => {
      // Closure: access queryClient and productId from outer scope
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi thích đánh giá')
    }
  })
}
```

### 4. **useMemo Closures**

#### 📍 **Complex Calculations with Closure**

```typescript
// src/components/Header/SearchSuggestions/SearchSuggestions.tsx (dòng 75-87)
const suggestions = useMemo(
  () =>
    suggestionsData?.data.data.suggestions ||
    (suggestionsError && debouncedSearchValue
      ? [
          `${debouncedSearchValue} samsung`, // Closure: access debouncedSearchValue
          `${debouncedSearchValue} iphone`,
          `${debouncedSearchValue} oppo`,
          `${debouncedSearchValue} xiaomi`
        ].filter((item) => item.trim() !== debouncedSearchValue) // Closure again
      : []),
  [suggestionsData, suggestionsError, debouncedSearchValue] // Dependencies
)

const products = useMemo(
  () =>
    suggestionsData?.data.data.products ||
    (suggestionsError && debouncedSearchValue
      ? mockProducts.filter((product) =>
          // Closure: access debouncedSearchValue in nested function
          product.name.toLowerCase().includes(debouncedSearchValue.toLowerCase())
        )
      : []),
  [suggestionsData, suggestionsError, debouncedSearchValue]
)
```

---

## ⚛️ React Hooks và Closures

### 1. **useEffect Closures**

#### 📍 **Component Lifecycle Management**

```typescript
// src/pages/Cart/Cart.tsx (dòng 109-139)
useEffect(() => {
  setExtendedPurchases((prev) => {
    // Closure: access purchasesInCart, choosenPurchaseIdFromLocation
    const extendedPurchasesObject = keyBy(prev, '_id')

    return (
      purchasesInCart?.map((purchase) => {
        // Nested closure: access choosenPurchaseIdFromLocation
        const isChoosenPurchaseIdFromLocation = choosenPurchaseIdFromLocation === purchase._id
        return {
          ...purchase,
          disabled: false,
          isChecked: isChoosenPurchaseIdFromLocation || Boolean(extendedPurchasesObject[purchase._id]?.isChecked)
        }
      }) || []
    )
  })

  // Timer closure
  const handler = setTimeout(
    () =>
      // Closure: access navigate, pathname
      navigate(pathname, { state: null, replace: true }),
    500
  )

  // Cleanup closure
  return () => clearTimeout(handler)
}, [purchasesInCart, choosenPurchaseIdFromLocation, setExtendedPurchases, pathname, navigate])
```

### 2. **Custom Hooks Closures**

#### 📍 **useQueryConfig Hook**

```typescript
// src/hooks/useQueryConfig.tsx
const useQueryConfig = () => {
  const queryParams: QueryConfig = useQueryParams() // Closure: access external hook

  // Closure: access queryParams
  const queryConfig: QueryConfig = omitBy(
    {
      page: queryParams.page || '1',
      limit: queryParams.limit || '20',
      sort_by: queryParams.sort_by
      // ... other properties
    },
    isUndefined
  )

  return queryConfig // Return computed value
}
```

#### 📍 **useSearchProducts Hook**

```typescript
// src/hooks/useSearchProducts.tsx
const useSearchProducts = () => {
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()
  const queryConfig = useQueryConfig()

  // Closure: access navigate, queryConfig
  const onSubmitSearch = handleSubmit((data) => {
    const config = queryConfig.order
      ? omit({ ...queryConfig, name: data.name }, ['order', 'sort_by'])
      : { ...queryConfig, name: data.name }

    // Closure: access navigate
    navigate({
      pathname: path.home,
      search: createSearchParams(config).toString()
    })
  })

  return { onSubmitSearch, register }
}
```

---

## 🚀 Performance và Memory Management

### 1. **Memory Leaks Prevention**

#### 📍 **Cleanup Functions**

```typescript
// src/App.tsx (dòng 39-46)
useEffect(() => {
  // Closure: access reset function
  LocalStorageEventTarget.addEventListener('clearLS', reset)

  // Cleanup closure để prevent memory leaks
  return () => {
    LocalStorageEventTarget.removeEventListener('clearLS', reset)
  }
}, [reset])

// src/pages/Cart/Cart.tsx (dòng 142-146)
useEffect(() => {
  // Cleanup closure
  return () => {
    history.replaceState(null, '') // Clear state on unmount
  }
}, [])
```

### 2. **useCallback for Performance**

#### 📍 **Stable References**

```typescript
// src/components/Header/SearchSuggestions/SearchSuggestions.tsx
const handleSelectSuggestion = useCallback(
  (suggestion: string) => {
    // Closure với stable reference
    onSelectSuggestion(suggestion)
    onHide()
  },
  [onSelectSuggestion, onHide] // Dependencies captured
)

// Usage: Tránh re-render unnecessary
<SearchSuggestionItem
  onSelect={handleSelectSuggestion} // Stable reference
/>
```

### 3. **useMemo for Expensive Calculations**

#### 📍 **Optimized Computations**

```typescript
// src/pages/Cart/Cart.tsx
const isAllChecked = useMemo(
  () => extendedPurchases.every((purchase) => purchase.isChecked), // Closure: access extendedPurchases
  [extendedPurchases]
)

const checkedPurchases = useMemo(
  () => extendedPurchases.filter((purchase) => purchase.isChecked), // Closure
  [extendedPurchases]
)
```

---

## 💡 Best Practices

### 1. **Currying for Event Handlers**

```typescript
// ✅ Good: Currying pattern
const handleItemClick = (itemId: string) => (event: React.MouseEvent) => {
  // Handle click with itemId
}

// Usage:
{items.map(item => (
  <div key={item.id} onClick={handleItemClick(item.id)}>
    {item.name}
  </div>
))}

// ❌ Bad: Anonymous functions in render
{items.map(item => (
  <div key={item.id} onClick={() => handleClick(item.id)}>
    {item.name}
  </div>
))}
```

### 2. **Proper Dependency Management**

```typescript
// ✅ Good: Proper dependencies
const callback = useCallback(() => {
  doSomething(value)
}, [value]) // Include all dependencies

// ❌ Bad: Missing dependencies
const callback = useCallback(() => {
  doSomething(value)
}, []) // Missing 'value' dependency
```

### 3. **Cleanup Closures**

```typescript
// ✅ Good: Always cleanup
useEffect(() => {
  const handler = setTimeout(() => {
    // Do something
  }, 1000)

  return () => clearTimeout(handler) // Cleanup closure
}, [])

// ❌ Bad: No cleanup
useEffect(() => {
  setTimeout(() => {
    // Do something
  }, 1000) // Memory leak potential
}, [])
```

### 4. **Avoid Closure Pitfalls**

```typescript
// ❌ Stale Closure Problem
const [count, setCount] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1) // Stale closure - count is always 0
  }, 1000)

  return () => clearInterval(interval)
}, []) // Empty dependency array

// ✅ Solution 1: Proper dependencies
useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1)
  }, 1000)

  return () => clearInterval(interval)
}, [count])

// ✅ Solution 2: Functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount((prev) => prev + 1) // No stale closure
  }, 1000)

  return () => clearInterval(interval)
}, [])
```

---

## 🎯 Patterns trong Dự án

### 1. **Factory Pattern với HOF**

```typescript
// Pattern: Create specialized functions
const createEventHandler = (type: string) => (data: any) => {
  switch (type) {
    case 'click':
      return handleClick(data)
    case 'change':
      return handleChange(data)
    default:
      return handleDefault(data)
  }
}

// Usage
const clickHandler = createEventHandler('click')
const changeHandler = createEventHandler('change')
```

### 2. **Composition Pattern**

```typescript
// src/hooks/useQueryConfig.tsx
const useQueryConfig = () => {
  const queryParams = useQueryParams() // Compose with other hook

  return omitBy(
    {
      // Compose with lodash HOF
      page: queryParams.page || '1'
      // ... other properties
    },
    isUndefined
  )
}
```

### 3. **Observer Pattern với Closures**

```typescript
// src/App.tsx
LocalStorageEventTarget.addEventListener('clearLS', reset)

// reset function maintains closure over context
const reset = () => {
  setIsAuthenticated(false)
  setExtendedPurchases([])
  setProfile(null)
}
```

---

## 🎉 Kết luận

### 📊 **Higher Order Functions trong Shopee Clone:**

1. **Array Methods**: `map()`, `filter()`, `reduce()`, `slice()` - 95% components
2. **Lodash Utils**: `omit()`, `omitBy()`, `keyBy()` - Data transformation
3. **React Hooks**: `useMemo()`, `useCallback()`, `useEffect()` - Performance optimization
4. **Custom Currying**: Event handlers với multiple parameters

### 🔐 **Closures Applications:**

1. **Event Handlers**: Capture scope variables for dynamic behavior
2. **React Hooks**: State và effect management
3. **Custom Hooks**: Encapsulate complex logic
4. **Memory Management**: Cleanup functions và resource management

### 💪 **Benefits Achieved:**

- ✅ **Code Reusability**: HOF patterns giảm duplicate code
- ✅ **Performance**: Proper memoization với closures
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Type Safety**: TypeScript + HOF = Better developer experience
- ✅ **Memory Safety**: Proper cleanup prevents leaks

### 🚀 **Key Takeaways:**

1. **HOF là foundation** của functional programming trong React
2. **Closures enable** powerful patterns như currying và memoization
3. **Proper dependency management** critical cho performance
4. **Always cleanup** để avoid memory leaks
5. **TypeScript enhances** HOF và closure safety

---

**📝 Tác giả**: Dự án Shopee Clone TypeScript  
**📅 Ngày tạo**: 2024  
**🔄 Cập nhật**: React 18.0+ Features và Modern Patterns

---

_"Higher Order Functions and Closures are not just programming concepts - they are the building blocks of elegant, maintainable, and performant React applications."_
