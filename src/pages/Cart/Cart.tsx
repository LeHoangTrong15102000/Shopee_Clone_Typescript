import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import purchaseApi from 'src/apis/purchases.api'
import path from 'src/constant/path'
import { purchasesStatus } from 'src/constant/purchase'
import { AppContext } from 'src/contexts/app.context'

import { formatCurrency, generateNameId } from 'src/utils/utils'
import { produce } from 'immer'
import keyBy from 'lodash/keyBy'
import { toast } from 'react-toastify'
import noproduct from '../../assets/images/img-product-incart.png'
import { useOptimisticUpdateQuantity, useOptimisticRemoveFromCart, TOAST_MESSAGES } from 'src/hooks/optimistic'
import useCartSync from 'src/hooks/useCartSync'
import CartSyncIndicator from 'src/components/CartSyncIndicator'
import RealTimeStockAlert from 'src/components/RealTimeStockAlert'
import { useSaveForLater, SavedItem } from 'src/hooks/useSaveForLater'
import SaveForLaterSection from 'src/components/SaveForLaterSection'
import useAnimatedNumber from 'src/hooks/useAnimatedNumber'
import CartItemList from './components/CartItemList'
import CartSummaryBar from './components/CartSummaryBar'
import EmptyCartState from './components/EmptyCartState'
import { ExtendedPurchase, InlineStockAlertState } from './types'

export type { ExtendedPurchase, InlineStockAlertState }

// isAuthenticated mới vào được cái page này
const Cart = () => {
  // const [extendedPurchases, setExtendedPurchases] = useState<ExtendedPurchase[]>([])
  const { extendedPurchases, setExtendedPurchases } = useContext(AppContext)
  const queryClient = useQueryClient()

  // State for inline stock alerts on individual cart items
  const [inlineAlerts, setInlineAlerts] = useState<Map<string, InlineStockAlertState>>(new Map())

  // WebSocket: Real-time cart sync across devices
  const { lastSyncTimestamp, isSyncing } = useCartSync()

  // useQuery để gọi purchaseList hiển thị Cart product
  const { data: purchasesInCartData } = useQuery({
    queryKey: ['purchases', { status: purchasesStatus.inCart }],
    queryFn: async () => await purchaseApi.getPurchases({ status: purchasesStatus.inCart })
  })

  // Sử dụng Optimistic Updates cho update quantity
  const updatePurchaseMutation = useOptimisticUpdateQuantity()

  // deleteProduct Mutation với Optimistic Updates
  const deletePurchasesMutation = useOptimisticRemoveFromCart()

  // Save for Later hook
  const { savedItems, saveForLater, removeFromSaved, clearSaved } = useSaveForLater()

  // Add to cart mutation for moving saved items back to cart
  const addToCartMutation = useMutation({
    mutationFn: (body: { product_id: string; buy_count: number }) => purchaseApi.addToCart(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
      toast.success(TOAST_MESSAGES.MOVE_TO_CART_SUCCESS, { position: 'top-center', autoClose: 1500 })
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.ADD_TO_CART_ERROR, { position: 'top-center', autoClose: 1500 })
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

  // Animated number counting for total price and savings
  const animatedTotalPrice = useAnimatedNumber(totalCheckedPurchasePrice)
  const animatedSavingsPrice = useAnimatedNumber(totalCheckedPurchaseSavingPrice)

  // Extract product IDs from cart items for real-time stock monitoring
  const cartProductIds = useMemo(() => extendedPurchases.map((purchase) => purchase.product._id), [extendedPurchases])

  // Handler for real-time stock changes - invalidate queries and show inline alerts
  const handleStockChange = useCallback(
    (productId: string, newStock: number) => {
      // Find the product in cart to get its name
      const purchase = extendedPurchases.find((p) => p.product._id === productId)
      if (!purchase) return

      // Add inline alert for this product
      setInlineAlerts((prev) => {
        const newMap = new Map(prev)
        newMap.set(productId, {
          productId,
          productName: purchase.product.name,
          newStock,
          severity: newStock === 0 ? 'critical' : newStock <= 5 ? 'critical' : 'warning'
        })
        return newMap
      })

      // Invalidate purchases query to refresh stock data
      queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
    },
    [extendedPurchases, queryClient]
  )

  // Handler to dismiss inline alert for a specific product
  const handleDismissInlineAlert = useCallback((productId: string) => {
    setInlineAlerts((prev) => {
      const newMap = new Map(prev)
      newMap.delete(productId)
      return newMap
    })
  }, [])

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

  // func xử lý sự kiện onIncrease và onDecrease của cái QuantityController trong Cart với Optimistic Updates
  const handleQuantity = (purchaseIndex: number, value: number, enabled: boolean) => {
    if (enabled) {
      const purchase = extendedPurchases[purchaseIndex] // lấy ra cái purchase

      // Với Optimistic Updates, không cần disable UI
      // setExtendedPurchases sẽ được xử lý trong hook useOptimisticUpdateQuantity

      // Gọi Api update với optimistic behavior
      updatePurchaseMutation.mutate({
        product_id: purchase.product._id,
        buy_count: value
      })
    }
  }

  // func xử lý xóa 1 sản phẩm với Optimistic Updates
  const handleDelete = (purchaseIndex: number) => () => {
    const purchaseId = extendedPurchases[purchaseIndex]._id
    deletePurchasesMutation.mutate([purchaseId])
  }

  // func xử lý xóa nhiều sản phẩm với Optimistic Updates
  const handleDeleteManyPurchases = () => {
    // lấy ra các mảng purchasesIds từ mảng filter checkedPurchase
    const purchaseIds = checkedPurchases.map((purchase) => purchase._id)
    deletePurchasesMutation.mutate(purchaseIds)
  }

  // func xử lý lưu sản phẩm để mua sau
  const handleSaveForLater = (purchaseIndex: number) => () => {
    const purchase = extendedPurchases[purchaseIndex]
    const wasAdded = saveForLater(purchase.product, purchase.buy_count)

    if (wasAdded) {
      // Remove from cart after saving
      deletePurchasesMutation.mutate([purchase._id])
      toast.success(TOAST_MESSAGES.SAVE_FOR_LATER_SUCCESS, { position: 'top-center', autoClose: 1500 })
    } else {
      toast.info(TOAST_MESSAGES.SAVE_FOR_LATER_ALREADY_SAVED, { position: 'top-center', autoClose: 1500 })
    }
  }

  // func xử lý chuyển sản phẩm đã lưu vào giỏ hàng
  const handleMoveToCart = (item: SavedItem) => {
    // Check if product is already in cart
    const existingInCart = extendedPurchases.find((p) => p.product._id === item.product._id)

    if (existingInCart) {
      // Product already in cart, just remove from saved
      removeFromSaved(item.product._id)
      toast.info('Sản phẩm đã có trong giỏ hàng', { position: 'top-center', autoClose: 1500 })
    } else {
      // Add to cart with original quantity
      addToCartMutation.mutate(
        { product_id: item.product._id, buy_count: item.originalBuyCount },
        {
          onSuccess: () => {
            removeFromSaved(item.product._id)
          }
        }
      )
    }
  }

  // func xử lý xóa tất cả sản phẩm đã lưu
  const handleClearSaved = () => {
    clearSaved()
    toast.success(TOAST_MESSAGES.CLEAR_SAVED_SUCCESS, { position: 'top-center', autoClose: 1500 })
  }

  // func xử lý buy product - chuyển đến trang checkout
  const handleBuyPurchases = () => {
    if (checkedPurchases.length > 0) {
      // Chuyển đến trang checkout thay vì mua trực tiếp
      navigate(path.checkout)
    }
  }
  return (
    <div className='border-b-4 border-b-[#ee4d2d] bg-neutral-100 dark:bg-slate-900 py-6 md:py-8'>
      <div className='container'>
        {extendedPurchases.length > 0 ? (
          <Fragment>
            {/* Real-time stock alerts for products in cart */}
            <RealTimeStockAlert productIds={cartProductIds} onStockChange={handleStockChange} />

            {/* Cart sync indicator - real-time sync status */}
            <div className='mb-2 flex items-center justify-end'>
              <CartSyncIndicator isSyncing={isSyncing} lastSyncTimestamp={lastSyncTimestamp} />
            </div>

            {/* Cart items list - desktop table + mobile cards */}
            <CartItemList
              extendedPurchases={extendedPurchases}
              purchasesInCart={purchasesInCart}
              isAllChecked={isAllChecked}
              inlineAlerts={inlineAlerts}
              handleChecked={handleChecked}
              handleCheckedAll={handleCheckedAll}
              handleQuantity={handleQuantity}
              handleTypeQuantity={handleTypeQuantity}
              handleDelete={handleDelete}
              handleSaveForLater={handleSaveForLater}
              handleDismissInlineAlert={handleDismissInlineAlert}
              path={path}
              formatCurrency={formatCurrency}
              generateNameId={generateNameId}
            />

            {/* Save for Later Section */}
            <SaveForLaterSection
              savedItems={savedItems}
              onMoveToCart={handleMoveToCart}
              onRemove={removeFromSaved}
              onClear={handleClearSaved}
            />

            {/* Sticky bottom summary bar */}
            <CartSummaryBar
              extendedPurchases={extendedPurchases}
              isAllChecked={isAllChecked}
              checkedPurchaseCount={checkedPurchaseCount}
              animatedTotalPrice={animatedTotalPrice}
              animatedSavingsPrice={animatedSavingsPrice}
              totalCheckedPurchasePrice={totalCheckedPurchasePrice}
              totalCheckedPurchaseSavingPrice={totalCheckedPurchaseSavingPrice}
              handleCheckedAll={handleCheckedAll}
              handleDeleteManyPurchases={handleDeleteManyPurchases}
              handleBuyPurchases={handleBuyPurchases}
              formatCurrency={formatCurrency}
            />
          </Fragment>
        ) : (
          <EmptyCartState
            savedItems={savedItems}
            handleMoveToCart={handleMoveToCart}
            removeFromSaved={removeFromSaved}
            handleClearSaved={handleClearSaved}
            noproduct={noproduct}
            path={path}
          />
        )}
      </div>
    </div>
  )
}

export default Cart
