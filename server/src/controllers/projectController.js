import Project from '../models/Project.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = asyncHandler(async (req, res) => {
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

  // Build query
  let query = { isApproved: true }

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
  const projects = await Project.find(query)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean()

  const total = await Project.countDocuments(query)

  res.json({
    success: true,
    count: projects.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: projects,
  })
})

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)

  if (!project || !project.isApproved) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    })
  }

  // Increment view count
  await project.incrementViews()

  res.json({
    success: true,
    data: project,
  })
})

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create(req.body)

  res.status(201).json({
    success: true,
    data: project,
  })
})

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    })
  }

  res.json({
    success: true,
    data: project,
  })
})

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id)

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    })
  }

  res.json({
    success: true,
    message: 'Project deleted successfully',
  })
})

// @desc    Approve project
// @route   PATCH /api/projects/:id/approve
// @access  Private/Admin
export const approveProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  )

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    })
  }

  res.json({
    success: true,
    data: project,
  })
})

// @desc    Like project
// @route   POST /api/projects/:id/like
// @access  Public
export const likeProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)

  if (!project || !project.isApproved) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    })
  }

  await project.incrementLikes()

  res.json({
    success: true,
    message: 'Project liked successfully',
    likes: project.likes + 1,
  })
})

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private/Admin
export const getProjectStats = asyncHandler(async (req, res) => {
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
})

// @desc    Reorder projects
// @route   PUT /api/projects/reorder
// @access  Private/Admin
export const reorderProjects = asyncHandler(async (req, res) => {
  const { projectIds } = req.body

  if (!Array.isArray(projectIds)) {
    return res.status(400).json({
      success: false,
      message: 'projectIds must be an array',
    })
  }

  const updatePromises = projectIds.map((projectId, index) =>
    Project.findByIdAndUpdate(projectId, { position: index })
  )

  await Promise.all(updatePromises)

  res.json({
    success: true,
    message: 'Projects reordered successfully',
  })
})