import Statistic from '../models/Statistic.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get all statistics
// @route   GET /api/statistics
// @access  Public
export const getStatistics = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    featured,
    search,
    sort = 'position',
    order = 'asc',
  } = req.query

  // Build query
  let query = { isActive: true }

  if (category) {
    query.category = category
  }

  if (featured === 'true') {
    query.isFeatured = true
  }

  if (search) {
    query.$or = [
      { label: { $regex: search, $options: 'i' } },
      { value: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  // Build sort object
  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }

  // Execute query
  const statistics = await Statistic.find(query)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean()

  const total = await Statistic.countDocuments(query)

  res.json({
    success: true,
    count: statistics.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: statistics,
  })
})

// @desc    Get single statistic
// @route   GET /api/statistics/:id
// @access  Public
export const getStatistic = asyncHandler(async (req, res) => {
  const statistic = await Statistic.findById(req.params.id)

  if (!statistic || !statistic.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Statistic not found',
    })
  }

  res.json({
    success: true,
    data: statistic,
  })
})

// @desc    Create new statistic
// @route   POST /api/statistics
// @access  Private/Admin
export const createStatistic = asyncHandler(async (req, res) => {
  const statistic = await Statistic.create(req.body)

  res.status(201).json({
    success: true,
    data: statistic,
  })
})

// @desc    Update statistic
// @route   PUT /api/statistics/:id
// @access  Private/Admin
export const updateStatistic = asyncHandler(async (req, res) => {
  const statistic = await Statistic.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!statistic) {
    return res.status(404).json({
      success: false,
      message: 'Statistic not found',
    })
  }

  res.json({
    success: true,
    data: statistic,
  })
})

// @desc    Delete statistic
// @route   DELETE /api/statistics/:id
// @access  Private/Admin
export const deleteStatistic = asyncHandler(async (req, res) => {
  const statistic = await Statistic.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!statistic) {
    return res.status(404).json({
      success: false,
      message: 'Statistic not found',
    })
  }

  res.json({
    success: true,
    message: 'Statistic deleted successfully',
  })
})

// @desc    Get statistic statistics
// @route   GET /api/statistics/stats
// @access  Private/Admin
export const getStatisticStats = asyncHandler(async (req, res) => {
  const stats = await Statistic.aggregate([
    {
      $group: {
        _id: null,
        totalStatistics: { $sum: 1 },
        activeStatistics: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
        featuredStatistics: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] },
        },
      },
    },
  ])

  const categoryStats = await Statistic.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalStatistics: 0,
        activeStatistics: 0,
        featuredStatistics: 0,
      },
      byCategory: categoryStats,
    },
  })
})

// @desc    Reorder statistics
// @route   PUT /api/statistics/reorder
// @access  Private/Admin
export const reorderStatistics = asyncHandler(async (req, res) => {
  const { statisticIds } = req.body

  if (!Array.isArray(statisticIds)) {
    return res.status(400).json({
      success: false,
      message: 'statisticIds must be an array',
    })
  }

  const updatePromises = statisticIds.map((statisticId, index) =>
    Statistic.findByIdAndUpdate(statisticId, { position: index })
  )

  await Promise.all(updatePromises)

  res.json({
    success: true,
    message: 'Statistics reordered successfully',
  })
})
