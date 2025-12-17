/**
 * StatusBadge.tsx
 * 
 * Badge components for displaying status, roles, and other indicators.
 * 
 * @module components/ui/StatusBadge
 */

import React from 'react'

// ============================================================================
// STATUS BADGE
// ============================================================================

export type StatusType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'pending'
    | 'active'
    | 'inactive'
    | 'draft'
    | 'published'
    | 'approved'
    | 'rejected'

export interface StatusBadgeProps {
    status: StatusType | string
    label?: string
    size?: 'sm' | 'md' | 'lg'
    dot?: boolean
}

const statusColors: Record<string, string> = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    draft: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    published: 'bg-green-100 text-green-700 border-green-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
}

const statusDotColors: Record<string, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    pending: 'bg-yellow-500',
    active: 'bg-green-500',
    inactive: 'bg-neutral-400',
    draft: 'bg-neutral-400',
    published: 'bg-green-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
}

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
}

export function StatusBadge({
    status,
    label,
    size = 'md',
    dot = false
}: StatusBadgeProps) {
    const colorClass = statusColors[status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'
    const dotColorClass = statusDotColors[status] || 'bg-neutral-400'
    const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1)

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 font-medium border rounded-full
        ${colorClass} ${sizeClasses[size]}
      `}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />
            )}
            {displayLabel}
        </span>
    )
}

// ============================================================================
// ROLE BADGE
// ============================================================================

export type RoleType = 'super-admin' | 'admin' | 'editor' | 'viewer' | 'student'

export interface RoleBadgeProps {
    role: RoleType | string
    size?: 'sm' | 'md' | 'lg'
}

const roleColors: Record<string, string> = {
    'super-admin': 'bg-purple-100 text-purple-700 border-purple-200',
    admin: 'bg-blue-100 text-blue-700 border-blue-200',
    editor: 'bg-teal-100 text-teal-700 border-teal-200',
    viewer: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    student: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

const roleLabels: Record<string, string> = {
    'super-admin': 'Super Admin',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
    student: 'Student',
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
    const colorClass = roleColors[role] || 'bg-neutral-100 text-neutral-600 border-neutral-200'
    const label = roleLabels[role] || role

    return (
        <span
            className={`
        inline-flex items-center font-medium border rounded-full
        ${colorClass} ${sizeClasses[size]}
      `}
        >
            {label}
        </span>
    )
}

// ============================================================================
// BOOLEAN BADGE
// ============================================================================

export interface BooleanBadgeProps {
    value: boolean
    trueLabel?: string
    falseLabel?: string
    size?: 'sm' | 'md' | 'lg'
}

export function BooleanBadge({
    value,
    trueLabel = 'Yes',
    falseLabel = 'No',
    size = 'md',
}: BooleanBadgeProps) {
    return (
        <StatusBadge
            status={value ? 'success' : 'inactive'}
            label={value ? trueLabel : falseLabel}
            size={size}
        />
    )
}

// ============================================================================
// FEATURED BADGE
// ============================================================================

export interface FeaturedBadgeProps {
    featured: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function FeaturedBadge({ featured, size = 'md' }: FeaturedBadgeProps) {
    if (!featured) return null

    return (
        <span
            className={`
        inline-flex items-center gap-1 font-medium
        bg-gradient-to-r from-amber-400 to-orange-500 text-white
        rounded-full shadow-sm
        ${sizeClasses[size]}
      `}
        >
            ⭐ Featured
        </span>
    )
}

// ============================================================================
// LEVEL BADGE
// ============================================================================

export type LevelType = 'Beginner' | 'Intermediate' | 'Advanced'

export interface LevelBadgeProps {
    level: LevelType | string
    size?: 'sm' | 'md' | 'lg'
}

const levelColors: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700 border-green-200',
    Intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
    Advanced: 'bg-purple-100 text-purple-700 border-purple-200',
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
    const colorClass = levelColors[level] || 'bg-neutral-100 text-neutral-600 border-neutral-200'

    return (
        <span
            className={`
        inline-flex items-center font-medium border rounded-full
        ${colorClass} ${sizeClasses[size]}
      `}
        >
            {level}
        </span>
    )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default StatusBadge
