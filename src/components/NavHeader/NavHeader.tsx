import classNames from 'classnames'
import Popover from '../Popover'
import path from 'src/constant/path'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import authApi from 'src/apis/auth.api'
import { toast } from 'react-toastify'
import { purchasesStatus } from 'src/constant/purchase'

import { getAvatarUrl } from 'src/utils/utils'
import { useTranslation } from 'react-i18next'
import { locales } from 'src/i18n/i18n'
import NotificationList from '../NotificationList'
import notificationApi from 'src/apis/notification.api'

const NavHeader = () => {
  const { i18n } = useTranslation() // import hook useTranslation
  const currentLanguage = locales[i18n.language as keyof typeof locales]
  const { setIsAuthenticated, isAuthenticated, profile, setProfile } = useContext(AppContext)
  const queryClient = useQueryClient()

  // Query để lấy thông báo (chỉ khi đã đăng nhập)
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000 // 5 phút
  })

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

  // Khai báo function để translate ngôn ngữ\
  const handleTranslateLanguage = (lng: 'en' | 'vi') => {
    i18n.changeLanguage(lng) // hàm changeLanguage của i18next
    // location.reload()
    // khi mà change thì sẽ cho reload
    // lng chính là cái key 'vi' hoặc là 'vi'
  }

  // Lấy số thông báo chưa đọc
  const unreadCount = notificationsData?.data.data.unreadCount || 0
  return (
    <div className='flex items-center justify-between'>
      {/* Tải ứng dụng, Social kết nối, kênh người bán */}
      {isAuthenticated ? (
        <div className='flex items-center justify-center'>
          {/* Kênh người bán - Ẩn trên mobile */}
          <Link to='https://banhang.shopee.vn/' className='ml-2 hidden lg:block'>
            <div className='mr-3 flex cursor-pointer items-center py-1 hover:text-white/70'>
              <span className='mx-1 text-sm capitalize'>Kênh người bán</span>
            </div>
          </Link>
          <div className='h-4 border-r-[1px] border-r-white/40 hidden lg:block'></div>
          {/* Tải ứng dụng - Ẩn trên mobile */}
          <Popover
            as='span'
            enableArrow={false}
            placement='bottom-start'
            className='mx-2 flex cursor-pointer items-center py-1 hover:text-white/70 hidden lg:flex'
            renderPopover={
              <div className='relative cursor-pointer rounded-sm border border-gray-200 bg-white text-sm text-[rgba(0,0,0,.7)] shadow-md transition-all'>
                <div
                  className={classNames(
                    'after:absolute after:top-0 after:left-0 after:h-[13px] after:w-full after:translate-y-[-100%] after:bg-transparent after:content-[""]'
                  )}
                >
                  <img
                    src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/d91264e165ed6facc6178994d5afae79.png'
                    alt='QR_Shopee'
                    className='h-[11.25rem] w-[11.25rem] overflow-clip'
                  />
                </div>
                <div className='flex h-[54.5px] w-[180px] flex-wrap items-center justify-between px-[15px] pb-[5px]'>
                  {/* 3 thẻ div */}
                  <div className='mt-[0.3125rem] w-[4.375rem]'>
                    <img
                      src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/39f189e19764dab688d3850742f13718.png'
                      alt='Logo_AppStore'
                    />
                  </div>
                  <div className='mt-[0.3125rem] w-[4.375rem]'>
                    <img
                      src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/f4f5426ce757aea491dce94201560583.png'
                      alt='Logo_CHPlay'
                    />
                  </div>
                  <div className='mt-[0.3125rem] w-[4.375rem]'>
                    <img
                      src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/1ae215920a31f2fc75b00d4ee9ae8551.png'
                      alt='Logo_AppGallery'
                    />
                  </div>
                </div>
              </div>
            }
          >
            <span className='mx-1 text-sm capitalize'>Tải ứng dụng</span>
          </Popover>
          <div className='h-4 border-r-[1px] border-r-white/40 hidden lg:block'></div>
          {/* Kết nối - Ẩn trên mobile */}
          <div className='ml-2 flex items-center py-1 hover:text-white/70 hidden lg:flex'>
            <span className='mx-1 text-sm capitalize'>Kết nối</span>
          </div>
          {/* facebook, intargram - Ẩn trên mobile */}
          <div className='flex items-center justify-center hidden lg:flex'>
            <Link
              to='https://www.facebook.com/ShopeeVN'
              className='mr-2 h-[16px] w-[16px] overflow-hidden text-center indent-[-9999px]'
            >
              <div
                style={{
                  backgroundImage:
                    'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/cab134ca96b0829b591cfaff892ae62c.png)',
                  backgroundSize: '487.5% 293.75%',
                  backgroundPosition: '8.064516129032258% 16.129032258064516%',
                  width: '16px',
                  height: '16px'
                }}
              ></div>
            </Link>
            <Link to='https://instagram.com/Shopee_VN' className='mr-2 overflow-hidden text-center indent-[-9999px]'>
              <div
                style={{
                  backgroundImage:
                    'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/cab134ca96b0829b591cfaff892ae62c.png)',
                  backgroundSize: '487.5% 293.75%',
                  backgroundPosition: '58.064516129032256% 16.129032258064516%',
                  width: '16px',
                  height: '16px'
                }}
              ></div>
            </Link>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-center'>
          {/* Kênh người bán - Ẩn trên mobile */}
          <Link to='https://banhang.shopee.vn/' className='ml-2 mr-2 hidden lg:block'>
            <div className='flex cursor-pointer items-center py-1 hover:text-white/70'>
              <span className='mx-1 text-sm capitalize'>Kênh người bán</span>
            </div>
          </Link>
          <div className='h-4 border-r-[1px] border-r-white/40 hidden lg:block'></div>
          {/* Trở thành người bán shopee - Ẩn trên mobile */}
          <Link to='https://shopee.vn/seller/signup' className='ml-1 mr-2 hidden lg:block'>
            <div className='flex cursor-pointer items-center py-1 hover:text-white/70'>
              <span className='mx-1 text-sm capitalize'>Trở thành người bán shopee</span>
            </div>
          </Link>
          <div className='h-4 border-r-[1px] border-r-white/40 hidden lg:block'></div>
          {/* Tải ứng dụng - Ẩn trên mobile */}
          <Popover
            as='span'
            enableArrow={false}
            placement='bottom-start'
            className='mx-2 flex cursor-pointer items-center py-1 hover:text-white/70 hidden lg:flex'
            renderPopover={
              <div className='relative cursor-pointer rounded-sm border border-gray-200 bg-white text-sm text-[rgba(0,0,0,.7)] shadow-md transition-all'>
                <div
                  className={classNames(
                    'after:absolute after:top-0 after:left-0 after:h-[13px] after:w-full after:translate-y-[-100%] after:bg-transparent after:content-[""]'
                  )}
                >
                  <img
                    src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/d91264e165ed6facc6178994d5afae79.png'
                    alt='QR_Shopee'
                    className='h-[11.25rem] w-[11.25rem] overflow-clip'
                  />
                </div>
                <div className='flex h-[54.5px] w-[180px] flex-wrap items-center justify-between px-[15px] pb-[5px]'>
                  {/* 3 thẻ div */}
                  <div className='mt-[0.3125rem] w-[4.375rem]'>
                    <img
                      src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/39f189e19764dab688d3850742f13718.png'
                      alt='Logo_AppStore'
                    />
                  </div>
                  <div className='mt-[0.3125rem] w-[4.375rem]'>
                    <img
                      src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/f4f5426ce757aea491dce94201560583.png'
                      alt='Logo_CHPlay'
                    />
                  </div>
                  <div className='mt-[0.3125rem] w-[4.375rem]'>
                    <img
                      src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/1ae215920a31f2fc75b00d4ee9ae8551.png'
                      alt='Logo_AppGallery'
                    />
                  </div>
                </div>
              </div>
            }
          >
            <span className='mx-1 text-sm capitalize'>Tải ứng dụng</span>
          </Popover>
          <div className='h-4 border-r-[1px] border-r-white/40 hidden lg:block'></div>
          {/* Kết nối - Ẩn trên mobile */}
          <div className='ml-2 flex items-center py-1 hover:text-white/70 hidden lg:flex'>
            <span className='mx-1 text-sm capitalize'>Kết nối</span>
          </div>
          {/* facebook, intargram - Ẩn trên mobile */}
          <div className='flex items-center justify-center hidden lg:flex'>
            <Link
              to='https://www.facebook.com/ShopeeVN'
              className='mr-2 h-[16px] w-[16px] overflow-hidden text-center indent-[-9999px]'
            >
              <div
                style={{
                  backgroundImage:
                    'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/cab134ca96b0829b591cfaff892ae62c.png)',
                  backgroundSize: '487.5% 293.75%',
                  backgroundPosition: '8.064516129032258% 16.129032258064516%',
                  width: '16px',
                  height: '16px'
                }}
              ></div>
            </Link>
            <Link to='https://instagram.com/Shopee_VN' className='mr-2 overflow-hidden text-center indent-[-9999px]'>
              <div
                style={{
                  backgroundImage:
                    'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/cab134ca96b0829b591cfaff892ae62c.png)',
                  backgroundSize: '487.5% 293.75%',
                  backgroundPosition: '58.064516129032256% 16.129032258064516%',
                  width: '16px',
                  height: '16px'
                }}
              ></div>
            </Link>
          </div>
        </div>
      )}
      {/* Thông báo, hỗ trợ, thông tin tài khoản */}
      <div className='flex items-center justify-center'>
        {/* Phiên Âm tiếng Việt, Hỗ trợ, Thông báo, Avatar */}
        <Popover
          as='span'
          className={classNames('flex cursor-pointer items-center py-1 hover:text-white/70 relative')}
          renderPopover={
            isAuthenticated ? (
              <div className='before:absolute before:left-0 before:top-0 before:h-[15px] before:w-full before:translate-y-[-100%] before:bg-transparent before:content-[""]'>
                <NotificationList />
              </div>
            ) : (
              <div className='relative h-[21.875rem] w-[300px] md:w-[400px] cursor-pointer rounded-sm border border-gray-200 bg-white text-sm text-[rgba(0,0,0,.7)] shadow-md transition-all'>
                {/* flex cha, không nên để items-center ở thằng cha vì nó sẽ làm căng giữa ở thằng cha */}
                <div
                  className={classNames(
                    'flex h-full flex-col before:absolute before:left-0 before:top-0 before:h-[15px] before:w-full before:translate-y-[-100%] before:bg-transparent before:content-[""]'
                  )}
                >
                  {/* Thông báo sản phẩm, flex grow để cho nó bự tối đa */}
                  <div className='flex flex-grow flex-col items-center justify-center'>
                    <div className='flex items-center'>
                      <img
                        className='h-[5rem] w-[5rem] md:h-[6.25rem] md:w-[6.25rem] object-cover'
                        src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/99e561e3944805a023e87a81d4869600.png'
                        alt='anh'
                      />
                    </div>
                    <span className='mt-5 text-xs md:text-sm'>Đăng nhập để xem Thông báo</span>
                  </div>
                  {/* button đăng ký & đăng nhập */}
                  <div className='flex w-full items-center border-0'>
                    <Link
                      to={path.register}
                      className='h-[2.5rem] w-[50%] bg-[rgba(0,0,0,0.04)] p-2 text-center text-xs md:text-sm hover:bg-[#e8e8e8] hover:text-[#ee4d2d]'
                    >
                      Đăng ký
                    </Link>
                    <Link
                      to={path.login}
                      className='h-[2.5rem] w-[50%] bg-[rgba(0,0,0,0.04)] p-2 text-center text-xs md:text-sm hover:bg-[#e8e8e8] hover:text-[#ee4d2d] '
                    >
                      Đăng nhập
                    </Link>
                  </div>
                </div>
              </div>
            )
          }
        >
          <div className='relative'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className={`h-[18px] w-[18px] md:h-[22px] md:w-[22px] transition-transform duration-200 ${
                isAuthenticated && unreadCount > 0 ? 'animate-[bell-shake_1s_ease-in-out_infinite]' : ''
              }`}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0'
              />
            </svg>
            {/* Badge hiển thị số thông báo chưa đọc */}
            {isAuthenticated && unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 flex h-3 w-3 md:h-4 md:w-4 items-center justify-center rounded-full bg-white text-[10px] md:text-xs text-[#ee4d2d] font-medium border border-[#ee4d2d]'>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          <span className='mx-1 text-xs md:text-sm capitalize hidden md:inline'>Thông báo</span>
        </Popover>
        {/* Hỗ trợ - Ẩn text trên mobile */}
        <Link to={path.login} className='mt-[1px] hidden md:block'>
          <div className='mr-3 flex cursor-pointer items-center py-1 hover:text-white/70'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-[18px] w-[18px] md:h-[22px] md:w-[22px]'
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
        {/* Language - Responsive */}
        <Popover
          as='span'
          className={classNames('flex cursor-pointer items-center py-1 hover:text-white/70')}
          renderPopover={
            <div className='relative rounded-sm border border-gray-200 bg-white shadow-md transition-all'>
              <div
                className={classNames(
                  'flex flex-col py-2 pr-20 md:pr-28 pl-2 before:absolute before:top-0 before:left-0 before:h-[13px] before:w-full before:translate-y-[-100%] before:bg-transparent before:content-[""]'
                )}
              >
                <button
                  onClick={() => handleTranslateLanguage('vi')}
                  className='py-2 px-1 hover:text-orange text-xs md:text-sm'
                >
                  Tiếng Việt
                </button>
                <button
                  onClick={() => handleTranslateLanguage('en')}
                  className='py-2 px-1 text-left hover:text-orange text-xs md:text-sm'
                >
                  English
                </button>
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
            className='h-4 w-4 md:h-5 md:w-5'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418'
            />
          </svg>
          <span className='mx-1 text-xs md:text-sm hidden md:inline'>{currentLanguage}</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-3 w-3 md:h-5 md:w-5'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' />
          </svg>
        </Popover>
        {/* Avatar và tên người dùng */}
        {isAuthenticated && (
          <Popover
            as='span'
            placement='bottom-start'
            renderPopover={
              <div className='relative rounded-sm border border-gray-200 shadow-md transition-all'>
                <div
                  className={classNames(
                    'before:absolute before:top-0 before:left-0 before:h-[15px] before:w-full before:translate-y-[-100%] before:bg-transparent before:content-[""]'
                  )}
                >
                  <Link
                    to={path.profile}
                    className='block w-full bg-white py-3 px-4 text-left hover:bg-slate-100 hover:text-cyan-500 text-xs md:text-sm'
                  >
                    Tài Khoản Của Tôi
                  </Link>
                  <Link
                    to={path.historyPurchases}
                    className='block w-full bg-white py-3 px-4 text-left hover:bg-slate-100 hover:text-cyan-500 text-xs md:text-sm'
                  >
                    Đơn Mua
                  </Link>
                  <button
                    onClick={() => handleLogout()}
                    className='block w-full bg-white py-3 px-4 text-left hover:bg-slate-100 hover:text-cyan-500 text-xs md:text-sm'
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            }
            className={classNames('ml-2 md:ml-5 flex cursor-pointer items-center py-1 hover:text-white/70')}
          >
            <div className='mr-1 md:mr-2 h-5 w-5 md:h-6 md:w-6 flex-shrink-0'>
              <img
                src={getAvatarUrl(profile?.avatar)}
                alt='avatar'
                className='h-full w-full rounded-full object-cover'
              />
            </div>
            <span className='text-sm'>{profile?.email}</span>
          </Popover>
        )}
        {!isAuthenticated && (
          <div className='mt-[1.5px] flex items-center text-[12px] md:text-[14px]'>
            <Link to={path.register} className='mx-2 md:mx-3 capitalize hover:text-white/70'>
              Đăng ký
            </Link>
            <div className='h-4 border-r-[1px] border-r-white/40'></div>
            <Link to={path.login} className='mx-2 md:mx-3 capitalize hover:text-white/70'>
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default NavHeader
