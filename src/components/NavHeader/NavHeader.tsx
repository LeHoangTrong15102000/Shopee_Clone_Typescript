import classNames from 'classnames'
import Popover from '../Popover'
import path from 'src/constant/path'
import { Link, createSearchParams, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import authApi from 'src/apis/auth.api'
import { toast } from 'react-toastify'
import { purchasesStatus } from 'src/constant/purchase'

const NavHeader = () => {
  const { setIsAuthenticated, isAuthenticated, profile, setProfile } = useContext(AppContext)
  const queryClient = useQueryClient()

  // useMutation để logout
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logoutAccount(),
    onSuccess: () => {
      setIsAuthenticated(false) // khi là false thì nó sẽ đá mình về trang /login
      setProfile(null)
      toast.success('Đăng xuất thành công', { autoClose: 1000 })
      // navigate('/login')
      queryClient.removeQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }], exact: true })
    }
  })

  // func logout, phải sử dụng pthuc mutate
  const handleLogout = () => {
    logoutMutation.mutate()
  }
  return (
    <div className='flex items-center justify-end'>
      {/* Tải ứng dụng, Social kết nối, kênh người bán */}
      {/* Phiên Âm tiếng Việt, Hỗ trợ, Thông báo, Avatar */}
      <Popover
        as='span'
        className={classNames('flex cursor-pointer items-center py-1 hover:text-white/70')}
        renderPopover={
          <div className='relative h-[21.875rem] w-[400px] cursor-pointer rounded-sm border border-gray-200 bg-white text-sm text-[rgba(0,0,0,.7)] shadow-md'>
            {/* flex cha, không nên để items-center ở thằng cha vì nó sẽ làm căng giữa ở thằng cha */}
            <div className='flex h-full flex-col'>
              {/* Thông báo sản phẩm, flex grow để cho nó bự tối đa */}
              <div className='flex flex-grow flex-col items-center justify-center'>
                <div className='flex items-center'>
                  <img
                    className='h-[6.25rem] w-[6.25rem] object-cover'
                    src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/99e561e3944805a023e87a81d4869600.png'
                    alt='anh'
                  />
                </div>
                <span className='mt-5'>Đăng nhập để xem Thông báo</span>
              </div>
              {/* button đăng ký & đăng nhập */}
              <div className='flex w-full items-center border-0'>
                <Link
                  to={path.register}
                  className='h-[2.5rem] w-[50%] bg-[rgba(0,0,0,0.04)] p-2 text-center hover:bg-[#e8e8e8] hover:text-[#ee4d2d]'
                >
                  Đăng ký
                </Link>
                <Link
                  to={path.login}
                  className='h-[2.5rem] w-[50%] bg-[rgba(0,0,0,0.04)] p-2 text-center hover:bg-[#e8e8e8] hover:text-[#ee4d2d] '
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        }
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-[22px] w-[22px]'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0'
          />
        </svg>

        <span className='mx-1 text-sm capitalize'>Thông báo</span>
      </Popover>
      <Link to={path.login} className='mt-[1px]'>
        <div className='mr-3 flex cursor-pointer items-center py-1 hover:text-white/70'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-[22px] w-[22px]'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z'
            />
          </svg>
          <span className='mx-1 text-sm capitalize'>Hỗ trợ</span>
        </div>
      </Link>
      <Popover
        as='span'
        className={classNames('flex cursor-pointer items-center py-1 hover:text-white/70')}
        renderPopover={
          <div className='relative rounded-sm border border-gray-200 bg-white shadow-md'>
            <div className='flex flex-col py-2 pr-28 pl-2'>
              <button className='py-2 px-1 hover:text-orange'>Tiếng Việt</button>
              <button className='py-2 px-1 text-left hover:text-orange'>English</button>
            </div>
          </div>
        }
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-5 w-5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418'
          />
        </svg>
        <span className='mx-1 text-sm'>Tiếng Việt</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-5 w-5'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' />
        </svg>
      </Popover>
      {/* <div
    className='flex cursor-pointer items-center py-1 hover:text-white/70'
    ref={reference}
    onMouseEnter={showPopover}
    onMouseLeave={hidePopover}
  >
    <FloatingPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={floating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content',
              transformOrigin: `${middlewareData.arrow?.x}px top`
            }}
            initial={{ opacity: 0, transform: 'scale(0)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            exit={{ opacity: 0, transform: 'scale(0)' }}
            transition={{ duration: 0.2 }}
          >
            <span
              ref={arrowRef}
              className='absolute z-[1] translate-y-[-95%] border-[11px] border-x-transparent border-t-transparent border-b-white'
              style={{
                left: middlewareData.arrow?.x,
                top: middlewareData.arrow?.y
              }}
            ></span>
            <div className='relative rounded-sm border border-gray-200 bg-white shadow-md'>
              <div className='flex flex-col py-2 px-3'>
                <button className='py-2 px-2 hover:text-orange'>Tiếng Việt</button>
                <button className='py-2 px-2 hover:text-orange'>English</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FloatingPortal>
  </div> */}
      {/* Avatar và tên người dùng */}
      {isAuthenticated && (
        <Popover
          as='span'
          renderPopover={
            <div className='relative rounded-sm border border-gray-200 shadow-md'>
              <Link
                to={path.profile}
                className='block w-full bg-white py-3 px-4 text-left hover:bg-slate-100 hover:text-cyan-500'
              >
                Tài Khoản Của Tôi
              </Link>
              <Link
                to={path.home}
                className='block w-full bg-white py-3 px-4 text-left hover:bg-slate-100 hover:text-cyan-500'
              >
                Đơn Mua
              </Link>
              <button
                onClick={() => handleLogout()}
                className='block w-full bg-white py-3 px-4 text-left hover:bg-slate-100 hover:text-cyan-500'
              >
                Đăng Xuất
              </button>
            </div>
          }
          className={classNames('ml-5 flex cursor-pointer items-center py-1 hover:text-white/70')}
        >
          <div className='mr-2 h-6 w-6 flex-shrink-0'>
            <img
              src='https://cf.shopee.vn/file/b34a1e6b65aaa8ba6474c7886dc59df2_tn'
              alt='avatar'
              className='h-full w-full rounded-full object-cover'
            />
          </div>
          <span className='text-sm'>{profile?.email}</span>
        </Popover>
      )}
      {!isAuthenticated && (
        <div className='mt-[1.5px] flex items-center text-[14px]'>
          <Link to={path.register} className='mx-3 capitalize hover:text-white/70'>
            Đăng ký
          </Link>
          <div className='h-4 border-r-[1px] border-r-white/40'></div>
          <Link to={path.login} className='mx-3 capitalize hover:text-white/70'>
            Đăng nhập
          </Link>
        </div>
      )}
      {/* <div className='ml-6 flex cursor-pointer items-center py-1 hover:text-white/70'>
    <div className='mr-2 h-6 w-6 flex-shrink-0'>
      <img
        src='https://cf.shopee.vn/file/d04ea22afab6e6d250a370d7ccc2e675_tn'
        alt='avatar'
        className='h-full w-full rounded-full object-cover'
      />
    </div>
    <span className='text-sm'>HoangTrong</span>
  </div> */}
    </div>
  )
}

export default NavHeader
