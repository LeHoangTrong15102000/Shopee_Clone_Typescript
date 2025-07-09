import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { CreateReviewData } from 'src/types/review.type'
import { Purchase } from 'src/types/purchases.type'
import reviewApi from 'src/apis/review.api'
import ProductRating from 'src/components/ProductRating'

interface ProductReviewModalProps {
  isOpen: boolean
  onClose: () => void
  purchase: Purchase
}

const ProductReviewModal = ({ isOpen, onClose, purchase }: ProductReviewModalProps) => {
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState<string>('')
  const [images, setImages] = useState<string[]>([])

  const queryClient = useQueryClient()

  const createReviewMutation = useMutation({
    mutationFn: reviewApi.createReview
  })

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) {
      toast.error('Vui lòng đánh giá và viết bình luận')
      return
    }

    if (comment.length < 10) {
      toast.error('Bình luận phải có ít nhất 10 ký tự')
      return
    }

    const reviewData: CreateReviewData = {
      purchase_id: purchase._id,
      rating,
      comment: comment.trim(),
      images
    }

    createReviewMutation.mutate(reviewData, {
      onSuccess: () => {
        toast.success('Đánh giá sản phẩm thành công!')
        queryClient.invalidateQueries({ queryKey: ['purchases'] })
        queryClient.invalidateQueries({ queryKey: ['product-reviews'] })
        onClose()
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')
      }
    })
  }

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold text-gray-800'>Đánh Giá Sản Phẩm</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 text-2xl font-bold'>
            ×
          </button>
        </div>

        {/* Body */}
        <div className='p-6 max-h-[70vh] overflow-y-auto'>
          {/* Product Info */}
          <div className='flex items-center mb-6 p-4 bg-gray-50 rounded-lg'>
            <img
              src={purchase.product.image}
              alt={purchase.product.name}
              className='w-16 h-16 object-cover rounded border'
            />
            <div className='ml-4 flex-1'>
              <h3 className='font-medium text-gray-800 line-clamp-2'>{purchase.product.name}</h3>
              <p className='text-sm text-gray-600 mt-1'>
                Phân loại hàng:{' '}
                {typeof purchase.product.category === 'object'
                  ? purchase.product.category?.name
                  : purchase.product.category || 'Mặc định'}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className='mb-6'>
            <h4 className='font-medium text-gray-800 mb-3'>Chất lượng sản phẩm</h4>
            <div className='flex items-center space-x-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleRatingClick(star)} className='focus:outline-none'>
                  <svg
                    className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                </button>
              ))}
              <span className='ml-2 text-orange-500 font-medium'>
                {rating === 5 && 'Tuyệt vời'}
                {rating === 4 && 'Hài lòng'}
                {rating === 3 && 'Bình thường'}
                {rating === 2 && 'Không hài lòng'}
                {rating === 1 && 'Tệ'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className='mb-6'>
            <h4 className='font-medium text-gray-800 mb-3'>Đánh giá của bạn</h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Hãy chia sẻ những điều bạn thích về sản phẩm này với những người mua khác nhé.'
              className='w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              rows={4}
              maxLength={2000}
            />
            <div className='text-right text-sm text-gray-500 mt-1'>{comment.length}/2000</div>
          </div>

          {/* Images Upload - Simplified for now */}
          <div className='mb-6'>
            <h4 className='font-medium text-gray-800 mb-3'>Thêm Hình ảnh</h4>
            <div className='flex items-center space-x-4'>
              <div className='w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500'>
                <div className='text-center'>
                  <svg
                    className='w-8 h-8 text-gray-400 mx-auto mb-1'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                  </svg>
                  <p className='text-xs text-gray-500'>Thêm Hình ảnh</p>
                </div>
              </div>
            </div>
            <p className='text-xs text-gray-500 mt-2'>Tối đa 10 hình ảnh</p>
          </div>

          {/* Service Rating */}
          <div className='mb-6'>
            <h4 className='font-medium text-gray-800 mb-3'>Về Dịch vụ</h4>

            <div className='mb-4'>
              <label className='block text-sm text-gray-700 mb-2'>Dịch vụ của người bán</label>
              <ProductRating
                rating={5}
                activeClassname='w-5 h-5 fill-yellow-400 text-yellow-400'
                nonActiveClassname='w-5 h-5 fill-gray-300 text-gray-300'
              />
              <span className='ml-2 text-sm text-orange-500'>Tuyệt vời</span>
            </div>

            <div className='mb-4'>
              <label className='block text-sm text-gray-700 mb-2'>Dịch vụ vận chuyển</label>
              <ProductRating
                rating={5}
                activeClassname='w-5 h-5 fill-yellow-400 text-yellow-400'
                nonActiveClassname='w-5 h-5 fill-gray-300 text-gray-300'
              />
              <span className='ml-2 text-sm text-orange-500'>Tuyệt vời</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end space-x-3 p-6 border-t bg-gray-50'>
          <button
            onClick={onClose}
            className='px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100'
          >
            Trở Lại
          </button>
          <button
            onClick={handleSubmit}
            disabled={createReviewMutation.isPending || !rating || !comment.trim()}
            className='px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {createReviewMutation.isPending ? 'Đang gửi...' : 'Hoàn Thành'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductReviewModal
