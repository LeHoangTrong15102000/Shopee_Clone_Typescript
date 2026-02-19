import { memo } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from 'src/hooks/useReducedMotion'

interface SearchNoResultsProps {
  searchTerm: string
  onPopularSearch?: (term: string) => void
}

const popularSearchTerms = [
  'Điện thoại',
  'Áo thun nam',
  'Laptop',
  'Tai nghe bluetooth',
  'Giày sneaker',
  'Túi xách nữ',
  'Đồng hồ',
  'Mỹ phẩm'
]

const SearchNoResults = memo(function SearchNoResults({ searchTerm, onPopularSearch }: SearchNoResultsProps) {
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }
    }
  }

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : {
            staggerChildren: 0.05,
            delayChildren: 0.2
          }
    }
  }

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }
    }
  }

  return (
    <motion.div
      className='text-center py-12 px-4'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Icon */}
      <motion.div className='mx-auto w-24 h-24 mb-6' variants={itemVariants}>
        <svg
          className='w-full h-full text-gray-300'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      </motion.div>

      {/* Main message */}
      <motion.h3
        className='text-xl font-semibold text-gray-700 mb-2'
        variants={itemVariants}
      >
        Không tìm thấy kết quả cho '{searchTerm}'
      </motion.h3>

      {/* Suggestions section */}
      <motion.div className='mt-6 max-w-md mx-auto' variants={listVariants}>
        <p className='text-gray-600 font-medium mb-3'>Bạn có thể thử:</p>
        <ul className='text-left text-gray-500 space-y-2 mb-6'>
          <motion.li className='flex items-center gap-2' variants={listItemVariants}>
            <svg className='w-4 h-4 text-[#ee4d2d] flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
            </svg>
            <span>Kiểm tra lỗi chính tả</span>
          </motion.li>
          <motion.li className='flex items-center gap-2' variants={listItemVariants}>
            <svg className='w-4 h-4 text-[#ee4d2d] flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
            </svg>
            <span>Sử dụng từ khóa ngắn hơn</span>
          </motion.li>
          <motion.li className='flex items-center gap-2' variants={listItemVariants}>
            <svg className='w-4 h-4 text-[#ee4d2d] flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
            </svg>
            <span>Sử dụng từ khóa phổ biến hơn</span>
          </motion.li>
        </ul>
      </motion.div>

      {/* Popular search terms */}
      <motion.div className='mt-8' variants={listVariants}>
        <p className='text-gray-600 font-medium mb-4'>Tìm kiếm phổ biến:</p>
        <div className='flex flex-wrap justify-center gap-2'>
          {popularSearchTerms.map((term, index) => (
            <motion.button
              key={term}
              variants={listItemVariants}
              custom={index}
              onClick={() => onPopularSearch?.(term)}
              className='px-4 py-2 bg-gray-100 hover:bg-[#ee4d2d] hover:text-white text-sm text-gray-600 rounded-full transition-colors duration-200'
            >
              {term}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
})

export default SearchNoResults

