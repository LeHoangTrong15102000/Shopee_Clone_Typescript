import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { useIsMobile } from 'src/hooks/useIsMobile'
import { sectionEntrance, staggerContainer, staggerItem, STAGGER_DELAY } from 'src/styles/animations'

const Footer = () => {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const disableAnimation = reducedMotion || isMobile

  return (
    <footer className='relative overflow-hidden py-12 md:py-16'>
      {/* Main Gradient Background - Harmonized with Shopee Orange CTA section */}
      {/* Light: Gradient từ cam nhạt xuống xám nhẹ, Dark: Gradient tối sang trọng */}
      <div className='dark:via-slate-850 absolute inset-0 bg-linear-to-b from-orange-100/80 via-orange-50/60 to-gray-100 dark:from-slate-800 dark:to-slate-900' />

      {/* Subtle overlay for depth */}
      <div className='absolute inset-0 bg-linear-to-br from-transparent via-white/20 to-orange-50/30 dark:from-transparent dark:via-slate-800/50 dark:to-slate-900/80' />

      {/* Decorative gradient orbs - Subtle and harmonious */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        {/* Top-left warm glow - connects with CTA section above */}
        <div className='absolute -top-20 -left-20 h-64 w-64 rounded-full bg-linear-to-br from-orange/15 via-orange-300/10 to-transparent blur-2xl will-change-transform dark:from-orange-500/10 dark:via-orange-400/5' />
        {/* Right-side subtle glow */}
        <div className='absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-linear-to-bl from-orange-200/15 via-amber-100/10 to-transparent blur-2xl will-change-transform dark:from-slate-600/20 dark:via-slate-700/10' />
        {/* Bottom center glow */}
        <div className='absolute -bottom-16 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-linear-to-t from-gray-200/30 via-orange-100/15 to-transparent blur-2xl will-change-transform dark:from-slate-800/30 dark:via-slate-700/20' />
      </div>

      {/* Container */}
      <div className='relative z-10 container'>
        {/* Copyright & Regions Section */}
        <motion.div
          variants={!disableAnimation ? sectionEntrance : undefined}
          initial={!disableAnimation ? 'hidden' : undefined}
          whileInView={!disableAnimation ? 'visible' : undefined}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className='grid grid-cols-1 gap-4 border-b border-orange-200/40 pb-8 lg:grid-cols-3 dark:border-slate-700/50'>
            <div className='lg:col-span-1'>
              <div className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                © 2023 Shopee. Tất cả các quyền được bảo lưu
              </div>
            </div>
            <div className='lg:col-span-2'>
              <div className='text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                Quốc gia & Khu vực: Singapore | Indonesia | Đài Loan | Thái Lan | Malaysia | Việt Nam | Philippines |
                Brazil | México | Colombia | Chile
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <motion.div
          className='py-10'
          variants={!disableAnimation ? staggerContainer(STAGGER_DELAY.slow) : undefined}
          initial={!disableAnimation ? 'hidden' : undefined}
          whileInView={!disableAnimation ? 'visible' : undefined}
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className='text-center'>
            {/* Policy Links */}
            <motion.div
              className='flex flex-wrap items-center justify-center gap-4 md:gap-8'
              variants={!disableAnimation ? staggerItem : undefined}
            >
              {['CHÍNH SÁCH BẢO MẬT', 'QUY CHẾ HOẠT ĐỘNG', 'CHÍNH SÁCH VẬN CHUYỂN', 'CHÍNH SÁCH TRẢ HÀNG'].map(
                (text) => (
                  <Link
                    key={text}
                    to='/'
                    className='group relative cursor-pointer text-sm font-semibold text-gray-700 transition-all duration-300 hover:text-orange dark:text-gray-200 dark:hover:text-orange-400'
                  >
                    <span className='relative px-2 py-1'>
                      {text}
                      <span className='absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full bg-linear-to-r from-orange to-orange-400 transition-all duration-300 group-hover:w-full dark:from-orange-400 dark:to-orange-300' />
                    </span>
                  </Link>
                )
              )}
            </motion.div>

            {/* Certification Badges */}
            <motion.div
              className='mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-8'
              variants={!disableAnimation ? staggerItem : undefined}
            >
              <Link to='/' className='group cursor-pointer transition-all duration-300 hover:scale-105'>
                <div
                  className='h-8 w-20 bg-contain bg-no-repeat opacity-85 transition-all duration-300 group-hover:opacity-100 group-hover:drop-shadow-md sm:h-11.25 sm:w-30'
                  style={{
                    backgroundImage:
                      'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/3ce17addcf90b8cd3952b8ae0ffc1299.png)',
                    backgroundSize: '551.6666666666666% 477.77777777777777%',
                    backgroundPosition: '14.391143911439114% 99.41176470588235%'
                  }}
                />
              </Link>
              <Link to='/' className='group cursor-pointer transition-all duration-300 hover:scale-105'>
                <div
                  className='h-8 w-20 bg-contain bg-no-repeat opacity-85 transition-all duration-300 group-hover:opacity-100 group-hover:drop-shadow-md sm:h-11.25 sm:w-30'
                  style={{
                    backgroundImage:
                      'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/3ce17addcf90b8cd3952b8ae0ffc1299.png)',
                    backgroundSize: '551.6666666666666% 477.77777777777777%',
                    backgroundPosition: '14.391143911439114% 99.41176470588235%'
                  }}
                />
              </Link>
              <Link to='/' className='group cursor-pointer transition-all duration-300 hover:scale-105'>
                <div
                  className='h-8 w-8 bg-contain bg-no-repeat opacity-85 transition-all duration-300 group-hover:opacity-100 group-hover:drop-shadow-md sm:h-12 sm:w-12'
                  style={{
                    backgroundImage:
                      'url(https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/3ce17addcf90b8cd3952b8ae0ffc1299.png)',
                    backgroundSize: '1379.1666666666667% 447.9166666666667%',
                    backgroundPosition: '1.6286644951140066% 92.21556886227545%'
                  }}
                />
              </Link>
            </motion.div>

            {/* Company Info Section - No card, blends with background */}
            <motion.div className='mt-12' variants={!disableAnimation ? staggerItem : undefined}>
              <div className='mx-auto max-w-4xl space-y-3 border-t border-orange-200/30 px-4 py-6 md:px-8 dark:border-slate-700/40'>
                {/* Company Name */}
                <div className='text-base font-bold text-orange dark:text-orange-400'>Công ty TNHH Shopee</div>
                <div className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                  Địa chỉ: Tầng 4-5-6, Tòa nhà Capital Place, số 29 đường Liễu Giai, Phường Ngọc Khánh, Quận Ba Đình,
                  Thành phố Hà Nội, Việt Nam. Tổng đài hỗ trợ: 19001221 - Email: cskh@hotro.shopee.vn
                </div>
                <div className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                  Chịu Trách Nhiệm Quản Lý Nội Dung: Nguyễn Đức Trí - Điện thoại liên hệ: 024 73081221 (ext 4678)
                </div>
                <div className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                  Mã số doanh nghiệp: 0106773786 do Sở Kế hoạch & Đầu tư TP Hà Nội cấp lần đầu ngày 10/02/2015
                </div>
                {/* Bottom copyright */}
                <div className='mt-4 border-t border-orange-200/20 pt-4 dark:border-slate-700/30'>
                  <div className='text-xs text-gray-500 dark:text-gray-500'>
                    © 2015 - Bản quyền thuộc về Công ty TNHH Shopee
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
