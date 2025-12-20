import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext'
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
import Terms from './routes/Terms'
import Privacy from './routes/Privacy'
import RefundPolicy from './routes/RefundPolicy'
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
import AdminTrainerManagement from './routes/Admin/AdminTrainerManagement'
import AdminAdminManagement from './routes/Admin/AdminAdminManagement'
import AdminMessagingCenter from './routes/Admin/AdminMessagingCenter'
import AdminPageManagement from './routes/Admin/AdminPageManagement'
import AdminSetup from './routes/Admin/AdminSetup'
import PageTemplate from './routes/PageTemplate'
import AdminDemoClassManagement from './routes/Admin/AdminDemoClassManagement'
import AdminEnquiriesManagement from './routes/Admin/AdminEnquiriesManagement'
import AdminLeadsOverview from './routes/Admin/AdminLeadsOverview'
import AdminLinkManagement from './routes/Admin/AdminLinkManagement'
import AdminLeadsDashboard from './routes/Admin/AdminLeadsDashboard'
import PaymentSuccess from './routes/PaymentSuccess'
import PaymentFailed from './routes/PaymentFailed'
import AdminRazorpayReadiness from './routes/Admin/AdminRazorpayReadiness'

function App() {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SiteSettingsProvider>
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
                  <Route path="/admin/setup" element={<AdminSetup />} />
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
                  <Route path="/admin/trainers" element={<AdminTrainerManagement />} />
                  <Route path="/admin/admins" element={<AdminAdminManagement />} />
                  <Route path="/admin/messaging" element={<AdminMessagingCenter />} />
                  <Route path="/admin/pages" element={<AdminPageManagement />} />
                  <Route path="/admin/demo-class" element={<AdminDemoClassManagement />} />
                  <Route path="/admin/enquiries" element={<AdminEnquiriesManagement />} />
                  <Route path="/admin/leads" element={<AdminLeadsOverview />} />
                  <Route path="/admin/link-management" element={<AdminLinkManagement />} />
                  <Route path="/admin/leads-dashboard" element={<AdminLeadsDashboard />} />
                  <Route path="/admin/razorpay-readiness" element={<AdminRazorpayReadiness />} />

                  {/* Payment Routes */}
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/failed" element={<PaymentFailed />} />

                  {/* Legal Pages - Static Routes */}
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />

                  {/* Dynamic Page Route - Must be last */}
                  <Route path="/:slug" element={<PageTemplate />} />
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
        </SiteSettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App