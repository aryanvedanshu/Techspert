import Alumni from '../models/Alumni.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Get all alumni
// @route   GET /api/alumni
// @access  Public
export const getAlumni = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    course,
    company,
    skill,
    search,
    sort = 'graduationDate',
    order = 'desc',
    featured,
  } = req.query

  // Build query
  let query = { isApproved: true }

  if (course) {
    query.course = course
  }

  if (company) {
    query.company = company
  }

  if (skill) {
    query.skills = skill
  }

  if (featured === 'true') {
    query.isFeatured = true
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ]
  }

  // Build sort object
  const sortOrder = order === 'desc' ? -1 : 1
  const sortObj = { [sort]: sortOrder }

  // Execute query
  const alumni = await Alumni.find(query)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean()

  const total = await Alumni.countDocuments(query)

  res.json({
    success: true,
    count: alumni.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: alumni,
  })
})

// @desc    Get single alumni
// @route   GET /api/alumni/:id
// @access  Public
export const getAlumnus = asyncHandler(async (req, res) => {
  const alumnus = await Alumni.findById(req.params.id)

  if (!alumnus || !alumnus.isApproved) {
    return res.status(404).json({
      success: false,
      message: 'Alumni profile not found',
    })
  }

  res.json({
    success: true,
    data: alumnus,
  })
})

// @desc    Create new alumni
// @route   POST /api/alumni
// @access  Private/Admin
export const createAlumni = asyncHandler(async (req, res) => {
  const alumni = await Alumni.create(req.body)

  res.status(201).json({
    success: true,
    data: alumni,
  })
})

// @desc    Update alumni
// @route   PUT /api/alumni/:id
// @access  Private/Admin
export const updateAlumni = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!alumni) {
    return res.status(404).json({
      success: false,
      message: 'Alumni profile not found',
    })
  }

  res.json({
    success: true,
    data: alumni,
  })
})

// @desc    Delete alumni
// @route   DELETE /api/alumni/:id
// @access  Private/Admin
export const deleteAlumni = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findByIdAndDelete(req.params.id)

  if (!alumni) {
    return res.status(404).json({
      success: false,
      message: 'Alumni profile not found',
    })
  }

  res.json({
    success: true,
    message: 'Alumni profile deleted successfully',
  })
})

// @desc    Approve alumni
// @route   PATCH /api/alumni/:id/approve
// @access  Private/Admin
export const approveAlumni = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  )

  if (!alumni) {
    return res.status(404).json({
      success: false,
      message: 'Alumni profile not found',
    })
  }

  res.json({
    success: true,
    data: alumni,
  })
})

// @desc    Get alumni statistics
// @route   GET /api/alumni/stats
// @access  Private/Admin
export const getAlumniStats = asyncHandler(async (req, res) => {
  const stats = await Alumni.aggregate([
    {
      $group: {
        _id: null,
        totalAlumni: { $sum: 1 },
        approvedAlumni: {
          $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] },
        },
        featuredAlumni: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] },
        },
        averageSalary: { $avg: '$salary' },
        averageExperience: { $avg: '$yearsOfExperience' },
      },
    },
  ])

  const courseStats = await Alumni.aggregate([
    {
      $group: {
        _id: '$course',
        count: { $sum: 1 },
        averageSalary: { $avg: '$salary' },
        averageExperience: { $avg: '$yearsOfExperience' },
      },
    },
    { $sort: { count: -1 } },
  ])

  const companyStats = await Alumni.aggregate([
    {
      $group: {
        _id: '$company',
        count: { $sum: 1 },
        averageSalary: { $avg: '$salary' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])

  const skillStats = await Alumni.aggregate([
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ])

  const employmentTypeStats = await Alumni.aggregate([
    {
      $group: {
        _id: '$employmentType',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalAlumni: 0,
        approvedAlumni: 0,
        featuredAlumni: 0,
        averageSalary: 0,
        averageExperience: 0,
      },
      byCourse: courseStats,
      byCompany: companyStats,
      bySkill: skillStats,
      byEmploymentType: employmentTypeStats,
    },
  })
})

// @desc    Reorder alumni
// @route   PUT /api/alumni/reorder
// @access  Private/Admin
export const reorderAlumni = asyncHandler(async (req, res) => {
  const { alumniIds } = req.body

  if (!Array.isArray(alumniIds)) {
    return res.status(400).json({
      success: false,
      message: 'alumniIds must be an array',
    })
  }

  const updatePromises = alumniIds.map((alumniId, index) =>
    Alumni.findByIdAndUpdate(alumniId, { position: index })
  )

  await Promise.all(updatePromises)

  res.json({
    success: true,
    message: 'Alumni reordered successfully',
  })
})