import SiteSettings from '../models/SiteSettings.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getCurrent()
  
  res.json({
    success: true,
    data: settings,
  })
})

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.updateSettings(req.body)
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: settings,
  })
})

// @desc    Update theme settings
// @route   PUT /api/settings/theme
// @access  Private/Admin
export const updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body
  
  if (!theme) {
    return res.status(400).json({
      success: false,
      message: 'Theme data is required',
    })
  }
  
  const settings = await SiteSettings.getCurrent()
  settings.theme = { ...settings.theme, ...theme }
  await settings.save()
  
  res.json({
    success: true,
    message: 'Theme updated successfully',
    data: settings.theme,
  })
})

// @desc    Update contact settings
// @route   PUT /api/settings/contact
// @access  Private/Admin
export const updateContact = asyncHandler(async (req, res) => {
  const { contact } = req.body
  
  if (!contact) {
    return res.status(400).json({
      success: false,
      message: 'Contact data is required',
    })
  }
  
  const settings = await SiteSettings.getCurrent()
  settings.contact = { ...settings.contact, ...contact }
  await settings.save()
  
  res.json({
    success: true,
    message: 'Contact settings updated successfully',
    data: settings.contact,
  })
})

// @desc    Update social media settings
// @route   PUT /api/settings/social
// @access  Private/Admin
export const updateSocialMedia = asyncHandler(async (req, res) => {
  const { socialMedia } = req.body
  
  if (!socialMedia) {
    return res.status(400).json({
      success: false,
      message: 'Social media data is required',
    })
  }
  
  const settings = await SiteSettings.getCurrent()
  settings.socialMedia = { ...settings.socialMedia, ...socialMedia }
  await settings.save()
  
  res.json({
    success: true,
    message: 'Social media settings updated successfully',
    data: settings.socialMedia,
  })
})

// @desc    Update home page content
// @route   PUT /api/settings/homepage
// @access  Private/Admin
export const updateHomePage = asyncHandler(async (req, res) => {
  const { homePage } = req.body
  
  if (!homePage) {
    return res.status(400).json({
      success: false,
      message: 'Home page data is required',
    })
  }
  
  const settings = await SiteSettings.getCurrent()
  settings.homePage = { ...settings.homePage, ...homePage }
  await settings.save()
  
  res.json({
    success: true,
    message: 'Home page content updated successfully',
    data: settings.homePage,
  })
})

// @desc    Update SEO settings
// @route   PUT /api/settings/seo
// @access  Private/Admin
export const updateSEO = asyncHandler(async (req, res) => {
  const { seo } = req.body
  
  if (!seo) {
    return res.status(400).json({
      success: false,
      message: 'SEO data is required',
    })
  }
  
  const settings = await SiteSettings.getCurrent()
  settings.seo = { ...settings.seo, ...seo }
  await settings.save()
  
  res.json({
    success: true,
    message: 'SEO settings updated successfully',
    data: settings.seo,
  })
})

// @desc    Update feature flags
// @route   PUT /api/settings/features
// @access  Private/Admin
export const updateFeatures = asyncHandler(async (req, res) => {
  const { features } = req.body
  
  if (!features) {
    return res.status(400).json({
      success: false,
      message: 'Features data is required',
    })
  }
  
  const settings = await SiteSettings.getCurrent()
  settings.features = { ...settings.features, ...features }
  await settings.save()
  
  res.json({
    success: true,
    message: 'Feature flags updated successfully',
    data: settings.features,
  })
})

// @desc    Toggle maintenance mode
// @route   PUT /api/settings/maintenance
// @access  Private/Admin
export const toggleMaintenance = asyncHandler(async (req, res) => {
  const { enabled, message } = req.body
  
  const settings = await SiteSettings.getCurrent()
  settings.maintenance.enabled = enabled !== undefined ? enabled : !settings.maintenance.enabled
  
  if (message) {
    settings.maintenance.message = message
  }
  
  await settings.save()
  
  res.json({
    success: true,
    message: `Maintenance mode ${settings.maintenance.enabled ? 'enabled' : 'disabled'}`,
    data: settings.maintenance,
  })
})

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private/Super Admin
export const resetSettings = asyncHandler(async (req, res) => {
  await SiteSettings.deleteMany({})
  const settings = await SiteSettings.create({})
  
  res.json({
    success: true,
    message: 'Settings reset to default values',
    data: settings,
  })
})
