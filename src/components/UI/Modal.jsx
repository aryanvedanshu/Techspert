import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'relative w-full bg-white rounded-3xl shadow-large',
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-xl font-heading font-semibold text-neutral-900">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className={clsx('p-6', !title && 'pt-6', 'max-h-[calc(100vh-200px)] overflow-y-auto')}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
