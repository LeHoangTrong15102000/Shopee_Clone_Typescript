# 🔄 CODE SPLITTING VS LAZY LOADING - PHÂN BIỆT CHI TIẾT

> **Giải thích rõ ràng sự khác biệt giữa Code Splitting và Lazy Loading trong React và JavaScript**

---

## 📋 MỤC LỤC

1. [🎯 Định Nghĩa Cơ Bản](#-định-nghĩa-cơ-bản)
2. [🔍 Code Splitting - Khái Niệm Chi Tiết](#-code-splitting---khái-niệm-chi-tiết)
3. [⚡ Lazy Loading - Khái Niệm Chi Tiết](#-lazy-loading---khái-niệm-chi-tiết)
4. [🤝 Mối Quan Hệ Giữa Hai Khái Niệm](#-mối-quan-hệ-giữa-hai-khái-niệm)
5. [📊 So Sánh Trực Quan](#-so-sánh-trực-quan)
6. [🛠️ Implementation trong Dự Án](#️-implementation-trong-dự-án)
7. [🎪 Ví Dụ Thực Tế](#-ví-dụ-thực-tế)
8. [💡 Kết Luận](#-kết-luận)

---

## 🎯 ĐỊNH NGHĨA CƠ BẢN

### 🔄 **Code Splitting**

**Code Splitting** là **kỹ thuật build-time** để **chia nhỏ JavaScript bundle** thành nhiều **chunks nhỏ hơn**.

### ⚡ **Lazy Loading**

**Lazy Loading** là **kỹ thuật runtime** để **tải resources** (components, images, data) **chỉ khi cần thiết**.

### 🤔 **Tại Sao Hay Nhầm Lẫn?**

- Chúng **thường được sử dụng cùng nhau**
- **React.lazy** kết hợp cả hai khái niệm
- Cùng mục tiêu **tối ưu performance**

---

## 🔍 CODE SPLITTING - KHÁI NIỆM CHI TIẾT

### 📖 **Định Nghĩa Chính Xác**

Code Splitting là quá trình **chia nhỏ một JavaScript bundle lớn** thành **nhiều chunks nhỏ hơn** tại **thời điểm build**.

### 🎯 **Mục Tiêu**

- **Giảm kích thước** bundle ban đầu
- **Tải song song** nhiều chunks
- **Cache hiệu quả** từng chunk riêng biệt
- **Tối ưu loading time**

### 🛠️ **Các Loại Code Splitting**

#### 1. **Vendor Splitting**

**Tách thư viện bên thứ 3** ra thành chunk riêng:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Tách React ra chunk riêng
          'react-vendor': ['react', 'react-dom'],

          // Tách UI libraries ra chunk riêng
          'ui-vendor': ['@mui/material', '@emotion/react'],

          // Tách utility libraries ra chunk riêng
          'utils-vendor': ['lodash', 'date-fns', 'axios']
        }
      }
    }
  }
})
```

**Kết quả build:**

```
dist/assets/
├── react-vendor.js     (142kB) - React core
├── ui-vendor.js        (98kB)  - UI components
├── utils-vendor.js     (45kB)  - Utilities
└── main.js            (50kB)  - App code
```

#### 2. **Route-based Splitting**

**Tách từng page** thành chunk riêng:

```typescript
// Không có code splitting - TẤT CẢ trong 1 bundle
import Home from './pages/Home'
import Products from './pages/Products'
import Profile from './pages/Profile'

// Có code splitting - MỖI PAGE 1 chunk riêng
const Home = lazy(() => import('./pages/Home')) // → home.chunk.js
const Products = lazy(() => import('./pages/Products')) // → products.chunk.js
const Profile = lazy(() => import('./pages/Profile')) // → profile.chunk.js
```

#### 3. **Feature-based Splitting**

**Tách từng feature** thành chunk riêng:

```typescript
// Admin features - chunk riêng
const AdminDashboard = lazy(() => import('./features/admin/Dashboard'))
const UserManagement = lazy(() => import('./features/admin/UserManagement'))

// Shopping features - chunk riêng
const Cart = lazy(() => import('./features/shopping/Cart'))
const Checkout = lazy(() => import('./features/shopping/Checkout'))
```

### 📊 **Code Splitting trong Shopee Clone**

**File**: `vite.config.ts`

```typescript
manualChunks: {
  // React ecosystem - 142.88kB
  'react-vendor': ['react', 'react-dom'],

  // HTTP & State - 167.34kB
  'http-vendor': ['axios', '@tanstack/react-query'],

  // UI Components - 98.23kB
  'ui-vendor': ['@heroui/react', '@floating-ui/react'],

  // Forms - 89.45kB
  'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],

  // Router - 76.12kB
  'router-vendor': ['react-router-dom'],

  // Utilities - 45.67kB
  'utils-vendor': ['classnames', 'immer', 'query-string'],

  // i18n - 67.89kB
  'i18n-vendor': ['i18next', 'react-i18next'],

  // Animation - 114.81kB
  'animation-vendor': ['framer-motion'],

  // Misc - 146.51kB
  'misc-vendor': ['dompurify', 'html-to-text', 'react-helmet-async']
}
```

**Kết quả**: Từ **1 bundle 700kB** → **12 chunks nhỏ** (chunk lớn nhất 167kB)

---

## ⚡ LAZY LOADING - KHÁI NIỆM CHI TIẾT

### 📖 **Định Nghĩa Chính Xác**

Lazy Loading là kỹ thuật **trì hoãn việc tải và thực thi code** cho đến khi **thực sự cần thiết** tại **runtime**.

### 🎯 **Mục Tiêu**

- **Giảm thời gian** tải trang ban đầu
- **Tải theo yêu cầu** (on-demand)
- **Tiết kiệm bandwidth** cho user
- **Cải thiện perceived performance**

### 🛠️ **Các Loại Lazy Loading**

#### 1. **Component Lazy Loading**

**Tải component** chỉ khi cần render:

```typescript
// ❌ Eager Loading - Tải ngay lập tức
import ProductDetail from './pages/ProductDetail'

function App() {
  return (
    <Routes>
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  )
}

// ✅ Lazy Loading - Tải khi navigate đến route
const ProductDetail = lazy(() => import('./pages/ProductDetail'))

function App() {
  return (
    <Routes>
      <Route
        path="/product/:id"
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <ProductDetail />
          </Suspense>
        }
      />
    </Routes>
  )
}
```

#### 2. **Conditional Lazy Loading**

**Tải component** chỉ khi điều kiện thỏa mãn:

```typescript
function Dashboard() {
  const [showAdmin, setShowAdmin] = useState(false)
  const [AdminPanel, setAdminPanel] = useState(null)

  const loadAdminPanel = async () => {
    if (!AdminPanel) {
      // Chỉ tải AdminPanel khi user click "Show Admin"
      const module = await import('./AdminPanel')
      setAdminPanel(() => module.default)
    }
    setShowAdmin(true)
  }

  return (
    <div>
      <button onClick={loadAdminPanel}>Show Admin Panel</button>
      {showAdmin && AdminPanel && <AdminPanel />}
    </div>
  )
}
```

#### 3. **Image Lazy Loading**

**Tải hình ảnh** khi scroll đến:

```typescript
function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      {/* Chỉ tải image khi element xuất hiện trong viewport */}
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"  // Native lazy loading
      />
    </div>
  )
}
```

#### 4. **Data Lazy Loading**

**Tải data** khi cần thiết:

```typescript
function ProductList() {
  const [page, setPage] = useState(1)

  // Chỉ tải data của page hiện tại
  const { data } = useQuery({
    queryKey: ['products', page],
    queryFn: () => fetchProducts(page),
    // Chỉ fetch khi page thay đổi
  })

  return (
    <div>
      {data?.products.map(product => <ProductCard key={product.id} product={product} />)}
      <button onClick={() => setPage(page + 1)}>Load More</button>
    </div>
  )
}
```

### 📊 **Lazy Loading trong Shopee Clone**

**File**: `src/useRouteElements.tsx`

```typescript
// Khai báo lazy loading cho các page
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Home = lazy(() => import('./pages/Home'))
const ProductList = lazy(() => import('./pages/ProductList'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Profile = lazy(() => import('./pages/User/pages/Profile'))

// Sử dụng với Suspense
const routeElements = useRoutes([
  {
    path: path.home,
    element: (
      <Suspense fallback={<Loader />}>
        <Home />  {/* Chỉ tải khi user vào route "/" */}
      </Suspense>
    )
  },
  {
    path: path.productDetail,
    element: (
      <Suspense fallback={<Loader />}>
        <ProductDetail />  {/* Chỉ tải khi user vào route "/product/:id" */}
      </Suspense>
    )
  }
])
```

---

## 🤝 MỐI QUAN HỆ GIỮA HAI KHÁI NIỆM

### 🔄 **Code Splitting ENABLE Lazy Loading**

```typescript
// 1. Code Splitting tạo ra chunks riêng biệt (build time)
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
//                                    ↓
//                            Tạo ra: productDetail.chunk.js

// 2. Lazy Loading quyết định KHI NÀO tải chunk đó (runtime)
<Route
  path="/product/:id"
  element={
    <Suspense fallback={<Loader />}>
      <ProductDetail />  {/* Chỉ tải productDetail.chunk.js khi cần */}
    </Suspense>
  }
/>
```

### 🎯 **Workflow Hoàn Chỉnh**

```
1. Build Time (Code Splitting):
   ├── main.js (50kB)
   ├── home.chunk.js (30kB)
   ├── products.chunk.js (45kB)
   └── profile.chunk.js (25kB)

2. Runtime (Lazy Loading):
   User visits "/" → Tải main.js + home.chunk.js
   User clicks "Products" → Tải products.chunk.js
   User clicks "Profile" → Tải profile.chunk.js
```

### 💡 **Có Thể Tách Rời**

#### **Code Splitting KHÔNG có Lazy Loading:**

```typescript
// Tất cả chunks đều tải ngay từ đầu
import('./chunk1.js')
import('./chunk2.js')
import('./chunk3.js')
// → Load song song tất cả chunks
```

#### **Lazy Loading KHÔNG có Code Splitting:**

```typescript
// Delay loading nhưng vẫn trong cùng 1 bundle
const HeavyComponent = () => {
  const [show, setShow] = useState(false)

  return (
    <div>
      <button onClick={() => setShow(true)}>Show Heavy Component</button>
      {show && <ComplexCalculationComponent />}  {/* Delay render */}
    </div>
  )
}
```

---

## 📊 SO SÁNH TRỰC QUAN

| Khía Cạnh     | Code Splitting        | Lazy Loading                      |
| ------------- | --------------------- | --------------------------------- |
| **Thời điểm** | Build time            | Runtime                           |
| **Mục đích**  | Chia nhỏ bundle       | Trì hoãn loading                  |
| **Công cụ**   | Webpack, Vite, Rollup | React.lazy, Intersection Observer |
| **Kết quả**   | Nhiều files .js       | Tải theo yêu cầu                  |
| **Đo lường**  | Bundle size analysis  | Loading performance               |
| **Tác động**  | Giảm initial bundle   | Giảm initial loading time         |

### 🎭 **Analogy Đời Thường**

#### **Code Splitting** = **Chia sách thành nhiều tập**

- Thay vì 1 cuốn sách dày 1000 trang
- Chia thành 10 tập, mỗi tập 100 trang
- **Dễ mang theo**, **dễ lưu trữ**

#### **Lazy Loading** = **Chỉ mua tập khi cần đọc**

- Không mua hết 10 tập cùng lúc
- Mua tập 1 trước, đọc xong mới mua tập 2
- **Tiết kiệm tiền**, **không lãng phí**

---

## 🛠️ IMPLEMENTATION TRONG DỰ ÁN

### 🎯 **Shopee Clone Strategy**

#### **1. Code Splitting Strategy:**

```typescript
// vite.config.ts - Chia theo tính năng
manualChunks: {
  'react-vendor': ['react', 'react-dom'],        // Core framework
  'ui-vendor': ['@heroui/react'],                // UI components
  'http-vendor': ['axios', '@tanstack/react-query'], // API handling
  'form-vendor': ['react-hook-form'],            // Form handling
  'router-vendor': ['react-router-dom'],         // Routing
  // ... 7 chunks khác
}
```

#### **2. Lazy Loading Strategy:**

```typescript
// src/useRouteElements.tsx - Chia theo routes
const Home = lazy(() => import('./pages/Home')) // Landing page
const ProductList = lazy(() => import('./pages/ProductList')) // Product catalog
const ProductDetail = lazy(() => import('./pages/ProductDetail')) // Product detail
const Cart = lazy(() => import('./pages/Cart')) // Shopping cart
const Profile = lazy(() => import('./pages/User/pages/Profile')) // User profile
```

### 📊 **Kết Quả Thực Tế**

#### **Trước Optimization:**

```
├── index.js (700kB) - Toàn bộ app trong 1 file
└── assets/
```

#### **Sau Code Splitting + Lazy Loading:**

```
├── main.js (301kB) - App shell + routing logic
├── react-vendor.js (142kB) - React core
├── ui-vendor.js (98kB) - UI components
├── http-vendor.js (167kB) - API utilities
├── home.chunk.js (45kB) - Home page code
├── products.chunk.js (67kB) - Products page code
├── profile.chunk.js (34kB) - Profile page code
└── ... (5 chunks khác)
```

#### **Loading Behavior:**

```
Initial Load:
├── main.js (301kB) ✓
├── react-vendor.js (142kB) ✓
└── home.chunk.js (45kB) ✓
Total: 488kB (vs 700kB trước đây)

User navigates to /products:
└── products.chunk.js (67kB) ✓ - Lazy loaded

User navigates to /profile:
└── profile.chunk.js (34kB) ✓ - Lazy loaded
```

---

## 🎪 VÍ DỤ THỰC TẾ

### 🛒 **E-commerce Scenario**

#### **Setup Code Splitting:**

```typescript
// webpack.config.js hoặc vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core app functionality
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // Shopping specific
          shopping: ['@stripe/stripe-js', 'react-credit-cards'],

          // Admin specific (chỉ admin cần)
          admin: ['recharts', 'react-table', 'date-fns'],

          // Heavy utilities (không phải ai cũng dùng)
          utils: ['lodash', 'moment', 'crypto-js']
        }
      }
    }
  }
}
```

#### **Setup Lazy Loading:**

```typescript
// App.tsx
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))

// Admin pages - chỉ admin mới access
const AdminDashboard = lazy(() => import('./admin/Dashboard'))
const UserManagement = lazy(() => import('./admin/UserManagement'))

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - lazy load */}
        <Route path="/" element={
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        } />

        <Route path="/product/:id" element={
          <Suspense fallback={<PageLoader />}>
            <ProductPage />
          </Suspense>
        } />

        {/* Protected routes - lazy load + auth check */}
        <Route path="/admin/*" element={
          <ProtectedRoute role="admin">
            <Suspense fallback={<AdminLoader />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}
```

#### **Advanced Lazy Loading:**

```typescript
// Conditional loading based on feature flags
function ProductPage() {
  const [showReviews, setShowReviews] = useState(false)
  const [ReviewsComponent, setReviewsComponent] = useState(null)

  const loadReviews = async () => {
    if (!ReviewsComponent) {
      // Chỉ tải reviews component khi user click "Show Reviews"
      const { default: Reviews } = await import('./components/ProductReviews')
      setReviewsComponent(() => Reviews)
    }
    setShowReviews(true)
  }

  return (
    <div>
      <ProductInfo />
      <button onClick={loadReviews}>
        {ReviewsComponent ? 'Show Reviews' : 'Load Reviews'}
      </button>
      {showReviews && ReviewsComponent && <ReviewsComponent />}
    </div>
  )
}
```

### 📱 **Mobile-First Lazy Loading:**

```typescript
// Progressive enhancement cho mobile
function ProductGallery({ images }) {
  const [loadHighRes, setLoadHighRes] = useState(false)

  // Chỉ tải high-res images trên desktop hoặc khi user yêu cầu
  useEffect(() => {
    if (window.innerWidth > 768) {
      setLoadHighRes(true)
    }
  }, [])

  return (
    <div>
      {images.map((image, index) => (
        <img
          key={index}
          src={loadHighRes ? image.highRes : image.thumbnail}
          loading="lazy"
          onClick={() => setLoadHighRes(true)}
        />
      ))}
    </div>
  )
}
```

---

## 💡 KẾT LUẬN

### 🎯 **Tóm Tắt Ngắn Gọn**

|              | Code Splitting           | Lazy Loading               |
| ------------ | ------------------------ | -------------------------- |
| **Là gì?**   | Chia bundle thành chunks | Tải resources khi cần      |
| **Khi nào?** | Build time               | Runtime                    |
| **Làm gì?**  | Tạo files riêng biệt     | Quyết định thời điểm tải   |
| **Công cụ?** | Bundler (Vite, Webpack)  | React.lazy, dynamic import |

### 🤝 **Relationship:**

```
Code Splitting ➜ Tạo điều kiện cho ➜ Lazy Loading
     ↓                                    ↓
  Chia nhỏ file                    Tải đúng lúc cần
```

### 🚀 **Best Practices**

#### **Code Splitting:**

1. **Chia theo feature** thay vì theo file size
2. **Vendor chunks** riêng biệt cho thư viện bên thứ 3
3. **Common chunks** cho code được share nhiều nơi
4. **Đo lường kết quả** bằng bundle analyzer

#### **Lazy Loading:**

1. **Route-based** lazy loading trước tiên
2. **Feature-based** lazy loading cho components lớn
3. **Conditional loading** cho admin features
4. **Progressive enhancement** cho mobile

### 📈 **Impact trong Shopee Clone:**

- **Code Splitting**: 700kB → 12 chunks (chunk lớn nhất 167kB)
- **Lazy Loading**: Chỉ tải page cần thiết (tiết kiệm ~60% bandwidth)
- **Combined**: Initial load giảm ~65%, subsequent navigation nhanh hơn

### 🎯 **Câu Trả Lời Interview:**

> **"Code Splitting và Lazy Loading là hai khái niệm khác nhau nhưng bổ trợ nhau:**
>
> **Code Splitting** là kỹ thuật build-time để chia bundle thành nhiều chunks nhỏ. Trong dự án, tôi dùng Vite config để tách 12 vendor chunks, giảm bundle chính từ 700kB xuống 301kB.
>
> **Lazy Loading** là kỹ thuật runtime để tải chunks đó chỉ khi cần thiết. Tôi dùng React.lazy cho tất cả routes, chỉ tải ProductDetail component khi user thực sự navigate đến trang đó.
>
> **Kết hợp cả hai**: Code Splitting tạo điều kiện, Lazy Loading thực thi - giúp initial load nhanh hơn 65%."\*\*

---

**🎉 Hy vọng giải thích này đã làm rõ sự khác biệt giữa Code Splitting và Lazy Loading!**
