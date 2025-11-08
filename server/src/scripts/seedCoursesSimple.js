import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/db.js'
import Course from '../models/Course.js'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Teacher data from LinkedIn profiles
const TEACHER_DATA = {
  flutter: {
    name: 'Mohan Naudiyal',
    bio: 'Experienced Flutter Developer and Mobile App Development Expert. Passionate about creating beautiful and performant mobile applications with Flutter and Dart.',
    linkedin: 'https://www.linkedin.com/in/mohan-naudiyal-151637256/',
  },
  mern: {
    name: 'Mayank Aggarwal',
    bio: 'Full Stack Developer specializing in MERN Stack. Expert in building scalable web applications with React, Node.js, Express, and MongoDB.',
    linkedin: 'https://www.linkedin.com/in/mayank-aggarwal-59427630b/',
  },
  ai: {
    name: 'Aryan Goel',
    bio: 'AI/ML Engineer and Data Scientist. Specialized in Machine Learning, Deep Learning, and Artificial Intelligence applications. Expert in Python, TensorFlow, and modern AI frameworks.',
    linkedin: 'https://www.linkedin.com/in/aryan-goel/',
  },
  ml: {
    name: 'Aryan Goel',
    bio: 'AI/ML Engineer and Data Scientist. Specialized in Machine Learning, Deep Learning, and Artificial Intelligence applications. Expert in Python, TensorFlow, and modern AI frameworks.',
    linkedin: 'https://www.linkedin.com/in/aryan-goel/',
  },
}

// Course data - will be enhanced with PDF data if available
const COURSES = [
  {
    title: 'Flutter App Development',
    slug: 'flutter-app-development',
    shortDescription: 'Master Flutter and build beautiful, cross-platform mobile applications for iOS and Android.',
    description: 'Learn Flutter from scratch and build professional mobile applications. This comprehensive course covers everything from basic widgets to advanced state management, API integration, and app deployment. Perfect for developers who want to create stunning mobile apps that work seamlessly on both iOS and Android platforms.',
    level: 'intermediate',
    tags: ['Flutter', 'Dart', 'Mobile Development', 'iOS', 'Android', 'Cross-Platform'],
    whatYouWillLearn: [
      'Build beautiful, responsive mobile apps with Flutter',
      'Master Dart programming language fundamentals',
      'Implement state management solutions (Provider, Bloc)',
      'Integrate REST APIs and handle data efficiently',
      'Deploy apps to Google Play Store and Apple App Store',
      'Use Firebase for backend services and authentication',
      'Create custom widgets and animations',
      'Handle navigation and routing in Flutter apps',
    ],
    requirements: [
      'Basic programming knowledge',
      'Understanding of object-oriented programming concepts',
      'Computer with Flutter SDK installed (we\'ll guide you)',
      'Enthusiasm to learn mobile development',
    ],
    price: 4999,
    originalPrice: 7999,
    duration: '12 weeks',
    syllabus: [
      {
        title: 'Introduction to Flutter',
        description: 'Get started with Flutter, understand the framework architecture, and set up your development environment',
        duration: '2 hours',
        lessons: 5,
        order: 1,
      },
      {
        title: 'Dart Programming Basics',
        description: 'Learn Dart language fundamentals, syntax, and core programming concepts',
        duration: '4 hours',
        lessons: 8,
        order: 2,
      },
      {
        title: 'Flutter Widgets and UI',
        description: 'Build beautiful user interfaces with Flutter widgets, layouts, and styling',
        duration: '6 hours',
        lessons: 12,
        order: 3,
      },
      {
        title: 'State Management',
        description: 'Implement state management patterns in Flutter using Provider and Bloc',
        duration: '5 hours',
        lessons: 10,
        order: 4,
      },
      {
        title: 'API Integration',
        description: 'Connect your app to REST APIs, handle JSON data, and manage network requests',
        duration: '4 hours',
        lessons: 8,
        order: 5,
      },
      {
        title: 'Firebase Integration',
        description: 'Integrate Firebase for authentication, real-time database, and cloud storage',
        duration: '5 hours',
        lessons: 10,
        order: 6,
      },
      {
        title: 'App Deployment',
        description: 'Publish your app to Google Play Store and Apple App Store with best practices',
        duration: '3 hours',
        lessons: 6,
        order: 7,
      },
    ],
    teacherKey: 'flutter',
  },
  {
    title: 'MERN Stack Development',
    slug: 'mern-stack-development',
    shortDescription: 'Master the complete MERN stack and build full-stack web applications from scratch.',
    description: 'Learn MongoDB, Express.js, React, and Node.js to build modern, scalable web applications. This comprehensive course covers everything from setting up your development environment to deploying production-ready applications. You\'ll build real-world projects and learn industry best practices.',
    level: 'intermediate',
    tags: ['MERN', 'React', 'Node.js', 'MongoDB', 'Express', 'Full Stack', 'JavaScript'],
    whatYouWillLearn: [
      'Build full-stack web applications with MERN stack',
      'Master React for modern frontend development',
      'Create RESTful APIs with Express and Node.js',
      'Work with MongoDB database and Mongoose ODM',
      'Implement JWT authentication and authorization',
      'Deploy applications to production (Heroku, Vercel, AWS)',
      'Use modern JavaScript (ES6+) features',
      'Implement real-time features with Socket.io',
    ],
    requirements: [
      'Basic knowledge of JavaScript',
      'Understanding of HTML and CSS',
      'Familiarity with web development concepts',
      'Basic understanding of databases (helpful but not required)',
    ],
    price: 5999,
    originalPrice: 8999,
    duration: '16 weeks',
    syllabus: [
      {
        title: 'Introduction to MERN Stack',
        description: 'Overview of MERN stack, development environment setup, and project structure',
        duration: '2 hours',
        lessons: 4,
        order: 1,
      },
      {
        title: 'Node.js and Express',
        description: 'Build backend APIs with Node.js and Express framework, middleware, and routing',
        duration: '8 hours',
        lessons: 16,
        order: 2,
      },
      {
        title: 'MongoDB Database',
        description: 'Learn MongoDB, Mongoose ODM, data modeling, and database operations',
        duration: '6 hours',
        lessons: 12,
        order: 3,
      },
      {
        title: 'React Fundamentals',
        description: 'Master React components, hooks, state management, and modern React patterns',
        duration: '10 hours',
        lessons: 20,
        order: 4,
      },
      {
        title: 'Authentication & Security',
        description: 'Implement JWT authentication, password hashing, and secure your application',
        duration: '5 hours',
        lessons: 10,
        order: 5,
      },
      {
        title: 'Advanced React',
        description: 'Learn advanced React patterns, optimization techniques, and performance tuning',
        duration: '6 hours',
        lessons: 12,
        order: 6,
      },
      {
        title: 'Deployment',
        description: 'Deploy your MERN application to production with CI/CD best practices',
        duration: '4 hours',
        lessons: 8,
        order: 7,
      },
    ],
    teacherKey: 'mern',
  },
  {
    title: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    shortDescription: 'Learn AI fundamentals and build intelligent systems using modern AI techniques and frameworks.',
    description: 'Comprehensive course on Artificial Intelligence covering machine learning, deep learning, neural networks, and AI applications. Build real-world AI projects and understand the future of intelligent systems. Learn to implement AI solutions using Python, TensorFlow, and other modern frameworks.',
    level: 'advanced',
    tags: ['AI', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'Python', 'TensorFlow', 'Keras'],
    whatYouWillLearn: [
      'Understand AI and machine learning fundamentals',
      'Build and train neural networks and deep learning models',
      'Work with popular AI frameworks like TensorFlow and Keras',
      'Implement computer vision and image recognition',
      'Build natural language processing (NLP) applications',
      'Deploy AI models to production environments',
      'Understand ethical AI and responsible development practices',
      'Work with large datasets and data preprocessing',
    ],
    requirements: [
      'Strong programming skills in Python',
      'Understanding of mathematics (linear algebra, calculus, statistics)',
      'Basic knowledge of data structures and algorithms',
      'Familiarity with NumPy and Pandas (helpful)',
    ],
    price: 6999,
    originalPrice: 9999,
    duration: '20 weeks',
    syllabus: [
      {
        title: 'Introduction to AI',
        description: 'Overview of artificial intelligence, its history, and current applications',
        duration: '3 hours',
        lessons: 6,
        order: 1,
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Learn supervised, unsupervised, and reinforcement learning algorithms',
        duration: '10 hours',
        lessons: 20,
        order: 2,
      },
      {
        title: 'Deep Learning',
        description: 'Build and train deep neural networks, CNNs, and RNNs',
        duration: '12 hours',
        lessons: 24,
        order: 3,
      },
      {
        title: 'Computer Vision',
        description: 'Implement image recognition, object detection, and image processing',
        duration: '8 hours',
        lessons: 16,
        order: 4,
      },
      {
        title: 'Natural Language Processing',
        description: 'Work with text data, build NLP applications, and sentiment analysis',
        duration: '8 hours',
        lessons: 16,
        order: 5,
      },
      {
        title: 'AI Model Deployment',
        description: 'Deploy AI models to production, optimize performance, and monitor models',
        duration: '6 hours',
        lessons: 12,
        order: 6,
      },
    ],
    teacherKey: 'ai',
  },
  {
    title: 'Machine Learning',
    slug: 'machine-learning',
    shortDescription: 'Master machine learning algorithms and build predictive models from scratch using Python.',
    description: 'Comprehensive machine learning course covering algorithms, model training, evaluation, and deployment. Learn to build and deploy machine learning models for real-world applications. Master supervised and unsupervised learning, feature engineering, and model optimization.',
    level: 'advanced',
    tags: ['Machine Learning', 'Data Science', 'Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Statistics'],
    whatYouWillLearn: [
      'Master machine learning algorithms (regression, classification, clustering)',
      'Build and train predictive models from scratch',
      'Work with data preprocessing and feature engineering',
      'Evaluate and optimize model performance',
      'Deploy ML models to production',
      'Understand model interpretability and explainability',
      'Work with real-world datasets and projects',
      'Learn ensemble methods and advanced techniques',
    ],
    requirements: [
      'Strong Python programming skills',
      'Understanding of statistics and probability',
      'Basic knowledge of linear algebra and calculus',
      'Familiarity with data analysis (helpful)',
    ],
    price: 6499,
    originalPrice: 9499,
    duration: '18 weeks',
    syllabus: [
      {
        title: 'Introduction to Machine Learning',
        description: 'Overview of ML concepts, types of learning, and applications',
        duration: '3 hours',
        lessons: 6,
        order: 1,
      },
      {
        title: 'Data Preprocessing',
        description: 'Clean, transform, and prepare data for machine learning',
        duration: '6 hours',
        lessons: 12,
        order: 2,
      },
      {
        title: 'Supervised Learning',
        description: 'Learn regression and classification algorithms (linear, logistic, SVM, etc.)',
        duration: '12 hours',
        lessons: 24,
        order: 3,
      },
      {
        title: 'Unsupervised Learning',
        description: 'Clustering algorithms, dimensionality reduction, and pattern discovery',
        duration: '8 hours',
        lessons: 16,
        order: 4,
      },
      {
        title: 'Model Evaluation',
        description: 'Evaluate and optimize ML models, cross-validation, and hyperparameter tuning',
        duration: '6 hours',
        lessons: 12,
        order: 5,
      },
      {
        title: 'Advanced Topics',
        description: 'Ensemble methods, feature selection, and advanced ML techniques',
        duration: '8 hours',
        lessons: 16,
        order: 6,
      },
    ],
    teacherKey: 'ml',
  },
]

// Function to download image and save locally
async function downloadImage(url, savePath) {
  try {
    if (!url || !url.startsWith('http')) {
      return null
    }
    
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    })

    await fs.ensureDir(path.dirname(savePath))
    await fs.writeFile(savePath, response.data)
    console.log(`[TS-LOG] Image saved: ${savePath}`)
    return `/images/${path.basename(savePath)}`
  } catch (error) {
    console.error(`[TS-LOG][ERROR] Failed to download image from ${url}:`, error.message)
    return null
  }
}

// Function to create or update course
async function createOrUpdateCourse(courseData, teacherData) {
  try {
    // Check if course exists
    const existingCourse = await Course.findOne({ slug: courseData.slug })
    
    const imagesDir = path.join(__dirname, '../../../server/client/public/images')
    await fs.ensureDir(imagesDir)
    
    // Set default thumbnail if not provided
    let thumbnailUrl = courseData.thumbnailUrl || '/images/course-placeholder.png'
    let instructorImageUrl = '/images/instructor-placeholder.png'
    
    // Download instructor image if URL provided (for future use)
    // For now, we'll use placeholders
    
    const coursePayload = {
      title: courseData.title,
      slug: courseData.slug,
      shortDescription: courseData.shortDescription,
      description: courseData.description,
      level: courseData.level,
      tags: courseData.tags,
      price: courseData.price,
      originalPrice: courseData.originalPrice,
      duration: courseData.duration,
      syllabus: courseData.syllabus,
      whatYouWillLearn: courseData.whatYouWillLearn,
      requirements: courseData.requirements,
      instructor: {
        name: teacherData.name,
        bio: teacherData.bio,
        imageUrl: instructorImageUrl,
        socialLinks: {
          linkedin: teacherData.linkedin,
        },
      },
      thumbnailUrl: thumbnailUrl,
      isPublished: true,
      isFeatured: true,
      position: 0,
      rating: {
        average: 0,
        count: 0,
      },
      studentsCount: 0,
      completionRate: 0,
    }
    
    if (existingCourse) {
      // Update existing course
      Object.assign(existingCourse, coursePayload)
      await existingCourse.save()
      console.log(`[TS-LOG] ✅ Updated course: ${courseData.title}`)
      return { action: 'updated', course: existingCourse }
    } else {
      // Create new course
      const newCourse = await Course.create(coursePayload)
      console.log(`[TS-LOG] ✅ Created course: ${courseData.title}`)
      return { action: 'created', course: newCourse }
    }
  } catch (error) {
    console.error(`[TS-LOG][ERROR] Error creating/updating course ${courseData.title}:`, error.message)
    throw error
  }
}

// Main seeding function
async function seedCourses() {
  try {
    console.log('[TS-LOG] ========================================')
    console.log('[TS-LOG] Starting course seeding...')
    console.log('[TS-LOG] ========================================')
    
    // Connect to database
    await connectDB()
    console.log('[TS-LOG] ✅ Database connected')
    
    const results = []
    
    // Process each course
    for (const courseData of COURSES) {
      const teacherData = TEACHER_DATA[courseData.teacherKey]
      
      if (!teacherData) {
        console.error(`[TS-LOG][ERROR] No teacher data found for course: ${courseData.title}`)
        continue
      }
      
      console.log(`[TS-LOG] Processing course: ${courseData.title}`)
      console.log(`[TS-LOG] Instructor: ${teacherData.name}`)
      
      const result = await createOrUpdateCourse(courseData, teacherData)
      results.push(result)
    }
    
    console.log('[TS-LOG] ========================================')
    console.log('[TS-LOG] Course seeding completed!')
    console.log(`[TS-LOG] Created: ${results.filter(r => r.action === 'created').length}`)
    console.log(`[TS-LOG] Updated: ${results.filter(r => r.action === 'updated').length}`)
    console.log('[TS-LOG] ========================================')
    
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
if (import.meta.url === `file://${path.resolve(process.argv[1])}` || process.argv[1]?.includes('seedCoursesSimple.js')) {
  seedCourses()
    .then(() => {
      console.log('[TS-LOG] ✅ Seeding complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[TS-LOG][ERROR] Seeding failed:', error)
      process.exit(1)
    })
}

export default seedCourses

