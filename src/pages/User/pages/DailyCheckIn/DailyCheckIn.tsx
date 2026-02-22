import { Helmet } from 'react-helmet-async'
import DailyCheckIn from 'src/components/DailyCheckIn'

export default function DailyCheckInPage() {
  return (
    <div className='rounded-sm bg-white dark:bg-slate-800 px-2 pb-10 shadow md:px-7 md:pb-20'>
      <Helmet>
        <title>Điểm danh hàng ngày | Shopee Clone</title>
        <meta name='description' content='Điểm danh hàng ngày để nhận xu và phần thưởng' />
      </Helmet>

      <div className='border-b border-b-gray-200 dark:border-b-slate-700 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900 dark:text-gray-100'>Điểm danh hàng ngày</h1>
        <div className='mt-1 text-sm text-gray-700 dark:text-gray-400'>Điểm danh mỗi ngày để nhận xu và phần thưởng hấp dẫn</div>
      </div>

      <div className='mt-8 flex flex-col items-center'>
        <DailyCheckIn className='w-full max-w-md' />

        {/* Rewards Info */}
        <div className='mt-8 w-full max-w-2xl'>
          <h2 className='text-base font-medium text-gray-900 dark:text-gray-100 mb-4'>Phần thưởng theo chuỗi điểm danh</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center'>
              <div className='text-2xl mb-2'>🎁</div>
              <div className='font-medium text-gray-900 dark:text-gray-100'>3 ngày</div>
              <div className='text-sm text-[#ee4d2d] dark:text-orange-400'>x1.5 xu</div>
            </div>
            <div className='bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center'>
              <div className='text-2xl mb-2'>🎉</div>
              <div className='font-medium text-gray-900 dark:text-gray-100'>7 ngày</div>
              <div className='text-sm text-[#ee4d2d] dark:text-orange-400'>x2 xu</div>
            </div>
            <div className='bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center'>
              <div className='text-2xl mb-2'>🏆</div>
              <div className='font-medium text-gray-900 dark:text-gray-100'>14 ngày</div>
              <div className='text-sm text-[#ee4d2d] dark:text-orange-400'>x2.5 xu</div>
            </div>
            <div className='bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center'>
              <div className='text-2xl mb-2'>👑</div>
              <div className='font-medium text-gray-900 dark:text-gray-100'>30 ngày</div>
              <div className='text-sm text-[#ee4d2d] dark:text-orange-400'>x3 xu</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className='mt-8 w-full max-w-2xl bg-orange-50 dark:bg-slate-700 rounded-lg p-4'>
          <h3 className='font-medium text-gray-900 dark:text-gray-100 mb-2'>💡 Mẹo nhỏ</h3>
          <ul className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
            <li>• Điểm danh liên tục để nhận thưởng cao hơn</li>
            <li>• Chuỗi điểm danh sẽ bị reset nếu bạn bỏ lỡ 1 ngày</li>
            <li>• Xu có thể dùng để đổi voucher giảm giá</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

