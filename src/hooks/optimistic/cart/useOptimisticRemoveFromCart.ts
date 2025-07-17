import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { toast } from 'react-toastify'

import purchaseApi from 'src/apis/purchases.api'
import { AppContext } from 'src/contexts/app.context'
import { Purchase } from 'src/types/purchases.type'
import { RemoveFromCartContext, QUERY_KEYS } from '../shared/types'
import {
  updatePurchasesCache,
  createExtendedPurchase,
  showErrorToast,
  showSuccessToast,
  showInfoToast,
  logOptimisticError
} from '../shared/utils'
import { TOAST_MESSAGES } from '../shared/constants'
import { TOAST_CONFIG } from '../shared/utils'
import { useQueryInvalidation } from '../../useQueryInvalidation'

export const useOptimisticRemoveFromCart = () => {
  const queryClient = useQueryClient()
  const { setExtendedPurchases } = useContext(AppContext)
  const { invalidateCart, invalidateProductDetail } = useQueryInvalidation()

  return useMutation({
    mutationFn: purchaseApi.deletePurchase,
    onMutate: async (purchaseIds: string[]): Promise<RemoveFromCartContext> => {
      // Hủy các queries đang chờ
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PURCHASES_IN_CART
      })

      const previousData = queryClient.getQueryData(QUERY_KEYS.PURCHASES_IN_CART)

      // Lưu thông tin sản phẩm bị xóa để có thể undo
      const removedItems =
        (previousData as any)?.data?.data?.filter((purchase: Purchase) => purchaseIds.includes(purchase._id)) || []

      // Cập nhật cache optimistically - xóa items ngay lập tức
      updatePurchasesCache(queryClient, QUERY_KEYS.PURCHASES_IN_CART, (old) => ({
        ...old,
        data: {
          ...old.data,
          data: old.data.data.filter((purchase: Purchase) => !purchaseIds.includes(purchase._id))
        }
      }))

      // Cập nhật context state optimistically
      setExtendedPurchases((prev) => prev.filter((item) => !purchaseIds.includes(item._id)))

      // Hiển thị thông báo với option undo
      const undoToast = toast.success(TOAST_MESSAGES.REMOVE_FROM_CART_SUCCESS(purchaseIds.length), {
        ...TOAST_CONFIG.UNDO,
        closeButton: false,
        hideProgressBar: false,
        onClick: () => {
          // Undo functionality
          if (previousData) {
            queryClient.setQueryData(QUERY_KEYS.PURCHASES_IN_CART, previousData)
            setExtendedPurchases((prev) => {
              const restoredItems = removedItems.map((item: Purchase) =>
                createExtendedPurchase(item, { disabled: false, isChecked: false })
              )
              return [...prev, ...restoredItems]
            })
            toast.dismiss(undoToast)
            showInfoToast(TOAST_MESSAGES.RESTORE_ITEMS)
          }
        }
      })

      return { previousData, removedItems, undoToast }
    },

    onError: (err, purchaseIds, context) => {
      // Rollback khi có lỗi
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.PURCHASES_IN_CART, context.previousData)

        // Khôi phục context state
        if (context.removedItems) {
          setExtendedPurchases((prev) => {
            const restoredItems = context.removedItems!.map((item: Purchase) =>
              createExtendedPurchase(item, { disabled: false, isChecked: false })
            )
            return [...prev, ...restoredItems]
          })
        }
      }

      // Dismiss undo toast nếu có
      if (context?.undoToast) {
        toast.dismiss(context.undoToast)
      }

      // Hiển thị lỗi
      showErrorToast(TOAST_MESSAGES.REMOVE_FROM_CART_ERROR)
      logOptimisticError('Remove from cart', err, context)
    },

    onSuccess: (data, purchaseIds, context) => {
      // Dismiss undo toast khi thành công
      if (context?.undoToast) {
        toast.dismiss(context.undoToast)
      }

      // Hiển thị thông báo thành công cuối cùng
      showSuccessToast(TOAST_MESSAGES.REMOVE_FROM_CART_FINAL_SUCCESS(purchaseIds.length))
    },

    onSettled: (data, error, variables) => {
      // Invalidate cart để sync với server
      invalidateCart()

      // Invalidate product details của các sản phẩm đã remove
      // để update stock quantity
      if (variables && Array.isArray(variables)) {
        // variables là array của purchase IDs, cần tìm product IDs
        // Điều này phức tạp hơn, có thể invalidate toàn bộ product lists thay vì
        queryClient.invalidateQueries({ queryKey: ['products', 'list'] })
      }
    }
  })
}
