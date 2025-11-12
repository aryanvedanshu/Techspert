import Certificate from '../models/Certificate.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
export const getCertificates = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getCertificates', {
    query: req.query
  })
  
  try {
    const { page = 1, limit = 10, course, student, verified } = req.query
    
    // Build filter object
    const filter = { isActive: true }
    
    if (course) {
      filter.course = course
    }
    
    if (student) {
      filter.student = student
    }
    
    if (verified !== undefined) {
      filter.isVerified = verified === 'true'
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    logger.debug('Certificate filter built', { filter })
    
    logger.dbOperation('find', 'Certificate', filter)
    const certificates = await Certificate.find(filter)
      .populate('course', 'title slug')
      .populate('student', 'name email')
      .sort({ completionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
    
    const total = await Certificate.countDocuments(filter)
    
    const duration = Date.now() - startTime
    logger.success('Certificates fetched successfully', {
      count: certificates.length,
      total,
      page: parseInt(page),
      duration: `${duration}ms`
    })
    logger.functionExit('getCertificates', {
      success: true,
      count: certificates.length,
      duration: `${duration}ms`
    })
    
    res.status(200).json({
      success: true,
      count: certificates.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: certificates,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch certificates', error, {
      query: req.query,
      duration: `${duration}ms`
    })
    logger.functionExit('getCertificates', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Public
export const getCertificate = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getCertificate', {
    certificateId: req.params.id
  })
  
  try {
    logger.dbOperation('findById', 'Certificate', req.params.id)
    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title slug description')
      .populate('student', 'name email')
    
    if (!certificate || !certificate.isActive) {
      const duration = Date.now() - startTime
      logger.warn('Certificate not found or inactive', {
        certificateId: req.params.id,
        duration: `${duration}ms`
      })
      logger.functionExit('getCertificate', {
        success: false,
        notFound: true,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }
    
    const duration = Date.now() - startTime
    logger.success('Certificate fetched successfully', {
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    logger.functionExit('getCertificate', {
      success: true,
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    
    res.status(200).json({
      success: true,
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch certificate', error, {
      certificateId: req.params.id,
      duration: `${duration}ms`
    })
    logger.functionExit('getCertificate', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get certificate by certificate ID
// @route   GET /api/certificates/cert/:certificateId
// @access  Public
export const getCertificateById = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getCertificateById', {
    certificateId: req.params.certificateId
  })
  
  try {
    logger.dbOperation('findByCertificateId', 'Certificate', req.params.certificateId)
    const certificate = await Certificate.findByCertificateId(req.params.certificateId)
      .populate('course', 'title slug description')
      .populate('student', 'name email')
    
    if (!certificate) {
      const duration = Date.now() - startTime
      logger.warn('Certificate not found by certificateId', {
        certificateId: req.params.certificateId,
        duration: `${duration}ms`
      })
      logger.functionExit('getCertificateById', {
        success: false,
        notFound: true,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }
    
    const duration = Date.now() - startTime
    logger.success('Certificate fetched by certificateId successfully', {
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    logger.functionExit('getCertificateById', {
      success: true,
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    
    res.status(200).json({
      success: true,
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch certificate by certificateId', error, {
      certificateId: req.params.certificateId,
      duration: `${duration}ms`
    })
    logger.functionExit('getCertificateById', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:verificationCode
// @access  Public
export const verifyCertificate = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('verifyCertificate', {
    verificationCode: req.params.verificationCode
  })
  
  try {
    logger.dbOperation('findByVerificationCode', 'Certificate', req.params.verificationCode)
    const certificate = await Certificate.findByVerificationCode(req.params.verificationCode)
      .populate('course', 'title slug')
      .populate('student', 'name email')
    
    if (!certificate) {
      const duration = Date.now() - startTime
      logger.warn('Certificate not found or invalid verification code', {
        verificationCode: req.params.verificationCode,
        duration: `${duration}ms`
      })
      logger.functionExit('verifyCertificate', {
        success: false,
        notFound: true,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid verification code',
      })
    }
    
    const duration = Date.now() - startTime
    logger.success('Certificate verified successfully', {
      certificateId: certificate._id,
      verificationCode: req.params.verificationCode,
      duration: `${duration}ms`
    })
    logger.functionExit('verifyCertificate', {
      success: true,
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    
    res.status(200).json({
      success: true,
      message: 'Certificate verified successfully',
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to verify certificate', error, {
      verificationCode: req.params.verificationCode,
      duration: `${duration}ms`
    })
    logger.functionExit('verifyCertificate', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Download certificate
// @route   GET /api/certificates/:certificateId/download
// @access  Public
export const downloadCertificate = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('downloadCertificate', {
    certificateId: req.params.certificateId
  })
  
  try {
    logger.dbOperation('findByCertificateId', 'Certificate', req.params.certificateId)
    const certificate = await Certificate.findByCertificateId(req.params.certificateId)
    
    if (!certificate) {
      const duration = Date.now() - startTime
      logger.warn('Certificate not found for download', {
        certificateId: req.params.certificateId,
        duration: `${duration}ms`
      })
      logger.functionExit('downloadCertificate', {
        success: false,
        notFound: true,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }
    
    // Mark as downloaded
    await certificate.markDownloaded()
    
    // For now, return the certificate data
    // In a real implementation, you would generate a PDF and return it
    const duration = Date.now() - startTime
    logger.success('Certificate download initiated successfully', {
      certificateId: certificate._id,
      downloadCount: certificate.downloadCount,
      duration: `${duration}ms`
    })
    logger.functionExit('downloadCertificate', {
      success: true,
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    
    res.status(200).json({
      success: true,
      message: 'Certificate download initiated',
      data: {
        certificateId: certificate.certificateId,
        courseName: certificate.courseName,
        studentName: certificate.studentName,
        completionDate: certificate.completionDate,
        templateUrl: certificate.templateUrl,
        downloadCount: certificate.downloadCount,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to download certificate', error, {
      certificateId: req.params.certificateId,
      duration: `${duration}ms`
    })
    logger.functionExit('downloadCertificate', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Create certificate
// @route   POST /api/certificates
// @access  Private/Admin
export const createCertificate = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createCertificate', {
    bodyKeys: Object.keys(req.body),
    courseId: req.body.course,
    studentId: req.body.student
  })
  
  try {
    logger.dbOperation('create', 'Certificate', { courseId: req.body.course, studentId: req.body.student })
    const certificate = await Certificate.create(req.body)
    
    await certificate.populate('course', 'title slug')
    await certificate.populate('student', 'name email')
    
    const duration = Date.now() - startTime
    logger.success('Certificate created successfully', {
      certificateId: certificate._id,
      courseId: certificate.course?._id,
      studentId: certificate.student?._id,
      duration: `${duration}ms`
    })
    logger.functionExit('createCertificate', {
      success: true,
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    
    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to create certificate', error, {
      body: req.body,
      duration: `${duration}ms`
    })
    logger.functionExit('createCertificate', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update certificate
// @route   PUT /api/certificates/:id
// @access  Private/Admin
export const updateCertificate = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('updateCertificate', {
    certificateId: req.params.id,
    updateFields: Object.keys(req.body)
  })
  
  try {
    logger.dbOperation('findByIdAndUpdate', 'Certificate', { id: req.params.id, updateFields: Object.keys(req.body) })
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title slug').populate('student', 'name email')
    
    if (!certificate) {
      const duration = Date.now() - startTime
      logger.warn('Certificate not found for update', {
        certificateId: req.params.id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateCertificate', {
        success: false,
        notFound: true,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }
    
    const duration = Date.now() - startTime
    logger.success('Certificate updated successfully', {
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    logger.functionExit('updateCertificate', {
      success: true,
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    
    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to update certificate', error, {
      certificateId: req.params.id,
      duration: `${duration}ms`
    })
    logger.functionExit('updateCertificate', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private/Admin
export const deleteCertificate = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('deleteCertificate', {
    certificateId: req.params.id
  })
  
  try {
    logger.dbOperation('findByIdAndUpdate', 'Certificate', { id: req.params.id, isActive: false })
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    
    if (!certificate) {
      const duration = Date.now() - startTime
      logger.warn('Certificate not found for deletion', {
        certificateId: req.params.id,
        duration: `${duration}ms`
      })
      logger.functionExit('deleteCertificate', {
        success: false,
        notFound: true,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }
    
    const duration = Date.now() - startTime
    logger.success('Certificate deleted successfully', {
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteCertificate', {
      success: true,
      certificateId: certificate._id,
      duration: `${duration}ms`
    })
    
    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to delete certificate', error, {
      certificateId: req.params.id,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteCertificate', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})
