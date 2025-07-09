import type { BannerSlide } from './types'

interface Props {
  slides: BannerSlide[]
  currentSlide: number
  onSlideChange: (index: number) => void
}

const BannerIndicators = ({ slides, currentSlide, onSlideChange }: Props) => {
  return (
    <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20'>
      <div className='flex items-center space-x-2'>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide ? 'w-8 h-3 bg-white shadow-lg' : 'w-3 h-3 bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Chuyển đến slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default BannerIndicators
