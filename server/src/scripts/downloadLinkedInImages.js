import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// LinkedIn profile URLs and their corresponding file names
const INSTRUCTOR_IMAGES = [
  {
    name: 'Mohan Naudiyal',
    linkedin: 'https://www.linkedin.com/in/mohan-naudiyal-151637256/',
    filename: 'flutter.jpg',
  },
  {
    name: 'Mayank Aggarwal',
    linkedin: 'https://www.linkedin.com/in/mayank-aggarwal-59427630b/',
    filename: 'mern.jpg',
  },
  {
    name: 'Aryan Goel',
    linkedin: 'https://www.linkedin.com/in/aryan-goel/',
    filename: 'ai_ml.jpg', // For AI/ML course
  },
  {
    name: 'Aryan Goel',
    linkedin: 'https://www.linkedin.com/in/aryan-goel/',
    filename: 'data_science.jpg', // For Data Science course
  },
]

// Note: LinkedIn profile images require authentication to download directly
// This script provides instructions for manual download
// Alternative: Use a service like LinkedIn API or manually download from profiles

async function downloadInstructorImages() {
  console.log('[TS-LOG] ========================================')
  console.log('[TS-LOG] LinkedIn Image Download Instructions')
  console.log('[TS-LOG] ========================================')
  console.log('')
  console.log('⚠️  LinkedIn profile images cannot be downloaded automatically')
  console.log('   due to authentication requirements.')
  console.log('')
  console.log('📋 Manual Download Instructions:')
  console.log('')
  
  const imagesDir = path.join(__dirname, '../../../server/client/public/images/instructors')
  await fs.ensureDir(imagesDir)
  
  for (const instructor of INSTRUCTOR_IMAGES) {
    console.log(`1. Visit: ${instructor.linkedin}`)
    console.log(`2. Right-click on the profile picture`)
    console.log(`3. Save image as: ${instructor.filename}`)
    console.log(`4. Place it in: ${imagesDir}`)
    console.log('')
  }
  
  console.log('📁 Target directory:')
  console.log(`   ${imagesDir}`)
  console.log('')
  console.log('✅ Once images are downloaded, they will be automatically')
  console.log('   used by the courses.')
  console.log('')
  console.log('[TS-LOG] ========================================')
}

downloadInstructorImages()

