import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useCallback, useContext, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import path from 'src/constant/path'
import { AppContext } from 'src/contexts/app.context'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { getAvatarUrl } from 'src/utils/utils'

// Mobile tab navigation items with icons
const mobileNavItems = [
  {
    to: path.profile,
    label: 'Tài khoản',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' />
      </svg>
    )
  },
  {
    to: path.changePassword,
    label: 'Mật khẩu',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' />
      </svg>
    )
  },
  {
    to: path.historyPurchases,
    label: 'Đơn mua',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' />
      </svg>
    )
  },
  {
    to: path.orderList,
    label: 'Đơn hàng',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z' />
      </svg>
    )
  },
  {
    to: path.dailyCheckIn,
    label: 'Điểm danh',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z' />
      </svg>
    )
  },
  {
    to: path.followedShops,
    label: 'Shop',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z' />
      </svg>
    )
  },
  {
    to: path.addressBook,
    label: 'Địa chỉ',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z' />
        <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' />
      </svg>
    )
  },
  {
    to: path.notifications,
    label: 'Thông báo',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' />
      </svg>
    )
  }
]

const UserSideNav = () => {
  const { profile } = useContext(AppContext)
  const reducedMotion = useReducedMotion()
  const mobileNavRef = useRef<HTMLDivElement>(null)

  // Auto-scroll active item into view on mount
  useEffect(() => {
    const container = mobileNavRef.current
    if (!container) return
    const activeEl = container.querySelector('.text-\\[\\#ee4d2d\\]') as HTMLElement | null
    if (activeEl) {
      const containerRect = container.getBoundingClientRect()
      const activeRect = activeEl.getBoundingClientRect()
      const scrollLeft = activeRect.left - containerRect.left - containerRect.width / 2 + activeRect.width / 2
      container.scrollTo({ left: container.scrollLeft + scrollLeft, behavior: reducedMotion ? 'auto' : 'smooth' })
    }
  }, [reducedMotion])

  // Handle scroll to show/hide fade gradients
  const handleMobileNavScroll = useCallback(() => {
    const container = mobileNavRef.current
    if (!container) return
    const leftFade = document.getElementById('mobile-nav-fade-left')
    const rightFade = document.getElementById('mobile-nav-fade-right')
    if (leftFade) leftFade.style.opacity = container.scrollLeft > 10 ? '1' : '0'
    if (rightFade) rightFade.style.opacity = container.scrollLeft < container.scrollWidth - container.clientWidth - 10 ? '1' : '0'
  }, [])

  // Initialize fade gradients on mount
  useEffect(() => {
    handleMobileNavScroll()
  }, [handleMobileNavScroll])

  return (
    <div>
      {/* Mobile horizontal icon+label tab bar */}
      <div className='md:hidden -mx-4 mb-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative'>
        {/* Left fade gradient */}
        <div
          className='pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-white dark:from-slate-900 to-transparent transition-opacity duration-200'
          style={{ opacity: 0 }}
          id='mobile-nav-fade-left'
        />
        {/* Scroll container */}
        <div
          ref={mobileNavRef}
          role='tablist'
          aria-label='Menu tài khoản'
          className='flex overflow-x-auto scrollbar-hide py-1 px-2'
          onScroll={handleMobileNavScroll}
        >
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              role='tab'
              className={({ isActive }) =>
                classNames(
                  'flex-shrink-0 flex flex-col items-center justify-center w-16 min-h-[56px] py-2 px-1 relative transition-colors duration-200',
                  {
                    'text-[#ee4d2d] dark:text-orange-400': isActive,
                    'text-gray-500 dark:text-gray-400': !isActive
                  }
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span aria-hidden='true'>{item.icon}</span>
                  <span className='text-[11px] leading-tight mt-1 whitespace-nowrap font-medium'>{item.label}</span>
                  {isActive && !reducedMotion && (
                    <motion.div
                      layoutId='mobileActiveTab'
                      className='absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#ee4d2d] dark:bg-orange-400'
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && reducedMotion && (
                    <div className='absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#ee4d2d] dark:bg-orange-400' />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        {/* Right fade gradient */}
        <div
          className='pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-white dark:from-slate-900 to-transparent transition-opacity duration-200'
          id='mobile-nav-fade-right'
        />
      </div>

      {/* Desktop sidebar - hidden on mobile */}
      <div className='hidden md:block'>
      {/* Avatar */}
      <div className='flex items-center border-b border-b-gray-200 dark:border-b-slate-700 py-4'>
        {/* Avatar */}
        <Link to={path.profile} className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-slate-600'>
          <img
            // src='https://down-vn.img.susercontent.com/file/b34a1e6b65aaa8ba6474c7886dc59df2_tn'
            src={getAvatarUrl(profile?.avatar)}
            alt='avatar_profile'
            className='h-full w-full object-cover'
          />
        </Link>
        {/* Tên user, mục: sửa hồ sơ */}
        <div className='flex-grow pl-[14px]'>
          <div className='mb-1 truncate font-semibold text-gray-600 dark:text-gray-300'>{profile?.name}</div>
          <Link to={path.profile} className='flex items-center bg-transparent capitalize'>
            {/* Icon */}
            <svg width={12} height={12} viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg' className='mr-1 text-gray-400 dark:text-gray-500'>
              <path
                d='M8.54 0L6.987 1.56l3.46 3.48L12 3.48M0 8.52l.073 3.428L3.46 12l6.21-6.18-3.46-3.48'
                fill='currentColor'
                fillRule='evenodd'
              />
            </svg>
            {/* Title Sửa hồ sơ */}
            <span className='capitalize text-[#888] dark:text-gray-400'>Sửa hồ sơ</span>
          </Link>
        </div>
      </div>
      {/* Link chứa profile, password, historyPurchases */}
      <div className='mt-7 ml-2'>
        {/* Sale 4.4 */}
        <Link to={path.profile} className='mb-[0.9375rem] flex items-center justify-start capitalize transition-colors'>
          <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
            <img
              src='https://down-vn.img.susercontent.com/file/sg-11134004-7qvfe-lezlew2dqrn784'
              alt='Avatar'
              className='h-6 w-6'
            />
          </div>
          <span className='relative flex items-center font-medium capitalize leading-tight'>
            <span>Ngày 15 sale giữa tháng</span>
            {/* <span className='ml-2 rounded-tl-2xl rounded-tr-3xl rounded-br-3xl bg-[#ee4d2d] p-1 text-[9px] text-white'>
              New
            </span> */}
            <span className='absolute top-[17px] left-[43px]'>
              <svg width='32' height='18' viewBox='0 0 32 18' fill='none'>
                <path
                  d='M1 9C1 4.58172 4.58172 1 9 1H23C27.4183 1 31 4.58172 31 9C31 13.4183 27.4183 17 23 17H1V9Z'
                  fill='#EE4D2D'
                ></path>
                <path
                  d='M12.4111 12H11.1758L8.00684 6.95605V12H6.77148V4.89062H8.00684L11.1855 9.9541V4.89062H12.4111V12ZM16.083 12.0977C15.3311 12.0977 14.7207 11.8617 14.252 11.3896C13.7865 10.9144 13.5537 10.2829 13.5537 9.49512V9.34863C13.5537 8.82129 13.6546 8.35091 13.8564 7.9375C14.0615 7.52083 14.348 7.19694 14.7158 6.96582C15.0837 6.7347 15.4938 6.61914 15.9463 6.61914C16.6657 6.61914 17.2207 6.84863 17.6113 7.30762C18.0052 7.7666 18.2021 8.41602 18.2021 9.25586V9.73438H14.75C14.7858 10.1706 14.9307 10.5156 15.1846 10.7695C15.4417 11.0234 15.764 11.1504 16.1514 11.1504C16.695 11.1504 17.1377 10.9307 17.4795 10.4912L18.1191 11.1016C17.9076 11.4173 17.6243 11.6631 17.2695 11.8389C16.918 12.0114 16.5225 12.0977 16.083 12.0977ZM15.9414 7.57129C15.6159 7.57129 15.3522 7.68522 15.1504 7.91309C14.9518 8.14095 14.8249 8.45833 14.7695 8.86523H17.0303V8.77734C17.0042 8.38021 16.8984 8.08073 16.7129 7.87891C16.5273 7.67383 16.2702 7.57129 15.9414 7.57129ZM23.7686 10.3643L24.6084 6.7168H25.7656L24.3252 12H23.3486L22.2158 8.37207L21.1025 12H20.126L18.6807 6.7168H19.8379L20.6924 10.3252L21.7764 6.7168H22.6699L23.7686 10.3643Z'
                  fill='white'
                ></path>
                <path
                  d='M1 17H0V18H1V17ZM9 2H23V0H9V2ZM23 16H1V18H23V16ZM2 17V9H0V17H2ZM30 9C30 12.866 26.866 16 23 16V18C27.9706 18 32 13.9706 32 9H30ZM23 2C26.866 2 30 5.13401 30 9H32C32 4.02944 27.9706 0 23 0V2ZM9 0C4.02944 0 0 4.02944 0 9H2C2 5.13401 5.13401 2 9 2V0Z'
                  fill='white'
                ></path>
              </svg>
            </span>
          </span>
        </Link>
        {/* Thông tin cá nhân */}
        <NavLink
          to={path.profile}
          className={({ isActive }) =>
            classNames('relative mb-[0.9375rem] flex items-center justify-start capitalize transition-colors', {
              'text-[#ee4d2d]': isActive,
              'text-gray-600 dark:text-gray-300': !isActive
            })
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !reducedMotion && (
                <motion.div
                  layoutId='activeNavIndicator'
                  className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && reducedMotion && (
                <div className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5' />
              )}
              <div className='relative z-10 flex items-center'>
                <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
                  <img
                    src='https://down-vn.img.susercontent.com/file/ba61750a46794d8847c3f463c5e71cc4'
                    alt='Avatar'
                    className='h-6 w-6'
                  />
                </div>
                <span className='font-medium capitalize'>Tài khoản của tôi</span>
              </div>
            </>
          )}
        </NavLink>
        {/* Đổi mật khẩu */}
        <NavLink
          to={path.changePassword}
          className={({ isActive }) =>
            classNames('relative mb-[0.9375rem] mt-4 flex items-center justify-start capitalize transition-colors', {
              'text-[#ee4d2d]': isActive,
              'text-gray-600 dark:text-gray-300': !isActive
            })
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !reducedMotion && (
                <motion.div
                  layoutId='activeNavIndicator'
                  className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && reducedMotion && (
                <div className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5' />
              )}
              <div className='relative z-10 flex items-center'>
                <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-6 w-6 text-blue-500'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z'
                    />
                  </svg>
                </div>
                <span className='font-medium capitalize'>Đổi mật khẩu</span>
              </div>
            </>
          )}
        </NavLink>
        {/* Đơn mua */}
        <NavLink
          to={path.historyPurchases}
          className={({ isActive }) =>
            classNames('relative mb-[0.9375rem] mt-4 flex items-center justify-start capitalize transition-colors', {
              'text-[#ee4d2d]': isActive,
              'text-gray-600 dark:text-gray-300': !isActive
            })
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !reducedMotion && (
                <motion.div
                  layoutId='activeNavIndicator'
                  className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && reducedMotion && (
                <div className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5' />
              )}
              <div className='relative z-10 flex items-center'>
                <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
                  <img
                    src='https://down-vn.img.susercontent.com/file/f0049e9df4e536bc3e7f140d071e9078'
                    alt='Avatar'
                    className='h-6 w-6'
                  />
                </div>
                <span className='font-medium capitalize'>Đơn mua</span>
              </div>
            </>
          )}
        </NavLink>
        {/* Đơn hàng */}
        <NavLink
          to={path.orderList}
          className={({ isActive }) =>
            classNames('relative mb-[0.9375rem] mt-4 flex items-center justify-start capitalize transition-colors', {
              'text-[#ee4d2d]': isActive,
              'text-gray-600 dark:text-gray-300': !isActive
            })
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !reducedMotion && (
                <motion.div
                  layoutId='activeNavIndicator'
                  className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && reducedMotion && (
                <div className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5' />
              )}
              <div className='relative z-10 flex items-center'>
                <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-6 w-6 text-blue-500'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z'
                    />
                  </svg>
                </div>
                <span className='font-medium capitalize'>Đơn hàng</span>
              </div>
            </>
          )}
        </NavLink>
        {/* Điểm danh hàng ngày */}
        <NavLink
          to={path.dailyCheckIn}
          className={({ isActive }) =>
            classNames('relative mb-[0.9375rem] mt-4 flex items-center justify-start capitalize transition-colors', {
              'text-[#ee4d2d]': isActive,
              'text-gray-600 dark:text-gray-300': !isActive
            })
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !reducedMotion && (
                <motion.div
                  layoutId='activeNavIndicator'
                  className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && reducedMotion && (
                <div className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5' />
              )}
              <div className='relative z-10 flex items-center'>
                <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-6 w-6 text-yellow-500'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z'
                    />
                  </svg>
                </div>
                <span className='font-medium capitalize'>Điểm danh</span>
              </div>
            </>
          )}
        </NavLink>
        {/* Shop đang theo dõi */}
        <NavLink
          to={path.followedShops}
          className={({ isActive }) =>
            classNames('relative mb-[0.9375rem] mt-4 flex items-center justify-start capitalize transition-colors', {
              'text-[#ee4d2d]': isActive,
              'text-gray-600 dark:text-gray-300': !isActive
            })
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !reducedMotion && (
                <motion.div
                  layoutId='activeNavIndicator'
                  className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && reducedMotion && (
                <div className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5' />
              )}
              <div className='relative z-10 flex items-center'>
                <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-6 w-6 text-pink-500'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z'
                    />
                  </svg>
                </div>
                <span className='font-medium capitalize'>Shop theo dõi</span>
              </div>
            </>
          )}
        </NavLink>
        {/* Địa chỉ giao hàng */}
        <NavLink
          to={path.addressBook}
          className={({ isActive }) =>
            classNames('relative mb-[0.9375rem] mt-4 flex items-center justify-start capitalize transition-colors', {
              'text-[#ee4d2d]': isActive,
              'text-gray-600 dark:text-gray-300': !isActive
            })
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !reducedMotion && (
                <motion.div
                  layoutId='activeNavIndicator'
                  className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && reducedMotion && (
                <div className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5' />
              )}
              <div className='relative z-10 flex items-center'>
                <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-6 w-6 text-green-500'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'
                    />
                  </svg>
                </div>
                <span className='font-medium capitalize'>Địa chỉ</span>
              </div>
            </>
          )}
        </NavLink>
        {/* Thông báo */}
        <NavLink
          to={path.notifications}
          className={({ isActive }) =>
            classNames('relative mb-[0.9375rem] mt-4 flex items-center justify-start capitalize transition-colors', {
              'text-[#ee4d2d]': isActive,
              'text-gray-600 dark:text-gray-300': !isActive
            })
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !reducedMotion && (
                <motion.div
                  layoutId='activeNavIndicator'
                  className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && reducedMotion && (
                <div className='absolute inset-0 rounded-lg bg-[#ee4d2d]/5' />
              )}
              <div className='relative z-10 flex items-center'>
                <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-6 w-6 text-[#ee4d2d]'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0'
                    />
                  </svg>
                </div>
                <span className='font-medium capitalize'>Thông báo</span>
              </div>
            </>
          )}
        </NavLink>
      </div>
      </div>
    </div>
  )
}

export default UserSideNav
