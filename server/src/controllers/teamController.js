import Team from '../models/Team.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
export const getTeam = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getTeam', {
    query: req.query
  })
  
  const {
    page = 1,
    limit = 12,
    department,
    featured,
    search,
    sort = 'position',
    order = 'asc',
  } = req.query

  logger.debug('Query parameters', { page, limit, department, featured, search, sort, order })

  // Build query
  let query = { isActive: true }
  logger.debug('Base query built', { query })

  if (department) {
    query.department = department
    logger.debug('Added department filter', { department })
  }

  if (featured === 'true') {
    query.isFeatured = true
    logger.debug('Added featured filter')
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
      { specialties: { $in: [new RegExp(search, 'i')] } },
    ]
    logger.debug('Added search filter', { search })
  }

  // Build sort object
  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }
  logger.debug('Sort object built', { sortObj })

  // Execute query
  logger.dbOperation('find', 'Team', query)
  const team = await Team.find(query)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean()

  const total = await Team.countDocuments(query)
  
  const duration = Date.now() - startTime
  logger.success('Team members fetched successfully', {
    count: team.length,
    total,
    page: parseInt(page),
    duration: `${duration}ms`
  })
  logger.functionExit('getTeam', {
    success: true,
    count: team.length,
    duration: `${duration}ms`
  })

  res.json({
    success: true,
    count: team.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: team,
  })
})

// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Public
export const getTeamMember = asyncHandler(async (req, res) => {
  const teamMember = await Team.findById(req.params.id)

  if (!teamMember || !teamMember.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Team member not found',
    })
  }

  res.json({
    success: true,
    data: teamMember,
  })
})

// @desc    Create new team member
// @route   POST /api/team
// @access  Private/Admin
export const createTeamMember = asyncHandler(async (req, res) => {
  const teamMember = await Team.create(req.body)

  res.status(201).json({
    success: true,
    data: teamMember,
  })
})

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private/Admin
export const updateTeamMember = asyncHandler(async (req, res) => {
  const teamMember = await Team.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!teamMember) {
    return res.status(404).json({
      success: false,
      message: 'Team member not found',
    })
  }

  res.json({
    success: true,
    data: teamMember,
  })
})

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
export const deleteTeamMember = asyncHandler(async (req, res) => {
  const teamMember = await Team.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!teamMember) {
    return res.status(404).json({
      success: false,
      message: 'Team member not found',
    })
  }

  res.json({
    success: true,
    message: 'Team member deleted successfully',
  })
})

// @desc    Get team statistics
// @route   GET /api/team/stats
// @access  Private/Admin
export const getTeamStats = asyncHandler(async (req, res) => {
  const stats = await Team.aggregate([
    {
      $group: {
        _id: null,
        totalMembers: { $sum: 1 },
        activeMembers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
        featuredMembers: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] },
        },
      },
    },
  ])

  const departmentStats = await Team.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])

  const roleStats = await Team.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalMembers: 0,
        activeMembers: 0,
        featuredMembers: 0,
      },
      byDepartment: departmentStats,
      byRole: roleStats,
    },
  })
})

// @desc    Reorder team members
// @route   PUT /api/team/reorder
// @access  Private/Admin
export const reorderTeam = asyncHandler(async (req, res) => {
  const { teamIds } = req.body

  if (!Array.isArray(teamIds)) {
    return res.status(400).json({
      success: false,
      message: 'teamIds must be an array',
    })
  }

  const updatePromises = teamIds.map((teamId, index) =>
    Team.findByIdAndUpdate(teamId, { position: index })
  )

  await Promise.all(updatePromises)

  res.json({
    success: true,
    message: 'Team members reordered successfully',
  })
})
