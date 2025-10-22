import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, BookOpen, Code, Database, Users, Award, Info, Mail, LogIn } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Projects', href: '/projects', icon: Code },
    { name: 'Alumni', href: '/alumni', icon: Users },
    { name: 'Certificates', href: '/certificates', icon: Award },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Mail },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-heading font-bold gradient-text">Techspert</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Admin Access & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/login"
              className="hidden md:flex items-center space-x-1 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-xl transition-all duration-200"
            >
              <LogIn size={16} />
              <span>Admin</span>
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 transition-all duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-neutral-100"
            >
              <nav className="py-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                      }`}
                    >
                      {Icon && <Icon size={18} />}
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                <Link
                  to="/admin/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 transition-all duration-200"
                >
                  <LogIn size={18} />
                  <span>Admin Login</span>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header