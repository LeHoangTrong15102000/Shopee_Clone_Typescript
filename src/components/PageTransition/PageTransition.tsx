import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { pageTransition, pageTransitionReduced } from 'src/styles/animations'

interface Props {
  children: React.ReactNode
}

const PageTransition = ({ children }: Props) => {
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  const variants = reducedMotion ? pageTransitionReduced : pageTransition

  return (
    <motion.div
      key={location.pathname}
      variants={variants}
      initial='initial'
      animate='animate'
      exit='exit'
    >
      {children}
    </motion.div>
  )
}

export default PageTransition

