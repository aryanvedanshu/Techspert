/**
 * Button.tsx
 * 
 * Reusable button component with variants and loading state.
 * 
 * @module components/ui/Button
 */

import React from 'react'
import { Loader2 } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
    fullWidth?: boolean
}

// ============================================================================
// STYLES
// ============================================================================

const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:ring-neutral-400',
    outline: 'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-400',
    ghost: 'text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
}

const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
}

const iconSizeClasses = {
    sm: 14,
    md: 16,
    lg: 18,
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading

    return (
        <button
            {...props}
            disabled={isDisabled}
            className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
        >
            {/* Loading spinner or left icon */}
            {loading ? (
                <Loader2 size={iconSizeClasses[size]} className="animate-spin" />
            ) : (
                icon && iconPosition === 'left' && icon
            )}

            {/* Children */}
            {children}

            {/* Right icon */}
            {!loading && icon && iconPosition === 'right' && icon}
        </button>
    )
}

// ============================================================================
// ICON BUTTON
// ============================================================================

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    icon: React.ReactNode
    label: string // For accessibility
}

const iconButtonSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
}

export function IconButton({
    variant = 'ghost',
    size = 'md',
    loading = false,
    icon,
    label,
    disabled,
    className = '',
    ...props
}: IconButtonProps) {
    const isDisabled = disabled || loading

    return (
        <button
            {...props}
            disabled={isDisabled}
            aria-label={label}
            title={label}
            className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${iconButtonSizeClasses[size]}
        ${className}
      `}
        >
            {loading ? (
                <Loader2 size={iconSizeClasses[size]} className="animate-spin" />
            ) : (
                icon
            )}
        </button>
    )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default Button
