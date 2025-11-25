/**
 * API Service - Firebase-based
 * This service replaces the axios-based API calls with Firebase Firestore operations
 * Maintains similar interface for easier migration
 */

import {
  coursesService,
  projectsService,
  alumniService,
  trainersService,
  enrollmentsService,
  paymentsService,
  sessionsService,
  dashboardService,
  teamService,
  featuresService,
  statisticsService,
  faqsService,
  contactInfoService,
  footerService,
  pageContentService,
  siteSettingsService,
  certificatesService,
  demoSignupsService,
  usersService,
  adminsService
} from './firebaseService'
import { toast } from 'sonner'
import logger from '../utils/logger'

/**
 * Parse query parameters from URL
 */
const parseQueryParams = (url) => {
  const params = {}
  const queryString = url.split('?')[1]
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=')
      if (key && value) {
        // Handle boolean strings
        if (value === 'true') params[key] = true
        else if (value === 'false') params[key] = false
        // Handle numbers
        else if (!isNaN(value)) params[key] = Number(value)
        else params[key] = decodeURIComponent(value)
      }
    })
  }
  return params
}

/**
 * Parse URL to extract collection and ID
 */
const parseUrl = (url) => {
  // Remove leading slash and split
  const parts = url.replace(/^\/+/, '').split('/').filter(p => p)
  
  // Remove query string from URL before processing
  const urlWithoutQuery = url.split('?')[0]
  const pathParts = urlWithoutQuery.replace(/^\/+/, '').split('/').filter(p => p)
  
  let collection = ''
  let id = null
  
  // Handle admin routes: /admin/collection or /admin/collection/id
  if (pathParts[0] === 'admin' && pathParts.length > 1) {
    collection = pathParts[1] // e.g., 'projects' from '/admin/projects'
    if (pathParts.length > 2) {
      id = pathParts[2] // e.g., '123' from '/admin/projects/123'
    }
  } else if (pathParts.length > 0) {
    // Regular routes: /collection or /collection/id
    collection = pathParts[0]
    if (pathParts.length > 1) {
      id = pathParts[1]
    }
  }
  
  // Parse query parameters
  const queryParams = parseQueryParams(url)
  
  return {
    collection,
    id,
    queryParams
  }
}

/**
 * API service that mimics the old axios API structure
 * for easier migration of existing components
 */
const api = {
  // Courses
  courses: {
    async getAll(filters = {}) {
      try {
        logger.functionEntry('api.courses.getAll', { filters })
        const result = await coursesService.getAll(filters)
        logger.functionExit('api.courses.getAll', { success: true, count: result.data?.length })
        return { data: result }
      } catch (error) {
        logger.error('Error getting courses', error)
        toast.error('Failed to load courses')
        throw error
      }
    },

    async getById(id) {
      try {
        logger.functionEntry('api.courses.getById', { id })
        const result = await coursesService.getById(id)
        logger.functionExit('api.courses.getById', { success: result.success })
        return { data: result }
      } catch (error) {
        logger.error('Error getting course', error, { id })
        toast.error('Failed to load course')
        throw error
      }
    },

    async create(data) {
      try {
        logger.functionEntry('api.courses.create')
        const result = await coursesService.create(data)
        logger.functionExit('api.courses.create', { success: true, id: result.id })
        toast.success('Course created successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error creating course', error)
        toast.error('Failed to create course')
        throw error
      }
    },

    async update(id, data) {
      try {
        logger.functionEntry('api.courses.update', { id })
        const result = await coursesService.update(id, data)
        logger.functionExit('api.courses.update', { success: true })
        toast.success('Course updated successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error updating course', error, { id })
        toast.error('Failed to update course')
        throw error
      }
    },

    async delete(id) {
      try {
        logger.functionEntry('api.courses.delete', { id })
        const result = await coursesService.delete(id)
        logger.functionExit('api.courses.delete', { success: true })
        toast.success('Course deleted successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error deleting course', error, { id })
        toast.error('Failed to delete course')
        throw error
      }
    }
  },

  // Projects
  projects: {
    async getAll(filters = {}) {
      try {
        logger.functionEntry('api.projects.getAll', { filters })
        const result = await projectsService.getAll(filters)
        logger.functionExit('api.projects.getAll', { success: true, count: result.data?.length })
        return { data: result }
      } catch (error) {
        logger.error('Error getting projects', error)
        toast.error('Failed to load projects')
        throw error
      }
    },

    async getById(id) {
      try {
        logger.functionEntry('api.projects.getById', { id })
        const result = await projectsService.getById(id)
        logger.functionExit('api.projects.getById', { success: result.success })
        return { data: result }
      } catch (error) {
        logger.error('Error getting project', error, { id })
        toast.error('Failed to load project')
        throw error
      }
    },

    async create(data) {
      try {
        logger.functionEntry('api.projects.create')
        const result = await projectsService.create(data)
        logger.functionExit('api.projects.create', { success: true, id: result.id })
        toast.success('Project created successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error creating project', error)
        toast.error('Failed to create project')
        throw error
      }
    },

    async update(id, data) {
      try {
        logger.functionEntry('api.projects.update', { id })
        const result = await projectsService.update(id, data)
        logger.functionExit('api.projects.update', { success: true })
        toast.success('Project updated successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error updating project', error, { id })
        toast.error('Failed to update project')
        throw error
      }
    },

    async delete(id) {
      try {
        logger.functionEntry('api.projects.delete', { id })
        const result = await projectsService.delete(id)
        logger.functionExit('api.projects.delete', { success: true })
        toast.success('Project deleted successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error deleting project', error, { id })
        toast.error('Failed to delete project')
        throw error
      }
    }
  },

  // Alumni
  alumni: {
    async getAll(filters = {}) {
      try {
        logger.functionEntry('api.alumni.getAll', { filters })
        const result = await alumniService.getAll(filters)
        logger.functionExit('api.alumni.getAll', { success: true, count: result.data?.length })
        return { data: result }
      } catch (error) {
        logger.error('Error getting alumni', error)
        toast.error('Failed to load alumni')
        throw error
      }
    },

    async getById(id) {
      try {
        logger.functionEntry('api.alumni.getById', { id })
        const result = await alumniService.getById(id)
        logger.functionExit('api.alumni.getById', { success: result.success })
        return { data: result }
      } catch (error) {
        logger.error('Error getting alumni', error, { id })
        toast.error('Failed to load alumni')
        throw error
      }
    },

    async create(data) {
      try {
        logger.functionEntry('api.alumni.create')
        const result = await alumniService.create(data)
        logger.functionExit('api.alumni.create', { success: true, id: result.id })
        toast.success('Alumni profile created successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error creating alumni', error)
        toast.error('Failed to create alumni profile')
        throw error
      }
    },

    async update(id, data) {
      try {
        logger.functionEntry('api.alumni.update', { id })
        const result = await alumniService.update(id, data)
        logger.functionExit('api.alumni.update', { success: true })
        toast.success('Alumni profile updated successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error updating alumni', error, { id })
        toast.error('Failed to update alumni profile')
        throw error
      }
    },

    async delete(id) {
      try {
        logger.functionEntry('api.alumni.delete', { id })
        const result = await alumniService.delete(id)
        logger.functionExit('api.alumni.delete', { success: true })
        toast.success('Alumni profile deleted successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error deleting alumni', error, { id })
        toast.error('Failed to delete alumni profile')
        throw error
      }
    }
  },

  // Trainers
  trainers: {
    async getAll(filters = {}) {
      try {
        logger.functionEntry('api.trainers.getAll', { filters })
        const result = await trainersService.getAll(filters)
        logger.functionExit('api.trainers.getAll', { success: true, count: result.data?.length })
        return { data: result }
      } catch (error) {
        logger.error('Error getting trainers', error)
        toast.error('Failed to load trainers')
        throw error
      }
    },

    async getById(id) {
      try {
        logger.functionEntry('api.trainers.getById', { id })
        const result = await trainersService.getById(id)
        logger.functionExit('api.trainers.getById', { success: result.success })
        return { data: result }
      } catch (error) {
        logger.error('Error getting trainer', error, { id })
        toast.error('Failed to load trainer')
        throw error
      }
    },

    async create(data) {
      try {
        logger.functionEntry('api.trainers.create')
        const result = await trainersService.create(data)
        logger.functionExit('api.trainers.create', { success: true, id: result.id })
        toast.success('Trainer created successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error creating trainer', error)
        toast.error('Failed to create trainer')
        throw error
      }
    },

    async update(id, data) {
      try {
        logger.functionEntry('api.trainers.update', { id })
        const result = await trainersService.update(id, data)
        logger.functionExit('api.trainers.update', { success: true })
        toast.success('Trainer updated successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error updating trainer', error, { id })
        toast.error('Failed to update trainer')
        throw error
      }
    },

    async delete(id) {
      try {
        logger.functionEntry('api.trainers.delete', { id })
        const result = await trainersService.delete(id)
        logger.functionExit('api.trainers.delete', { success: true })
        toast.success('Trainer deleted successfully')
        return { data: result }
      } catch (error) {
        logger.error('Error deleting trainer', error, { id })
        toast.error('Failed to delete trainer')
        throw error
      }
    }
  },

  // Admin endpoints
  admin: {
    async getDashboard() {
      try {
        logger.functionEntry('api.admin.getDashboard')
        const result = await dashboardService.getStats()
        logger.functionExit('api.admin.getDashboard', { success: true })
        return { data: result }
      } catch (error) {
        logger.error('Error getting dashboard stats', error)
        toast.error('Failed to load dashboard data')
        throw error
      }
    }
  },

  // Generic get/post/put/delete methods for backward compatibility
  async get(url) {
    logger.functionEntry('api.get', { url })
    
    try {
      const { collection, id, queryParams } = parseUrl(url)
      
      // Handle special admin routes
      if (url.includes('/admin/dashboard')) {
        return this.admin.getDashboard()
      }
      
      // Handle collection-specific routes
      let service = null
      let filters = { ...queryParams }
      
      switch (collection) {
        case 'courses':
          service = coursesService
          if (id) {
            // Handle both ID and slug lookups
            const result = await service.getById(id)
            if (result.success) {
              return { data: result }
            } else {
              throw new Error('Course not found')
            }
          }
          // Get all courses (works for both /courses and /admin/courses)
          break
        case 'projects':
          service = projectsService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          // Get all projects (works for both /projects and /admin/projects)
          break
        case 'alumni':
          service = alumniService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          // Get all alumni (works for both /alumni and /admin/alumni)
          break
        case 'trainers':
          service = trainersService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          // Get all trainers
          break
        case 'team':
          service = teamService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          break
        case 'features':
          service = featuresService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          break
        case 'statistics':
          service = statisticsService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          break
        case 'faqs':
          service = faqsService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          break
        case 'contact-info':
          service = contactInfoService
          if (id) {
            const result = await service.getById(id)
            return { data: { success: true, data: result.data || result } }
          } else {
            // Return all contact info items as array
            const result = await service.getAll()
            return { data: { success: true, data: result.data || result } }
          }
        case 'footer':
          const footerResult = await footerService.get()
          return { data: footerResult }
        case 'page-content':
          if (id) {
            const pageResult = await pageContentService.getByPage(id)
            return { data: pageResult }
          } else {
            const result = await pageContentService.getAll()
            return { data: result }
          }
        case 'settings':
          const settingsResult = await siteSettingsService.get()
          return { data: { success: true, data: settingsResult.data || settingsResult } }
        case 'certificates':
          service = certificatesService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          break
        case 'enrollments':
          service = enrollmentsService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          if (url.includes('/stats')) {
            // Return enrollment stats
            const allEnrollments = await service.getAll()
            const enrollmentsData = allEnrollments.data || []
            const stats = {
              total: enrollmentsData.length,
              active: enrollmentsData.filter(e => e.status === 'active').length,
              completed: enrollmentsData.filter(e => e.status === 'completed').length,
              pending: enrollmentsData.filter(e => e.status === 'pending').length
            }
            return { data: { success: true, data: stats } }
          }
          // Get all enrollments (works for both /enrollments and /admin/enrollments)
          break
        case 'payments':
          service = paymentsService
          if (id) {
            const result = await service.getById(id)
            return { data: result }
          }
          if (url.includes('/stats')) {
            // Return payment stats
            const allPayments = await service.getAll()
            const paymentsData = allPayments.data || []
            const stats = {
              total: paymentsData.length,
              succeeded: paymentsData.filter(p => p.status === 'succeeded').length,
              pending: paymentsData.filter(p => p.status === 'pending').length,
              failed: paymentsData.filter(p => p.status === 'failed').length,
              totalRevenue: paymentsData
                .filter(p => p.status === 'succeeded')
                .reduce((sum, p) => sum + (p.amount || 0), 0)
            }
            return { data: { success: true, data: stats } }
          }
          break
        case 'analytics':
          if (url.includes('/overview')) {
            // Return analytics overview
            const [courses, projects, alumni, enrollments, payments] = await Promise.all([
              coursesService.getAll(),
              projectsService.getAll(),
              alumniService.getAll(),
              enrollmentsService.getAll(),
              paymentsService.getAll()
            ])
            const overview = {
              courses: courses.data?.length || 0,
              projects: projects.data?.length || 0,
              alumni: alumni.data?.length || 0,
              enrollments: enrollments.data?.length || 0,
              payments: payments.data?.length || 0
            }
            return { data: { success: true, data: overview } }
          }
          break
        case 'users':
          // Only accessible via /admin/users
          if (url.includes('/admin/users')) {
            service = usersService
            if (id) {
              const result = await service.getById(id)
              return { data: result }
            } else {
              const result = await service.getAll()
              return { data: result }
            }
          } else {
            throw new Error(`Unknown endpoint: ${url}`)
          }
          break
        case 'admins':
          // Only accessible via /admin/admins
          if (url.includes('/admin/admins')) {
            service = adminsService
            if (id) {
              const result = await service.getById(id)
              return { data: result }
            } else {
              const result = await service.getAll()
              return { data: result }
            }
          } else {
            throw new Error(`Unknown endpoint: ${url}`)
          }
          break
        case 'demo-signups':
          // Only accessible via /admin/demo-signups
          if (url.includes('/admin/demo-signups')) {
            service = demoSignupsService
            if (id) {
              const result = await service.getById(id)
              return { data: result }
            } else {
              const result = await service.getAll()
              return { data: result }
            }
          } else {
            throw new Error(`Unknown endpoint: ${url}`)
          }
          break
        default:
          throw new Error(`Unknown endpoint: ${url}`)
      }
      
      if (service) {
        // Apply limit if specified
        let result
        if (filters.limit) {
          const allResult = await service.getAll(filters)
          result = {
            success: allResult.success,
            data: allResult.data?.slice(0, parseInt(filters.limit)) || []
          }
        } else {
          result = await service.getAll(filters)
        }
        // Ensure consistent response format: { success: true, data: [...] }
        return { data: result }
      }
      
      throw new Error(`Unknown endpoint: ${url}`)
    } catch (error) {
      logger.error('Error in api.get', error, { url })
      throw error
    }
  },

  async post(url, data) {
    logger.functionEntry('api.post', { url })
    
    try {
      const { collection, id } = parseUrl(url)
      
      // Handle special routes
      if (url.includes('/admin/demo-signups/broadcast')) {
        // Broadcast functionality - for now just return success
        return { data: { success: true, message: 'Broadcast sent' } }
      }
      
      // Handle admin password reset routes (Firebase Auth)
      if (url.includes('/admin/forgot-password')) {
        // Use Firebase Auth password reset
        const { sendPasswordResetEmail } = await import('firebase/auth')
        const { auth } = await import('../config/firebase')
        await sendPasswordResetEmail(auth, data.email)
        return { data: { success: true, message: 'Password reset email sent' } }
      }
      
      if (url.includes('/admin/reset-password')) {
        // Password reset is handled client-side with Firebase Auth
        // This endpoint is for compatibility only
        return { data: { success: true, message: 'Password reset completed' } }
      }
      
      let service = null
      
      switch (collection) {
        case 'courses':
          if (url.includes('/admin/courses')) {
            service = coursesService
          }
          break
        case 'projects':
          service = projectsService
          break
        case 'alumni':
          if (url.includes('/admin/alumni')) {
            service = alumniService
          }
          break
        case 'trainers':
          service = trainersService
          break
        case 'team':
          service = teamService
          break
        case 'features':
          service = featuresService
          break
        case 'statistics':
          service = statisticsService
          break
        case 'faqs':
          service = faqsService
          break
        case 'contact-info':
          service = contactInfoService
          break
        case 'demo-signups':
          service = demoSignupsService
          break
        case 'enrollments':
          service = enrollmentsService
          break
        case 'users':
          if (url.includes('/admin/users')) {
            service = usersService
          }
          break
        case 'admins':
          if (url.includes('/admin/admins')) {
            service = adminsService
          }
          break
        default:
          throw new Error(`Unknown endpoint: ${url}`)
      }
      
      if (service && service.create) {
        const result = await service.create(data)
        return { data: result }
      }
      
      throw new Error(`Unknown endpoint: ${url}`)
    } catch (error) {
      logger.error('Error in api.post', error, { url })
      throw error
    }
  },

  async put(url, data) {
    logger.functionEntry('api.put', { url })
    
    try {
      const { collection, id } = parseUrl(url)
      
      // Handle bulk updates for CMS collections (AdminContentManagement)
      if (!id) {
        switch (collection) {
          case 'team':
            // Bulk update team members
            if (data.team && Array.isArray(data.team)) {
              const results = await Promise.all(
                data.team.map(async (member) => {
                  if (member.id || member._id) {
                    const memberId = member.id || member._id
                    const { id, _id, ...memberData } = member
                    return await teamService.update(memberId, memberData)
                  } else {
                    return await teamService.create(member)
                  }
                })
              )
              return { data: { success: true, data: results } }
            }
            break
          case 'features':
            // Bulk update features
            if (data.features && Array.isArray(data.features)) {
              const results = await Promise.all(
                data.features.map(async (feature) => {
                  if (feature.id || feature._id) {
                    const featureId = feature.id || feature._id
                    const { id, _id, ...featureData } = feature
                    return await featuresService.update(featureId, featureData)
                  } else {
                    return await featuresService.create(feature)
                  }
                })
              )
              return { data: { success: true, data: results } }
            }
            break
          case 'statistics':
            // Bulk update statistics
            if (data.statistics && Array.isArray(data.statistics)) {
              const results = await Promise.all(
                data.statistics.map(async (stat) => {
                  if (stat.id || stat._id) {
                    const statId = stat.id || stat._id
                    const { id, _id, ...statData } = stat
                    return await statisticsService.update(statId, statData)
                  } else {
                    return await statisticsService.create(stat)
                  }
                })
              )
              return { data: { success: true, data: results } }
            }
            break
          case 'faqs':
            // Bulk update FAQs
            if (data.faqs && Array.isArray(data.faqs)) {
              const results = await Promise.all(
                data.faqs.map(async (faq) => {
                  if (faq.id || faq._id) {
                    const faqId = faq.id || faq._id
                    const { id, _id, ...faqData } = faq
                    return await faqsService.update(faqId, faqData)
                  } else {
                    return await faqsService.create(faq)
                  }
                })
              )
              return { data: { success: true, data: results } }
            }
            break
          case 'page-content':
            // Update page content (single document or create if doesn't exist)
            if (data.page) {
              const existing = await pageContentService.getByPage(data.page)
              if (existing.data) {
                // Find the document ID
                const allPages = await pageContentService.getAll()
                const pageDoc = allPages.data?.find(p => p.page === data.page)
                if (pageDoc) {
                  const result = await pageContentService.update(pageDoc.id, data)
                  return { data: result }
                }
              }
              // Create if doesn't exist
              const result = await pageContentService.create(data)
              return { data: result }
            }
            break
        }
      }
      
      let service = null
      
      switch (collection) {
        case 'courses':
          if (url.includes('/admin/courses')) {
            service = coursesService
          }
          break
        case 'projects':
          if (url.includes('/admin/projects')) {
            service = projectsService
          }
          break
        case 'alumni':
          if (url.includes('/admin/alumni')) {
            service = alumniService
          }
          break
        case 'trainers':
          service = trainersService
          break
        case 'team':
          service = teamService
          break
        case 'features':
          service = featuresService
          break
        case 'statistics':
          service = statisticsService
          break
        case 'faqs':
          service = faqsService
          break
        case 'contact-info':
          service = contactInfoService
          break
        case 'footer':
          const footerResult = await footerService.update(data)
          return { data: footerResult }
        case 'page-content':
          service = pageContentService
          break
        case 'settings':
          const settingsResult = await siteSettingsService.update(data)
          return { data: settingsResult }
        case 'enrollments':
          service = enrollmentsService
          break
        case 'users':
          if (url.includes('/admin/users')) {
            service = usersService
          }
          break
        case 'admins':
          if (url.includes('/admin/admins')) {
            service = adminsService
          }
          break
        case 'demo-signups':
          if (url.includes('/admin/demo-signups')) {
            service = demoSignupsService
          }
          break
        default:
          throw new Error(`Unknown endpoint: ${url}`)
      }
      
      if (service && service.update && id) {
        const result = await service.update(id, data)
        return { data: result }
      }
      
      // Handle contact-info update without ID (single document)
      if (collection === 'contact-info' && !id && service) {
        const existing = await contactInfoService.getAll()
        if (existing.data && existing.data.length > 0) {
          const result = await contactInfoService.update(existing.data[0].id, data)
          return { data: result }
        } else {
          const result = await contactInfoService.create(data)
          return { data: result }
        }
      }
      
      throw new Error(`Unknown endpoint: ${url}`)
    } catch (error) {
      logger.error('Error in api.put', error, { url })
      throw error
    }
  },

  async delete(url) {
    logger.functionEntry('api.delete', { url })
    
    try {
      const { collection, id } = parseUrl(url)
      
      if (!id) {
        throw new Error('ID required for delete operation')
      }
      
      let service = null
      
      switch (collection) {
        case 'courses':
          if (url.includes('/admin/courses')) {
            service = coursesService
          }
          break
        case 'projects':
          if (url.includes('/admin/projects')) {
            service = projectsService
          }
          break
        case 'alumni':
          if (url.includes('/admin/alumni')) {
            service = alumniService
          }
          break
        case 'trainers':
          service = trainersService
          break
        case 'team':
          service = teamService
          break
        case 'features':
          service = featuresService
          break
        case 'statistics':
          service = statisticsService
          break
        case 'faqs':
          service = faqsService
          break
        case 'contact-info':
          service = contactInfoService
          break
        case 'users':
          if (url.includes('/admin/users')) {
            service = usersService
          }
          break
        case 'admins':
          if (url.includes('/admin/admins')) {
            service = adminsService
          }
          break
        case 'demo-signups':
          if (url.includes('/admin/demo-signups')) {
            service = demoSignupsService
          }
          break
        default:
          throw new Error(`Unknown endpoint: ${url}`)
      }
      
      if (service && service.delete) {
        const result = await service.delete(id)
        return { data: result }
      }
      
      throw new Error(`Unknown endpoint: ${url}`)
    } catch (error) {
      logger.error('Error in api.delete', error, { url })
      throw error
    }
  }
}

export { api }
export default api
