import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from 'src/components/Button'
import SaveForLaterSection from 'src/components/SaveForLaterSection'
import { SavedItem } from 'src/hooks/useSaveForLater'

interface EmptyCartStateProps {
  savedItems: SavedItem[]
  handleMoveToCart: (item: SavedItem) => void
  removeFromSaved: (productId: string) => void
  handleClearSaved: () => void
  noproduct: string
  path: { home: string }
}

const Sparkle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className='absolute h-1.5 w-1.5 rounded-full bg-orange/40'
    style={{ left: x, top: y }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 0.8, 0]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay,
      ease: 'easeInOut'
    }}
  />
)

const EmptyCartState = ({
  savedItems,
  handleMoveToCart,
  removeFromSaved,
  handleClearSaved,
  noproduct,
  path
}: EmptyCartStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className='flex flex-col items-center justify-center py-20'
    >
      <div className='text-center relative'>
        <Sparkle delay={0} x={-15} y={10} />
        <Sparkle delay={0.5} x={130} y={15} />
        <Sparkle delay={1.0} x={10} y={100} />
        <Sparkle delay={1.5} x={120} y={95} />
        <Sparkle delay={0.8} x={60} y={-5} />
        <Sparkle delay={1.3} x={-5} y={55} />
        <Sparkle delay={1.8} x={135} y={55} />
        <motion.img
          src={noproduct}
          alt='noproduct'
          className='h-[120px] w-[120px] mx-auto opacity-60'
          animate={{
            y: [0, -10, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>
      <motion.span
        className='mt-5 text-[0.875rem] font-bold text-black/40 dark:text-gray-400'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        Giỏ hàng của bạn còn trống
      </motion.span>
      <Link to={path.home} className='mt-5 text-left'>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0)',
              '0 0 0 8px rgba(239, 68, 68, 0.15)',
              '0 0 0 0 rgba(239, 68, 68, 0)'
            ]
          }}
          style={{ borderRadius: '4px' }}
        >
          <Button className='flex h-10 w-full sm:w-[168px] items-center justify-center rounded bg-red-500 text-center text-sm uppercase text-white transition-all hover:bg-red-600 sm:mt-0'>
            Mua ngay
          </Button>
        </motion.div>
      </Link>

      {savedItems.length > 0 && (
        <div className='w-full max-w-2xl mt-8'>
          <SaveForLaterSection
            savedItems={savedItems}
            onMoveToCart={handleMoveToCart}
            onRemove={removeFromSaved}
            onClear={handleClearSaved}
          />
        </div>
      )}
    </motion.div>
  )
}

export default EmptyCartState
