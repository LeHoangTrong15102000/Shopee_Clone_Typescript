import { useEffect } from 'react'
import Footer from 'src/components/Footer'
import Header from 'src/components/Header'

interface Props {
  children: React.ReactNode
}

const MainLayout = ({ children }: Props) => {
  // useEffect khi mà load đến trang nào đó thì nó sẽ scroll lên đầu trang đó cho mình
  useEffect(() => {
    window.scrollTo(0, 0)
  })

  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  )
}

export default MainLayout
