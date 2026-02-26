import UserSideNav from '../../components/UserSideNav'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  return (
    <div className='border-b-[4px] border-b-[#ee4d2d] bg-black/5 dark:bg-slate-900 pt-0 md:pt-[1.25rem] pb-[3.125rem] text-sm text-gray-600 dark:text-gray-400'>
      <div className='container'>
        <div className='grid grid-cols-1 gap-0 md:gap-6 md:grid-cols-12'>
          {/* sideNav */}
          <div className='md:col-span-3 lg:col-span-2'>
            <UserSideNav />
          </div>
          {/* Profile, password, history */}
          <div className='md:ml-4 lg:ml-[1.6875rem] md:col-span-9 lg:col-span-10'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLayout
