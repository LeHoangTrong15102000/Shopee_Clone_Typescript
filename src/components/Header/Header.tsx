import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import authApi from 'src/apis/auth.api'
import { toast } from 'react-toastify'
import { purchasesStatus } from 'src/constant/purchase'
import purchaseApi from 'src/apis/purchases.api'
import NavHeader from '../NavHeader'
import { useProductQueryStates } from 'src/hooks/nuqs'
import { SearchBar, CartDropdown, UserMenu } from './components'

const Header = () => {
  const [filters, setFilters] = useProductQueryStates()

  const { setIsAuthenticated, isAuthenticated, setProfile, profile } = useContext(AppContext)
  const queryClient = useQueryClient()

  // useQuery để gọi purchaseList hiển thị Cart product
  const { data: purchasesInCartData } = useQuery({
    queryKey: ['purchases', { status: purchasesStatus.inCart }],
    queryFn: () => purchaseApi.getPurchases({ status: purchasesStatus.inCart }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  })

  const purchasesInCart = purchasesInCartData?.data.data

  // useMutation để logout
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logoutAccount(),
    onSuccess: () => {
      setIsAuthenticated(false)
      setProfile(null)
      toast.success('Đăng xuất thành công', { autoClose: 1000 })
      queryClient.removeQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }], exact: true })
    }
  })

  const handleLogout = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

  return (
    <div className='bg-[linear-gradient(-180deg,#f53d2d,#f63)] pb-3 md:pb-[25px] pt-[4px] text-white'>
      <div className='container'>
        {/* NavHeader - Full version on desktop only */}
        <div className='hidden md:block'>
          <NavHeader />
        </div>

        {/* Mobile: compact header - search dominates (no logo, Shopee mobile pattern) */}
        <div className='flex md:hidden items-center gap-2 py-2'>
          <SearchBar filters={filters} setFilters={setFilters} />
          <CartDropdown purchasesInCart={purchasesInCart} isAuthenticated={isAuthenticated} />
          <UserMenu isAuthenticated={isAuthenticated} profile={profile} onLogout={handleLogout} />
        </div>
      </div>
    </div>
  )
}

export default Header
