import { useContext, useEffect } from 'react'
import useRouteElements from './useRouteElements'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { LocalStorageEventTarget } from './utils/auth'
import { AppContext } from './contexts/app.context'

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
      <ToastContainer autoClose={4000} />
      {routeElements}
    </div>
  )
}

export default App
