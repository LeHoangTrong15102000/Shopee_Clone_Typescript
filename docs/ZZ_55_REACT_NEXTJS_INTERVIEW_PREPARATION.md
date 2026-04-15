# CHUẨN BỊ PHỎNG VẤN REACTJS/NEXTJS — Middle Frontend Developer (3-5 năm kinh nghiệm)

> **Ngày nghiên cứu**: 2026-04-15
> **Mục tiêu**: Tổng hợp đầy đủ các câu hỏi phỏng vấn thực tế, kịch bản system design, coding challenge và behavioral questions cho vị trí Middle ReactJS/NextJS Frontend Developer
> **Nguồn tham khảo**: 40+ nguồn từ React docs, web.dev, LogRocket, Medium, DEV Community, GreatFrontEnd, NextJS docs
> **Đối tượng**: Vietnamese Frontend Developer 3-5 năm kinh nghiệm

---

## MỤC LỤC

- [PHẦN 1: Performance Optimization Scenarios](#phần-1-performance-optimization-scenarios)
  - [1.1 Chẩn đoán và sửa lỗi render chậm](#11-chẩn-đoán-và-sửa-lỗi-render-chậm-trong-react)
  - [1.2 Tối ưu Bundle Size](#12-tối-ưu-bundle-size)
  - [1.3 Tối ưu hình ảnh](#13-chiến-lược-tối-ưu-hình-ảnh)
  - [1.4 SEO cho React/Next.js](#14-tối-ưu-seo-cho-reactnextjs)
  - [1.5 Core Web Vitals](#15-core-web-vitals-lcp-inp-cls)
  - [1.6 Ngăn chặn Memory Leak](#16-ngăn-chặn-memory-leak-trong-react)
  - [1.7 Network Optimization](#17-network-optimization)
- [PHẦN 2: Real-World Scenario Questions](#phần-2-real-world-scenario-questions)
  - [2.1 Infinite Scrolling](#21-implement-infinite-scrolling)
  - [2.2 Authentication trong Next.js](#22-authentication-trong-nextjs)
  - [2.3 Real-time Notification System](#23-real-time-notification-system)
  - [2.4 Search với Debounce](#24-search-với-debounce)
  - [2.5 Form Validation](#25-form-validation)
  - [2.6 Dark Mode](#26-dark-mode)
  - [2.7 Error Boundaries](#27-error-boundaries-trong-production)
  - [2.8 Tối ưu danh sách 10,000 items](#28-tối-ưu-danh-sách-10000-items)
  - [2.9 Internationalization (i18n)](#29-internationalization-i18n)
  - [2.10 Cấu trúc ứng dụng React lớn](#210-cấu-trúc-ứng-dụng-react-quy-mô-lớn)
- [PHẦN 3: Coding Challenge Questions](#phần-3-coding-challenge-questions)
  - [3.1 Custom Hooks](#31-custom-hooks)
  - [3.2 Simple State Management](#32-simple-state-management)
  - [3.3 Dropdown/Autocomplete Component](#33-dropdownautocomplete-component)
  - [3.4 Pagination](#34-pagination)
  - [3.5 Accessible Modal](#35-accessible-modal)
- [PHẦN 4: Behavioral/Soft Skill Questions](#phần-4-behavioralsoft-skill-questions)

---

# PHẦN 1: Performance Optimization Scenarios

## 1.1 Chẩn đoán và sửa lỗi render chậm trong React

### Câu hỏi phỏng vấn thường gặp

> "Ứng dụng React của bạn bị lag khi user tương tác. Bạn sẽ chẩn đoán và sửa như thế nào?"

### Quy trình chẩn đoán 4 bước

**Bước 1: Đo lường trước khi tối ưu (Measure First)**

Không bao giờ optimize mà không có data. Sử dụng các công cụ sau:

```typescript
// 1. React DevTools Profiler — mở tab Profiler, bấm Record
// → Xác định component nào render lâu hơn 16ms (= 1 frame ở 60fps)

// 2. why-did-you-render — log ra nguyên nhân re-render không cần thiết
// Cài đặt:
// npm install @welldone-software/why-did-you-render
import React from 'react'

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, { trackAllPureComponents: true })
}

// 3. Chrome DevTools Performance tab
// → Record → tìm Long Tasks (> 50ms)
// React 19+: sử dụng React Performance Tracks trong Chrome DevTools
```

**Bước 2: Xác định nguyên nhân phổ biến**

| Nguyên nhân | Giải thích | Dấu hiệu |
|---|---|---|
| Unnecessary re-renders | Parent re-render → tất cả children re-render | Profiler hiển thị component render nhiều lần |
| Props identity change | Object/function tạo mới mỗi render | `why-did-you-render` báo "different objects that are equal by value" |
| Large component tree | Một state change → toàn bộ cây DOM cập nhật | Layout shift, jank rõ rệt |
| Heavy computation trong render | Filter/sort/map trực tiếp trong render | Profiler hiển thị Self time cao |
| Quá nhiều DOM nodes | Render list dài (>100 items) | Element count cao trong Performance tab |

**Bước 3: Áp dụng giải pháp**

```typescript
// ==========================================
// GIẢI PHÁP 1: React.memo — ngăn re-render khi props không đổi
// ==========================================
const ExpensiveList = React.memo(({ items, onItemClick }: Props) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  )
})

// ==========================================
// GIẢI PHÁP 2: useMemo — cache kết quả tính toán nặng
// ==========================================
function ProductList({ products, filterText }: Props) {
  const filteredProducts = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase())),
    [products, filterText]
  )
  return <ul>{filteredProducts.map(p => <ProductItem key={p.id} product={p} />)}</ul>
}

// ==========================================
// GIẢI PHÁP 3: useCallback — giữ reference ổn định cho function props
// ==========================================
function ParentComponent() {
  const [count, setCount] = useState(0)

  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id)
  }, []) // dependency rỗng → function reference không đổi

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      {/* ExpensiveList KHÔNG re-render khi count thay đổi */}
      <ExpensiveList items={items} onItemClick={handleClick} />
    </>
  )
}

// ==========================================
// GIẢI PHÁP 4: State colocation — đặt state gần nơi sử dụng nhất
// ==========================================
// ❌ Sai: state ở parent → tất cả children re-render
function Page() {
  const [searchText, setSearchText] = useState('')
  return (
    <div>
      <SearchBar value={searchText} onChange={setSearchText} />
      <ExpensiveChart /> {/* Re-render không cần thiết! */}
      <ExpensiveTable /> {/* Re-render không cần thiết! */}
    </div>
  )
}

// ✅ Đúng: tách SearchBar thành component riêng với state riêng
function SearchBar() {
  const [searchText, setSearchText] = useState('')
  return <input value={searchText} onChange={e => setSearchText(e.target.value)} />
}

function Page() {
  return (
    <div>
      <SearchBar />
      <ExpensiveChart />
      <ExpensiveTable />
    </div>
  )
}

// ==========================================
// GIẢI PHÁP 5: useTransition — đánh dấu update không khẩn cấp
// ==========================================
function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value) // Update khẩn cấp: UI phản hồi ngay
    startTransition(() => {
      setResults(filterProducts(value)) // Update không khẩn cấp: React có thể defer
    })
  }

  return (
    <div>
      <input value={query} onChange={e => handleSearch(e.target.value)} />
      {isPending ? <Spinner /> : <ProductList products={results} />}
    </div>
  )
}
```

**Bước 4: React Compiler (React 19+)**

```typescript
// React Compiler tự động memoize components và values
// Giảm nhu cầu viết useMemo, useCallback, React.memo thủ công

// Cấu hình trong next.config.js:
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
}
```

**Nguồn**: growin.com, dev.to/alex_bobes, turbodocx.com, blog.logrocket.com

---

## 1.2 Tối ưu Bundle Size

### Câu hỏi phỏng vấn

> "Bundle size của ứng dụng Next.js quá lớn, load lần đầu mất 5s. Bạn sẽ làm gì?"

### Bước 1: Phân tích Bundle

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... config
})

// Chạy: ANALYZE=true npm run build
// → Mở treemap để xem dependency nào chiếm nhiều dung lượng nhất
```

### Bước 2: Các kỹ thuật tối ưu

```typescript
// ==========================================
// 1. DYNAMIC IMPORTS — chỉ load component khi cần
// ==========================================
import dynamic from 'next/dynamic'

// Component nặng (chart, editor, map) → lazy load
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false, // Không render trên server nếu component dùng window/document
})

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
})

// ==========================================
// 2. TREE SHAKING — import đúng thứ cần dùng
// ==========================================
// ❌ Import toàn bộ lodash (70KB+)
import _ from 'lodash'
_.debounce(fn, 300)

// ✅ Import đúng function cần dùng (~2KB)
import debounce from 'lodash/debounce'
debounce(fn, 300)

// ✅ Hoặc dùng lodash-es cho tree shaking tốt hơn
import { debounce } from 'lodash-es'

// ==========================================
// 3. SERVER COMPONENTS — code không ship xuống client
// ==========================================
// app/products/page.tsx — Server Component (mặc định)
// Logic nặng (ORM, markdown parser, date libraries) chạy trên server
// → 0 bytes JavaScript gửi xuống client
import { prisma } from '@/lib/prisma'
import { marked } from 'marked'

export default async function ProductsPage() {
  const products = await prisma.product.findMany()
  return (
    <div>
      {products.map(p => (
        <div key={p.id} dangerouslySetInnerHTML={{ __html: marked(p.description) }} />
      ))}
    </div>
  )
}

// ==========================================
// 4. next/font — tối ưu font, không load toàn bộ charset
// ==========================================
import { Inter } from 'next/font/google'
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
})

// ==========================================
// 5. PERFORMANCE BUDGETS — CI/CD kiểm tra tự động
// ==========================================
// package.json
// "size-limit": [
//   { "path": ".next/static/**/*.js", "limit": "200 KB" }
// ]
```

### Checklist tối ưu Bundle Size

| Kỹ thuật | Mức ảnh hưởng | Độ khó |
|---|---|---|
| Dynamic imports cho components nặng | Cao | Thấp |
| Tree shaking (import chính xác) | Cao | Thấp |
| Server Components cho logic server-side | Rất cao | Trung bình |
| next/font với subset | Trung bình | Thấp |
| Audit và remove unused dependencies | Cao | Thấp |
| Bundle analyzer trong CI/CD | Trung bình | Trung bình |

**Nguồn**: nextjs.org, developerway.com, dev.to/maurya-sachin, catchmetrics.io

---

## 1.3 Chiến lược tối ưu hình ảnh

### Câu hỏi phỏng vấn

> "Website có nhiều ảnh sản phẩm, load rất chậm. Bạn tối ưu như thế nào?"

### Giải pháp toàn diện

```typescript
// ==========================================
// 1. next/image — tối ưu tự động
// ==========================================
import Image from 'next/image'

// Hero image — priority để preload
function HeroBanner() {
  return (
    <Image
      src="/hero-banner.jpg"
      alt="Hero banner"
      width={1200}
      height={600}
      priority // Preload cho LCP
      sizes="100vw"
      quality={85}
      placeholder="blur" // LQIP (Low Quality Image Placeholder)
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    />
  )
}

// Product thumbnail — lazy load mặc định
function ProductCard({ product }: { product: Product }) {
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={300}
      height={300}
      sizes="(max-width: 768px) 50vw, 25vw" // Responsive sizes
      // loading="lazy" → mặc định, không cần khai báo
    />
  )
}

// ==========================================
// 2. RESPONSIVE IMAGES — phục vụ đúng kích thước
// ==========================================
// next/image tự động tạo srcset cho nhiều kích thước
// Cấu hình trong next.config.js:
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'], // Ưu tiên AVIF > WebP > JPEG
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopee.vn' },
    ],
  },
}

// ==========================================
// 3. PLACEHOLDER STRATEGIES
// ==========================================
// Blur placeholder cho ảnh tĩnh
import heroImage from '@/assets/hero.jpg' // Next.js tự tạo blurDataURL

// Skeleton placeholder cho ảnh động
function ImageWithSkeleton({ src, alt }: { src: string; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  return (
    <div className="relative">
      {!isLoaded && <div className="animate-pulse bg-gray-200 absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        onLoad={() => setIsLoaded(true)}
        className={isLoaded ? 'opacity-100' : 'opacity-0'}
      />
    </div>
  )
}
```

### So sánh định dạng ảnh

| Format | Nén | Browser support | Khi nào dùng |
|---|---|---|---|
| **AVIF** | Tốt nhất (~50% nhỏ hơn JPEG) | Chrome, Firefox | Mặc định nếu browser hỗ trợ |
| **WebP** | Rất tốt (~30% nhỏ hơn JPEG) | Gần như tất cả | Fallback từ AVIF |
| **JPEG** | Tốt | 100% | Fallback cuối cùng |
| **PNG** | Trung bình | 100% | Ảnh cần transparency |
| **SVG** | N/A | 100% | Icons, logos, illustrations |

**Nguồn**: nextjs.org/docs/app/api-reference/components/image, web.dev

---

## 1.4 Tối ưu SEO cho React/Next.js

### Câu hỏi phỏng vấn

> "React SPA thường có SEO kém. Bạn xử lý SEO cho ứng dụng Next.js như thế nào?"

### Tại sao React SPA có SEO kém?

- Crawler nhìn thấy `<div id="root"></div>` trống
- Content được render bằng JavaScript phía client → crawler có thể không chạy JS
- Meta tags được inject động → crawler đọc HTML ban đầu không có metadata

### Giải pháp toàn diện với Next.js

```typescript
// ==========================================
// 1. RENDERING STRATEGY — chọn đúng cho từng trang
// ==========================================

// SSG (Static Site Generation) — cho trang ít thay đổi
// Build time: tạo sẵn HTML
export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map(cat => ({ slug: cat.slug }))
}

// ISR (Incremental Static Regeneration) — cho trang cần cập nhật
export const revalidate = 3600 // Tái tạo mỗi 1 giờ

// SSR (Server-Side Rendering) — cho trang cần data real-time
export const dynamic = 'force-dynamic'

// ==========================================
// 2. METADATA API — quản lý meta tags
// ==========================================

// Static metadata
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://shopee-clone.com'),
  title: {
    default: 'Shopee Clone — Mua sắm online',
    template: '%s | Shopee Clone',
  },
  description: 'Nền tảng mua sắm trực tuyến hàng đầu Việt Nam',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://shopee-clone.com',
    siteName: 'Shopee Clone',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://shopee-clone.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

// Dynamic metadata — cho trang sản phẩm
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.imageUrl }],
    },
    alternates: {
      canonical: `https://shopee-clone.com/products/${params.slug}`,
    },
  }
}

// ==========================================
// 3. STRUCTURED DATA (JSON-LD)
// ==========================================
function ProductPage({ product }: { product: Product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'VND',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Product content */}
    </>
  )
}

// ==========================================
// 4. SITEMAP & ROBOTS TỰ ĐỘNG
// ==========================================

// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts()
  const productUrls = products.map(product => ({
    url: `https://shopee-clone.com/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: 'https://shopee-clone.com', lastModified: new Date(), priority: 1.0 },
    ...productUrls,
  ]
}

// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: 'https://shopee-clone.com/sitemap.xml',
  }
}
```

**Nguồn**: nextjs.org/docs/app/guides, strapi.io/blog/nextjs-seo, web.dev

---

## 1.5 Core Web Vitals (LCP, INP, CLS)

### Câu hỏi phỏng vấn

> "Core Web Vitals là gì? Giải thích từng metric và cách cải thiện trong React/Next.js."

### Ba metric chính (2026 — INP thay thế FID)

| Metric | Đo lường gì | Ngưỡng tốt | Ngưỡng kém |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | Thời gian render phần tử lớn nhất (hero image, heading) | ≤ 2.5s | > 4.0s |
| **INP** (Interaction to Next Paint) | Độ trễ từ lúc user click/tap đến lúc UI phản hồi | ≤ 200ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Mức độ layout bị dịch chuyển bất ngờ | ≤ 0.1 | > 0.25 |

### Cải thiện LCP

```typescript
// 1. Priority cho hero image
<Image src="/hero.jpg" alt="Hero" priority />

// 2. Preload font critical
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin', 'vietnamese'], display: 'swap' })

// 3. SSR/SSG — HTML đầy đủ từ server
// Tránh fetch data trong useEffect cho content quan trọng

// 4. Preload critical resources
// <link rel="preload" href="/hero.jpg" as="image" />
```

### Cải thiện INP

```typescript
// 1. Break up Long Tasks (> 50ms)
// Dùng useTransition cho update không khẩn cấp
const [isPending, startTransition] = useTransition()

function handleFilter(text: string) {
  setSearchText(text) // Urgent: cập nhật input ngay
  startTransition(() => {
    setFilteredItems(items.filter(i => i.includes(text))) // Non-urgent
  })
}

// 2. useDeferredValue — defer giá trị không khẩn cấp
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(
    () => heavyFilter(deferredQuery),
    [deferredQuery]
  )

  return <div style={{ opacity: query !== deferredQuery ? 0.5 : 1 }}>
    {results.map(r => <ResultItem key={r.id} item={r} />)}
  </div>
}

// 3. Web Workers cho tính toán nặng
// worker.ts
self.onmessage = (e) => {
  const result = heavyComputation(e.data)
  self.postMessage(result)
}

// Component
const worker = useMemo(() => new Worker(new URL('./worker.ts', import.meta.url)), [])
worker.onmessage = (e) => setResult(e.data)
worker.postMessage(data)

// 4. Code splitting — load ít JS hơn
import dynamic from 'next/dynamic'
const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

### Cải thiện CLS

```typescript
// 1. Luôn set width/height cho images
<Image src="/product.jpg" alt="Product" width={300} height={300} />

// 2. Font swap không gây layout shift
import { Inter } from 'next/font/google'
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true, // Điều chỉnh fallback font để match kích thước
})

// 3. Reserve space cho dynamic content
function AdBanner() {
  return (
    <div style={{ minHeight: '90px' }}> {/* Reserve space trước khi ad load */}
      <Suspense fallback={<div style={{ height: '90px' }} />}>
        <DynamicAd />
      </Suspense>
    </div>
  )
}

// 4. Avoid injecting content above existing content
// ❌ Sai: banner xuất hiện đẩy content xuống
// ✅ Đúng: reserve space hoặc đặt banner ở vị trí cố định
```

### Đo lường trong Production

```typescript
// app/layout.tsx — sử dụng web-vitals
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Gửi lên analytics service
    analytics.track('Web Vital', {
      name: metric.name,    // 'LCP', 'INP', 'CLS'
      value: metric.value,
      rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    })
  })
  return null
}
```

**Nguồn**: web.dev/articles/top-cwv, developers.google.com/search/docs/appearance/core-web-vitals, roastweb.com

---

## 1.6 Ngăn chặn Memory Leak trong React

### Câu hỏi phỏng vấn

> "Memory leak xảy ra khi nào trong React? Làm sao phát hiện và phòng tránh?"

### Memory Leak là gì?

Khi component unmount nhưng vẫn giữ references tới objects (event listeners, timers, subscriptions) → Garbage Collector không thể giải phóng bộ nhớ → App ngày càng chậm.

### 5 Pattern gây Memory Leak và cách sửa

```typescript
// ==========================================
// 1. EVENT LISTENERS — không remove khi unmount
// ==========================================
// ❌ Memory leak
useEffect(() => {
  window.addEventListener('resize', handleResize)
}, [])

// ✅ Cleanup
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth)
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

// ==========================================
// 2. TIMERS — không clear interval/timeout
// ==========================================
// ❌ Memory leak — interval chạy mãi sau khi unmount
useEffect(() => {
  setInterval(() => setCount(c => c + 1), 1000)
}, [])

// ✅ Cleanup
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000)
  return () => clearInterval(id)
}, [])

// ==========================================
// 3. API REQUESTS — setState sau khi unmount
// ==========================================
// ❌ Memory leak — "Can't perform a React state update on an unmounted component"
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data)) // Component có thể đã unmount!
}, [])

// ✅ Dùng AbortController
useEffect(() => {
  const controller = new AbortController()

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => {
      if (err.name !== 'AbortError') throw err
    })

  return () => controller.abort()
}, [])

// ==========================================
// 4. WEBSOCKET/EVENT SOURCE — không close connection
// ==========================================
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/ws')
  ws.onmessage = (event) => {
    setMessages(prev => [...prev, JSON.parse(event.data)])
  }
  return () => ws.close() // Đóng connection khi unmount
}, [])

// ==========================================
// 5. SUBSCRIPTIONS (Redux, Zustand, RxJS)
// ==========================================
useEffect(() => {
  const unsubscribe = store.subscribe(() => {
    setStoreState(store.getState())
  })
  return () => unsubscribe()
}, [])
```

### Phát hiện Memory Leak

```
Chrome DevTools → Memory tab:
1. Mở trang chứa component nghi ngờ
2. Bấm "Take Heap Snapshot" (Snapshot 1)
3. Navigate đi trang khác (unmount component)
4. Bấm "Take Heap Snapshot" (Snapshot 2)
5. So sánh: tìm "Detached DOM nodes" hoặc objects không được GC

Performance tab:
- Monitor memory over time
- Nếu memory tăng liên tục mà không giảm → Memory Leak
```

**Nguồn**: shiftasia.com, medium.com/@ignatovich.dm, stackoverflow.com

---

## 1.7 Network Optimization

### Câu hỏi phỏng vấn

> "Giải thích lazy loading, prefetching, code splitting. Khi nào dùng từng kỹ thuật?"

### So sánh 3 kỹ thuật

| Kỹ thuật | Mô tả | Khi nào dùng |
|---|---|---|
| **Lazy Loading** | Load resource khi user cần (scroll tới, click vào) | Images below fold, heavy components, routes ít truy cập |
| **Prefetching** | Load trước resource user có thể cần sắp tới | Link mà user có khả năng click, next page data |
| **Code Splitting** | Tách bundle thành nhiều chunks nhỏ | Route-based (mỗi page 1 chunk), component-based (heavy components) |

### Implementation chi tiết

```typescript
// ==========================================
// 1. LAZY LOADING
// ==========================================

// Route-based lazy loading
import { lazy, Suspense } from 'react'
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  )
}

// Component-based lazy loading (Next.js)
import dynamic from 'next/dynamic'
const MapComponent = dynamic(() => import('@/components/Map'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Map cần window object
})

// Image lazy loading — mặc định trong next/image
<Image src="/product.jpg" alt="Product" width={300} height={300} />
// loading="lazy" là default

// ==========================================
// 2. PREFETCHING
// ==========================================

// Next.js Link — tự động prefetch khi link visible
import Link from 'next/link'
<Link href="/products" prefetch={true}> {/* prefetch = true mặc định */}
  Sản phẩm
</Link>

// Manual prefetch với router
import { useRouter } from 'next/navigation'
function ProductCard({ slug }: { slug: string }) {
  const router = useRouter()
  return (
    <div
      onMouseEnter={() => router.prefetch(`/products/${slug}`)}
      onClick={() => router.push(`/products/${slug}`)}
    >
      ...
    </div>
  )
}

// Data prefetching với TanStack Query
import { useQueryClient } from '@tanstack/react-query'
function ProductList({ products }: Props) {
  const queryClient = useQueryClient()

  return products.map(product => (
    <div
      key={product.id}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ['product', product.id],
          queryFn: () => fetchProduct(product.id),
          staleTime: 5 * 60 * 1000,
        })
      }}
    >
      {product.name}
    </div>
  ))
}

// ==========================================
// 3. CODE SPLITTING STRATEGIES
// ==========================================

// Route-based: Next.js tự động split theo page
// app/products/page.tsx → chunk riêng
// app/cart/page.tsx → chunk riêng

// Library-based: chỉ import khi cần
const loadMoment = () => import('moment')
async function formatDate(date: Date) {
  const moment = await loadMoment()
  return moment.default(date).format('DD/MM/YYYY')
}

// Conditional loading — chỉ load cho specific users
const AdminPanel = dynamic(() => import('@/components/AdminPanel'))
function Header({ user }: { user: User }) {
  return (
    <nav>
      {user.role === 'admin' && <AdminPanel />}
    </nav>
  )
}
```

### Streaming & Suspense (Next.js App Router)

```typescript
// Streaming cho phép từng phần trang render trước khi data sẵn sàng
// app/products/page.tsx
import { Suspense } from 'react'

export default function ProductsPage() {
  return (
    <div>
      <h1>Sản phẩm</h1> {/* Render ngay */}
      <Suspense fallback={<FilterSkeleton />}>
        <ProductFilters /> {/* Stream khi data ready */}
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid /> {/* Stream khi data ready */}
      </Suspense>
    </div>
  )
}

// ProductGrid tự fetch data — user thấy skeleton trước, content sau
async function ProductGrid() {
  const products = await fetchProducts() // Có thể mất 2-3s
  return <div className="grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
}
```

**Nguồn**: nextjs.org, blog.logrocket.com, web.dev

---

# PHẦN 2: Real-World Scenario Questions

## 2.1 Implement Infinite Scrolling

### Câu hỏi phỏng vấn

> "Bạn sẽ implement infinite scrolling cho trang danh sách sản phẩm như thế nào?"

### Approach: Intersection Observer API

```typescript
import { useState, useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
}

// ==========================================
// CUSTOM HOOK: useInfiniteScroll
// ==========================================
function useInfiniteScroll<T>({
  fetchFn,
  pageSize = 20,
  options = {},
}: {
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>
  pageSize?: number
  options?: UseInfiniteScrollOptions
}) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const observerRef = useRef<IntersectionObserver | null>(null)

  // Sentinel ref — element cuối danh sách
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage(prev => prev + 1)
          }
        },
        {
          threshold: options.threshold ?? 0.1,
          rootMargin: options.rootMargin ?? '100px',
        }
      )

      if (node) observerRef.current.observe(node)
    },
    [loading, hasMore, options.threshold, options.rootMargin]
  )

  useEffect(() => {
    const controller = new AbortController()

    const loadMore = async () => {
      setLoading(true)
      try {
        const result = await fetchFn(page)
        setItems(prev => [...prev, ...result.data])
        setHasMore(result.hasMore)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err)
        }
      } finally {
        setLoading(false)
      }
    }

    loadMore()
    return () => controller.abort()
  }, [page, fetchFn])

  return { items, loading, hasMore, error, sentinelRef }
}

// ==========================================
// USAGE
// ==========================================
function ProductList() {
  const fetchProducts = useCallback(async (page: number) => {
    const res = await fetch(`/api/products?page=${page}&limit=20`)
    const data = await res.json()
    return { data: data.products, hasMore: data.hasMore }
  }, [])

  const { items, loading, hasMore, error, sentinelRef } = useInfiniteScroll<Product>({
    fetchFn: fetchProducts,
  })

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        {items.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Sentinel element — trigger load more khi visible */}
      {hasMore && <div ref={sentinelRef} className="h-10" />}

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {!hasMore && <p className="text-center text-gray-500">Đã hiển thị tất cả sản phẩm</p>}
    </div>
  )
}
```

### Với TanStack Query (approach thực tế hơn)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'

function ProductList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) =>
      fetch(`/api/products?cursor=${pageParam}`).then(r => r.json()),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  // Intersection Observer cho sentinel
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )

    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allProducts = data?.pages.flatMap(page => page.products) ?? []

  return (
    <div>
      {allProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      <div ref={sentinelRef} />
      {isFetchingNextPage && <Spinner />}
    </div>
  )
}
```

### Lưu ý quan trọng khi trả lời

- **Virtualization**: Nếu danh sách rất dài (>1000 items), kết hợp `react-window` để chỉ render items visible
- **UX**: Cung cấp "Load More" button như fallback cho accessibility
- **SEO**: Infinite scroll không tốt cho SEO → cung cấp `?page=N` URL cho crawler
- **Save scroll position**: Khi user back từ product detail → restore vị trí scroll

**Nguồn**: bkshaw1994.medium.com, zignuts.com, blog.logrocket.com

---

## 2.2 Authentication trong Next.js

### Câu hỏi phỏng vấn

> "Bạn sẽ thiết kế hệ thống authentication cho một ứng dụng Next.js như thế nào?"

### Kiến trúc 3 lớp

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Middleware  │ →  │ Server Component │ →  │ Client Component│
│  (Edge)     │    │ (Node.js)        │    │ (Browser)       │
│             │    │                  │    │                 │
│ Cookie check│    │ Full session     │    │ UI logic only   │
│ Redirect    │    │ DB lookup        │    │ useSession()    │
│ Public/Auth │    │ Role-based access│    │ Login form      │
└─────────────┘    └──────────────────┘    └─────────────────┘
```

### Implementation với NextAuth.js (Auth.js v5)

```typescript
// ==========================================
// 1. AUTH CONFIGURATION — auth.ts
// ==========================================
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const user = await verifyCredentials(
          credentials.email as string,
          credentials.password as string
        )
        if (!user) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

// ==========================================
// 2. MIDDLEWARE — bảo vệ route ở Edge
// ==========================================
// middleware.ts
import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isProtectedPage = req.nextUrl.pathname.startsWith('/dashboard')
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

  if (isProtectedPage && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  if (isAdminPage && req.auth?.user?.role !== 'admin') {
    return Response.redirect(new URL('/403', req.nextUrl))
  }

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl))
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
}

// ==========================================
// 3. SERVER COMPONENT — truy cập session an toàn
// ==========================================
// app/dashboard/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div>
      <h1>Xin chào, {session.user.name}</h1>
      <p>Role: {session.user.role}</p>
    </div>
  )
}

// ==========================================
// 4. CLIENT COMPONENT — login form
// ==========================================
'use client'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      toast.error('Email hoặc mật khẩu không đúng')
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span className="text-red-500">{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Mật khẩu" />
      {errors.password && <span className="text-red-500">{errors.password.message}</span>}

      <button type="submit">Đăng nhập</button>
      <button type="button" onClick={() => signIn('google')}>Đăng nhập với Google</button>
    </form>
  )
}
```

### Lưu ý bảo mật

| Nguyên tắc | Chi tiết |
|---|---|
| **HttpOnly cookies** | Token lưu trong HttpOnly cookie, JS không truy cập được → chống XSS |
| **Secure + SameSite** | Cookie chỉ gửi qua HTTPS, chống CSRF |
| **Không dùng localStorage** | Dễ bị XSS attack đọc token |
| **Server-side validation** | Luôn validate session ở server, không tin client |
| **Short-lived tokens** | JWT expire ngắn (15 phút), refresh token rotate |

**Nguồn**: nextjs.org/docs/app/guides/authentication, clerk.com, next-auth.js.org

---

## 2.3 Real-time Notification System

### Câu hỏi phỏng vấn

> "Bạn sẽ thiết kế hệ thống thông báo real-time cho ứng dụng e-commerce như thế nào?"

### Chọn protocol phù hợp

| Protocol | Hướng | Use case | Ưu điểm | Nhược điểm |
|---|---|---|---|---|
| **WebSocket** | 2 chiều | Chat, collaborative editing | Full-duplex, low latency | Phức tạp hơn, cần heartbeat |
| **SSE** (Server-Sent Events) | 1 chiều (server → client) | Notifications, live feed | Đơn giản, auto reconnect | Chỉ nhận, không gửi |
| **Polling** | Request/Response | Fallback | Đơn giản nhất | Tốn bandwidth, latency cao |

### Implementation với SSE (phù hợp cho notifications)

```typescript
// ==========================================
// CUSTOM HOOK: useNotifications
// ==========================================
function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const eventSource = new EventSource(`/api/notifications/stream?userId=${userId}`)

    eventSource.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data)
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    }

    eventSource.onerror = () => {
      eventSource.close()
      // SSE tự động reconnect, nhưng nếu lỗi liên tục → fallback polling
    }

    return () => eventSource.close()
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}

// ==========================================
// SERVER: API Route (Next.js App Router)
// ==========================================
// app/api/notifications/stream/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Subscribe to notification channel (Redis/DB)
      const subscription = await subscribeToUserNotifications(userId!, (notification) => {
        const data = `data: ${JSON.stringify(notification)}\n\n`
        controller.enqueue(encoder.encode(data))
      })

      // Heartbeat mỗi 30s để giữ connection
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'))
      }, 30000)

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        subscription.unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// ==========================================
// NOTIFICATION BELL COMPONENT
// ==========================================
function NotificationBell() {
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user.id)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} aria-label="Thông báo">
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg">
          <div className="flex justify-between p-3 border-b">
            <h3 className="font-semibold">Thông báo</h3>
            <button onClick={markAllAsRead} className="text-blue-500 text-sm">
              Đánh dấu tất cả đã đọc
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(n => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => markAsRead(n.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### Scale considerations

- **Multi-tab**: Dùng `BroadcastChannel` API để share 1 connection giữa nhiều tabs
- **Multi-server**: Dùng Redis Pub/Sub để broadcast giữa các server instances
- **Persistence**: Lưu notifications vào DB để user xem lại khi reconnect

**Nguồn**: medium.com/@wasifullahdev, medium.com/@dlrnjstjs, novu.co

---

## 2.4 Search với Debounce

### Câu hỏi phỏng vấn

> "Implement search input với debounce. Tại sao cần debounce?"

### Tại sao cần Debounce?

- User gõ "iphone" → 6 ký tự → 6 API calls nếu không debounce
- Gây quá tải server, lãng phí bandwidth, và race condition (response "iphon" có thể đến sau "iphone")

### Implementation

```typescript
// ==========================================
// HOOK: useDebounce
// ==========================================
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ==========================================
// SEARCH COMPONENT
// ==========================================
function SearchProducts() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  // TanStack Query sẽ tự fetch khi debouncedQuery thay đổi
  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 2, // Chỉ search từ 2 ký tự
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  })

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        className="w-full px-4 py-2 border rounded-lg"
      />

      {isLoading && <Spinner className="absolute right-3 top-3" />}

      {data && data.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white shadow-lg rounded-lg z-10">
          {data.map(product => (
            <li key={product.id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <Link href={`/products/${product.slug}`}>
                {highlightMatch(product.name, debouncedQuery)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Highlight text trùng khớp
function highlightMatch(text: string, query: string) {
  if (!query) return text
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
  )
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
```

### Debounce vs Throttle

| | Debounce | Throttle |
|---|---|---|
| **Hành vi** | Chờ user ngừng gõ mới thực thi | Thực thi đều đặn theo interval |
| **Use case** | Search input, form validation | Scroll handler, resize handler |
| **Ví dụ** | Gõ "abc" → chờ 300ms → 1 call | Scroll → mỗi 100ms → 1 call |

**Nguồn**: dev.to/debajit13, medium.com/@swetha.kattukota

---

## 2.5 Form Validation

### Câu hỏi phỏng vấn

> "Bạn xử lý form validation như thế nào? So sánh client-side và server-side validation."

### Stack chuẩn 2026: React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ==========================================
// 1. SCHEMA DEFINITION — tái sử dụng cả frontend & backend
// ==========================================
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Phải có ít nhất 1 số')
    .regex(/[^A-Za-z0-9]/, 'Phải có ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(50, 'Tên tối đa 50 ký tự'),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại Việt Nam không hợp lệ'),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'Bạn phải đồng ý điều khoản sử dụng' }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

// ==========================================
// 2. FORM COMPONENT
// ==========================================
function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // Validate khi user rời khỏi field
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        // Server trả về lỗi cụ thể cho từng field
        if (error.field === 'email') {
          setError('email', { message: 'Email đã được sử dụng' })
        }
        return
      }

      toast.success('Đăng ký thành công!')
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Email" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          className={errors.email ? 'border-red-500' : 'border-gray-300'}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
      </FormField>

      <FormField label="Mật khẩu" error={errors.password?.message}>
        <input {...register('password')} type="password" />
      </FormField>

      <FormField label="Xác nhận mật khẩu" error={errors.confirmPassword?.message}>
        <input {...register('confirmPassword')} type="password" />
      </FormField>

      <FormField label="Họ tên" error={errors.name?.message}>
        <input {...register('name')} />
      </FormField>

      <FormField label="Số điện thoại" error={errors.phone?.message}>
        <input {...register('phone')} type="tel" />
      </FormField>

      <label className="flex items-center gap-2">
        <input {...register('agreeToTerms')} type="checkbox" />
        <span>Tôi đồng ý với điều khoản sử dụng</span>
      </label>
      {errors.agreeToTerms && <p className="text-red-500">{errors.agreeToTerms.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
      </button>
    </form>
  )
}

// ==========================================
// 3. REUSABLE FORM FIELD COMPONENT
// ==========================================
function FormField({ label, error, children }: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">{error}</p>
      )}
    </div>
  )
}
```

### Client vs Server Validation

| | Client-side | Server-side |
|---|---|---|
| **Mục đích** | UX — phản hồi nhanh cho user | Security — nguồn tin duy nhất |
| **Có thể bypass?** | Có (DevTools, Postman) | Không |
| **Cần cả hai?** | **Luôn luôn cần cả hai** | **Luôn luôn cần cả hai** |

**Nguồn**: dev.to/vishwark, contentful.com, wasp.sh

---

## 2.6 Dark Mode

### Câu hỏi phỏng vấn

> "Bạn sẽ implement dark mode cho ứng dụng React/Next.js như thế nào?"

### Implementation với Tailwind CSS v4 + React Context

```typescript
// ==========================================
// 1. THEME CONTEXT
// ==========================================
type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme') as Theme) || 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches)
      root.classList.toggle('dark', isDark)
      setResolvedTheme(isDark ? 'dark' : 'light')
    }

    applyTheme()
    localStorage.setItem('theme', theme)

    // Lắng nghe thay đổi system preference
    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

// ==========================================
// 2. NGĂN FLASH OF UNSTYLED CONTENT (FOUC)
// ==========================================
// Thêm script inline vào <head> TRƯỚC React hydrate
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                var isDark = theme === 'dark' ||
                  (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

// ==========================================
// 3. THEME TOGGLE COMPONENT
// ==========================================
function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
      {(['light', 'system', 'dark'] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            theme === t
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-label={`Chế độ ${t === 'light' ? 'sáng' : t === 'dark' ? 'tối' : 'hệ thống'}`}
        >
          {t === 'light' && '☀️'}
          {t === 'system' && '💻'}
          {t === 'dark' && '🌙'}
        </button>
      ))}
    </div>
  )
}

// ==========================================
// 4. CSS VARIABLES (Tailwind v4)
// ==========================================
// app.css
// @import "tailwindcss";
// @custom-variant dark (&:where(.dark, .dark *));
//
// @theme {
//   --color-bg-primary: #ffffff;
//   --color-text-primary: #1a1a1a;
// }
//
// .dark {
//   --color-bg-primary: #121212;
//   --color-text-primary: #e0e0e0;
// }
```

### Hoặc dùng `next-themes` (giải pháp đơn giản hơn)

```typescript
// npm install next-themes
import { ThemeProvider } from 'next-themes'

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

// Sử dụng
import { useTheme } from 'next-themes'
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // ...
}
```

**Nguồn**: tailwindcss.com/docs/dark-mode, medium.com/design-bootcamp, magicui.design

---

## 2.7 Error Boundaries trong Production

### Câu hỏi phỏng vấn

> "Error Boundaries là gì? Bạn xử lý lỗi trong production React app như thế nào?"

### Implementation

```typescript
// ==========================================
// 1. ERROR BOUNDARY CLASS COMPONENT
// ==========================================
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: unknown[] // Tự reset khi key thay đổi
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Gửi lỗi lên monitoring service
    this.props.onError?.(error, errorInfo)

    // Ví dụ: Sentry
    // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Auto-reset khi resetKeys thay đổi (ví dụ: route change)
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, i) => key !== prevProps.resetKeys?.[i]
      )
      if (hasChanged) {
        this.setState({ hasError: false, error: null })
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div role="alert" className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-4">
            Chúng tôi đã ghi nhận lỗi này và đang xử lý.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Thử lại
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ==========================================
// 2. STRATEGIC PLACEMENT — đặt ở nhiều cấp
// ==========================================
function App() {
  return (
    // Level 1: App-wide boundary — fallback cuối cùng
    <ErrorBoundary
      fallback={<FullPageError />}
      onError={(error, info) => Sentry.captureException(error)}
    >
      <Header />
      <main>
        {/* Level 2: Per-section boundary — chỉ section lỗi bị ảnh hưởng */}
        <ErrorBoundary fallback={<SidebarError />}>
          <Sidebar />
        </ErrorBoundary>

        <ErrorBoundary fallback={<ContentError />}>
          {/* Level 3: Per-widget boundary */}
          <ErrorBoundary fallback={<WidgetError name="Chart" />}>
            <RevenueChart />
          </ErrorBoundary>
          <ErrorBoundary fallback={<WidgetError name="Table" />}>
            <OrdersTable />
          </ErrorBoundary>
        </ErrorBoundary>
      </main>
      <Footer />
    </ErrorBoundary>
  )
}

// ==========================================
// 3. ERROR HANDLING TOÀN DIỆN
// ==========================================
// Error Boundary KHÔNG bắt được:
// - Event handlers → dùng try/catch
// - Async code (setTimeout, fetch) → dùng try/catch hoặc React Query error state
// - Server-side rendering → dùng error.tsx trong Next.js

// Event handler error handling
function SubmitButton() {
  const handleClick = async () => {
    try {
      await submitForm()
    } catch (error) {
      // Error boundary KHÔNG bắt được lỗi này
      toast.error('Gửi form thất bại')
      Sentry.captureException(error)
    }
  }
  return <button onClick={handleClick}>Submit</button>
}

// Next.js error.tsx — catch route-level errors
// app/products/error.tsx
'use client'
export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Không thể tải danh sách sản phẩm</h2>
      <button onClick={reset}>Thử lại</button>
    </div>
  )
}
```

### Error Handling Checklist

| Loại lỗi | Công cụ | Scope |
|---|---|---|
| Render errors | Error Boundary | Component tree |
| Event handler errors | try/catch | Function scope |
| Async errors | try/catch, React Query `onError` | Promise scope |
| Route-level errors | Next.js `error.tsx` | Route segment |
| Global unhandled | `window.onerror`, `unhandledrejection` | Application |

**Nguồn**: legacy.reactjs.org/docs/error-boundaries.html, dev.to/blamsa0mine, nextjs.org

---

## 2.8 Tối ưu danh sách 10,000 items

### Câu hỏi phỏng vấn

> "Bạn cần render danh sách 10,000 items. Làm sao để UI không bị lag?"

### Đáp án: Virtualization (Windowing)

**Nguyên tắc**: Chỉ render items đang visible trong viewport. 10,000 items nhưng viewport chỉ hiển thị ~20 → chỉ render ~25 DOM nodes (20 visible + 5 overscan).

### Implementation với react-window

```typescript
import { FixedSizeList as List } from 'react-window'

interface Product {
  id: string
  name: string
  price: number
}

// ==========================================
// FIXED SIZE LIST — mỗi item cùng chiều cao
// ==========================================
function ProductList({ products }: { products: Product[] }) {
  const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const product = products[index]
    return (
      <div style={style} className="flex items-center px-4 border-b hover:bg-gray-50">
        <span className="flex-1">{product.name}</span>
        <span className="text-red-500 font-semibold">
          {product.price.toLocaleString('vi-VN')}₫
        </span>
      </div>
    )
  })

  return (
    <List
      height={600}         // Chiều cao viewport
      itemCount={products.length} // Tổng số items (10,000)
      itemSize={50}        // Chiều cao mỗi item (px)
      width="100%"
      overscanCount={5}    // Render thêm 5 items trên/dưới viewport
    >
      {Row}
    </List>
  )
}

// ==========================================
// VARIABLE SIZE LIST — item có chiều cao khác nhau
// ==========================================
import { VariableSizeList } from 'react-window'

function ChatMessages({ messages }: { messages: Message[] }) {
  const listRef = useRef<VariableSizeList>(null)

  // Ước tính chiều cao dựa trên nội dung
  const getItemSize = (index: number) => {
    const message = messages[index]
    const lineCount = Math.ceil(message.text.length / 50) // ~50 chars per line
    return 40 + lineCount * 20 // base height + lines
  }

  return (
    <VariableSizeList
      ref={listRef}
      height={500}
      itemCount={messages.length}
      itemSize={getItemSize}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style} className="p-2">
          <strong>{messages[index].sender}</strong>
          <p>{messages[index].text}</p>
        </div>
      )}
    </VariableSizeList>
  )
}
```

### Implementation với @tanstack/react-virtual (headless)

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualizedList({ items }: { items: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Chiều cao ước tính
    overscan: 5,
  })

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ProductRow product={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### So sánh thư viện

| Thư viện | Kích thước | Headless? | Variable heights | Best for |
|---|---|---|---|---|
| `react-window` | ~6KB | Không | VariableSizeList | Simple lists, tables |
| `@tanstack/react-virtual` | ~3KB | Có | measureElement | Custom layouts, full control |
| `react-virtualized` | ~30KB | Không | CellMeasurer | Complex grids, advanced features |

**Nguồn**: blog.logrocket.com, medium.com/@ignatovich.dm, patterns.dev/vanilla/virtual-lists

---

## 2.9 Internationalization (i18n)

### Câu hỏi phỏng vấn

> "Bạn sẽ implement đa ngôn ngữ cho ứng dụng Next.js như thế nào?"

### Approach chuẩn: next-intl + App Router

```typescript
// ==========================================
// 1. CẤU TRÚC THƯ MỤC
// ==========================================
// messages/
//   vi.json
//   en.json
// app/
//   [locale]/
//     layout.tsx
//     page.tsx
//     products/
//       page.tsx

// ==========================================
// 2. FILE DỊCH — messages/vi.json
// ==========================================
// {
//   "common": {
//     "search": "Tìm kiếm",
//     "cart": "Giỏ hàng",
//     "login": "Đăng nhập",
//     "register": "Đăng ký"
//   },
//   "product": {
//     "addToCart": "Thêm vào giỏ hàng",
//     "outOfStock": "Hết hàng",
//     "price": "Giá: {price, number, ::currency/VND}",
//     "reviewCount": "{count, plural, =0 {Chưa có đánh giá} one {# đánh giá} other {# đánh giá}}"
//   }
// }

// ==========================================
// 3. MIDDLEWARE — detect locale
// ==========================================
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'

export default createMiddleware({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localeDetection: true, // Tự detect từ Accept-Language header
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}

// ==========================================
// 4. LAYOUT — provide translations
// ==========================================
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

// ==========================================
// 5. SỬ DỤNG TRONG COMPONENT
// ==========================================
// Server Component
import { useTranslations } from 'next-intl'

export default function ProductPage() {
  const t = useTranslations('product')

  return (
    <div>
      <h1>{t('addToCart')}</h1>
      <p>{t('price', { price: 299000 })}</p>
      <p>{t('reviewCount', { count: 42 })}</p>
    </div>
  )
}

// ==========================================
// 6. LANGUAGE SWITCHER
// ==========================================
'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next-intl/navigation'

function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <select value={locale} onChange={e => switchLocale(e.target.value)}>
      <option value="vi">🇻🇳 Tiếng Việt</option>
      <option value="en">🇺🇸 English</option>
    </select>
  )
}
```

### SEO cho i18n

```typescript
// Thêm hreflang tags
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    alternates: {
      canonical: `https://shopee-clone.com/${params.locale}`,
      languages: {
        vi: 'https://shopee-clone.com/vi',
        en: 'https://shopee-clone.com/en',
      },
    },
  }
}

// Static generation cho tất cả locales
export function generateStaticParams() {
  return [{ locale: 'vi' }, { locale: 'en' }]
}
```

**Nguồn**: nextjs.org/docs/app/guides/internationalization, gundogmuseray.medium.com, poeditor.com

---

## 2.10 Cấu trúc ứng dụng React quy mô lớn

### Câu hỏi phỏng vấn

> "Bạn sẽ cấu trúc một ứng dụng React quy mô lớn (100+ components) như thế nào?"

### Feature-Based Architecture (chuẩn công nghiệp 2026)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                   # Route group: main layout
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── products/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   └── error.tsx                 # Global error boundary
│
├── features/                     # Feature modules (CORE)
│   ├── auth/
│   │   ├── components/           # LoginForm, RegisterForm, AuthGuard
│   │   ├── hooks/                # useAuth, useSession
│   │   ├── services/             # authApi.ts
│   │   ├── schemas/              # loginSchema.ts, registerSchema.ts
│   │   ├── types/                # auth.types.ts
│   │   └── index.ts              # Public API (barrel exports)
│   │
│   ├── products/
│   │   ├── components/           # ProductCard, ProductGrid, ProductFilters
│   │   ├── hooks/                # useProducts, useProductDetail
│   │   ├── services/             # productApi.ts
│   │   ├── types/                # product.types.ts
│   │   └── index.ts
│   │
│   ├── cart/
│   │   ├── components/           # CartItem, CartSummary, CartDrawer
│   │   ├── hooks/                # useCart
│   │   ├── store/                # cartStore.ts (Zustand)
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── notifications/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── index.ts
│
├── components/                   # Shared UI components
│   ├── ui/                       # Primitives: Button, Input, Modal, Badge
│   ├── layouts/                  # Header, Footer, Sidebar, PageLayout
│   └── common/                   # SEO, ErrorBoundary, LoadingSpinner
│
├── hooks/                        # Global hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
│
├── lib/                          # Utilities & configurations
│   ├── api/                      # Axios instance, interceptors
│   ├── utils/                    # formatCurrency, formatDate, cn()
│   └── constants/                # App-wide constants
│
├── stores/                       # Global state stores
│   └── appStore.ts
│
├── types/                        # Global TypeScript types
│   └── index.ts
│
└── styles/                       # Global styles
    └── globals.css
```

### Nguyên tắc kiến trúc

```typescript
// ==========================================
// 1. BARREL EXPORTS — kiểm soát public API
// ==========================================
// features/auth/index.ts
export { LoginForm } from './components/LoginForm'
export { RegisterForm } from './components/RegisterForm'
export { useAuth } from './hooks/useAuth'
export type { User, AuthState } from './types/auth.types'
// KHÔNG export internal components hoặc utilities

// Import từ bên ngoài feature:
import { LoginForm, useAuth } from '@/features/auth'

// ==========================================
// 2. STATE MANAGEMENT LAYERS
// ==========================================
// Server state → TanStack Query
const { data: products } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => productApi.getAll(filters),
})

// Global client state → Zustand
import { create } from 'zustand'
interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  total: () => number
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product) =>
    set(state => ({
      items: [...state.items, { product, quantity: 1 }],
    })),
  removeItem: (productId) =>
    set(state => ({
      items: state.items.filter(i => i.product.id !== productId),
    })),
  total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}))

// Local state → useState (giữ ở component)
const [isOpen, setIsOpen] = useState(false)

// ==========================================
// 3. SERVICE LAYER — centralize API calls
// ==========================================
// lib/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  // Attach token nếu có
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error)
  }
)

// features/products/services/productApi.ts
import { apiClient } from '@/lib/api/client'
import type { Product, ProductFilters } from '../types'

export const productApi = {
  getAll: (filters: ProductFilters) =>
    apiClient.get<{ products: Product[]; total: number }>('/products', { params: filters }),
  getBySlug: (slug: string) =>
    apiClient.get<Product>(`/products/${slug}`),
  create: (data: CreateProductDto) =>
    apiClient.post<Product>('/products', data),
}
```

### Scaling Strategy

| Quy mô | Chiến lược |
|---|---|
| **<20 components** | Flat structure: `components/`, `hooks/`, `services/` |
| **20-100 components** | Feature-based với `shared/` folder |
| **100+ components** | Feature-based + strict module boundaries + barrel exports |
| **Multi-team** | Monorepo (Turborepo/Nx) với shared packages |

**Nguồn**: oneuptime.com, reddit.com/r/react, robinwieruch.de, medium.com/@dlrnjstjs

---

# PHẦN 3: Coding Challenge Questions

## 3.1 Custom Hooks

### Bài 1: useDebounce

```typescript
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer) // Cleanup: tránh memory leak
  }, [value, delay])

  return debouncedValue
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults(debouncedQuery)
    }
  }, [debouncedQuery])

  return <input value={query} onChange={e => setQuery(e.target.value)} />
}
```

### Bài 2: useFetch

```typescript
interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [trigger, setTrigger] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const json = await response.json()
        setData(json)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [url, trigger]) // trigger cho refetch

  const refetch = useCallback(() => setTrigger(t => t + 1), [])

  return { data, loading, error, refetch }
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, refetch } = useFetch<User>(`/api/users/${userId}`)

  if (loading) return <Skeleton />
  if (error) return <ErrorMessage error={error} onRetry={refetch} />
  if (!user) return null

  return <div>{user.name}</div>
}
```

### Bài 3: useLocalStorage

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error)
        }
        return valueToStore
      })
    },
    [key]
  )

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}

// Usage
function App() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recent-searches', [])

  const addSearch = (query: string) => {
    setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 10))
  }
}
```

### Điểm đánh giá khi phỏng vấn

| Tiêu chí | Mong đợi |
|---|---|
| TypeScript generics | Hook phải type-safe, dùng generics |
| useEffect cleanup | Phải có cleanup function (clearTimeout, abort, removeEventListener) |
| Edge cases | Handle SSR (typeof window), errors, empty states |
| Naming convention | Bắt đầu bằng `use` |
| Dependencies | Đúng dependency array, giải thích tại sao |

---

## 3.2 Simple State Management

### Bài: Implement mini state management giống Zustand

```typescript
// ==========================================
// MINI STORE IMPLEMENTATION
// ==========================================
type Listener = () => void
type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void
type GetState<T> = () => T

function createStore<T extends object>(
  initializer: (set: SetState<T>, get: GetState<T>) => T
) {
  let state: T
  const listeners = new Set<Listener>()

  const getState: GetState<T> = () => state

  const setState: SetState<T> = (partial) => {
    const nextPartial = typeof partial === 'function' ? partial(state) : partial
    const nextState = { ...state, ...nextPartial }

    if (!Object.is(state, nextState)) {
      state = nextState
      listeners.forEach(listener => listener())
    }
  }

  // Initialize state
  state = initializer(setState, getState)

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return { getState, setState, subscribe }
}

// ==========================================
// REACT HOOK — useSyncExternalStore
// ==========================================
function useStore<T extends object, S>(
  store: ReturnType<typeof createStore<T>>,
  selector: (state: T) => S
): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()) // Server snapshot
  )
}

// ==========================================
// USAGE
// ==========================================
const counterStore = createStore<{
  count: number
  increment: () => void
  decrement: () => void
}>((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
}))

function Counter() {
  const count = useStore(counterStore, state => state.count)
  const increment = useStore(counterStore, state => state.increment)

  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

---

## 3.3 Dropdown/Autocomplete Component

```typescript
// ==========================================
// ACCESSIBLE AUTOCOMPLETE COMPONENT
// ==========================================
interface AutocompleteProps<T> {
  items: T[]
  getLabel: (item: T) => string
  onSelect: (item: T) => void
  placeholder?: string
  filterFn?: (item: T, query: string) => boolean
}

function Autocomplete<T>({
  items,
  getLabel,
  onSelect,
  placeholder = 'Tìm kiếm...',
  filterFn,
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  const filtered = useMemo(() => {
    if (!query) return items
    const defaultFilter = (item: T, q: string) =>
      getLabel(item).toLowerCase().includes(q.toLowerCase())
    return items.filter(item => (filterFn ?? defaultFilter)(item, query))
  }, [items, query, getLabel, filterFn])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filtered.length - 1 ? prev + 1 : 0
        )
        setIsOpen(true)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filtered.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.focus()
        break
    }
  }

  const handleSelect = (item: T) => {
    setQuery(getLabel(item))
    setIsOpen(false)
    setHighlightedIndex(-1)
    onSelect(item)
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  return (
    <div className="relative" onBlur={() => setTimeout(() => setIsOpen(false), 150)}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
          setHighlightedIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined
        }
        aria-autocomplete="list"
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      {isOpen && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute w-full mt-1 max-h-60 overflow-auto bg-white border rounded-lg shadow-lg z-50"
        >
          {filtered.map((item, index) => (
            <li
              key={index}
              id={`option-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2 cursor-pointer ${
                index === highlightedIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-50'
              }`}
            >
              {getLabel(item)}
            </li>
          ))}
        </ul>
      )}

      {isOpen && filtered.length === 0 && query && (
        <div className="absolute w-full mt-1 px-4 py-2 bg-white border rounded-lg shadow-lg text-gray-500">
          Không tìm thấy kết quả
        </div>
      )}
    </div>
  )
}

// Usage
function ProductSearch() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <Autocomplete
      items={products}
      getLabel={(p) => p.name}
      onSelect={(p) => setSelectedProduct(p)}
      placeholder="Tìm sản phẩm..."
    />
  )
}
```

---

## 3.4 Pagination

```typescript
// ==========================================
// PAGINATION HOOK
// ==========================================
interface UsePaginationOptions {
  totalItems: number
  itemsPerPage: number
  initialPage?: number
  siblingCount?: number
}

function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1,
  siblingCount = 1,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const pages = useMemo(() => {
    const range = (start: number, end: number) =>
      Array.from({ length: end - start + 1 }, (_, i) => start + i)

    const leftSibling = Math.max(currentPage - siblingCount, 1)
    const rightSibling = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftSibling > 2
    const showRightDots = rightSibling < totalPages - 1

    if (!showLeftDots && !showRightDots) {
      return range(1, totalPages)
    }

    if (!showLeftDots && showRightDots) {
      const leftRange = range(1, 3 + 2 * siblingCount)
      return [...leftRange, '...', totalPages]
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = range(totalPages - 2 - 2 * siblingCount, totalPages)
      return [1, '...', ...rightRange]
    }

    return [1, '...', ...range(leftSibling, rightSibling), '...', totalPages]
  }, [currentPage, totalPages, siblingCount])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return {
    currentPage,
    totalPages,
    pages,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  }
}

// ==========================================
// PAGINATION COMPONENT
// ==========================================
function Pagination({ totalItems, itemsPerPage, onPageChange }: {
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}) {
  const {
    currentPage, pages, goToPage, nextPage, prevPage, isFirstPage, isLastPage,
  } = usePagination({ totalItems, itemsPerPage })

  useEffect(() => {
    onPageChange(currentPage)
  }, [currentPage, onPageChange])

  return (
    <nav aria-label="Phân trang" className="flex items-center gap-1">
      <button
        onClick={prevPage}
        disabled={isFirstPage}
        aria-label="Trang trước"
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        ‹
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`dots-${index}`} className="px-2">...</span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page as number)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`px-3 py-1 rounded border ${
              page === currentPage
                ? 'bg-blue-500 text-white border-blue-500'
                : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={nextPage}
        disabled={isLastPage}
        aria-label="Trang sau"
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        ›
      </button>
    </nav>
  )
}
```

---

## 3.5 Accessible Modal

```typescript
// ==========================================
// ACCESSIBLE MODAL COMPONENT
// ==========================================
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const titleId = useId()

  // Lưu element đang focus trước khi mở modal
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      // Focus vào modal khi mở
      modalRef.current?.focus()
    }
    return () => {
      // Trả focus về element trước đó khi đóng
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  // ESC để đóng modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    }
    return () => {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
      )

      const firstEl = focusableElements[0]
      const lastEl = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative bg-white rounded-xl shadow-xl ${sizeClasses[size]} w-full mx-4 p-6 focus:outline-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  )
}

// ==========================================
// USAGE
// ==========================================
function ProductActions() {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Xóa sản phẩm</button>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Xác nhận xóa"
      >
        <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 border rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={() => { deleteProduct(); setShowConfirm(false) }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Xóa
          </button>
        </div>
      </Modal>
    </>
  )
}
```

### Accessibility Checklist cho Modal

| Yêu cầu | Implementation |
|---|---|
| `role="dialog"` | ✅ Thông báo cho screen reader đây là dialog |
| `aria-modal="true"` | ✅ Ngăn screen reader đọc nội dung phía sau |
| `aria-labelledby` | ✅ Liên kết modal với tiêu đề |
| Focus trap | ✅ Tab/Shift+Tab giữ trong modal |
| ESC đóng modal | ✅ Keyboard shortcut |
| Restore focus | ✅ Trả focus về button đã mở modal |
| Lock scroll | ✅ Không scroll background |
| Click backdrop đóng | ✅ Click bên ngoài modal |

---

# PHẦN 4: Behavioral/Soft Skill Questions

## 4.1 "Bạn làm việc với designer như thế nào?"

### Cách trả lời (STAR Method)

**Gợi ý cấu trúc:**

> **Situation**: "Trong dự án gần nhất, designer đưa mockup có nhiều animation phức tạp và layout responsive chi tiết."
>
> **Task**: "Tôi cần đảm bảo implement đúng design intent mà vẫn giữ performance tốt."
>
> **Action**:
> - "Tôi chủ động review mockup với designer trước khi code, hỏi rõ behavior ở các breakpoints"
> - "Khi thấy animation quá nặng (ảnh hưởng INP), tôi propose alternative và giải thích trade-off"
> - "Sử dụng Figma Dev Mode để lấy chính xác spacing, colors, typography"
> - "Demo trên staging và mời designer QA trước khi merge"
>
> **Result**: "Designer hài lòng vì output sát design. Team tiết kiệm 2 sprint vì giảm revision. Tôi cũng push back hợp lý khi design không feasible trên mobile."

### Điểm mấu chốt

- **Proactive communication**: Không đợi designer spec xong mới hỏi, mà tham gia sớm
- **Technical empathy**: Giải thích constraints (performance, browser support) bằng ngôn ngữ designer hiểu
- **Design system collaboration**: Đề xuất xây dựng design system chung (Storybook, tokens)

---

## 4.2 "Bạn xử lý code review feedback như thế nào?"

### Cách trả lời

> "Tôi coi code review là cơ hội học hỏi, không phải chỉ trích cá nhân."
>
> **Khi nhận feedback**:
> - "Đọc kỹ từng comment, hiểu context trước khi phản hồi"
> - "Nếu đồng ý → fix ngay và reply 'Good catch, updated'"
> - "Nếu không đồng ý → giải thích reasoning, đưa evidence (benchmark, docs)"
> - "Nếu không chắc → hỏi clarifying question: 'Bạn có thể giải thích thêm tại sao approach X tốt hơn không?'"
>
> **Khi review người khác**:
> - "Focus vào logic, patterns, edge cases — không nitpick formatting (để linter xử lý)"
> - "Đưa ra suggestion kèm giải thích, không chỉ nói 'sai'"
> - "Chia thành: blocker (phải fix), suggestion (nên fix), nit (tùy bạn)"

---

## 4.3 "Bạn approach debugging production issue như thế nào?"

### Cách trả lời (cấu trúc quy trình)

> **Step 1: Assess Impact**
> - "Xác định scope: bao nhiêu user bị ảnh hưởng? Feature nào bị ảnh hưởng?"
> - "Nếu critical (payment, auth broken) → escalate ngay"
>
> **Step 2: Reproduce**
> - "Kiểm tra error monitoring (Sentry, LogRocket): error message, stack trace, user actions"
> - "Reproduce locally: check browser, OS, network conditions của user"
>
> **Step 3: Isolate**
> - "Dùng git bisect nếu không rõ khi nào bug xuất hiện"
> - "Kiểm tra recent deployments: 'Bug có sau deploy không?'"
> - "Network tab: API response có đúng không? CORS? 500?"
>
> **Step 4: Fix & Verify**
> - "Fix root cause, không chỉ symptom"
> - "Viết test case cho scenario gây bug"
> - "Deploy hotfix → monitor metrics 30 phút"
>
> **Step 5: Post-mortem**
> - "Viết brief post-mortem: nguyên nhân, impact, fix, prevention"
> - "Chia sẻ với team để tránh lặp lại"

---

## 4.4 "Bạn cập nhật kiến thức công nghệ mới như thế nào?"

### Cách trả lời

> - "**Daily**: Đọc newsletters (This Week in React, Bytes.dev, JavaScript Weekly)"
> - "**Weekly**: Đọc blog posts từ Dan Abramov, Kent C. Dodds, Josh Comeau"
> - "**Monthly**: Xem tech talks (React Conf, Next.js Conf)"
> - "**Quarterly**: Thử nghiệm technology mới trong side project"
> - "**Continuous**: Tham gia Discord/Reddit communities (r/reactjs, r/nextjs)"
>
> **Ví dụ cụ thể**: "Khi React Server Components ra mắt, tôi đã đọc RFC, xem Dan Abramov demo, sau đó migrate 1 route trong dự án thực để hiểu trade-offs. Kinh nghiệm này giúp tôi đề xuất migration strategy cho team."

### Resources cụ thể cho developer Việt Nam

| Resource | Loại | Ngôn ngữ |
|---|---|---|
| This Week in React | Newsletter hàng tuần | English |
| Bytes.dev | Newsletter vui, dễ hiểu | English |
| React docs (react.dev) | Official docs | English |
| Viblo.asia | Blog community | Vietnamese |
| Cộng đồng ReactJS Vietnam (Facebook) | Community | Vietnamese |
| F8 (fullstack.edu.vn) | Khóa học | Vietnamese |

---

## 4.5 "Kể về một vấn đề kỹ thuật khó mà bạn đã giải quyết"

### Template trả lời (STAR)

> **Situation**: "Ứng dụng e-commerce của chúng tôi bị lag nghiêm trọng khi user filter sản phẩm. Lighthouse score chỉ 35/100."
>
> **Task**: "Tôi được giao cải thiện performance lên 80+ trong 2 sprint."
>
> **Action**:
> 1. "Dùng React Profiler → phát hiện ProductList re-render 47 lần mỗi khi filter thay đổi"
> 2. "Root cause: state được lift lên quá cao, mỗi filter change → re-render toàn bộ page"
> 3. "Solution:
>    - Tách ProductList thành component riêng, bọc React.memo
>    - Dùng useMemo cho filtered products
>    - Implement virtualization (react-window) cho list 500+ items
>    - Dynamic import cho chart components
>    - Migrate heavy filtering logic sang Web Worker"
> 4. "Viết benchmark test để regression không xảy ra lại"
>
> **Result**: "Lighthouse score: 35 → 92. Initial load time giảm 60%. Team adopt patterns này cho tất cả pages. Tôi cũng viết internal doc chia sẻ learnings."

### Tips cho câu trả lời tốt

- **Cụ thể với con số**: "giảm 60%", "từ 35 lên 92", "47 lần re-render"
- **Giải thích reasoning**: Tại sao chọn approach này thay vì approach khác
- **Nhấn mạnh impact**: Không chỉ fix bug mà còn ảnh hưởng tích cực đến team/product
- **Lessons learned**: Rút ra bài học gì, áp dụng như thế nào cho tương lai

---

# TÓM TẮT VÀ CHIẾN LƯỢC ÔN TẬP

## Priority Matrix

| Mức độ ưu tiên | Chủ đề | Lý do |
|---|---|---|
| **Cao nhất** | Performance (re-render, memoization) | Hỏi trong 90% phỏng vấn |
| **Cao nhất** | Custom Hooks (useDebounce, useFetch) | Live coding phổ biến nhất |
| **Cao** | State Management + Architecture | Đánh giá tư duy hệ thống |
| **Cao** | Authentication & Error Handling | Kinh nghiệm production |
| **Trung bình** | Core Web Vitals & SEO | Phân biệt mid vs senior |
| **Trung bình** | Accessibility | Ngày càng được coi trọng |
| **Nên biết** | i18n, Dark Mode | Bonus points |

## Checklist trước phỏng vấn

- [ ] Giải thích được React rendering cycle (reconciliation, virtual DOM, fiber)
- [ ] Viết được useDebounce, useFetch từ đầu (không xem code)
- [ ] Giải thích sự khác nhau giữa SSR, SSG, ISR, CSR và khi nào dùng
- [ ] Demo được React DevTools Profiler
- [ ] Giải thích Error Boundary lifecycle methods
- [ ] Viết được Zod schema + React Hook Form integration
- [ ] Giải thích Intersection Observer API
- [ ] Biết khi nào dùng react-window vs @tanstack/react-virtual
- [ ] Chuẩn bị 3-5 câu chuyện STAR cho behavioral questions
- [ ] Giải thích được tại sao không nên lưu token trong localStorage

---

## NGUỒN THAM KHẢO

1. React Official Docs — https://react.dev
2. Next.js Docs — https://nextjs.org/docs
3. web.dev Core Web Vitals — https://web.dev/articles/top-cwv
4. Google Search Central — https://developers.google.com/search/docs/appearance/core-web-vitals
5. LogRocket Blog — https://blog.logrocket.com
6. Growin React Performance — https://www.growin.com/blog/react-performance-optimization-2025/
7. DEV Community — https://dev.to
8. TurboDocx React Performance Guide — https://www.turbodocx.com/blog/react-performance-optimization
9. OneUptime Blog — https://oneuptime.com/blog
10. GreatFrontEnd Interview Playbook — https://www.greatfrontend.com/behavioral-interview-playbook
11. Tailwind CSS Dark Mode — https://tailwindcss.com/docs/dark-mode
12. Next.js Authentication Guide — https://nextjs.org/docs/app/guides/authentication
13. Clerk Authentication — https://clerk.com/articles/user-authentication-for-nextjs-top-tools-and-recommendations-for-2025
14. next-intl Documentation — https://next-intl-docs.vercel.app
15. Patterns.dev Virtual Lists — https://www.patterns.dev/vanilla/virtual-lists/
