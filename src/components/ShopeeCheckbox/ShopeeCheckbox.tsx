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

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onClick={() => onChange(!checked)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`
          ${sizeClasses[size]} 
          border-2 rounded-sm transition-all duration-300 ease-out
          ${checked ? 'bg-[#ee4d2d] border-[#ee4d2d]' : 'bg-white border-gray-300 hover:border-[#ee4d2d]'}
        `}
        animate={checked ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {checked && (
          <motion.svg
            className='w-full h-full text-white p-0.5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={4}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.3,
              ease: 'backOut',
              delay: 0.1
            }}
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
          </motion.svg>
        )}
      </motion.div>
    </motion.div>
  )
}

export default ShopeeCheckbox

// Của m còn 60k cho từ nay đến 30 không còn cho m lần nào nữa rồi, hết thì về dưới với t, dì 3 và trong ngoại hứa cho m rồi
