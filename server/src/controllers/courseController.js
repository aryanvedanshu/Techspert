import Course from '../models/Course.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import logger from '../utils/logger.js'

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('getCourses', { 
    query: req.query,
    hasLevel: !!req.query.level,
    hasSearch: !!req.query.search,
    hasFeatured: req.query.featured === 'true'
  })
  
  try {
    const {
      page = 1,
      limit = 12,
      level,
      search,
      sort = 'position',
      order = 'asc',
      featured,
    } = req.query

    logger.debug('Processing query parameters', { page, limit, level, search, sort, order, featured })

    // Build query
    let query = { isPublished: true }
    logger.debug('Initial query built', { query })

    if (level) {
      query.level = level
      logger.debug('Added level filter', { level })
    }

    if (featured === 'true') {
      query.isFeatured = true
      logger.debug('Added featured filter')
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
      logger.debug('Search query built', { searchTerm: search, queryPattern: query.$or })
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1
    const sortObj = { [sort]: sortOrder }
    logger.debug('Sort object built', { sort, order, sortObj })

    // Execute query
    logger.dbOperation('find', 'Course', query)
    const courses = await Course.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    logger.dbOperation('countDocuments', 'Course', query)
    const total = await Course.countDocuments(query)

    const duration = Date.now() - startTime
    logger.success('Courses fetched successfully', { 
      count: courses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      duration: `${duration}ms`
    })
    logger.functionExit('getCourses', { 
      success: true,
      count: courses.length,
      total,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      count: courses.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: courses,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch courses', error, {
      query: req.query,
      operation: 'getCourses',
      model: 'Course',
      duration: `${duration}ms`
    })
    logger.functionExit('getCourses', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('getCourse', { 
    courseId: id,
    idLength: id?.length,
    isObjectIdFormat: /^[0-9a-fA-F]{24}$/.test(id)
  })
  
  try {
    // Check if id is a valid ObjectId format
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)
    logger.debug('Determining search method', { isObjectId, searchBy: isObjectId ? '_id' : 'slug' })
    
    let course
    if (isObjectId) {
      // Search by _id if it's a valid ObjectId
      logger.dbOperation('findOne', 'Course', { _id: id, isPublished: true })
      course = await Course.findOne({
        _id: id,
        isPublished: true,
      })
    } else {
      // Search by slug if it's not an ObjectId
      logger.dbOperation('findOne', 'Course', { slug: id, isPublished: true })
      course = await Course.findOne({
        slug: id,
        isPublished: true,
      })
    }

    if (!course) {
      const duration = Date.now() - startTime
      logger.warn('Course not found', { 
        courseId: id,
        searchMethod: isObjectId ? '_id' : 'slug',
        duration: `${duration}ms`
      })
      logger.functionExit('getCourse', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Course fetched successfully', { 
      courseId: course._id,
      title: course.title,
      isPublished: course.isPublished,
      duration: `${duration}ms`
    })
    logger.functionExit('getCourse', { 
      success: true,
      courseId: course._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: course,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to fetch course', error, {
      courseId: id,
      operation: 'getCourse',
      model: 'Course',
      duration: `${duration}ms`
    })
    logger.functionExit('getCourse', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  logger.functionEntry('createCourse', { 
    bodyKeys: Object.keys(req.body),
    hasInstructor: !!req.body.instructor,
    hasWhatYouWillLearn: !!req.body.whatYouWillLearn,
    hasRequirements: !!req.body.requirements,
    hasTitle: !!req.body.title,
    hasSlug: !!req.body.slug
  })
  
  logger.debug('Creating course with data', {
    title: req.body.title,
    slug: req.body.slug,
    instructor: req.body.instructor,
    whatYouWillLearn: req.body.whatYouWillLearn,
    requirements: req.body.requirements,
    hasDescription: !!req.body.description,
    hasShortDescription: !!req.body.shortDescription,
    hasThumbnailUrl: !!req.body.thumbnailUrl,
    hasPrice: req.body.price !== undefined,
    hasDuration: !!req.body.duration,
    hasLevel: !!req.body.level,
    price: req.body.price
  })
  
  try {
    // Validate required fields before database operation
    const requiredFields = ['title', 'slug', 'description', 'shortDescription', 'price', 'duration', 'level', 'thumbnailUrl']
    const missingFields = requiredFields.filter(field => !req.body[field])
    
    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`)
      error.name = 'ValidationError'
      logger.error('Validation failed: missing required fields', error, {
        body: req.body,
        operation: 'createCourse',
        model: 'Course',
        missingFields,
        requiredFields
      })
      throw error
    }

    // Validate instructor structure
    if (req.body.instructor && typeof req.body.instructor === 'object' && !req.body.instructor.name) {
      const error = new Error('Instructor object must have a name property')
      error.name = 'ValidationError'
      logger.error('Validation failed: invalid instructor structure', error, {
        instructor: req.body.instructor,
        operation: 'createCourse',
        model: 'Course'
      })
      throw error
    }

    logger.dbOperation('create', 'Course', { 
      title: req.body.title,
      slug: req.body.slug,
      hasInstructor: !!req.body.instructor,
      hasWhatYouWillLearn: Array.isArray(req.body.whatYouWillLearn) && req.body.whatYouWillLearn.length > 0,
      hasRequirements: Array.isArray(req.body.requirements) && req.body.requirements.length > 0
    })
    const course = await Course.create(req.body)
    
    const duration = Date.now() - startTime
    logger.success('Course created successfully', { 
      courseId: course._id, 
      title: course.title,
      slug: course.slug,
      instructor: course.instructor,
      duration: `${duration}ms`
    })
    logger.functionExit('createCourse', { 
      success: true, 
      courseId: course._id,
      duration: `${duration}ms`
    })
    
    res.status(201).json({
      success: true,
      data: course,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to create course', error, {
      body: req.body,
      operation: 'createCourse',
      model: 'Course',
      errorName: error.name,
      errorMessage: error.message,
      validationErrors: error.errors,
      duration: `${duration}ms`
    })
    logger.functionExit('createCourse', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('updateCourse', { 
    courseId: id,
    bodyKeys: Object.keys(req.body),
    updateFields: Object.keys(req.body)
  })
  
  try {
    logger.debug('Updating course', {
      courseId: id,
      fieldsToUpdate: Object.keys(req.body),
      hasInstructor: !!req.body.instructor,
      hasWhatYouWillLearn: !!req.body.whatYouWillLearn
    })

    logger.dbOperation('findByIdAndUpdate', 'Course', { id, updateFields: Object.keys(req.body) })
    const course = await Course.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!course) {
      const duration = Date.now() - startTime
      logger.warn('Course not found for update', { 
        courseId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('updateCourse', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Course updated successfully', { 
      courseId: course._id,
      title: course.title,
      updatedFields: Object.keys(req.body),
      duration: `${duration}ms`
    })
    logger.functionExit('updateCourse', { 
      success: true,
      courseId: course._id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      data: course,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to update course', error, {
      courseId: id,
      body: req.body,
      operation: 'updateCourse',
      model: 'Course',
      duration: `${duration}ms`
    })
    logger.functionExit('updateCourse', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = asyncHandler(async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  logger.functionEntry('deleteCourse', { courseId: id })
  
  try {
    logger.debug('Deleting course', { courseId: id })

    logger.dbOperation('findByIdAndDelete', 'Course', id)
    const course = await Course.findByIdAndDelete(id)

    if (!course) {
      const duration = Date.now() - startTime
      logger.warn('Course not found for deletion', { 
        courseId: id,
        duration: `${duration}ms`
      })
      logger.functionExit('deleteCourse', { 
        success: false,
        found: false,
        duration: `${duration}ms`
      })
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      })
    }

    const duration = Date.now() - startTime
    logger.success('Course deleted successfully', { 
      courseId: id,
      title: course.title,
      duration: `${duration}ms`
    })
    logger.functionExit('deleteCourse', { 
      success: true,
      courseId: id,
      duration: `${duration}ms`
    })

    res.json({
      success: true,
      message: 'Course deleted successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Failed to delete course', error, {
      courseId: id,
      operation: 'deleteCourse',
      model: 'Course',
      duration: `${duration}ms`
    })
    logger.functionExit('deleteCourse', { 
      success: false,
      error: error.message,
      duration: `${duration}ms`
    })
    throw error
  }
})

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private/Admin
export const getCourseStats = asyncHandler(async (req, res) => {
  const stats = await Course.aggregate([
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        publishedCourses: {
          $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] },
        },
        featuredCourses: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] },
        },
        totalStudents: { $sum: '$studentsCount' },
        averageRating: { $avg: '$rating.average' },
        totalRevenue: { $sum: { $multiply: ['$price', '$studentsCount'] } },
      },
    },
  ])

  const levelStats = await Course.aggregate([
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' },
      },
    },
  ])

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalCourses: 0,
        publishedCourses: 0,
        featuredCourses: 0,
        totalStudents: 0,
        averageRating: 0,
        totalRevenue: 0,
      },
      byLevel: levelStats,
    },
  })
})

// @desc    Reorder courses
// @route   PUT /api/courses/reorder
// @access  Private/Admin
export const reorderCourses = asyncHandler(async (req, res) => {
  const { courseIds } = req.body

  if (!Array.isArray(courseIds)) {
    return res.status(400).json({
      success: false,
      message: 'courseIds must be an array',
    })
  }

  const updatePromises = courseIds.map((courseId, index) =>
    Course.findByIdAndUpdate(courseId, { position: index })
  )

  await Promise.all(updatePromises)

  res.json({
    success: true,
    message: 'Courses reordered successfully',
  })
})