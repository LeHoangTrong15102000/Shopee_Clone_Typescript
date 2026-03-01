import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'

import purchaseApi from 'src/apis/purchases.api'
import { purchasesStatus } from 'src/constant/purchase'
import { AppContext } from 'src/contexts/app.context'
import { Purchase } from 'src/types/purchases.type'
import { AddToCartPayload, AddToCartContext, PurchasesQueryData, QUERY_KEYS } from '../shared/types'
import {
  findProductInCache,
  createOptimisticPurchase,
  updatePurchasesCache,
  createExtendedPurchase,
  showSuccessToast,
  showErrorToast,
  logOptimisticError
} from '../shared/utils'
import { TOAST_MESSAGES } from '../shared/constants'
import { useQueryInvalidation } from '../../useQueryInvalidation'

export const useOptimisticAddToCart = () => {
  const queryClient = useQueryClient()
  const { setExtendedPurchases } = useContext(AppContext)
  const { invalidateCart, invalidateProductDetail } = useQueryInvalidation()

  return useMutation({
    mutationFn: purchaseApi.addToCart,
    onMutate: async (newItem: AddToCartPayload): Promise<AddToCartContext> => {
      // Hủy các queries đang chờ để tránh override optimistic update
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PURCHASES_IN_CART
      })

      // Snapshot data hiện tại để rollback khi cần
      const previousPurchases = queryClient.getQueryData(QUERY_KEYS.PURCHASES_IN_CART)

      // Tìm thông tin sản phẩm từ cache
      const productData = findProductInCache(queryClient, newItem.product_id)

      if (productData) {
        // Tạo optimistic purchase object
        const optimisticPurchase = createOptimisticPurchase(productData, newItem.buy_count, purchasesStatus.inCart)

        // Cập nhật cache optimistically
        updatePurchasesCache(queryClient, QUERY_KEYS.PURCHASES_IN_CART, (old) => ({
          ...old,
          data: {
            ...old.data,
            data: [...(old.data?.data || []), optimisticPurchase]
          }
        }))

        // Cập nhật context state optimistically
        setExtendedPurchases((prev) => [
          ...prev,
          createExtendedPurchase(optimisticPurchase, {
            disabled: false,
            isChecked: true
          })
        ])

        // Hiển thị feedback ngay lập tức
        showSuccessToast(TOAST_MESSAGES.ADD_TO_CART_SUCCESS)
      }

      return { previousPurchases: previousPurchases as PurchasesQueryData | undefined, optimisticPurchase: productData ? createOptimisticPurchase(productData, newItem.buy_count, purchasesStatus.inCart) : undefined }
    },

    onError: (err, _newItem, context) => {
      // Rollback khi có lỗi
      if (context?.previousPurchases) {
        queryClient.setQueryData(QUERY_KEYS.PURCHASES_IN_CART, context.previousPurchases)
      }

      // Rollback context state
      if (context?.optimisticPurchase) {
        setExtendedPurchases((prev) => prev.filter((item) => !item._id.startsWith('temp-')))
      }

      // Hiển thị lỗi
      showErrorToast(TOAST_MESSAGES.ADD_TO_CART_ERROR)
      logOptimisticError('Add to cart', err, context)
    },

    onSuccess: (data, _variables, _context) => {
      // Thay thế item tạm thời bằng data thật từ server
      const realPurchase = data.data.data

      updatePurchasesCache(queryClient, QUERY_KEYS.PURCHASES_IN_CART, (old) => ({
        ...old,
        data: {
          ...old.data,
          data: old.data?.data?.map((item: Purchase) => (item._id.startsWith('temp-') ? realPurchase : item)) || [
            realPurchase
          ]
        }
      }))

      // Cập nhật context với data thật
      setExtendedPurchases((prev) =>
        prev.map((item) =>
          item._id.startsWith('temp-')
            ? createExtendedPurchase(realPurchase, { disabled: false, isChecked: true })
            : item
        )
      )
    },

    onSettled: (_data, _error, variables) => {
      // Invalidate cart để đảm bảo sync với server
      invalidateCart()

      // Invalidate product detail để update stock quantity nếu cần
      if (variables.product_id) {
        invalidateProductDetail(variables.product_id)
      }
    }
  })
}
