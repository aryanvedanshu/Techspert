import Footer from '../models/Footer.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Get footer data
// @route   GET /api/footer
// @access  Public
export const getFooter = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getFooter')
  
  try {
    // Get the active footer configuration
    logger.dbOperation('findOne', 'Footer', { isActive: true })
    let footer = await Footer.findOne({ isActive: true })
    
    // If no footer exists, create a default one
    if (!footer) {
      logger.debug('No footer found, creating default footer')
      footer = new Footer({
        brand: {
          name: 'Techspert',
          description: 'Empowering the next generation of developers with cutting-edge technology courses and hands-on projects.',
          logo: '/images/logo.png'
        },
        navigation: {
          courses: [
            { name: 'AI Course', href: '/courses/ai', isActive: true, order: 1 },
            { name: 'Data Science', href: '/courses/data-science', isActive: true, order: 2 },
            { name: 'MERN Stack', href: '/courses/mern', isActive: true, order: 3 }
          ],
          resources: [
            { name: 'Projects', href: '/projects', isActive: true, order: 1 },
            { name: 'Certificates', href: '/certificates', isActive: true, order: 2 },
            { name: 'Alumni', href: '/alumni', isActive: true, order: 3 }
          ],
          company: [
            { name: 'About Us', href: '/about', isActive: true, order: 1 },
            { name: 'Contact', href: '/contact', isActive: true, order: 2 },
            { name: 'Admin', href: '/admin/login', isActive: true, order: 3 }
          ]
        },
        socialLinks: [
          { name: 'GitHub', href: '#', icon: 'Github', isActive: true, order: 1 },
          { name: 'Twitter', href: '#', icon: 'Twitter', isActive: true, order: 2 },
          { name: 'LinkedIn', href: '#', icon: 'Linkedin', isActive: true, order: 3 },
          { name: 'Email', href: 'mailto:contact@techspert.com', icon: 'Mail', isActive: true, order: 4 }
        ],
        legal: {
          copyright: 'Techspert. All rights reserved.',
          links: [
            { name: 'Privacy Policy', href: '/privacy', isActive: true, order: 1 },
            { name: 'Terms of Service', href: '/terms', isActive: true, order: 2 },
            { name: 'Cookie Policy', href: '/cookies', isActive: true, order: 3 }
          ]
        }
      })
      
      await footer.save()
      logger.success('Default footer created and saved', { footerId: footer._id })
    }

    const duration = Date.now() - startTime
    logger.success('Footer data retrieved successfully', {
      footerId: footer._id,
      duration: `${duration}ms`
    })
    logger.functionExit('getFooter', {
      success: true,
      duration: `${duration}ms`
    })
    res.json({
      success: true,
      data: footer
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Error getting footer', error, {
      duration: `${duration}ms`
    })
    logger.functionExit('getFooter', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update footer data
// @route   PUT /api/footer
// @access  Private (Admin only)
export const updateFooter = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('updateFooter', {
    bodyKeys: Object.keys(req.body),
    adminId: req.admin?._id
  })
  
  try {
    const footerData = req.body
    logger.debug('Footer update data received', { bodyKeys: Object.keys(footerData) })

    // Find existing footer or create new one
    logger.dbOperation('findOne', 'Footer', { isActive: true })
    let footer = await Footer.findOne({ isActive: true })
    
    if (footer) {
      // Update existing footer
      Object.assign(footer, footerData)
      await footer.save()
      const duration = Date.now() - startTime
      logger.success('Footer updated successfully', {
        footerId: footer._id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateFooter', {
        success: true,
        footerId: footer._id,
        duration: `${duration}ms`
      })
    } else {
      // Create new footer
      logger.dbOperation('create', 'Footer', footerData)
      footer = new Footer(footerData)
      await footer.save()
      const duration = Date.now() - startTime
      logger.success('New footer created successfully', {
        footerId: footer._id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateFooter', {
        success: true,
        footerId: footer._id,
        duration: `${duration}ms`
      })
    }

    res.json({
      success: true,
      message: 'Footer updated successfully',
      data: footer
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Error updating footer', error, {
      body: req.body,
      duration: `${duration}ms`
    })
    logger.functionExit('updateFooter', {
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})
