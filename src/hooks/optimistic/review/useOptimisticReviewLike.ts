import { useMutation, useQueryClient } from '@tanstack/react-query'

import reviewApi from 'src/apis/review.api'
import { ReviewLikeContext, QUERY_KEYS } from '../shared/types'
import { updatePurchasesCache, showSuccessToast, showErrorToast, logOptimisticError } from '../shared/utils'
import { TOAST_MESSAGES } from '../shared/constants'
import { useQueryInvalidation } from '../../useQueryInvalidation'

export const useOptimisticReviewLike = (productId: string) => {
  const queryClient = useQueryClient()
  const { invalidateProductReviews } = useQueryInvalidation()

  return useMutation({
    mutationFn: reviewApi.toggleReviewLike,
    onMutate: async (reviewId: string): Promise<ReviewLikeContext> => {
      // Hủy các queries đang chờ để tránh override optimistic update
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.PRODUCT_REVIEWS(productId)
      })

      // Snapshot data hiện tại để rollback khi cần
      const previousReviews = queryClient.getQueryData(QUERY_KEYS.PRODUCT_REVIEWS(productId))

      // Cập nhật cache optimistically
      queryClient.setQueryData(QUERY_KEYS.PRODUCT_REVIEWS(productId), (old: any) => {
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

      const message = isCurrentlyLiked ? TOAST_MESSAGES.REVIEW_UNLIKE_SUCCESS : TOAST_MESSAGES.REVIEW_LIKE_SUCCESS

      showSuccessToast(message, { autoClose: 1000 })

      return { previousReviews, reviewId }
    },

    onError: (err, reviewId, context) => {
      // Rollback khi có lỗi
      if (context?.previousReviews) {
        queryClient.setQueryData(QUERY_KEYS.PRODUCT_REVIEWS(productId), context.previousReviews)
      }

      // Hiển thị lỗi
      showErrorToast(TOAST_MESSAGES.REVIEW_LIKE_ERROR)
      logOptimisticError('Review like', err, context)
    },

    onSuccess: (data, reviewId, context) => {
      // Cập nhật với data thật từ server
      queryClient.setQueryData(QUERY_KEYS.PRODUCT_REVIEWS(productId), (old: any) => {
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
      // Invalidate product reviews để sync với server
      invalidateProductReviews(productId)
    }
  })
}
