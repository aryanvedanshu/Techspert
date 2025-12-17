/**
 * Modal.tsx
 * 
 * Reusable modal/dialog component with overlay.
 * 
 * Features:
 * - Backdrop overlay with click-away
 * - Keyboard escape to close
 * - Size variants
 * - Animations
 * - Focus trap
 * 
 * @module components/ui/Modal
 */

import React, { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    description?: string
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    showCloseButton?: boolean
    closeOnOverlayClick?: boolean
    closeOnEscape?: boolean
    footer?: React.ReactNode
    className?: string
}

// ============================================================================
// SIZE CLASSES
// ============================================================================

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    footer,
    className = '',
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    // Handle escape key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape') {
                onClose()
            }
        },
        [closeOnEscape, onClose]
    )

    // Handle overlay click
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose()
        }
    }

    // Focus management
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement
            modalRef.current?.focus()
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleKeyDown)
        } else {
            document.body.style.overflow = ''
            previousActiveElement.current?.focus()
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleKeyDown])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className={`
          ${sizeClasses[size]} w-full bg-white rounded-2xl shadow-2xl
          animate-slideUp outline-none ${className}
        `}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-start justify-between p-6 border-b border-neutral-100">
                        <div>
                            {title && (
                                <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id="modal-description" className="mt-1 text-sm text-neutral-500">
                                    {description}
                                </p>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// CONFIRM DIALOG
// ============================================================================

export interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
    loading?: boolean
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    const handleConfirm = async () => {
        await onConfirm()
        onClose()
    }

    const variantClasses = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            showCloseButton={false}
            footer={
                <>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 ${variantClasses[variant]}`}
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {confirmText}
                    </button>
                </>
            }
        >
            <p className="text-neutral-600">{message}</p>
        </Modal>
    )
}

export default Modal
