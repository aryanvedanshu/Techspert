import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Avatar = forwardRef(({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  fallback,
  ...props 
}, ref) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const classes = clsx(
    'inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold overflow-hidden',
    sizeClasses[size],
    className
  )

  return (
    <div ref={ref} className={classes} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{fallback || alt?.charAt(0) || '?'}</span>
      )}
    </div>
  )
})

Avatar.displayName = 'Avatar'

export default Avatar
