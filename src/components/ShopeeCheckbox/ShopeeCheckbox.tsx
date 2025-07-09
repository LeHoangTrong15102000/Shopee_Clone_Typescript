import React from 'react'
import { motion } from 'framer-motion'

interface ShopeeCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ShopeeCheckbox: React.FC<ShopeeCheckboxProps> = ({ checked, onChange, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  }

  // Variants cho background box animation
  const boxVariants = {
    unchecked: {
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
      scale: 1
    },
    checked: {
      backgroundColor: '#ee4d2d',
      borderColor: '#ee4d2d',
      scale: [1, 1.05, 1],
      transition: {
        backgroundColor: { duration: 0.2, ease: 'easeOut' },
        borderColor: { duration: 0.2, ease: 'easeOut' },
        scale: { duration: 0.3, ease: 'easeOut', times: [0, 0.5, 1] }
      }
    }
  }

  // Variants cho stroke animation của checkmark
  const checkmarkVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
      scale: 0.8
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      scale: 1,
      transition: {
        pathLength: {
          type: 'tween',
          duration: 0.4,
          ease: 'easeOut',
          delay: 0.1
        },
        opacity: {
          duration: 0.1,
          delay: 0.1
        },
        scale: {
          duration: 0.3,
          ease: 'backOut',
          delay: 0.2
        }
      }
    }
  }

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onClick={() => onChange?.(!checked)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onChange?.(!checked)
        }
      }}
      tabIndex={0}
      role='button'
      aria-pressed={checked}
      aria-label={checked ? 'Checkbox checked' : 'Checkbox unchecked'}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className={`
          ${sizeClasses[size]} 
          border-2 rounded-sm overflow-hidden
        `}
        variants={boxVariants}
        animate={checked ? 'checked' : 'unchecked'}
        style={{
          backgroundColor: checked ? '#ee4d2d' : '#ffffff',
          borderColor: checked ? '#ee4d2d' : '#d1d5db'
        }}
        whileHover={!checked ? { borderColor: '#ee4d2d' } : {}}
      >
        <motion.div
          className='w-full h-full flex items-center justify-center'
          initial={false}
          animate={checked ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.2, delay: checked ? 0.1 : 0 }}
        >
          <motion.svg
            className='w-4/5 h-4/5 text-white'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={3.5}
            stroke='currentColor'
            initial='hidden'
            animate={checked ? 'visible' : 'hidden'}
          >
            <motion.path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M5 13l4 4L19 7'
              variants={checkmarkVariants}
              style={{
                fill: 'none',
                stroke: 'currentColor'
              }}
            />
          </motion.svg>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default ShopeeCheckbox
