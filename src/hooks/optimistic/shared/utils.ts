import { toast } from 'react-toastify'
import { Purchase } from 'src/types/purchases.type'
import { purchasesStatus } from 'src/constant/purchase'
import { ToastConfig } from './types'

// Toast configurations
export const TOAST_CONFIG: Record<string, ToastConfig> = {
  SUCCESS: {
    autoClose: 1500,
    position: 'top-center'
  },
  ERROR: {
    autoClose: 3000,
    position: 'top-center'
  },
  INFO: {
    autoClose: 2000,
    position: 'top-center'
  },
  QUICK_SUCCESS: {
    autoClose: 1000,
    position: 'top-center'
  },
  UNDO: {
    autoClose: 5000,
    position: 'top-center'
  }
}

// Toast utility functions
export const showSuccessToast = (message: string, config?: Partial<ToastConfig>) => {
  return toast.success(message, { ...TOAST_CONFIG.SUCCESS, ...config })
}

export const showErrorToast = (message: string, config?: Partial<ToastConfig>) => {
  return toast.error(message, { ...TOAST_CONFIG.ERROR, ...config })
}

export const showInfoToast = (message: string, config?: Partial<ToastConfig>) => {
  return toast.info(message, { ...TOAST_CONFIG.INFO, ...config })
}

// Product data finder utility
export const findProductInCache = (queryClient: any, productId: string) => {
  // Tìm trong products queries
  const allProductsQueries = queryClient.getQueriesData({ queryKey: ['products'] })

  for (const [, data] of allProductsQueries) {
    if (data && typeof data === 'object' && 'data' in data) {
      const products = (data as any).data?.data?.products || []
      const productData = products.find((p: any) => p._id === productId)
      if (productData) return productData
    }
  }

  // Tìm trong product detail queries
  const productDetailQueries = queryClient.getQueriesData({ queryKey: ['product'] })
  for (const [, data] of productDetailQueries) {
    if (data && typeof data === 'object' && 'data' in data) {
      const product = (data as any).data?.data
      if (product && product._id === productId) {
        return product
      }
    }
  }

  return null
}

// Optimistic purchase creator
export const createOptimisticPurchase = (
  productData: any,
  buyCount: number,
  status = purchasesStatus.inCart
): Purchase => {
  return {
    _id: `temp-${Date.now()}`,
    buy_count: buyCount,
    price: productData.price,
    price_before_discount: productData.price_before_discount,
    status,
    user: 'current-user', // placeholder
    product: productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Cache update utilities
export const updatePurchasesCache = (queryClient: any, queryKey: any[], updater: (oldData: any) => any) => {
  queryClient.setQueryData(queryKey, (old: any) => {
    if (!old) return old
    return updater(old)
  })
}

// Context state helpers
export const createExtendedPurchase = (
  purchase: Purchase,
  options: { disabled?: boolean; isChecked?: boolean } = {}
) => {
  return {
    ...purchase,
    disabled: options.disabled ?? false,
    isChecked: options.isChecked ?? false
  }
}

// Error logging utility
export const logOptimisticError = (operation: string, error: any, context?: any) => {
  console.error(`Optimistic ${operation} error:`, error)
  if (context) {
    console.error('Context:', context)
  }
}
