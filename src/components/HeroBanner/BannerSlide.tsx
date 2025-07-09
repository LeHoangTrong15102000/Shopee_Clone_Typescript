import { Link } from 'react-router-dom'
import type { BannerSlide as BannerSlideType } from './types'

interface Props {
  slide: BannerSlideType
  isActive: boolean
}

const BannerSlide = ({ slide, isActive }: Props) => {
  return (
    <Link
      to={slide.link}
      className={`relative flex-shrink-0 w-full h-full block transition-all duration-500 ${
        isActive ? 'opacity-100' : 'opacity-90'
      }`}
      style={{ backgroundColor: slide.backgroundColor }}
    >
      {/* Background Image */}
      <div
        className='absolute inset-0 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        {/* Gradient Overlay */}
        <div className='absolute inset-0 bg-gradient-to-r from-black/30 to-transparent'></div>
      </div>

      {/* Content */}
      <div className='relative z-10 flex items-center h-full px-8 md:px-12'>
        <div className='text-white max-w-md'>
          <h2 className='text-2xl md:text-3xl font-bold mb-2 leading-tight drop-shadow-lg'>{slide.title}</h2>
          <p className='text-sm md:text-base mb-4 leading-relaxed drop-shadow-md opacity-90'>{slide.subtitle}</p>
          <button
            className='inline-flex items-center px-6 py-2 bg-white text-gray-900 font-medium rounded-full 
            hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg'
          >
            <span>Mua ngay</span>
            <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className='absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-sm'></div>
      <div className='absolute bottom-8 right-8 w-24 h-24 bg-white/5 rounded-full blur-md'></div>
    </Link>
  )
}

export default BannerSlide
