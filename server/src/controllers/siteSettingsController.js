import SiteSettings from '../models/SiteSettings.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get current site settings
// @route   GET /api/settings
// @access  Public
export const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getCurrentSettings()
  
  res.json({
    success: true,
    data: settings,
  })
})

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSiteSettings = asyncHandler(async (req, res) => {
  const updates = req.body
  const adminId = req.admin._id
  
  const settings = await SiteSettings.updateSettings(updates, adminId)
  
  res.json({
    success: true,
    message: 'Site settings updated successfully',
    data: settings,
  })
})

// @desc    Get site settings for admin
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getAdminSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getCurrentSettings()
  
  res.json({
    success: true,
    data: settings,
  })
})

// @desc    Update site settings from admin
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateAdminSiteSettings = asyncHandler(async (req, res) => {
  const updates = req.body
  const adminId = req.admin._id
  
  const settings = await SiteSettings.updateSettings(updates, adminId)
  
  res.json({
    success: true,
    message: 'Site settings updated successfully',
    data: settings,
  })
})

// @desc    Reset site settings to default
// @route   POST /api/admin/settings/reset
// @access  Private/Super Admin
export const resetSiteSettings = asyncHandler(async (req, res) => {
  const adminId = req.admin._id
  
  // Create new default settings
  const defaultSettings = new SiteSettings({
    version: 1,
    updatedBy: adminId,
    lastUpdated: new Date(),
  })
  
  await defaultSettings.save()
  
  res.json({
    success: true,
    message: 'Site settings reset to default successfully',
    data: defaultSettings,
  })
})

// @desc    Get settings history
// @route   GET /api/admin/settings/history
// @access  Private/Admin
export const getSettingsHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  
  const settings = await SiteSettings.find()
    .populate('updatedBy', 'name email')
    .sort({ version: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v')
  
  const total = await SiteSettings.countDocuments()
  
  res.json({
    success: true,
    count: settings.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: settings,
  })
})
