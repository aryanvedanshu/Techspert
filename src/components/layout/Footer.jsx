import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Code, Database, Users, Award, Info, Mail, Github, Twitter, Linkedin, Mail as MailIcon } from 'lucide-react'
import { api } from '../../services/api'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [footerData, setFooterData] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // Get realtime settings from context
  const { settings: realtimeSettings } = useSiteSettings()

  // Default fallback data
  const defaultNavigation = {
    courses: [],
    resources: [
      { name: 'Projects', href: '/projects', isActive: true, order: 1 },
      { name: 'Certificates', href: '/certificates', isActive: true, order: 2 },
      { name: 'Alumni', href: '/alumni', isActive: true, order: 3 },
    ],
    company: [
      { name: 'About Us', href: '/about', isActive: true, order: 1 },
      { name: 'Contact', href: '/contact', isActive: true, order: 2 },
    ],
  }

  const defaultSocialLinks = [
    { name: 'GitHub', href: '#', icon: 'Github', isActive: true, order: 1 },
    { name: 'Twitter', href: '#', icon: 'Twitter', isActive: true, order: 2 },
    { name: 'LinkedIn', href: '#', icon: 'Linkedin', isActive: true, order: 3 },
    { name: 'Email', href: 'mailto:contact@techspert.com', icon: 'Mail', isActive: true, order: 4 },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [footerResponse, coursesResponse] = await Promise.all([
          api.get('/footer'),
          api.get('/courses?limit=5&isPublished=true')
        ])

        setFooterData(footerResponse.data.data)

        const coursesData = coursesResponse.data.data || []
        const transformedCourses = coursesData.map((course, index) => ({
          name: course.title,
          href: `/courses/${course.slug || course.id}`,
          isActive: course.isPublished,
          order: index + 1
        }))
        setCourses(transformedCourses)

      } catch (error) {
        console.error("Footer fetch error:", error)
        setFooterData({
          brand: {
            name: realtimeSettings?.siteName || 'Techspert',
            description: 'Empowering the next generation of developers with cutting-edge technology courses.',
          },
          navigation: defaultNavigation,
          socialLinks: defaultSocialLinks,
          legal: { copyright: 'Techspert. All rights reserved.', links: [] }
        })
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getIconComponent = (iconName) => {
    const iconMap = { Github, Twitter, Linkedin, Mail: MailIcon, BookOpen, Award, Info }
    return iconMap[iconName] || Info
  }

  const navigation = useMemo(() => ({
    ...(footerData?.navigation || defaultNavigation),
    courses: courses.length > 0 ? courses : (footerData?.navigation?.courses || defaultNavigation.courses)
  }), [footerData, courses])

  const socialLinks = useMemo(() => {
    const raw = footerData?.socialLinks || defaultSocialLinks
    if (!raw) return defaultSocialLinks
    if (Array.isArray(raw)) return raw
    if (typeof raw === 'object') {
      return Object.entries(raw)
        .filter(([k, v]) => v && typeof v === 'string')
        .map(([k, v], i) => ({
          name: k.charAt(0).toUpperCase() + k.slice(1),
          href: v,
          icon: { github: 'Github', twitter: 'Twitter', linkedin: 'Linkedin' }[k.toLowerCase()] || 'Info',
          isActive: true, order: i + 1
        }))
    }
    return defaultSocialLinks
  }, [footerData])

  const safeSocialLinks = Array.isArray(socialLinks) ? socialLinks : defaultSocialLinks
  const brand = footerData?.brand || { name: realtimeSettings?.siteName || 'Techspert', description: 'Empowering developers.' }
  const legal = footerData?.legal || { copyright: 'Techspert. All rights reserved.', links: [] }

  if (loading) {
    return (
      <footer className="bg-neutral-900 text-white">
        <div className="container-custom py-16">
          <div className="text-center animate-pulse">
            <div className="h-4 bg-neutral-700 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-3 bg-neutral-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container-custom">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-heading font-bold">{brand.name}</span>
              </Link>

              <p className="text-neutral-400 mb-6 leading-relaxed">{brand.description}</p>
              <div className="flex space-x-4">
                {safeSocialLinks.filter(i => i?.isActive).map((item) => {
                  const Icon = getIconComponent(item.icon)
                  return (
                    <a key={item.name} href={item.href} className="w-10 h-10 bg-neutral-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all">
                      <Icon size={18} className="text-neutral-400 group-hover:text-white" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Courses */}
            <div>
              <h3 className="text-lg font-heading font-semibold mb-6 flex items-center">
                <BookOpen size={20} className="mr-2 text-primary-400" />Courses
              </h3>
              <ul className="space-y-3">
                {navigation.courses.filter(i => i.isActive).map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-neutral-400 hover:text-white transition-colors">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-heading font-semibold mb-6 flex items-center">
                <Award size={20} className="mr-2 text-primary-400" />Resources
              </h3>
              <ul className="space-y-3">
                {navigation.resources.filter(i => i.isActive).map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-neutral-400 hover:text-white transition-colors">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-heading font-semibold mb-6 flex items-center">
                <Info size={20} className="mr-2 text-primary-400" />Company
              </h3>
              <ul className="space-y-3">
                {navigation.company.filter(i => i.isActive).map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-neutral-400 hover:text-white transition-colors">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-neutral-400 text-sm">© {currentYear} {legal.copyright}</p>
            <div className="flex space-x-6 text-sm">
              {(legal.links || []).filter(l => l.isActive).map((link) => (
                <Link key={link.name} to={link.href} className="text-neutral-400 hover:text-white transition-colors">{link.name}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer