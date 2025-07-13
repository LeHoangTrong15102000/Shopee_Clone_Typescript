# 🚀 Optimistic Hooks - Cấu Trúc Mới

## 📋 Tổng Quan

Thư mục này chứa tất cả các optimistic hooks được tái cấu trúc để dễ bảo trì và mở rộng. Mỗi hook được tách ra thành file riêng biệt theo domain và chức năng.

## 🗂️ Cấu Trúc Thư Mục

```
src/hooks/optimistic/
├── cart/                          # Cart-related optimistic hooks
│   ├── useOptimisticAddToCart.ts
│   ├── useOptimisticUpdateQuantity.ts
│   ├── useOptimisticRemoveFromCart.ts
│   └── index.ts
├── review/                        # Review-related optimistic hooks
│   ├── useOptimisticReviewLike.ts
│   └── index.ts
├── shared/                        # Shared utilities và types
│   ├── types.ts                   # TypeScript types và interfaces
│   ├── utils.ts                   # Utility functions
│   ├── constants.ts               # Constants và messages
│   └── README.md                  # Documentation cho shared utilities
├── index.ts                       # Main export file
└── README.md                      # Documentation này
```

## 🎯 Cách Sử Dụng

### Import Hooks

```typescript
// ✅ Recommended: Import từ main index
import {
  useOptimisticAddToCart,
  useOptimisticUpdateQuantity,
  useOptimisticRemoveFromCart,
  useOptimisticReviewLike
} from 'src/hooks/optimistic'

// ✅ Alternative: Import từ domain-specific index
import { useOptimisticAddToCart } from 'src/hooks/optimistic/cart'
import { useOptimisticReviewLike } from 'src/hooks/optimistic/review'

// ❌ Avoid: Direct imports từ individual files
import { useOptimisticAddToCart } from 'src/hooks/optimistic/cart/useOptimisticAddToCart'
```

### Sử Dụng trong Components

```typescript
// ProductDetail.tsx
import { useOptimisticAddToCart } from 'src/hooks/optimistic'

const ProductDetail = () => {
  const addToCartMutation = useOptimisticAddToCart()

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      product_id: product._id,
      buy_count: buyCount
    })
  }
}

// Cart.tsx
import { useOptimisticUpdateQuantity, useOptimisticRemoveFromCart } from 'src/hooks/optimistic'

const Cart = () => {
  const updateQuantityMutation = useOptimisticUpdateQuantity()
  const removeFromCartMutation = useOptimisticRemoveFromCart()

  // Usage examples...
}
```

## 🔧 Shared Utilities

### Types

```typescript
import type { AddToCartPayload, UpdateQuantityPayload, OptimisticContext } from 'src/hooks/optimistic'
```

### Utilities

```typescript
import { showSuccessToast, showErrorToast, findProductInCache, createOptimisticPurchase } from 'src/hooks/optimistic'
```

### Constants

```typescript
import { TOAST_MESSAGES, TEMP_ID_PREFIX } from 'src/hooks/optimistic'
```

## 🏗️ Kiến Trúc và Nguyên Tắc

### 1. Separation of Concerns

- **Cart hooks**: Xử lý logic liên quan đến giỏ hàng
- **Review hooks**: Xử lý logic liên quan đến đánh giá
- **Shared utilities**: Code dùng chung cho tất cả hooks

### 2. Single Responsibility

- Mỗi hook chỉ xử lý một chức năng cụ thể
- Shared utilities được tách ra thành functions riêng biệt

### 3. Reusability

- Utilities có thể được sử dụng lại trong nhiều hooks
- Types được định nghĩa một lần và sử dụng lại

### 4. Maintainability

- Dễ dàng thêm hooks mới
- Dễ dàng sửa đổi logic của từng hook
- Clear separation giữa các domains

## 🚀 Thêm Hooks Mới

### Bước 1: Tạo Hook File

```typescript
// src/hooks/optimistic/[domain]/useOptimistic[Feature].ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { [Context], QUERY_KEYS } from '../shared/types'
import { showSuccessToast, showErrorToast } from '../shared/utils'

export const useOptimistic[Feature] = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.[feature],
    onMutate: async (payload) => {
      // Optimistic update logic
    },
    onError: (err, variables, context) => {
      // Rollback logic
    },
    onSuccess: (data, variables, context) => {
      // Success handling
    },
    onSettled: () => {
      // Cache invalidation
    }
  })
}
```

### Bước 2: Export trong Domain Index

```typescript
// src/hooks/optimistic/[domain]/index.ts
export { useOptimistic[Feature] } from './useOptimistic[Feature]'
```

### Bước 3: Export trong Main Index

```typescript
// src/hooks/optimistic/index.ts
export { useOptimistic[Feature] } from './[domain]'
```

## 🎨 Best Practices

### 1. Error Handling

```typescript
onError: (err, variables, context) => {
  // 1. Rollback optimistic changes
  if (context?.previousData) {
    queryClient.setQueryData(queryKey, context.previousData)
  }

  // 2. Show user feedback
  showErrorToast(TOAST_MESSAGES.FEATURE_ERROR)

  // 3. Log for debugging
  logOptimisticError('Feature name', err, context)
}
```

### 2. Toast Messages

```typescript
// ✅ Use constants
showSuccessToast(TOAST_MESSAGES.ADD_TO_CART_SUCCESS)

// ❌ Avoid hardcoded strings
toast.success('Đã thêm vào giỏ hàng!')
```

### 3. Type Safety

```typescript
// ✅ Use typed contexts
onMutate: async (payload: FeaturePayload): Promise<FeatureContext> => {
  // Implementation
}

// ✅ Use typed utilities
const optimisticItem = createOptimisticPurchase(productData, buyCount)
```

## 📊 Performance Benefits

### Before (Single File)

- ❌ 471 dòng code trong 1 file
- ❌ Khó maintain và debug
- ❌ Khó test individual hooks
- ❌ Khó mở rộng thêm features

### After (Modular Structure)

- ✅ Tách thành 7 files nhỏ (< 100 dòng/file)
- ✅ Dễ maintain và debug
- ✅ Dễ test từng hook riêng biệt
- ✅ Dễ mở rộng thêm features
- ✅ Reusable utilities và types
- ✅ Better code organization

## 🔮 Future Enhancements

### Planned Features

1. **Wishlist Operations**: `useOptimisticWishlistToggle`
2. **Comment System**: `useOptimisticCommentSubmit`
3. **User Profile**: `useOptimisticProfileUpdate`
4. **Notifications**: `useOptimisticNotificationRead`

### Advanced Patterns

1. **Batch Operations**: Multiple optimistic updates
2. **Offline Support**: Queue optimistic updates
3. **Conflict Resolution**: Handle concurrent updates
4. **Real-time Sync**: WebSocket integration

---

_📅 Last Updated: ${new Date().toLocaleDateString('vi-VN')}_  
_🔄 Version: 1.0_  
_👨‍💻 Refactored by: AI Assistant_
