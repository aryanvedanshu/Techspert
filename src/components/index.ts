/**
 * Components Index
 * 
 * Central export file for all reusable components.
 * 
 * @module components
 */

// ============================================================================
// UI COMPONENTS
// ============================================================================

export { Button, IconButton } from './ui/Button'
export type { ButtonProps, IconButtonProps } from './ui/Button'

export { Modal, ConfirmDialog } from './ui/Modal'
export type { ModalProps, ConfirmDialogProps } from './ui/Modal'

export {
    StatusBadge,
    RoleBadge,
    BooleanBadge,
    FeaturedBadge,
    LevelBadge
} from './ui/StatusBadge'
export type {
    StatusBadgeProps,
    RoleBadgeProps,
    BooleanBadgeProps,
    FeaturedBadgeProps,
    LevelBadgeProps,
    StatusType,
    RoleType,
    LevelType,
} from './ui/StatusBadge'

export { default as ToastProvider, useToast } from './ui/Toast'
export type { Toast, ToastType } from './ui/Toast'

export { Card, StatCard, CardHeader } from './ui/Card'
export type { CardProps, StatCardProps, CardHeaderProps } from './ui/Card'

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export { default as FormField } from './forms/FormField'
export type { FormFieldProps, FieldType, SelectOption } from './forms/FormField'

export { default as FileUpload } from './forms/FileUpload'
export type { FileUploadProps, UploadedFile } from './forms/FileUpload'

// ============================================================================
// TABLE COMPONENTS
// ============================================================================

export { default as DataTable } from './tables/DataTable'
export type { DataTableProps, Column } from './tables/DataTable'
