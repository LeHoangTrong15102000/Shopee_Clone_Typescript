import React, { useEffect } from 'react'
import Footer from 'src/components/Footer'
import RegisterHeader from 'src/components/RegisterHeader'

interface Props {
  children?: React.ReactNode // này có cũng được không có cũng được
}

const RegisterLayout = ({ children }: Props) => {
  // useEffect khi mà load đến trang nào đó thì nó sẽ scroll lên đầu trang đó cho mình
  useEffect(() => {
    window.scrollTo(0, 0)
  })

  return (
    <div>
      <RegisterHeader />
      {children}
      <Footer />
    </div>
  )
}

export default RegisterLayout
