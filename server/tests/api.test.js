import request from 'supertest'
import app from '../src/index.js'
import Course from '../src/models/Course.js'
import Project from '../src/models/Project.js'
import Alumni from '../src/models/Alumni.js'
import Admin from '../src/models/Admin.js'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Set test environment before importing app
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens'
process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/techspert_test'

describe('API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/techspert_test')
    }
  })

  afterAll(async () => {
    // Clean up and close connection
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.db.dropDatabase()
        await mongoose.connection.close()
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
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
    let adminToken
    let testAdmin

    beforeEach(async () => {
      // Create test admin - password will be hashed by pre-save hook
      testAdmin = await Admin.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123', // Plain password - will be hashed by pre-save hook
        role: 'admin',
        isActive: true,
      })

      // Generate token for authenticated requests
      adminToken = jwt.sign(
        { id: testAdmin._id, type: 'admin' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      )
    })

    it('should login admin with valid credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.tokens).toBeDefined()
      expect(response.body.data.user.email).toBe('admin@test.com')
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

    describe('Admin Courses Endpoints', () => {
      it('should get all courses for admin (including unpublished)', async () => {
        // Create published and unpublished courses
        await Course.create({
          title: 'Published Course',
          slug: 'published-course',
          description: 'Test description',
          shortDescription: 'Short desc',
          price: 99,
          duration: '4 weeks',
          level: 'beginner',
          thumbnailUrl: 'https://example.com/image.jpg',
          instructor: { name: 'Test Instructor' },
          whatYouWillLearn: ['Learn React'],
          requirements: ['Basic JavaScript'],
          isPublished: true,
        })

        await Course.create({
          title: 'Unpublished Course',
          slug: 'unpublished-course',
          description: 'Test description',
          shortDescription: 'Short desc',
          price: 99,
          duration: '4 weeks',
          level: 'beginner',
          thumbnailUrl: 'https://example.com/image.jpg',
          instructor: { name: 'Test Instructor' },
          whatYouWillLearn: ['Learn React'],
          requirements: ['Basic JavaScript'],
          isPublished: false,
        })

        const response = await request(app)
          .get('/api/admin/courses')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.length).toBe(2) // Should see both published and unpublished
      })

      it('should create course via admin endpoint', async () => {
        const courseData = {
          title: 'New Course',
          slug: 'new-course',
          description: 'Course description',
          shortDescription: 'Short description',
          price: 149,
          duration: '6 weeks',
          level: 'intermediate',
          thumbnailUrl: 'https://example.com/image.jpg',
          instructor: { name: 'Test Instructor' },
          whatYouWillLearn: ['Learn React', 'Learn Node.js'],
          requirements: ['Basic JavaScript'],
        }

        const response = await request(app)
          .post('/api/admin/courses')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(courseData)
          .expect(201)

        expect(response.body.success).toBe(true)
        expect(response.body.data.title).toBe('New Course')
      })

      it('should update course via admin endpoint', async () => {
        const course = await Course.create({
          title: 'Original Title',
          slug: 'original-course',
          description: 'Test description',
          shortDescription: 'Short desc',
          price: 99,
          duration: '4 weeks',
          level: 'beginner',
          thumbnailUrl: 'https://example.com/image.jpg',
          instructor: { name: 'Test Instructor' },
          whatYouWillLearn: ['Learn React'],
          requirements: ['Basic JavaScript'],
        })

        const response = await request(app)
          .put(`/api/admin/courses/${course._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ title: 'Updated Title' })
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.title).toBe('Updated Title')
      })

      it('should delete course via admin endpoint', async () => {
        const course = await Course.create({
          title: 'Course to Delete',
          slug: 'delete-course',
          description: 'Test description',
          shortDescription: 'Short desc',
          price: 99,
          duration: '4 weeks',
          level: 'beginner',
          thumbnailUrl: 'https://example.com/image.jpg',
          instructor: { name: 'Test Instructor' },
          whatYouWillLearn: ['Learn React'],
          requirements: ['Basic JavaScript'],
        })

        const response = await request(app)
          .delete(`/api/admin/courses/${course._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)

        // Verify course is deleted
        const deletedCourse = await Course.findById(course._id)
        expect(deletedCourse).toBeNull()
      })
    })

    describe('Admin Projects Endpoints', () => {
      it('should get all projects for admin (including unapproved)', async () => {
        // Create approved and unapproved projects
        await Project.create({
          title: 'Approved Project',
          description: 'Test description',
          shortDescription: 'Short desc',
          imageUrl: 'https://example.com/image.jpg',
          technologies: ['React'],
          course: 'Test Course',
          studentName: 'Test Student',
          studentEmail: 'student@test.com',
          completionDate: new Date(),
          features: ['Feature 1'],
          challenges: ['Challenge 1'],
          lessonsLearned: ['Lesson 1'],
          isApproved: true,
        })

        await Project.create({
          title: 'Unapproved Project',
          description: 'Test description',
          shortDescription: 'Short desc',
          imageUrl: 'https://example.com/image.jpg',
          technologies: ['Node.js'],
          course: 'Test Course',
          studentName: 'Test Student',
          studentEmail: 'student@test.com',
          completionDate: new Date(),
          features: ['Feature 1'],
          challenges: ['Challenge 1'],
          lessonsLearned: ['Lesson 1'],
          isApproved: false,
        })

        const response = await request(app)
          .get('/api/admin/projects')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.length).toBe(2) // Should see both approved and unapproved
      })

      it('should create project via admin endpoint', async () => {
        const projectData = {
          title: 'New Project',
          description: 'Project description',
          shortDescription: 'Short description',
          imageUrl: 'https://example.com/image.jpg',
          technologies: ['React', 'Node.js'],
          course: 'Test Course',
          studentName: 'Test Student',
          studentEmail: 'student@test.com',
          completionDate: new Date(),
          features: ['Feature 1'],
          challenges: ['Challenge 1'],
          lessonsLearned: ['Lesson 1'],
        }

        const response = await request(app)
          .post('/api/admin/projects')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(projectData)
          .expect(201)

        expect(response.body.success).toBe(true)
        expect(response.body.data.title).toBe('New Project')
      })

      it('should update project via admin endpoint', async () => {
        const project = await Project.create({
          title: 'Original Project',
          description: 'Test description',
          shortDescription: 'Short desc',
          imageUrl: 'https://example.com/image.jpg',
          technologies: ['React'],
          course: 'Test Course',
          studentName: 'Test Student',
          studentEmail: 'student@test.com',
          completionDate: new Date(),
          features: ['Feature 1'],
          challenges: ['Challenge 1'],
          lessonsLearned: ['Lesson 1'],
        })

        const response = await request(app)
          .put(`/api/admin/projects/${project._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ title: 'Updated Project', isApproved: true })
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.title).toBe('Updated Project')
        expect(response.body.data.isApproved).toBe(true)
      })

      it('should delete project via admin endpoint', async () => {
        const project = await Project.create({
          title: 'Project to Delete',
          description: 'Test description',
          shortDescription: 'Short desc',
          imageUrl: 'https://example.com/image.jpg',
          technologies: ['React'],
          course: 'Test Course',
          studentName: 'Test Student',
          studentEmail: 'student@test.com',
          completionDate: new Date(),
          features: ['Feature 1'],
          challenges: ['Challenge 1'],
          lessonsLearned: ['Lesson 1'],
        })

        const response = await request(app)
          .delete(`/api/admin/projects/${project._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)

        // Verify project is deleted
        const deletedProject = await Project.findById(project._id)
        expect(deletedProject).toBeNull()
      })
    })

    describe('Admin Alumni Endpoints', () => {
      it('should get all alumni for admin', async () => {
        await Alumni.create({
          name: 'Test Alumni 1',
          title: 'Software Engineer',
          company: 'Test Company',
          location: 'Test City',
          course: 'Test Course',
          graduationDate: new Date(),
          imageUrl: 'https://example.com/image.jpg',
          testimonial: 'Great course!',
          skills: ['JavaScript', 'React'],
          isApproved: true,
        })

        await Alumni.create({
          name: 'Test Alumni 2',
          title: 'Developer',
          company: 'Another Company',
          location: 'Test City',
          course: 'Test Course',
          graduationDate: new Date(),
          imageUrl: 'https://example.com/image.jpg',
          testimonial: 'Amazing experience!',
          skills: ['Node.js', 'MongoDB'],
          isApproved: false,
        })

        const response = await request(app)
          .get('/api/admin/alumni')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.length).toBe(2) // Should see all alumni
      })

      it('should create alumni via admin endpoint', async () => {
        const alumniData = {
          name: 'New Alumni',
          title: 'Senior Developer',
          company: 'Tech Company',
          location: 'San Francisco',
          course: 'Test Course',
          graduationDate: new Date(),
          imageUrl: 'https://example.com/image.jpg',
          testimonial: 'Excellent course!',
          skills: ['JavaScript', 'React', 'Node.js'],
        }

        const response = await request(app)
          .post('/api/admin/alumni')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(alumniData)
          .expect(201)

        expect(response.body.success).toBe(true)
        expect(response.body.data.name).toBe('New Alumni')
      })

      it('should update alumni via admin endpoint', async () => {
        const alumni = await Alumni.create({
          name: 'Original Alumni',
          title: 'Developer',
          company: 'Test Company',
          location: 'Test City',
          course: 'Test Course',
          graduationDate: new Date(),
          imageUrl: 'https://example.com/image.jpg',
          testimonial: 'Great course!',
          skills: ['JavaScript'],
        })

        const response = await request(app)
          .put(`/api/admin/alumni/${alumni._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Updated Alumni', isApproved: true })
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.name).toBe('Updated Alumni')
        expect(response.body.data.isApproved).toBe(true)
      })

      it('should delete alumni via admin endpoint', async () => {
        const alumni = await Alumni.create({
          name: 'Alumni to Delete',
          title: 'Developer',
          company: 'Test Company',
          location: 'Test City',
          course: 'Test Course',
          graduationDate: new Date(),
          imageUrl: 'https://example.com/image.jpg',
          testimonial: 'Great course!',
          skills: ['JavaScript'],
        })

        const response = await request(app)
          .delete(`/api/admin/alumni/${alumni._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)

        // Verify alumni is deleted
        const deletedAlumni = await Alumni.findById(alumni._id)
        expect(deletedAlumni).toBeNull()
      })
    })

    describe('Admin Dashboard', () => {
      it('should get dashboard stats', async () => {
        // Create test data
        await Course.create({
          title: 'Test Course',
          slug: 'test-course',
          description: 'Test',
          shortDescription: 'Test',
          price: 99,
          duration: '4 weeks',
          level: 'beginner',
          thumbnailUrl: 'https://example.com/image.jpg',
          instructor: { name: 'Test Instructor' },
          whatYouWillLearn: ['Learn React'],
          requirements: ['Basic JavaScript'],
          isPublished: true,
        })

        await Project.create({
          title: 'Test Project',
          description: 'Test',
          shortDescription: 'Test',
          imageUrl: 'https://example.com/image.jpg',
          technologies: ['React'],
          course: 'Test Course',
          studentName: 'Test Student',
          studentEmail: 'student@test.com',
          completionDate: new Date(),
          features: ['Feature 1'],
          challenges: ['Challenge 1'],
          lessonsLearned: ['Lesson 1'],
          isApproved: true,
        })

        const response = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toBeDefined()
      })
    })
  })
})
