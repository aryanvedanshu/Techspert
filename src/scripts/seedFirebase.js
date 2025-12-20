/**
 * Firebase Seeding Script
 * Adds comprehensive dummy data to all Firestore collections
 * 
 * Usage: Run this script in the browser console or as a Node.js script
 * Make sure Firebase is initialized before running
 */

import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../config/firebase'

// Helper to create Timestamp
const createTimestamp = (date) => {
  if (date instanceof Date) {
    return Timestamp.fromDate(date)
  }
  return Timestamp.now()
}

// Dummy data generators
const generateCourses = () => [
  {
    title: 'Complete MERN Stack Development',
    slug: 'complete-mern-stack-development',
    description: 'Master the full MERN stack with hands-on projects and real-world applications.',
    shortDescription: 'Learn MongoDB, Express, React, and Node.js from scratch',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    price: 2999,
    originalPrice: 4999,
    duration: '12 weeks',
    level: 'intermediate',
    language: 'English',
    instructor: { name: 'John Doe', email: 'john@techspert.com' },
    rating: { average: 4.8, count: 1250 },
    studentsCount: 2500,
    isPublished: true,
    isFeatured: true,
    position: 1,
    tags: ['MERN', 'Full Stack', 'JavaScript'],
    syllabus: [
      { week: 1, topic: 'Introduction to MERN Stack', duration: '2 hours' },
      { week: 2, topic: 'MongoDB Fundamentals', duration: '3 hours' },
      { week: 3, topic: 'Express.js Backend', duration: '4 hours' }
    ],
    modules: [
      { title: 'Introduction', duration: '30 min', order: 1 },
      { title: 'MongoDB Basics', duration: '45 min', order: 2 },
      { title: 'Express Setup', duration: '1 hour', order: 3 }
    ],
    whatYouWillLearn: [
      'Build full-stack web applications',
      'Implement RESTful APIs',
      'Handle authentication and authorization',
      'Deploy applications to production'
    ],
    requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
    targetAudience: ['Web developers', 'Students', 'Career switchers'],
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date())
  },
  {
    title: 'Artificial Intelligence & Machine Learning',
    slug: 'ai-machine-learning',
    description: 'Comprehensive AI/ML course covering neural networks, deep learning, and practical applications.',
    shortDescription: 'Master AI and ML with hands-on projects',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    price: 3999,
    originalPrice: 5999,
    duration: '16 weeks',
    level: 'advanced',
    language: 'English',
    instructor: { name: 'Jane Smith', email: 'jane@techspert.com' },
    rating: { average: 4.9, count: 890 },
    studentsCount: 1800,
    isPublished: true,
    isFeatured: true,
    position: 2,
    tags: ['AI', 'Machine Learning', 'Python', 'TensorFlow'],
    syllabus: [
      { week: 1, topic: 'Introduction to AI/ML', duration: '2 hours' },
      { week: 2, topic: 'Neural Networks', duration: '4 hours' },
      { week: 3, topic: 'Deep Learning', duration: '5 hours' }
    ],
    modules: [
      { title: 'AI Fundamentals', duration: '1 hour', order: 1 },
      { title: 'Neural Networks', duration: '2 hours', order: 2 },
      { title: 'Deep Learning', duration: '3 hours', order: 3 }
    ],
    whatYouWillLearn: [
      'Build neural networks from scratch',
      'Implement deep learning models',
      'Work with TensorFlow and PyTorch',
      'Deploy ML models to production'
    ],
    requirements: ['Python programming', 'Basic math knowledge'],
    targetAudience: ['Data scientists', 'Developers', 'Researchers'],
    salePrice: 2999,
    saleStartDate: '2025-01-01',
    saleStartTime: '00:00',
    saleEndDate: '2025-12-31',
    saleEndTime: '23:59',
    isVisible: true,
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date())
  },
  {
    title: 'Data Science with Python',
    slug: 'data-science-python',
    description: 'Learn data analysis, visualization, and machine learning with Python.',
    shortDescription: 'Master data science tools and techniques',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    price: 2499,
    originalPrice: 3999,
    duration: '10 weeks',
    level: 'intermediate',
    language: 'English',
    instructor: { name: 'Mike Johnson', email: 'mike@techspert.com' },
    rating: { average: 4.7, count: 650 },
    studentsCount: 1200,
    isPublished: true,
    isFeatured: false,
    position: 3,
    tags: ['Data Science', 'Python', 'Pandas', 'NumPy'],
    syllabus: [
      { week: 1, topic: 'Python for Data Science', duration: '3 hours' },
      { week: 2, topic: 'Data Analysis with Pandas', duration: '4 hours' },
      { week: 3, topic: 'Data Visualization', duration: '3 hours' }
    ],
    modules: [
      { title: 'Python Basics', duration: '1 hour', order: 1 },
      { title: 'Pandas Introduction', duration: '1.5 hours', order: 2 },
      { title: 'Data Visualization', duration: '2 hours', order: 3 }
    ],
    whatYouWillLearn: [
      'Analyze large datasets',
      'Create data visualizations',
      'Build predictive models',
      'Work with real-world data'
    ],
    requirements: ['Basic Python knowledge'],
    targetAudience: ['Data analysts', 'Business analysts', 'Students'],
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date())
  }
]

const generateProjects = () => [
  {
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform built with MERN stack, including payment integration and admin dashboard.',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    images: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
      'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800'
    ],
    course: 'Complete MERN Stack Development',
    studentName: 'Alice Johnson',
    studentEmail: 'alice@example.com',
    studentImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    features: ['User authentication', 'Product catalog', 'Shopping cart', 'Payment processing'],
    challenges: 'Implementing real-time inventory updates',
    learnings: 'Learned about payment gateway integration and state management',
    difficulty: 'intermediate',
    duration: '8 weeks',
    completionDate: '2024-12-15',
    rating: 4.8,
    githubUrl: 'https://github.com/alice/ecommerce-platform',
    liveUrl: 'https://ecommerce-demo.techspert.com',
    videoUrl: 'https://www.youtube.com/watch?v=demo',
    isApproved: true,
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date())
  },
  {
    title: 'AI Image Classifier',
    description: 'Machine learning model that classifies images using convolutional neural networks.',
    imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27137b2c8b8?w=800',
    images: [
      'https://images.unsplash.com/photo-1527477396000-e27137b2c8b8?w=800'
    ],
    course: 'Artificial Intelligence & Machine Learning',
    studentName: 'Bob Williams',
    studentEmail: 'bob@example.com',
    studentImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    technologies: ['Python', 'TensorFlow', 'Keras', 'OpenCV'],
    features: ['Image preprocessing', 'CNN architecture', 'Model training', 'Prediction API'],
    challenges: 'Optimizing model accuracy and training time',
    learnings: 'Deep understanding of neural networks and image processing',
    difficulty: 'advanced',
    duration: '12 weeks',
    completionDate: '2024-11-20',
    rating: 4.9,
    githubUrl: 'https://github.com/bob/ai-image-classifier',
    liveUrl: 'https://ai-classifier.techspert.com',
    isApproved: true,
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date())
  }
]

const generateAlumni = () => [
  {
    name: 'Sarah Chen',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
    currentPosition: 'Senior Full Stack Developer',
    company: 'Google',
    location: 'San Francisco, CA',
    graduationDate: '2023-06-15',
    course: 'Complete MERN Stack Development',
    testimonial: 'Techspert transformed my career. The hands-on projects and expert guidance helped me land my dream job at Google.',
    achievements: ['Promoted to Senior Developer', 'Led team of 5 developers', 'Launched 3 major products'],
    linkedinUrl: 'https://linkedin.com/in/sarah-chen',
    email: 'sarah.chen@example.com',
    isFeatured: true,
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date())
  },
  {
    name: 'David Kumar',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    currentPosition: 'Machine Learning Engineer',
    company: 'Microsoft',
    location: 'Seattle, WA',
    graduationDate: '2023-08-20',
    course: 'Artificial Intelligence & Machine Learning',
    testimonial: 'The AI/ML course gave me the skills I needed to break into the tech industry. Highly recommended!',
    achievements: ['Published 2 research papers', 'Built ML models for production', 'Mentored 10+ students'],
    linkedinUrl: 'https://linkedin.com/in/david-kumar',
    email: 'david.kumar@example.com',
    isFeatured: true,
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date())
  }
]

const generateTrainers = () => [
  {
    name: 'John Doe',
    email: 'john@techspert.com',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: '10+ years of experience in full-stack development. Expert in MERN stack and cloud technologies.',
    specialization: ['MERN Stack', 'Node.js', 'React', 'MongoDB'],
    experience: '10 years',
    rating: 4.9,
    studentsTaught: 2500,
    coursesTaught: 5,
    isActive: true,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
      github: 'https://github.com/johndoe'
    },
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date())
  },
  {
    name: 'Jane Smith',
    email: 'jane@techspert.com',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'AI/ML researcher with 8 years of experience. Published author and industry expert.',
    specialization: ['Machine Learning', 'Deep Learning', 'Neural Networks', 'Python'],
    experience: '8 years',
    rating: 4.8,
    studentsTaught: 1800,
    coursesTaught: 3,
    isActive: true,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/janesmith',
      twitter: 'https://twitter.com/janesmith'
    },
    createdAt: createTimestamp(new Date()),
    updatedAt: createTimestamp(new Date())
  }
]

const generateTeam = () => [
  {
    name: 'Alex Thompson',
    role: 'CEO & Founder',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Visionary leader with 15+ years in tech education',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/alexthompson',
      twitter: 'https://twitter.com/alexthompson'
    },
    order: 1,
    isActive: true
  },
  {
    name: 'Emily Davis',
    role: 'CTO',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Tech expert specializing in scalable platforms',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emilydavis'
    },
    order: 2,
    isActive: true
  }
]

const generateFeatures = () => [
  {
    title: 'Live Online Classes',
    description: 'Interactive live sessions with expert instructors',
    icon: 'Video',
    order: 1,
    isActive: true
  },
  {
    title: 'Hands-On Projects',
    description: 'Build real-world projects to enhance your portfolio',
    icon: 'Code',
    order: 2,
    isActive: true
  },
  {
    title: 'Industry Certificates',
    description: 'Get recognized certificates upon course completion',
    icon: 'Award',
    order: 3,
    isActive: true
  }
]

const generateStatistics = () => [
  { label: 'Students Enrolled', value: '10,000+', icon: 'Users', order: 1 },
  { label: 'Courses Available', value: '50+', icon: 'BookOpen', order: 2 },
  { label: 'Success Rate', value: '95%', icon: 'TrendingUp', order: 3 },
  { label: 'Industry Partners', value: '100+', icon: 'Building', order: 4 }
]

const generateFAQs = () => [
  {
    question: 'What is the course duration?',
    answer: 'Course durations vary from 8 to 16 weeks depending on the complexity and depth of the course.',
    category: 'general',
    order: 1,
    isActive: true
  },
  {
    question: 'Do I get a certificate?',
    answer: 'Yes, you will receive an industry-recognized certificate upon successful completion of the course.',
    category: 'certificates',
    order: 2,
    isActive: true
  },
  {
    question: 'Can I access course materials after completion?',
    answer: 'Yes, you will have lifetime access to all course materials, including recordings and resources.',
    category: 'access',
    order: 3,
    isActive: true
  }
]

const generateContactInfo = () => ({
  email: 'contact@techspert.com',
  supportEmail: 'support@techspert.com',
  phone: '+91-9876543210',
  address: '123 Tech Street, Mumbai, Maharashtra 400001',
  officeHours: 'Monday - Friday: 9 AM - 6 PM IST',
  socialLinks: {
    facebook: 'https://facebook.com/techspert',
    twitter: 'https://twitter.com/techspert',
    linkedin: 'https://linkedin.com/company/techspert',
    instagram: 'https://instagram.com/techspert'
  }
})

const generateSiteSettings = () => ({
  siteName: 'Techspert',
  siteDescription: 'Learn cutting-edge technology skills with industry experts',
  siteTagline: 'Empowering the next generation of tech professionals',
  theme: {
    primary: '#0ea5e9',
    secondary: '#14b8a6',
    accent: '#a855f7',
    background: '#ffffff'
  },
  contact: {
    email: 'contact@techspert.com',
    supportEmail: 'support@techspert.com',
    phone: '+91-9876543210',
    address: '123 Tech Street, Mumbai, Maharashtra 400001'
  },
  homePage: {
    hero: {
      title: 'Master the Future of Technology',
      subtitle: 'Learn cutting-edge skills from industry experts',
      ctaText: 'Start Learning Today'
    },
    stats: {
      title: 'Our Impact',
      subtitle: 'Join thousands of successful graduates'
    },
    features: {
      title: 'Why Choose Techspert?',
      subtitle: 'We provide comprehensive learning experiences'
    }
  },
  features: {
    enableRegistration: true,
    enableComments: true,
    enableRatings: true,
    enableCertificates: true,
    enableNewsletter: true,
    enableBlog: false
  }
})

const generateFooter = () => ({
  copyright: '© 2025 Techspert. All rights reserved.',
  links: {
    quickLinks: [
      { label: 'About Us', url: '/about' },
      { label: 'Courses', url: '/courses' },
      { label: 'Projects', url: '/projects' },
      { label: 'Contact', url: '/contact' }
    ],
    resources: [
      { label: 'Blog', url: '/blog' },
      { label: 'FAQs', url: '/faqs' },
      { label: 'Certificates', url: '/certificates' },
      { label: 'Alumni', url: '/alumni' }
    ],
    legal: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'Refund Policy', url: '/refund' }
    ]
  },
  socialLinks: {
    facebook: 'https://facebook.com/techspert',
    twitter: 'https://twitter.com/techspert',
    linkedin: 'https://linkedin.com/company/techspert',
    instagram: 'https://instagram.com/techspert'
  }
})

// Main seeding function
export const seedFirebase = async () => {
  console.log('🌱 Starting Firebase seeding...')

  try {
    // Seed Courses
    console.log('📚 Seeding courses...')
    const courses = generateCourses()
    for (const course of courses) {
      await addDoc(collection(db, 'courses'), course)
      console.log(`✅ Added course: ${course.title}`)
    }

    // Seed Projects
    console.log('🎨 Seeding projects...')
    const projects = generateProjects()
    for (const project of projects) {
      await addDoc(collection(db, 'projects'), project)
      console.log(`✅ Added project: ${project.title}`)
    }

    // Seed Alumni
    console.log('👥 Seeding alumni...')
    const alumni = generateAlumni()
    for (const alum of alumni) {
      await addDoc(collection(db, 'alumni'), alum)
      console.log(`✅ Added alumni: ${alum.name}`)
    }

    // Seed Trainers
    console.log('👨‍🏫 Seeding trainers...')
    const trainers = generateTrainers()
    for (const trainer of trainers) {
      await addDoc(collection(db, 'trainers'), trainer)
      console.log(`✅ Added trainer: ${trainer.name}`)
    }

    // Seed Team
    console.log('👔 Seeding team...')
    const team = generateTeam()
    for (const member of team) {
      await addDoc(collection(db, 'team'), member)
      console.log(`✅ Added team member: ${member.name}`)
    }

    // Seed Features
    console.log('⭐ Seeding features...')
    const features = generateFeatures()
    for (const feature of features) {
      await addDoc(collection(db, 'features'), feature)
      console.log(`✅ Added feature: ${feature.title}`)
    }

    // Seed Statistics
    console.log('📊 Seeding statistics...')
    const statistics = generateStatistics()
    for (const stat of statistics) {
      await addDoc(collection(db, 'statistics'), stat)
      console.log(`✅ Added statistic: ${stat.label}`)
    }

    // Seed FAQs
    console.log('❓ Seeding FAQs...')
    const faqs = generateFAQs()
    for (const faq of faqs) {
      await addDoc(collection(db, 'faqs'), faq)
      console.log(`✅ Added FAQ: ${faq.question}`)
    }

    // Seed Contact Info (single document)
    console.log('📞 Seeding contact info...')
    const contactInfo = generateContactInfo()
    const contactInfoRef = doc(collection(db, 'contactInfo'), 'main')
    await setDoc(contactInfoRef, contactInfo)
    console.log('✅ Added contact info')

    // Seed Site Settings (single document)
    console.log('⚙️ Seeding site settings...')
    const siteSettings = generateSiteSettings()
    const settingsRef = doc(collection(db, 'siteSettings'), 'main')
    await setDoc(settingsRef, siteSettings)
    console.log('✅ Added site settings')

    // Seed Footer (single document)
    console.log('🔗 Seeding footer...')
    const footer = generateFooter()
    const footerRef = doc(collection(db, 'footer'), 'main')
    await setDoc(footerRef, footer)
    console.log('✅ Added footer')

    // Create Admin User
    console.log('👤 Creating admin user...')
    try {
      const adminEmail = 'admin@techspert.com'
      const adminPassword = 'admin123456'

      // Check if admin already exists
      const adminUser = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)

      // Add admin document to Firestore
      await setDoc(doc(db, 'admins', adminUser.user.uid), {
        email: adminEmail,
        name: 'Admin User',
        role: 'super-admin',
        isActive: true,
        isLocked: false,
        permissions: {
          courses: { create: true, read: true, update: true, delete: true },
          projects: { create: true, read: true, update: true, delete: true },
          alumni: { create: true, read: true, update: true, delete: true },
          users: { create: true, read: true, update: true, delete: true },
          admins: { create: true, read: true, update: true, delete: true },
          settings: { create: true, read: true, update: true, delete: true }
        },
        createdAt: createTimestamp(new Date()),
        updatedAt: createTimestamp(new Date())
      })
      console.log('✅ Created admin user:', adminEmail)
      console.log('   Password:', adminPassword)
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️ Admin user already exists')
      } else {
        console.error('❌ Error creating admin:', error)
      }
    }

    console.log('🎉 Seeding completed successfully!')
    return { success: true, message: 'All data seeded successfully' }
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

/**
 * Create additional super admin user
 * Call this function after creating the Firebase Auth user via /admin/setup or Firebase Console
 * 
 * @param {string} uid - The Firebase Auth UID of the user
 */
export const createSuperAdmin = async (uid) => {
  console.log('👤 Creating super admin for aryangoel299@gmail.com...')

  try {
    const adminEmail = 'aryangoel299@gmail.com'

    // Add admin document to Firestore
    await setDoc(doc(db, 'admins', uid), {
      email: adminEmail,
      name: 'Super Admin',
      displayName: 'Aryan Goel',
      role: 'super-admin',
      isActive: true,
      isLocked: false,
      permissions: {
        courses: { create: true, read: true, update: true, delete: true },
        projects: { create: true, read: true, update: true, delete: true },
        alumni: { create: true, read: true, update: true, delete: true },
        users: { create: true, read: true, update: true, delete: true },
        admins: { create: true, read: true, update: true, delete: true },
        settings: { create: true, read: true, update: true, delete: true },
        enquiries: { create: true, read: true, update: true, delete: true }
      },
      createdAt: createTimestamp(new Date()),
      updatedAt: createTimestamp(new Date())
    })

    console.log('✅ Created super admin:', adminEmail)
    return { success: true, message: 'Super admin created successfully' }
  } catch (error) {
    console.error('❌ Error creating super admin:', error)
    throw error
  }
}

/**
 * Create super admin document by email (after Firebase Auth user exists)
 * Use this when you know the email but not the UID
 */
export const setupAdminByEmail = async (email = 'aryangoel299@gmail.com') => {
  console.log(`👤 Setting up admin for ${email}...`)
  console.log('⚠️ Note: You must first create the Firebase Auth user via /admin/setup or Firebase Console')
  console.log('   Then call createSuperAdmin(uid) with the user\'s UID')
  return { success: false, message: 'Please create Firebase Auth user first, then use createSuperAdmin(uid)' }
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  window.seedFirebase = seedFirebase
  window.createSuperAdmin = createSuperAdmin
  window.setupAdminByEmail = setupAdminByEmail
}

export default seedFirebase

