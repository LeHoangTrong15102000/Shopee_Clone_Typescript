import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ShopeeCheckbox from 'src/components/ShopeeCheckbox'
import ImageWithFallback from 'src/components/ImageWithFallback'
import QuantityController from 'src/components/QuantityController'
import StockBadge from 'src/components/StockBadge'
import { InlineStockAlert } from 'src/components/RealTimeStockAlert'
import { Purchase } from 'src/types/purchases.type'
import { ExtendedPurchase, InlineStockAlertState } from '../types'

interface CartItemListProps {
  extendedPurchases: ExtendedPurchase[]
  purchasesInCart: Purchase[] | undefined
  isAllChecked: boolean
  inlineAlerts: Map<string, InlineStockAlertState>
  handleChecked: (purchaseIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => void
  handleCheckedAll: () => void
  handleQuantity: (purchaseIndex: number, value: number, enabled: boolean) => void
  handleTypeQuantity: (purchaseIndex: number) => (value: number) => void
  handleDelete: (purchaseIndex: number) => () => void
  handleSaveForLater: (purchaseIndex: number) => () => void
  handleDismissInlineAlert: (productId: string) => void
  path: { home: string }
  formatCurrency: (value: number) => string
  generateNameId: (params: { name: string; id: string }) => string
}

const CartItemList = ({
  extendedPurchases,
  purchasesInCart,
  isAllChecked,
  inlineAlerts,
  handleChecked,
  handleCheckedAll,
  handleQuantity,
  handleTypeQuantity,
  handleDelete,
  handleSaveForLater,
  handleDismissInlineAlert,
  path,
  formatCurrency,
  generateNameId
}: CartItemListProps) => {
  return (
    <div className='overflow-auto'>
      {/* Desktop Layout - Table view (lg and above) */}
      <div className='hidden lg:block'>
        {/* Tiêu đề của các sản phẩm trong cart */}
        <div className='my-2 grid grid-cols-12 rounded-md bg-white dark:bg-slate-800 px-9 py-5 text-sm capitalize text-gray-500 dark:text-gray-300 shadow dark:shadow-slate-900/50'>
          <div className='col-span-6'>
            <div className='flex items-center'>
              <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                <ShopeeCheckbox checked={isAllChecked} onChange={handleCheckedAll} size='md' />
              </div>
              <div className='flex flex-grow text-black dark:text-gray-100'>Sản phẩm</div>
            </div>
          </div>
          <div className='col-span-6'>
            <div className='grid grid-cols-5 text-center text-[#888] dark:text-gray-400'>
              <div className='col-span-2'>Đơn giá</div>
              <div className='col-span-1'>Số lượng</div>
              <div className='col-span-1'>Số tiền</div>
              <div className='col-span-1'>Thao tác</div>
            </div>
          </div>
        </div>
        {/* Giao diện các sản phẩm trong cart - body các sản phẩm */}
        {extendedPurchases.length > 0 && (
          <>
            {extendedPurchases?.map((purchase, index) => (
              <motion.div
                key={purchase._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className='mt-5 grid grid-cols-12 items-center rounded-sm border border-[rgba(0,0,0,.09)] dark:border-slate-700 bg-white dark:bg-slate-800 py-5 px-9 text-sm text-gray-500 dark:text-gray-300 first:mt-0 hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow'
              >
                <div className='col-span-6'>
                  <div className='flex items-center'>
                    <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                      <ShopeeCheckbox
                        checked={purchase.isChecked}
                        onChange={(checked) => {
                          handleChecked(index)({ target: { checked } } as any)
                        }}
                        size='md'
                      />
                    </div>
                    <div className='flex-grow'>
                      <div className='flex items-center'>
                        <Link
                          to={`${path.home}${generateNameId({
                            name: purchase.product.name,
                            id: purchase.product._id
                          })}`}
                          className='h-20 w-20 flex-shrink-0'
                        >
                          <ImageWithFallback
                            src={purchase.product.image}
                            alt={purchase.product.name}
                            className='h-full w-full object-cover rounded'
                            loading='lazy'
                          />
                        </Link>
                        <div className='flex-grow px-2 pb-2 pt-1'>
                          <Link
                            to={`${path.home}${generateNameId({
                              name: purchase.product.name,
                              id: purchase.product._id
                            })}`}
                            className='line-clamp-2 text-gray-800 dark:text-gray-100 hover:text-[#ee4d2d] transition-colors'
                          >
                            {purchase.product.name}
                          </Link>
                          <div className='mt-1'>
                            <StockBadge
                              availableStock={purchase.product.quantity}
                              requestedQuantity={purchase.buy_count}
                            />
                          </div>
                          <AnimatePresence>
                            {inlineAlerts.has(purchase.product._id) && (
                              <InlineStockAlert
                                productId={purchase.product._id}
                                productName={inlineAlerts.get(purchase.product._id)!.productName}
                                newStock={inlineAlerts.get(purchase.product._id)!.newStock}
                                severity={inlineAlerts.get(purchase.product._id)!.severity}
                                onDismiss={() => handleDismissInlineAlert(purchase.product._id)}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-span-6'>
                  <div className='grid grid-cols-5 items-center'>
                    <div className='col-span-2'>
                      <div className='flex items-center justify-center text-[15px]'>
                        <span className='mr-2 text-gray-500 dark:text-gray-400 line-through'>
                          ₫{formatCurrency(purchase.product.price_before_discount)}
                        </span>
                        <span className='text-black/90 dark:text-gray-100'>₫{formatCurrency(purchase.product.price)}</span>
                      </div>
                    </div>
                    <div className='col-span-1'>
                      <QuantityController
                        handleDelete={handleDelete(index)}
                        product={purchase.product}
                        max={purchase.product.quantity}
                        value={purchase.buy_count}
                        classNameWrapper='flex items-center'
                        onIncrease={(value) =>
                          handleQuantity(index, value, purchase.buy_count < purchase.product.quantity)
                        }
                        onDecrease={(value) => handleQuantity(index, value, purchase.buy_count > 1)}
                        onType={handleTypeQuantity(index)}
                        onFocusOut={(value) =>
                          handleQuantity(
                            index,
                            value,
                            purchase.buy_count >= 1 &&
                              purchase.buy_count <= purchase.product.quantity &&
                              value !== (purchasesInCart as Purchase[])[index].buy_count
                          )
                        }
                        disabled={false}
                        isQuantityInCart={true}
                      />
                    </div>
                    <div className='col-span-1'>
                      <motion.span
                        className='flex items-center justify-center text-[15px] text-[#ee4d2d] font-medium'
                        key={purchase.buy_count}
                        initial={{ scale: 0.9, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        ₫{formatCurrency(purchase.price * purchase.buy_count)}
                      </motion.span>
                    </div>
                    <div className='col-span-1 flex flex-col items-center justify-center gap-1'>
                      <motion.button
                        onClick={handleSaveForLater(index)}
                        className='text-sm text-blue-500 dark:text-blue-400 transition-colors hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title='Lưu để mua sau'
                      >
                        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-4 h-4'>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z' />
                        </svg>
                        Lưu
                      </motion.button>
                      <motion.button
                        onClick={handleDelete(index)}
                        className='bg-none text-black/90 dark:text-gray-200 transition-colors hover:text-[#ee4d2d] hover:font-medium'
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        Xóa
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Mobile Layout - Card view (below lg) */}
      <div className='block lg:hidden'>
        <div className='my-2 flex items-center rounded-md bg-white dark:bg-slate-800 px-4 py-4 text-sm shadow dark:shadow-slate-900/50'>
          <div className='flex flex-shrink-0 items-center justify-center pr-3'>
            <ShopeeCheckbox checked={isAllChecked} onChange={handleCheckedAll} size='md' />
          </div>
          <span className='text-black dark:text-gray-100 font-medium'>Chọn tất cả ({extendedPurchases.length})</span>
        </div>

        {extendedPurchases.length > 0 && (
          <div className='space-y-3'>
            {extendedPurchases?.map((purchase, index) => (
              <motion.div
                key={purchase._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className='bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm dark:shadow-slate-900/50'
              >
                <div className='flex gap-3'>
                  <div className='flex flex-shrink-0 items-start pt-1'>
                    <ShopeeCheckbox
                      checked={purchase.isChecked}
                      onChange={(checked) => {
                        handleChecked(index)({ target: { checked } } as any)
                      }}
                      size='md'
                    />
                  </div>

                  <Link
                    to={`${path.home}${generateNameId({
                      name: purchase.product.name,
                      id: purchase.product._id
                    })}`}
                    className='h-20 w-20 flex-shrink-0'
                  >
                    <ImageWithFallback
                      src={purchase.product.image}
                      alt={purchase.product.name}
                      className='h-full w-full object-cover rounded'
                      loading='lazy'
                    />
                  </Link>

                  <div className='flex-1 min-w-0'>
                    <Link
                      to={`${path.home}${generateNameId({
                        name: purchase.product.name,
                        id: purchase.product._id
                      })}`}
                      className='line-clamp-2 text-sm text-gray-800 dark:text-gray-100 hover:text-[#ee4d2d] transition-colors'
                    >
                      {purchase.product.name}
                    </Link>

                    <div className='mt-1'>
                      <StockBadge
                        availableStock={purchase.product.quantity}
                        requestedQuantity={purchase.buy_count}
                      />
                    </div>

                    <AnimatePresence>
                      {inlineAlerts.has(purchase.product._id) && (
                        <InlineStockAlert
                          productId={purchase.product._id}
                          productName={inlineAlerts.get(purchase.product._id)!.productName}
                          newStock={inlineAlerts.get(purchase.product._id)!.newStock}
                          severity={inlineAlerts.get(purchase.product._id)!.severity}
                          onDismiss={() => handleDismissInlineAlert(purchase.product._id)}
                        />
                      )}
                    </AnimatePresence>

                    <div className='mt-2 flex items-center gap-2 text-sm'>
                      <span className='text-gray-400 dark:text-gray-500 line-through'>
                        ₫{formatCurrency(purchase.product.price_before_discount)}
                      </span>
                      <span className='text-[#ee4d2d] font-medium'>
                        ₫{formatCurrency(purchase.product.price)}
                      </span>
                    </div>

                    <div className='mt-3 flex items-center justify-between'>
                      <QuantityController
                        handleDelete={handleDelete(index)}
                        product={purchase.product}
                        max={purchase.product.quantity}
                        value={purchase.buy_count}
                        classNameWrapper='flex items-center'
                        onIncrease={(value) =>
                          handleQuantity(index, value, purchase.buy_count < purchase.product.quantity)
                        }
                        onDecrease={(value) => handleQuantity(index, value, purchase.buy_count > 1)}
                        onType={handleTypeQuantity(index)}
                        onFocusOut={(value) =>
                          handleQuantity(
                            index,
                            value,
                            purchase.buy_count >= 1 &&
                              purchase.buy_count <= purchase.product.quantity &&
                              value !== (purchasesInCart as Purchase[])[index].buy_count
                          )
                        }
                        disabled={false}
                        isQuantityInCart={true}
                      />

                      <motion.button
                        onClick={handleSaveForLater(index)}
                        className='text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-2 min-h-[40px] min-w-[40px]'
                        aria-label='Lưu để mua sau'
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z' />
                        </svg>
                      </motion.button>

                      <motion.button
                        onClick={handleDelete(index)}
                        className='text-gray-500 dark:text-gray-400 hover:text-[#ee4d2d] transition-colors p-2 min-h-[40px] min-w-[40px]'
                        aria-label='Xóa sản phẩm'
                        whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth={1.5}
                          stroke='currentColor'
                          className='w-5 h-5'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                          />
                        </svg>
                      </motion.button>
                    </div>

                    <div className='mt-2 flex items-center justify-end'>
                      <span className='text-sm text-gray-500 dark:text-gray-400 mr-2'>Tổng:</span>
                      <motion.span
                        className='text-[#ee4d2d] font-medium'
                        key={purchase.buy_count}
                        initial={{ scale: 0.9, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        ₫{formatCurrency(purchase.price * purchase.buy_count)}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CartItemList

