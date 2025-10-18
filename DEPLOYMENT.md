# 🚀 Techspert Deployment Guide

## Overview
This guide will help you deploy Techspert - a complete online course platform with Docker orchestration, seeded data, and professional hosting simulation.

## 🎯 What You'll Get
- **Complete MERN Stack Application** with React frontend and Node.js backend
- **MongoDB Database** with automatically seeded sample data
- **Nginx Reverse Proxy** for professional hosting simulation
- **Admin Dashboard** with full CRUD operations
- **Authentication System** with JWT tokens and role-based access
- **Professional UI/UX** with animations and responsive design
- **Sample Data** including courses, projects, alumni, and users

## 📋 Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)
- At least 4GB RAM available
- Ports 80, 3000, 5000, and 27017 available

## 🚀 Quick Deployment

### 1. Clone the Repository
```bash
git clone <repository-url>
cd techspert
```

### 2. Run Deployment Script
```bash
# Make script executable (Linux/Mac)
chmod +x deploy.sh
./deploy.sh

# Or run manually
docker-compose up --build -d
```

### 3. Access the Application
- **Main Application**: http://localhost
- **Admin Dashboard**: http://localhost/admin
- **API Documentation**: http://localhost/api

## 🔐 Default Credentials

### Admin Access
- **Email**: `super-admin@techspert.ai`
- **Password**: `Admin123`
- **Role**: Super Admin (full access)

### Sample Users
- **Student**: `john.doe@example.com` / `Student123`
- **Instructor**: `jane.smith@example.com` / `Instructor123`

## 📊 Seeded Data

### Courses (3)
1. **AI & Machine Learning Fundamentals** - $299 (was $499)
2. **Data Science & Analytics** - $249 (was $399)
3. **MERN Stack Development** - $199 (was $349)

### Projects (3)
1. AI-Powered E-commerce Recommendation System
2. Data Visualization Dashboard for Sales Analytics
3. Social Media Management Platform

### Alumni (3)
1. Sarah Wilson - Senior AI Engineer at Google
2. James Rodriguez - Data Scientist at Netflix
3. Lisa Chen - Full Stack Developer at Airbnb

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│  React Frontend │────│  Node.js API    │
│   (Port 80)     │    │   (Port 3000)   │    │   (Port 5000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │   MongoDB       │
                                               │   (Port 27017)  │
                                               └─────────────────┘
```

## 🔧 Configuration

### Environment Variables
All configuration is handled through the `.env` file:
- Database connection strings
- JWT secrets
- Cloudinary credentials (demo)
- API endpoints

### Docker Services
- **mongodb**: MongoDB database with authentication
- **backend**: Node.js API server with auto-seeding
- **frontend**: React application with Nginx
- **nginx**: Reverse proxy with load balancing

## 📱 Features Included

### Public Features
- ✅ Responsive homepage with hero section
- ✅ Course catalog with filtering and search
- ✅ Project showcase gallery
- ✅ Alumni success stories
- ✅ About and contact pages
- ✅ Professional branding and animations

### Admin Features
- ✅ Secure admin dashboard
- ✅ Course management (CRUD)
- ✅ Project approval system
- ✅ Alumni profile management
- ✅ Site settings configuration
- ✅ User management
- ✅ Analytics and statistics

### Technical Features
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control
- ✅ File upload with Cloudinary
- ✅ Rate limiting and security
- ✅ Error handling and logging
- ✅ Health checks and monitoring

## 🛠️ Development Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services
```bash
# Stop and remove containers
docker-compose down

# Stop and remove with volumes
docker-compose down -v
```

### Rebuild Services
```bash
# Rebuild and restart
docker-compose up --build

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :80

# Kill the process or change ports in docker-compose.yml
```

#### Database Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

#### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Health Checks
```bash
# Check all services
curl http://localhost/health
curl http://localhost:5000/health
curl http://localhost:3000

# Check database
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## 📈 Performance Optimization

### Production Considerations
- Replace demo Cloudinary credentials with real ones
- Use environment-specific JWT secrets
- Enable SSL/HTTPS
- Set up proper logging and monitoring
- Configure backup strategies for MongoDB
- Use CDN for static assets

### Scaling
- Add Redis for caching
- Use MongoDB replica sets
- Implement load balancing
- Add monitoring with Prometheus/Grafana

## 🎉 Success Indicators

After successful deployment, you should see:
- ✅ Splash screen with Techspert branding
- ✅ Homepage with featured courses and projects
- ✅ Working admin login at `/admin`
- ✅ All CRUD operations in admin dashboard
- ✅ Responsive design on all devices
- ✅ Professional animations and transitions

## 📞 Support

If you encounter any issues:
1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check health endpoints: `curl http://localhost/health`
4. Restart services: `docker-compose restart`

---

**🎯 Goal Achieved**: You now have a fully functional, production-ready online course platform running locally with professional hosting simulation!
