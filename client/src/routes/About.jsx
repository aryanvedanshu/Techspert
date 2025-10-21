import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Award, Code, Target, CheckCircle, Star, Linkedin, Github, Mail } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'

const About = () => {
  const [team, setTeam] = useState([])
  const [features, setFeatures] = useState([])
  const [statistics, setStatistics] = useState([])
  const [pageContent, setPageContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamResponse, featuresResponse, statisticsResponse, pageContentResponse] = await Promise.all([
          api.get('/team?featured=true'),
          api.get('/features?category=about'),
          api.get('/statistics?category=about'),
          api.get('/page-content/about')
        ])
        
        setTeam(teamResponse.data.data || [])
        setFeatures(featuresResponse.data.data || [])
        setStatistics(statisticsResponse.data.data || [])
        setPageContent(pageContentResponse.data.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        setTeam([])
        setFeatures([])
        setStatistics([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Dynamic icon mapping
  const getIconComponent = (iconName) => {
    const iconMap = {
      Users, Award, Code, Target, CheckCircle, Star, Linkedin, Github, Mail
    }
    return iconMap[iconName] || Users
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-neutral-50 to-primary-50 py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-neutral-900 mb-6">
              About <span className="gradient-text">Techspert</span>
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed mb-8">
              We're on a mission to democratize technology education and help people 
              around the world build successful careers in tech.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statistics.map((stat, index) => {
              const Icon = getIconComponent(stat.icon)
              return (
                <motion.div
                  key={stat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 mb-2">{stat.value}</div>
                  <div className="text-neutral-600">{stat.label}</div>
                  {stat.description && (
                    <div className="text-sm text-neutral-500 mt-1">{stat.description}</div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                At Techspert, we believe that everyone should have access to high-quality 
                technology education. Our mission is to bridge the gap between traditional 
                education and industry needs by providing practical, hands-on learning experiences.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                We're committed to helping our students not just learn new skills, but 
                apply them in real-world scenarios and build successful careers in technology.
              </p>
              <Button size="lg">
                Join Our Community
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-8 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target size={48} />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-2">Our Vision</h3>
                  <p className="text-white/80">Empowering the next generation of tech leaders</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
              {pageContent?.sections?.values?.title || 'Our Values'}
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {pageContent?.sections?.values?.subtitle || 'The principles that guide everything we do'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = getIconComponent(feature.icon)
              return (
                <motion.div
                  key={feature._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="text-center h-full">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
              {pageContent?.sections?.team?.title || 'Meet Our Team'}
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {pageContent?.sections?.team?.subtitle || 'The experts behind your learning journey'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
                    {member.name}
                  </h3>
                  <div className="text-primary-600 font-medium mb-4">
                    {member.role}
                  </div>
                  {member.department && (
                    <div className="text-neutral-500 text-sm mb-2">
                      {member.department}
                    </div>
                  )}
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  
                  {/* Social Links */}
                  <div className="flex justify-center gap-3">
                    {member.socialLinks?.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                      >
                        <Linkedin size={18} className="text-neutral-600 group-hover:text-primary-600" />
                      </a>
                    )}
                    {member.socialLinks?.github && (
                      <a
                        href={member.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                      >
                        <Github size={18} className="text-neutral-600 group-hover:text-primary-600" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                      >
                        <Mail size={18} className="text-neutral-600 group-hover:text-primary-600" />
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have transformed their careers with our courses
            </p>
            <Button variant="secondary" size="lg">
              Browse Courses
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About