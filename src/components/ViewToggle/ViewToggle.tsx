import { motion } from 'framer-motion'
import classNames from 'classnames'
import { useReducedMotion } from 'src/hooks/useReducedMotion'

export type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  viewMode: ViewMode
  onViewChange: (mode: ViewMode) => void
  className?: string
}

const ViewToggle = ({ viewMode, onViewChange, className }: ViewToggleProps) => {
  const prefersReducedMotion = useReducedMotion()

  const buttonVariants = {
    tap: prefersReducedMotion ? {} : { scale: 0.95 }
  }

  const handleGridClick = () => {
    onViewChange('grid')
  }

  const handleListClick = () => {
    onViewChange('list')
  }

  return (
    <div className={classNames('flex items-center gap-1 rounded-lg overflow-hidden', className)}>
      {/* Grid View Button */}
      <motion.button
        type='button'
        onClick={handleGridClick}
        whileTap={buttonVariants.tap}
        className={classNames('p-2 transition-colors', {
          'bg-orange text-white': viewMode === 'grid',
          'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-600': viewMode !== 'grid'
        })}
        aria-label='Xem dạng lưới'
        aria-pressed={viewMode === 'grid'}
        title='Xem dạng lưới'
      >
        {/* Grid Icon - 4 squares in 2x2 */}
        <svg
          className='w-4 h-4'
          fill='currentColor'
          viewBox='0 0 16 16'
          aria-hidden='true'
        >
          <rect x='1' y='1' width='6' height='6' rx='1' />
          <rect x='9' y='1' width='6' height='6' rx='1' />
          <rect x='1' y='9' width='6' height='6' rx='1' />
          <rect x='9' y='9' width='6' height='6' rx='1' />
        </svg>
      </motion.button>

      {/* List View Button */}
      <motion.button
        type='button'
        onClick={handleListClick}
        whileTap={buttonVariants.tap}
        className={classNames('p-2 transition-colors', {
          'bg-orange text-white': viewMode === 'list',
          'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-600': viewMode !== 'list'
        })}
        aria-label='Xem dạng danh sách'
        aria-pressed={viewMode === 'list'}
        title='Xem dạng danh sách'
      >
        {/* List Icon - 3 horizontal lines */}
        <svg
          className='w-4 h-4'
          fill='currentColor'
          viewBox='0 0 16 16'
          aria-hidden='true'
        >
          <rect x='1' y='2' width='14' height='2.5' rx='1' />
          <rect x='1' y='6.75' width='14' height='2.5' rx='1' />
          <rect x='1' y='11.5' width='14' height='2.5' rx='1' />
        </svg>
      </motion.button>
    </div>
  )
}

export default ViewToggle

