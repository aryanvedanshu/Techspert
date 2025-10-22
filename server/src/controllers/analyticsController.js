import { asyncHandler } from '../middleware/errorHandler.js'
import Course from '../models/Course.js'
import Project from '../models/Project.js'
import Alumni from '../models/Alumni.js'
import User from '../models/User.js'
import Enrollment from '../models/Enrollment.js'
import Payment from '../models/Payment.js'

// @desc    Get analytics overview
// @route   GET /api/admin/analytics/overview
// @access  Private/Admin
export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  console.log("[DEBUG: analyticsController.js:getAnalyticsOverview:8] Fetching analytics overview")

  try {
    // Get counts from all models
    const [
      totalCourses,
      totalProjects,
      totalAlumni,
      totalUsers,
      totalEnrollments,
      completedEnrollments,
      totalPayments,
      successfulPayments
    ] = await Promise.all([
      Course.countDocuments({ isPublished: true }),
      Project.countDocuments({ isApproved: true }),
      Alumni.countDocuments(),
      User.countDocuments({ isActive: true }),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ completed: true }),
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'succeeded' })
    ])

    // Calculate revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    // Calculate average rating
    const ratingResult = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
    ])
    const averageRating = ratingResult.length > 0 ? ratingResult[0].avgRating : 0

    // Calculate completion rate
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0

    const overview = {
      totalCourses,
      totalProjects,
      totalAlumni,
      totalUsers,
      totalEnrollments,
      completedEnrollments,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10
    }

    console.log("[DEBUG: analyticsController.js:getAnalyticsOverview:success] Analytics overview calculated:", overview)

    res.json({
      success: true,
      data: overview
    })
  } catch (error) {
    console.error("[DEBUG: analyticsController.js:getAnalyticsOverview:error] Error fetching analytics:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    })
  }
})

// @desc    Get course performance analytics
// @route   GET /api/admin/analytics/courses
// @access  Private/Admin
export const getCourseAnalytics = asyncHandler(async (req, res) => {
  console.log("[DEBUG: analyticsController.js:getCourseAnalytics:8] Fetching course analytics")

  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'name email')
      .sort({ studentsCount: -1 })
      .limit(10)

    const courseAnalytics = courses.map(course => ({
      id: course._id,
      title: course.title,
      instructor: course.instructor?.name || 'Unknown',
      enrollments: course.studentsCount || 0,
      revenue: (course.studentsCount || 0) * (course.price || 0),
      rating: course.rating?.average || 0,
      completionRate: course.completionRate || 0,
      createdAt: course.createdAt
    }))

    console.log("[DEBUG: analyticsController.js:getCourseAnalytics:success] Course analytics fetched:", courseAnalytics.length, "courses")

    res.json({
      success: true,
      data: courseAnalytics
    })
  } catch (error) {
    console.error("[DEBUG: analyticsController.js:getCourseAnalytics:error] Error fetching course analytics:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course analytics'
    })
  }
})

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
// @access  Private/Admin
export const getUserAnalytics = asyncHandler(async (req, res) => {
  console.log("[DEBUG: analyticsController.js:getUserAnalytics:8] Fetching user analytics")

  try {
    const { period = '30d' } = req.query
    
    // Calculate date range
    const now = new Date()
    let startDate
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get user statistics
    const [
      totalUsers,
      newUsers,
      activeUsers,
      userRoles
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ lastLoginAt: { $gte: startDate } }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ])

    const userAnalytics = {
      totalUsers,
      newUsers,
      activeUsers,
      userRoles: userRoles.reduce((acc, role) => {
        acc[role._id] = role.count
        return acc
      }, {})
    }

    console.log("[DEBUG: analyticsController.js:getUserAnalytics:success] User analytics fetched")

    res.json({
      success: true,
      data: userAnalytics
    })
  } catch (error) {
    console.error("[DEBUG: analyticsController.js:getUserAnalytics:error] Error fetching user analytics:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    })
  }
})

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  console.log("[DEBUG: analyticsController.js:getRevenueAnalytics:8] Fetching revenue analytics")

  try {
    const { period = '30d' } = req.query
    
    // Calculate date range
    const now = new Date()
    let startDate
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get revenue statistics
    const [
      totalRevenue,
      periodRevenue,
      totalTransactions,
      periodTransactions,
      revenueByCourse
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'succeeded', paymentDate: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.countDocuments({ status: 'succeeded' }),
      Payment.countDocuments({ status: 'succeeded', paymentDate: { $gte: startDate } }),
      Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseData' } },
        { $unwind: '$courseData' },
        { $group: { _id: '$courseData.title', revenue: { $sum: '$amount' }, transactions: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ])
    ])

    const revenueAnalytics = {
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      periodRevenue: periodRevenue.length > 0 ? periodRevenue[0].total : 0,
      totalTransactions,
      periodTransactions,
      revenueByCourse
    }

    console.log("[DEBUG: analyticsController.js:getRevenueAnalytics:success] Revenue analytics fetched")

    res.json({
      success: true,
      data: revenueAnalytics
    })
  } catch (error) {
    console.error("[DEBUG: analyticsController.js:getRevenueAnalytics:error] Error fetching revenue analytics:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics'
    })
  }
})

// @desc    Get project analytics
// @route   GET /api/admin/analytics/projects
// @access  Private/Admin
export const getProjectAnalytics = asyncHandler(async (req, res) => {
  console.log("[DEBUG: analyticsController.js:getProjectAnalytics:8] Fetching project analytics")

  try {
    const [
      totalProjects,
      approvedProjects,
      featuredProjects,
      projectsByCategory,
      projectsByDifficulty,
      averageRating
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ isApproved: true }),
      Project.countDocuments({ isFeatured: true }),
      Project.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ])

    const projectAnalytics = {
      totalProjects,
      approvedProjects,
      featuredProjects,
      projectsByCategory: projectsByCategory.reduce((acc, cat) => {
        acc[cat._id] = cat.count
        return acc
      }, {}),
      projectsByDifficulty: projectsByDifficulty.reduce((acc, diff) => {
        acc[diff._id] = diff.count
        return acc
      }, {}),
      averageRating: averageRating.length > 0 ? averageRating[0].avgRating : 0
    }

    console.log("[DEBUG: analyticsController.js:getProjectAnalytics:success] Project analytics fetched")

    res.json({
      success: true,
      data: projectAnalytics
    })
  } catch (error) {
    console.error("[DEBUG: analyticsController.js:getProjectAnalytics:error] Error fetching project analytics:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project analytics'
    })
  }
})

// @desc    Get recent activity
// @route   GET /api/admin/analytics/activity
// @access  Private/Admin
export const getRecentActivity = asyncHandler(async (req, res) => {
  console.log("[DEBUG: analyticsController.js:getRecentActivity:8] Fetching recent activity")

  try {
    const { limit = 20 } = req.query

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ enrolledAt: -1 })
      .limit(parseInt(limit) / 2)

    // Get recent payments
    const recentPayments = await Payment.find({ status: 'succeeded' })
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ paymentDate: -1 })
      .limit(parseInt(limit) / 2)

    // Combine and format activities
    const activities = [
      ...recentEnrollments.map(enrollment => ({
        id: enrollment._id,
        type: 'enrollment',
        message: `${enrollment.user?.name} enrolled in ${enrollment.course?.title}`,
        time: enrollment.enrolledAt,
        value: 1
      })),
      ...recentPayments.map(payment => ({
        id: payment._id,
        type: 'payment',
        message: `Payment received from ${payment.user?.name} for ${payment.course?.title}`,
        time: payment.paymentDate,
        value: payment.amount
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, parseInt(limit))

    console.log("[DEBUG: analyticsController.js:getRecentActivity:success] Recent activity fetched:", activities.length, "activities")

    res.json({
      success: true,
      data: activities
    })
  } catch (error) {
    console.error("[DEBUG: analyticsController.js:getRecentActivity:error] Error fetching recent activity:", error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    })
  }
})
