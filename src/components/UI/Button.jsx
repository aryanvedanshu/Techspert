import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-medium hover:shadow-large hover:-translate-y-0.5 focus:ring-primary-200',
    secondary: 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 shadow-soft hover:shadow-medium hover:-translate-y-0.5 focus:ring-neutral-200',
    outline: 'bg-transparent hover:bg-primary-50 text-primary-600 border-2 border-primary-200 hover:border-primary-300 focus:ring-primary-200',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 focus:ring-neutral-200',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-medium hover:shadow-large hover:-translate-y-0.5 focus:ring-red-200',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
  }
  
  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  )

  return (
    <motion.button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button