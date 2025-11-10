import Alumni from '../models/Alumni.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Get all alumni
// @route   GET /api/alumni
// @access  Public
export const getAlumni = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getAlumni', { 
    query: req.query,
    hasCourse: !!req.query.course,
    hasCompany: !!req.query.company,
    hasSkill: !!req.query.skill,
    hasSearch: !!req.query.search,
    hasFeatured: req.query.featured === 'true'
  })
  
  try {
    const {
      page = 1,
      limit = 12,
      course,
      company,
      skill,
      search,
      sort = 'graduationDate',
      order = 'desc',
      featured,
    } = req.query

    logger.debug('Processing query parameters', { page, limit, course, company, skill, search, sort, order, featured })

    // Build query
    let query = { isApproved: true }
    logger.debug('Initial query built', { query })

  if (course) {
    query.course = course
  }

  if (company) {
    query.company = company
  }

  if (skill) {
    query.skills = skill
  }

  if (featured === 'true') {
    query.isFeatured = true
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ]
  }

  // Build sort object
  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }

    // Execute query
    logger.dbOperation('find', 'Alumni', query)
    const alumni = await Alumni.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    logger.dbOperation('countDocuments', 'Alumni', query)
    const total = await Alumni.countDocuments(query)

    const duration = Date.now() - startTime
    logger.success('Alumni fetched successfully', { 
      count: alumni.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      duration: `${duration}ms`
    })
    logger.functionExit('getAlumni', { 
      success: true,
      count: alumni.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: alumni.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: alumni,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch alumni', error, {
      query: req.query,
      operation: 'getAlumni',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('getAlumni', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get single alumni
// @route   GET /api/alumni/:id
// @access  Public
export const getAlumnus = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('getAlumnus', { alumnusId: id })
  
  try {
    logger.dbOperation('findById', 'Alumni', id)
    const alumnus = await Alumni.findById(id)

    if (!alumnus || !alumnus.isApproved) {
      const duration = Date.now() - startTime
      logger.warn('Alumni not found or not approved', { 
        alumnusId: id,
        found: !!alumnus,
        isApproved: alumnus?.isApproved,
        duration: `${duration}ms`
      })
      logger.functionExit('getAlumnus', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Alumni fetched successfully', { 
      alumnusId: alumnus._id,
      name: alumnus.name,
      isApproved: alumnus.isApproved,
      duration: `${duration}ms`
    })
    logger.functionExit('getAlumnus', { 
      success: true,
      alumnusId: alumnus._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: alumnus,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch alumnus', error, {
      alumnusId: id,
      operation: 'getAlumnus',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('getAlumnus', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Create new alumni
// @route   POST /api/alumni
// @access  Private/Admin
export const createAlumni = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createAlumni', { 
    bodyKeys: Object.keys(req.body),
    hasName: !!req.body.name,
    hasEmail: !!req.body.email
  })
  
  try {
    logger.debug('Creating alumni with data', {
      name: req.body.name,
      email: req.body.email,
      hasCompany: !!req.body.company,
      hasTitle: !!req.body.title
    })

    logger.dbOperation('create', 'Alumni', { name: req.body.name, email: req.body.email })
    const alumni = await Alumni.create(req.body)
    
    const duration = Date.now() - startTime
    logger.success('Alumni created successfully', { 
      alumniId: alumni._id, 
      name: alumni.name,
      email: alumni.email,
      duration: `${duration}ms`
    })
    logger.functionExit('createAlumni', { 
      success: true, 
      alumniId: alumni._id,
      duration: `${duration}ms`
    })

    res.status(201).json({
      success: true,
      data: alumni,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to create alumni', error, {
      body: req.body,
      operation: 'createAlumni',
      model: 'Alumni',
      errorName: error.name,
      errorMessage: error.message,
      duration: `${duration}ms`
    })
    logger.functionExit('createAlumni', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update alumni
// @route   PUT /api/alumni/:id
// @access  Private/Admin
export const updateAlumni = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('updateAlumni', { 
    alumniId: id,
    bodyKeys: Object.keys(req.body),
    updateFields: Object.keys(req.body)
  })
  
  try {
    logger.debug('Updating alumni', {
      alumniId: id,
      fieldsToUpdate: Object.keys(req.body)
    })

    logger.dbOperation('findByIdAndUpdate', 'Alumni', { id, updateFields: Object.keys(req.body) })
    const alumni = await Alumni.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!alumni) {
      const duration = Date.now() - startTime
      logger.warn('Alumni not found for update', { 
        alumniId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateAlumni', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Alumni updated successfully', { 
      alumniId: alumni._id,
      name: alumni.name,
      updatedFields: Object.keys(req.body),
      duration: `${duration}ms`
    })
    logger.functionExit('updateAlumni', { 
      success: true,
      alumniId: alumni._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: alumni,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to update alumni', error, {
      alumniId: id,
      body: req.body,
      operation: 'updateAlumni',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('updateAlumni', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Delete alumni
// @route   DELETE /api/alumni/:id
// @access  Private/Admin
export const deleteAlumni = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('deleteAlumni', { alumniId: id })
  
  try {
    logger.debug('Deleting alumni', { alumniId: id })

    logger.dbOperation('findByIdAndDelete', 'Alumni', id)
    const alumni = await Alumni.findByIdAndDelete(id)

    if (!alumni) {
      const duration = Date.now() - startTime
      logger.warn('Alumni not found for deletion', { 
        alumniId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('deleteAlumni', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Alumni deleted successfully', { 
      alumniId: id,
      name: alumni.name,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteAlumni', { 
      success: true,
      alumniId: id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Alumni profile deleted successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to delete alumni', error, {
      alumniId: id,
      operation: 'deleteAlumni',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('deleteAlumni', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Approve alumni
// @route   PATCH /api/alumni/:id/approve
// @access  Private/Admin
export const approveAlumni = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('approveAlumni', { alumniId: id })
  
  try {
    logger.debug('Approving alumni', { alumniId: id })

    logger.dbOperation('findByIdAndUpdate', 'Alumni', { id, update: { isApproved: true } })
    const alumni = await Alumni.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    )

    if (!alumni) {
      const duration = Date.now() - startTime
      logger.warn('Alumni not found for approval', { 
        alumniId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('approveAlumni', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Alumni approved successfully', { 
      alumniId: alumni._id,
      name: alumni.name,
      isApproved: alumni.isApproved,
      duration: `${duration}ms`
    })
    logger.functionExit('approveAlumni', { 
      success: true,
      alumniId: alumni._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: alumni,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to approve alumni', error, {
      alumniId: id,
      operation: 'approveAlumni',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('approveAlumni', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get alumni statistics
// @route   GET /api/alumni/stats
// @access  Private/Admin
export const getAlumniStats = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getAlumniStats')
  
  try {
    logger.debug('Fetching alumni statistics')
    
    logger.dbOperation('aggregate', 'Alumni', 'overview stats')
    const stats = await Alumni.aggregate([
    {
      $group: {
        _id: null,
        totalAlumni: { $sum: 1 },
        approvedAlumni: {
          $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] },
        },
        featuredAlumni: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] },
        },
        averageSalary: { $avg: '$salary' },
        averageExperience: { $avg: '$yearsOfExperience' },
      },
    },
  ])

    logger.dbOperation('aggregate', 'Alumni', 'course stats')
    const courseStats = await Alumni.aggregate([
    {
      $group: {
        _id: '$course',
        count: { $sum: 1 },
        averageSalary: { $avg: '$salary' },
        averageExperience: { $avg: '$yearsOfExperience' },
      },
    },
    { $sort: { count: -1 } },
  ])

    logger.dbOperation('aggregate', 'Alumni', 'company stats')
    const companyStats = await Alumni.aggregate([
    {
      $group: {
        _id: '$company',
        count: { $sum: 1 },
        averageSalary: { $avg: '$salary' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])

    logger.dbOperation('aggregate', 'Alumni', 'skill stats')
    const skillStats = await Alumni.aggregate([
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ])

    logger.dbOperation('aggregate', 'Alumni', 'employment type stats')
    const employmentTypeStats = await Alumni.aggregate([
    {
      $group: {
        _id: '$employmentType',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])

    const duration = Date.now() - startTime
    logger.success('Alumni statistics fetched successfully', { 
      totalAlumni: stats[0]?.totalAlumni || 0,
      approvedAlumni: stats[0]?.approvedAlumni || 0,
      courseStatsCount: courseStats.length,
      companyStatsCount: companyStats.length,
      skillStatsCount: skillStats.length,
      employmentTypeStatsCount: employmentTypeStats.length,
      duration: `${duration}ms`
    })
    logger.functionExit('getAlumniStats', { 
      success: true,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalAlumni: 0,
          approvedAlumni: 0,
          featuredAlumni: 0,
          averageSalary: 0,
          averageExperience: 0,
        },
        byCourse: courseStats,
        byCompany: companyStats,
        bySkill: skillStats,
        byEmploymentType: employmentTypeStats,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch alumni statistics', error, {
      operation: 'getAlumniStats',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('getAlumniStats', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Reorder alumni
// @route   PUT /api/alumni/reorder
// @access  Private/Admin
export const reorderAlumni = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('reorderAlumni', { 
    alumniIdsCount: req.body.alumniIds?.length || 0,
    hasAlumniIds: Array.isArray(req.body.alumniIds)
  })
  
  try {
    const { alumniIds } = req.body

    if (!Array.isArray(alumniIds)) {
      const error = new Error('alumniIds must be an array')
      error.name = 'ValidationError'
      const duration = Date.now() - startTime
      logger.error('Validation failed: alumniIds must be an array', error, {
        body: req.body,
        operation: 'reorderAlumni',
        duration: `${duration}ms`
      })
      logger.functionExit('reorderAlumni', { 
        success: false,
        error: error.message,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'alumniIds must be an array',
      })
    }

    logger.debug('Reordering alumni', {
      alumniIdsCount: alumniIds.length,
      alumniIds: alumniIds
    })

    logger.dbOperation('bulk update', 'Alumni', { count: alumniIds.length, operation: 'reorder' })
    const updatePromises = alumniIds.map((alumniId, index) =>
      Alumni.findByIdAndUpdate(alumniId, { position: index })
    )

    await Promise.all(updatePromises)

    const duration = Date.now() - startTime
    logger.success('Alumni reordered successfully', { 
      alumniIdsCount: alumniIds.length,
      duration: `${duration}ms`
    })
    logger.functionExit('reorderAlumni', { 
      success: true,
      alumniIdsCount: alumniIds.length,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Alumni reordered successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to reorder alumni', error, {
      body: req.body,
      operation: 'reorderAlumni',
      model: 'Alumni',
      duration: `${duration}ms`
    })
    logger.functionExit('reorderAlumni', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})