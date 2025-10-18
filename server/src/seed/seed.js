import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Course from '../models/Course.js'
import Project from '../models/Project.js'
import Alumni from '../models/Alumni.js'
import Admin from '../models/Admin.js'
import User from '../models/User.js'
import SiteSettings from '../models/SiteSettings.js'

// Load environment variables
dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('🍃 MongoDB Connected for seeding')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message)
    process.exit(1)
  }
}

const seedCourses = async () => {
  const courses = [
    {
      title: 'AI & Machine Learning Fundamentals',
      slug: 'ai-machine-learning-fundamentals',
      description: 'Master the fundamentals of artificial intelligence and machine learning with hands-on projects and real-world applications. Learn Python, TensorFlow, and advanced ML algorithms.',
      shortDescription: 'Learn AI and ML from scratch with practical projects',
      syllabus: [
        {
          title: 'Introduction to AI',
          description: 'Understanding artificial intelligence concepts and applications',
          duration: '2 weeks',
          lessons: 8,
          order: 1,
        },
        {
          title: 'Python for Data Science',
          description: 'Master Python programming for data analysis and ML',
          duration: '3 weeks',
          lessons: 12,
          order: 2,
        },
        {
          title: 'Machine Learning Algorithms',
          description: 'Learn supervised and unsupervised learning algorithms',
          duration: '4 weeks',
          lessons: 16,
          order: 3,
        },
        {
          title: 'Deep Learning with TensorFlow',
          description: 'Build neural networks and deep learning models',
          duration: '3 weeks',
          lessons: 12,
          order: 4,
        },
      ],
      price: 299,
      originalPrice: 499,
      duration: '12 weeks',
      level: 'beginner',
      tags: ['AI', 'Machine Learning', 'Python', 'TensorFlow', 'Data Science'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop',
      instructor: {
        name: 'Dr. Sarah Johnson',
        bio: 'AI researcher with 10+ years experience at Google and Tesla',
        imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          github: 'https://github.com/sarahjohnson',
        },
      },
      whatYouWillLearn: [
        'Build and train machine learning models',
        'Implement neural networks from scratch',
        'Work with real-world datasets',
        'Deploy ML models to production',
        'Understand AI ethics and bias',
      ],
      requirements: [
        'Basic programming knowledge',
        'High school mathematics',
        'Computer with 8GB RAM',
      ],
      isPublished: true,
      isFeatured: true,
      position: 1,
      rating: { average: 4.8, count: 1250 },
      studentsCount: 1250,
      completionRate: 85,
    },
    {
      title: 'Data Science & Analytics',
      slug: 'data-science-analytics',
      description: 'Learn data science from data collection to visualization. Master Python, R, SQL, and advanced analytics techniques used by top companies.',
      shortDescription: 'Complete data science course with real projects',
      syllabus: [
        {
          title: 'Data Collection & Cleaning',
          description: 'Learn to collect and clean data from various sources',
          duration: '2 weeks',
          lessons: 8,
          order: 1,
        },
        {
          title: 'Statistical Analysis',
          description: 'Master statistical concepts and hypothesis testing',
          duration: '3 weeks',
          lessons: 12,
          order: 2,
        },
        {
          title: 'Data Visualization',
          description: 'Create compelling visualizations with Python and R',
          duration: '2 weeks',
          lessons: 8,
          order: 3,
        },
        {
          title: 'Machine Learning for Analytics',
          description: 'Apply ML techniques to solve business problems',
          duration: '4 weeks',
          lessons: 16,
          order: 4,
        },
      ],
      price: 249,
      originalPrice: 399,
      duration: '11 weeks',
      level: 'intermediate',
      tags: ['Data Science', 'Python', 'R', 'SQL', 'Statistics', 'Visualization'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
      instructor: {
        name: 'Michael Chen',
        bio: 'Senior Data Scientist at Netflix with expertise in big data analytics',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/michaelchen',
          github: 'https://github.com/michaelchen',
        },
      },
      whatYouWillLearn: [
        'Analyze large datasets efficiently',
        'Create interactive dashboards',
        'Build predictive models',
        'Communicate insights effectively',
        'Work with big data tools',
      ],
      requirements: [
        'Basic Python knowledge',
        'Statistics fundamentals',
        'SQL basics',
      ],
      isPublished: true,
      isFeatured: true,
      position: 2,
      rating: { average: 4.7, count: 980 },
      studentsCount: 980,
      completionRate: 82,
    },
    {
      title: 'MERN Stack Development',
      slug: 'mern-stack-development',
      description: 'Build full-stack web applications using MongoDB, Express.js, React, and Node.js. Learn modern development practices and deploy to production.',
      shortDescription: 'Master full-stack development with MERN stack',
      syllabus: [
        {
          title: 'Node.js & Express.js',
          description: 'Build robust backend APIs with Node.js and Express',
          duration: '3 weeks',
          lessons: 12,
          order: 1,
        },
        {
          title: 'MongoDB Database',
          description: 'Design and implement NoSQL databases',
          duration: '2 weeks',
          lessons: 8,
          order: 2,
        },
        {
          title: 'React Frontend',
          description: 'Create interactive user interfaces with React',
          duration: '4 weeks',
          lessons: 16,
          order: 3,
        },
        {
          title: 'Deployment & DevOps',
          description: 'Deploy applications and set up CI/CD pipelines',
          duration: '2 weeks',
          lessons: 8,
          order: 4,
        },
      ],
      price: 199,
      originalPrice: 349,
      duration: '11 weeks',
      level: 'intermediate',
      tags: ['MERN', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Full Stack'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
      instructor: {
        name: 'Emily Rodriguez',
        bio: 'Full-stack developer and tech lead at Airbnb',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/emilyrodriguez',
          github: 'https://github.com/emilyrodriguez',
        },
      },
      whatYouWillLearn: [
        'Build scalable web applications',
        'Implement authentication and security',
        'Create responsive user interfaces',
        'Deploy to cloud platforms',
        'Follow best practices and patterns',
      ],
      requirements: [
        'JavaScript fundamentals',
        'HTML/CSS knowledge',
        'Basic programming concepts',
      ],
      isPublished: true,
      isFeatured: true,
      position: 3,
      rating: { average: 4.9, count: 2100 },
      studentsCount: 2100,
      completionRate: 88,
    },
  ]

  await Course.deleteMany({})
  await Course.insertMany(courses)
  console.log('✅ Courses seeded successfully')
}

const seedProjects = async () => {
  const projects = [
    {
      title: 'AI-Powered E-commerce Recommendation System',
      description: 'Built a machine learning recommendation system for an e-commerce platform using collaborative filtering and content-based filtering. The system increased user engagement by 35% and sales by 20%.',
      shortDescription: 'ML recommendation system that boosted sales by 20%',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
      githubUrl: 'https://github.com/student1/ecommerce-recommendation-system',
      liveUrl: 'https://ecommerce-recommendations.herokuapp.com',
      technologies: ['Python', 'TensorFlow', 'Pandas', 'Flask', 'MongoDB'],
      course: 'AI & Machine Learning Fundamentals',
      studentName: 'Alex Thompson',
      studentEmail: 'alex.thompson@email.com',
      completionDate: new Date('2024-01-15'),
      isFeatured: true,
      isApproved: true,
      position: 1,
      views: 1250,
      likes: 89,
      features: [
        'Real-time recommendations',
        'A/B testing framework',
        'Scalable architecture',
        'User behavior tracking',
      ],
      challenges: [
        'Handling cold start problem',
        'Optimizing for real-time performance',
        'Managing large datasets',
      ],
      lessonsLearned: [
        'Importance of data preprocessing',
        'Value of ensemble methods',
        'Need for continuous monitoring',
      ],
      tags: ['AI', 'Machine Learning', 'E-commerce', 'Recommendation System'],
    },
    {
      title: 'Data Visualization Dashboard for Sales Analytics',
      description: 'Created an interactive dashboard for sales analytics using Python, Plotly, and Dash. The dashboard provides real-time insights into sales performance, customer behavior, and market trends.',
      shortDescription: 'Interactive sales analytics dashboard with real-time insights',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
      githubUrl: 'https://github.com/student2/sales-analytics-dashboard',
      liveUrl: 'https://sales-dashboard.herokuapp.com',
      technologies: ['Python', 'Plotly', 'Dash', 'Pandas', 'PostgreSQL'],
      course: 'Data Science & Analytics',
      studentName: 'Maria Garcia',
      studentEmail: 'maria.garcia@email.com',
      completionDate: new Date('2024-02-10'),
      isFeatured: true,
      isApproved: true,
      position: 2,
      views: 980,
      likes: 67,
      features: [
        'Real-time data updates',
        'Interactive charts and graphs',
        'Export functionality',
        'Mobile responsive design',
      ],
      challenges: [
        'Optimizing query performance',
        'Handling large datasets',
        'Creating intuitive UI/UX',
      ],
      lessonsLearned: [
        'Importance of data storytelling',
        'Value of user feedback',
        'Need for performance optimization',
      ],
      tags: ['Data Visualization', 'Analytics', 'Dashboard', 'Business Intelligence'],
    },
    {
      title: 'Social Media Management Platform',
      description: 'Developed a full-stack social media management platform that allows users to schedule posts, analyze engagement, and manage multiple social media accounts from one dashboard.',
      shortDescription: 'Full-stack social media management platform',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop',
      githubUrl: 'https://github.com/student3/social-media-platform',
      liveUrl: 'https://social-media-manager.herokuapp.com',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
      course: 'MERN Stack Development',
      studentName: 'David Kim',
      studentEmail: 'david.kim@email.com',
      completionDate: new Date('2024-03-05'),
      isFeatured: true,
      isApproved: true,
      position: 3,
      views: 1500,
      likes: 112,
      features: [
        'Multi-platform posting',
        'Content calendar',
        'Analytics and insights',
        'Team collaboration tools',
      ],
      challenges: [
        'Integrating multiple APIs',
        'Handling real-time updates',
        'Managing user permissions',
      ],
      lessonsLearned: [
        'Importance of API design',
        'Value of user authentication',
        'Need for error handling',
      ],
      tags: ['MERN', 'Social Media', 'Full Stack', 'API Integration'],
    },
  ]

  await Project.deleteMany({})
  await Project.insertMany(projects)
  console.log('✅ Projects seeded successfully')
}

const seedAlumni = async () => {
  const alumni = [
    {
      name: 'Sarah Wilson',
      title: 'Senior AI Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      course: 'AI & Machine Learning Fundamentals',
      graduationDate: new Date('2023-06-15'),
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      testimonial: 'The AI course at Techspert completely transformed my career. The hands-on projects and expert guidance helped me land my dream job at Google. The instructors are world-class and the curriculum is perfectly designed for real-world applications.',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahwilson',
        github: 'https://github.com/sarahwilson',
        website: 'https://sarahwilson.dev',
      },
      email: 'sarah.wilson@email.com',
      skills: ['Python', 'TensorFlow', 'Machine Learning', 'Deep Learning', 'Computer Vision'],
      achievements: [
        {
          title: 'Promoted to Senior Engineer',
          description: 'Promoted within 6 months of joining Google',
          date: new Date('2023-12-01'),
        },
        {
          title: 'Published Research Paper',
          description: 'Co-authored paper on computer vision in medical imaging',
          date: new Date('2023-09-15'),
        },
      ],
      isFeatured: true,
      isApproved: true,
      position: 1,
      salary: 180000,
      salaryCurrency: 'USD',
      employmentType: 'full-time',
      yearsOfExperience: 3,
      tags: ['AI', 'Machine Learning', 'Google', 'Computer Vision'],
    },
    {
      name: 'James Rodriguez',
      title: 'Data Scientist',
      company: 'Netflix',
      location: 'Los Gatos, CA',
      course: 'Data Science & Analytics',
      graduationDate: new Date('2023-08-20'),
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      testimonial: 'Techspert\'s Data Science course gave me the skills and confidence to transition from marketing to data science. The practical approach and real-world projects made all the difference. Now I\'m working on recommendation algorithms at Netflix!',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/jamesrodriguez',
        github: 'https://github.com/jamesrodriguez',
      },
      email: 'james.rodriguez@email.com',
      skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'A/B Testing'],
      achievements: [
        {
          title: 'Career Transition Success',
          description: 'Successfully transitioned from marketing to data science',
          date: new Date('2023-08-20'),
        },
        {
          title: 'Netflix Recommendation Team',
          description: 'Joined the core recommendation algorithm team',
          date: new Date('2023-10-01'),
        },
      ],
      isFeatured: true,
      isApproved: true,
      position: 2,
      salary: 150000,
      salaryCurrency: 'USD',
      employmentType: 'full-time',
      yearsOfExperience: 2,
      tags: ['Data Science', 'Netflix', 'Recommendation Systems', 'Career Change'],
    },
    {
      name: 'Lisa Chen',
      title: 'Full Stack Developer',
      company: 'Airbnb',
      location: 'San Francisco, CA',
      course: 'MERN Stack Development',
      graduationDate: new Date('2023-09-10'),
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      testimonial: 'The MERN stack course at Techspert was exactly what I needed to break into tech. The comprehensive curriculum and supportive community helped me build the skills and portfolio to land my first developer job at Airbnb.',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/lisachen',
        github: 'https://github.com/lisachen',
        website: 'https://lisachen.dev',
      },
      email: 'lisa.chen@email.com',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
      achievements: [
        {
          title: 'First Developer Job',
          description: 'Landed first developer position at Airbnb',
          date: new Date('2023-09-10'),
        },
        {
          title: 'Open Source Contributor',
          description: 'Active contributor to React and Node.js communities',
          date: new Date('2023-11-01'),
        },
      ],
      isFeatured: true,
      isApproved: true,
      position: 3,
      salary: 140000,
      salaryCurrency: 'USD',
      employmentType: 'full-time',
      yearsOfExperience: 1,
      tags: ['MERN', 'Airbnb', 'Full Stack', 'JavaScript', 'Career Change'],
    },
  ]

  await Alumni.deleteMany({})
  await Alumni.insertMany(alumni)
  console.log('✅ Alumni seeded successfully')
}

const seedAdmin = async () => {
  const admin = {
    name: 'Techspert Super Admin',
    email: 'super-admin@techspert.ai',
    password: 'Admin123',
    role: 'super-admin',
    isActive: true,
    profile: {
      bio: 'Super administrator for Techspert platform',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    },
    permissions: {
      courses: { create: true, read: true, update: true, delete: true },
      projects: { create: true, read: true, update: true, delete: true },
      alumni: { create: true, read: true, update: true, delete: true },
      admin: { create: true, read: true, update: true, delete: true },
    },
  }

  await Admin.deleteMany({})
  await Admin.create(admin)
  console.log('✅ Admin user seeded successfully')
  console.log('📧 Email: super-admin@techspert.ai')
  console.log('🔑 Password: Admin123')
}

const seedUsers = async () => {
  const users = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Student123',
      role: 'student',
      bio: 'Passionate about learning new technologies and building amazing projects.',
      location: 'San Francisco, CA',
      website: 'https://johndoe.dev',
      socialLinks: {
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe',
      },
      isEmailVerified: true,
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'Instructor123',
      role: 'instructor',
      bio: 'Senior Software Engineer with 10+ years of experience in full-stack development.',
      location: 'New York, NY',
      website: 'https://janesmith.dev',
      socialLinks: {
        github: 'https://github.com/janesmith',
        linkedin: 'https://linkedin.com/in/janesmith',
      },
      instructorProfile: {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        experience: 10,
        specialties: ['React', 'Node.js', 'Python', 'AWS'],
        rating: { average: 4.9, count: 150 },
        totalStudents: 500,
        isVerified: true,
      },
      isEmailVerified: true,
    },
  ]

  await User.deleteMany({})
  await User.insertMany(users)
  console.log('✅ Sample users seeded successfully')
  console.log('👤 Student: john.doe@example.com / Student123')
  console.log('👨‍🏫 Instructor: jane.smith@example.com / Instructor123')
}

const seedSiteSettings = async () => {
  const settings = {
    siteName: 'Techspert',
    siteDescription: 'Learn cutting-edge technology skills with expert guidance and build your dream career in tech',
    siteTagline: 'Empowering the next generation of tech professionals',
    
    logo: {
      light: '/images/logo-light.png',
      dark: '/images/logo-dark.png',
      favicon: '/images/favicon.ico',
    },
    
    theme: {
      primary: '#0ea5e9',
      secondary: '#14b8a6',
      accent: '#a855f7',
      background: '#ffffff',
    },
    
    contact: {
      email: 'contact@techspert.com',
      supportEmail: 'support@techspert.com',
      phone: '+1-555-123-4567',
      address: '123 Tech Street, San Francisco, CA 94105',
    },
    
    socialMedia: {
      github: 'https://github.com/techspert',
      twitter: 'https://twitter.com/techspert',
      linkedin: 'https://linkedin.com/company/techspert',
      youtube: 'https://youtube.com/techspert',
      instagram: 'https://instagram.com/techspert',
      facebook: 'https://facebook.com/techspert',
    },
    
    homePage: {
      hero: {
        title: 'Master the Future of Technology',
        subtitle: 'Learn cutting-edge skills from industry experts and build your dream career in tech',
        ctaText: 'Start Learning Today',
        backgroundImage: '/images/hero-bg.jpg',
      },
      features: {
        title: 'Why Choose Techspert?',
        subtitle: 'We provide comprehensive learning experiences designed for real-world success',
      },
      stats: {
        title: 'Our Impact',
        subtitle: 'Join thousands of successful graduates who have transformed their careers',
      },
    },
    
    seo: {
      metaTitle: 'Techspert - Learn Technology Skills Online',
      metaDescription: 'Master cutting-edge technology skills with expert guidance. Join thousands of successful graduates.',
      keywords: ['technology', 'programming', 'courses', 'online learning', 'tech skills'],
      ogImage: '/images/og-image.jpg',
    },
    
    features: {
      enableRegistration: true,
      enableComments: true,
      enableRatings: true,
      enableCertificates: true,
      enableNewsletter: true,
      enableBlog: false,
    },
  }

  await SiteSettings.deleteMany({})
  await SiteSettings.create(settings)
  console.log('✅ Site settings seeded successfully')
}

const seedDatabase = async () => {
  try {
    await connectDB()
    
    console.log('🌱 Starting database seeding...')
    
    await seedCourses()
    await seedProjects()
    await seedAlumni()
    await seedAdmin()
    await seedUsers()
    await seedSiteSettings()
    
    console.log('🎉 Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  seedDatabase()
}

export default seedDatabase