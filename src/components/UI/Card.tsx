/**
 * Card.tsx
 * 
 * Card component for dashboard stats and general content.
 * 
 * @module components/ui/Card
 */

import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

// ============================================================================
// BASE CARD
// ============================================================================

export interface CardProps {
    children: React.ReactNode
    className?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hover?: boolean
    onClick?: () => void
}

const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
}

export function Card({
    children,
    className = '',
    padding = 'md',
    hover = false,
    onClick,
}: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`
        bg-white rounded-xl border border-neutral-200 shadow-sm
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    )
}

// ============================================================================
// STAT CARD
// ============================================================================

export interface StatCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    change?: number
    changeLabel?: string
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    loading?: boolean
}

const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600',
}

const iconBgClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
}

export function StatCard({
    title,
    value,
    icon,
    change,
    changeLabel = 'vs last month',
    color = 'primary',
    loading = false,
}: StatCardProps) {
    const isPositive = change !== undefined && change >= 0

    return (
        <Card className="relative overflow-hidden">
            {/* Background gradient accent */}
            <div
                className={`absolute top-0 right-0 w-24 h-24 opacity-10 bg-gradient-to-br ${colorClasses[color]} rounded-full -translate-y-8 translate-x-8`}
            />

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-neutral-500 font-medium">{title}</p>
                        {loading ? (
                            <div className="h-8 w-24 bg-neutral-200 animate-pulse rounded mt-1" />
                        ) : (
                            <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
                        )}
                    </div>
                    {icon && (
                        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
                            {icon}
                        </div>
                    )}
                </div>

                {change !== undefined && (
                    <div className="flex items-center gap-1 mt-3">
                        {isPositive ? (
                            <TrendingUp size={16} className="text-green-500" />
                        ) : (
                            <TrendingDown size={16} className="text-red-500" />
                        )}
                        <span
                            className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            {isPositive ? '+' : ''}{change}%
                        </span>
                        <span className="text-sm text-neutral-500">{changeLabel}</span>
                    </div>
                )}
            </div>
        </Card>
    )
}

// ============================================================================
// CARD HEADER
// ============================================================================

export interface CardHeaderProps {
    title: string
    subtitle?: string
    action?: React.ReactNode
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-4">
            <div>
                <h3 className="font-semibold text-neutral-900">{title}</h3>
                {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default Card
