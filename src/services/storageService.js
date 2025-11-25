/**
 * Firebase Storage Service
 * Handles file uploads to Firebase Storage
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../config/firebase'
import logger from '../utils/logger'

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'projects/images', 'team/avatars')
 * @param {string} fileName - Optional custom file name (defaults to file name with timestamp)
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path, fileName = null) => {
  logger.functionEntry('uploadFile', { 
    fileName: file.name, 
    fileSize: file.size, 
    fileType: file.type,
    path 
  })
  
  try {
    // Generate unique file name if not provided
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = fileName || `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Create storage reference
    const storageRef = ref(storage, `${path}/${uniqueFileName}`)
    
    // Upload file
    logger.info('Uploading file to Firebase Storage', { 
      path: `${path}/${uniqueFileName}`,
      size: file.size,
      type: file.type
    })
    
    const snapshot = await uploadBytes(storageRef, file)
    logger.info('File uploaded successfully', { 
      path: snapshot.ref.fullPath,
      size: snapshot.metadata.size
    })
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    logger.functionExit('uploadFile', { 
      success: true, 
      downloadURL,
      path: snapshot.ref.fullPath
    })
    
    return downloadURL
  } catch (error) {
    logger.error('Error uploading file to Firebase Storage', error, {
      fileName: file.name,
      path,
      errorMessage: error.message
    })
    throw error
  }
}

/**
 * Upload multiple files to Firebase Storage
 * @param {File[]} files - Array of files to upload
 * @param {string} path - Storage path
 * @returns {Promise<string[]>} Array of download URLs
 */
export const uploadMultipleFiles = async (files, path) => {
  logger.functionEntry('uploadMultipleFiles', { 
    fileCount: files.length,
    path 
  })
  
  try {
    const uploadPromises = files.map((file, index) => 
      uploadFile(file, path, `${Date.now()}_${index}_${file.name}`)
    )
    
    const downloadURLs = await Promise.all(uploadPromises)
    logger.functionExit('uploadMultipleFiles', { 
      success: true, 
      count: downloadURLs.length 
    })
    
    return downloadURLs
  } catch (error) {
    logger.error('Error uploading multiple files', error, {
      fileCount: files.length,
      path
    })
    throw error
  }
}

/**
 * Delete a file from Firebase Storage
 * @param {string} fileUrl - The download URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileUrl) => {
  logger.functionEntry('deleteFile', { fileUrl })
  
  try {
    // Extract path from URL
    // Firebase Storage URLs format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const url = new URL(fileUrl)
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/)
    
    if (!pathMatch) {
      throw new Error('Invalid Firebase Storage URL')
    }
    
    // Decode the path (it's URL encoded)
    const filePath = decodeURIComponent(pathMatch[1])
    const storageRef = ref(storage, filePath)
    
    await deleteObject(storageRef)
    logger.functionExit('deleteFile', { success: true, path: filePath })
  } catch (error) {
    logger.error('Error deleting file from Firebase Storage', error, { fileUrl })
    throw error
  }
}

/**
 * Get file extension from file name or type
 */
export const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase()
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types (e.g., ['image/jpeg', 'image/png'])
 * @returns {boolean}
 */
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {boolean}
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

export default {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFileExtension,
  validateFileType,
  validateFileSize
}

