# Complete Inline Button Elements Inventory

## Executive Summary
- **Total Files**: 9 files with inline buttons
- **Total Inline Buttons**: 11 button elements
- **Files Using Button Component**: 2 (CartSummaryBar, Checkout)
- **Storybook/Demo**: 1 (stories/Button.tsx)

---

## Detailed File-by-File Breakdown

### 1. src/components/DailyCheckIn/DailyCheckIn.tsx
**4 inline buttons found**

#### Button 1 (Line 134)
- **Element**: `<motion.button>`
- **Purpose**: Daily check-in action button
- **className**: `'w-full py-3 rounded-lg font-bold text-lg transition-all bg-linear-to-r from-orange to-[#ff6633] text-white hover:shadow-lg cursor-pointer'`
- **Visual Type**: PRIMARY (gradient orange background)
- **State**: Dynamic (shows loading spinner or reward text)
- **Accessibility**: Has onClick handler, disabled state

#### Button 2 (Line 219)
- **Element**: `<button>`
- **Purpose**: Toggle calendar visibility
- **className**: `'w-full mt-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-orange dark:hover:text-orange-400 transition-colors flex items-center justify-center gap-1 cursor-pointer'`
- **Visual Type**: GHOST/TEXT (transparent, text-only)
- **State**: Toggles calendar open/closed
- **Icon**: Chevron down (rotates on toggle)

#### Button 3 (Line 243)
- **Element**: `<button>`
- **Purpose**: Navigate to previous month
- **className**: `'p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-sm cursor-pointer'`
- **Visual Type**: ICON-ONLY (navigation)
- **aria-label**: 'Tháng trước' (Previous month)

#### Button 4 (Line 251)
- **Element**: `<button>`
- **Purpose**: Navigate to next month
- **className**: `'p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-sm cursor-pointer'`
- **Visual Type**: ICON-ONLY (navigation)
- **aria-label**: 'Tháng sau' (Next month)

---

### 2. src/components/WishlistButton/WishlistButton.tsx
**1 inline button found**

#### Button (Line 54)
- **Element**: `<button>`
- **Purpose**: Add/remove product from wishlist
- **className**: `'flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-orange focus:ring-offset-2'`
- **Visual Type**: ICON-ONLY (circular, white/gray background)
- **State**: Conditional (filled/unfilled heart icon)
- **Accessibility**: aria-label, aria-pressed, aria-busy, tabIndex=0
- **Size variants**: sm (w-8 h-8), md (w-10 h-10), lg (w-12 h-12)

---

### 3. src/components/CompareButton/CompareButton.tsx
**1 inline button found**

#### Button (Line 57)
- **Element**: `<button>`
- **Purpose**: Add/remove product from comparison list
- **className**: `'flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-orange focus:ring-offset-2 dark:focus:ring-offset-slate-900'`
- **Visual Type**: ICON-ONLY (circular, white/gray background)
- **State**: Conditional (filled/unfilled compare icon)
- **Accessibility**: aria-label, aria-pressed, tabIndex=0
- **Size variants**: sm (w-8 h-8), md (w-10 h-10), lg (w-12 h-12)

---

### 4. src/components/SellerFollowButton/SellerFollowButton.tsx
**1 inline button found**

#### Button (Line 67)
- **Element**: `<motion.button>`
- **Purpose**: Follow/unfollow seller
- **className**: `'inline-flex items-center justify-center gap-1.5 rounded-xs font-medium transition-colors'` + dynamic variant
- **Visual Type**: DYNAMIC (3 variants: default, outline, text)
- **Variants**:
  - **default**: Orange when unfollowed, gray when followed
  - **outline**: Border-based styling
  - **text**: Text-only styling
- **Size variants**: sm, md, lg
- **Animation**: whileTap={{ scale: 0.95 }}
- **Icon**: Plus (unfollowed) or checkmark (followed)

---

### 5. src/pages/ProductDetail/components/ProductActions.tsx
**2 inline buttons found**

#### Button 1 (Line 118)
- **Element**: `<motion.button>`
- **Purpose**: Add product to cart
- **className**: `'flex h-12 items-center justify-center rounded-xs border border-orange bg-orange/10 px-5 capitalize shadow-xs hover:bg-orange/5'`
- **Visual Type**: SECONDARY (orange border, light orange background)
- **Animation**: whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }}
- **Icon**: Cart icon
- **Responsive**: Shows full text on desktop, abbreviated on mobile

#### Button 2 (Line 129)
- **Element**: `<motion.button>`
- **Purpose**: Buy product immediately (checkout)
- **className**: `'ml-4 flex h-12 min-w-20 items-center justify-center rounded-xs bg-orange px-4 capitalize text-white shadow-xs outline-hidden hover:bg-orange/90'`
- **Visual Type**: PRIMARY (solid orange background)
- **Animation**: whileHover={{ scale: 1.03 }}, whileTap={{ scale: 0.97 }}
- **Text**: 'Mua ngay' (Buy now)

---

### 6. src/pages/ProductDetail/components/ProductInfo.tsx
**1 inline button found**

#### Button (Line 79)
- **Element**: `<button>`
- **Purpose**: Report/flag product as inappropriate
- **className**: `'text-sm text-black/60 dark:text-gray-400 hover:text-orange dark:hover:text-orange-400 transition-colors'`
- **Visual Type**: GHOST/TEXT (transparent, text-only)
- **Text**: 'Tố cáo' (Report)
- **Accessibility**: No aria labels

---

### 7. src/stories/Button.tsx
**1 inline button found (DEMO/STORYBOOK)**

#### Button (Line 38)
- **Element**: `<button>`
- **Purpose**: Storybook demo component
- **className**: `'storybook-button storybook-button--${size} ${mode}'`
- **Visual Type**: DEMO (not production)
- **Note**: This is a Storybook story, not actual production code

---

## Summary Table

| File | Line | Type | Visual | Purpose |
|------|------|------|--------|---------|
| DailyCheckIn | 134 | motion.button | Primary | Check-in action |
| DailyCheckIn | 219 | button | Ghost | Toggle calendar |
| DailyCheckIn | 243 | button | Icon-only | Prev month |
| DailyCheckIn | 251 | button | Icon-only | Next month |
| WishlistButton | 54 | button | Icon-only | Wishlist toggle |
| CompareButton | 57 | button | Icon-only | Compare toggle |
| SellerFollowButton | 67 | motion.button | Dynamic | Follow/unfollow |
| ProductActions | 118 | motion.button | Secondary | Add to cart |
| ProductActions | 129 | motion.button | Primary | Buy now |
| ProductInfo | 79 | button | Ghost | Report product |
| stories/Button | 38 | button | Demo | Storybook demo |

---

## Visual Type Distribution

- **Primary (Orange)**: 3 buttons
- **Secondary (Orange border)**: 1 button
- **Ghost/Text**: 3 buttons
- **Icon-only**: 3 buttons
- **Dynamic/Variant**: 1 button
- **Demo**: 1 button

---

## Styling Patterns

### Common Classes
- `rounded-xs`, `rounded-lg`, `rounded-full`
- `transition-all`, `transition-colors`
- `hover:bg-orange/90`, `hover:text-orange`
- `focus:ring-2 focus:ring-orange`
- `dark:bg-slate-800/80`, `dark:text-gray-300`

### Size Patterns
- Icon buttons: `w-8 h-8`, `w-10 h-10`, `w-12 h-12`
- Action buttons: `h-12`, `px-4 py-2`, `px-5 py-3`

### Animation
- Framer Motion: `whileHover`, `whileTap`, `scale`
- CSS: `transition-all duration-200`

---

## Complete Inventory

### 1. **src/components/DailyCheckIn/DailyCheckIn.tsx**
- **Line 134**: `<motion.button>` - Check-in button
  - **className**: `'w-full py-3 rounded-lg font-bold text-lg transition-all bg-linear-to-r from-orange to-[#ff6633] text-white hover:shadow-lg cursor-pointer'`
  - **Type**: Primary (gradient orange)

- **Line 219**: `<button>` - Toggle calendar button
  - **className**: `'w-full mt-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-orange dark:hover:text-orange-400 transition-colors flex items-center justify-center gap-1 cursor-pointer'`
  - **Type**: Ghost/Text (transparent)

- **Line 243**: `<button>` - Previous month navigation
  - **className**: `'p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-sm cursor-pointer'`
  - **Type**: Icon-only (navigation)

- **Line 251**: `<button>` - Next month navigation
  - **className**: `'p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-sm cursor-pointer'`
  - **Type**: Icon-only (navigation)

### 2. **src/components/WishlistButton/WishlistButton.tsx**
- **Line 54**: `<button>` - Wishlist toggle button
  - **className**: `'flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-orange focus:ring-offset-2'`
  - **Type**: Icon-only (circular, white/gray bg)

### 3. **src/components/CompareButton/CompareButton.tsx**
- **Line 57**: `<button>` - Compare toggle button
  - **className**: `'flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-orange focus:ring-offset-2 dark:focus:ring-offset-slate-900'`
  - **Type**: Icon-only (circular, white/gray bg)

### 4. **src/components/SellerFollowButton/SellerFollowButton.tsx**
- **Line 67**: `<motion.button>` - Follow/Unfollow seller
  - **className**: `'inline-flex items-center justify-center gap-1.5 rounded-xs font-medium transition-colors'` + dynamic variant classes
  - **Type**: Primary/Secondary/Text (dynamic based on state)

### 5. **src/pages/ProductDetail/components/ProductActions.tsx**
- **Line 118**: `<motion.button>` - Add to cart button
  - **className**: `'flex h-12 items-center justify-center rounded-xs border border-orange bg-orange/10 px-5 capitalize shadow-xs hover:bg-orange/5'`
  - **Type**: Secondary (orange border, light bg)

- **Line 129**: `<motion.button>` - Buy now button
  - **className**: `'ml-4 flex h-12 min-w-20 items-center justify-center rounded-xs bg-orange px-4 capitalize text-white shadow-xs outline-hidden hover:bg-orange/90'`
  - **Type**: Primary (solid orange)

### 6. **src/pages/ProductDetail/components/ProductInfo.tsx**
- **Line 79**: `<button>` - Report product button
  - **className**: `'text-sm text-black/60 dark:text-gray-400 hover:text-orange dark:hover:text-orange-400 transition-colors'`
  - **Type**: Ghost/Text (transparent, text-only)

### 7. **src/pages/Cart/components/CartSummaryBar.tsx**
- Uses Button component (NOT inline) - SKIP

### 8. **src/stories/Button.tsx**
- **Line 38**: `<button>` - Storybook demo button
  - **className**: `'storybook-button storybook-button--${size} ${mode}'`
  - **Type**: Demo/Storybook (not production)

### 9. **src/pages/Checkout/Checkout.tsx**
- Uses Button component (NOT inline) - SKIP

---

## Button Type Categories

| Type | Count | Examples |
|------|-------|----------|
| **Primary (Orange)** | 3 | DailyCheckIn check-in, ProductActions buy now, ProductActions add to cart |
| **Secondary (Orange border)** | 1 | ProductActions add to cart |
| **Ghost/Text** | 3 | DailyCheckIn toggle, ProductInfo report, Calendar nav |
| **Icon-only** | 3 | WishlistButton, CompareButton, DailyCheckIn nav |
| **Dynamic/Variant** | 1 | SellerFollowButton |
| **Demo/Storybook** | 1 | stories/Button.tsx |

---

## Styling Patterns Observed

1. **Rounded corners**: `rounded-xs`, `rounded-lg`, `rounded-full`
2. **Padding**: `px-3 py-1`, `px-4 py-2`, `px-5 py-3`, `h-12`
3. **Colors**: Orange (`#ee4d2d`), white, gray, red
4. **Hover states**: `hover:bg-orange/90`, `hover:text-orange`, `hover:bg-white`
5. **Focus states**: `focus:ring-2 focus:ring-orange focus:ring-offset-2`
6. **Transitions**: `transition-all`, `transition-colors`, `duration-200`
7. **Dark mode**: `dark:bg-slate-800/80`, `dark:text-gray-300`, etc.

---

## Recommendations

1. **Consolidate** icon-only buttons (WishlistButton, CompareButton) into Button component with `variant="icon"`
2. **Migrate** ProductActions buttons to use Button component with proper variants
3. **Standardize** calendar navigation buttons
4. **Create** text-only variant for ghost buttons

