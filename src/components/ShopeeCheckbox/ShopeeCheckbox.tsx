import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'src/hooks/useTheme'

interface ShopeeCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

const ShopeeCheckbox: React.FC<ShopeeCheckboxProps> = ({
  checked,
  onChange,
  size = 'md',
  className = '',
  disabled = false
}) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  }

  // Variants cho background box animation - theme aware
  const boxVariants = {
    unchecked: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderColor: isDark ? '#475569' : '#d1d5db',
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
      className={`relative ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
      onClick={() => !disabled && onChange?.(!checked)}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onChange?.(!checked)
        }
      }}
      tabIndex={disabled ? -1 : 0}
      role='checkbox'
      aria-checked={checked}
      aria-label={
        disabled
          ? `Checkbox ${checked ? 'checked' : 'unchecked'} (disabled)`
          : checked
            ? 'Checkbox checked'
            : 'Checkbox unchecked'
      }
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className={` ${sizeClasses[size]} overflow-hidden rounded-[3px] border-2`}
        variants={boxVariants}
        animate={checked ? 'checked' : 'unchecked'}
        whileHover={!checked ? { borderColor: '#ee4d2d' } : {}}
      >
        <motion.div
          className='flex h-full w-full items-center justify-center'
          initial={false}
          animate={checked ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.2, delay: checked ? 0.1 : 0 }}
        >
          <motion.svg
            className='h-4/5 w-4/5 text-white'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2.5}
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
