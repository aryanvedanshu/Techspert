/**
 * FileUpload.tsx
 * 
 * Drag-and-drop file upload component with progress tracking.
 * 
 * Features:
 * - Drag and drop support
 * - Click to browse
 * - Progress bar
 * - Preview for images
 * - Multiple file support
 * - File type validation
 * - Size limit
 * 
 * @module components/forms/FileUpload
 */

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, File, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedFile {
    file: File
    preview?: string
    progress: number
    status: 'pending' | 'uploading' | 'success' | 'error'
    url?: string
    error?: string
}

export interface FileUploadProps {
    value?: string | string[]
    onChange: (urls: string | string[]) => void
    onUpload: (file: File, onProgress: (progress: number) => void) => Promise<string>
    multiple?: boolean
    accept?: string
    maxSize?: number // in MB
    maxFiles?: number
    disabled?: boolean
    className?: string

    // Display
    label?: string
    helperText?: string

    // Preview
    showPreview?: boolean
    previewSize?: 'sm' | 'md' | 'lg'
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FileUpload({
    value,
    onChange,
    onUpload,
    multiple = false,
    accept = 'image/*',
    maxSize = 5,
    maxFiles = 10,
    disabled = false,
    className = '',
    label = 'Upload file',
    helperText,
    showPreview = true,
    previewSize = 'md',
}: FileUploadProps) {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Get existing URLs as array
    const existingUrls = React.useMemo(() => {
        if (!value) return []
        return Array.isArray(value) ? value : [value]
    }, [value])

    // Preview size classes
    const previewSizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
    }

    // Validate file
    const validateFile = (file: File): string | null => {
        if (maxSize && file.size > maxSize * 1024 * 1024) {
            return `File size must be less than ${maxSize}MB`
        }

        if (accept && accept !== '*') {
            const acceptedTypes = accept.split(',').map((t) => t.trim())
            const fileType = file.type
            const fileExt = `.${file.name.split('.').pop()}`

            const isAccepted = acceptedTypes.some((type) => {
                if (type.startsWith('.')) {
                    return fileExt.toLowerCase() === type.toLowerCase()
                }
                if (type.endsWith('/*')) {
                    return fileType.startsWith(type.replace('/*', '/'))
                }
                return fileType === type
            })

            if (!isAccepted) {
                return `File type not accepted. Allowed: ${accept}`
            }
        }

        return null
    }

    // Handle file selection
    const handleFiles = useCallback(async (fileList: FileList) => {
        const newFiles: UploadedFile[] = []
        const totalFiles = existingUrls.length + files.length + fileList.length

        if (!multiple && fileList.length > 1) {
            alert('Only one file can be uploaded')
            return
        }

        if (totalFiles > maxFiles) {
            alert(`Maximum ${maxFiles} files allowed`)
            return
        }

        for (const file of Array.from(fileList)) {
            const error = validateFile(file)

            const uploadedFile: UploadedFile = {
                file,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                progress: 0,
                status: error ? 'error' : 'pending',
                error,
            }

            newFiles.push(uploadedFile)
        }

        setFiles((prev) => [...prev, ...newFiles])

        // Upload files without errors
        for (let i = 0; i < newFiles.length; i++) {
            const uploadedFile = newFiles[i]
            if (uploadedFile.status === 'error') continue

            try {
                // Update status to uploading
                setFiles((prev) =>
                    prev.map((f) =>
                        f.file === uploadedFile.file ? { ...f, status: 'uploading' } : f
                    )
                )

                const url = await onUpload(uploadedFile.file, (progress) => {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.file === uploadedFile.file ? { ...f, progress } : f
                        )
                    )
                })

                // Update status to success
                setFiles((prev) =>
                    prev.map((f) =>
                        f.file === uploadedFile.file
                            ? { ...f, status: 'success', url, progress: 100 }
                            : f
                    )
                )

                // Update parent value
                const successUrls = [...existingUrls, url]
                onChange(multiple ? successUrls : successUrls[0])
            } catch (error) {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.file === uploadedFile.file
                            ? { ...f, status: 'error', error: 'Upload failed' }
                            : f
                    )
                )
            }
        }
    }, [existingUrls, files.length, maxFiles, multiple, onChange, onUpload])

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (!disabled) setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (!disabled && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }

    // Remove file
    const removeFile = (index: number, isExisting: boolean) => {
        if (isExisting) {
            const newUrls = existingUrls.filter((_, i) => i !== index)
            onChange(multiple ? newUrls : newUrls[0] || '')
        } else {
            const adjustedIndex = index - existingUrls.length
            const file = files[adjustedIndex]
            if (file.preview) {
                URL.revokeObjectURL(file.preview)
            }
            setFiles((prev) => prev.filter((_, i) => i !== adjustedIndex))
        }
    }

    // Render file preview
    const renderPreview = (
        url: string,
        index: number,
        isExisting: boolean,
        status?: UploadedFile['status'],
        progress?: number,
        error?: string
    ) => {
        const isImage = url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || url.startsWith('blob:')

        return (
            <div
                key={`${isExisting ? 'existing' : 'new'}-${index}`}
                className={`relative ${previewSizeClasses[previewSize]} group`}
            >
                <div className={`w-full h-full rounded-lg border-2 overflow-hidden ${error ? 'border-red-300' : status === 'success' ? 'border-green-300' : 'border-neutral-200'
                    }`}>
                    {isImage ? (
                        <img
                            src={url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                            <File size={24} className="text-neutral-400" />
                        </div>
                    )}

                    {/* Progress overlay */}
                    {status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-center">
                                <Loader2 size={24} className="animate-spin mx-auto mb-1" />
                                <span className="text-xs">{Math.round(progress || 0)}%</span>
                            </div>
                        </div>
                    )}

                    {/* Status icons */}
                    {status === 'success' && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                            <CheckCircle size={14} />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                            <AlertCircle size={14} />
                        </div>
                    )}
                </div>

                {/* Remove button */}
                {!disabled && (
                    <button
                        type="button"
                        onClick={() => removeFile(index, isExisting)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} />
                    </button>
                )}

                {/* Error tooltip */}
                {error && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-red-500 text-white text-xs rounded whitespace-nowrap">
                        {error}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-neutral-700">
                    {label}
                </label>
            )}

            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
                className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${isDragging ? 'border-primary-400 bg-primary-50' : 'border-neutral-300 hover:border-primary-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    disabled={disabled}
                    className="hidden"
                />

                <Upload size={32} className={`mx-auto mb-2 ${isDragging ? 'text-primary-500' : 'text-neutral-400'}`} />
                <p className="text-sm text-neutral-600">
                    <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                    {accept === 'image/*' ? 'PNG, JPG, GIF' : accept} up to {maxSize}MB
                </p>
            </div>

            {/* Helper text */}
            {helperText && (
                <p className="text-sm text-neutral-500">{helperText}</p>
            )}

            {/* Previews */}
            {showPreview && (existingUrls.length > 0 || files.length > 0) && (
                <div className="flex flex-wrap gap-3">
                    {/* Existing files */}
                    {existingUrls.map((url, index) => renderPreview(url, index, true))}

                    {/* New files */}
                    {files.map((file, index) =>
                        renderPreview(
                            file.preview || file.url || '',
                            existingUrls.length + index,
                            false,
                            file.status,
                            file.progress,
                            file.error
                        )
                    )}
                </div>
            )}
        </div>
    )
}

export default FileUpload
