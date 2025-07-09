import http from 'src/utils/http'
import {
  Review,
  ReviewListResponse,
  CreateReviewData,
  CreateCommentData,
  CommentListResponse,
  CanReviewResponse,
  ReviewQuery
} from 'src/types/review.type'
import { SuccessResponseApi } from 'src/types/utils.type'

const URL = 'reviews'

// API functions
const reviewApi = {
  // Tạo review mới
  createReview: (body: CreateReviewData) => http.post<SuccessResponseApi<Review>>(`${URL}`, body),

  // Lấy reviews của sản phẩm
  getProductReviews: (productId: string, params?: ReviewQuery) =>
    http.get<SuccessResponseApi<ReviewListResponse>>(`${URL}/product/${productId}`, { params }),

  // Like/Unlike review
  toggleReviewLike: (reviewId: string) =>
    http.post<SuccessResponseApi<{ is_liked: boolean; helpful_count: number }>>(`${URL}/like/${reviewId}`),

  // Tạo comment
  createComment: (body: CreateCommentData) => http.post<SuccessResponseApi<Comment>>(`${URL}/comment`, body),

  // Lấy comments của review
  getReviewComments: (reviewId: string, params?: { page?: number; limit?: number }) =>
    http.get<SuccessResponseApi<CommentListResponse>>(`${URL}/comments/${reviewId}`, { params }),

  // Kiểm tra có thể đánh giá purchase không
  canReviewPurchase: (purchaseId: string) =>
    http.get<SuccessResponseApi<CanReviewResponse>>(`${URL}/can-review/${purchaseId}`)
}

export default reviewApi
