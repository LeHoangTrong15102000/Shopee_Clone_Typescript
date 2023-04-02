import { useEffect } from 'react'
import CartHeader from 'src/components/CartHeader'
import Footer from 'src/components/Footer'

interface Props {
  children: React.ReactNode
}

const CartLayout = ({ children }: Props) => {
  // useEffect khi mà load đến trang nào đó thì nó sẽ scroll lên đầu trang đó cho mình
  useEffect(() => {
    window.scrollTo(0, 0)
  })

  return (
    <div>
      <CartHeader />
      {children}
      <Footer />
    </div>
  )
}

export default CartLayout
