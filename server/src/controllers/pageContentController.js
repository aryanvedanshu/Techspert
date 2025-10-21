import PageContent from '../models/PageContent.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get page content
// @route   GET /api/page-content/:page
// @access  Public
export const getPageContent = asyncHandler(async (req, res) => {
  const { page } = req.params

  const pageContent = await PageContent.getPageContent(page)

  if (!pageContent) {
    return res.status(404).json({
      success: false,
      message: 'Page content not found',
    })
  }

  res.json({
    success: true,
    data: pageContent,
  })
})

// @desc    Update page content
// @route   PUT /api/page-content/:page
// @access  Private/Admin
export const updatePageContent = asyncHandler(async (req, res) => {
  const { page } = req.params
  const updates = req.body
  const adminId = req.admin._id

  const pageContent = await PageContent.updatePageContent(page, updates, adminId)

  res.json({
    success: true,
    message: 'Page content updated successfully',
    data: pageContent,
  })
})

// @desc    Get all page contents
// @route   GET /api/page-content
// @access  Private/Admin
export const getAllPageContents = asyncHandler(async (req, res) => {
  const pageContents = await PageContent.find({ isActive: true })
    .populate('updatedBy', 'name email')
    .sort({ page: 1 })

  res.json({
    success: true,
    count: pageContents.length,
    data: pageContents,
  })
})

// @desc    Create page content
// @route   POST /api/page-content
// @access  Private/Admin
export const createPageContent = asyncHandler(async (req, res) => {
  const adminId = req.admin._id
  const pageContent = await PageContent.create({
    ...req.body,
    updatedBy: adminId,
  })

  res.status(201).json({
    success: true,
    data: pageContent,
  })
})

// @desc    Delete page content
// @route   DELETE /api/page-content/:page
// @access  Private/Admin
export const deletePageContent = asyncHandler(async (req, res) => {
  const { page } = req.params

  const pageContent = await PageContent.findOneAndUpdate(
    { page },
    { isActive: false },
    { new: true }
  )

  if (!pageContent) {
    return res.status(404).json({
      success: false,
      message: 'Page content not found',
    })
  }

  res.json({
    success: true,
    message: 'Page content deleted successfully',
  })
})

// @desc    Get page content history
// @route   GET /api/page-content/:page/history
// @access  Private/Admin
export const getPageContentHistory = asyncHandler(async (req, res) => {
  const { page } = req.params
  const { limit = 10 } = req.query

  const pageContents = await PageContent.find({ page })
    .populate('updatedBy', 'name email')
    .sort({ lastUpdated: -1 })
    .limit(limit * 1)

  res.json({
    success: true,
    count: pageContents.length,
    data: pageContents,
  })
})
