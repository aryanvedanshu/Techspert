import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import logger from './logger.js'

// Configure Cloudinary
logger.functionEntry('Cloudinary configuration')
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'configured' : 'missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'configured' : 'missing',
}
logger.debug('Cloudinary configuration status', cloudinaryConfig)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

logger.success('Cloudinary configured successfully', {
  hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
  hasApiKey: !!process.env.CLOUDINARY_API_KEY,
  hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
})
logger.functionExit('Cloudinary configuration')

// Create Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'techspert',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [
      { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
    ],
  },
})

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  },
})

// Middleware for single file upload
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const startTime = Date.now()
    logger.functionEntry('uploadSingle', { fieldName, route: req.path })
    
    const uploadMiddleware = upload.single(fieldName)
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        const duration = Date.now() - startTime
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            logger.warn('File upload failed: file too large', {
              fieldName,
              errorCode: err.code,
              maxSize: '10MB',
              duration: `${duration}ms`
            })
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB.',
            })
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            logger.warn('File upload failed: unexpected file field', {
              fieldName,
              errorCode: err.code,
              duration: `${duration}ms`
            })
            return res.status(400).json({
              success: false,
              message: 'Unexpected file field.',
            })
          }
        }
        
        logger.error('File upload error', err, {
          fieldName,
          errorName: err.name,
          errorMessage: err.message,
          errorCode: err.code,
          duration: `${duration}ms`
        })
        return res.status(400).json({
          success: false,
          message: err.message,
        })
      }
      
      const duration = Date.now() - startTime
      if (req.file) {
        logger.success('File uploaded successfully', {
          fieldName,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          duration: `${duration}ms`
        })
      } else {
        logger.debug('No file uploaded', { fieldName, duration: `${duration}ms` })
      }
      logger.functionExit('uploadSingle', { success: true, hasFile: !!req.file, duration: `${duration}ms` })
      next()
    })
  }
}

// Middleware for multiple file upload
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const startTime = Date.now()
    logger.functionEntry('uploadMultiple', { fieldName, maxCount, route: req.path })
    
    const uploadMiddleware = upload.array(fieldName, maxCount)
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        const duration = Date.now() - startTime
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            logger.warn('File upload failed: file too large', {
              fieldName,
              maxCount,
              errorCode: err.code,
              maxSize: '10MB',
              duration: `${duration}ms`
            })
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB.',
            })
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            logger.warn('File upload failed: too many files', {
              fieldName,
              maxCount,
              errorCode: err.code,
              duration: `${duration}ms`
            })
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum ${maxCount} files allowed.`,
            })
          }
        }
        
        logger.error('File upload error', err, {
          fieldName,
          maxCount,
          errorName: err.name,
          errorMessage: err.message,
          errorCode: err.code,
          duration: `${duration}ms`
        })
        return res.status(400).json({
          success: false,
          message: err.message,
        })
      }
      
      const duration = Date.now() - startTime
      if (req.files && req.files.length > 0) {
        logger.success('Files uploaded successfully', {
          fieldName,
          fileCount: req.files.length,
          maxCount,
          totalSize: req.files.reduce((sum, f) => sum + f.size, 0),
          duration: `${duration}ms`
        })
      } else {
        logger.debug('No files uploaded', { fieldName, maxCount, duration: `${duration}ms` })
      }
      logger.functionExit('uploadMultiple', { success: true, fileCount: req.files?.length || 0, duration: `${duration}ms` })
      next()
    })
  }
}

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId) => {
  const startTime = Date.now()
  logger.functionEntry('deleteImage', { publicId })
  
  try {
    logger.debug('Deleting image from Cloudinary', { publicId })
    const result = await cloudinary.uploader.destroy(publicId)
    
    const duration = Date.now() - startTime
    logger.success('Image deleted from Cloudinary', {
      publicId,
      result: result.result,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteImage', { success: true, result: result.result, duration: `${duration}ms` })
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Error deleting image from Cloudinary', error, {
      publicId,
      errorName: error.name,
      errorMessage: error.message,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteImage', { success: false, error: error.message, duration: `${duration}ms` })
    throw error
  }
}

// Helper function to get image URL with transformations
export const getImageUrl = (publicId, transformations = {}) => {
  logger.functionEntry('getImageUrl', { publicId, hasTransformations: Object.keys(transformations).length > 0 })
  
  try {
    const url = cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    })
    
    logger.debug('Image URL generated', { publicId, hasTransformations: Object.keys(transformations).length > 0 })
    logger.functionExit('getImageUrl', { success: true })
    return url
  } catch (error) {
    logger.error('Error generating image URL', error, {
      publicId,
      transformations,
      errorName: error.name,
      errorMessage: error.message
    })
    logger.functionExit('getImageUrl', { success: false, error: error.message })
    throw error
  }
}

// Helper function to upload image from URL
export const uploadFromUrl = async (imageUrl, options = {}) => {
  const startTime = Date.now()
  logger.functionEntry('uploadFromUrl', { imageUrl, hasOptions: Object.keys(options).length > 0 })
  
  try {
    logger.debug('Uploading image from URL to Cloudinary', {
      imageUrl,
      folder: 'techspert',
      options
    })
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'techspert',
      ...options,
    })
    
    const duration = Date.now() - startTime
    logger.success('Image uploaded from URL successfully', {
      imageUrl,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      size: result.bytes,
      duration: `${duration}ms`
    })
    logger.functionExit('uploadFromUrl', { success: true, publicId: result.public_id, duration: `${duration}ms` })
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Error uploading image from URL', error, {
      imageUrl,
      options,
      errorName: error.name,
      errorMessage: error.message,
      duration: `${duration}ms`
    })
    logger.functionExit('uploadFromUrl', { success: false, error: error.message, duration: `${duration}ms` })
    throw error
  }
}

export default upload
