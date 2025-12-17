/**
 * FormField.tsx
 * 
 * Auto-mapped form field component that renders the appropriate input based on field type.
 * Designed to work with Firestore schema types.
 * 
 * Features:
 * - Auto-maps types to components
 * - Validation support
 * - Error display
 * - Label and helper text
 * - Required indicator
 * 
 * @module components/forms/FormField
 */

import React from 'react'
import { AlertCircle } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type FieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'richtext'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'switch'
    | 'date'
    | 'datetime'
    | 'file'
    | 'url'
    | 'phone'
    | 'tags'
    | 'color'

export interface SelectOption {
    value: string
    label: string
}

export interface FormFieldProps {
    name: string
    label: string
    type?: FieldType
    value: unknown
    onChange: (value: unknown) => void
    onBlur?: () => void
    error?: string
    helperText?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean

    // For select/multiselect
    options?: SelectOption[]

    // For number
    min?: number
    max?: number
    step?: number

    // For textarea
    rows?: number

    // For file
    accept?: string

    // Custom className
    className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FormField({
    name,
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    helperText,
    placeholder,
    required = false,
    disabled = false,
    readOnly = false,
    options = [],
    min,
    max,
    step,
    rows = 3,
    accept,
    className = '',
}: FormFieldProps) {
    const inputId = `field-${name}`
    const hasError = !!error

    // Base input classes
    const baseInputClasses = `
    w-full px-4 py-2.5 border rounded-lg transition-all duration-200
    focus:ring-2 focus:ring-primary-100 focus:border-primary-300
    disabled:bg-neutral-100 disabled:cursor-not-allowed
    ${hasError ? 'border-red-300 focus:border-red-300 focus:ring-red-100' : 'border-neutral-200'}
    ${className}
  `.trim()

    // Render input based on type
    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        id={inputId}
                        name={name}
                        value={String(value || '')}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                        rows={rows}
                        className={baseInputClasses}
                    />
                )

            case 'select':
                return (
                    <select
                        id={inputId}
                        name={name}
                        value={String(value || '')}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={baseInputClasses}
                    >
                        <option value="">{placeholder || `Select ${label}`}</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )

            case 'multiselect':
                return (
                    <select
                        id={inputId}
                        name={name}
                        multiple
                        value={Array.isArray(value) ? value : []}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, (opt) => opt.value)
                            onChange(selected)
                        }}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={`${baseInputClasses} min-h-[120px]`}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )

            case 'checkbox':
            case 'switch':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id={inputId}
                            name={name}
                            checked={Boolean(value)}
                            onChange={(e) => onChange(e.target.checked)}
                            onBlur={onBlur}
                            disabled={disabled}
                            className={`
                ${type === 'switch' ? 'toggle' : 'rounded'}
                border-neutral-300 text-primary-600 focus:ring-primary-500
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        />
                        <label htmlFor={inputId} className="ml-2 text-sm text-neutral-700">
                            {placeholder || label}
                        </label>
                    </div>
                )

            case 'number':
                return (
                    <input
                        type="number"
                        id={inputId}
                        name={name}
                        value={value !== undefined && value !== null ? Number(value) : ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                        min={min}
                        max={max}
                        step={step}
                        className={baseInputClasses}
                    />
                )

            case 'date':
                return (
                    <input
                        type="date"
                        id={inputId}
                        name={name}
                        value={value ? String(value).substring(0, 10) : ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        disabled={disabled}
                        readOnly={readOnly}
                        className={baseInputClasses}
                    />
                )

            case 'datetime':
                return (
                    <input
                        type="datetime-local"
                        id={inputId}
                        name={name}
                        value={value ? String(value).substring(0, 16) : ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        disabled={disabled}
                        readOnly={readOnly}
                        className={baseInputClasses}
                    />
                )

            case 'color':
                return (
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            id={inputId}
                            name={name}
                            value={String(value || '#000000')}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onBlur}
                            disabled={disabled}
                            className="w-12 h-10 p-1 border border-neutral-200 rounded-lg cursor-pointer"
                        />
                        <input
                            type="text"
                            value={String(value || '')}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="#000000"
                            disabled={disabled}
                            className={`${baseInputClasses} flex-1`}
                        />
                    </div>
                )

            case 'tags':
                return (
                    <TagInput
                        value={Array.isArray(value) ? value : []}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                )

            case 'url':
            case 'email':
            case 'phone':
            case 'password':
            case 'text':
            default:
                return (
                    <input
                        type={type === 'url' ? 'url' : type === 'phone' ? 'tel' : type}
                        id={inputId}
                        name={name}
                        value={String(value || '')}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                        className={baseInputClasses}
                    />
                )
        }
    }

    // Don't show label for checkbox/switch (label is inline)
    const showLabel = type !== 'checkbox' && type !== 'switch'

    return (
        <div className="space-y-1.5">
            {/* Label */}
            {showLabel && (
                <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input */}
            {renderInput()}

            {/* Error or helper text */}
            {(error || helperText) && (
                <p className={`text-sm flex items-center gap-1 ${hasError ? 'text-red-500' : 'text-neutral-500'}`}>
                    {hasError && <AlertCircle size={14} />}
                    {error || helperText}
                </p>
            )}
        </div>
    )
}

// ============================================================================
// TAG INPUT SUBCOMPONENT
// ============================================================================

interface TagInputProps {
    value: string[]
    onChange: (value: unknown) => void
    placeholder?: string
    disabled?: boolean
}

function TagInput({ value, onChange, placeholder, disabled }: TagInputProps) {
    const [input, setInput] = React.useState('')

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault()
            if (!value.includes(input.trim())) {
                onChange([...value, input.trim()])
            }
            setInput('')
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            onChange(value.slice(0, -1))
        }
    }

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove))
    }

    return (
        <div className="border border-neutral-200 rounded-lg p-2 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100">
            <div className="flex flex-wrap gap-2">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-md"
                    >
                        {tag}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-primary-900"
                            >
                                ×
                            </button>
                        )}
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    disabled={disabled}
                    className="flex-1 min-w-[120px] outline-none text-sm py-1"
                />
            </div>
        </div>
    )
}

export default FormField
