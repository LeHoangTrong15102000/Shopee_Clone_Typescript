import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import path from 'src/constant/path'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { staggerContainer, staggerItem, STAGGER_DELAY, ANIMATION_DURATION } from 'src/styles/animations'

const NotFound = () => {
  const reducedMotion = useReducedMotion()

  const containerVariants = staggerContainer(STAGGER_DELAY.slow)

  const floatingVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: ANIMATION_DURATION.slow, ease: 'easeOut' }
    }
  }

  return (
    <motion.main
      className='flex h-screen w-full flex-col items-center justify-center bg-black/5 dark:bg-slate-900'
      variants={reducedMotion ? undefined : containerVariants}
      initial={reducedMotion ? undefined : 'hidden'}
      animate={reducedMotion ? undefined : 'visible'}
    >
      <motion.h1
        className='text-6xl sm:text-7xl md:text-9xl font-extrabold tracking-widest text-black/90 dark:text-gray-100'
        variants={reducedMotion ? undefined : floatingVariants}
      >
        404
      </motion.h1>
      <motion.div
        className='absolute rotate-12 rounded bg-orange px-2 text-sm text-white'
        variants={reducedMotion ? undefined : staggerItem}
      >
        Page Not Found
      </motion.div>
      <motion.div
        className='mt-5'
        variants={reducedMotion ? undefined : staggerItem}
      >
        <Link
          to={path.home} // cho redirect về Home
          className='active:text-orange-500 group relative inline-block text-sm font-medium text-orange dark:text-orange-400 focus:outline-none focus:ring'
        >
          <span className='absolute inset-0 translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] transition-transform group-hover:translate-y-0 group-hover:translate-x-0' />
          <span className='relative block border border-current bg-orange px-8 py-3'>
            <span className='text-white'>Go Home</span>
          </span>
        </Link>
      </motion.div>
    </motion.main>
  )
}

export default NotFound
