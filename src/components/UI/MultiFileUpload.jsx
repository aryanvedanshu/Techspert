/**
 * Multi File Upload Component
 * Handles multiple file uploads to Firebase Storage
 */

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Plus } from 'lucide-react'
import { uploadMultipleFiles, validateFileType, validateFileSize } from '../../services/storageService'
import { toast } from 'sonner'
import logger from '../../utils/logger'

const MultiFileUpload = ({
  label = 'Upload Images',
  accept = 'image/*',
  maxSizeMB = 5,
  storagePath = 'uploads',
  value = [], // Array of current file URLs
  onChange = () => {}, // Callback with array of download URLs
  maxFiles = 10,
  className = '',
  required = false,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  logger.functionEntry('MultiFileUpload', { label, storagePath, currentCount: value.length })

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check max files limit
    if (value.length + files.length > maxFiles) {
      const errorMsg = `Maximum ${maxFiles} files allowed. You can add ${maxFiles - value.length} more.`
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    logger.debug('Files selected', { fileCount: files.length, files: files.map(f => f.name) })

    // Validate files
    for (const file of files) {
      if (!validateFileType(file, allowedTypes)) {
        const errorMsg = `Invalid file type: ${file.name}. Allowed: ${allowedTypes.join(', ')}`
        setError(errorMsg)
        toast.error(errorMsg)
        logger.error('Invalid file type', new Error(errorMsg), { file: file.name, type: file.type })
        return
      }

      if (!validateFileSize(file, maxSizeMB)) {
        const errorMsg = `File ${file.name} exceeds ${maxSizeMB}MB limit`
        setError(errorMsg)
        toast.error(errorMsg)
        logger.error('File size too large', new Error(errorMsg), { 
          file: file.name, 
          size: file.size,
          maxSize: maxSizeMB * 1024 * 1024
        })
        return
      }
    }

    setError(null)
    setUploading(true)

    try {
      const urls = await uploadMultipleFiles(files, storagePath)
      logger.info('Files uploaded successfully', { count: urls.length })
      const newUrls = [...value, ...urls]
      onChange(newUrls)
      toast.success(`${urls.length} file(s) uploaded successfully`)
    } catch (error) {
      logger.error('Error uploading files', error, { fileCount: files.length })
      const errorMsg = error.message || 'Failed to upload files'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index) => {
    logger.functionEntry('handleRemove', { index })
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
    toast.success('Image removed')
    logger.functionExit('handleRemove', { success: true })
  }

  const handleClick = () => {
    if (value.length < maxFiles) {
      fileInputRef.current?.click()
    } else {
      toast.error(`Maximum ${maxFiles} files allowed`)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          <span className="text-xs text-neutral-500 ml-2">
            ({value.length}/{maxFiles} files)
          </span>
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || value.length >= maxFiles}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {uploading ? (
        <div className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-primary-300 rounded-xl bg-primary-50">
          <Loader2 size={20} className="animate-spin text-primary-600" />
          <span className="text-primary-600 font-medium">Uploading...</span>
        </div>
      ) : value.length < maxFiles ? (
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 hover:border-primary-400 hover:bg-primary-50 transition-colors w-full"
        >
          <Plus size={20} className="text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700">
            Add Images ({value.length}/{maxFiles})
          </span>
        </button>
      ) : (
        <div className="p-4 border-2 border-neutral-200 rounded-xl bg-neutral-50 text-center text-sm text-neutral-500">
          Maximum {maxFiles} files reached
        </div>
      )}
    </div>
  )
}

export default MultiFileUpload

