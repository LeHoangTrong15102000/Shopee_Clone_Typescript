import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Tooltip } from '@heroui/react'
import ShopeeCheckbox from 'src/components/ShopeeCheckbox'
import { motion } from 'framer-motion'
import purchaseApi from 'src/apis/purchases.api'
import Button from 'src/components/Button'
import QuantityController from 'src/components/QuantityController'
import path from 'src/constant/path'
import { purchasesStatus } from 'src/constant/purchase'
import { AppContext } from 'src/contexts/app.context'
import { Purchase } from 'src/types/purchases.type'
import { formatCurrency, generateNameId } from 'src/utils/utils'
import { produce } from 'immer'
import keyBy from 'lodash/keyBy'
import { toast } from 'react-toastify'
import noproduct from '../../assets/images/img-product-incart.png'

interface ExtendedPurchase extends Purchase {
  disabled: boolean
  isChecked: boolean
}

// isAuthenticated mới vào được cái page này
const Cart = () => {
  // const [extendedPurchases, setExtendedPurchases] = useState<ExtendedPurchase[]>([])
  const { extendedPurchases, setExtendedPurchases } = useContext(AppContext)
  const queryClient = useQueryClient()

  // useQuery để gọi purchaseList hiển thị Cart product
  const { data: purchasesInCartData, refetch } = useQuery({
    queryKey: ['purchases', { status: purchasesStatus.inCart }],
    queryFn: async () => await purchaseApi.getPurchases({ status: purchasesStatus.inCart })
  })

  const updatePurchaseMutation = useMutation({
    mutationFn: purchaseApi.updatePurchase,
    onSuccess: async () => {
      // refetch() // gọi lại refetch lại getPurchases
      await queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
    }
  })

  // buyProduct Mutation
  const buyPurchasesMutation = useMutation({
    mutationFn: purchaseApi.buyPurchases,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
      toast.success(data.data.message, { position: 'top-center', autoClose: 1000 })
    },
    onError: () => {
      toast.error('Mua hàng thất bại!', { position: 'top-center', autoClose: 1000 })
    }
  })

  // deleteProduct Mutation
  const deletePurchasesMutation = useMutation({
    mutationFn: purchaseApi.deletePurchase,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
    }
  })

  // lấy ra cái state là purchaseId được lưu trên route của sản phẩm
  const location = useLocation()

  const navigate = useNavigate()

  // Khi mà ta xóa cái state trên URL thì thằng useEffect sẽ chạy lại
  const choosenPurchaseIdFromLocation = useMemo(
    () => (location.state as { purchaseId: string } | null)?.purchaseId,
    [location]
  )

  // Lấy ra cái pathname khi mà chuyển trang, dùng cái pathname này để xử lý state được lưu trên URL
  const pathname = location.pathname

  const purchasesInCart = purchasesInCartData?.data.data
  // console.log(purchasesInCart)
  // Tạo 1 biến isAllChecked để khi mà mỗi purchas trong cart checked thì isAllChecked sẽ trả về true
  const isAllChecked = useMemo(() => extendedPurchases.every((purchase) => purchase.isChecked), [extendedPurchases])
  const checkedPurchases = useMemo(
    () => extendedPurchases.filter((purchase) => purchase.isChecked),
    [extendedPurchases]
  )
  // console.log(checkedPurchases)
  const checkedPurchaseCount = checkedPurchases.length

  // Lấy ra các purchase được checked để tính tổng tiền
  const totalCheckedPurchasePrice = useMemo(
    () =>
      checkedPurchases.reduce(
        (result, currentPurchase) => result + currentPurchase.price * currentPurchase.buy_count,
        0
      ),
    [checkedPurchases]
  )
  // Tạo biến tính giá tiền tiết kiệm được
  const totalCheckedPurchaseSavingPrice = useMemo(
    () =>
      checkedPurchases.reduce(
        (result, currentPurchase) =>
          result + (currentPurchase.price_before_discount - currentPurchase.price) * currentPurchase.buy_count,
        0
      ),
    [checkedPurchases]
  )

  // Khi mà khởi tạo component thì sẽ thực hiện gán giá trị vào extendedPurchase
  useEffect(() => {
    // set chỗ này thì chúng ta dùng một cái map()
    setExtendedPurchases((prev) => {
      // prev sẽ là giá trị mới nhất của thằng purchasesInCart
      // sẽ sử dụng _keyby của lodash để lấy ra cái purchase cần tìm của chúng ta
      const extendedPurchasesObject = keyBy(prev, '_id') // nó sẽ lấy value của '_id' làm key chỗ mỗi phần tử và cả object sản phẩm đó sẽ là value
      /**
       * Boolean(extendedPurchasesObject[purchase._id]?.isChecked)
       */
      return (
        purchasesInCart?.map((purchase) => {
          const isChoosenPurchaseIdFromLocation = choosenPurchaseIdFromLocation === purchase._id // Nếu cái này là true thì nó sẽ checked
          return {
            ...purchase,
            disabled: false,
            isChecked: isChoosenPurchaseIdFromLocation || Boolean(extendedPurchasesObject[purchase._id]?.isChecked) // ban đầu nếu mà thằng này không có thì nó sẽ trả về false
          }
        }) || []
      )
    })
    // Sau khi nhấn vào `mua ngay` thì nó sẽ chạy lại cái useEffect và biến handler sẽ chạy
    const handler = setTimeout(
      () =>
        // Khi mà change cái checked thì setExtendedPurchases thay đổi làm useEffect chạy lại
        navigate(pathname, { state: null, replace: true }), // thay thế cái state trên URL
      500
    )
    return () => clearTimeout(handler)
  }, [purchasesInCart, choosenPurchaseIdFromLocation, setExtendedPurchases, pathname, navigate])

  // clean-up func khi mà F5 lại sẽ xóa cái state được lưu trên router
  useEffect(() => {
    return () => {
      history.replaceState(null, '') // hàm history.replaceState là hàm có sẵn ở trên trình duyệt
    }
  }, [])

  // func xử lý checked cho 1 sản phẩm
  const handleChecked = (purchaseIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].isChecked = event.target.checked
      })
    )
  }

  // func xử lý checkedAll khi nhấn vào nhiều sản phẩm
  const handleCheckedAll = () => {
    // Khi mà có sản phẩm trong cart và > 0 thì mới cho checkedAll
    // set lại extendedPurchase
    if (extendedPurchases.length > 0) {
      setExtendedPurchases((prev) =>
        prev.map((purchase) => ({
          ...purchase,
          isChecked: !isAllChecked // khi mà có 1 purchase chưa checked thì khi nhấn vào nó sẽ checked
        }))
      )
    }
  }

  // Func xử lý onchange input
  const handleTypeQuantity = (purchaseIndex: number) => (value: number) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].buy_count = value
      })
    )
  }

  // func xử lý sự kiện onIncrease và onDecrease của cái QuantityController trong Cart
  const handleQuantity = (purchaseIndex: number, value: number, enabled: boolean) => {
    // Khi mà enabled = true thì mới cho thực hiện
    updatePurchaseMutation.isPending // ban đầu phải isPending trước
    if (enabled) {
      const purchase = extendedPurchases[purchaseIndex] // lấy ra cái purchase
      setExtendedPurchases(
        produce((draft) => {
          draft[purchaseIndex].disabled = true
        })
      )
      // Gọi Api updatem khi mà tăng giảm thì nó sẽ gửi Api lên server cập nhật lại giá trị
      updatePurchaseMutation.mutate({ product_id: purchase.product._id, buy_count: value })
    }
  }

  // func xử lý xóa 1 sản phẩm, dùng currying để xử lý
  const handleDelete = (purchaseIndex: number) => () => {
    const purchaseId = extendedPurchases[purchaseIndex]._id
    deletePurchasesMutation.mutate([purchaseId], {
      onSuccess: () => {
        toast.success('Xoá sản phẩm thành công!', {
          autoClose: 1000,
          position: 'top-center'
        })
      }
    }) // này không cần return về gì hết vì BE nó đã xử lý
  }

  // func xử lý xóa nhiều sản phẩm
  const handleDeleteManyPurchases = () => {
    // lấy ra các mảng purchasesIds từ mảng filter checkedPurchase
    const purchaseIds = checkedPurchases.map((purchase) => purchase._id)
    deletePurchasesMutation.mutate(purchaseIds, {
      onSuccess: () => {
        toast.success('Xóa tất cả sản phẩm thành công', { position: 'top-center', autoClose: 1000 })
      }
    })
  }

  // func xử lý buy product
  const handleBuyPurchases = () => {
    if (checkedPurchases.length > 0) {
      // tạo ra Arr các object có 2 thuộc tính là {product_id, buy_count}
      const purchaseIds = checkedPurchases.map((purchase) => ({
        product_id: purchase.product._id,
        buy_count: purchase.buy_count
      }))
      // gửi lên sv
      buyPurchasesMutation.mutate(purchaseIds)
    }
  }
  // console.log(extendedPurchases)
  // ;<div className='my-3 rounded-sm bg-white p-5 shadow'></div>
  return (
    <div className='border-b- 4 border-b-[#ee4d2d] bg-neutral-100 py-16'>
      <div className='container'>
        {extendedPurchases.length > 0 ? (
          <Fragment>
            {/* Giao diện chính của các sản phẩm trong cart  */}
            <div className='overflow-auto'>
              <div className='min-w-[1000px]'>
                {/* Tiêu đề của các sản phẩm trong cart */}
                <div className='my-2 grid grid-cols-12 rounded-md bg-white px-9 py-5 text-sm capitalize text-gray-500 shadow'>
                  {/* Phần sản phẩm và hình ảnh */}
                  <div className='col-span-6'>
                    <div className='flex items-center'>
                      {/* HeroUI Checkbox với phiên bản ổn định 2.6.14 */}
                      <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                        <ShopeeCheckbox checked={isAllChecked} onChange={handleCheckedAll} size='md' />
                      </div>
                      {/* Mục sản phẩm */}
                      <div className='flex flex-grow text-black'>Sản phẩm</div>
                    </div>
                  </div>
                  {/* Phần đơn giá trở về sau */}
                  <div className='col-span-6'>
                    <div className='grid grid-cols-5 text-center text-[#888]'>
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
                        className='mt-5 grid grid-cols-12 items-center rounded-sm border border-[rgba(0,0,0,.09)] bg-white py-5 px-9 text-sm text-gray-500 first:mt-0 hover:shadow-md transition-shadow'
                      >
                        <div className='col-span-6'>
                          <div className='flex items-center'>
                            {/* HeroUI Checkbox với phiên bản ổn định 2.6.14 */}
                            <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                              <ShopeeCheckbox
                                checked={purchase.isChecked}
                                onChange={(checked) => {
                                  handleChecked(index)({ target: { checked } } as any)
                                }}
                                size='md'
                              />
                            </div>
                            {/* Avatar sản phẩm và title */}
                            <div className='flex-grow'>
                              <div className='flex items-center'>
                                {/* ảnh là một cái thẻ link */}
                                <Link
                                  to={`${path.home}${generateNameId({
                                    name: purchase.product.name,
                                    id: purchase.product._id
                                  })}`}
                                  className='h-20 w-20 flex-shrink-0'
                                >
                                  <img
                                    src={purchase.product.image}
                                    className='h-full w-full object-cover rounded'
                                    alt={purchase.product.name}
                                  />
                                </Link>
                                {/* title */}
                                <div className='flex-grow px-2 pb-2 pt-1'>
                                  <Link
                                    to={`${path.home}${generateNameId({
                                      name: purchase.product.name,
                                      id: purchase.product._id
                                    })}`}
                                    className='line-clamp-2 hover:text-[#ee4d2d] transition-colors'
                                  >
                                    {purchase.product.name}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Giá tiền của body sản phẩm, số lượng, số tiền tổng, thao tác */}
                        <div className='col-span-6'>
                          <div className='grid grid-cols-5 items-center'>
                            {/* Giá tiền */}
                            <div className='col-span-2'>
                              <div className='flex items-center justify-center text-[15px]'>
                                <span className='mr-2 text-gray-500 line-through'>
                                  ₫{formatCurrency(purchase.product.price_before_discount)}
                                </span>
                                <span className='text-black/90'>₫{formatCurrency(purchase.product.price)}</span>
                              </div>
                            </div>
                            {/* Quantity Controller */}
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
                                disabled={purchase.disabled}
                                isQuantityInCart={true}
                              />
                            </div>
                            {/* Tổng tiền */}
                            <div className='col-span-1'>
                              <span className='flex items-center justify-center text-[15px] text-[#ee4d2d] font-medium'>
                                ₫{formatCurrency(purchase.price * purchase.buy_count)}
                              </span>
                            </div>
                            {/* Button  */}
                            <div className='col-span-1 flex items-center justify-center'>
                              <button
                                onClick={handleDelete(index)}
                                className='bg-none text-black/90 transition-colors hover:text-[#ee4d2d] hover:font-medium'
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      // div thể hiện các mục giảm giá cho sản phẩm và tiền giao hàng
                    ))}
                  </>
                )}
              </div>
            </div>
            {/* Thanh hiện giá tiền, tổng giá tiền và nút Mua Ngay với animation */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='sticky bottom-0 z-10 mt-10 flex flex-col rounded-sm border border-[rgba(0,0,0,.08)] bg-white px-9 py-5 shadow sm:flex-row sm:items-center'
            >
              <div className='flex items-center'>
                <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                  <ShopeeCheckbox checked={isAllChecked} onChange={handleCheckedAll} size='md' />
                </div>
                <button
                  onClick={handleCheckedAll}
                  className='mx-3 border-none bg-none capitalize hover:text-[#ee4d2d] transition-colors'
                >
                  Chọn tất cả ({extendedPurchases.length})
                </button>
                <button
                  onClick={handleDeleteManyPurchases}
                  className='mx-3 border-none bg-none capitalize hover:text-red-500 transition-colors'
                >
                  Xóa
                </button>
              </div>

              {/* Giá tiền thanh toán và button mua ngay sẽ nằm ở đây */}
              <div className='mt-5 flex flex-col sm:ml-auto sm:mt-0 sm:flex-row sm:items-center'>
                {/* Thẻ div này chứa 2 ông tổng thanh toán và giá tiền */}
                <div className='flex flex-col justify-end'>
                  <div className='flex items-center sm:justify-end'>
                    <div>
                      Tổng thanh toán ({isAllChecked ? extendedPurchases.length : checkedPurchaseCount} sản phẩm):{' '}
                    </div>
                    <motion.div
                      className='ml-2 text-2xl text-[#ee4d2d] font-medium'
                      key={totalCheckedPurchasePrice}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      ₫{formatCurrency(totalCheckedPurchasePrice)}
                    </motion.div>

                    {/* Chỉ hiển thị mũi tên khi có sản phẩm được chọn */}
                    {checkedPurchaseCount > 0 && (
                      <Tooltip
                        content={
                          <div className='bg-white p-4 w-96 border border-gray-200 rounded-lg shadow-lg'>
                            <div className='text-sm font-medium text-gray-700 mb-3 border-b border-gray-200 pb-2'>
                              Chi tiết khuyến mãi
                            </div>
                            <div className='space-y-2'>
                              <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Tổng tiền hàng</span>
                                <span className='text-gray-900'>
                                  ₫{formatCurrency(totalCheckedPurchasePrice + totalCheckedPurchaseSavingPrice)}
                                </span>
                              </div>
                              <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Voucher giảm giá</span>
                                <span className='text-red-500'>
                                  -₫{formatCurrency(totalCheckedPurchaseSavingPrice)}
                                </span>
                              </div>
                              <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Giảm giá sản phẩm</span>
                                <span className='text-red-500'>
                                  -₫{formatCurrency(totalCheckedPurchaseSavingPrice)}
                                </span>
                              </div>
                              <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Tiết kiệm</span>
                                <span className='text-red-500'>
                                  -₫{formatCurrency(totalCheckedPurchaseSavingPrice)}
                                </span>
                              </div>
                              <hr className='border-gray-200 my-2' />
                              <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Tổng số tiền</span>
                                <span className='text-gray-900 font-medium'>
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
                          className='ml-2 text-gray-600 hover:text-[#ee4d2d] transition-colors group'
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
                  {/* tiền tiết kiệm */}
                  <div className='flex items-center text-sm sm:justify-end'>
                    <div className='text-gray-500'>Tiết kiệm</div>
                    <div className='ml-7 text-[#ee4d2d]'>₫{formatCurrency(totalCheckedPurchaseSavingPrice)}</div>
                  </div>
                </div>
                {/* div chứa button 'Mua Ngay' */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
                  <Button
                    onClick={handleBuyPurchases}
                    disabled={buyPurchasesMutation.isPending || checkedPurchaseCount === 0}
                    type='submit'
                    className='mt-5 flex h-10 w-52 items-center justify-center bg-red-500 text-center text-sm capitalize text-white hover:bg-red-600 sm:ml-4 sm:mt-0 transition-all'
                  >
                    {buyPurchasesMutation.isPending ? 'Đang xử lý...' : 'mua hàng'}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </Fragment>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className='flex flex-col items-center justify-center py-20'
          >
            <div className='text-center'>
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
            <span className='mt-5 text-[0.875rem] font-bold text-black/40'>Giỏ hàng của bạn còn trống</span>
            <Link to={path.home} className='mt-5 text-left'>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
                <Button className='flex h-10 w-[168px] items-center justify-center rounded bg-red-500 text-center text-sm uppercase text-white transition-all hover:bg-red-600 sm:mt-0'>
                  Mua ngay
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Cart
