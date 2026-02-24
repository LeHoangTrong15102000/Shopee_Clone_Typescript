import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import path from 'src/constant/path'
import { useReducedMotion } from 'src/hooks/useReducedMotion'

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

interface MobileAccountNavProps {
  className?: string
}

const MobileAccountNav = ({ className }: MobileAccountNavProps) => {
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
    const leftFade = container.parentElement?.querySelector('[data-fade="left"]') as HTMLElement | null
    const rightFade = container.parentElement?.querySelector('[data-fade="right"]') as HTMLElement | null
    if (leftFade) leftFade.style.opacity = container.scrollLeft > 10 ? '1' : '0'
    if (rightFade) rightFade.style.opacity = container.scrollLeft < container.scrollWidth - container.clientWidth - 10 ? '1' : '0'
  }, [])

  // Initialize fade gradients on mount
  useEffect(() => {
    handleMobileNavScroll()
  }, [handleMobileNavScroll])

  return (
    <div className={classNames('md:hidden border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative', className)}>
      {/* Left fade gradient */}
      <div
        className='pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-white dark:from-slate-900 to-transparent transition-opacity duration-200'
        style={{ opacity: 0 }}
        data-fade='left'
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
        data-fade='right'
      />
    </div>
  )
}

export default MobileAccountNav
