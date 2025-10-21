import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Code, Database, Users, Award, Info, Mail, Github, Twitter, Linkedin, Mail as MailIcon } from 'lucide-react'
import { api } from '../../services/api'

const Footer = () => {
  console.log("[DEBUG: Footer.jsx:component:7] Footer component initializing")
  
  const currentYear = new Date().getFullYear()
  const [footerData, setFooterData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Default fallback data
  const defaultNavigation = {
    courses: [
      { name: 'AI Course', href: '/courses/ai', isActive: true, order: 1 },
      { name: 'Data Science', href: '/courses/data-science', isActive: true, order: 2 },
      { name: 'MERN Stack', href: '/courses/mern', isActive: true, order: 3 },
    ],
    resources: [
      { name: 'Projects', href: '/projects', isActive: true, order: 1 },
      { name: 'Certificates', href: '/certificates', isActive: true, order: 2 },
      { name: 'Alumni', href: '/alumni', isActive: true, order: 3 },
    ],
    company: [
      { name: 'About Us', href: '/about', isActive: true, order: 1 },
      { name: 'Contact', href: '/contact', isActive: true, order: 2 },
      { name: 'Admin', href: '/admin/login', isActive: true, order: 3 },
    ],
  }

  const defaultSocialLinks = [
    { name: 'GitHub', href: '#', icon: 'Github', isActive: true, order: 1 },
    { name: 'Twitter', href: '#', icon: 'Twitter', isActive: true, order: 2 },
    { name: 'LinkedIn', href: '#', icon: 'Linkedin', isActive: true, order: 3 },
    { name: 'Email', href: 'mailto:contact@techspert.com', icon: 'Mail', isActive: true, order: 4 },
  ]

  useEffect(() => {
    console.log("[DEBUG: Footer.jsx:useEffect:35] Fetching footer data")
    const fetchFooterData = async () => {
      try {
        const response = await api.get('/footer')
        console.log("[DEBUG: Footer.jsx:fetchFooterData:success:38] Footer data fetched successfully")
        setFooterData(response.data.data)
      } catch (error) {
        console.error("[DEBUG: Footer.jsx:fetchFooterData:error:40] Error fetching footer data:", error)
        // Use default data on error
        setFooterData({
          brand: {
            name: 'Techspert',
            description: 'Empowering the next generation of developers with cutting-edge technology courses and hands-on projects.',
            logo: '/images/logo.png'
          },
          navigation: defaultNavigation,
          socialLinks: defaultSocialLinks,
          legal: {
            copyright: 'Techspert. All rights reserved.',
            links: [
              { name: 'Privacy Policy', href: '/privacy', isActive: true, order: 1 },
              { name: 'Terms of Service', href: '/terms', isActive: true, order: 2 },
              { name: 'Cookie Policy', href: '/cookies', isActive: true, order: 3 }
            ]
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  // Icon mapping for dynamic icons
  const getIconComponent = (iconName) => {
    const iconMap = {
      Github, Twitter, Linkedin, Mail: MailIcon, BookOpen, Award, Info
    }
    return iconMap[iconName] || Info
  }

  if (loading) {
    console.log("[DEBUG: Footer.jsx:render:loading:65] Footer loading state")
    return (
      <footer className="bg-neutral-900 text-white">
        <div className="container-custom">
          <div className="py-16">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-700 rounded w-1/4 mx-auto mb-4"></div>
                <div className="h-3 bg-neutral-700 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  const navigation = footerData?.navigation || defaultNavigation
  const socialLinks = footerData?.socialLinks || defaultSocialLinks
  const brand = footerData?.brand || { name: 'Techspert', description: 'Empowering the next generation of developers with cutting-edge technology courses and hands-on projects.' }
  const legal = footerData?.legal || { copyright: 'Techspert. All rights reserved.', links: [] }

  console.log("[DEBUG: Footer.jsx:render:85] Footer rendering with data:", { navigation, socialLinks, brand, legal })

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container-custom">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-heading font-bold">{brand.name}</span>
              </Link>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                {brand.description}
              </p>
              <div className="flex space-x-4">
                {socialLinks
                  .filter(item => item.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const Icon = getIconComponent(item.icon)
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-200 group"
                        aria-label={item.name}
                      >
                        <Icon size={18} className="text-neutral-400 group-hover:text-white transition-colors duration-200" />
                      </a>
                    )
                  })}
              </div>
            </div>

            {/* Courses */}
            <div>
              <h3 className="text-lg font-heading font-semibold mb-6 flex items-center">
                <BookOpen size={20} className="mr-2 text-primary-400" />
                Courses
              </h3>
              <ul className="space-y-3">
                {navigation.courses
                  .filter(item => item.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-neutral-400 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-heading font-semibold mb-6 flex items-center">
                <Award size={20} className="mr-2 text-primary-400" />
                Resources
              </h3>
              <ul className="space-y-3">
                {navigation.resources
                  .filter(item => item.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-neutral-400 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-heading font-semibold mb-6 flex items-center">
                <Info size={20} className="mr-2 text-primary-400" />
                Company
              </h3>
              <ul className="space-y-3">
                {navigation.company
                  .filter(item => item.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-neutral-400 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-neutral-400 text-sm">
              © {currentYear} {legal.copyright}
            </p>
            <div className="flex space-x-6 text-sm">
              {legal.links
                .filter(link => link.isActive)
                .sort((a, b) => a.order - b.order)
                .map((link) => (
                  <Link 
                    key={link.name}
                    to={link.href} 
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer