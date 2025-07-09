import { Navigate, Outlet, useRoutes } from 'react-router-dom'
// import ProductList from './pages/ProductList'
// import Login from './pages/Login'
// import Register from './pages/Register'
import RegisterLayout from './layouts/RegisterLayout'
import MainLayout from './layouts/MainLayout'
import { useContext, lazy, Suspense } from 'react'
import { AppContext } from './contexts/app.context'
import path from './constant/path'
// import ProductDetail from './pages/ProductDetail'
// import Cart from './pages/Cart'
import CartLayout from './layouts/CartLayout'
import UserLayout from './pages/User/layouts/UserLayout'
import Loader from './components/Loader'
// import Profile from './pages/User/pages/Profile'
// import ChangePassword from './pages/User/pages/ChangePassword'
// import HistoryPurchases from './pages/User/pages/HistoryPurchases'
// import NotFound from './pages/NotFound'

// Khai báo lazyload cho các page
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Home = lazy(() => import('./pages/Home'))
const ProductList = lazy(() => import('./pages/ProductList'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Profile = lazy(() => import('./pages/User/pages/Profile'))
const ChangePassword = lazy(() => import('./pages/User/pages/ChangePassword'))
const HistoryPurchases = lazy(() => import('./pages/User/pages/HistoryPurchases'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Khai báo một Route Protected(Vì nó return về Outlet nên hàm này được coi là component)
function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

// Khi mà đã đăng nhập rồi thì không cho nó vào trang login và register
function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

// Đừng khai báo component trong hook em, mỗi lần hoook render là nó tạo component mới
const useRouteElements = () => {
  const routeElements = useRoutes([
    {
      path: '',
      element: <MainLayout />,
      children: [
        {
          path: path.home,
          index: true,
          element: (
            <Suspense
              // fallback={<div className='flex items-center justify-center text-center text-[#ee4d2d]'>Loading...</div>}
              fallback={<Loader />}
            >
              <Home />
            </Suspense>
          ),
          errorElement: <NotFound />
        },
        {
          path: path.products,
          element: (
            <Suspense fallback={<Loader />}>
              <ProductList />
            </Suspense>
          ),
          errorElement: <NotFound />
        },
        {
          path: path.productDetail,
          element: (
            <Suspense fallback={<Loader />}>
              <ProductDetail />
            </Suspense>
          ),
          errorElement: <NotFound />
        },
        {
          path: '*',
          element: (
            <Suspense>
              <NotFound />
            </Suspense>
          )
        }
      ]
    },
    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: path.cart,
          element: (
            <CartLayout>
              <Suspense fallback={<Loader />}>
                <Cart />
              </Suspense>
            </CartLayout>
          )
        },
        {
          path: path.user,
          element: <MainLayout />,
          // cái children trong router dùng để khai báo cho những thằng Outlet nằm bên trong UserLayout
          children: [
            {
              path: '',
              element: <UserLayout />,
              children: [
                {
                  path: path.profile,
                  element: (
                    <Suspense>
                      <Profile />
                    </Suspense>
                  )
                },
                {
                  path: path.changePassword,
                  element: (
                    <Suspense>
                      <ChangePassword />
                    </Suspense>
                  )
                },
                {
                  path: path.historyPurchases,
                  element: (
                    <Suspense>
                      <HistoryPurchases />
                    </Suspense>
                  )
                }
              ]
            }
          ]
        }
      ]
    },
    {
      path: '',
      // Cái outlet nằm bên trong rejectedRoute nên nó vẫn re-render cái RegisterLayout
      element: <RejectedRoute />,
      // Nên ở đây children sẽ là thằng con nằm trong RejectedRoute
      children: [
        {
          path: '',
          // Khi mình làm như này thì vẫn đảm bảo rằng thằng <RegisterLayout /> nó có Outlet, khi mà thằng outlet thay đổi thì nó không ảnh hưởng gì đến thằng RegisterLayout
          element: <RegisterLayout />,
          children: [
            {
              path: path.login,
              element: (
                <Suspense>
                  <Login />
                </Suspense>
              )
            },
            {
              path: path.register,
              element: (
                <Suspense>
                  <Register />
                </Suspense>
              )
            }
          ]
        }
      ]
    }
  ])
  return routeElements
}

export default useRouteElements
