import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Award, Code, Target, CheckCircle, Star, Linkedin, Github, Mail, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'

const About = () => {
  console.log("[DEBUG: About.jsx:component:8] About component initializing")
  
  const [team, setTeam] = useState([])
  const [features, setFeatures] = useState([])
  const [statistics, setStatistics] = useState([])
  const [pageContent, setPageContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("[DEBUG: About.jsx:useEffect:16] Fetching about page data")
    const fetchData = async () => {
      try {
        console.log("[DEBUG: About.jsx:fetchData:start:18] Starting parallel API calls")
        const [teamResponse, featuresResponse, statisticsResponse, pageContentResponse] = await Promise.all([
          api.get('/team?featured=true'),
          api.get('/features?category=about'),
          api.get('/statistics?category=about'),
          api.get('/page-content/about')
        ])
        
        console.log("[DEBUG: About.jsx:fetchData:success:25] All API calls completed successfully")
        console.log("[DEBUG: About.jsx:fetchData:data:26] Data received:", {
          team: teamResponse.data.data?.length || 0,
          features: featuresResponse.data.data?.length || 0,
          statistics: statisticsResponse.data.data?.length || 0,
          pageContent: !!pageContentResponse.data.data
        })
        
        setTeam(teamResponse.data.data || [])
        setFeatures(featuresResponse.data.data || [])
        setStatistics(statisticsResponse.data.data || [])
        setPageContent(pageContentResponse.data.data)
        setError(null)
      } catch (error) {
        console.error("[DEBUG: About.jsx:fetchData:error:35] Error fetching data:", error)
        setError('Failed to load page content. Please try again later.')
        setTeam([])
        setFeatures([])
        setStatistics([])
        setPageContent(null)
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

  // Loading state
  if (loading) {
    console.log("[DEBUG: About.jsx:render:loading:65] Rendering loading state")
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
            Loading About Page
          </h2>
          <p className="text-neutral-600">
            Please wait while we fetch the latest information...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    console.log("[DEBUG: About.jsx:render:error:80] Rendering error state")
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-neutral-600 mb-6">
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  console.log("[DEBUG: About.jsx:render:main:98] Rendering main content with data:", {
    team: team.length,
    features: features.length,
    statistics: statistics.length,
    pageContent: !!pageContent
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-neutral-50 to-primary-50 py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-neutral-900 mb-6">
              About <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Techspert</span>
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed mb-8 max-w-3xl mx-auto">
              {pageContent?.hero?.description || "We're on a mission to democratize technology education and help people around the world build successful careers in tech."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Explore Our Courses
              </Button>
              <Button variant="outline" size="lg">
                Meet Our Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Numbers that reflect our commitment to quality education
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statistics.length > 0 ? (
              statistics.map((stat, index) => {
                const Icon = getIconComponent(stat.icon)
                return (
                  <motion.div
                    key={stat._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.color || 'from-primary-500 to-secondary-500'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="text-3xl font-bold text-neutral-900 mb-2">{stat.value}</div>
                    <div className="text-neutral-600 font-medium">{stat.label}</div>
                    {stat.description && (
                      <div className="text-sm text-neutral-500 mt-2">{stat.description}</div>
                    )}
                  </motion.div>
                )
              })
            ) : (
              // Fallback stats when no data is available
              [
                { value: "5000+", label: "Students", icon: "Users", color: "from-primary-500 to-secondary-500" },
                { value: "50+", label: "Courses", icon: "Award", color: "from-green-500 to-emerald-500" },
                { value: "95%", label: "Success Rate", icon: "CheckCircle", color: "from-blue-500 to-cyan-500" },
                { value: "24/7", label: "Support", icon: "Star", color: "from-purple-500 to-pink-500" }
              ].map((stat, index) => {
                const Icon = getIconComponent(stat.icon)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="text-3xl font-bold text-neutral-900 mb-2">{stat.value}</div>
                    <div className="text-neutral-600 font-medium">{stat.label}</div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-6">
                {pageContent?.mission?.title || 'Our Mission'}
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                {pageContent?.mission?.description || "At Techspert, we believe that everyone should have access to high-quality technology education. Our mission is to bridge the gap between traditional education and industry needs by providing practical, hands-on learning experiences."}
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                {pageContent?.mission?.subdescription || "We're committed to helping our students not just learn new skills, but apply them in real-world scenarios and build successful careers in technology."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg">
                  Join Our Community
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-8 flex items-center justify-center shadow-2xl">
                <div className="text-white text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target size={48} />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3">
                    {pageContent?.vision?.title || 'Our Vision'}
                  </h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    {pageContent?.vision?.description || 'Empowering the next generation of tech leaders'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
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
            {features.length > 0 ? (
              features.map((feature, index) => {
                const Icon = getIconComponent(feature.icon)
                return (
                  <motion.div
                    key={feature._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card hover className="text-center h-full">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color || 'from-primary-500 to-secondary-500'} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
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
              })
            ) : (
              // Fallback values when no data is available
              [
                { title: "Excellence", description: "We strive for the highest quality in everything we do, from course content to student support.", icon: "Award", color: "from-primary-500 to-secondary-500" },
                { title: "Innovation", description: "We embrace new technologies and teaching methods to stay at the forefront of education.", icon: "Code", color: "from-green-500 to-emerald-500" },
                { title: "Community", description: "We foster a supportive learning environment where students can grow and succeed together.", icon: "Users", color: "from-blue-500 to-cyan-500" },
                { title: "Accessibility", description: "We believe quality education should be accessible to everyone, regardless of background.", icon: "CheckCircle", color: "from-purple-500 to-pink-500" }
              ].map((value, index) => {
                const Icon = getIconComponent(value.icon)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card hover className="text-center h-full">
                      <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-4">
                        {value.title}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {value.description}
                      </p>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-neutral-50">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.length > 0 ? (
              team.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="text-center h-full">
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
                    <p className="text-neutral-600 leading-relaxed mb-6">
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
              ))
            ) : (
              // No team data available from database - show message
              <div className="col-span-full text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <Users size={48} className="mx-auto mb-4" />
                  <p className="text-lg font-medium text-neutral-600">No team members found</p>
                  <p className="text-sm text-neutral-500 mt-2">Team members will appear here once they are added via the admin panel.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
              {pageContent?.cta?.title || 'Ready to Start Your Journey?'}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              {pageContent?.cta?.description || 'Join thousands of students who have transformed their careers with our comprehensive technology courses'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Browse Courses
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About