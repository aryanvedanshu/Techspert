import Footer from '../models/Footer.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get footer data
// @route   GET /api/footer
// @access  Public
export const getFooter = asyncHandler(async (req, res) => {
  console.log("[DEBUG: footerController.js:getFooter:7] Getting footer data")
  
  try {
    // Get the active footer configuration
    let footer = await Footer.findOne({ isActive: true })
    
    // If no footer exists, create a default one
    if (!footer) {
      console.log("[DEBUG: footerController.js:getFooter:12] No footer found, creating default")
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
      console.log("[DEBUG: footerController.js:getFooter:45] Default footer created and saved")
    }

    console.log("[DEBUG: footerController.js:getFooter:success:47] Footer data retrieved successfully")
    res.json({
      success: true,
      data: footer
    })
  } catch (error) {
    console.error("[DEBUG: footerController.js:getFooter:error:50] Error getting footer:", error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving footer data'
    })
  }
})

// @desc    Update footer data
// @route   PUT /api/footer
// @access  Private (Admin only)
export const updateFooter = asyncHandler(async (req, res) => {
  console.log("[DEBUG: footerController.js:updateFooter:58] Updating footer data")
  
  try {
    const footerData = req.body
    console.log("[DEBUG: footerController.js:updateFooter:61] Footer update data:", footerData)

    // Find existing footer or create new one
    let footer = await Footer.findOne({ isActive: true })
    
    if (footer) {
      // Update existing footer
      Object.assign(footer, footerData)
      await footer.save()
      console.log("[DEBUG: footerController.js:updateFooter:success:68] Footer updated successfully")
    } else {
      // Create new footer
      footer = new Footer(footerData)
      await footer.save()
      console.log("[DEBUG: footerController.js:updateFooter:success:72] New footer created successfully")
    }

    res.json({
      success: true,
      message: 'Footer updated successfully',
      data: footer
    })
  } catch (error) {
    console.error("[DEBUG: footerController.js:updateFooter:error:80] Error updating footer:", error)
    res.status(500).json({
      success: false,
      message: 'Error updating footer data'
    })
  }
})
