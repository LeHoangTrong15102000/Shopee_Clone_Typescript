import { useContext, useEffect } from 'react'
import useRouteElements from './useRouteElements'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { LocalStorageEventTarget } from './utils/auth'
import { AppContext } from './contexts/app.context'
import ErrorBoundary from './components/ErrorBoundary'

/**
 * Khi url thay đổi thì các component nào dùng các hook như
 * useRoutes, useParams, useSearchParams, ...
 * sẽ bị re-render
 * Ví dụ component `App` dưới đây bị re-render khi mà url thay đổi
 * Vì dùng `useRouteElements` (đây là custom hook của `useRoutes`)
 *
 */

function App() {
  const routeElements = useRouteElements()
  // Sử dụng useContext để lấy ra giá trị
  const { reset } = useContext(AppContext)
  useEffect(() => {
    // const resetLS = () => {
    //   reset()
    // }
    // lắng nghe sự kiện
    // Khi mà lắng nghe sự kiện thì chúng ta sẽ xóa cái profile, isAuthenticated, extendedPurchases
    LocalStorageEventTarget.addEventListener('clearLS', reset) // Truyền cái reset như vậy là được
    return () => {
      LocalStorageEventTarget.removeEventListener('clearLS', reset)
    }
  }, [reset])

  return (
    <div>
      <ErrorBoundary>
        <ToastContainer
          // position='top-center'
          // gutter={12}
          // containerStyle={{ margin: '8px' }}
          // toastOptions={{
          //   success: {
          //     duration: 3000
          //   },
          //   error: {
          //     duration: 5000
          //   },
          //   style: {
          //     fontSize: '16px',
          //     maxWidth: '500px',
          //     padding: '16px 24px',
          //     backgroundColor: 'var(--color-grey-0)',
          //     color: 'var(--color-grey-700)'
          //   }
          // }}
          autoClose={2000}
        />
        {routeElements}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </ErrorBoundary>
    </div>
  )
}

export default App
