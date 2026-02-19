import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { ANIMATION_DURATION, ANIMATION_EASING } from 'src/styles/animations'

const SCROLL_THRESHOLD = 300

const backToTopVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASING.easeOut
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.8,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASING.easeIn
    }
  }
}

const backToTopReducedVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.1 } }
}

const BackToTopInner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsVisible(window.scrollY > SCROLL_THRESHOLD)
          ticking = false
        })
        ticking = true
      }
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  }, [prefersReducedMotion])

  const variants = prefersReducedMotion ? backToTopReducedVariants : backToTopVariants

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type='button'
          onClick={scrollToTop}
          className='fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-orange text-white shadow-lg transition-colors hover:bg-[#d73211] focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2'
          variants={variants}
          initial='hidden'
          animate='visible'
          exit='exit'
          whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
          aria-label='Cuộn lên đầu trang'
          role='button'
        >
          {/* Up Arrow SVG Icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
            aria-hidden='true'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M5 15l7-7 7 7' />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

const BackToTop = memo(BackToTopInner)

export default BackToTop

