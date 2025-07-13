import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import reviewApi from 'src/apis/review.api'
import { Review, ReviewComment, CreateCommentData } from 'src/types/review.type'
import ProductRating from 'src/components/ProductRating'
import { useOptimisticReviewLike } from 'src/hooks/useOptimisticCart'
// Temporary date formatter - install date-fns for better formatting
const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean; locale?: any }) => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
  if (diffInHours < 24) return `${diffInHours} giờ trước`
  return `${diffInDays} ngày trước`
}

const vi = null // placeholder locale

interface ProductReviewsProps {
  productId: string
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'>(
    'newest'
  )
  const [ratingFilter, setRatingFilter] = useState<number | undefined>()
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<{ reviewId: string; commentId?: string } | null>(null)
  const [commentText, setCommentText] = useState('')

  const queryClient = useQueryClient()

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['product-reviews', productId, currentPage, sortBy, ratingFilter],
    queryFn: () =>
      reviewApi.getProductReviews(productId, {
        page: currentPage,
        limit: 10,
        sort: sortBy,
        rating: ratingFilter
      })
  })

  // Like/Unlike mutation với Optimistic Updates
  const likeMutation = useOptimisticReviewLike(productId)

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: reviewApi.createComment
  })

  const reviews = reviewsData?.data.data.reviews || []
  const stats = reviewsData?.data.data.stats
  const pagination = reviewsData?.data.data.pagination

  // Handle like/unlike với Optimistic Updates
  const handleLike = (reviewId: string) => {
    likeMutation.mutate(reviewId)
  }

  // Handle comment submit
  const handleCommentSubmit = (reviewId: string, parentCommentId?: string) => {
    if (!commentText.trim()) return

    const commentData: CreateCommentData = {
      review_id: reviewId,
      content: commentText.trim(),
      parent_comment_id: parentCommentId
    }

    commentMutation.mutate(commentData, {
      onSuccess: () => {
        toast.success('Bình luận thành công!')
        setCommentText('')
        setReplyingTo(null)
        queryClient.invalidateQueries({ queryKey: ['review-comments', reviewId] })
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi bình luận')
      }
    })
  }

  // Toggle comments visibility
  const toggleComments = (reviewId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedComments(newExpanded)
  }

  if (isLoading) {
    return (
      <div className='bg-white p-8 shadow rounded'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='border-b pb-4'>
                <div className='h-4 bg-gray-200 rounded w-1/4 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-full mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-3/4'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white p-8 shadow rounded'>
      {/* Header */}
      <h2 className='text-xl font-semibold text-gray-800 mb-6'>ĐÁNH GIÁ SẢN PHẨM</h2>

      {/* Stats Overview */}
      {stats && (
        <div className='bg-red-50 p-6 rounded-lg mb-6'>
          <div className='flex items-center space-x-8'>
            {/* Average Rating */}
            <div className='text-center'>
              <div className='text-3xl font-bold text-red-500 mb-1'>{stats.average_rating}/5</div>
              <ProductRating
                rating={stats.average_rating}
                activeClassname='h-5 w-5 fill-red-500 text-red-500'
                nonActiveClassname='h-5 w-5 fill-gray-300 text-gray-300'
              />
              <div className='text-sm text-gray-600 mt-1'>{stats.total_reviews} đánh giá</div>
            </div>

            {/* Rating Breakdown */}
            <div className='flex-1'>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className='flex items-center mb-1'>
                  <span className='text-sm w-8'>{star}</span>
                  <svg className='w-4 h-4 text-yellow-400 fill-current mx-1' viewBox='0 0 20 20'>
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                  <div className='flex-1 mx-2'>
                    <div className='bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-red-500 h-2 rounded-full'
                        style={{
                          width:
                            stats.total_reviews > 0
                              ? `${(stats.rating_breakdown[star as keyof typeof stats.rating_breakdown] / stats.total_reviews) * 100}%`
                              : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className='text-sm text-gray-600 w-8'>
                    {stats.rating_breakdown[star as keyof typeof stats.rating_breakdown]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='flex items-center justify-between mb-6 border-b pb-4'>
        <div className='flex items-center space-x-4'>
          <span className='text-sm font-medium'>Lọc theo:</span>
          <button
            onClick={() => setRatingFilter(undefined)}
            className={`px-3 py-1 text-sm rounded ${!ratingFilter ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Tất Cả
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setRatingFilter(rating)}
              className={`px-3 py-1 text-sm rounded flex items-center ${ratingFilter === rating ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {rating}{' '}
              <svg className='w-3 h-3 ml-1 fill-current' viewBox='0 0 20 20'>
                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
              </svg>
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className='px-3 py-1 border border-gray-300 rounded text-sm'
        >
          <option value='newest'>Mới nhất</option>
          <option value='oldest'>Cũ nhất</option>
          <option value='highest_rating'>Đánh giá cao nhất</option>
          <option value='lowest_rating'>Đánh giá thấp nhất</option>
          <option value='most_helpful'>Hữu ích nhất</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className='space-y-6'>
        {reviews.map((review: Review) => (
          <ReviewItem
            key={review._id}
            review={review}
            onLike={handleLike}
            onToggleComments={toggleComments}
            isCommentsExpanded={expandedComments.has(review._id)}
            onReply={(commentId?: string) => setReplyingTo({ reviewId: review._id, commentId })}
            replyingTo={replyingTo}
            commentText={commentText}
            setCommentText={setCommentText}
            onCommentSubmit={handleCommentSubmit}
            isSubmittingComment={commentMutation.isPending}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className='flex justify-center mt-8'>
          <div className='flex space-x-2'>
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded ${
                  page === currentPage ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Review Item Component
interface ReviewItemProps {
  review: Review
  onLike: (reviewId: string) => void
  onToggleComments: (reviewId: string) => void
  isCommentsExpanded: boolean
  onReply: (commentId?: string) => void
  replyingTo: { reviewId: string; commentId?: string } | null
  commentText: string
  setCommentText: (text: string) => void
  onCommentSubmit: (reviewId: string, parentCommentId?: string) => void
  isSubmittingComment: boolean
}

const ReviewItem = ({
  review,
  onLike,
  onToggleComments,
  isCommentsExpanded,
  onReply,
  replyingTo,
  commentText,
  setCommentText,
  onCommentSubmit,
  isSubmittingComment
}: ReviewItemProps) => {
  // Fetch comments when expanded
  const { data: commentsData } = useQuery({
    queryKey: ['review-comments', review._id],
    queryFn: () => reviewApi.getReviewComments(review._id),
    enabled: isCommentsExpanded
  })

  const comments = commentsData?.data.data.comments || []

  return (
    <div className='border-b border-gray-200 pb-6'>
      {/* User Info */}
      <div className='flex items-start space-x-4'>
        <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
          {review.user.avatar ? (
            <img src={review.user.avatar} alt={review.user.name} className='w-10 h-10 rounded-full object-cover' />
          ) : (
            <span className='text-sm font-medium text-gray-600'>{review.user.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className='flex-1'>
          {/* User Name & Rating */}
          <div className='flex items-center space-x-2 mb-1'>
            <span className='font-medium text-gray-800'>{review.user.name}</span>
            <ProductRating
              rating={review.rating}
              activeClassname='h-4 w-4 fill-yellow-400 text-yellow-400'
              nonActiveClassname='h-4 w-4 fill-gray-300 text-gray-300'
            />
          </div>

          {/* Time */}
          <div className='text-sm text-gray-500 mb-2'>
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
          </div>

          {/* Comment */}
          <div className='text-gray-700 mb-3'>{review.comment}</div>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className='flex space-x-2 mb-3'>
              {review.images.map((image, index) => (
                <img key={index} src={image} alt='Review' className='w-20 h-20 object-cover rounded border' />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className='flex items-center space-x-4 text-sm'>
            <button
              onClick={() => onLike(review._id)}
              className={`flex items-center space-x-1 ${review.is_liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            >
              <svg className='w-4 h-4 fill-current' viewBox='0 0 20 20'>
                <path d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z' />
              </svg>
              <span>Hữu ích ({review.helpful_count})</span>
            </button>

            <button onClick={() => onToggleComments(review._id)} className='text-gray-500 hover:text-gray-700'>
              Bình luận ({review.comments_count || comments.length})
            </button>

            <button onClick={() => onReply()} className='text-gray-500 hover:text-gray-700'>
              Trả lời
            </button>
          </div>

          {/* Comments Section */}
          {isCommentsExpanded && (
            <div className='mt-4 pl-4 border-l-2 border-gray-200'>
              {comments.map((comment: ReviewComment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  onCommentSubmit={onCommentSubmit}
                  isSubmittingComment={isSubmittingComment}
                />
              ))}

              {/* Reply Form */}
              {replyingTo?.reviewId === review._id && !replyingTo.commentId && (
                <div className='mt-4'>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder='Viết bình luận...'
                    className='w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    rows={3}
                  />
                  <div className='flex justify-end space-x-2 mt-2'>
                    <button
                      onClick={() => onReply()}
                      className='px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50'
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => onCommentSubmit(review._id)}
                      disabled={isSubmittingComment || !commentText.trim()}
                      className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {isSubmittingComment ? 'Đang gửi...' : 'Gửi'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Comment Item Component
interface CommentItemProps {
  comment: ReviewComment
  onReply: (commentId?: string) => void
  replyingTo: { reviewId: string; commentId?: string } | null
  commentText: string
  setCommentText: (text: string) => void
  onCommentSubmit: (reviewId: string, parentCommentId?: string) => void
  isSubmittingComment: boolean
}

const CommentItem = ({
  comment,
  onReply,
  replyingTo,
  commentText,
  setCommentText,
  onCommentSubmit,
  isSubmittingComment
}: CommentItemProps) => {
  return (
    <div className='mb-4'>
      <div className='flex items-start space-x-3'>
        <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
          {comment.user.avatar ? (
            <img src={comment.user.avatar} alt={comment.user.name} className='w-8 h-8 rounded-full object-cover' />
          ) : (
            <span className='text-xs font-medium text-gray-600'>{comment.user.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className='flex-1'>
          <div className='bg-gray-100 rounded-lg p-3'>
            <div className='font-medium text-sm text-gray-800 mb-1'>{comment.user.name}</div>
            <div className='text-sm text-gray-700'>{comment.content}</div>
          </div>

          <div className='flex items-center space-x-4 mt-1 text-xs text-gray-500'>
            <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}</span>
            <button onClick={() => onReply(comment._id)} className='hover:text-gray-700'>
              Trả lời
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo?.commentId === comment._id && (
            <div className='mt-2'>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Trả lời ${comment.user.name}...`}
                className='w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm'
                rows={2}
              />
              <div className='flex justify-end space-x-2 mt-2'>
                <button
                  onClick={() => onReply()}
                  className='px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50'
                >
                  Hủy
                </button>
                <button
                  onClick={() => onCommentSubmit(comment.review, comment._id)}
                  disabled={isSubmittingComment || !commentText.trim()}
                  className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmittingComment ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className='mt-3 pl-4 border-l border-gray-200'>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  onCommentSubmit={onCommentSubmit}
                  isSubmittingComment={isSubmittingComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductReviews
