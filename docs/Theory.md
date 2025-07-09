# 📚 Kiến Thức React TypeScript - Shopee Clone

## 🎯 Mục Lục

- [Chương 15: Setup Project](#chương-15-setup-project)
- [Chương 16: Register & Login](#chương-16-register--login)
- [Chương 17: Authentication](#chương-17-authentication)
- [Chương 18: Layout & Navigation](#chương-18-layout--navigation)
- [Chương 19: Product List](#chương-19-product-list)
- [Chương 20: Product Detail](#chương-20-product-detail)

---

## 📖 Chương 15: Setup Project

### 🎬 Video 152: Tạo Structure Project

```typescript
// Tạo folder layouts chứa những layout của dự án
// Tạo folder pages chứa những trang của dự án
```

### 🎬 Video 153: Code UI Trang Register

- **TailwindCSS**: Mobile first design (code mobile trước, desktop sau)
- **Responsive Design**: Sử dụng breakpoints của Tailwind

---

## 🔐 Chương 16: Register & Login

### 🎬 Video 155: Validate Register Form với React Hook Form

#### 📝 Register Function

```typescript
/**
 * register sẽ return về một object:
 * {
 *   onChange: ChangeHandler;
 *   onBlur: ChangeHandler;
 *   ref: RefCallBack;
 *   name: TFieldName;
 *   min?: string | number;
 *   max?: string | number;
 *   maxLength?: number;
 *   minLength?: number;
 *   pattern?: string;
 *   required?: boolean;
 *   disabled?: boolean;
 * }
 */
```

#### ⚡ Key Points

- **Client-side Validation**: Giảm thiểu tải lên server
- **Error Handling**: Errors sẽ re-render khi form submit
- **Rules Configuration**: Tạo file riêng để quản lý validation rules
- **Type Safety**: Sử dụng `RegisterOptions` cho type checking

#### 🔄 React Hook Form Behavior

- **Re-render Logic**: RHF tự động re-render theo cơ chế tối ưu UX
- **Validation Timing**: Validate khi submit, sau đó validate khi change

### 🎬 Video 156: Xử Lý Confirm Password

#### 🛠️ Methods Quan Trọng

```typescript
// watch() - Lắng nghe input change và re-render component
const email = watch('email')

// getValues() - Lấy giá trị mà không re-render
const password = getValues('password')

// handleSubmit() - Nhận 2 tham số
const onSubmit = handleSubmit(
  (data) => {
    // onValid - Chạy khi form hợp lệ
  },
  (data) => {
    // onInvalid - Chạy khi form có lỗi
  }
)
```

#### ✅ Custom Validation

```typescript
// Validate confirm password
validate: {
  matchPassword: (value) => {
    if (value === getValues('password')) {
      return true
    }
    return 'Nhập lại password không khớp'
  }
}
```

### 🎬 Video 158: Custom Container Class

- **Tailwind Config**: Tùy chỉnh container trong `tailwind.config.js`
- **Responsive Container**: Setup container responsive cho các breakpoints

### 🎬 Video 159: Tạo Component Input

```typescript
// Component Input để tái sử dụng
// Giảm thiểu duplicate code
// Dễ dàng maintain và update
```

### 🎬 Video 160: Sử Dụng Yup Validation

#### 📦 Schema Setup

```typescript
import * as yup from 'yup'

const schema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  password: yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự').required(),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'Nhập lại password không khớp')
    .required()
})
```

#### 🎯 Lợi Ích Yup

- **Type Inference**: Tự động tạo TypeScript types từ schema
- **Cross-field Validation**: Dễ dàng validate giữa các field
- **Omit & Pick**: Tái sử dụng schema với `Omit` và `Pick`

---

## 🌐 Chương 17: Authentication

### 🎬 Video 161: Setup Axios & React Query

- **Axios Configuration**: Setup base URL, interceptors
- **React Query**: Quản lý server state hiệu quả

### 🎬 Video 162: API Interface Declaration

#### 🔗 API Types

```typescript
// auth.type.ts - Interface cho authentication
interface AuthResponse {
  access_token: string
  expires: string
  user: User
}

// utils.type.ts - Interface tiện ích
interface SuccessResponse<Data> {
  message: string
  data: Data
}
```

#### 📡 API Call Pattern

```typescript
// Sử dụng useMutation cho register
const registerMutation = useMutation({
  mutationFn: (body: RegisterBody) => authApi.registerAccount(body),
  onSuccess: (data) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  }
})
```

### 🎬 Video 163: Xử Lý Lỗi 422 từ Server

#### 🛡️ Type Predicate cho Error Handling

```typescript
// Kiểm tra lỗi có phải từ Axios
function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error)
}

// Kiểm tra lỗi 422 (Validation Error)
function isAxiosUnprocessableEntityError<FormError>(error: unknown): error is AxiosError<FormError> {
  return isAxiosError(error) && error.response?.status === 422
}
```

#### 🔧 SetError với React Hook Form

```typescript
// Set lỗi từ server vào form
if (isAxiosUnprocessableEntityError<FormError>(error)) {
  const formError = error.response?.data.data
  if (formError) {
    Object.keys(formError).forEach((key) => {
      setError(key as keyof FormData, {
        message: formError[key],
        type: 'Server'
      })
    })
  }
}
```

### 🎬 Video 164: Axios Interceptor cho Error Handling

#### 🔄 Response Interceptor

```typescript
// Xử lý lỗi global với interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi không phải 422
    if (error.response?.status !== 422) {
      const data = error.response?.data
      const message = data?.message || error.message
      toast.error(message)
    }
    return Promise.reject(error)
  }
)
```

---

## 🧭 Chương 18: Layout & Navigation

### 🎬 Video 165: Logic Trang Login

```typescript
// Sử dụng schema từ register, bỏ confirm_password
const loginSchema = schema.omit(['confirm_password'])
```

### 🎬 Video 166: Code UI Header - MainLayout

#### 💾 Token Storage

```typescript
// Lưu access_token vào localStorage sau khi login thành công
// Redirect về trang chủ
```

### 🎬 Video 167: Floating UI & Framer Motion Popover

#### 🎨 Animation Libraries

- **Floating UI**: Tính toán position cho tooltip, popover
- **Framer Motion**: Xử lý animation
- **Portal**: Render popover ở root level

#### 🔧 Popover Setup

```typescript
// Middleware cho Floating UI
const middleware = [
  offset(5),
  flip(),
  shift(),
  arrow({ element: arrowRef })
];

// Animation với Framer Motion
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {/* Popover content */}
    </motion.div>
  )}
</AnimatePresence>
```

### 🎬 Video 168: Tạo Component Popover

#### 🧩 Component Design

```typescript
interface PopoverProps {
  children: React.ReactNode
  renderPopover: React.ReactNode
  className?: string
  as?: React.ElementType
  initialOpen?: boolean
  placement?: Placement
}

// Sử dụng ElementType cho flexibility
const Component = as || 'div'
```

#### 🎯 Features

- **useId**: Tạo unique ID cho mỗi popover instance
- **Transform Origin**: Animation từ vị trí arrow
- **Event Handling**: Hover, click outside

### 🎬 Video 169: UI Popover Cart

```typescript
// Placement cho popover cart
placement = 'bottom-end'

// Shift middleware tránh overflow
const middleware = [shift()]
```

### 🎬 Video 170: Protected Route & Rejected Route

#### 🛡️ Route Protection

```typescript
// ProtectedRoute - Yêu cầu đăng nhập
const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AppContext);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// RejectedRoute - Chặn khi đã đăng nhập
const RejectedRoute = () => {
  const { isAuthenticated } = useContext(AppContext);
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};
```

### 🎬 Video 171: Authentication Module Hoàn Chỉnh

#### 🚀 Performance Optimization

```typescript
// Tránh tạo object mới trong Context value
const contextValue = useMemo(
  () => ({
    isAuthenticated,
    setIsAuthenticated,
    profile,
    setProfile
  }),
  [isAuthenticated, profile]
)
```

#### 💾 LocalStorage Helper

```typescript
// auth.ts - Utility functions
export const setAccessTokenToLS = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}

export const getAccessTokenFromLS = () => {
  return localStorage.getItem('access_token') || ''
}
```

#### ⚡ RAM vs Storage Performance

```typescript
// Class Http với cache trên RAM (nhanh hơn localStorage)
class Http {
  private accessToken: string

  constructor() {
    this.accessToken = getAccessTokenFromLS()
  }
}
```

### 🎬 Video 172: Ngăn Chặn Spam Submit

#### 🔒 Button Component

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

// Disable button khi đang loading
<button
  {...rest}
  disabled={isLoading}
  className={classNames({
    'cursor-not-allowed': isLoading
  })}
>
  {children}
</button>
```

### 🎬 Video 173: Path Management & Profile Update

#### 📁 Path Constants

```typescript
// path.ts - Quản lý routes tập trung
const path = {
  home: '/',
  login: '/login',
  register: '/register',
  logout: '/logout',
  productList: '/',
  productDetail: '/:nameId',
  cart: '/cart',
  user: '/user',
  profile: '/user/profile',
  changePassword: '/user/password',
  historyPurchases: '/user/purchases'
} as const
```

---

## 🛍️ Chương 19: Product List

### 🎬 Video 174: Code UI AsideFilter

#### 🏗️ Component Structure

```typescript
// AsideFilter chỉ sử dụng trong ProductList
// Tạo component trong folder ProductList/components
```

### 🎬 Video 175: SortProductList Component

#### 📱 Responsive Design

```typescript
// flex-wrap cho responsive
// flex-box với wrap support
```

### 🎬 Video 176: Product Component UI

#### 🖼️ Image Aspect Ratio

```typescript
// Tạo hình vuông với padding-top: 100%
.aspect-square {
  padding-top: 100%;
  position: relative;
}

.image-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

### 🎬 Video 177: Interface & API Declaration

#### 🔗 Product API Types

```typescript
interface Product {
  _id: string
  name: string
  price: number
  price_before_discount: number
  sold: number
  rating: number
  image: string
  // ... other fields
}

interface ProductListConfig {
  page?: number
  limit?: number
  sort_by?: 'createdAt' | 'view' | 'sold' | 'price'
  order?: 'asc' | 'desc'
  exclude?: string
  rating_filter?: number
  price_max?: number
  price_min?: number
  name?: string
  category?: string
}
```

#### 🎣 Custom Hook useQueryConfig

```typescript
// Lấy query params từ URL và convert thành config object
const useQueryConfig = () => {
  const queryParams = useQueryParams()
  const queryConfig: QueryConfig = removeUndefinedProperties({
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
  })

  return queryConfig
}
```

### 🎬 Video 178: Display Products & Format Numbers

#### 🌍 Internationalization với Intl

```typescript
// Format giá tiền (German format phù hợp VN)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('de-DE').format(value)
}

// Format số lượng bán (compact notation)
const formatNumberToSocialStyle = (value: number) => {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  })
    .format(value)
    .replace('.', ',')
    .toLowerCase()
}
```

### 🎬 Video 179: Rating Stars Algorithm

#### ⭐ Star Rating Logic

```typescript
/**
 * Algorithm cho rating stars
 * Ví dụ: rating = 3.4
 * - Star 1: 1 <= 3.4 → 100% fill
 * - Star 2: 2 <= 3.4 → 100% fill
 * - Star 3: 3 <= 3.4 → 100% fill
 * - Star 4: 4 > 3.4 → 40% fill (4 - 3.4 = 0.6 < 1)
 * - Star 5: 5 > 3.4 → 0% fill (5 - 3.4 = 1.6 > 1)
 */

const getStarWidth = (order: number, rating: number) => {
  if (order <= rating) {
    return '100%'
  }
  if (order > rating && order - rating < 1) {
    return `${(rating - Math.floor(rating)) * 100}%`
  }
  return '0%'
}
```

### 🎬 Video 180: Pagination Algorithm

#### 📄 Smart Pagination Logic

```typescript
/**
 * Pagination với range = 2
 *
 * Examples:
 * [1] 2 3 ... 19 20    (page 1)
 * 1 [2] 3 4 ... 19 20  (page 2)
 * 1 2 [3] 4 5 ... 19 20 (page 3)
 * 1 ... 4 [5] 6 ... 19 20 (page 5)
 * 1 2 ... 16 17 [18] 19 20 (page 18)
 */

const RANGE = 2;

const renderPagination = () => {
  let dotAfter = false;
  let dotBefore = false;

  const renderDotBefore = (index: number) => {
    if (!dotBefore) {
      dotBefore = true;
      return (
        <span key={index} className="mx-2 cursor-default rounded border bg-white px-3 py-2 shadow-sm">
          ...
        </span>
      );
    }
    return null;
  };

  // Similar logic for dotAfter...
};
```

### 🎬 Video 181: URL Synchronization

#### 🔄 URL State Management

```typescript
// Quản lý filter state thông qua URL thay vì React state
// Lợi ích: Share được filter qua URL, SEO friendly

const queryConfig = useQueryConfig()

// Pagination navigation
const createSearchParams = (config: QueryConfig) => {
  return new URLSearchParams(
    Object.entries(config)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  ).toString()
}
```

#### ⚙️ React Query Optimization

```typescript
// keepPreviousData: giữ data cũ khi loading data mới
const { data, isLoading } = useQuery({
  queryKey: ['products', queryConfig],
  queryFn: () => productApi.getProducts(queryConfig),
  keepPreviousData: true,
  staleTime: 3 * 60 * 1000 // 3 minutes
})
```

### 🎬 Video 182: Sort Logic

#### 🔄 Sort Component Logic

```typescript
// Active sort detection
const isActiveSortBy = (sortByValue: Exclude<ProductListConfig['sort_by'], undefined>) => {
  return (queryConfig.sort_by || 'createdAt') === sortByValue
}

// Navigation with sort
const handleSort = (sortByValue: Exclude<ProductListConfig['sort_by'], undefined>) => {
  navigate({
    pathname: path.home,
    search: createSearchParams({
      ...queryConfig,
      sort_by: sortByValue,
      order: undefined // Reset order when changing sort type
    })
  })
}

// Order handling for price
const handlePriceOrder = (orderValue: Exclude<ProductListConfig['order'], undefined>) => {
  navigate({
    pathname: path.home,
    search: createSearchParams({
      ...queryConfig,
      sort_by: 'price',
      order: orderValue
    })
  })
}
```

### 🎬 Video 183: Category Filter

#### 🏷️ Category Filter Logic

```typescript
// Category API call
const { data: categoriesData } = useQuery({
  queryKey: ['categories'],
  queryFn: categoryApi.getCategories
})

const categories = categoriesData?.data.data || []

// Active category detection
const isActiveCategory = (categoryId: string) => {
  return queryConfig.category === categoryId
}
```

### 🎬 Video 184: Price Range Filter

#### 💰 InputNumber Component

```typescript
// Chỉ cho phép nhập số
const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ value, onChange, ...rest }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (/^\d+$/.test(value) || value === '') {
        onChange && onChange(event);
      }
    };

    return (
      <input
        {...rest}
        ref={ref}
        value={value}
        onChange={handleChange}
        type="text"
      />
    );
  }
);
```

#### 🎛️ Controller với React Hook Form

```typescript
// Sử dụng Controller cho custom components
<Controller
  control={control}
  name="price_min"
  render={({ field }) => (
    <InputNumber
      {...field}
      className="grow"
      placeholder="₫ TỪ"
      onBlur={() => {
        trigger('price_max'); // Trigger validation cho field khác
      }}
    />
  )}
/>
```

#### ✅ Yup Custom Validation

```typescript
const priceSchema = yup.object({
  price_min: yup.string().test({
    name: 'price-not-allowed',
    message: 'Giá không phù hợp',
    test: function (value) {
      const price_min = Number(value)
      const { price_max } = this.parent
      const price_max_number = Number(price_max)

      if (price_max && price_min > price_max_number) {
        return false
      }
      return true
    }
  })
  // Similar for price_max...
})
```

### 🎬 Video 185: Rating Filter & Clear Filters

#### ⭐ Rating Stars Filter

```typescript
/**
 * Rating filter algorithm:
 * index 0: 5 stars (indexStar 0-4 yellow)
 * index 1: 4 stars (indexStar 0-3 yellow)
 * index 2: 3 stars (indexStar 0-2 yellow)
 * index 3: 2 stars (indexStar 0-1 yellow)
 * index 4: 1 star (indexStar 0 yellow)
 *
 * Rule: indexStar < 5 - index → yellow star
 */

const renderStars = (order: number) => {
  return Array(5).fill(0).map((_, index) => (
    <svg key={index} className={`h-4 w-4 ${index < 5 - order ? 'fill-yellow-300 text-yellow-300' : 'fill-current text-gray-300'}`}>
      {/* Star SVG */}
    </svg>
  ));
};

// Clear all filters
const handleClearAll = () => {
  navigate({
    pathname: path.home,
    search: createSearchParams(
      omit(queryConfig, ['category', 'price_max', 'price_min', 'rating_filter'])
    )
  });
};
```

---

## 🔍 Chương 20: Product Detail

### 🎬 Video 186: UI & XSS Protection

#### 🔒 XSS Prevention

```typescript
// Sử dụng DOMPurify để làm sạch HTML
import DOMPurify from 'dompurify';

// Render HTML an toàn
<div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(product.description)
  }}
/>
```

#### 🎨 Image Aspect Ratio Technique

```typescript
// CSS trick cho ảnh vuông
.image-container {
  position: relative;
  padding-top: 100%; /* Tạo tỷ lệ 1:1 */
}

.image-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 🎬 Video 187: Image Slider Logic

#### 🖼️ Slider State Management

```typescript
// Quản lý slider với state
const [currentIndexImages, setCurrentIndexImages] = useState([0, 5])
const [activeImage, setActiveImage] = useState('')

// Tính toán current images với useMemo
const currentImages = useMemo(() => {
  return product ? product.images.slice(...currentIndexImages) : []
}, [product, currentIndexImages])

// Navigation logic
const next = () => {
  if (currentIndexImages[1] < product.images.length) {
    setCurrentIndexImages((prev) => [prev[0] + 1, prev[1] + 1])
  }
}

const prev = () => {
  if (currentIndexImages[0] > 0) {
    setCurrentIndexImages((prev) => [prev[0] - 1, prev[1] - 1])
  }
}
```

### 🎬 Video 188: Mouse Zoom Effect

#### 🔍 Image Zoom Implementation

```typescript
const handleZoom = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const image = imageRef.current as HTMLImageElement
  const { naturalHeight, naturalWidth } = image

  // Remove size restrictions
  const { offsetX, offsetY } = event.nativeEvent

  // Calculate zoom position
  const top = offsetY * (1 - naturalHeight / rect.height)
  const left = offsetX * (1 - naturalWidth / rect.width)

  // Apply styles
  image.style.width = naturalWidth + 'px'
  image.style.height = naturalHeight + 'px'
  image.style.maxWidth = 'unset'
  image.style.top = top + 'px'
  image.style.left = left + 'px'
}

const handleRemoveZoom = () => {
  const image = imageRef.current as HTMLImageElement
  image.style.removeProperty('width')
  image.style.removeProperty('height')
  image.style.removeProperty('maxWidth')
  image.style.removeProperty('top')
  image.style.removeProperty('left')
}
```

#### 🎯 Event Handling Tips

```typescript
// Prevent pointer events on image to avoid event bubbling
.zoom-image {
  pointer-events: none;
}

// Add cursor zoom effect
.zoom-container:hover {
  cursor: zoom-in;
}
```

### 🎬 Video 189: SEO-Friendly URLs

#### 🔗 URL Structure

```typescript
// SEO-friendly URL: /ten-san-pham-i.productId
// Example: /iPhone-12-Pro-Max-i.60afb1c56ef5b902180aacb8

// Generate name for URL
const generateNameId = ({ name, id }: { name: string; id: string }) => {
  return removeSpecialCharacter(name).replace(/\s/g, '-') + `-i.${id}`
}

// Extract ID from nameId
const getIdFromNameId = (nameId: string) => {
  const arr = nameId.split('-i.')
  return arr[arr.length - 1]
}

// Remove special characters
const removeSpecialCharacter = (str: string) => {
  // eslint-disable-next-line no-useless-escape
  return str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '')
}
```

#### ⚙️ Vite Configuration

```typescript
// vite.config.ts - Fix cho URL có dấu chấm
import { defineConfig } from 'vite'
import rewriteAll from 'vite-plugin-rewrite-all'

export default defineConfig({
  plugins: [rewriteAll()]
})
```

### 🎬 Video 190: TailwindCSS IntelliSense

#### 💡 VS Code Settings

```json
// .vscode/settings.json
{
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    "tw`([^`]*)",
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["classnames\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### 🎬 Video 191: Search Functionality

#### 🔍 Search Implementation

```typescript
// useQueryConfig hook cho search
const useQueryConfig = () => {
  const queryParams = useQueryParams()

  // Filter only needed params
  const queryConfig = removeUndefinedProperties({
    page: queryParams.page || '1',
    limit: queryParams.limit || '20',
    sort_by: queryParams.sort_by,
    order: queryParams.order,
    exclude: queryParams.exclude,
    rating_filter: queryParams.rating_filter,
    price_max: queryParams.price_max,
    price_min: queryParams.price_min,
    name: queryParams.name,
    category: queryParams.category
  })

  return queryConfig
}

// Search form handling
const searchSchema = yup.object({
  name: yup.string().trim().required()
})

const handleSearch = handleSubmit((data) => {
  const config = queryConfig.order ? omit(queryConfig, ['order']) : queryConfig

  navigate({
    pathname: path.home,
    search: createSearchParams({
      ...config,
      name: data.name
    })
  })
})
```

### 🎬 Video 192: Related Products

#### 🔄 Smart Caching Strategy

```typescript
// Avoid duplicate API calls with proper queryKey and staleTime
const { data: productsData } = useQuery({
  queryKey: ['products', { ...queryConfig, category: product?.category._id }],
  queryFn: () =>
    productApi.getProducts({
      ...queryConfig,
      category: product?.category._id
    }),
  enabled: Boolean(product), // Only run when product exists
  staleTime: 3 * 60 * 1000 // Same staleTime as ProductList
})
```

### 🎬 Video 193: QuantityController Component

#### 🔢 Quantity Control Logic

```typescript
interface QuantityControllerProps extends InputNumberProps {
  max?: number;
  onIncrease?: (value: number) => void;
  onDecrease?: (value: number) => void;
  onType?: (value: number) => void;
  onFocusOut?: (value: number) => void;
  classNameWrapper?: string;
}

const QuantityController = ({
  max,
  onIncrease,
  onDecrease,
  onType,
  onFocusOut,
  value,
  ...rest
}: QuantityControllerProps) => {
  const [localValue, setLocalValue] = useState<number>(Number(value) || 0);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let _value = Number(event.target.value);

    if (max !== undefined && _value > max) {
      _value = max;
    } else if (_value < 1) {
      _value = 1;
    }

    onType && onType(_value);
    setLocalValue(_value);
  };

  const increase = () => {
    let _value = Number(value || localValue) + 1;
    if (max !== undefined && _value > max) {
      _value = max;
    }
    onIncrease && onIncrease(_value);
    setLocalValue(_value);
  };

  const decrease = () => {
    let _value = Number(value || localValue) - 1;
    if (_value < 1) {
      _value = 1;
    }
    onDecrease && onDecrease(_value);
    setLocalValue(_value);
  };

  return (
    <div className={classNames('flex items-center', classNameWrapper)}>
      <button
        className="flex h-8 w-8 items-center justify-center rounded-l-sm border border-gray-300 text-gray-600"
        onClick={decrease}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      <InputNumber
        className=""
        classNameError="hidden"
        classNameInput="h-8 w-14 border-t border-b border-gray-300 p-1 text-center outline-none"
        onChange={handleChange}
        onBlur={(event) => {
          onFocusOut && onFocusOut(Number(event.target.value));
        }}
        value={value || localValue}
        {...rest}
      />

      <button
        className="flex h-8 w-8 items-center justify-center rounded-r-sm border border-gray-300 text-gray-600"
        onClick={increase}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
```

### 🎬 Video 194: Purchase API Setup

#### 🛒 Cart API Types

```typescript
interface PurchaseBody {
  product_id: string
  buy_count: number
}

interface Purchase {
  _id: string
  buy_count: number
  price: number
  price_before_discount: number
  status: PurchaseStatus
  user: string
  product: Product
  createdAt: string
  updatedAt: string
}

// Purchase status constants
const purchaseStatus = {
  inCart: -1,
  waitForConfirmation: 1,
  waitForGetting: 2,
  inProgress: 3,
  delivered: 4,
  cancelled: 5
} as const
```

### 🎬 Video 195: Add to Cart Feature

#### 🛒 Add to Cart Implementation

```typescript
// Add to cart mutation
const addToCartMutation = useMutation({
  mutationFn: purchaseApi.addToCart,
  onSuccess: () => {
    // Invalidate purchases query to refresh cart
    queryClient.invalidateQueries({
      queryKey: ['purchases', { status: purchaseStatus.inCart }]
    })
    toast.success('Thêm sản phẩm vào giỏ hàng thành công')
  }
})

// Handle add to cart
const addToCart = () => {
  addToCartMutation.mutate({
    buy_count: buyCount,
    product_id: product?._id as string
  })
}

// Handle buy now (add to cart + navigate)
const buyNow = async () => {
  const res = await addToCartMutation.mutateAsync({
    buy_count: buyCount,
    product_id: product?._id as string
  })

  const purchase = res.data.data
  navigate('/cart', {
    state: {
      purchaseId: purchase._id
    }
  })
}
```

#### 📊 Cart Display Logic

```typescript
// Display cart items in header
const { data: purchasesInCartData } = useQuery({
  queryKey: ['purchases', { status: purchaseStatus.inCart }],
  queryFn: () => purchaseApi.getPurchases({ status: purchaseStatus.inCart }),
  enabled: isAuthenticated
})

const purchasesInCart = purchasesInCartData?.data.data || []

// Show only 5 recent items
const MAX_PURCHASES = 5
const recentPurchases = purchasesInCart.slice(0, MAX_PURCHASES)
const remainingCount = Math.max(0, purchasesInCart.length - MAX_PURCHASES)
```

---

## 📝 Tổng Kết

Đây là một dự án clone Shopee toàn diện với nhiều kiến thức quan trọng:

### 🔧 **Technologies Stack**

- **Frontend**: React, TypeScript, TailwindCSS
- **State Management**: React Query, Context API
- **Form**: React Hook Form, Yup validation
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios với interceptors
- **Animation**: Framer Motion
- **UI Components**: Floating UI, Headless UI

### 🎯 **Key Features Implemented**

- ✅ Authentication (Login/Register/Logout)
- ✅ Protected Routes & Route Guards
- ✅ Product Listing với Pagination
- ✅ Advanced Filtering (Category, Price, Rating)
- ✅ Product Detail với Image Zoom
- ✅ Shopping Cart Management
- ✅ Search Functionality
- ✅ Responsive Design
- ✅ SEO-friendly URLs
- ✅ Error Handling & Validation

### 🚀 **Best Practices Applied**

- **Component Composition**: Tái sử dụng và modularity
- **Performance Optimization**: useMemo, useCallback, React Query caching
- **Type Safety**: TypeScript với strict typing
- **Error Boundaries**: Graceful error handling
- **Accessibility**: ARIA attributes, keyboard navigation
- **Security**: XSS protection, input sanitization

### 📚 **Advanced Concepts Covered**

- Custom Hooks cho logic reuse
- Compound Components pattern
- Render Props & Children as Function
- Event Handling với custom events
- Advanced TypeScript (Generic types, Utility types)
- Performance monitoring và optimization
