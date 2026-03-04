# Import Patterns - Detailed File Reference

## FRAMER MOTION IMPORTS

### Files Using Framer Motion:
1. **src/components/PageTransition/PageTransition.tsx** (Line 1)
   - `import { motion } from 'framer-motion'`
   - Usage: Page transition animations with variants

2. **src/components/Input/Input.tsx** (Line 4)
   - `import { motion, AnimatePresence } from 'framer-motion'`
   - Usage: Error message slide-in animation

3. **src/components/Footer/Footer.tsx** (Line 1)
   - `import { motion } from 'framer-motion'`
   - Usage: Section entrance animations

4. **src/pages/NotFound/NotFound.tsx** (Line 1)
   - `import { motion } from 'framer-motion'`
   - Usage: Floating and stagger animations

5. **src/pages/Cart/components/CartSummaryBar.tsx** (Line 1)
   - `import { motion } from 'framer-motion'`
   - Usage: Hover/tap animations on buttons

6. **src/components/PWAInstallPrompt/PWAInstallPrompt.tsx** (Line 2)
   - `import { motion, AnimatePresence } from 'framer-motion'`
   - Usage: Prompt entrance/exit animations

7. **src/styles/animations/variants.ts** (Line 1)
   - `import { Variants } from 'framer-motion'`
   - Usage: Centralized animation variants

8. **src/hooks/useAnimationConfig.ts** (Line 1)
   - `import { Variants } from 'framer-motion'`
   - Usage: Animation config type definitions

---

## LODASH IMPORTS

### Files Using Lodash (Tree-Shaken):
1. **src/utils/utils.ts** (Lines 4-7)
   ```typescript
   import deburr from 'lodash/deburr'
   import escape from 'lodash/escape'
   import kebabCase from 'lodash/kebabCase'
   import trim from 'lodash/trim'
   ```
   - Usage: String manipulation for product name IDs

2. **src/pages/Cart/Cart.tsx** (Line 11)
   ```typescript
   import keyBy from 'lodash/keyBy'
   ```
   - Usage: Convert array to object by key

3. **src/pages/Register/Register.tsx** (Line 6)
   ```typescript
   import omit from 'lodash/omit'
   ```
   - Usage: Remove fields from form data

---

## DATE-FNS IMPORTS

### Files Using Date-fns (Tree-Shaken):
1. **src/utils/utils.ts** (Lines 2-3)
   ```typescript
   import { differenceInDays, format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
   import { vi } from 'date-fns/locale'
   ```
   - Usage: Date formatting and comparison with Vietnamese locale

---

## AXIOS IMPORTS

### Files Using Axios:
1. **src/utils/utils.ts** (Line 1)
   ```typescript
   import axios, { AxiosError } from 'axios'
   ```
   - Usage: Type guard for axios errors

2. **src/utils/http.ts** (Line 2)
   ```typescript
   import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
   ```
   - Usage: Custom HTTP client with interceptors

---

## REACT QUERY IMPORTS

### Files Using React Query:
1. **src/pages/ProductList/ProductList.tsx** (Line 1)
   ```typescript
   import { useQuery } from '@tanstack/react-query'
   ```

2. **src/main.tsx** (Lines 17-20)
   ```typescript
   const ReactQueryDevtools = lazy(() =>
     import('@tanstack/react-query-devtools').then((mod) => ({
       default: mod.ReactQueryDevtools
     }))
   )
   ```
   - Lazy loaded for development only

---

## I18NEXT IMPORTS

### Files Using i18next:
1. **src/i18n/i18n.ts** (Lines 43-60)
   - Lazy loads English translations on demand
   - Vietnamese loaded statically

---

## DOMPURIFY IMPORTS

### Bundle Location:
- Included in `misc-vendor` chunk
- No direct imports found in analysis (likely used internally)

---

## REACT HELMET ASYNC IMPORTS

### Bundle Location:
- Included in `misc-vendor` chunk
- Used for SEO meta tags

---

## STATIC ASSET IMPORTS

### Direct Image Imports:
1. **src/utils/utils.ts** (Line 9)
   ```typescript
   import userImage from 'src/assets/images/user.svg'
   ```

2. **src/pages/Cart/Cart.tsx** (Line 13)
   ```typescript
   import noproduct from '../../assets/images/img-product-incart.png'
   ```

### Fallback Images (Data URIs):
- **src/utils/imageUtils.ts** (Lines 6-14)
  - Base64 encoded SVG placeholders for product, avatar, banner

---

## BARREL EXPORTS LOCATIONS

### Component Barrel Exports:
- `src/components/ErrorBoundary/index.ts` - 6 exports
- `src/components/HeroBanner/index.ts` - 3 exports + types
- `src/components/Skeleton/index.ts` - 7 exports
- `src/components/Header/components/index.ts` - 3 exports
- `src/components/Chat/index.ts` - 6 exports
- `src/components/OptimizedImage/index.ts` - 2 exports + types
- `src/components/PaymentForm/index.ts` - 4 exports + 2 types
- `src/components/FlashSale/index.ts` - 2 exports + types
- `src/components/InputNumber/index.ts` - Default + named exports
- `src/components/Header/NotificationDropdown/index.ts` - 3 exports
- `src/components/Header/SearchSuggestions/index.ts` - 3 exports
- `src/pages/ProductDetail/components/index.ts` - 4 exports
- `src/pages/User/pages/HistoryPurchases/components/index.ts` - 2 exports

---

## LAZY LOADING ROUTES

**File:** `src/useRouteElements.tsx` (Lines 7-30)

All routes use `lazy(() => import(...))` pattern:
- MainLayout, RegisterLayout, CartLayout, UserLayout
- Login, Register, Home, ProductList, ProductDetail
- Cart, Checkout, Wishlist, Compare
- Profile, ChangePassword, HistoryPurchases, NotFound

---

## VITE CONFIG CHUNKS

**File:** `vite.config.ts` (Lines 58-72)

12 manual chunks defined for optimal caching and parallel loading.

