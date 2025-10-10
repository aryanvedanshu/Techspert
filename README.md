# Techspert - Online Course Platform

A modern, full-stack online course platform built with the MERN stack, featuring AI, Data Science, and MERN Stack courses with a comprehensive admin dashboard.

## 🚀 Features

### For Students
- **Course Catalog**: Browse AI, Data Science, and MERN Stack courses
- **Interactive Learning**: Hands-on projects and real-world applications
- **Student Projects**: Showcase your work and get inspired by others
- **Alumni Network**: Connect with successful graduates
- **Certificates**: Earn industry-recognized completion certificates
- **Responsive Design**: Learn on any device

### For Administrators
- **Secure Admin Dashboard**: Manage all platform content
- **Course Management**: Create, edit, and organize courses
- **Project Showcase**: Approve and feature student projects
- **Alumni Profiles**: Manage graduate success stories
- **Analytics**: Track platform performance and engagement
- **Content Management**: Full control over images, text, and media

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **TailwindCSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for beautiful icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image management
- **Helmet** for security
- **Rate limiting** and CORS protection

### Development & Deployment
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **Jest** for testing
- **ESLint** for code quality
- **Nginx** for production serving

## 📁 Project Structure

```
techspert/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── routes/         # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets
│   ├── tests/              # Frontend tests
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── seed/           # Database seeding
│   ├── tests/              # Backend tests
│   └── package.json
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Docker configuration
├── Dockerfile             # Container definition
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd techspert
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
# Database
MONGO_URI=mongodb://localhost:27017/techspert

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Client URL
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Seed Database
```bash
cd server
npm run seed
```

This creates:
- 3 sample courses (AI, Data Science, MERN Stack)
- 3 student projects
- 3 alumni profiles
- Admin user: `admin@techspert.test` / `ChangeMe123!`

### 5. Start Development Servers
```bash
# Terminal 1: Start backend (port 5000)
cd server
npm run dev

# Terminal 2: Start frontend (port 5173)
cd client
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Admin Login**: http://localhost:5173/admin/login

## 📚 Available Scripts

### Frontend (client/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Backend (server/)
```bash
npm run dev          # Start with nodemon
npm start            # Start production server
npm test             # Run tests
npm run seed         # Seed database
```

## 🧪 Testing

### Frontend Tests
```bash
cd client
npm run test         # Run with Vitest
npm run test:ui      # Run with UI
```

### Backend Tests
```bash
cd server
npm test             # Run Jest tests
```

### Integration Tests
```bash
# Start both servers
npm run dev          # In server directory
npm run dev          # In client directory

# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/courses
```

## 🐳 Docker Deployment

### Development with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 🔧 Configuration

### Database Models

#### Course Model
- Title, description, and metadata
- Syllabus with lessons and duration
- Pricing and enrollment data
- Instructor information
- Rating and review system

#### Project Model
- Student project showcase
- Technology stack and features
- GitHub and live demo links
- Approval and featuring system

#### Alumni Model
- Graduate success stories
- Career information and achievements
- Social media links
- Course completion data

#### Admin Model
- Role-based permissions
- Authentication and security
- Profile and preferences
- Activity tracking

### API Endpoints

#### Public Endpoints
```
GET  /api/courses          # Get all published courses
GET  /api/courses/:id      # Get single course
GET  /api/projects         # Get approved projects
GET  /api/projects/:id     # Get single project
GET  /api/alumni           # Get approved alumni
GET  /api/alumni/:id       # Get single alumni
POST /api/projects/:id/like # Like a project
```

#### Admin Endpoints (Protected)
```
POST /api/admin/login      # Admin login
GET  /api/admin/profile    # Get admin profile
PUT  /api/admin/profile    # Update profile

# Course Management
POST /api/courses          # Create course
PUT  /api/courses/:id      # Update course
DELETE /api/courses/:id    # Delete course

# Project Management
POST /api/projects         # Create project
PUT  /api/projects/:id     # Update project
PATCH /api/projects/:id/approve # Approve project

# Alumni Management
POST /api/alumni           # Create alumni
PUT  /api/alumni/:id       # Update alumni
PATCH /api/alumni/:id/approve # Approve alumni
```

## 🎨 Customization

### Styling
- Modify `client/tailwind.config.cjs` for design system
- Update `client/src/index.css` for global styles
- Customize component styles in individual files

### Content Management
- Admin dashboard for easy content updates
- Image uploads via Cloudinary
- Rich text editing for descriptions
- Drag-and-drop reordering

### Adding New Features
1. Create new model in `server/src/models/`
2. Add controller in `server/src/controllers/`
3. Create routes in `server/src/routes/`
4. Build frontend components in `client/src/`
5. Add tests for new functionality

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** with bcrypt
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** with Joi
- **Helmet** for security headers
- **Account Lockout** after failed attempts

## 📊 Performance Optimizations

- **Image Optimization** with Cloudinary
- **Lazy Loading** for components and images
- **Code Splitting** with React.lazy
- **Caching** with Redis (optional)
- **Compression** with gzip
- **CDN** for static assets

## 🚀 Deployment Options

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd client
vercel --prod
```

### Heroku (Backend)
```bash
# Install Heroku CLI
# Create Heroku app
heroku create techspert-api

# Set environment variables
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

### Digital Ocean (Full Stack)
```bash
# Use Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Email**: contact@techspert.com
- **Discord**: Join our community server

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ Admin dashboard
- ✅ Course management
- ✅ Project showcase
- ✅ Alumni network

### Phase 2 (Planned)
- 🔄 User registration and profiles
- 🔄 Course enrollment system
- 🔄 Progress tracking
- 🔄 Discussion forums
- 🔄 Mobile app

### Phase 3 (Future)
- 🔄 Live streaming integration
- 🔄 AI-powered recommendations
- 🔄 Advanced analytics
- 🔄 Multi-language support
- 🔄 Enterprise features

## 🙏 Acknowledgments

- **Unsplash** for beautiful stock photos
- **Lucide** for the amazing icon set
- **TailwindCSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **MongoDB** for the flexible database
- **Cloudinary** for image management

---

**Built with ❤️ by the Techspert Team**

*Empowering the next generation of developers with cutting-edge technology education.*
