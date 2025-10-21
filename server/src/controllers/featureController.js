import Feature from '../models/Feature.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get all features
// @route   GET /api/features
// @access  Public
export const getFeatures = asyncHandler(async (req, res) => {
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
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  // Build sort object
  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }

  // Execute query
  const features = await Feature.find(query)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean()

  const total = await Feature.countDocuments(query)

  res.json({
    success: true,
    count: features.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: features,
  })
})

// @desc    Get single feature
// @route   GET /api/features/:id
// @access  Public
export const getFeature = asyncHandler(async (req, res) => {
  const feature = await Feature.findById(req.params.id)

  if (!feature || !feature.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Feature not found',
    })
  }

  res.json({
    success: true,
    data: feature,
  })
})

// @desc    Create new feature
// @route   POST /api/features
// @access  Private/Admin
export const createFeature = asyncHandler(async (req, res) => {
  const feature = await Feature.create(req.body)

  res.status(201).json({
    success: true,
    data: feature,
  })
})

// @desc    Update feature
// @route   PUT /api/features/:id
// @access  Private/Admin
export const updateFeature = asyncHandler(async (req, res) => {
  const feature = await Feature.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!feature) {
    return res.status(404).json({
      success: false,
      message: 'Feature not found',
    })
  }

  res.json({
    success: true,
    data: feature,
  })
})

// @desc    Delete feature
// @route   DELETE /api/features/:id
// @access  Private/Admin
export const deleteFeature = asyncHandler(async (req, res) => {
  const feature = await Feature.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!feature) {
    return res.status(404).json({
      success: false,
      message: 'Feature not found',
    })
  }

  res.json({
    success: true,
    message: 'Feature deleted successfully',
  })
})

// @desc    Get feature statistics
// @route   GET /api/features/stats
// @access  Private/Admin
export const getFeatureStats = asyncHandler(async (req, res) => {
  const stats = await Feature.aggregate([
    {
      $group: {
        _id: null,
        totalFeatures: { $sum: 1 },
        activeFeatures: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
        featuredFeatures: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] },
        },
      },
    },
  ])

  const categoryStats = await Feature.aggregate([
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
        totalFeatures: 0,
        activeFeatures: 0,
        featuredFeatures: 0,
      },
      byCategory: categoryStats,
    },
  })
})

// @desc    Reorder features
// @route   PUT /api/features/reorder
// @access  Private/Admin
export const reorderFeatures = asyncHandler(async (req, res) => {
  const { featureIds } = req.body

  if (!Array.isArray(featureIds)) {
    return res.status(400).json({
      success: false,
      message: 'featureIds must be an array',
    })
  }

  const updatePromises = featureIds.map((featureId, index) =>
    Feature.findByIdAndUpdate(featureId, { position: index })
  )

  await Promise.all(updatePromises)

  res.json({
    success: true,
    message: 'Features reordered successfully',
  })
})
