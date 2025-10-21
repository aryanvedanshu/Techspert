import FAQ from '../models/FAQ.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
export const getFAQs = asyncHandler(async (req, res) => {
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
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ]
  }

  // Build sort object
  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }

  // Execute query
  const faqs = await FAQ.find(query)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean()

  const total = await FAQ.countDocuments(query)

  res.json({
    success: true,
    count: faqs.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: faqs,
  })
})

// @desc    Get single FAQ
// @route   GET /api/faqs/:id
// @access  Public
export const getFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id)

  if (!faq || !faq.isActive) {
    return res.status(404).json({
      success: false,
      message: 'FAQ not found',
    })
  }

  // Increment view count
  await faq.incrementViews()

  res.json({
    success: true,
    data: faq,
  })
})

// @desc    Create new FAQ
// @route   POST /api/faqs
// @access  Private/Admin
export const createFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.create(req.body)

  res.status(201).json({
    success: true,
    data: faq,
  })
})

// @desc    Update FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
export const updateFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!faq) {
    return res.status(404).json({
      success: false,
      message: 'FAQ not found',
    })
  }

  res.json({
    success: true,
    data: faq,
  })
})

// @desc    Delete FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
export const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!faq) {
    return res.status(404).json({
      success: false,
      message: 'FAQ not found',
    })
  }

  res.json({
    success: true,
    message: 'FAQ deleted successfully',
  })
})

// @desc    Mark FAQ as helpful
// @route   POST /api/faqs/:id/helpful
// @access  Public
export const markFAQHelpful = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id)

  if (!faq || !faq.isActive) {
    return res.status(404).json({
      success: false,
      message: 'FAQ not found',
    })
  }

  await faq.markHelpful()

  res.json({
    success: true,
    message: 'FAQ marked as helpful',
    helpful: faq.helpful + 1,
  })
})

// @desc    Mark FAQ as not helpful
// @route   POST /api/faqs/:id/not-helpful
// @access  Public
export const markFAQNotHelpful = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id)

  if (!faq || !faq.isActive) {
    return res.status(404).json({
      success: false,
      message: 'FAQ not found',
    })
  }

  await faq.markNotHelpful()

  res.json({
    success: true,
    message: 'FAQ marked as not helpful',
    notHelpful: faq.notHelpful + 1,
  })
})

// @desc    Get FAQ statistics
// @route   GET /api/faqs/stats
// @access  Private/Admin
export const getFAQStats = asyncHandler(async (req, res) => {
  const stats = await FAQ.aggregate([
    {
      $group: {
        _id: null,
        totalFAQs: { $sum: 1 },
        activeFAQs: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
        featuredFAQs: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] },
        },
        totalViews: { $sum: '$views' },
        totalHelpful: { $sum: '$helpful' },
        totalNotHelpful: { $sum: '$notHelpful' },
      },
    },
  ])

  const categoryStats = await FAQ.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        averageHelpful: { $avg: '$helpful' },
      },
    },
    { $sort: { count: -1 } },
  ])

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalFAQs: 0,
        activeFAQs: 0,
        featuredFAQs: 0,
        totalViews: 0,
        totalHelpful: 0,
        totalNotHelpful: 0,
      },
      byCategory: categoryStats,
    },
  })
})

// @desc    Reorder FAQs
// @route   PUT /api/faqs/reorder
// @access  Private/Admin
export const reorderFAQs = asyncHandler(async (req, res) => {
  const { faqIds } = req.body

  if (!Array.isArray(faqIds)) {
    return res.status(400).json({
      success: false,
      message: 'faqIds must be an array',
    })
  }

  const updatePromises = faqIds.map((faqId, index) =>
    FAQ.findByIdAndUpdate(faqId, { position: index })
  )

  await Promise.all(updatePromises)

  res.json({
    success: true,
    message: 'FAQs reordered successfully',
  })
})
