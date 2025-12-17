/**
 * Toast.tsx
 * 
 * Toast notification system for success, error, and info messages.
 * 
 * Features:
 * - Multiple toast types
 * - Auto-dismiss
 * - Progress bar
 * - Action buttons
 * - Stacking
 * 
 * @module components/ui/Toast
 */

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastContextValue {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null)

// ============================================================================
// PROVIDER
// ============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { ...toast, id }])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

// ============================================================================
// HOOK
// ============================================================================

export function useToast() {
    const context = useContext(ToastContext)

    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }

    const { addToast, removeToast } = context

    return {
        toast: addToast,
        success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
        error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
        warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
        info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
        dismiss: removeToast,
    }
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

interface ToastContainerProps {
    toasts: Toast[]
    removeToast: (id: string) => void
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

// ============================================================================
// TOAST ITEM
// ============================================================================

interface ToastItemProps {
    toast: Toast
    onClose: () => void
}

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

const colorMap = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColorMap = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
}

const progressColorMap = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
}

function ToastItem({ toast, onClose }: ToastItemProps) {
    const [progress, setProgress] = useState(100)
    const [isPaused, setIsPaused] = useState(false)
    const duration = toast.duration || 5000

    const Icon = iconMap[toast.type]

    useEffect(() => {
        if (isPaused) return

        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev - (100 / (duration / 100))
                if (next <= 0) {
                    onClose()
                    return 0
                }
                return next
            })
        }, 100)

        return () => clearInterval(interval)
    }, [duration, isPaused, onClose])

    return (
        <div
            className={`
        pointer-events-auto w-80 rounded-lg border shadow-lg overflow-hidden
        animate-slideIn ${colorMap[toast.type]}
      `}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <Icon size={20} className={iconColorMap[toast.type]} />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium">{toast.title}</p>
                        {toast.message && (
                            <p className="text-sm opacity-80 mt-1">{toast.message}</p>
                        )}
                        {toast.action && (
                            <button
                                onClick={toast.action.onClick}
                                className="text-sm font-medium underline mt-2 hover:no-underline"
                            >
                                {toast.action.label}
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-black/10">
                <div
                    className={`h-full transition-all duration-100 ${progressColorMap[toast.type]}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ToastProvider
