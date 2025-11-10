import Project from '../models/Project.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getProjects', { 
    query: req.query,
    hasCourse: !!req.query.course,
    hasTechnology: !!req.query.technology,
    hasSearch: !!req.query.search,
    hasFeatured: req.query.featured === 'true'
  })
  
  try {
    const {
      page = 1,
      limit = 12,
      course,
      technology,
      search,
      sort = 'completionDate',
      order = 'desc',
      featured,
    } = req.query

    logger.debug('Processing query parameters', { page, limit, course, technology, search, sort, order, featured })

    // Build query
    let query = { isApproved: true }
    logger.debug('Initial query built', { query })

  if (course) {
    query.course = course
  }

  if (technology) {
    query.technologies = technology
  }

  if (featured === 'true') {
    query.isFeatured = true
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { studentName: { $regex: search, $options: 'i' } },
      { technologies: { $in: [new RegExp(search, 'i')] } },
    ]
  }

  // Build sort object
  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }

    // Execute query
    logger.dbOperation('find', 'Project', query)
    const projects = await Project.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    logger.dbOperation('countDocuments', 'Project', query)
    const total = await Project.countDocuments(query)

    const duration = Date.now() - startTime
    logger.success('Projects fetched successfully', { 
      count: projects.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      duration: `${duration}ms`
    })
    logger.functionExit('getProjects', { 
      success: true,
      count: projects.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: projects.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: projects,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch projects', error, {
      query: req.query,
      operation: 'getProjects',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('getProjects', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProject = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('getProject', { projectId: id })
  
  try {
    logger.dbOperation('findById', 'Project', id)
    const project = await Project.findById(id)

    if (!project || !project.isApproved) {
      const duration = Date.now() - startTime
      logger.warn('Project not found or not approved', { 
        projectId: id,
        found: !!project,
        isApproved: project?.isApproved,
        duration: `${duration}ms`
      })
      logger.functionExit('getProject', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    // Increment view count
    logger.debug('Incrementing project view count', { projectId: id, currentViews: project.views })
    await project.incrementViews()

    const duration = Date.now() - startTime
    logger.success('Project fetched successfully', { 
      projectId: project._id,
      title: project.title,
      isApproved: project.isApproved,
      views: project.views,
      duration: `${duration}ms`
    })
    logger.functionExit('getProject', { 
      success: true,
      projectId: project._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: project,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch project', error, {
      projectId: id,
      operation: 'getProject',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('getProject', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createProject', { 
    bodyKeys: Object.keys(req.body),
    hasTitle: !!req.body.title,
    hasStudentName: !!req.body.studentName
  })
  
  try {
    logger.debug('Creating project with data', {
      title: req.body.title,
      studentName: req.body.studentName,
      hasDescription: !!req.body.description,
      hasTechnologies: Array.isArray(req.body.technologies) && req.body.technologies.length > 0
    })

    logger.dbOperation('create', 'Project', { title: req.body.title, studentName: req.body.studentName })
    const project = await Project.create(req.body)
    
    const duration = Date.now() - startTime
    logger.success('Project created successfully', { 
      projectId: project._id, 
      title: project.title,
      studentName: project.studentName,
      duration: `${duration}ms`
    })
    logger.functionExit('createProject', { 
      success: true, 
      projectId: project._id,
      duration: `${duration}ms`
    })

    res.status(201).json({
      success: true,
      data: project,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to create project', error, {
      body: req.body,
      operation: 'createProject',
      model: 'Project',
      errorName: error.name,
      errorMessage: error.message,
      duration: `${duration}ms`
    })
    logger.functionExit('createProject', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('updateProject', { 
    projectId: id,
    bodyKeys: Object.keys(req.body),
    updateFields: Object.keys(req.body)
  })
  
  try {
    logger.debug('Updating project', {
      projectId: id,
      fieldsToUpdate: Object.keys(req.body)
    })

    logger.dbOperation('findByIdAndUpdate', 'Project', { id, updateFields: Object.keys(req.body) })
    const project = await Project.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!project) {
      const duration = Date.now() - startTime
      logger.warn('Project not found for update', { 
        projectId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateProject', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Project updated successfully', { 
      projectId: project._id,
      title: project.title,
      updatedFields: Object.keys(req.body),
      duration: `${duration}ms`
    })
    logger.functionExit('updateProject', { 
      success: true,
      projectId: project._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: project,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to update project', error, {
      projectId: id,
      body: req.body,
      operation: 'updateProject',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('updateProject', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('deleteProject', { projectId: id })
  
  try {
    logger.debug('Deleting project', { projectId: id })

    logger.dbOperation('findByIdAndDelete', 'Project', id)
    const project = await Project.findByIdAndDelete(id)

    if (!project) {
      const duration = Date.now() - startTime
      logger.warn('Project not found for deletion', { 
        projectId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('deleteProject', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Project deleted successfully', { 
      projectId: id,
      title: project.title,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteProject', { 
      success: true,
      projectId: id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Project deleted successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to delete project', error, {
      projectId: id,
      operation: 'deleteProject',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('deleteProject', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Approve project
// @route   PATCH /api/projects/:id/approve
// @access  Private/Admin
export const approveProject = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('approveProject', { projectId: id })
  
  try {
    logger.debug('Approving project', { projectId: id })

    logger.dbOperation('findByIdAndUpdate', 'Project', { id, update: { isApproved: true } })
    const project = await Project.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    )

    if (!project) {
      const duration = Date.now() - startTime
      logger.warn('Project not found for approval', { 
        projectId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('approveProject', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Project approved successfully', { 
      projectId: project._id,
      title: project.title,
      isApproved: project.isApproved,
      duration: `${duration}ms`
    })
    logger.functionExit('approveProject', { 
      success: true,
      projectId: project._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: project,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to approve project', error, {
      projectId: id,
      operation: 'approveProject',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('approveProject', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Like project
// @route   POST /api/projects/:id/like
// @access  Public
export const likeProject = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('likeProject', { projectId: id })
  
  try {
    logger.dbOperation('findById', 'Project', id)
    const project = await Project.findById(id)

    if (!project || !project.isApproved) {
      const duration = Date.now() - startTime
      logger.warn('Project not found or not approved for like', { 
        projectId: id,
        found: !!project,
        isApproved: project?.isApproved,
        duration: `${duration}ms`
      })
      logger.functionExit('likeProject', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      })
    }

    logger.debug('Incrementing project likes', { projectId: id, currentLikes: project.likes })
    await project.incrementLikes()

    const duration = Date.now() - startTime
    logger.success('Project liked successfully', { 
      projectId: project._id,
      title: project.title,
      newLikes: project.likes + 1,
      duration: `${duration}ms`
    })
    logger.functionExit('likeProject', { 
      success: true,
      projectId: project._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Project liked successfully',
      likes: project.likes + 1,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to like project', error, {
      projectId: id,
      operation: 'likeProject',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('likeProject', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private/Admin
export const getProjectStats = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getProjectStats')
  
  try {
    logger.debug('Fetching project statistics')
    
    logger.dbOperation('aggregate', 'Project', 'overview stats')
    const stats = await Project.aggregate([
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        approvedProjects: {
          $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] },
        },
        featuredProjects: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] },
        },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
      },
    },
  ])

    logger.dbOperation('aggregate', 'Project', 'course stats')
    const courseStats = await Project.aggregate([
    {
      $group: {
        _id: '$course',
        count: { $sum: 1 },
        averageViews: { $avg: '$views' },
        averageLikes: { $avg: '$likes' },
      },
    },
    { $sort: { count: -1 } },
  ])

    logger.dbOperation('aggregate', 'Project', 'technology stats')
    const technologyStats = await Project.aggregate([
    { $unwind: '$technologies' },
    {
      $group: {
        _id: '$technologies',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])

    const duration = Date.now() - startTime
    logger.success('Project statistics fetched successfully', { 
      totalProjects: stats[0]?.totalProjects || 0,
      approvedProjects: stats[0]?.approvedProjects || 0,
      courseStatsCount: courseStats.length,
      technologyStatsCount: technologyStats.length,
      duration: `${duration}ms`
    })
    logger.functionExit('getProjectStats', { 
      success: true,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalProjects: 0,
          approvedProjects: 0,
          featuredProjects: 0,
          totalViews: 0,
          totalLikes: 0,
        },
        byCourse: courseStats,
        byTechnology: technologyStats,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch project statistics', error, {
      operation: 'getProjectStats',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('getProjectStats', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Reorder projects
// @route   PUT /api/projects/reorder
// @access  Private/Admin
export const reorderProjects = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('reorderProjects', { 
    projectIdsCount: req.body.projectIds?.length || 0,
    hasProjectIds: Array.isArray(req.body.projectIds)
  })
  
  try {
    const { projectIds } = req.body

    if (!Array.isArray(projectIds)) {
      const error = new Error('projectIds must be an array')
      error.name = 'ValidationError'
      const duration = Date.now() - startTime
      logger.error('Validation failed: projectIds must be an array', error, {
        body: req.body,
        operation: 'reorderProjects',
        duration: `${duration}ms`
      })
      logger.functionExit('reorderProjects', { 
        success: false,
        error: error.message,
        duration: `${duration}ms`
      })
      return res.status(400).json({
        success: false,
        message: 'projectIds must be an array',
      })
    }

    logger.debug('Reordering projects', {
      projectIdsCount: projectIds.length,
      projectIds: projectIds
    })

    logger.dbOperation('bulk update', 'Project', { count: projectIds.length, operation: 'reorder' })
    const updatePromises = projectIds.map((projectId, index) =>
      Project.findByIdAndUpdate(projectId, { position: index })
    )

    await Promise.all(updatePromises)

    const duration = Date.now() - startTime
    logger.success('Projects reordered successfully', { 
      projectIdsCount: projectIds.length,
      duration: `${duration}ms`
    })
    logger.functionExit('reorderProjects', { 
      success: true,
      projectIdsCount: projectIds.length,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Projects reordered successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to reorder projects', error, {
      body: req.body,
      operation: 'reorderProjects',
      model: 'Project',
      duration: `${duration}ms`
    })
    logger.functionExit('reorderProjects', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})