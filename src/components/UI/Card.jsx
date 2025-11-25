import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const Card = forwardRef(({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  ...props 
}, ref) => {
  const baseClasses = 'bg-white rounded-3xl border border-neutral-100 transition-all duration-300'
  
  const hoverClasses = hover ? 'hover:-translate-y-2 hover:shadow-large' : 'shadow-soft hover:shadow-medium'
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  }
  
  const classes = clsx(
    baseClasses,
    hoverClasses,
    paddingClasses[padding],
    className
  )

  return (
    <motion.div
      ref={ref}
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

Card.displayName = 'Card'

export default Card