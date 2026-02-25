import { Link } from 'react-router-dom'
import Popover from 'src/components/Popover'
import { getAvatarUrl } from 'src/utils/utils'
import path from 'src/constant/path'
import classNames from 'classnames'

interface UserMenuProps {
  isAuthenticated: boolean
  profile: { avatar?: string; email?: string } | null
  onLogout: () => void
}

const UserMenu = ({ isAuthenticated, profile, onLogout }: UserMenuProps) => {
  return (
    <div className='flex-shrink-0 md:col-span-1 flex items-center justify-end space-x-2 md:space-x-3'>
      {/* User Menu - Hiện trên mobile */}
      {isAuthenticated && (
        <Popover
          className='md:hidden'
          placement='bottom-end'
          renderPopover={
            <div className='relative rounded-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md transition-all'>
              <div
                className={classNames(
                  'before:absolute before:top-0 before:right-4 before:h-[15px] before:w-full before:translate-y-[-100%] before:bg-transparent before:content-[""]'
                )}
              >
                <Link
                  to={path.profile}
                  className='block w-full bg-white dark:bg-slate-800 py-3 px-4 text-left hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-cyan-500 text-sm text-gray-800 dark:text-gray-200'
                >
                  Tài Khoản Của Tôi
                </Link>
                <Link
                  to={path.historyPurchases}
                  className='block w-full bg-white dark:bg-slate-800 py-3 px-4 text-left hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-cyan-500 text-sm text-gray-800 dark:text-gray-200'
                >
                  Đơn Mua
                </Link>
                <button
                  onClick={() => onLogout()}
                  className='block w-full bg-white dark:bg-slate-800 py-3 px-4 text-left hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-cyan-500 text-sm text-gray-800 dark:text-gray-200'
                >
                  Đăng Xuất
                </button>
              </div>
            </div>
          }
        >
          <div className='flex items-center cursor-pointer'>
            <div className='h-7 w-7 flex-shrink-0'>
              <img
                src={getAvatarUrl(profile?.avatar)}
                alt='avatar'
                className='h-full w-full rounded-full object-cover'
              />
            </div>
          </div>
        </Popover>
      )}

      {/* Login/Register - Hiện trên mobile khi chưa login */}
      {!isAuthenticated && (
        <div className='flex items-center text-xs md:hidden'>
          <Link to={path.login} className='hover:text-white/70'>
            Đăng nhập
          </Link>
        </div>
      )}
    </div>
  )
}

export default UserMenu

