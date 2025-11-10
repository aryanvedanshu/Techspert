import Trainer from '../models/Trainer.js'
import logger from '../utils/logger.js'

const demoTrainers = [
  {
    name: 'John Smith',
    email: 'john.smith@techspert.com',
    bio: 'Senior Full-Stack Developer with 10+ years of experience in MERN stack development. Specialized in building scalable web applications and teaching modern JavaScript frameworks.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    phone: '+1-555-0101',
    specialization: ['MERN Stack', 'React', 'Node.js', 'MongoDB'],
    experience: 10,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johnsmith',
      github: 'https://github.com/johnsmith',
      twitter: 'https://twitter.com/johnsmith',
      website: 'https://johnsmith.dev'
    },
    isActive: true,
    rating: {
      average: 4.8,
      count: 125
    },
    totalStudents: 500,
    totalCourses: 8
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techspert.com',
    bio: 'Data Science Expert and Machine Learning Engineer. Passionate about teaching Python, Data Analysis, and AI/ML concepts to students of all levels.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    phone: '+1-555-0102',
    specialization: ['Python', 'Data Science', 'Machine Learning', 'AI'],
    experience: 8,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      github: 'https://github.com/sarahjohnson',
      twitter: 'https://twitter.com/sarahjohnson',
      website: 'https://sarahjohnson.ai'
    },
    isActive: true,
    rating: {
      average: 4.9,
      count: 98
    },
    totalStudents: 450,
    totalCourses: 6
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@techspert.com',
    bio: 'Cloud Computing and DevOps Specialist. Expert in AWS, Docker, Kubernetes, and CI/CD pipelines. Helping students master modern deployment practices.',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    phone: '+1-555-0103',
    specialization: ['AWS', 'Docker', 'Kubernetes', 'DevOps', 'CI/CD'],
    experience: 7,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      github: 'https://github.com/michaelchen',
      twitter: 'https://twitter.com/michaelchen',
      website: 'https://michaelchen.cloud'
    },
    isActive: true,
    rating: {
      average: 4.7,
      count: 87
    },
    totalStudents: 380,
    totalCourses: 5
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@techspert.com',
    bio: 'Frontend Development Expert specializing in React, Vue.js, and modern UI/UX design. Creating beautiful and functional user interfaces.',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    phone: '+1-555-0104',
    specialization: ['React', 'Vue.js', 'UI/UX Design', 'TypeScript', 'CSS'],
    experience: 6,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emilyrodriguez',
      github: 'https://github.com/emilyrodriguez',
      twitter: 'https://twitter.com/emilyrodriguez',
      website: 'https://emilyrodriguez.design'
    },
    isActive: true,
    rating: {
      average: 4.8,
      count: 112
    },
    totalStudents: 420,
    totalCourses: 7
  },
  {
    name: 'David Kim',
    email: 'david.kim@techspert.com',
    bio: 'Mobile App Development Specialist. Expert in React Native, Flutter, and native iOS/Android development. Building cross-platform mobile applications.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    phone: '+1-555-0105',
    specialization: ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile Development'],
    experience: 9,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/davidkim',
      github: 'https://github.com/davidkim',
      twitter: 'https://twitter.com/davidkim',
      website: 'https://davidkim.mobile'
    },
    isActive: true,
    rating: {
      average: 4.6,
      count: 76
    },
    totalStudents: 320,
    totalCourses: 4
  }
]

export const seedTrainers = async () => {
  logger.functionEntry('seedTrainers')
  logger.info('Starting trainer seeding process', { count: demoTrainers.length })
  
  try {
    // Clear existing trainers to ensure fresh seed
    logger.dbOperation('deleteMany', 'Trainer', {})
    await Trainer.deleteMany({})
    logger.info('Cleared existing trainers')
    
    // Insert demo trainers
    logger.dbOperation('insertMany', 'Trainer', { count: demoTrainers.length })
    const trainers = await Trainer.insertMany(demoTrainers)
    
    logger.info('Trainers seeded successfully', { 
      count: trainers.length,
      trainerIds: trainers.map(t => t._id)
    })
    logger.functionExit('seedTrainers', { success: true, count: trainers.length })
    
    return trainers
  } catch (error) {
    logger.error('Failed to seed trainers', error, {
      errorName: error.name,
      errorMessage: error.message
    })
    throw error
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/db.js').then(({ connectDB }) => {
    connectDB().then(() => {
      seedTrainers().then(() => {
        logger.info('Trainer seeding completed')
        process.exit(0)
      }).catch((error) => {
        logger.error('Trainer seeding failed', error)
        process.exit(1)
      })
    })
  })
}

