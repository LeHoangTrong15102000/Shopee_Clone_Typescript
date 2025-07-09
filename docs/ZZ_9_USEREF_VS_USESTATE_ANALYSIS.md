# Deep Dive: useRef vs useState - Phân Tích Chi Tiết

## Tổng Quan

Trong React, `useRef` và `useState` là hai hooks quan trọng nhưng phục vụ các mục đích khác nhau. Qua việc phân tích codebase của dự án Shopee Clone, chúng ta sẽ hiểu rõ sự khác biệt và cách sử dụng của từng hook.

## 1. useRef - Tham Chiếu Đến DOM Elements

### Khái Niệm

`useRef` tạo ra một tham chiếu (reference) đến DOM element hoặc giữ một giá trị mutable không gây re-render.

### Các Trường Hợp Sử Dụng trong Dự Án

#### 1.1. Tham Chiếu đến Input Element (Header.tsx)

```typescript
// src/components/Header/Header.tsx
const inputRef = useRef<HTMLInputElement>(null)
const searchContainerRef = useRef<HTMLDivElement>(null)

// Sử dụng để blur input khi cần
inputRef.current?.blur()

// Kiểm tra click outside
if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
  setShowSuggestions(false)
}
```

**Mục đích:**

- Truy cập trực tiếp DOM element để thực hiện các thao tác như blur, focus
- Kiểm tra click outside để đóng dropdown
- Không gây re-render khi giá trị thay đổi

#### 1.2. File Input Reference (InputFile.tsx)

```typescript
// src/components/InputFile/InputFile.tsx
const fileInputRef = useRef<HTMLInputElement>(null)

const handleUpload = () => {
  fileInputRef.current?.click() // Kích hoạt file dialog
}
```

**Mục đích:**

- Điều khiển hidden file input
- Trigger file selection programmatically

#### 1.3. Image Zoom Effect (ProductDetail.tsx)

```typescript
// src/pages/ProductDetail/ProductDetail.tsx
const imageRef = useRef<HTMLImageElement>(null)

const handleZoom = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const image = imageRef.current as HTMLImageElement
  const { naturalHeight, naturalWidth } = image

  // Thao tác trực tiếp với style của image
  image.style.width = naturalWidth + 'px'
  image.style.height = naturalHeight + 'px'
  image.style.top = top + 'px'
  image.style.left = left + 'px'
}

const handleRemoveZoom = () => {
  imageRef.current?.removeAttribute('style')
}
```

**Mục đích:**

- Truy cập trực tiếp DOM để thao tác với style
- Tạo hiệu ứng zoom mà không cần re-render

#### 1.4. Arrow Reference for Popover (Popover.tsx)

```typescript
// src/components/Popover/Popover.tsx
const arrowRef = useRef<HTMLElement>(null)

const { x, y, refs, strategy, middlewareData } = useFloating({
  middleware: [
    offset(6),
    shift(),
    arrow({
      element: arrowRef // Truyền ref cho floating-ui
    })
  ]
})
```

**Mục đích:**

- Cung cấp element reference cho thư viện floating-ui
- Positioning arrow của popover

## 2. useState - Quản Lý State Component

### Khái Niệm

`useState` quản lý state của component, mỗi lần state thay đổi sẽ trigger re-render.

### Các Trường Hợp Sử Dụng trong Dự Án

#### 2.1. Form Input State (Header.tsx)

```typescript
// src/components/Header/Header.tsx
const [searchValue, setSearchValue] = useState<string>('')
const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = event.target
  setSearchValue(value) // Gây re-render để update UI
}
```

**Mục đích:**

- Quản lý giá trị input
- Điều khiển hiển thị dropdown suggestions

#### 2.2. Image Gallery State (ProductDetail.tsx)

```typescript
// src/pages/ProductDetail/ProductDetail.tsx
const [currentIndexImages, setCurrentIndexImages] = useState([0, 5])
const [activeImage, setActiveImage] = useState('')
const [buyCount, setBuyCount] = useState(1)

// Thay đổi ảnh active khi hover
const hoverActiveImage = (img: string) => {
  setActiveImage(img) // Re-render để hiển thị ảnh mới
}
```

**Mục đích:**

- Quản lý ảnh đang được hiển thị
- Điều khiển slider images
- Quản lý số lượng sản phẩm mua

#### 2.3. Modal State (Popover.tsx)

```typescript
// src/components/Popover/Popover.tsx
const [isOpen, setIsOpen] = useState(initialOpen || false)

const showPopover = () => {
  setIsOpen(true) // Re-render để hiện popover
}

const hidePopover = () => {
  setIsOpen(false) // Re-render để ẩn popover
}
```

## 3. So Sánh Chi Tiết useRef vs useState

| Tiêu Chí           | useRef                            | useState                             |
| ------------------ | --------------------------------- | ------------------------------------ |
| **Re-render**      | ❌ Không gây re-render            | ✅ Gây re-render                     |
| **Mutable**        | ✅ Có thể thay đổi trực tiếp      | ❌ Immutable, cần setter             |
| **Persistence**    | ✅ Giữ nguyên giá trị qua renders | ✅ Giữ nguyên giá trị qua renders    |
| **Initial Value**  | Gán trực tiếp                     | Qua initializer                      |
| **Access Pattern** | `ref.current`                     | `[value, setter]`                    |
| **Use Cases**      | DOM manipulation, timers, caching | UI state, form data, component state |

## 4. Khi Nào Sử Dụng useRef?

### ✅ Nên sử dụng useRef khi:

1. **Truy cập DOM elements**

```typescript
// Focus vào input
const inputRef = useRef<HTMLInputElement>(null)
inputRef.current?.focus()
```

2. **Lưu trữ giá trị không cần re-render**

```typescript
// Lưu timer ID
const timerRef = useRef<NodeJS.Timeout>()
timerRef.current = setTimeout(() => {}, 1000)
```

3. **Tương tác với thư viện bên ngoài**

```typescript
// Chart.js, D3, floating-ui
const chartRef = useRef<HTMLCanvasElement>(null)
```

4. **Previous value tracking**

```typescript
const prevValueRef = useRef(value)
useEffect(() => {
  prevValueRef.current = value
})
```

### ❌ Không nên sử dụng useRef khi:

1. **Cần re-render UI** → Dùng useState
2. **Form input values** → Dùng useState hoặc controlled components
3. **Conditional rendering** → Dùng useState
4. **Component state management** → Dùng useState

## 5. Khi Nào Sử Dụng useState?

### ✅ Nên sử dụng useState khi:

1. **Giá trị ảnh hưởng đến UI**

```typescript
const [isVisible, setIsVisible] = useState(false)
return isVisible ? <Modal /> : null
```

2. **Form inputs**

```typescript
const [email, setEmail] = useState('')
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

3. **Component state**

```typescript
const [loading, setLoading] = useState(false)
const [data, setData] = useState(null)
```

4. **Toggle states**

```typescript
const [isOpen, setIsOpen] = useState(false)
```

## 6. Performance Considerations

### useRef Performance

- ✅ Không gây re-render → Hiệu suất cao
- ✅ Truy cập DOM trực tiếp → Nhanh
- ⚠️ Có thể bypass React lifecycle → Cần cẩn thận

### useState Performance

- ⚠️ Gây re-render → Có thể ảnh hưởng hiệu suất
- ✅ Integrate với React lifecycle
- ✅ Predictable state updates

## 7. Anti-patterns và Best Practices

### ❌ Anti-patterns

```typescript
// Sai: Dùng useRef cho state UI
const countRef = useRef(0)
const increment = () => {
  countRef.current++ // UI không update!
}

// Sai: Dùng useState cho DOM manipulation
const [element, setElement] = useState<HTMLElement>()
// Phức tạp và không cần thiết
```

### ✅ Best Practices

```typescript
// Đúng: useRef cho DOM
const inputRef = useRef<HTMLInputElement>(null)

// Đúng: useState cho UI state
const [count, setCount] = useState(0)

// Đúng: Combine cả hai
const [searchValue, setSearchValue] = useState('')
const inputRef = useRef<HTMLInputElement>(null)

const handleSubmit = () => {
  if (searchValue.trim()) {
    // Process search
    inputRef.current?.blur() // Close keyboard on mobile
  }
}
```

## 8. Practical Examples từ Dự Án

### Example 1: Search Component Pattern

```typescript
// Kết hợp useRef và useState hiệu quả
const [searchValue, setSearchValue] = useState<string>('')
const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
const inputRef = useRef<HTMLInputElement>(null)
const searchContainerRef = useRef<HTMLDivElement>(null)

// useState cho reactive data
const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
  setSearchValue(event.target.value) // Update UI
}

// useRef cho DOM manipulation
const handleSubmit = () => {
  inputRef.current?.blur() // No re-render needed
  setShowSuggestions(false) // Update UI
}
```

### Example 2: Image Zoom Pattern

```typescript
// useState cho state management
const [activeImage, setActiveImage] = useState('')

// useRef cho direct DOM manipulation
const imageRef = useRef<HTMLImageElement>(null)

const handleZoom = (event: React.MouseEvent) => {
  // Direct style manipulation - no re-render
  const image = imageRef.current!
  image.style.transform = `scale(2)`
}

const hoverActiveImage = (img: string) => {
  // State change - triggers re-render
  setActiveImage(img)
}
```

## 9. Kết Luận

### useRef:

- **Mục đích**: Tham chiếu DOM, lưu trữ mutable values
- **Đặc điểm**: Không gây re-render, truy cập trực tiếp
- **Use cases**: DOM manipulation, timers, third-party libraries

### useState:

- **Mục đích**: Quản lý component state
- **Đặc điểm**: Gây re-render, immutable updates
- **Use cases**: UI state, form inputs, conditional rendering

### Quy Tắc Vàng:

> **"Nếu thay đổi giá trị cần update UI → dùng useState"**
>
> **"Nếu cần truy cập DOM hoặc lưu trữ giá trị không ảnh hưởng UI → dùng useRef"**

Hiểu rõ sự khác biệt này sẽ giúp bạn viết code React hiệu quả hơn và tránh được những lỗi thường gặp trong quá trình phát triển.
