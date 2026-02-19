import classNames from 'classnames'

interface LatestReview {
  name: string
  rating: number
}

interface LiveReviewFeedProps {
  newReviewCount: number
  latestReview?: LatestReview
  onViewReviews?: () => void
  className?: string
}

const renderStars = (rating: number) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

export default function LiveReviewFeed({ newReviewCount, latestReview, onViewReviews, className }: LiveReviewFeedProps) {
  if (newReviewCount <= 0) {
    return null
  }

  return (
    <div
      className={classNames(
        'flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-3 py-2 text-sm animate-fade-in cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors',
        className
      )}
      onClick={onViewReviews}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onViewReviews?.()}
    >
      <span className='text-lg'>⭐</span>
      <div className='flex-1 min-w-0'>
        {latestReview && (
          <p className='text-gray-700 dark:text-gray-200 truncate'>
            <span className='text-yellow-500'>{renderStars(latestReview.rating)}</span>
            {' '}
            <span className='font-medium'>{latestReview.name}</span> vừa đánh giá {latestReview.rating} sao
          </p>
        )}
        <p className='text-[#ee4d2d] font-medium'>
          {newReviewCount} đánh giá mới
        </p>
      </div>
      <span className='text-gray-400 dark:text-gray-500 text-xs ml-auto flex-shrink-0'>Nhấn để xem ↓</span>
    </div>
  )
}

