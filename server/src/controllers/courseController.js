import Course from '../models/Course.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    level,
    search,
    sort = 'position',
    order = 'asc',
    featured,
  } = req.query

  // Build query
  let query = { isPublished: true }

  if (level) {
    query.level = level
  }

  if (featured === 'true') {
    query.isFeatured = true
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ]
  }

  // Build sort object
  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }

  // Execute query
  const courses = await Course.find(query)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean()

  const total = await Course.countDocuments(query)

  res.json({
    success: true,
    count: courses.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: courses,
  })
})

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    $or: [
      { _id: req.params.id },
      { slug: req.params.id },
    ],
    isPublished: true,
  })

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found',
    })
  }

  res.json({
    success: true,
    data: course,
  })
})

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body)

  res.status(201).json({
    success: true,
    data: course,
  })
})

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found',
    })
  }

  res.json({
    success: true,
    data: course,
  })
})

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found',
    })
  }

  res.json({
    success: true,
    message: 'Course deleted successfully',
  })
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