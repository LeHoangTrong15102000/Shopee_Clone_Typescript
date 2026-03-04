# Shopee Clone - Animation & Performance Analysis Report

**Date**: 2026-02-23  
**Project**: React 19 + TypeScript Shopee Clone  
**Analysis Scope**: All animations, heavy components, and rendering patterns

---

## 1. FRAMER-MOTION USAGE - ALL FILES

### Files Using Framer-Motion (15 files):
1. **src/pages/ProductList/ProductList.tsx** - Grid/List view toggle with stagger
2. **src/pages/ProductList/ProductListInfinite.tsx** - Infinite scroll with item animations
3. **src/pages/ProductList/components/Product/Product.tsx** - Product card hover animations
4. **src/components/ProductListItem/ProductListItem.tsx** - List item hover animations
5. **src/pages/ProductDetail/components/ProductImages.tsx** - Image gallery crossfade
6. **src/components/Input/Input.tsx** - Error message slide-in
7. **src/components/Popover/Popover.tsx** - Scale in/out animations
8. **src/components/Button/Button.tsx** - Hover/tap scale animations
9. **src/components/BaseModal/BaseModal.tsx** - Modal entrance/exit
10. **src/components/PageTransition/PageTransition.tsx** - Page route transitions
11. **src/components/DailyCheckIn/DailyCheckIn.tsx** - Calendar expand/collapse
12. **src/components/PasswordStrengthMeter/PasswordStrengthMeter.tsx** - Progress bar animation
13. **src/components/ChatbotWidget/ChatbotWidget.tsx** - Widget entrance/exit
14. **src/components/SearchHistory/SearchHistory.tsx** - History item animations
15. **src/pages/User/pages/OrderList/OrderList.tsx** - Order card animations

---

## 2. CSS ANIMATIONS (@keyframes)

### Defined in src/index.css:
- **bell-shake** - Notification bell rotation (1s infinite)
- **message-shake** - Message icon rotation + scale (1s infinite)
- **fade-in-up** - Opacity + translateY (0.3s ease-out)
- **scale-in** - Opacity + scale (0.2s ease-out)
- **status-pulse** - Box-shadow pulse (orange, infinite)
- **status-pulse-blue** - Box-shadow pulse (blue, infinite)

### Defined in tailwind.config.cjs:
- **loader** - 0.6s infinite alternate
- **slide-top** - 0.3s cubic-bezier
- **slide-top-sm** - 0.1s linear
- **slide-right** - 0.3s cubic-bezier
- **bell-shake** - 1s ease-in-out infinite
- **fade-in** - 0.3s ease-out
- **fade-in-up** - 0.3s ease-out
- **scale-in** - 0.2s ease-out

### Inline Transitions (Tailwind):
- **transition-transform duration-200** - Hover effects on product cards
- **transition-shadow** - Shadow on hover
- **transition-all duration-300** - Banner slide transitions
- **transition-colors** - Button/link color changes

---

## 3. HOMEPAGE INITIAL LOAD COMPONENTS

### Renders on Page Load:
1. **Header** - Navigation bar (queries cart items)
2. **HeroBanner** - Auto-rotating carousel (5s interval)
3. **ProductList** - Grid of 20-60 products with animations
4. **AsideFilter** - Category sidebar
5. **Pagination** - Page navigation
6. **Footer** - Static footer

### Data Fetching on Mount:
- `useQuery(['products', filters])` - Product list (3min cache)
- `useQuery(['categories'])` - Categories (15min cache)
- `useQuery(['purchases', {status}])` - Cart items (if authenticated)

---

## 4. HEAVY RENDERING PATTERNS IDENTIFIED

### ⚠️ CRITICAL ISSUES:

**A. ProductList Grid Animation**
- **File**: src/pages/ProductList/ProductList.tsx (lines 238-274)
- **Issue**: AnimatePresence + staggerChildren on 20-60 products
- **Stagger**: 0.03s per item = 600-1800ms total animation time
- **Impact**: Blocks main thread during view mode toggle
- **Severity**: HIGH

**B. Product Card Hover Animations**
- **File**: src/pages/ProductList/components/Product/Product.tsx (lines 48-86)
- **Issue**: Multiple nested motion.div with whileHover on each card
- **Animations**: 
  - Card: y: -5px (0.2s)
  - Image: scale 1.02 (0.3s)
- **Impact**: 20-60 simultaneous hover listeners
- **Severity**: MEDIUM

**C. ProductImages Gallery**
- **File**: src/pages/ProductDetail/components/ProductImages.tsx (lines 93-155)
- **Issue**: AnimatePresence + staggerContainer on image thumbnails
- **Stagger**: STAGGER_DELAY.fast (0.03s) on 5 images
- **Impact**: Smooth but unnecessary on detail page
- **Severity**: LOW

**D. HeroBanner Carousel**
- **File**: src/components/HeroBanner/HeroBanner.tsx (lines 84-90)
- **Issue**: CSS transform translateX on 3-5 slides every 5s
- **Animation**: transition-transform duration-500
- **Impact**: Minimal - only 3 slides, no JS animation
- **Severity**: LOW

---

## 5. IMAGE LOADING STRATEGY

### ✅ GOOD: OptimizedImage Component
- **Lazy loading**: loading='lazy' on all product images
- **Blur placeholder**: blurPlaceholder={true}
- **Skeleton loading**: showSkeleton={true}
- **Aspect ratio**: Prevents layout shift

### ⚠️ ISSUE: No Virtualization
- ProductList renders ALL 20-60 products in DOM
- No react-window or react-virtual-scroll
- Infinite scroll available but disabled (USE_INFINITE_SCROLL = false)

---

## 6. SKELETON/LOADING STATES

### ✅ IMPLEMENTED:
- ProductSkeleton - Product card placeholder
- ProductListSkeleton - Full grid skeleton
- ProductDetailSkeleton - Detail page skeleton
- CartItemSkeleton - Cart item placeholder
- NotificationSkeleton - Notification placeholder
- AsideFilterSkeleton - Filter sidebar skeleton

### Usage:
- Shown during initial load (isLoading)
- Shown during infinite scroll (isFetchingNextPage)
- Smooth fade-in animations

---

## 7. ANIMATION CONFIGURATION

### Centralized in src/styles/animations/:

**motion.config.ts**:
- ANIMATION_DURATION: instant(0), fast(0.15), normal(0.3), slow(0.5), slower(0.8)
- ANIMATION_EASING: easeOut, easeIn, easeInOut
- ANIMATION_SPRING: default, bouncy, gentle
- STAGGER_DELAY: fast(0.03), normal(0.05), slow(0.1)

**variants.ts** (20+ reusable variants):
- fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight
- scaleIn, slideUp, slideDown, slideLeft, slideRight
- staggerContainer, staggerItem
- pageTransition, pageTransitionReduced
- buttonHover, cartItemExit, badgeBounce
- errorSlideIn, imageCrossfade, sectionEntrance

### Accessibility:
- **useReducedMotion()** hook respects prefers-reduced-motion
- All animations disabled for users with motion preferences
- Fallback to instant transitions (0.1s)

---

## 8. PERFORMANCE METRICS

### Bundle Size Impact:
- **framer-motion**: ~114.81kB (bundled with ui-vendor chunk)
- **Chunk**: ui-vendor includes @heroui/react, @floating-ui, framer-motion

### Animation Performance:
- **GPU Accelerated**: transform, opacity only
- **No Layout Thrashing**: Uses CSS transforms
- **Reduced Motion**: Fully supported

---

## 9. KEY FINDINGS SUMMARY

| Category | Status | Details |
|----------|--------|---------|
| Framer-Motion Usage | ✅ GOOD | 15 files, centralized config, accessibility support |
| CSS Animations | ✅ GOOD | 6 @keyframes, mostly for UI feedback |
| Product Grid | ⚠️ MEDIUM | Stagger animation on 20-60 items, no virtualization |
| Image Loading | ✅ GOOD | Lazy loading, blur placeholders, skeletons |
| Hover Effects | ⚠️ MEDIUM | Multiple nested animations per card |
| Page Transitions | ✅ GOOD | Smooth, respects reduced motion |
| Bundle Size | ✅ GOOD | Separate chunk, ~114kB |

---

## 10. RECOMMENDATIONS

1. **Disable stagger on ProductList** - Use instant animation or reduce stagger to 0.01s
2. **Implement virtualization** - Use react-window for 100+ products
3. **Debounce hover prefetch** - Reduce API calls on hover
4. **Lazy load animations** - Disable animations on low-end devices
5. **Monitor Core Web Vitals** - Track LCP, FID, CLS with animations


