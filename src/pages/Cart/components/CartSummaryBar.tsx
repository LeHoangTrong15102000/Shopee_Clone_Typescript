import { motion } from 'framer-motion'
import { Tooltip } from '@heroui/tooltip'
import ShopeeCheckbox from 'src/components/ShopeeCheckbox'
import Button from 'src/components/Button'
import { ExtendedPurchase } from '../types'

interface CartSummaryBarProps {
  extendedPurchases: ExtendedPurchase[]
  isAllChecked: boolean
  checkedPurchaseCount: number
  animatedTotalPrice: number
  animatedSavingsPrice: number
  totalCheckedPurchasePrice: number
  totalCheckedPurchaseSavingPrice: number
  handleCheckedAll: () => void
  handleDeleteManyPurchases: () => void
  handleBuyPurchases: () => void
  formatCurrency: (value: number) => string
}

const CartSummaryBar = ({
  extendedPurchases,
  isAllChecked,
  checkedPurchaseCount,
  animatedTotalPrice,
  animatedSavingsPrice,
  totalCheckedPurchasePrice,
  totalCheckedPurchaseSavingPrice,
  handleCheckedAll,
  handleDeleteManyPurchases,
  handleBuyPurchases,
  formatCurrency
}: CartSummaryBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className='sticky bottom-0 z-10 mt-10 flex flex-col rounded-sm border border-[rgba(0,0,0,.08)] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 sm:px-9 py-5 shadow dark:shadow-slate-900/50 sm:flex-row sm:items-center'
    >
      <div className='flex items-center'>
        <div className='flex flex-shrink-0 items-center justify-center pr-3'>
          <ShopeeCheckbox checked={isAllChecked} onChange={handleCheckedAll} size='md' />
        </div>
        <Button
          variant='ghost'
          onClick={handleCheckedAll}
          className='mx-3 border-none bg-none capitalize hover:text-orange dark:hover:text-orange-400'
        >
          Chọn tất cả ({extendedPurchases.length})
        </Button>
        <Button
          variant='ghost'
          onClick={handleDeleteManyPurchases}
          className='mx-3 border-none bg-none capitalize hover:text-red-500'
        >
          Xóa
        </Button>
      </div>

      <div className='mt-5 flex flex-col sm:ml-auto sm:mt-0 sm:flex-row sm:items-center md:flex-row md:items-center gap-4'>
        <div className='flex flex-col justify-end'>
          <div className='flex items-center flex-wrap sm:justify-end md:justify-end'>
            <div className='text-gray-700 dark:text-gray-200'>
              Tổng thanh toán ({isAllChecked ? extendedPurchases.length : checkedPurchaseCount} sản phẩm):{' '}
            </div>
            <motion.div
              className='ml-2 text-2xl text-[#ee4d2d] font-medium'
              key={totalCheckedPurchasePrice}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              ₫{formatCurrency(animatedTotalPrice)}
            </motion.div>

            {checkedPurchaseCount > 0 && (
              <Tooltip
                content={
                  <div className='bg-white dark:bg-slate-800 p-4 w-full max-w-[90vw] sm:w-96 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-slate-900/50'>
                    <div className='text-sm font-medium text-gray-700 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-slate-700 pb-2'>
                      Chi tiết khuyến mãi
                    </div>
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-300'>Tổng tiền hàng</span>
                        <span className='text-gray-900 dark:text-gray-100'>
                          ₫{formatCurrency(totalCheckedPurchasePrice + totalCheckedPurchaseSavingPrice)}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-300'>Voucher giảm giá</span>
                        <span className='text-red-500'>
                          -₫{formatCurrency(totalCheckedPurchaseSavingPrice)}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-300'>Giảm giá sản phẩm</span>
                        <span className='text-red-500'>
                          -₫{formatCurrency(totalCheckedPurchaseSavingPrice)}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-300'>Tiết kiệm</span>
                        <span className='text-red-500'>
                          -₫{formatCurrency(totalCheckedPurchaseSavingPrice)}
                        </span>
                      </div>
                      <hr className='border-gray-200 dark:border-slate-700 my-2' />
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-300'>Tổng số tiền</span>
                        <span className='text-gray-900 dark:text-gray-100 font-medium'>
                          ₫{formatCurrency(totalCheckedPurchasePrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                }
                placement='top-end'
                showArrow={false}
                offset={5}
                delay={0}
                closeDelay={100}
                classNames={{
                  base: 'p-0 bg-transparent',
                  content: 'p-0 bg-transparent'
                }}
              >
                <motion.button
                  className='ml-2 text-gray-600 dark:text-gray-400 hover:text-[#ee4d2d] transition-colors group'
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                >
                  <motion.svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-4 w-4 transition-transform duration-75'
                    initial={{ rotate: 180 }}
                    whileHover={{ rotate: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M4.5 15.75l7.5-7.5 7.5 7.5' />
                  </motion.svg>
                </motion.button>
              </Tooltip>
            )}
          </div>
          <div className='flex items-center text-sm sm:justify-end md:justify-end'>
            <div className='text-gray-500 dark:text-gray-400'>Tiết kiệm</div>
            <motion.div
              className='ml-7 text-[#ee4d2d] relative overflow-hidden'
              key={totalCheckedPurchaseSavingPrice}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              ₫{formatCurrency(animatedSavingsPrice)}
              {totalCheckedPurchaseSavingPrice > 0 && (
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent'
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
          animate={checkedPurchaseCount > 0 ? {
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0)',
              '0 0 0 6px rgba(239, 68, 68, 0.15)',
              '0 0 0 0 rgba(239, 68, 68, 0)'
            ]
          } : {}}
          style={{ borderRadius: '4px' }}
        >
          <Button
            onClick={handleBuyPurchases}
            disabled={checkedPurchaseCount === 0}
            type='button'
            className='mt-5 flex h-10 w-full sm:w-52 md:w-52 items-center justify-center bg-red-500 text-center text-sm capitalize text-white hover:bg-red-600 sm:ml-0 sm:mt-0 md:ml-0 md:mt-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Thanh toán ({checkedPurchaseCount})
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default CartSummaryBar

