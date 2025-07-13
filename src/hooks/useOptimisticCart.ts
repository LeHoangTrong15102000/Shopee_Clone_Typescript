import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { toast } from 'react-toastify'
import { produce } from 'immer'

import purchaseApi from 'src/apis/purchases.api'
import { purchasesStatus } from 'src/constant/purchase'
import { AppContext } from 'src/contexts/app.context'
import { Purchase } from 'src/types/purchases.type'
import reviewApi from 'src/apis/review.api'

export const useOptimisticAddToCart = () => {
  const queryClient = useQueryClient()
  const { setExtendedPurchases } = useContext(AppContext)

  return useMutation({
    mutationFn: purchaseApi.addToCart,
    onMutate: async (newItem: { product_id: string; buy_count: number }) => {
      // Hủy các queries đang chờ để tránh override optimistic update
      await queryClient.cancelQueries({
        queryKey: ['purchases', { status: purchasesStatus.inCart }]
      })

      // Snapshot data hiện tại để rollback khi cần
      const previousPurchases = queryClient.getQueryData(['purchases', { status: purchasesStatus.inCart }])

      // Lấy thông tin sản phẩm từ cache (nếu có)
      const allProductsQueries = queryClient.getQueriesData({ queryKey: ['products'] })
      let productData = null

      // Tìm sản phẩm trong các queries cache
      for (const [, data] of allProductsQueries) {
        if (data && typeof data === 'object' && 'data' in data) {
          const products = (data as any).data?.data?.products || []
          productData = products.find((p: any) => p._id === newItem.product_id)
          if (productData) break
        }
      }

      // Nếu không tìm thấy trong cache, cố gắng lấy từ product detail query
      if (!productData) {
        const productDetailQueries = queryClient.getQueriesData({ queryKey: ['product'] })
        for (const [, data] of productDetailQueries) {
          if (data && typeof data === 'object' && 'data' in data) {
            const product = (data as any).data?.data
            if (product && product._id === newItem.product_id) {
              productData = product
              break
            }
          }
        }
      }

      if (productData) {
        // Tạo optimistic purchase object
        const optimisticPurchase: Purchase = {
          _id: `temp-${Date.now()}`,
          buy_count: newItem.buy_count,
          price: productData.price,
          price_before_discount: productData.price_before_discount,
          status: purchasesStatus.inCart,
          user: 'current-user', // placeholder
          product: productData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Cập nhật cache optimistically
        queryClient.setQueryData(['purchases', { status: purchasesStatus.inCart }], (old: any) => {
          if (!old) return old
          return {
            ...old,
            data: {
              ...old.data,
              data: [...(old.data?.data || []), optimisticPurchase]
            }
          }
        })

        // Cập nhật context state optimistically
        setExtendedPurchases((prev) => [
          ...prev,
          {
            ...optimisticPurchase,
            disabled: false,
            isChecked: true // Tự động check sản phẩm mới thêm
          }
        ])

        // Hiển thị feedback ngay lập tức
        toast.success('🛒 Đã thêm vào giỏ hàng!', {
          autoClose: 1500,
          position: 'top-center'
        })
      }

      return { previousPurchases, optimisticPurchase: productData }
    },

    onError: (err, newItem, context) => {
      // Rollback khi có lỗi
      if (context?.previousPurchases) {
        queryClient.setQueryData(['purchases', { status: purchasesStatus.inCart }], context.previousPurchases)
      }

      // Rollback context state
      if (context?.optimisticPurchase) {
        setExtendedPurchases((prev) => prev.filter((item) => !item._id.startsWith('temp-')))
      }

      // Hiển thị lỗi với option thử lại
      toast.error('❌ Không thể thêm vào giỏ hàng', {
        autoClose: 3000,
        position: 'top-center'
      })

      console.error('Add to cart error:', err)
    },

    onSuccess: (data, variables, context) => {
      // Thay thế item tạm thời bằng data thật từ server
      const realPurchase = data.data.data

      queryClient.setQueryData(['purchases', { status: purchasesStatus.inCart }], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data?.data?.map((item: Purchase) => (item._id.startsWith('temp-') ? realPurchase : item)) || [
              realPurchase
            ]
          }
        }
      })

      // Cập nhật context với data thật
      setExtendedPurchases((prev) =>
        prev.map((item) =>
          item._id.startsWith('temp-') ? { ...realPurchase, disabled: false, isChecked: true } : item
        )
      )
    },

    onSettled: () => {
      // Đảm bảo sync với server
      queryClient.invalidateQueries({
        queryKey: ['purchases', { status: purchasesStatus.inCart }]
      })
    }
  })
}

export const useOptimisticUpdateQuantity = () => {
  const queryClient = useQueryClient()
  const { setExtendedPurchases } = useContext(AppContext)

  return useMutation({
    mutationFn: purchaseApi.updatePurchase,
    onMutate: async ({ product_id, buy_count }) => {
      // Hủy queries đang chờ
      await queryClient.cancelQueries({
        queryKey: ['purchases', { status: purchasesStatus.inCart }]
      })

      const previousData = queryClient.getQueryData(['purchases', { status: purchasesStatus.inCart }])

      // Cập nhật cache optimistically
      queryClient.setQueryData(['purchases', { status: purchasesStatus.inCart }], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            data:
              old.data?.data?.map((purchase: Purchase) =>
                purchase.product._id === product_id ? { ...purchase, buy_count } : purchase
              ) || []
          }
        }
      })

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
        queryClient.setQueryData(['purchases', { status: purchasesStatus.inCart }], context.previousData)
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

      toast.error('❌ Không thể cập nhật số lượng', {
        autoClose: 2000,
        position: 'top-center'
      })
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

    onSettled: () => {
      // Sync với server
      queryClient.invalidateQueries({
        queryKey: ['purchases', { status: purchasesStatus.inCart }]
      })
    }
  })
}

export const useOptimisticReviewLike = (productId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewApi.toggleReviewLike,
    onMutate: async (reviewId: string) => {
      // Hủy các queries đang chờ để tránh override optimistic update
      await queryClient.cancelQueries({
        queryKey: ['product-reviews', productId]
      })

      // Snapshot data hiện tại để rollback khi cần
      const previousReviews = queryClient.getQueryData(['product-reviews', productId])

      // Cập nhật cache optimistically
      queryClient.setQueryData(['product-reviews', productId], (old: any) => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              reviews: old.data.data.reviews.map((review: any) =>
                review._id === reviewId
                  ? {
                      ...review,
                      is_liked: !review.is_liked,
                      helpful_count: review.helpful_count + (review.is_liked ? -1 : 1)
                    }
                  : review
              )
            }
          }
        }
      })

      // Hiển thị feedback ngay lập tức
      const isCurrentlyLiked = previousReviews
        ? (previousReviews as any).data?.data?.reviews?.find((r: any) => r._id === reviewId)?.is_liked
        : false

      toast.success(isCurrentlyLiked ? '💔 Đã bỏ thích đánh giá' : '❤️ Đã thích đánh giá!', {
        autoClose: 1000,
        position: 'top-center'
      })

      return { previousReviews, reviewId }
    },

    onError: (err, reviewId, context) => {
      // Rollback khi có lỗi
      if (context?.previousReviews) {
        queryClient.setQueryData(['product-reviews', productId], context.previousReviews)
      }

      // Hiển thị lỗi
      toast.error('❌ Không thể thực hiện thao tác', {
        autoClose: 2000,
        position: 'top-center'
      })

      console.error('Review like error:', err)
    },

    onSuccess: (data, reviewId, context) => {
      // Cập nhật với data thật từ server
      queryClient.setQueryData(['product-reviews', productId], (old: any) => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              reviews: old.data.data.reviews.map((review: any) =>
                review._id === reviewId
                  ? {
                      ...review,
                      is_liked: data.data.data.is_liked,
                      helpful_count: data.data.data.helpful_count
                    }
                  : review
              )
            }
          }
        }
      })
    },

    onSettled: () => {
      // Đảm bảo sync với server
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', productId]
      })
    }
  })
}

export const useOptimisticRemoveFromCart = () => {
  const queryClient = useQueryClient()
  const { setExtendedPurchases } = useContext(AppContext)

  return useMutation({
    mutationFn: purchaseApi.deletePurchase,
    onMutate: async (purchaseIds: string[]) => {
      // Hủy các queries đang chờ
      await queryClient.cancelQueries({
        queryKey: ['purchases', { status: purchasesStatus.inCart }]
      })

      const previousData = queryClient.getQueryData(['purchases', { status: purchasesStatus.inCart }])

      // Lưu thông tin sản phẩm bị xóa để có thể undo
      const removedItems =
        (previousData as any)?.data?.data?.filter((purchase: Purchase) => purchaseIds.includes(purchase._id)) || []

      // Cập nhật cache optimistically - xóa items ngay lập tức
      queryClient.setQueryData(['purchases', { status: purchasesStatus.inCart }], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.filter((purchase: Purchase) => !purchaseIds.includes(purchase._id))
          }
        }
      })

      // Cập nhật context state optimistically
      setExtendedPurchases((prev) => prev.filter((item) => !purchaseIds.includes(item._id)))

      // Hiển thị thông báo với option undo
      const isMultiple = purchaseIds.length > 1
      const undoToast = toast.success(
        `🗑️ Đã xóa ${isMultiple ? `${purchaseIds.length} sản phẩm` : 'sản phẩm'} khỏi giỏ hàng`,
        {
          autoClose: 5000,
          position: 'top-center',
          closeButton: false,
          hideProgressBar: false,
          onClick: () => {
            // Undo functionality
            if (previousData) {
              queryClient.setQueryData(['purchases', { status: purchasesStatus.inCart }], previousData)
              setExtendedPurchases((prev) => {
                const restoredItems = removedItems.map((item: Purchase) => ({
                  ...item,
                  disabled: false,
                  isChecked: false
                }))
                return [...prev, ...restoredItems]
              })
              toast.dismiss(undoToast)
              toast.info('↩️ Đã khôi phục sản phẩm', {
                autoClose: 2000,
                position: 'top-center'
              })
            }
          }
        }
      )

      return { previousData, removedItems, undoToast }
    },

    onError: (err, purchaseIds, context) => {
      // Rollback khi có lỗi
      if (context?.previousData) {
        queryClient.setQueryData(['purchases', { status: purchasesStatus.inCart }], context.previousData)

        // Khôi phục context state
        if (context.removedItems) {
          setExtendedPurchases((prev) => {
            const restoredItems = context.removedItems.map((item: Purchase) => ({
              ...item,
              disabled: false,
              isChecked: false
            }))
            return [...prev, ...restoredItems]
          })
        }
      }

      // Dismiss undo toast nếu có
      if (context?.undoToast) {
        toast.dismiss(context.undoToast)
      }

      // Hiển thị lỗi
      toast.error('❌ Không thể xóa sản phẩm khỏi giỏ hàng', {
        autoClose: 3000,
        position: 'top-center'
      })

      console.error('Remove from cart error:', err)
    },

    onSuccess: (data, purchaseIds, context) => {
      // Dismiss undo toast khi thành công
      if (context?.undoToast) {
        toast.dismiss(context.undoToast)
      }

      // Hiển thị thông báo thành công cuối cùng
      const isMultiple = purchaseIds.length > 1
      toast.success(`✅ Đã xóa ${isMultiple ? `${purchaseIds.length} sản phẩm` : 'sản phẩm'} thành công`, {
        autoClose: 2000,
        position: 'top-center'
      })
    },

    onSettled: () => {
      // Sync với server
      queryClient.invalidateQueries({
        queryKey: ['purchases', { status: purchasesStatus.inCart }]
      })
    }
  })
}
