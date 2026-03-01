import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { produce } from 'immer'

import purchaseApi from 'src/apis/purchases.api'
import { AppContext } from 'src/contexts/app.context'
import { Purchase } from 'src/types/purchases.type'
import { UpdateQuantityPayload, UpdateQuantityContext, PurchasesQueryData, QUERY_KEYS } from '../shared/types'
import { updatePurchasesCache, showErrorToast, logOptimisticError } from '../shared/utils'
import { TOAST_MESSAGES } from '../shared/constants'
import { useQueryInvalidation } from '../../useQueryInvalidation'

export const useOptimisticUpdateQuantity = () => {
  const queryClient = useQueryClient()
  const { setExtendedPurchases } = useContext(AppContext)
  const { invalidateProductDetail } = useQueryInvalidation()

  return useMutation({
    mutationFn: purchaseApi.updatePurchase,
    onMutate: async ({ product_id, buy_count }: UpdateQuantityPayload): Promise<UpdateQuantityContext> => {
      // Hủy queries đang chờ
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PURCHASES_IN_CART
      })

      const previousData = queryClient.getQueryData(QUERY_KEYS.PURCHASES_IN_CART)

      // Cập nhật cache optimistically
      updatePurchasesCache(queryClient, QUERY_KEYS.PURCHASES_IN_CART, (old) => ({
        ...old,
        data: {
          ...old.data,
          data:
            old.data?.data?.map((purchase: Purchase) =>
              purchase.product._id === product_id ? { ...purchase, buy_count } : purchase
            ) || []
        }
      }))

      // Cập nhật context state optimistically
      setExtendedPurchases(
        produce((draft) => {
          const item = draft.find((p) => p.product._id === product_id)
          if (item) {
            item.buy_count = buy_count
            item.disabled = false // Không disable UI trong optimistic mode
          }
        })
      )

      return { previousData: previousData as PurchasesQueryData | undefined, product_id }
    },

    onError: (err, _variables, context) => {
      // Rollback changes
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.PURCHASES_IN_CART, context.previousData)
      }

      // Rollback context state
      setExtendedPurchases(
        produce((draft) => {
          const item = draft.find((p) => p.product._id === context?.product_id)
          if (item && context?.previousData) {
            const originalItem = (context.previousData as PurchasesQueryData | undefined)?.data?.data?.find(
              (p: Purchase) => p.product._id === context.product_id
            )
            if (originalItem) {
              item.buy_count = originalItem.buy_count
              item.disabled = false
            }
          }
        })
      )

      showErrorToast(TOAST_MESSAGES.UPDATE_QUANTITY_ERROR)
      logOptimisticError('Update quantity', err, context)
    },

    onSuccess: (_data, _variables) => {
      // Optimistic update đã xử lý UI rồi — không cần setExtendedPurchases lại
      // Server data sẽ được sync qua onSettled invalidation
    },

    onSettled: (_data, _error, variables) => {
      // Chỉ invalidate product detail (stock info) — KHÔNG invalidate cart
      // vì optimistic update đã cập nhật đúng buy_count rồi.
      // invalidateCart() ở đây gây re-fetch → useEffect → setExtendedPurchases → re-render thừa
      if (variables.product_id) {
        invalidateProductDetail(variables.product_id)
      }
    }
  })
}
