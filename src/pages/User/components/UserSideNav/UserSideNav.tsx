import React from 'react'
import { Link } from 'react-router-dom'
import path from 'src/constant/path'

const UserSideNav = () => {
  return (
    <div>
      {/* Avatar */}
      <div className='flex items-center border border-b-gray-200 py-4'>
        {/* Avatar */}
        <Link to={path.profile} className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-black/10'>
          <img
            src='https://down-vn.img.susercontent.com/file/b34a1e6b65aaa8ba6474c7886dc59df2_tn'
            alt='avatar_profile'
            className='h-full w-full object-cover'
          />
        </Link>
        {/* Tên user, mục: sửa hồ sơ */}
        <div className='flex-grow pl-[14px]'>
          <div className='mb-1 truncate font-semibold text-gray-600'>trong_bt</div>
          <Link to={path.profile} className='flex items-center bg-transparent capitalize'>
            {/* Icon */}
            <svg width={12} height={12} viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg' className='mr-1'>
              <path
                d='M8.54 0L6.987 1.56l3.46 3.48L12 3.48M0 8.52l.073 3.428L3.46 12l6.21-6.18-3.46-3.48'
                fill='#9B9B9B'
                fillRule='evenodd'
              />
            </svg>

            {/* Title Sửa hồ sơ */}
            <span className='capitalize text-[#888]'>Sửa hồ sơ</span>
          </Link>
        </div>
      </div>
      {/* Link chứa profile, password, historyPurchases */}
      <div className='mt-7 ml-2'>
        {/* Sale 4.4 */}
        <Link to={path.profile} className='mb-[0.9375rem] flex items-center justify-start capitalize transition-colors'>
          <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
            <img
              src='https://down-vn.img.susercontent.com/file/sg-11134004-23030-p4oek1xcnvovf4'
              alt='Avatar'
              className='h-6 w-6'
            />
          </div>
          <span className='relative flex items-center font-medium capitalize leading-tight'>
            <span>4.4 sale thời trang mỹ phẩm</span>
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
        <Link
          to={path.profile}
          className='mb-[0.9375rem] flex items-center justify-start capitalize text-[#ee4d2d] transition-colors'
        >
          <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
            <img
              src='https://down-vn.img.susercontent.com/file/ba61750a46794d8847c3f463c5e71cc4'
              alt='Avatar'
              className='h-6 w-6'
            />
          </div>
          <span className='font-medium capitalize'>Tài khoản của tôi</span>
        </Link>
        {/* Đổi mật khẩu */}
        <Link
          to={path.changePassword}
          className='mb-[0.9375rem] flex items-center justify-start capitalize transition-colors'
        >
          <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
            <img
              src='https://down-vn.img.susercontent.com/file/e10a43b53ec8605f4829da5618e0717c'
              alt='Avatar'
              className='h-6 w-6'
            />
          </div>
          <span className='font-medium capitalize'>Đổi mật khẩu</span>
        </Link>
        {/* Đơn mua */}
        <Link to={path.historyPurchases} className='flex items-center justify-start capitalize transition-colors'>
          <div className='mr-2 flex flex-shrink-0 items-center justify-center rounded'>
            <img
              src='https://down-vn.img.susercontent.com/file/f0049e9df4e536bc3e7f140d071e9078'
              alt='Avatar'
              className='h-6 w-6'
            />
          </div>
          <span className='font-medium capitalize'>Đơn mua</span>
        </Link>
      </div>
    </div>
  )
}

export default UserSideNav
