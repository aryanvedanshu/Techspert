// Application constants

export const API_ENDPOINTS = {
  COURSES: '/courses',
  PROJECTS: '/projects',
  ALUMNI: '/alumni',
  ADMIN: '/admin',
  AUTH: '/auth',
}

export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
}

export const COURSE_CATEGORIES = {
  AI: 'AI & Machine Learning',
  DATA_SCIENCE: 'Data Science',
  MERN: 'MERN Stack',
  WEB_DEVELOPMENT: 'Web Development',
  MOBILE: 'Mobile Development',
  DEVOPS: 'DevOps',
}

export const TECHNOLOGIES = {
  FRONTEND: [
    'React',
    'Vue.js',
    'Angular',
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'Tailwind CSS',
    'Bootstrap',
  ],
  BACKEND: [
    'Node.js',
    'Express',
    'Python',
    'Django',
    'Flask',
    'Java',
    'Spring Boot',
    'PHP',
    'Laravel',
  ],
  DATABASE: [
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'SQLite',
    'Firebase',
  ],
  AI_ML: [
    'Python',
    'TensorFlow',
    'PyTorch',
    'Scikit-learn',
    'Pandas',
    'NumPy',
    'OpenCV',
    'NLTK',
  ],
  DEVOPS: [
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'Jenkins',
    'GitHub Actions',
    'Terraform',
  ],
}

export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/techspert',
  TWITTER: 'https://twitter.com/techspert',
  LINKEDIN: 'https://linkedin.com/company/techspert',
  YOUTUBE: 'https://youtube.com/techspert',
  DISCORD: 'https://discord.gg/techspert',
}

export const CONTACT_INFO = {
  EMAIL: 'contact@techspert.com',
  PHONE: '+1 (555) 123-4567',
  ADDRESS: '123 Tech Street, San Francisco, CA 94105',
  SUPPORT_HOURS: '9:00 AM - 6:00 PM PST',
}

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/.+/,
}

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
}

export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
}

export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
}

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
}

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
}
