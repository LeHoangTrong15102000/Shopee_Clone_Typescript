import SkeletonBase from './SkeletonBase'

interface CartItemSkeletonProps {
  count?: number
}

export default function CartItemSkeleton({ count = 1 }: CartItemSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className='mt-4 grid grid-cols-1 sm:grid-cols-12 items-center rounded-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-5 px-4 text-center text-sm text-gray-500 dark:text-gray-400 shadow dark:shadow-slate-900/30 min-h-[100px]'
          role='status'
          aria-busy='true'
          aria-label='Đang tải sản phẩm trong giỏ hàng'
        >
          {/* Checkbox and product info */}
          <div className='col-span-6'>
            <div className='flex items-center'>
              {/* Checkbox */}
              <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                <SkeletonBase className='h-5 w-5 rounded' />
              </div>

              {/* Product image */}
              <div className='flex-shrink-0'>
                <SkeletonBase className='h-16 w-16 sm:h-20 sm:w-20 rounded' />
              </div>

              {/* Product name */}
              <div className='flex-grow px-2 pt-1 pb-2'>
                <SkeletonBase className='h-4 w-full mb-1' />
                <SkeletonBase className='h-4 w-3/4' />
              </div>
            </div>
          </div>

          {/* Price, quantity, total, action */}
          <div className='col-span-6'>
            <div className='grid grid-cols-5 items-center'>
              {/* Price */}
              <div className='col-span-2'>
                <div className='flex items-center justify-center gap-2'>
                  <SkeletonBase className='h-4 w-16' />
                  <SkeletonBase className='h-4 w-20' />
                </div>
              </div>

              {/* Quantity controller */}
              <div className='col-span-1 flex justify-center'>
                <SkeletonBase className='h-8 w-24 rounded' />
              </div>

              {/* Total price */}
              <div className='col-span-1 flex justify-center'>
                <SkeletonBase className='h-4 w-20' />
              </div>

              {/* Delete button */}
              <div className='col-span-1 flex justify-center'>
                <SkeletonBase className='h-4 w-10' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

