/**
 * File Upload Component
 * Handles file uploads to Firebase Storage with preview
 */

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadFile, validateFileType, validateFileSize } from '../../services/storageService'
import { toast } from 'sonner'
import logger from '../../utils/logger'

const FileUpload = ({
  label = 'Upload File',
  accept = 'image/*',
  maxSizeMB = 5,
  storagePath = 'uploads',
  value = null, // Current file URL
  onChange = () => {}, // Callback with download URL
  onRemove = () => {}, // Callback when file is removed
  multiple = false,
  showPreview = true,
  className = '',
  required = false,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  logger.functionEntry('FileUpload', { label, storagePath, hasValue: !!value })

  // Update preview when value changes externally
  useEffect(() => {
    if (value !== preview) {
      setPreview(value)
    }
  }, [value])

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    logger.debug('File selected', { fileCount: files.length, files: files.map(f => f.name) })

    // Validate files
    for (const file of files) {
      if (!validateFileType(file, allowedTypes)) {
        const errorMsg = `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
        setError(errorMsg)
        toast.error(errorMsg)
        logger.error('Invalid file type', new Error(errorMsg), { file: file.name, type: file.type })
        return
      }

      if (!validateFileSize(file, maxSizeMB)) {
        const errorMsg = `File size exceeds ${maxSizeMB}MB limit`
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
      if (multiple) {
        // Handle multiple files
        const uploadPromises = files.map(file => uploadFile(file, storagePath))
        const urls = await Promise.all(uploadPromises)
        logger.info('Multiple files uploaded', { count: urls.length })
        onChange(urls)
        if (urls.length > 0) {
          setPreview(urls[0]) // Show first image as preview
        }
        toast.success(`${urls.length} file(s) uploaded successfully`)
      } else {
        // Handle single file
        const file = files[0]
        const url = await uploadFile(file, storagePath)
        logger.info('File uploaded successfully', { url, fileName: file.name })
        setPreview(url)
        onChange(url)
        toast.success('File uploaded successfully')
      }
    } catch (error) {
      logger.error('Error uploading file', error, { fileCount: files.length })
      const errorMsg = error.message || 'Failed to upload file'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = async () => {
    logger.functionEntry('handleRemove', { preview })
    
    try {
      if (preview && onRemove) {
        // Optionally delete from storage
        // await deleteFile(preview)
      }
      setPreview(null)
      onChange(null)
      onRemove()
      toast.success('File removed')
      logger.functionExit('handleRemove', { success: true })
    } catch (error) {
      logger.error('Error removing file', error)
      toast.error('Failed to remove file')
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const isImage = preview && /\.(jpg|jpeg|png|gif|webp)$/i.test(preview)

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {uploading ? (
        <div className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-primary-300 rounded-xl bg-primary-50">
          <Loader2 size={24} className="animate-spin text-primary-600" />
          <span className="text-primary-600 font-medium">Uploading...</span>
        </div>
      ) : preview ? (
        <div className="relative group">
          {isImage ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl border-2 border-neutral-200"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border-2 border-neutral-200 rounded-xl bg-neutral-50">
              <div className="flex items-center gap-3">
                <File size={24} className="text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">File uploaded</p>
                  <p className="text-xs text-neutral-500 truncate max-w-xs">{preview}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div className="mt-2">
            <button
              type="button"
              onClick={handleClick}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Change file
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 hover:border-primary-400 hover:bg-primary-50 cursor-pointer transition-colors"
        >
          <Upload size={32} className="text-neutral-400 mb-2" />
          <p className="text-sm font-medium text-neutral-700 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-neutral-500">
            {accept.includes('image') ? 'Image' : 'File'} up to {maxSizeMB}MB
          </p>
        </div>
      )}
    </div>
  )
}

export default FileUpload

