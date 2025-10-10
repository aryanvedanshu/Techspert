import { Link } from 'react-router-dom'
import { BookOpen, Code, Database, Users, Award, Info, Mail, Github, Twitter, Linkedin, Mail as MailIcon } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const navigation = {
    courses: [
      { name: 'AI Course', href: '/courses/ai' },
      { name: 'Data Science', href: '/courses/data-science' },
      { name: 'MERN Stack', href: '/courses/mern' },
    ],
    resources: [
      { name: 'Projects', href: '/projects' },
      { name: 'Certificates', href: '/certificates' },
      { name: 'Alumni', href: '/alumni' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Admin', href: '/admin/login' },
    ],
  }

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'Email', href: 'mailto:contact@techspert.com', icon: MailIcon },
  ]

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
                <span className="text-xl font-heading font-bold">Techspert</span>
              </Link>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Empowering the next generation of developers with cutting-edge technology courses and hands-on projects.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((item) => {
                  const Icon = item.icon
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
                {navigation.courses.map((item) => (
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
                {navigation.resources.map((item) => (
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
                {navigation.company.map((item) => (
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
              © {currentYear} Techspert. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-neutral-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-neutral-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-neutral-400 hover:text-white transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer