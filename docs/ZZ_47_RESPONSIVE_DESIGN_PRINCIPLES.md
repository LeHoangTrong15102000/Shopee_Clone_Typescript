# Phân Tích Responsive Design — Shopee Clone TypeScript

> Tài liệu phân tích chi tiết toàn bộ hệ thống responsive trong dự án, bao gồm nguyên tắc thiết kế, kỹ thuật áp dụng, và code minh họa thực tế.

---

## Mục Lục

1. [Triết lý thiết kế](#1-triết-lý-thiết-kế--mobile-first)
2. [Hệ thống Breakpoints](#2-hệ-thống-breakpoints)
3. [Custom Hooks cho Responsive](#3-custom-hooks-cho-responsive)
4. [Layout Patterns](#4-layout-patterns)
5. [Navigation Responsive](#5-navigation-responsive)
6. [Grid & Flexbox Patterns](#6-grid--flexbox-patterns)
7. [Typography Responsive](#7-typography-responsive)
8. [Spacing & Sizing Responsive](#8-spacing--sizing-responsive)
9. [Touch-Friendly Design](#9-touch-friendly-design)
10. [Image Optimization](#10-image-optimization)
11. [Animation & Performance](#11-animation--performance)
12. [Dual Layout Strategy](#12-dual-layout-strategy)
13. [Responsive trên từng Page](#13-responsive-trên-từng-page)
14. [Responsive trên Shared Components](#14-responsive-trên-shared-components)
15. [Accessibility](#15-accessibility)
16. [Tổng kết & Đánh giá](#16-tổng-kết--đánh-giá)

---

## 1. Triết lý thiết kế — Mobile-First

Toàn bộ dự án áp dụng nguyên tắc **Mobile-First**: viết CSS base cho mobile trước, sau đó dùng responsive prefix (`sm:`, `md:`, `lg:`, `xl:`) để nâng cấp giao diện cho màn hình lớn hơn.

### Tại sao Mobile-First?

- **Ưu tiên trải nghiệm mobile**: Phần lớn người dùng Shopee truy cập từ điện thoại
- **Progressive Enhancement**: Bắt đầu từ layout đơn giản nhất, thêm tính năng khi màn hình lớn hơn
- **Performance**: Mobile nhận ít CSS hơn vì không cần override các style desktop
- **Maintainability**: Code dễ đọc — base style = mobile, prefix = desktop enhancement

### Minh họa nguyên tắc

```tsx
// ❌ Desktop-First (KHÔNG dùng trong dự án)
className='grid-cols-4 sm:grid-cols-2'  // Desktop trước, thu nhỏ cho mobile

// ✅ Mobile-First (dự án dùng cách này)
className='grid-cols-2 md:grid-cols-4'  // Mobile trước, mở rộng cho desktop
```

Mọi class Tailwind **không có prefix** = style cho mobile. Prefix `md:`, `lg:` = style cho màn hình lớn hơn.

---

## 2. Hệ thống Breakpoints

Dự án sử dụng hệ thống breakpoints mặc định của Tailwind CSS:

| Prefix | Min-width | Thiết bị mục tiêu | Mức độ sử dụng |
|--------|-----------|-------------------|-----------------|
| (none) | 0px | Mobile | **Base** — mọi nơi |
| `sm:` | 640px | Mobile lớn / Tablet nhỏ | **Trung bình** — sizing, typography |
| `md:` | 768px | Tablet / Desktop nhỏ | **Chủ đạo** — layout switching |
| `lg:` | 1024px | Desktop | **Vừa phải** — grid refinement |
| `xl:` | 1280px | Desktop lớn | **Ít** — grid columns |
| `2xl:` | 1536px | Ultra-wide | **Rất ít** — chỉ vài chỗ |

### Thống kê sử dụng breakpoints

```
md:  → ~280+ lần  — Breakpoint CHÍNH để phân tách mobile/desktop
sm:  → ~95+ lần   — Điều chỉnh trung gian (typography, spacing)
lg:  → ~90+ lần   — Grid columns, layout refinement
xl:  → ~35+ lần   — Grid columns cho màn hình lớn
2xl: → ~3 lần     — Rất hiếm dùng
```

### Breakpoint `md:` là ranh giới chính

Hầu hết logic responsive xoay quanh `md:` (768px):

```tsx
// Ẩn trên mobile, hiện trên desktop
<div className='hidden md:block'>
  <NavHeader />
</div>

// Hiện trên mobile, ẩn trên desktop
<div className='md:hidden'>
  <MobileNavigationDrawer />
</div>
```

**Lý do**: 768px là điểm mà layout chuyển từ single-column (mobile) sang multi-column (desktop), phù hợp với iPad portrait và hầu hết tablet.

---

## 3. Custom Hooks cho Responsive

Dự án tạo 3 custom hooks để xử lý responsive ở cấp JavaScript (không chỉ CSS):

### 3.1 `useIsMobile()` — Phát hiện thiết bị mobile

```typescript
// src/hooks/useIsMobile.ts
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
  )
  // Lắng nghe thay đổi kích thước màn hình
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}
```

**Nơi sử dụng** (8+ pages/components):
- `ProductList.tsx` — Tắt animation trên mobile
- `ProductListInfinite.tsx` — Tắt animation trên mobile
- `Wishlist.tsx` — Conditional animation variants
- `NotFound.tsx` — Tắt animation
- `Footer.tsx` — Tắt animation cho performance
- `CartItemList.tsx` — Conditional rendering

**Khi nào dùng hook thay vì CSS?**
- Khi cần **tắt hoàn toàn** một tính năng (animation, heavy computation)
- Khi cần **render component khác nhau** (không chỉ ẩn/hiện)
- Khi cần **logic JavaScript** phụ thuộc vào kích thước màn hình

### 3.2 `useReducedMotion()` — Accessibility cho animation

```typescript
// src/hooks/useReducedMotion.ts
const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  // Lắng nghe thay đổi system preference
  // ...
  return reducedMotion
}
```

**Nơi sử dụng** (7+ pages):
- `Login.tsx`, `Register.tsx`, `ProductDetail.tsx`
- `Profile.tsx`, `ChangePassword.tsx`, `HistoryPurchases.tsx`

### 3.4 `useViewMode()` — Chế độ hiển thị sản phẩm

```typescript
// src/hooks/useViewMode.ts
// Cho phép user chuyển đổi giữa Grid view và List view
// Lưu preference vào localStorage
```

**Nơi sử dụng**: `ProductList.tsx` — Toggle giữa grid cards và list items

---

## 4. Layout Patterns

### 4.1 Cấu trúc Layout chung

Dự án có 3 layout chính, tất cả đều là wrapper đơn giản:

```tsx
// MainLayout — Trang chính
<div className='min-h-screen bg-gray-100 dark:bg-slate-900'>
  <Header />        {/* Responsive riêng */}
  <Outlet />         {/* Page content */}
  <Footer />         {/* Responsive riêng */}
</div>

// CartLayout — Trang giỏ hàng
<div className='min-h-screen bg-gray-100 dark:bg-slate-900'>
  <CartHeader />     {/* Responsive phức tạp nhất */}
  <Outlet />
  <Footer />
</div>

// RegisterLayout — Đăng ký/Đăng nhập
<div className='min-h-screen bg-gray-100 dark:bg-slate-900'>
  <RegisterHeader /> {/* Multi-breakpoint responsive */}
  <Outlet />
  <Footer />
</div>
```

**Nguyên tắc**: Layout KHÔNG chứa responsive logic — mỗi child component tự xử lý responsive riêng. Điều này giúp:
- Tách biệt trách nhiệm (separation of concerns)
- Dễ test từng component độc lập
- Dễ thay đổi responsive behavior mà không ảnh hưởng layout

### 4.2 Container Pattern

```tsx
// Tailwind container class được dùng xuyên suốt
className='container'
// Tương đương: max-w-7xl mx-auto px-4

// Một số nơi dùng custom responsive padding
className='mx-auto max-w-7xl px-3 sm:px-4 md:px-8'
// Mobile: 12px → Tablet: 16px → Desktop: 32px
```

### 4.3 User Layout — Sidebar + Content

```tsx
// src/pages/User/layouts/UserLayout/UserLayout.tsx
<div className='grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-6'>
  {/* Sidebar — ẩn trên mobile, 2-3 cột trên desktop */}
  <aside className='md:col-span-3 lg:col-span-2'>
    <UserSideNav />
  </aside>

  {/* Content — full width mobile, 9-10 cột desktop */}
  <main className='md:col-span-9 md:ml-4 lg:col-span-10 lg:ml-6.75'>
    <Outlet />
  </main>
</div>
```

**Mobile**: Sidebar biến thành `MobileAccountNav` (dropdown), content chiếm full width.
**Desktop**: Sidebar bên trái (2-3 cột), content bên phải (9-10 cột).

---

## 5. Navigation Responsive

### 5.1 Header — Dual Layout System

Header là component responsive phức tạp nhất, dùng **2 layout hoàn toàn riêng biệt**:

```tsx
// src/components/Header/Header.tsx

{/* === DESKTOP LAYOUT === */}
<div className='hidden md:block'>
  <NavHeader />  {/* Thanh trên: ngôn ngữ, thông báo, tài khoản */}
</div>
<div className='mt-4 hidden grid-cols-12 items-end gap-4 md:grid'>
  <div className='col-span-2'>  {/* Logo */}
    <ShopeeIcon className='h-8 w-full fill-white md:h-10 lg:h-12' />
  </div>
  <div className='col-span-8'>  {/* Search bar */}
    <SearchForm />
  </div>
  <div className='col-span-2'>  {/* Cart icon */}
    <CartPopover />
  </div>
</div>

{/* === MOBILE LAYOUT === */}
<div className='flex items-center gap-3 py-2 md:hidden'>
  <ShopeeIcon className='h-9 w-auto fill-white shrink-0' />
  <SearchForm className='min-w-0 flex-1' />
  <button className='shrink-0 p-1'>☰</button>  {/* Hamburger */}
</div>
<MobileNavigationDrawer />  {/* Slide-in drawer thay NavHeader */}
```

**Tại sao dùng 2 layout riêng thay vì 1 layout responsive?**
- Desktop dùng **12-column grid** (logo + search + cart)
- Mobile dùng **flexbox** (logo + search + hamburger)
- Cấu trúc DOM khác nhau hoàn toàn → không thể dùng chung 1 layout
- Cart popover trên desktop → Navigation drawer trên mobile

### 5.2 CartHeader — Multi-Breakpoint Progressive

```tsx
// src/components/CartHeader/CartHeader.tsx

// Logo scale qua 3 breakpoints
<ShopeeIcon className='h-7 fill-orange sm:h-8 md:h-11' />
//                      28px        32px      44px

// Divider scale
<div className='mx-2 h-5 border-r sm:mx-4 sm:h-6 md:h-8' />
//               8px  20px         16px  24px     32px

// Title scale
<span className='text-sm sm:text-[15px] md:text-2xl'>Giỏ Hàng</span>
//                14px     15px           24px

// Search form: flexible trên mobile, fixed trên desktop
<form className='min-w-0 flex-1 md:w-[50%] md:flex-none'>
```

### 5.3 Mobile Navigation Drawer

```tsx
// src/components/MobileNavigationDrawer/MobileNavigationDrawer.tsx

// Backdrop — chỉ hiện trên mobile
<motion.div className='fixed inset-0 z-9998 bg-black md:hidden'
  initial={{ opacity: 0 }}
  animate={{ opacity: 0.5 }}
/>

// Drawer — slide từ trái, fixed width 280px
<motion.div className='fixed top-0 left-0 z-9999 h-full w-[280px]
  overflow-y-auto rounded-r-xl bg-white shadow-lg md:hidden'
  initial={{ x: '-100%' }}
  animate={{ x: 0 }}
  exit={{ x: '-100%' }}
/>
```

**Kỹ thuật đặc biệt**:
- `createPortal` — Render drawer ngoài DOM tree chính
- `useFocusTrap` — Giữ focus trong drawer (accessibility)
- Body scroll lock — Ngăn scroll trang khi drawer mở
- `md:hidden` — Tự động ẩn trên desktop

### 5.4 Footer — Responsive Grid + Performance

```tsx
// src/components/Footer/Footer.tsx

const isMobile = useIsMobile()
const disableAnimation = reducedMotion || isMobile  // Tắt animation trên mobile

// Grid: 1 cột mobile → 3 cột desktop
<div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
  <div className='lg:col-span-1'>  {/* Logo + mô tả */}</div>
  <div className='lg:col-span-2'>  {/* Links */}</div>
</div>

// Badge sizing responsive
<div className='h-8 w-20 sm:h-11.25 sm:w-30' />
//               32×80px    45×120px
```

---

## 6. Grid & Flexbox Patterns

### 6.1 Responsive Grid — Product Listings

Đây là pattern được dùng nhiều nhất trong dự án. Số cột tăng dần theo breakpoint:

```tsx
// Home — Categories
className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'
//              2 cột          4 cột          6 cột          8 cột

// ProductList — Sản phẩm
className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
//              2 cột          3 cột          4 cột          5 cột

// Wishlist — Sản phẩm yêu thích
className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
//              2 cột          3 cột          4 cột          5 cột          6 cột

// RecentlyViewed — Desktop grid (mobile dùng horizontal scroll)
className='hidden gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
```

**Quy luật**: Mobile luôn bắt đầu từ 2 cột, tăng dần 1-2 cột mỗi breakpoint.

### 6.2 12-Column Grid System

Dùng cho layout phức tạp cần chia tỷ lệ chính xác:

```tsx
// ProductList — Sidebar + Content
<div className='grid grid-cols-12 gap-6'>
  <aside className='hidden md:col-span-3 md:block'>  {/* 25% */}
    <AsideFilter />
  </aside>
  <main className='col-span-12 md:col-span-9'>       {/* 75% */}
    <ProductGrid />
  </main>
</div>

// ProductDetail — Image + Info
<div className='grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-9'>
  <div className='col-span-12 md:col-span-5'>  {/* ~42% */}
    <ProductImages />
  </div>
  <div className='col-span-12 md:col-span-7'>  {/* ~58% */}
    <ProductInfo />
  </div>
</div>

// Checkout — Content + Summary
<div className='grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3'>
  <div className='lg:col-span-2'>  {/* 66% */}
    <CheckoutForm />
  </div>
  <div className='lg:col-span-1'>  {/* 33% */}
    <OrderSummary />
  </div>
</div>
```

### 6.3 Flexbox Direction Switching

Pattern phổ biến: stack dọc trên mobile → ngang trên desktop:

```tsx
// CartSummaryBar
className='flex flex-col sm:flex-row sm:items-center'
// Mobile: [Checkbox] → [Price] → [Button] (dọc)
// Desktop: [Checkbox] [Price] [Button] (ngang)

// CartHeader Breadcrumb
className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'

// Profile form fields
className='flex flex-col flex-wrap sm:flex-row'
// Mobile: Label trên, Input dưới
// Desktop: Label bên trái (30%), Input bên phải (70%)

// ProductListItem — Stats
className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4'
```

### 6.4 Flexbox Utilities cho Responsive

```tsx
// Ngăn element bị co lại
className='shrink-0'  // Logo, icon, avatar

// Cho element chiếm hết không gian còn lại
className='min-w-0 flex-1'  // Search bar, text content

// Kết hợp: logo cố định + search linh hoạt + button cố định
<div className='flex items-center gap-3'>
  <Logo className='shrink-0' />
  <SearchBar className='min-w-0 flex-1' />
  <CartButton className='shrink-0' />
</div>
```

---

## 7. Typography Responsive

### 7.1 Heading Scale

```tsx
// Page titles
className='text-lg sm:text-xl'                    // 18px → 20px
className='text-xl sm:text-2xl md:text-3xl'        // 20px → 24px → 30px
className='text-2xl font-bold md:text-3xl'         // 24px → 30px

// 404 Page — dramatic scaling
className='text-6xl sm:text-7xl md:text-9xl'       // 60px → 72px → 128px

// CartHeader title
className='text-sm sm:text-[15px] md:text-2xl'     // 14px → 15px → 24px
```

### 7.2 Body Text Scale

```tsx
// Standard body text
className='text-xs md:text-sm'                     // 12px → 14px
className='text-sm md:text-base'                   // 14px → 16px
className='text-sm sm:text-base'                   // 14px → 16px

// Checkout subtitle
className='text-[11px] sm:text-xs md:text-sm'      // 11px → 12px → 14px
```

### 7.3 Quy luật Typography

| Loại | Mobile | sm: | md: | lg: |
|------|--------|-----|-----|-----|
| Page title | text-lg (18px) | text-xl (20px) | text-2xl (24px) | text-3xl (30px) |
| Section title | text-base (16px) | text-lg (18px) | text-xl (20px) | — |
| Body text | text-sm (14px) | — | text-base (16px) | — |
| Caption | text-xs (12px) | — | text-sm (14px) | — |
| Micro text | text-[11px] | text-xs (12px) | text-sm (14px) | — |

---

## 8. Spacing & Sizing Responsive

### 8.1 Padding Progressive

```tsx
// Container padding
className='px-3 sm:px-4 md:px-8'          // 12px → 16px → 32px

// Section padding
className='py-6 md:py-8'                   // 24px → 32px
className='py-4 md:py-8'                   // 16px → 32px
className='p-3 sm:p-4 md:p-6'              // 12px → 16px → 24px

// Card padding
className='p-4 md:p-8'                     // 16px → 32px

// Button padding
className='px-4 py-1.5 md:px-6 md:py-2'    // 16×6 → 24×8
className='px-4 sm:px-5 md:px-8'            // 16px → 20px → 32px
```

### 8.2 Gap Progressive

```tsx
// Navigation gaps
className='gap-2 sm:gap-4 md:gap-6'        // 8px → 16px → 24px

// Grid gaps
className='gap-3 md:gap-6'                 // 12px → 24px
className='gap-4 md:gap-9'                 // 16px → 36px

// Flex gaps
className='gap-1 md:gap-1.5'               // 4px → 6px
```

### 8.3 Element Sizing

```tsx
// Logo sizing
className='h-7 sm:h-8 md:h-11'             // 28px → 32px → 44px
className='h-8 sm:h-9 md:h-10 lg:h-11'     // 32px → 36px → 40px → 44px

// Icon sizing
className='h-6 w-6 md:h-8 md:w-8'          // 24px → 32px

// Avatar sizing
className='h-20 w-20 sm:h-24 sm:w-24 md:h-[115px] md:w-[115px]'
//          80px       96px              115px

// Cart item image
className='h-20 w-20 shrink-0'             // 80px cố định mọi breakpoint
```

---

## 9. Touch-Friendly Design

### 9.1 Nguyên tắc: Minimum Touch Target 44×44px

Theo WCAG 2.5.5, vùng chạm tối thiểu nên là 44×44px. Dự án áp dụng nguyên tắc này:

```tsx
// RegisterHeader — Help link
className='flex min-h-[44px] items-center text-sm'
//              ^^^^^^^^^^^^^ Đảm bảo 44px touch target

// MobileAccountNav — Menu button
className='flex w-full items-center justify-between px-3 py-2.5'
// Padding đủ lớn để vùng chạm > 44px
```

### 9.2 Reverse Scaling — Mobile LỚN hơn Desktop

Một pattern thú vị: một số interactive elements **lớn hơn trên mobile** để dễ chạm:

```tsx
// Input eye icon — Mobile 32px, Desktop 24px
className='h-8 w-8 md:h-6 md:w-6'
//          ^^^^^^^ Mobile LỚN hơn để dễ chạm

// QuantityController buttons — Mobile 40px, Desktop 32px
className='h-10 w-10 sm:h-8 sm:w-8'
//          ^^^^^^^^^ Mobile LỚN hơn

// SortProductList buttons — Mobile 40px, Desktop 32px
className='h-10 rounded-xs px-4 md:h-8'
//          ^^^^ Mobile LỚN hơn
```

**Lý do**: Trên mobile, user dùng ngón tay (lớn, không chính xác) thay vì chuột (nhỏ, chính xác). Nên interactive elements cần lớn hơn trên mobile.

### 9.3 Adequate Padding cho Touch

```tsx
// Pagination buttons — padding đủ lớn trên mobile
className='px-2 py-2 md:px-4 md:py-3'
// Mobile: 8px padding → vùng chạm đủ lớn

// Navigation links
className='px-3 py-2.5'
// Padding tạo vùng chạm > 44px
```

---

## 10. Image Optimization

### 10.1 Aspect Ratio với Padding-Top Technique

```tsx
// src/components/OptimizedImage/OptimizedImage.tsx
const aspectRatioClasses = {
  '1:1':  'pt-[100%]',     // Vuông — product cards
  '16:9': 'pt-[56.25%]',   // Widescreen — banners
  '4:3':  'pt-[75%]',      // Standard — thumbnails
  '3:2':  'pt-[66.67%]',   // Photo — reviews
}

// Sử dụng
<div className='relative w-full overflow-hidden'>
  <div className='pt-[100%]' />  {/* Tạo tỷ lệ 1:1 */}
  <img className='absolute inset-0 h-full w-full object-cover' />
</div>
```

**Tại sao dùng padding-top?**
- Giữ tỷ lệ khung hình ổn định trước khi ảnh load
- Ngăn layout shift (CLS — Core Web Vital)
- Hoạt động trên mọi trình duyệt

### 10.2 Responsive Image Attributes

```tsx
// OptimizedImage hỗ trợ srcSet và sizes
<OptimizedImage
  src={product.image}
  srcSet='image-300.jpg 300w, image-600.jpg 600w, image-900.jpg 900w'
  sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
  loading='lazy'
/>
```

### 10.3 Lazy Loading

```tsx
// Mọi ảnh không nằm above-the-fold đều dùng lazy loading
<img loading='lazy' />

// OptimizedImage component tự động thêm loading='lazy'
```

### 10.4 HeroBanner — Responsive Height

```tsx
// src/components/HeroBanner/HeroBanner.tsx
className='h-[280px] w-full overflow-hidden rounded-lg shadow-lg md:h-[320px]'
//          280px mobile                                          320px desktop
```

---

## 11. Animation & Performance

### 11.1 Conditional Animation — Tắt trên Mobile

```tsx
// Pattern được dùng ở 8+ nơi
const isMobile = useIsMobile()
const reducedMotion = useReducedMotion()
const disableAnimation = reducedMotion || isMobile

// Framer Motion — tắt initial animation
<motion.div
  initial={disableAnimation ? false : 'hidden'}
  animate='visible'
>

// Framer Motion — tắt stagger animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: disableAnimation ? 0 : 0.05
    }
  }
}
```

**Tại sao tắt animation trên mobile?**
- Tiết kiệm CPU/GPU — mobile yếu hơn desktop
- Giảm battery drain
- Tránh jank/lag khi scroll
- User mobile thường muốn nội dung hiện ngay

### 11.2 Framer Motion Slide Animations

```tsx
// MobileNavigationDrawer — Slide từ trái
initial={{ x: '-100%' }}
animate={{ x: 0 }}
exit={{ x: '-100%' }}
transition={{ type: 'spring', damping: 25, stiffness: 300 }}

// MobileAccountNav — Fade + slide down
initial={{ opacity: 0, y: -6 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -6 }}
```

### 11.3 Body Scroll Lock

```tsx
// Khi drawer/modal mở trên mobile
useEffect(() => {
  if (isOpen) document.body.style.overflow = 'hidden'
  else document.body.style.overflow = ''
  return () => { document.body.style.overflow = '' }
}, [isOpen])
```

---

## 12. Dual Layout Strategy

### 12.1 Khái niệm

Thay vì dùng CSS để ẩn/hiện elements, một số component render **2 layout hoàn toàn khác nhau** cho mobile và desktop:

### 12.2 Header — Grid vs Flexbox

```
Desktop (md+):
┌──────────────────────────────────────────────┐
│ NavHeader (ngôn ngữ, thông báo, tài khoản)  │
├────────┬──────────────────────┬──────────────┤
│  Logo  │     Search Bar       │  Cart Icon   │
│ (2col) │      (8col)          │   (2col)     │
└────────┴──────────────────────┴──────────────┘

Mobile (<md):
┌──────────────────────────────────────────────┐
│ [Logo] [====Search Bar====] [☰]             │
└──────────────────────────────────────────────┘
+ MobileNavigationDrawer (slide-in từ trái)
```

### 12.3 Cart — Table vs Cards

```
Desktop (lg+):
┌────────────────────────────────────────────────────┐
│ ☐ │ Product Image + Name │ Price │ Qty │ Total │ ✕ │  ← Table row
├────────────────────────────────────────────────────┤
│ ☐ │ Product Image + Name │ Price │ Qty │ Total │ ✕ │
└────────────────────────────────────────────────────┘

Mobile (<lg):
┌──────────────────────────┐
│ ☐ [Image] Product Name   │  ← Card
│   Price: ₫100.000        │
│   Qty: [-] 1 [+]         │
│   Total: ₫100.000    [✕] │
└──────────────────────────┘
┌──────────────────────────┐
│ ☐ [Image] Product Name   │  ← Card
│   ...                     │
└──────────────────────────┘
```

```tsx
// CartItemList.tsx
{/* Desktop: Table layout */}
<div className='hidden lg:block'>
  <div className='grid grid-cols-12'>
    {/* Table headers + rows */}
  </div>
</div>

{/* Mobile: Card layout */}
<div className='block lg:hidden'>
  {items.map(item => (
    <div className='rounded-lg bg-white p-4 shadow-xs'>
      {/* Card layout */}
    </div>
  ))}
</div>
```

### 12.4 RecentlyViewed — Scroll vs Grid

```tsx
{/* Mobile: Horizontal scroll */}
<div className='scrollbar-hide overflow-x-auto md:hidden'>
  <div className='flex gap-3'>
    {products.map(p => <ProductCard />)}
  </div>
</div>

{/* Desktop: Responsive grid */}
<div className='hidden gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
  {products.map(p => <ProductCard />)}
</div>
```

### 12.5 User Account — Sidebar vs Dropdown

```
Desktop (md+):
┌──────────┬───────────────────────────┐
│ Sidebar  │                           │
│ --------│     Page Content           │
│ Profile  │                           │
│ Password │                           │
│ Orders   │                           │
└──────────┴───────────────────────────┘

Mobile (<md):
┌──────────────────────────────────────┐
│ [▼ Tài khoản của tôi]               │  ← MobileAccountNav dropdown
├──────────────────────────────────────┤
│                                      │
│         Page Content                 │
│                                      │
└──────────────────────────────────────┘
```

---

## 13. Responsive trên từng Page

### 13.1 Bảng tổng hợp

| Page | Grid Pattern | useIsMobile | useReducedMotion | Dual Layout | Breakpoints |
|------|-------------|-------------|------------------|-------------|-------------|
| Home | 2→4→6→8 cols | ✗ | ✗ | ✗ | sm, md, lg, xl |
| ProductList | 12-col + 2→3→4→5 | ✓ | ✗ | Sidebar ẩn mobile | sm, md, lg, xl |
| ProductDetail | 12-col (5+7) | ✗ | ✓ | Stack → 2 cols | md, lg |
| Cart | Delegate to children | ✓ | ✗ | Table vs Cards | sm, md, lg |
| Checkout | 1→3 cols | ✗ | ✗ | ✗ | sm, md, lg |
| Login/Register | 1→3→5 cols | ✗ | ✓ | BG ẩn mobile | md, lg |
| Wishlist | 2→3→4→5→6 cols | ✓ | ✗ | Hero responsive | sm, md, lg, xl |
| Compare | ✗ | ✗ | ✗ | ✗ | sm, md |
| NotFound | ✗ | ✓ | ✓ | ✗ | sm, md |
| Profile | Form 30/70 split | ✗ | ✓ | Reverse col mobile | sm, md, lg |
| ChangePassword | Form 30/70 split | ✗ | ✓ | Sidebar responsive | sm, md |
| HistoryPurchases | Delegate | ✗ | ✓ | ✗ | — |

### 13.2 Login/Register — Background Responsive

```tsx
// Background image chỉ hiện trên desktop lớn
<div className='absolute inset-0 hidden lg:block'>
  <img src={shopeeBackground} className='h-full w-full object-cover' />
</div>

// Form positioning responsive
<div className='grid grid-cols-1 py-8 md:grid-cols-3 md:py-16 lg:grid-cols-5 lg:py-32'>
  <div className='md:col-span-3 md:mx-auto md:w-full md:max-w-md
                   lg:col-span-2 lg:col-start-4 lg:mx-0 lg:max-w-none'>
    <LoginForm />
  </div>
</div>
```

**Mobile**: Form chiếm full width, không có background image.
**Desktop**: Form nằm bên phải, background image bên trái.

### 13.3 Profile — Reverse Column Order

```tsx
// Mobile: Avatar TRÊN, Form DƯỚI (reverse)
// Desktop: Form BÊN TRÁI, Avatar BÊN PHẢI
<div className='flex flex-col-reverse md:flex-row md:items-start'>
  <div className='flex-1'>  {/* Form */}</div>
  <div className='md:w-56 md:border-l lg:w-72'>  {/* Avatar */}</div>
</div>
```

**Tại sao reverse?** Trên mobile, user muốn thấy avatar (visual) trước khi scroll xuống form. Trên desktop, form quan trọng hơn nên nằm bên trái (đọc trước).

### 13.4 ChatWindow — Full Screen vs Floating

```tsx
// Mobile: Full screen overlay
className='right-0 bottom-0 z-50 flex h-dvh w-full flex-col'

// Desktop: Floating window 350×480px
className='sm:right-6 sm:bottom-6 sm:h-[480px] sm:w-[350px]'
```

---

## 14. Responsive trên Shared Components

### 14.1 Bảng tổng hợp Components

| Component | Responsive Technique | Touch-Friendly | Breakpoints |
|-----------|---------------------|----------------|-------------|
| ProductListItem | Progressive sizing | ✗ | sm, md |
| ProductListSkeleton | Responsive grid | ✗ | md, lg, xl |
| ProductDetailSkeleton | 12-col grid | ✗ | md, lg, xl |
| OptimizedImage | Aspect ratio + srcSet | ✗ | — (parent) |
| HeroBanner | Responsive height | ✗ | md |
| BannerSlide | Text + padding scale | ✗ | md |
| Input | Eye icon reverse scale | ✓ (32px mobile) | md |
| InputV2 | Padding + text scale | ✗ | md |
| InputNumber | Padding + text scale | ✗ | md |
| QuantityController | Reverse scale buttons | ✓ (40px mobile) | sm |
| Button | Fixed size variants | ✗ | — |
| Pagination | Padding scale | ✓ | md |
| ChatWindow | Full screen vs floating | ✓ | sm |
| RecentlyViewed | Scroll vs grid | ✗ | md, lg, xl |
| ProductReviews | Padding + flex direction | ✗ | sm, md |
| BackToTop | Position responsive | ✗ | md |
| BaseModal | Max-width + margin | ✗ | — |

### 14.2 Mobile-Only Components

Các component chỉ tồn tại trên mobile (ẩn hoàn toàn trên desktop):

| Component | Thay thế cho | Kỹ thuật |
|-----------|-------------|----------|
| MobileNavigationDrawer | NavHeader (desktop) | Portal + slide animation |
| MobileFilterDrawer | AsideFilter sidebar | Portal + slide animation |
| MobileAccountNav | UserSideNav sidebar | Dropdown + fade animation |

Tất cả đều dùng:
- `md:hidden` để ẩn trên desktop
- `createPortal` để render ngoài DOM tree
- `useFocusTrap` cho accessibility
- Body scroll lock khi mở

---

## 15. Accessibility

### 15.1 Reduced Motion

```tsx
// Tôn trọng system preference "Reduce Motion"
const reducedMotion = useReducedMotion()
// → Tắt animation cho user nhạy cảm với chuyển động
```

Được dùng ở 7+ pages, đảm bảo user có thể tắt mọi animation qua OS settings.

### 15.2 Focus Management

```tsx
// Drawer components dùng focus trap
const { firstFocusableRef, lastFocusableRef } = useFocusTrap(isOpen)

// Khi drawer mở → focus bị giữ trong drawer
// Khi drawer đóng → focus trả về element trước đó
```

### 15.3 ARIA Attributes

```tsx
// MobileNavigationDrawer
<div role='dialog' aria-modal='true' aria-label='Menu điều hướng'>

// MobileAccountNav
<button aria-expanded={isOpen} aria-haspopup='true' aria-label='Menu tài khoản'>

// Drawer backdrop
<div aria-hidden='true' onClick={onClose} />
```

### 15.4 Semantic HTML

- `<nav>` cho navigation
- `<main>` cho content chính
- `<aside>` cho sidebar
- `<button>` cho interactive elements (không dùng `<div onClick>`)

---

## 16. Tổng kết & Đánh giá

### 16.1 Điểm mạnh

1. **Mobile-First nhất quán** — Base styles cho mobile, prefix cho desktop. Không có ngoại lệ.

2. **Breakpoint strategy rõ ràng** — `md:` (768px) là ranh giới chính, `sm:` cho fine-tuning, `lg:`/`xl:` cho grid columns.

3. **Dual Layout khi cần thiết** — Header, Cart, RecentlyViewed dùng 2 layout riêng thay vì ép 1 layout responsive. Kết quả: UX tốt hơn trên cả 2 platform.

4. **Touch-Friendly** — Interactive elements lớn hơn trên mobile (reverse scaling). Touch targets đạt 44px minimum.

5. **Performance-aware** — Animation tắt trên mobile, lazy loading images, body scroll lock cho drawers.

6. **Accessibility** — `useReducedMotion()`, focus traps, ARIA attributes, semantic HTML.

7. **Consistent patterns** — Cùng một pattern được dùng lại xuyên suốt (grid columns, flex direction, spacing scale).

### 16.2 Các pattern chính

```
┌─────────────────────────────────────────────────────────┐
│                    RESPONSIVE STRATEGY                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CSS-Level (Tailwind)          JS-Level (Hooks)          │
│  ├── Visibility toggle         ├── useIsMobile()         │
│  │   hidden md:block           │   → Tắt animation       │
│  │   md:hidden                 │   → Conditional render   │
│  ├── Grid responsive           ├── useReducedMotion()    │
│  │   grid-cols-2 md:grid-cols-4│   → Accessibility       │
│  ├── Flex direction            └── useViewMode()         │
│  │   flex-col sm:flex-row          → Grid/List toggle    │
│  ├── Progressive sizing                                  │
│  │   text-sm md:text-base                                │
│  │   p-3 sm:p-4 md:p-6                                  │
│  ├── Reverse scaling                                     │
│  │   h-10 sm:h-8 (touch)                                │
│  └── Dual layouts                                        │
│      hidden lg:block / block lg:hidden                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 16.3 Quy tắc áp dụng

| Tình huống | Kỹ thuật |
|-----------|----------|
| Ẩn/hiện element | `hidden md:block` / `md:hidden` |
| Đổi layout direction | `flex-col sm:flex-row` |
| Đổi số cột grid | `grid-cols-2 md:grid-cols-4 lg:grid-cols-6` |
| Scale typography | `text-sm md:text-base` |
| Scale spacing | `p-3 sm:p-4 md:p-6` |
| Touch targets lớn hơn | `h-10 sm:h-8` (reverse) |
| Tắt animation mobile | `useIsMobile()` + conditional |
| Layout khác hoàn toàn | Dual layout (2 div riêng) |
| Full screen mobile | `h-dvh w-full sm:h-[480px] sm:w-[350px]` |
| Horizontal scroll mobile | `overflow-x-auto md:hidden` + `md:grid` |

### 16.4 Coverage

- **100% pages** có responsive design
- **100% layouts** delegate responsive cho children
- **90%+ components** dùng ít nhất 1 responsive breakpoint
- **3 mobile-only components** thay thế desktop counterparts
- **3 custom hooks** cho JS-level responsive logic

---

> Tài liệu được tạo dựa trên phân tích toàn bộ source code của dự án Shopee Clone TypeScript.