import Certificate from '../models/Certificate.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
export const getCertificates = asyncHandler(async (req, res) => {
  console.log("[TS-LOG][API_START] GET /api/certificates")
  const startTime = Date.now()
  
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
    
    console.log("[TS-LOG][QUERY] Certificate filter:", filter)
    
    const certificates = await Certificate.find(filter)
      .populate('course', 'title slug')
      .populate('student', 'name email')
      .sort({ completionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
    
    const total = await Certificate.countDocuments(filter)
    
    const duration = Date.now() - startTime
    console.log("[TS-LOG][API_END] GET /api/certificates 200", duration + "ms")
    
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
    console.log("[TS-LOG][ERROR] GET /api/certificates failed", duration + "ms", error.message)
    throw error
  }
})

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Public
export const getCertificate = asyncHandler(async (req, res) => {
  console.log("[TS-LOG][API_START] GET /api/certificates/" + req.params.id)
  const startTime = Date.now()
  
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title slug description')
      .populate('student', 'name email')
    
    if (!certificate || !certificate.isActive) {
      const duration = Date.now() - startTime
      console.log("[TS-LOG][API_END] GET /api/certificates/" + req.params.id + " 404", duration + "ms")
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }
    
    const duration = Date.now() - startTime
    console.log("[TS-LOG][API_END] GET /api/certificates/" + req.params.id + " 200", duration + "ms")
    
    res.status(200).json({
      success: true,
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.log("[TS-LOG][ERROR] GET /api/certificates/" + req.params.id + " failed", duration + "ms", error.message)
    throw error
  }
})

// @desc    Get certificate by certificate ID
// @route   GET /api/certificates/cert/:certificateId
// @access  Public
export const getCertificateById = asyncHandler(async (req, res) => {
  console.log("[TS-LOG][API_START] GET /api/certificates/cert/" + req.params.certificateId)
  const startTime = Date.now()
  
  try {
    const certificate = await Certificate.findByCertificateId(req.params.certificateId)
      .populate('course', 'title slug description')
      .populate('student', 'name email')
    
    if (!certificate) {
      const duration = Date.now() - startTime
      console.log("[TS-LOG][API_END] GET /api/certificates/cert/" + req.params.certificateId + " 404", duration + "ms")
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }
    
    const duration = Date.now() - startTime
    console.log("[TS-LOG][API_END] GET /api/certificates/cert/" + req.params.certificateId + " 200", duration + "ms")
    
    res.status(200).json({
      success: true,
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.log("[TS-LOG][ERROR] GET /api/certificates/cert/" + req.params.certificateId + " failed", duration + "ms", error.message)
    throw error
  }
})

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:verificationCode
// @access  Public
export const verifyCertificate = asyncHandler(async (req, res) => {
  console.log("[TS-LOG][API_START] GET /api/certificates/verify/" + req.params.verificationCode)
  const startTime = Date.now()
  
  try {
    const certificate = await Certificate.findByVerificationCode(req.params.verificationCode)
      .populate('course', 'title slug')
      .populate('student', 'name email')
    
    if (!certificate) {
      const duration = Date.now() - startTime
      console.log("[TS-LOG][API_END] GET /api/certificates/verify/" + req.params.verificationCode + " 404", duration + "ms")
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid verification code',
      })
    }
    
    const duration = Date.now() - startTime
    console.log("[TS-LOG][API_END] GET /api/certificates/verify/" + req.params.verificationCode + " 200", duration + "ms")
    
    res.status(200).json({
      success: true,
      message: 'Certificate verified successfully',
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.log("[TS-LOG][ERROR] GET /api/certificates/verify/" + req.params.verificationCode + " failed", duration + "ms", error.message)
    throw error
  }
})

// @desc    Download certificate
// @route   GET /api/certificates/:certificateId/download
// @access  Public
export const downloadCertificate = asyncHandler(async (req, res) => {
  console.log("[TS-LOG][API_START] GET /api/certificates/" + req.params.certificateId + "/download")
  const startTime = Date.now()
  
  try {
    const certificate = await Certificate.findByCertificateId(req.params.certificateId)
    
    if (!certificate) {
      const duration = Date.now() - startTime
      console.log("[TS-LOG][API_END] GET /api/certificates/" + req.params.certificateId + "/download 404", duration + "ms")
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
    console.log("[TS-LOG][API_END] GET /api/certificates/" + req.params.certificateId + "/download 200", duration + "ms")
    
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
    console.log("[TS-LOG][ERROR] GET /api/certificates/" + req.params.certificateId + "/download failed", duration + "ms", error.message)
    throw error
  }
})

// @desc    Create certificate
// @route   POST /api/certificates
// @access  Private/Admin
export const createCertificate = asyncHandler(async (req, res) => {
  console.log("[TS-LOG][API_START] POST /api/certificates")
  const startTime = Date.now()
  
  try {
    const certificate = await Certificate.create(req.body)
    
    await certificate.populate('course', 'title slug')
    await certificate.populate('student', 'name email')
    
    const duration = Date.now() - startTime
    console.log("[TS-LOG][API_END] POST /api/certificates 201", duration + "ms")
    
    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.log("[TS-LOG][ERROR] POST /api/certificates failed", duration + "ms", error.message)
    throw error
  }
})

// @desc    Update certificate
// @route   PUT /api/certificates/:id
// @access  Private/Admin
export const updateCertificate = asyncHandler(async (req, res) => {
  console.log("[TS-LOG][API_START] PUT /api/certificates/" + req.params.id)
  const startTime = Date.now()
  
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title slug').populate('student', 'name email')
    
    if (!certificate) {
      const duration = Date.now() - startTime
      console.log("[TS-LOG][API_END] PUT /api/certificates/" + req.params.id + " 404", duration + "ms")
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }
    
    const duration = Date.now() - startTime
    console.log("[TS-LOG][API_END] PUT /api/certificates/" + req.params.id + " 200", duration + "ms")
    
    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: certificate,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.log("[TS-LOG][ERROR] PUT /api/certificates/" + req.params.id + " failed", duration + "ms", error.message)
    throw error
  }
})

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private/Admin
export const deleteCertificate = asyncHandler(async (req, res) => {
  console.log("[TS-LOG][API_START] DELETE /api/certificates/" + req.params.id)
  const startTime = Date.now()
  
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    
    if (!certificate) {
      const duration = Date.now() - startTime
      console.log("[TS-LOG][API_END] DELETE /api/certificates/" + req.params.id + " 404", duration + "ms")
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      })
    }
    
    const duration = Date.now() - startTime
    console.log("[TS-LOG][API_END] DELETE /api/certificates/" + req.params.id + " 200", duration + "ms")
    
    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.log("[TS-LOG][ERROR] DELETE /api/certificates/" + req.params.id + " failed", duration + "ms", error.message)
    throw error
  }
})
