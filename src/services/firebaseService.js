import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore'
import { db } from '../config/firebase'
import logger from '../utils/logger'

/**
 * Firebase Service - Handles all Firestore operations
 * Replaces the previous axios-based API calls
 */

// Helper function to convert Firestore timestamp to JavaScript Date
const convertTimestamp = (data) => {
  if (!data || typeof data !== 'object') return data

  const converted = Array.isArray(data) ? [...data] : { ...data }

  for (const key in converted) {
    if (converted[key] && typeof converted[key] === 'object') {
      // Check if it's a Firestore Timestamp
      if (converted[key].toDate && typeof converted[key].toDate === 'function') {
        converted[key] = converted[key].toDate()
      } else if (converted[key].seconds) {
        // Handle timestamp objects
        converted[key] = new Date(converted[key].seconds * 1000)
      } else {
        // Recursively convert nested objects
        converted[key] = convertTimestamp(converted[key])
      }
    }
  }

  return converted
}

// Helper function to prepare data for Firestore (convert Date to Timestamp)
const prepareData = (data) => {
  if (!data || typeof data !== 'object') return data

  const prepared = Array.isArray(data) ? [...data] : { ...data }

  for (const key in prepared) {
    if (prepared[key] instanceof Date) {
      prepared[key] = Timestamp.fromDate(prepared[key])
    } else if (prepared[key] && typeof prepared[key] === 'object' && !Array.isArray(prepared[key])) {
      prepared[key] = prepareData(prepared[key])
    }
  }

  return prepared
}

/**
 * Generic CRUD operations
 */
export const firebaseService = {
  // Get a single document
  async getDocument(collectionName, docId) {
    logger.functionEntry('getDocument', { collection: collectionName, docId })
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() }
        const converted = convertTimestamp(data)
        logger.functionExit('getDocument', { success: true, collection: collectionName, docId })
        return { success: true, data: converted }
      } else {
        logger.warn('Document not found', { collection: collectionName, docId })
        return { success: false, message: 'Document not found' }
      }
    } catch (error) {
      logger.error('Error getting document', error, { collection: collectionName, docId })
      throw error
    }
  },

  // Get all documents from a collection
  async getDocuments(collectionName, filters = [], orderByField = null, orderDirection = 'asc', limitCount = null) {
    logger.functionEntry('getDocuments', { collection: collectionName, filters: filters.length })
    try {
      let q = collection(db, collectionName)

      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value))
      })

      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection))
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount))
      }

      const querySnapshot = await getDocs(q)
      const documents = querySnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() }
        return convertTimestamp(data)
      })

      logger.functionExit('getDocuments', { success: true, count: documents.length })
      return { success: true, data: documents }
    } catch (error) {
      logger.error('Error getting documents', error, { collection: collectionName })
      throw error
    }
  },

  // Create a new document
  async createDocument(collectionName, data) {
    logger.functionEntry('createDocument', { collection: collectionName })
    try {
      const preparedData = {
        ...prepareData(data),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, collectionName), preparedData)
      logger.functionExit('createDocument', { success: true, docId: docRef.id })
      return { success: true, id: docRef.id, data: { id: docRef.id, ...data } }
    } catch (error) {
      logger.error('Error creating document', error, { collection: collectionName })
      throw error
    }
  },

  // Update a document
  async updateDocument(collectionName, docId, data) {
    logger.functionEntry('updateDocument', { collection: collectionName, docId })
    try {
      const docRef = doc(db, collectionName, docId)
      const preparedData = {
        ...prepareData(data),
        updatedAt: serverTimestamp()
      }

      await updateDoc(docRef, preparedData)
      logger.functionExit('updateDocument', { success: true, docId })
      return { success: true, id: docId, data: { id: docId, ...data } }
    } catch (error) {
      logger.error('Error updating document', error, { collection: collectionName, docId })
      throw error
    }
  },

  // Delete a document
  async deleteDocument(collectionName, docId) {
    logger.functionEntry('deleteDocument', { collection: collectionName, docId })
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
      logger.functionExit('deleteDocument', { success: true, docId })
      return { success: true, id: docId }
    } catch (error) {
      logger.error('Error deleting document', error, { collection: collectionName, docId })
      throw error
    }
  },

  // Batch operations
  async batchWrite(operations) {
    logger.functionEntry('batchWrite', { operationCount: operations.length })
    try {
      const batch = writeBatch(db)

      operations.forEach(op => {
        const docRef = doc(db, op.collection, op.id)
        if (op.type === 'create') {
          batch.set(docRef, {
            ...prepareData(op.data),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        } else if (op.type === 'update') {
          batch.update(docRef, {
            ...prepareData(op.data),
            updatedAt: serverTimestamp()
          })
        } else if (op.type === 'delete') {
          batch.delete(docRef)
        }
      })

      await batch.commit()
      logger.functionExit('batchWrite', { success: true })
      return { success: true }
    } catch (error) {
      logger.error('Error in batch write', error)
      throw error
    }
  },

  // Transaction
  async runTransaction(transactionFn) {
    logger.functionEntry('runTransaction')
    try {
      const result = await runTransaction(db, transactionFn)
      logger.functionExit('runTransaction', { success: true })
      return { success: true, data: result }
    } catch (error) {
      logger.error('Error in transaction', error)
      throw error
    }
  }
}

/**
 * Collection-specific services
 */

// Courses
export const coursesService = {
  async getAll(filters = {}) {
    const queryFilters = []
    const hasFilters = filters.isPublished !== undefined || filters.featured !== undefined || filters.level

    if (filters.isPublished !== undefined) {
      queryFilters.push({ field: 'isPublished', operator: '==', value: filters.isPublished })
    }
    if (filters.featured !== undefined) {
      queryFilters.push({ field: 'isFeatured', operator: '==', value: filters.featured })
    }
    if (filters.level) {
      queryFilters.push({ field: 'level', operator: '==', value: filters.level })
    }

    const limitCount = filters.limit ? parseInt(filters.limit) : null

    // Fetch all courses without ordering to avoid index issues
    const allResult = await firebaseService.getDocuments('courses', queryFilters, null, 'asc', null)
    if (!allResult.success || !allResult.data) {
      return { success: false, data: [] }
    }

    // Apply additional filters in memory if needed
    let filtered = allResult.data
    if (filters.isPublished !== undefined && !queryFilters.find(f => f.field === 'isPublished')) {
      filtered = filtered.filter(course => course.isPublished === filters.isPublished)
    }
    if (filters.featured !== undefined && !queryFilters.find(f => f.field === 'isFeatured')) {
      filtered = filtered.filter(course => course.isFeatured === filters.featured)
    }
    if (filters.level && !queryFilters.find(f => f.field === 'level')) {
      filtered = filtered.filter(course => course.level === filters.level)
    }

    // Sort by position in memory (handles missing position field gracefully)
    filtered.sort((a, b) => (a.position || 0) - (b.position || 0))

    // Apply limit
    if (limitCount) {
      filtered = filtered.slice(0, limitCount)
    }

    return { success: true, data: filtered }
  },

  async getById(id) {
    // Try to get by ID first
    const result = await firebaseService.getDocument('courses', id)
    if (result.success) {
      return result
    }

    // If not found by ID, try to find by slug
    try {
      const allCourses = await firebaseService.getDocuments('courses')
      const courseBySlug = allCourses.data?.find(c => c.slug === id || c.id === id)
      if (courseBySlug) {
        return { success: true, data: courseBySlug }
      }
    } catch (error) {
      logger.error('Error finding course by slug', error, { id })
    }

    return { success: false, message: 'Course not found' }
  },

  async create(data) {
    return firebaseService.createDocument('courses', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('courses', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('courses', id)
  }
}

// Projects
export const projectsService = {
  async getAll(filters = {}) {
    const queryFilters = []
    if (filters.isApproved !== undefined) {
      queryFilters.push({ field: 'isApproved', operator: '==', value: filters.isApproved })
    }
    if (filters.featured !== undefined) {
      queryFilters.push({ field: 'isFeatured', operator: '==', value: filters.featured })
    }

    const limitCount = filters.limit ? parseInt(filters.limit) : null
    const result = await firebaseService.getDocuments('projects', queryFilters, 'completionDate', 'desc', limitCount)

    if (limitCount && result.data && result.data.length > limitCount) {
      result.data = result.data.slice(0, limitCount)
    }

    return result
  },

  async getById(id) {
    return firebaseService.getDocument('projects', id)
  },

  async create(data) {
    return firebaseService.createDocument('projects', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('projects', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('projects', id)
  }
}

// Alumni
export const alumniService = {
  async getAll(filters = {}) {
    const queryFilters = []
    if (filters.isApproved !== undefined) {
      queryFilters.push({ field: 'isApproved', operator: '==', value: filters.isApproved })
    }
    if (filters.featured !== undefined) {
      queryFilters.push({ field: 'isFeatured', operator: '==', value: filters.featured })
    }

    const limitCount = filters.limit ? parseInt(filters.limit) : null
    const result = await firebaseService.getDocuments('alumni', queryFilters, 'graduationDate', 'desc', limitCount)

    if (limitCount && result.data && result.data.length > limitCount) {
      result.data = result.data.slice(0, limitCount)
    }

    return result
  },

  async getById(id) {
    return firebaseService.getDocument('alumni', id)
  },

  async create(data) {
    return firebaseService.createDocument('alumni', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('alumni', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('alumni', id)
  }
}

// Trainers
export const trainersService = {
  async getAll(filters = {}) {
    const hasFilters = filters.isActive !== undefined

    // If we have filters AND want to order by name, we need a composite index
    // To avoid index requirement, we'll fetch all, filter in memory, then sort
    if (hasFilters) {
      // Fetch all trainers, filter and sort in memory to avoid composite index requirement
      const allResult = await firebaseService.getDocuments('trainers', [], 'name', 'asc')
      if (!allResult.success || !allResult.data) {
        return allResult
      }

      // Apply filters in memory
      let filtered = allResult.data
      if (filters.isActive !== undefined) {
        filtered = filtered.filter(trainer => trainer.isActive === filters.isActive)
      }

      // Sort by name
      filtered.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase()
        const nameB = (b.name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })

      return { success: true, data: filtered }
    } else {
      // No filters, safe to use orderBy directly
      return firebaseService.getDocuments('trainers', [], 'name', 'asc')
    }
  },

  async getById(id) {
    return firebaseService.getDocument('trainers', id)
  },

  async create(data) {
    return firebaseService.createDocument('trainers', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('trainers', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('trainers', id)
  }
}

// Enrollments
export const enrollmentsService = {
  async getAll(filters = {}) {
    const queryFilters = []
    if (filters.studentId) {
      queryFilters.push({ field: 'student', operator: '==', value: filters.studentId })
    }
    if (filters.courseId) {
      queryFilters.push({ field: 'course', operator: '==', value: filters.courseId })
    }
    if (filters.status) {
      queryFilters.push({ field: 'status', operator: '==', value: filters.status })
    }

    return firebaseService.getDocuments('enrollments', queryFilters, 'enrolledAt', 'desc')
  },

  async getById(id) {
    return firebaseService.getDocument('enrollments', id)
  },

  async create(data) {
    return firebaseService.createDocument('enrollments', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('enrollments', id, data)
  }
}

// Payments
export const paymentsService = {
  async getAll(filters = {}) {
    const queryFilters = []
    if (filters.studentId) {
      queryFilters.push({ field: 'student', operator: '==', value: filters.studentId })
    }
    if (filters.courseId) {
      queryFilters.push({ field: 'course', operator: '==', value: filters.courseId })
    }
    if (filters.status) {
      queryFilters.push({ field: 'status', operator: '==', value: filters.status })
    }

    return firebaseService.getDocuments('payments', queryFilters, 'processedAt', 'desc')
  },

  async getById(id) {
    return firebaseService.getDocument('payments', id)
  },

  async create(data) {
    return firebaseService.createDocument('payments', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('payments', id, data)
  }
}

// Sessions
export const sessionsService = {
  async getAll(filters = {}) {
    const queryFilters = []
    if (filters.courseId) {
      queryFilters.push({ field: 'course', operator: '==', value: filters.courseId })
    }
    if (filters.status) {
      queryFilters.push({ field: 'status', operator: '==', value: filters.status })
    }

    return firebaseService.getDocuments('sessions', queryFilters, 'scheduledAt', 'asc')
  },

  async getById(id) {
    return firebaseService.getDocument('sessions', id)
  },

  async create(data) {
    return firebaseService.createDocument('sessions', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('sessions', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('sessions', id)
  }
}

// CMS Collections Services
export const teamService = {
  async getAll(filters = {}) {
    // Fetch all team members first, then filter and sort in memory to avoid composite index requirements
    let allTeam = await firebaseService.getDocuments('team')

    if (!allTeam.success || !allTeam.data) {
      return { success: false, data: [] }
    }

    let filteredTeam = [...allTeam.data]

    // Apply filters in memory
    if (filters.featured !== undefined) {
      filteredTeam = filteredTeam.filter(member => member.featured === filters.featured)
    }
    if (filters.isActive !== undefined) {
      filteredTeam = filteredTeam.filter(member => member.isActive === filters.isActive)
    }

    // Sort by order in memory
    filteredTeam.sort((a, b) => {
      const orderA = a.order || 0
      const orderB = b.order || 0
      return orderA - orderB
    })

    return {
      success: true,
      data: filteredTeam
    }
  },

  async getById(id) {
    return firebaseService.getDocument('team', id)
  },

  async create(data) {
    return firebaseService.createDocument('team', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('team', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('team', id)
  }
}

export const featuresService = {
  async getAll(filters = {}) {
    // Fetch all features first, then filter and sort in memory to avoid composite index requirements
    let allFeatures = await firebaseService.getDocuments('features')

    if (!allFeatures.success || !allFeatures.data) {
      return { success: false, data: [] }
    }

    let filteredFeatures = [...allFeatures.data]

    // Apply filters in memory
    if (filters.featured !== undefined) {
      filteredFeatures = filteredFeatures.filter(feature => feature.featured === filters.featured)
    }
    if (filters.category) {
      filteredFeatures = filteredFeatures.filter(feature => feature.category === filters.category)
    }

    // Sort by order in memory
    filteredFeatures.sort((a, b) => {
      const orderA = a.order || 0
      const orderB = b.order || 0
      return orderA - orderB
    })

    return {
      success: true,
      data: filteredFeatures
    }
  },

  async getById(id) {
    return firebaseService.getDocument('features', id)
  },

  async create(data) {
    return firebaseService.createDocument('features', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('features', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('features', id)
  }
}

export const statisticsService = {
  async getAll(filters = {}) {
    // Fetch all statistics first, then filter and sort in memory to avoid composite index requirements
    let allStatistics = await firebaseService.getDocuments('statistics')

    if (!allStatistics.success || !allStatistics.data) {
      return { success: false, data: [] }
    }

    let filteredStatistics = [...allStatistics.data]

    // Apply filters in memory
    if (filters.featured !== undefined) {
      filteredStatistics = filteredStatistics.filter(stat => stat.featured === filters.featured)
    }
    if (filters.category) {
      filteredStatistics = filteredStatistics.filter(stat => stat.category === filters.category)
    }

    // Sort by order in memory
    filteredStatistics.sort((a, b) => {
      const orderA = a.order || 0
      const orderB = b.order || 0
      return orderA - orderB
    })

    return {
      success: true,
      data: filteredStatistics
    }
  },

  async getById(id) {
    return firebaseService.getDocument('statistics', id)
  },

  async create(data) {
    return firebaseService.createDocument('statistics', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('statistics', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('statistics', id)
  }
}

export const faqsService = {
  async getAll(filters = {}) {
    // Fetch all FAQs first, then filter and sort in memory to avoid composite index requirements
    let allFaqs = await firebaseService.getDocuments('faqs')

    if (!allFaqs.success || !allFaqs.data) {
      return { success: false, data: [] }
    }

    let filteredFaqs = [...allFaqs.data]

    // Apply filters in memory
    if (filters.featured !== undefined) {
      filteredFaqs = filteredFaqs.filter(faq => faq.featured === filters.featured)
    }

    // Sort by order in memory
    filteredFaqs.sort((a, b) => {
      const orderA = a.order || 0
      const orderB = b.order || 0
      return orderA - orderB
    })

    // Apply limit if specified
    const limitCount = filters.limit ? parseInt(filters.limit) : null
    if (limitCount && filteredFaqs.length > limitCount) {
      filteredFaqs = filteredFaqs.slice(0, limitCount)
    }

    return {
      success: true,
      data: filteredFaqs
    }
  },

  async getById(id) {
    return firebaseService.getDocument('faqs', id)
  },

  async create(data) {
    return firebaseService.createDocument('faqs', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('faqs', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('faqs', id)
  }
}

export const contactInfoService = {
  async get() {
    // Contact info is typically a single document
    const result = await firebaseService.getDocuments('contactInfo')
    return { success: true, data: result.data?.[0] || null }
  },

  async getAll() {
    return firebaseService.getDocuments('contactInfo')
  },

  async getById(id) {
    return firebaseService.getDocument('contactInfo', id)
  },

  async create(data) {
    return firebaseService.createDocument('contactInfo', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('contactInfo', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('contactInfo', id)
  }
}

export const footerService = {
  async get() {
    // Footer is typically a single document
    const result = await firebaseService.getDocuments('footer')
    return { success: true, data: result.data?.[0] || null }
  },

  async update(data) {
    // If footer document exists, update it; otherwise create it
    const existing = await firebaseService.getDocuments('footer')
    if (existing.data && existing.data.length > 0) {
      return firebaseService.updateDocument('footer', existing.data[0].id, data)
    } else {
      return firebaseService.createDocument('footer', data)
    }
  }
}

export const pageContentService = {
  async getByPage(pageName) {
    const queryFilters = [{ field: 'page', operator: '==', value: pageName }]
    const result = await firebaseService.getDocuments('pageContent', queryFilters)
    return { success: true, data: result.data?.[0] || null }
  },

  async getAll() {
    return firebaseService.getDocuments('pageContent')
  },

  async getById(id) {
    return firebaseService.getDocument('pageContent', id)
  },

  async create(data) {
    return firebaseService.createDocument('pageContent', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('pageContent', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('pageContent', id)
  }
}

export const siteSettingsService = {
  async get() {
    // Site settings is typically a single document
    const result = await firebaseService.getDocuments('siteSettings')
    return { success: true, data: result.data?.[0] || null }
  },

  async update(data) {
    // If settings document exists, update it; otherwise create it
    const existing = await firebaseService.getDocuments('siteSettings')
    if (existing.data && existing.data.length > 0) {
      return firebaseService.updateDocument('siteSettings', existing.data[0].id, data)
    } else {
      return firebaseService.createDocument('siteSettings', data)
    }
  }
}

export const certificatesService = {
  async getAll(filters = {}) {
    const queryFilters = []
    if (filters.studentId) {
      queryFilters.push({ field: 'student', operator: '==', value: filters.studentId })
    }
    if (filters.courseId) {
      queryFilters.push({ field: 'course', operator: '==', value: filters.courseId })
    }

    return firebaseService.getDocuments('certificates', queryFilters, 'issuedAt', 'desc')
  },

  async getById(id) {
    return firebaseService.getDocument('certificates', id)
  },

  async create(data) {
    return firebaseService.createDocument('certificates', data)
  }
}

export const demoSignupsService = {
  async getAll(filters = {}) {
    const queryFilters = []
    if (filters.status) {
      queryFilters.push({ field: 'status', operator: '==', value: filters.status })
    }

    return firebaseService.getDocuments('demoSignups', queryFilters, 'createdAt', 'desc')
  },

  async getById(id) {
    return firebaseService.getDocument('demoSignups', id)
  },

  async create(data) {
    return firebaseService.createDocument('demoSignups', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('demoSignups', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('demoSignups', id)
  }
}

export const usersService = {
  async getAll(filters = {}) {
    const queryFilters = []
    if (filters.isActive !== undefined) {
      queryFilters.push({ field: 'isActive', operator: '==', value: filters.isActive })
    }
    if (filters.role) {
      queryFilters.push({ field: 'role', operator: '==', value: filters.role })
    }

    return firebaseService.getDocuments('users', queryFilters, 'createdAt', 'desc')
  },

  async getById(id) {
    return firebaseService.getDocument('users', id)
  },

  async create(data) {
    return firebaseService.createDocument('users', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('users', id, data)
  }
}

export const adminsService = {
  async getAll(filters = {}) {
    const queryFilters = []
    if (filters.isActive !== undefined) {
      queryFilters.push({ field: 'isActive', operator: '==', value: filters.isActive })
    }
    if (filters.role) {
      queryFilters.push({ field: 'role', operator: '==', value: filters.role })
    }

    return firebaseService.getDocuments('admins', queryFilters, 'createdAt', 'desc')
  },

  async getById(id) {
    return firebaseService.getDocument('admins', id)
  },

  async create(data) {
    return firebaseService.createDocument('admins', data)
  },

  async update(id, data) {
    return firebaseService.updateDocument('admins', id, data)
  },

  async delete(id) {
    return firebaseService.deleteDocument('admins', id)
  }
}

// Admin Dashboard Stats
export const dashboardService = {
  async getStats() {
    logger.functionEntry('getDashboardStats')
    try {
      // Get all collections in parallel
      const [courses, projects, alumni, enrollments, payments] = await Promise.all([
        firebaseService.getDocuments('courses'),
        firebaseService.getDocuments('projects'),
        firebaseService.getDocuments('alumni'),
        firebaseService.getDocuments('enrollments'),
        firebaseService.getDocuments('payments')
      ])

      const coursesData = courses.data || []
      const projectsData = projects.data || []
      const alumniData = alumni.data || []
      const enrollmentsData = enrollments.data || []
      const paymentsData = payments.data || []

      // Calculate statistics
      const totalCourses = coursesData.length
      const totalProjects = projectsData.length
      const totalAlumni = alumniData.length
      const totalStudents = new Set(enrollmentsData.map(e => e.student)).size
      const totalRevenue = paymentsData
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + (p.amount || 0), 0)

      const averageRating = coursesData.length > 0
        ? coursesData.reduce((sum, c) => sum + (c.rating?.average || 0), 0) / coursesData.length
        : 0

      const pendingProjects = projectsData.filter(p => !p.isApproved).length
      const activeUsers = new Set(enrollmentsData.map(e => e.student)).size

      const stats = {
        totalCourses,
        totalProjects,
        totalAlumni,
        totalStudents,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        pendingProjects,
        activeUsers
      }

      logger.functionExit('getDashboardStats', { success: true })
      return { success: true, data: stats }
    } catch (error) {
      logger.error('Error getting dashboard stats', error)
      throw error
    }
  }
}

export default firebaseService

