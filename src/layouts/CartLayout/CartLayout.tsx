import { lazy, Suspense } from 'react'
import CartHeader from 'src/components/CartHeader'
import Footer from 'src/components/Footer'
import PageTransition from 'src/components/PageTransition'

// Lazy load BackToTop - matching pattern from MainLayout
const BackToTop = lazy(() => import('src/components/BackToTop'))

interface Props {
  children: React.ReactNode
  headerTitle?: string
}

const CartLayout = ({ children, headerTitle }: Props) => {
  return (
    <div className='min-h-screen bg-gray-100 dark:bg-slate-900'>
      <CartHeader title={headerTitle} />
      <PageTransition>
        {children}
      </PageTransition>
      <Footer />
      {/* Back to top button */}
      <Suspense fallback={null}>
        <BackToTop />
      </Suspense>
    </div>
  )
}

export default CartLayout
