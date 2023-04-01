import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='bg-neutral-100 py-16 text-gray-500'>
      {/* Container */}
      <div className='container'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <div className='lg:col-span-1'>
            <div>© 2023 Shopee. Tất cả các quyền được bảo lưu</div>
          </div>
          <div className='lg:col-span-2'>
            <div>
              Quốc gia & Khu vực: Singapore | Indonesia | Đài Loan | Thái Lan | Malaysia | Việt Nam | Philippines |
              Brazil | México | Colombia | Chile
            </div>
          </div>
        </div>
        <div className='py-12'>
          <div className='mt-10 text-center text-sm'>
            <div className='mt-0 flex items-center justify-center'>
              <div className='px-3'>
                <Link to='/'>
                  <span>CHÍNH SÁCH BẢO MẬT</span>
                </Link>
              </div>
              <div className='px-3'>
                <Link to='/'>
                  <span>QUY CHẾ HOẠT ĐỘNG</span>
                </Link>
              </div>
              <div className='px-3'>
                <Link to='/'>
                  <span>CHÍNH SÁCH VẬN CHUYỂN</span>
                </Link>
              </div>
              <div className='px-3'>
                <Link to='/'>
                  <span>CHÍNH SÁCH TRẢ HÀNG</span>
                </Link>
              </div>
            </div>
            <div className='mt-10 flex items-center justify-center'>
              <Link to='/'>
                <div
                  className='my-0 mx-5'
                  style={{
                    width: '7.5rem',
                    height: '2.8125rem',
                    backgroundImage:
                      'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/3ce17addcf90b8cd3952b8ae0ffc1299.png)',
                    backgroundSize: '551.6666666666666% 477.77777777777777%',
                    backgroundPosition: '14.391143911439114% 99.41176470588235%'
                  }}
                ></div>
              </Link>
              <Link to='/'>
                <div
                  className='my-0 mx-5'
                  style={{
                    width: '7.5rem',
                    height: '2.8125rem',
                    backgroundImage:
                      'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/3ce17addcf90b8cd3952b8ae0ffc1299.png)',
                    backgroundSize: '551.6666666666666% 477.77777777777777%',
                    backgroundPosition: '14.391143911439114% 99.41176470588235%'
                  }}
                ></div>
              </Link>
              <Link to='/'>
                <div
                  className='my-0 mx-5'
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundImage:
                      'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/3ce17addcf90b8cd3952b8ae0ffc1299.png)',
                    backgroundSize: '1379.1666666666667% 447.9166666666667%',
                    backgroundPosition: '1.6286644951140066% 92.21556886227545%'
                  }}
                ></div>
              </Link>
            </div>
            <div className='mt-2 mb-6'>Công ty TNHH Shopee</div>
            <div className='mt-2'>
              Địa chỉ: Tầng 4-5-6, Tòa nhà Capital Place, số 29 đường Liễu Giai, Phường Ngọc Khánh, Quận Ba Đình, Thành
              phố Hà Nội, Việt Nam. Tổng đài hỗ trợ: 19001221 - Email: cskh@hotro.shopee.vn
            </div>
            <div className='mt-2'>
              Chịu Trách Nhiệm Quản Lý Nội Dung: Nguyễn Đức Trí - Điện thoại liên hệ: 024 73081221 (ext 4678)
            </div>
            <div className='mt-2'>
              Mã số doanh nghiệp: 0106773786 do Sở Kế hoạch & Đầu tư TP Hà Nội cấp lần đầu ngày 10/02/2015
            </div>
            <div className='mt-2'>© 2015 - Bản quyền thuộc về Công ty TNHH Shopee</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
