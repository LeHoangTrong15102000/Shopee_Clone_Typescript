import SkeletonBase from './SkeletonBase'

interface NotificationSkeletonProps {
  count?: number
}

export default function NotificationSkeleton({ count = 3 }: NotificationSkeletonProps) {
  return (
    <div role='status' aria-busy='true' aria-label='Đang tải thông báo' className='min-h-[200px]'>
      {[...Array(count)].map((_, index) => (
        <div key={index} className='flex items-start p-4 border-b border-gray-100 dark:border-slate-700 last:border-b-0 min-h-[80px]'>
          {/* Icon placeholder */}
          <div className='flex-shrink-0 mr-3'>
            <SkeletonBase className='w-8 h-8 rounded-full' />
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            {/* Title row */}
            <div className='flex items-start justify-between'>
              <SkeletonBase className='h-4 w-32 mb-2' />
              <SkeletonBase className='w-2 h-2 rounded-full ml-2 flex-shrink-0' />
            </div>

            {/* Message - 2 lines */}
            <SkeletonBase className='h-3 w-full mb-1' />
            <SkeletonBase className='h-3 w-4/5 mb-2' />

            {/* Time */}
            <SkeletonBase className='h-3 w-16' />
          </div>
        </div>
      ))}
    </div>
  )
}

