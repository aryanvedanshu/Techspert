import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './routes/Home'
import Courses from './routes/Courses'
import CourseDetail from './routes/CourseDetail'
import Projects from './routes/Projects'
import Certificates from './routes/Certificates'
import Alumni from './routes/Alumni'
import About from './routes/About'
import Contact from './routes/Contact'
import AdminLogin from './routes/Admin/AdminLogin'
import AdminDashboard from './routes/Admin/AdminDashboard'
import AdminCourses from './routes/Admin/AdminCourses'
import AdminProjects from './routes/Admin/AdminProjects'
import AdminAlumni from './routes/Admin/AdminAlumni'
import AdminSettings from './routes/Admin/AdminSettings'
import AdminTeam from './routes/Admin/AdminTeam'
import AdminFeatures from './routes/Admin/AdminFeatures'
import AdminStatistics from './routes/Admin/AdminStatistics'
import AdminFAQs from './routes/Admin/AdminFAQs'
import AdminContactInfo from './routes/Admin/AdminContactInfo'
import AdminAnalytics from './routes/Admin/AdminAnalytics'
import AdminUserManagement from './routes/Admin/AdminUserManagement'
import AdminContentManagement from './routes/Admin/AdminContentManagement'

function App() {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/alumni" element={<Alumni />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/alumni" element={<AdminAlumni />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/team" element={<AdminTeam />} />
              <Route path="/admin/features" element={<AdminFeatures />} />
              <Route path="/admin/statistics" element={<AdminStatistics />} />
              <Route path="/admin/faqs" element={<AdminFAQs />} />
              <Route path="/admin/contact-info" element={<AdminContactInfo />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/content" element={<AdminContentManagement />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster 
          position="top-right" 
          expand={true}
          richColors={true}
          closeButton={true}
        />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App