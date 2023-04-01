import CartHeader from 'src/components/CartHeader'
import Footer from 'src/components/Footer'
import UserSideNav from '../../components/UserSideNav'
import { Outlet } from 'react-router-dom'

interface Props {
  children?: React.ReactNode
}

const UserLayout = ({ children }: Props) => {
  return (
    <div className='border-b-[4px] border-b-[#ee4d2d] bg-black/5 pt-[1.25rem] pb-[3.125rem] text-sm text-gray-600'>
      <div className='container'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
          {/* sideNav */}
          <div className='md:col-span-3 lg:col-span-2'>
            <UserSideNav />
          </div>
          {/* Profile, password, history */}
          <div className='ml-[1.6875rem] md:col-span-9 lg:col-span-10'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLayout
