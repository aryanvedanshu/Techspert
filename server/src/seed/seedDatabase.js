import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/db.js'
import demoData from './seedData.js'

// Import models
import Admin from '../models/Admin.js'
import Course from '../models/Course.js'
import Alumni from '../models/Alumni.js'
import Project from '../models/Project.js'
import Team from '../models/Team.js'
import Feature from '../models/Feature.js'
import Statistic from '../models/Statistic.js'
import FAQ from '../models/FAQ.js'
import PageContent from '../models/PageContent.js'
import ContactInfo from '../models/ContactInfo.js'
import SiteSettings from '../models/SiteSettings.js'
import Footer from '../models/Footer.js'
import Certificate from '../models/Certificate.js'

// Load environment variables
dotenv.config()

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Connect to database
    await connectDB()
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await Promise.all([
      Admin.deleteMany({}),
      Course.deleteMany({}),
      Alumni.deleteMany({}),
      Project.deleteMany({}),
      Team.deleteMany({}),
      Feature.deleteMany({}),
      Statistic.deleteMany({}),
      FAQ.deleteMany({}),
      PageContent.deleteMany({}),
      ContactInfo.deleteMany({}),
      SiteSettings.deleteMany({}),
    ])
    
    console.log('✅ Existing data cleared')
    
    // Seed Admins
    console.log('👨‍💼 Seeding admins...')
    const admins = []
    for (const adminData of demoData.admins) {
      const admin = new Admin(adminData)
      await admin.save()
      admins.push(admin)
    }
    console.log(`✅ Created ${admins.length} admins`)
    
    // Seed Courses
    console.log('📚 Seeding courses...')
    const courses = await Course.insertMany(demoData.courses)
    console.log(`✅ Created ${courses.length} courses`)
    
    // Seed Alumni
    console.log('👥 Seeding alumni...')
    const alumni = await Alumni.insertMany(demoData.alumni)
    console.log(`✅ Created ${alumni.length} alumni profiles`)
    
    // Seed Projects
    console.log('💻 Seeding projects...')
    const projects = await Project.insertMany(demoData.projects)
    console.log(`✅ Created ${projects.length} projects`)
    
    // Seed Team
    console.log('👨‍🏫 Seeding team members...')
    const team = await Team.insertMany(demoData.team)
    console.log(`✅ Created ${team.length} team members`)
    
    // Seed Features
    console.log('⭐ Seeding features...')
    const features = await Feature.insertMany(demoData.features)
    console.log(`✅ Created ${features.length} features`)
    
    // Seed Statistics
    console.log('📊 Seeding statistics...')
    const statistics = await Statistic.insertMany(demoData.statistics)
    console.log(`✅ Created ${statistics.length} statistics`)
    
    // Seed FAQs
    console.log('❓ Seeding FAQs...')
    const faqs = await FAQ.insertMany(demoData.faqs)
    console.log(`✅ Created ${faqs.length} FAQs`)
    
    // Seed Page Content
    console.log('📄 Seeding page content...')
    const pageContent = await PageContent.insertMany(demoData.pageContent)
    console.log(`✅ Created ${pageContent.length} page content entries`)
    
    // Seed Contact Info
    console.log('📞 Seeding contact info...')
    const contactInfo = await ContactInfo.insertMany(demoData.contactInfo)
    console.log(`✅ Created ${contactInfo.length} contact info entries`)
    
    // Seed Site Settings
    console.log('⚙️  Seeding site settings...')
    const siteSettings = await SiteSettings.create(demoData.siteSettings)
    console.log(`✅ Created site settings`)
    
  // Seed Footer
  console.log('🦶 Seeding footer...')
  const footer = await Footer.create(demoData.footer)
  console.log(`✅ Created footer configuration`)

  // Seed Certificates
  console.log('📜 Seeding certificates...')
  const certificates = await Certificate.insertMany(demoData.certificates)
  console.log(`✅ Created ${certificates.length} certificates`)
    
    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   👨‍💼 Admins: ${admins.length}`)
    console.log(`   📚 Courses: ${courses.length}`)
    console.log(`   👥 Alumni: ${alumni.length}`)
    console.log(`   💻 Projects: ${projects.length}`)
    console.log(`   👨‍🏫 Team Members: ${team.length}`)
    console.log(`   ⭐ Features: ${features.length}`)
    console.log(`   📊 Statistics: ${statistics.length}`)
    console.log(`   ❓ FAQs: ${faqs.length}`)
    console.log(`   📄 Page Content: ${pageContent.length}`)
    console.log(`   📞 Contact Info: ${contactInfo.length}`)
    console.log(`   ⚙️  Site Settings: 1`)
    console.log(`   🦶 Footer: 1`)
    console.log(`   📜 Certificates: ${certificates.length}`)
    
    console.log('\n🔑 Admin Login Credentials:')
    console.log('   Super Admin: admin@techspert.com / admin123456')
    console.log('   Manager: manager@techspert.com / manager123456')
    console.log('   Moderator: moderator@techspert.com / moderator123456')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
}

export default seedDatabase
