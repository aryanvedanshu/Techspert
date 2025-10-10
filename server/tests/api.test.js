import request from 'supertest'
import app from '../src/index.js'
import Course from '../src/models/Course.js'
import Project from '../src/models/Project.js'
import Alumni from '../src/models/Alumni.js'
import Admin from '../src/models/Admin.js'
import mongoose from 'mongoose'

describe('API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/techspert_test')
  })

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.db.dropDatabase()
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    // Clean up collections before each test
    await Course.deleteMany({})
    await Project.deleteMany({})
    await Alumni.deleteMany({})
    await Admin.deleteMany({})
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body.status).toBe('OK')
      expect(response.body.timestamp).toBeDefined()
    })
  })

  describe('Courses API', () => {
    it('should get all courses', async () => {
      // Create test course
      const course = await Course.create({
        title: 'Test Course',
        slug: 'test-course',
        description: 'Test course description',
        shortDescription: 'Test short description',
        price: 99,
        duration: '4 weeks',
        level: 'beginner',
        tags: ['test'],
        thumbnailUrl: 'https://example.com/image.jpg',
        instructor: { name: 'Test Instructor' },
        whatYouWillLearn: ['Learn something'],
        requirements: ['Basic knowledge'],
        isPublished: true,
      })

      const response = await request(app)
        .get('/api/courses')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Test Course')
    })

    it('should get single course by ID', async () => {
      const course = await Course.create({
        title: 'Test Course',
        slug: 'test-course',
        description: 'Test course description',
        shortDescription: 'Test short description',
        price: 99,
        duration: '4 weeks',
        level: 'beginner',
        tags: ['test'],
        thumbnailUrl: 'https://example.com/image.jpg',
        instructor: { name: 'Test Instructor' },
        whatYouWillLearn: ['Learn something'],
        requirements: ['Basic knowledge'],
        isPublished: true,
      })

      const response = await request(app)
        .get(`/api/courses/${course._id}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe('Test Course')
    })

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/507f1f77bcf86cd799439011')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Course not found')
    })
  })

  describe('Projects API', () => {
    it('should get all projects', async () => {
      const project = await Project.create({
        title: 'Test Project',
        description: 'Test project description',
        shortDescription: 'Test short description',
        imageUrl: 'https://example.com/image.jpg',
        technologies: ['React', 'Node.js'],
        course: 'Test Course',
        studentName: 'Test Student',
        studentEmail: 'test@example.com',
        completionDate: new Date(),
        isApproved: true,
      })

      const response = await request(app)
        .get('/api/projects')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe('Test Project')
    })
  })

  describe('Alumni API', () => {
    it('should get all alumni', async () => {
      const alumni = await Alumni.create({
        name: 'Test Alumni',
        title: 'Software Engineer',
        company: 'Test Company',
        location: 'Test City',
        course: 'Test Course',
        graduationDate: new Date(),
        imageUrl: 'https://example.com/image.jpg',
        testimonial: 'Great course!',
        isApproved: true,
      })

      const response = await request(app)
        .get('/api/alumni')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].name).toBe('Test Alumni')
    })
  })

  describe('Admin API', () => {
    it('should login admin with valid credentials', async () => {
      // Create test admin
      const admin = await Admin.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
      })

      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe('admin@test.com')
    })

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword',
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid credentials')
    })

    it('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/admin/profile')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })
})
