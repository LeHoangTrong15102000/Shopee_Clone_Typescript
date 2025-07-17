import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { produce } from 'immer'

import purchaseApi from 'src/apis/purchases.api'
import { AppContext } from 'src/contexts/app.context'
import { Purchase } from 'src/types/purchases.type'
import { UpdateQuantityPayload, UpdateQuantityContext, QUERY_KEYS } from '../shared/types'
import { updatePurchasesCache, showErrorToast, logOptimisticError } from '../shared/utils'
import { TOAST_MESSAGES } from '../shared/constants'
import { useQueryInvalidation } from '../../useQueryInvalidation'

export const useOptimisticUpdateQuantity = () => {
  const queryClient = useQueryClient()
  const { setExtendedPurchases } = useContext(AppContext)
  const { invalidateCart, invalidateProductDetail } = useQueryInvalidation()

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

      return { previousData, product_id }
    },

    onError: (err, variables, context) => {
      // Rollback changes
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.PURCHASES_IN_CART, context.previousData)
      }

      // Rollback context state
      setExtendedPurchases(
        produce((draft) => {
          const item = draft.find((p) => p.product._id === context?.product_id)
          if (item && context?.previousData) {
            const originalItem = (context.previousData as any)?.data?.data?.find(
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

    onSuccess: (data, variables) => {
      // Update với data từ server nếu khác với optimistic update
      const updatedPurchase = data.data.data

      setExtendedPurchases(
        produce((draft) => {
          const item = draft.find((p) => p.product._id === variables.product_id)
          if (item) {
            item.buy_count = updatedPurchase.buy_count
            item.disabled = false
          }
        })
      )
    },

    onSettled: (data, error, variables) => {
      // Invalidate cart để sync với server
      invalidateCart()

      // Invalidate product detail để update stock
      if (variables.product_id) {
        invalidateProductDetail(variables.product_id)
      }
    }
  })
}
