import ContactInfo from '../models/ContactInfo.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get all contact info
// @route   GET /api/contact-info
// @access  Public
export const getContactInfo = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    type,
    category,
    primary,
    search,
    sort = 'position',
    order = 'asc',
  } = req.query

  // Build query
  let query = { isActive: true }

  if (type) {
    query.type = type
  }

  if (category) {
    query.category = category
  }

  if (primary === 'true') {
    query.isPrimary = true
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { value: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  // Build sort object
  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }

  // Execute query
  const contactInfo = await ContactInfo.find(query)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean()

  const total = await ContactInfo.countDocuments(query)

  res.json({
    success: true,
    count: contactInfo.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: contactInfo,
  })
})

// @desc    Get single contact info
// @route   GET /api/contact-info/:id
// @access  Public
export const getContactInfoItem = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.findById(req.params.id)

  if (!contactInfo || !contactInfo.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Contact info not found',
    })
  }

  res.json({
    success: true,
    data: contactInfo,
  })
})

// @desc    Create new contact info
// @route   POST /api/contact-info
// @access  Private/Admin
export const createContactInfo = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.create(req.body)

  res.status(201).json({
    success: true,
    data: contactInfo,
  })
})

// @desc    Update contact info
// @route   PUT /api/contact-info/:id
// @access  Private/Admin
export const updateContactInfo = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!contactInfo) {
    return res.status(404).json({
      success: false,
      message: 'Contact info not found',
    })
  }

  res.json({
    success: true,
    data: contactInfo,
  })
})

// @desc    Delete contact info
// @route   DELETE /api/contact-info/:id
// @access  Private/Admin
export const deleteContactInfo = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!contactInfo) {
    return res.status(404).json({
      success: false,
      message: 'Contact info not found',
    })
  }

  res.json({
    success: true,
    message: 'Contact info deleted successfully',
  })
})

// @desc    Get contact info statistics
// @route   GET /api/contact-info/stats
// @access  Private/Admin
export const getContactInfoStats = asyncHandler(async (req, res) => {
  const stats = await ContactInfo.aggregate([
    {
      $group: {
        _id: null,
        totalContactInfo: { $sum: 1 },
        activeContactInfo: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
        primaryContactInfo: {
          $sum: { $cond: [{ $eq: ['$isPrimary', true] }, 1, 0] },
        },
      },
    },
  ])

  const typeStats = await ContactInfo.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])

  const categoryStats = await ContactInfo.aggregate([
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
        totalContactInfo: 0,
        activeContactInfo: 0,
        primaryContactInfo: 0,
      },
      byType: typeStats,
      byCategory: categoryStats,
    },
  })
})

// @desc    Reorder contact info
// @route   PUT /api/contact-info/reorder
// @access  Private/Admin
export const reorderContactInfo = asyncHandler(async (req, res) => {
  const { contactInfoIds } = req.body

  if (!Array.isArray(contactInfoIds)) {
    return res.status(400).json({
      success: false,
      message: 'contactInfoIds must be an array',
    })
  }

  const updatePromises = contactInfoIds.map((contactInfoId, index) =>
    ContactInfo.findByIdAndUpdate(contactInfoId, { position: index })
  )

  await Promise.all(updatePromises)

  res.json({
    success: true,
    message: 'Contact info reordered successfully',
  })
})
