# Techspert - Complete Setup Instructions

## Overview
This project has been completely transformed to extract all modifiable components from the website and make them database-driven with full admin control. All static content has been removed and replaced with dynamic data from MongoDB collections.

## What's Been Implemented

### 🗄️ New Database Models
- **Team** - Team members and instructors
- **Feature** - Website features and highlights  
- **Statistic** - Website statistics and metrics
- **FAQ** - Frequently asked questions
- **PageContent** - Dynamic page content management
- **ContactInfo** - Contact information and social links

### 🎛️ Admin Management Pages
- **AdminTeam** - Manage team members and instructors
- **AdminFeatures** - Manage website features
- **AdminStatistics** - Manage statistics and metrics
- **AdminFAQs** - Manage frequently asked questions
- **AdminContactInfo** - Manage contact information

### 🔧 Enhanced Existing Models
- **Course** - Enhanced with more fields and better structure
- **Alumni** - Enhanced with achievements and detailed profiles
- **Project** - Enhanced with screenshots, features, and challenges
- **Admin** - Enhanced with permissions and profile management
- **SiteSettings** - Comprehensive site configuration

### 📊 Demo Data
- 5 unique entries for each collection
- Realistic data with proper relationships
- Admin accounts with different permission levels

## 🚀 Quick Start

### 1. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 2. Environment Setup

Create `.env` file in the server directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/techspert
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### 3. Database Setup

**Start MongoDB:**
```bash
# If using MongoDB locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

**Seed the Database:**
```bash
cd server
npm run seed
```

This will create:
- 3 admin accounts with different roles
- 5 courses with complete details
- 5 alumni profiles with achievements
- 5 student projects with screenshots
- 5 team members with social links
- 5 features with icons and colors
- 5 statistics with categories
- 5 FAQs with tags
- 3 page content entries
- 5 contact info entries
- Complete site settings

### 4. Start the Application

**Start Server:**
```bash
cd server
npm run dev
```

**Start Client:**
```bash
cd client
npm run dev
```

### 5. Access the Application

- **Website:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin/login

**Admin Login Credentials:**
- **Super Admin:** admin@techspert.com / admin123456
- **Manager:** manager@techspert.com / manager123456  
- **Moderator:** moderator@techspert.com / moderator123456

## 🎯 Admin Features

### Complete CRUD Operations
All modifiable components now have full Create, Read, Update, Delete operations:

1. **Team Management** (`/admin/team`)
   - Add/edit team members
   - Manage roles, departments, experience
   - Social media links
   - Profile images and bios

2. **Features Management** (`/admin/features`)
   - Create website features
   - Custom icons and colors
   - Categorize by page (homepage, about, etc.)
   - Featured/active status

3. **Statistics Management** (`/admin/statistics`)
   - Add metrics and statistics
   - Custom icons and colors
   - Categorize by section
   - Featured/active status

4. **FAQ Management** (`/admin/faqs`)
   - Create Q&A pairs
   - Categorize by topic
   - Add tags for searchability
   - Track helpful/not helpful votes

5. **Contact Info Management** (`/admin/contact-info`)
   - Manage all contact methods
   - Social media links
   - Office hours and addresses
   - Primary contact designation

### Enhanced Existing Management
- **Courses** - Full syllabus, instructor details, pricing
- **Projects** - Screenshots, features, challenges, lessons learned
- **Alumni** - Detailed profiles, achievements, salary info
- **Site Settings** - Complete site configuration

## 🔧 API Endpoints

### New Endpoints Added:
```
GET    /api/team                    - Get all team members
POST   /api/team                    - Create team member
PUT    /api/team/:id                - Update team member
DELETE /api/team/:id                - Delete team member

GET    /api/features                - Get all features
POST   /api/features                - Create feature
PUT    /api/features/:id            - Update feature
DELETE /api/features/:id            - Delete feature

GET    /api/statistics              - Get all statistics
POST   /api/statistics              - Create statistic
PUT    /api/statistics/:id          - Update statistic
DELETE /api/statistics/:id          - Delete statistic

GET    /api/faqs                    - Get all FAQs
POST   /api/faqs                    - Create FAQ
PUT    /api/faqs/:id                - Update FAQ
DELETE /api/faqs/:id                - Delete FAQ

GET    /api/contact-info            - Get all contact info
POST   /api/contact-info            - Create contact info
PUT    /api/contact-info/:id        - Update contact info
DELETE /api/contact-info/:id        - Delete contact info

GET    /api/page-content/:page      - Get page content
PUT    /api/page-content/:page      - Update page content
```

## 🎨 Frontend Updates

### Dynamic Content Loading
All pages now fetch data from the database instead of using static content:

- **Home Page** - Features, statistics, hero content from database
- **About Page** - Team members, mission, values from database
- **Contact Page** - Contact info, FAQs from database
- **All Pages** - SEO content, page titles from database

### Admin Interface
- Modern, responsive admin panels
- Real-time data updates
- Form validation and error handling
- Image upload support
- Drag-and-drop reordering
- Bulk operations

## 🔐 Security Features

### Admin Authentication
- JWT-based authentication
- Role-based access control (Super Admin, Admin, Moderator)
- Permission-based feature access
- Secure password hashing
- Session management

### Data Validation
- Server-side validation for all inputs
- Sanitization of user inputs
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers

## 📱 Responsive Design

All admin pages are fully responsive and work on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🚀 Deployment

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Set production environment variables
2. Build the client: `cd client && npm run build`
3. Start the server: `cd server && npm start`
4. Configure reverse proxy (nginx recommended)

## 🧪 Testing

### Run Tests
```bash
cd server
npm test
```

### Seed Database (Development)
```bash
cd server
npm run seed
```

## 📊 Database Schema

### Collections Overview:
- **admins** - Admin users and permissions
- **courses** - Course content and details
- **alumni** - Alumni profiles and achievements
- **projects** - Student projects and showcases
- **team** - Team members and instructors
- **features** - Website features and highlights
- **statistics** - Statistics and metrics
- **faqs** - Frequently asked questions
- **pagecontent** - Dynamic page content
- **contactinfo** - Contact information
- **sitesettings** - Global site configuration

## 🎯 Key Benefits

1. **Complete Control** - Admin can modify every aspect of the website
2. **No Static Content** - Everything is dynamic and database-driven
3. **Scalable** - Easy to add new content types and features
4. **User-Friendly** - Intuitive admin interface
5. **Secure** - Role-based access control and data validation
6. **Responsive** - Works on all devices
7. **SEO-Friendly** - Dynamic meta tags and content
8. **Performance** - Optimized database queries and caching

## 🔄 Content Management Workflow

1. **Login** to admin panel
2. **Navigate** to desired content section
3. **Create/Edit** content using forms
4. **Preview** changes in real-time
5. **Publish** content to live website
6. **Monitor** performance and engagement

## 📞 Support

For any issues or questions:
1. Check the console for error messages
2. Verify database connection
3. Ensure all environment variables are set
4. Check API endpoint responses
5. Review admin permissions

## 🎉 Success!

You now have a completely dynamic, database-driven website with full admin control over all content. Every piece of information can be modified through the admin interface without touching any code!
