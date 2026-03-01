import { Helmet } from 'react-helmet-async'
import FollowedSellers from 'src/components/FollowedSellers'

export default function FollowedShopsPage() {
  return (
    <div className='rounded-xs bg-white px-2 pb-10 shadow-sm md:px-7 md:pb-20 dark:bg-slate-800'>
      <Helmet>
        <title>Shop đang theo dõi | Shopee Clone</title>
        <meta name='description' content='Danh sách các shop bạn đang theo dõi' />
      </Helmet>

      <div className='border-b border-b-gray-200 py-6 dark:border-b-slate-600'>
        <h1 className='text-lg font-medium text-gray-900 capitalize dark:text-gray-100'>Shop đang theo dõi</h1>
        <div className='mt-1 text-sm text-gray-700 dark:text-gray-300'>Quản lý danh sách các shop bạn yêu thích</div>
      </div>

      <div className='mt-8'>
        <FollowedSellers maxDisplay={50} showClearAll={true} className='shadow-none' />
      </div>
    </div>
  )
}
