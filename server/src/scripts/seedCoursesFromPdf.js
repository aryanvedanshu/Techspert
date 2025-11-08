import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/db.js'
import Course from '../models/Course.js'
import { extractCourseData, downloadImage } from './extractPdfData.js'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Teacher data (manually curated from LinkedIn profiles)
const TEACHER_DATA = {
  flutter: {
    name: 'Mohan Naudiyal',
    bio: 'Experienced Flutter Developer and Mobile App Development Expert. Passionate about creating beautiful and performant mobile applications.',
    linkedin: 'https://www.linkedin.com/in/mohan-naudiyal-151637256/',
    imageUrl: '', // Will be downloaded
  },
  mern: {
    name: 'Mayank Aggarwal',
    bio: 'Full Stack Developer specializing in MERN Stack. Expert in building scalable web applications with React, Node.js, and MongoDB.',
    linkedin: 'https://www.linkedin.com/in/mayank-aggarwal-59427630b/',
    imageUrl: '', // Will be downloaded
  },
  ai: {
    name: 'Aryan Goel',
    bio: 'AI/ML Engineer and Data Scientist. Specialized in Machine Learning, Deep Learning, and Artificial Intelligence applications.',
    linkedin: 'https://www.linkedin.com/in/aryan-goel/',
    imageUrl: '', // Will be downloaded
  },
  ml: {
    name: 'Aryan Goel',
    bio: 'AI/ML Engineer and Data Scientist. Specialized in Machine Learning, Deep Learning, and Artificial Intelligence applications.',
    linkedin: 'https://www.linkedin.com/in/aryan-goel/',
    imageUrl: '', // Will be downloaded
  },
}

// Course data structure (to be populated from PDF)
const COURSE_TEMPLATES = {
  flutter: {
    title: 'Flutter App Development',
    slug: 'flutter-app-development',
    shortDescription: 'Master Flutter and build beautiful, cross-platform mobile applications for iOS and Android.',
    description: 'Learn Flutter from scratch and build professional mobile applications. This comprehensive course covers everything from basic widgets to advanced state management, API integration, and app deployment.',
    level: 'intermediate',
    tags: ['Flutter', 'Dart', 'Mobile Development', 'iOS', 'Android', 'Cross-Platform'],
    whatYouWillLearn: [
      'Build beautiful, responsive mobile apps with Flutter',
      'Master Dart programming language',
      'Implement state management solutions',
      'Integrate APIs and handle data',
      'Deploy apps to Google Play and App Store',
      'Use Firebase for backend services',
    ],
    requirements: [
      'Basic programming knowledge',
      'Understanding of object-oriented programming',
      'Computer with Flutter SDK installed',
    ],
    price: 4999,
    originalPrice: 7999,
    duration: '12 weeks',
    syllabus: [
      {
        title: 'Introduction to Flutter',
        description: 'Get started with Flutter and understand the framework architecture',
        duration: '2 hours',
        lessons: 5,
        order: 1,
      },
      {
        title: 'Dart Programming Basics',
        description: 'Learn Dart language fundamentals and syntax',
        duration: '4 hours',
        lessons: 8,
        order: 2,
      },
      {
        title: 'Flutter Widgets and UI',
        description: 'Build beautiful user interfaces with Flutter widgets',
        duration: '6 hours',
        lessons: 12,
        order: 3,
      },
      {
        title: 'State Management',
        description: 'Implement state management patterns in Flutter',
        duration: '5 hours',
        lessons: 10,
        order: 4,
      },
      {
        title: 'API Integration',
        description: 'Connect your app to REST APIs and handle data',
        duration: '4 hours',
        lessons: 8,
        order: 5,
      },
      {
        title: 'Firebase Integration',
        description: 'Integrate Firebase for authentication and database',
        duration: '5 hours',
        lessons: 10,
        order: 6,
      },
      {
        title: 'App Deployment',
        description: 'Publish your app to Google Play and App Store',
        duration: '3 hours',
        lessons: 6,
        order: 7,
      },
    ],
  },
  mern: {
    title: 'MERN Stack Development',
    slug: 'mern-stack-development',
    shortDescription: 'Master the complete MERN stack and build full-stack web applications from scratch.',
    description: 'Learn MongoDB, Express.js, React, and Node.js to build modern, scalable web applications. This course covers everything from setting up your development environment to deploying production-ready applications.',
    level: 'intermediate',
    tags: ['MERN', 'React', 'Node.js', 'MongoDB', 'Express', 'Full Stack', 'JavaScript'],
    whatYouWillLearn: [
      'Build full-stack web applications with MERN',
      'Master React for frontend development',
      'Create RESTful APIs with Express and Node.js',
      'Work with MongoDB database',
      'Implement authentication and authorization',
      'Deploy applications to production',
    ],
    requirements: [
      'Basic knowledge of JavaScript',
      'Understanding of HTML and CSS',
      'Familiarity with web development concepts',
    ],
    price: 5999,
    originalPrice: 8999,
    duration: '16 weeks',
    syllabus: [
      {
        title: 'Introduction to MERN Stack',
        description: 'Overview of MERN stack and development environment setup',
        duration: '2 hours',
        lessons: 4,
        order: 1,
      },
      {
        title: 'Node.js and Express',
        description: 'Build backend APIs with Node.js and Express framework',
        duration: '8 hours',
        lessons: 16,
        order: 2,
      },
      {
        title: 'MongoDB Database',
        description: 'Learn MongoDB and Mongoose for data management',
        duration: '6 hours',
        lessons: 12,
        order: 3,
      },
      {
        title: 'React Fundamentals',
        description: 'Master React components, hooks, and state management',
        duration: '10 hours',
        lessons: 20,
        order: 4,
      },
      {
        title: 'Authentication & Security',
        description: 'Implement JWT authentication and secure your application',
        duration: '5 hours',
        lessons: 10,
        order: 5,
      },
      {
        title: 'Advanced React',
        description: 'Learn advanced React patterns and optimization',
        duration: '6 hours',
        lessons: 12,
        order: 6,
      },
      {
        title: 'Deployment',
        description: 'Deploy your MERN application to production',
        duration: '4 hours',
        lessons: 8,
        order: 7,
      },
    ],
  },
  ai: {
    title: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    shortDescription: 'Learn AI fundamentals and build intelligent systems using modern AI techniques.',
    description: 'Comprehensive course on Artificial Intelligence covering machine learning, deep learning, neural networks, and AI applications. Build real-world AI projects and understand the future of intelligent systems.',
    level: 'advanced',
    tags: ['AI', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'Python', 'TensorFlow'],
    whatYouWillLearn: [
      'Understand AI and machine learning fundamentals',
      'Build neural networks and deep learning models',
      'Work with popular AI frameworks like TensorFlow',
      'Implement computer vision and NLP applications',
      'Deploy AI models to production',
      'Understand ethical AI and responsible development',
    ],
    requirements: [
      'Strong programming skills in Python',
      'Understanding of mathematics (linear algebra, calculus)',
      'Basic knowledge of data structures and algorithms',
    ],
    price: 6999,
    originalPrice: 9999,
    duration: '20 weeks',
    syllabus: [
      {
        title: 'Introduction to AI',
        description: 'Overview of artificial intelligence and its applications',
        duration: '3 hours',
        lessons: 6,
        order: 1,
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Learn supervised, unsupervised, and reinforcement learning',
        duration: '10 hours',
        lessons: 20,
        order: 2,
      },
      {
        title: 'Deep Learning',
        description: 'Build and train deep neural networks',
        duration: '12 hours',
        lessons: 24,
        order: 3,
      },
      {
        title: 'Computer Vision',
        description: 'Implement image recognition and processing',
        duration: '8 hours',
        lessons: 16,
        order: 4,
      },
      {
        title: 'Natural Language Processing',
        description: 'Work with text data and build NLP applications',
        duration: '8 hours',
        lessons: 16,
        order: 5,
      },
      {
        title: 'AI Model Deployment',
        description: 'Deploy AI models to production environments',
        duration: '6 hours',
        lessons: 12,
        order: 6,
      },
    ],
  },
  ml: {
    title: 'Machine Learning',
    slug: 'machine-learning',
    shortDescription: 'Master machine learning algorithms and build predictive models from scratch.',
    description: 'Comprehensive machine learning course covering algorithms, model training, evaluation, and deployment. Learn to build and deploy machine learning models for real-world applications.',
    level: 'advanced',
    tags: ['Machine Learning', 'Data Science', 'Python', 'Scikit-learn', 'Pandas', 'NumPy'],
    whatYouWillLearn: [
      'Master machine learning algorithms',
      'Build and train predictive models',
      'Work with data preprocessing and feature engineering',
      'Evaluate and optimize model performance',
      'Deploy ML models to production',
      'Understand model interpretability and ethics',
    ],
    requirements: [
      'Strong Python programming skills',
      'Understanding of statistics and probability',
      'Basic knowledge of linear algebra',
    ],
    price: 6499,
    originalPrice: 9499,
    duration: '18 weeks',
    syllabus: [
      {
        title: 'Introduction to Machine Learning',
        description: 'Overview of ML concepts and applications',
        duration: '3 hours',
        lessons: 6,
        order: 1,
      },
      {
        title: 'Data Preprocessing',
        description: 'Clean, transform, and prepare data for ML',
        duration: '6 hours',
        lessons: 12,
        order: 2,
      },
      {
        title: 'Supervised Learning',
        description: 'Learn regression and classification algorithms',
        duration: '12 hours',
        lessons: 24,
        order: 3,
      },
      {
        title: 'Unsupervised Learning',
        description: 'Clustering and dimensionality reduction',
        duration: '8 hours',
        lessons: 16,
        order: 4,
      },
      {
        title: 'Model Evaluation',
        description: 'Evaluate and optimize ML models',
        duration: '6 hours',
        lessons: 12,
        order: 5,
      },
      {
        title: 'Advanced Topics',
        description: 'Ensemble methods, feature selection, and more',
        duration: '8 hours',
        lessons: 16,
        order: 6,
      },
    ],
  },
}

// Function to get teacher data for a course
function getTeacherForCourse(courseKey) {
  return TEACHER_DATA[courseKey] || TEACHER_DATA.flutter
}

// Function to create or update course
async function createOrUpdateCourse(courseData, teacherData) {
  try {
    // Check if course exists
    const existingCourse = await Course.findOne({ slug: courseData.slug })
    
    const coursePayload = {
      ...courseData,
      instructor: {
        name: teacherData.name,
        bio: teacherData.bio,
        imageUrl: teacherData.imageUrl,
        socialLinks: {
          linkedin: teacherData.linkedin,
        },
      },
      thumbnailUrl: courseData.thumbnailUrl || '/images/course-placeholder.png',
      isPublished: true,
      isFeatured: true,
    }
    
    if (existingCourse) {
      // Update existing course
      Object.assign(existingCourse, coursePayload)
      await existingCourse.save()
      console.log(`[TS-LOG] Updated course: ${courseData.title}`)
      return { action: 'updated', course: existingCourse }
    } else {
      // Create new course
      const newCourse = await Course.create(coursePayload)
      console.log(`[TS-LOG] Created course: ${courseData.title}`)
      return { action: 'created', course: newCourse }
    }
  } catch (error) {
    console.error(`[TS-LOG][ERROR] Error creating/updating course ${courseData.title}:`, error)
    throw error
  }
}

// Main seeding function
async function seedCoursesFromPdf() {
  try {
    console.log('[TS-LOG] Starting course seeding from PDF...')
    
    // Connect to database
    await connectDB()
    console.log('[TS-LOG] Database connected')
    
    // Extract data from PDF (if PDF exists and has data)
    let pdfCourses = []
    try {
      pdfCourses = await extractCourseData()
      console.log(`[TS-LOG] Extracted ${pdfCourses.length} courses from PDF`)
    } catch (error) {
      console.log('[TS-LOG] PDF extraction failed or no PDF data found, using templates')
    }
    
    // Use template courses or merge with PDF data
    const coursesToSeed = Object.keys(COURSE_TEMPLATES).map(key => {
      const template = COURSE_TEMPLATES[key]
      const pdfCourse = pdfCourses.find(c => 
        c.title?.toLowerCase().includes(key) || 
        key.includes(c.title?.toLowerCase())
      )
      
      // Merge PDF data with template if available
      return pdfCourse ? { ...template, ...pdfCourse } : template
    })
    
    console.log(`[TS-LOG] Seeding ${coursesToSeed.length} courses...`)
    
    const results = []
    const imagesDir = path.join(__dirname, '../../../server/client/public/images')
    await fs.ensureDir(imagesDir)
    
    // Process each course
    for (const courseData of coursesToSeed) {
      const courseKey = Object.keys(COURSE_TEMPLATES).find(key => 
        COURSE_TEMPLATES[key].slug === courseData.slug
      )
      
      const teacherData = getTeacherForCourse(courseKey)
      
      // Download instructor image if URL is provided
      if (teacherData.imageUrl && teacherData.imageUrl.startsWith('http')) {
        try {
          const imageName = `${courseKey}-instructor.jpg`
          const imagePath = path.join(imagesDir, imageName)
          const savedPath = await downloadImage(teacherData.imageUrl, imagePath)
          teacherData.imageUrl = savedPath
        } catch (error) {
          console.log(`[TS-LOG] Could not download instructor image, using placeholder`)
          teacherData.imageUrl = '/images/instructor-placeholder.png'
        }
      } else {
        teacherData.imageUrl = '/images/instructor-placeholder.png'
      }
      
      // Download course thumbnail if URL is provided
      if (courseData.thumbnailUrl && courseData.thumbnailUrl.startsWith('http')) {
        try {
          const imageName = `${courseKey}-thumbnail.jpg`
          const imagePath = path.join(imagesDir, imageName)
          const savedPath = await downloadImage(courseData.thumbnailUrl, imagePath)
          courseData.thumbnailUrl = savedPath
        } catch (error) {
          console.log(`[TS-LOG] Could not download thumbnail, using placeholder`)
          courseData.thumbnailUrl = '/images/course-placeholder.png'
        }
      } else {
        courseData.thumbnailUrl = '/images/course-placeholder.png'
      }
      
      // Create or update course
      const result = await createOrUpdateCourse(courseData, teacherData)
      results.push(result)
    }
    
    console.log('[TS-LOG] Course seeding completed!')
    console.log(`[TS-LOG] Created: ${results.filter(r => r.action === 'created').length}`)
    console.log(`[TS-LOG] Updated: ${results.filter(r => r.action === 'updated').length}`)
    
    return results
  } catch (error) {
    console.error('[TS-LOG][ERROR] Error seeding courses:', error)
    throw error
  } finally {
    await mongoose.connection.close()
    console.log('[TS-LOG] Database connection closed')
  }
}

// Run if called directly
if (import.meta.url === `file://${path.resolve(process.argv[1])}` || process.argv[1]?.includes('seedCoursesFromPdf.js')) {
  seedCoursesFromPdf()
    .then(() => {
      console.log('[TS-LOG] Seeding complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[TS-LOG][ERROR] Seeding failed:', error)
      process.exit(1)
    })
}

export default seedCoursesFromPdf

