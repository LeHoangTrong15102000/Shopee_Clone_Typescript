const ProductSkeleton = () => {
  return (
    <div className='overflow-hidden rounded-sm bg-white dark:bg-slate-800 shadow h-full min-h-[280px]'>
      {/* Image skeleton */}
      <div className='relative w-full pt-[100%] bg-gray-200 dark:bg-slate-700 animate-pulse' />

      {/* Content skeleton */}
      <div className='p-2'>
        {/* Name skeleton - 2 lines */}
        <div className='min-h-[1.9rem] space-y-1'>
          <div className='h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-full' />
          <div className='h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-3/4' />
        </div>

        {/* Price skeleton */}
        <div className='mt-3 flex items-center gap-2'>
          <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-16' />
          <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-20' />
        </div>

        {/* Rating + sold skeleton */}
        <div className='mt-3 flex items-center gap-2'>
          <div className='h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-20' />
          <div className='h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-16' />
        </div>
      </div>

      {/* Location skeleton */}
      <div className='p-2'>
        <div className='h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-24' />
      </div>
    </div>
  )
}

export default ProductSkeleton
