import { memo, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from 'src/components/Footer'
import Header from 'src/components/Header'

interface Props {
  children?: React.ReactNode
}

const MainLayoutInner = ({ children }: Props) => {
  // useEffect khi mà load đến trang nào đó thì nó sẽ scroll lên đầu trang đó cho mình
  // console.log('MainLayout')
  // useEffect(() => {
  //   window.scrollTo(0, 0)
  // }, [])

  return (
    <div>
      <Header />
      {children}
      <Outlet />
      <Footer />
    </div>
  )
}

const MainLayout = memo(MainLayoutInner)

export default MainLayout
