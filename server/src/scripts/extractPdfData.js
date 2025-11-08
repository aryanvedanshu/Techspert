import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import axios from 'axios'

const require = createRequire(import.meta.url)
// pdf-parse can be called as a function directly
const pdfParse = require('pdf-parse')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Teacher LinkedIn mappings
const TEACHER_MAPPINGS = {
  'flutter': {
    linkedin: 'https://www.linkedin.com/in/mohan-naudiyal-151637256/',
    name: 'Mohan Naudiyal',
  },
  'mern': {
    linkedin: 'https://www.linkedin.com/in/mayank-aggarwal-59427630b/',
    name: 'Mayank Aggarwal',
  },
  'ai': {
    linkedin: 'https://www.linkedin.com/in/aryan-goel/',
    name: 'Aryan Goel',
  },
  'ml': {
    linkedin: 'https://www.linkedin.com/in/aryan-goel/',
    name: 'Aryan Goel',
  },
}

// Function to extract text from PDF
async function extractPdfText(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath)
    // pdf-parse can be called as a function that returns a promise
    const data = await pdfParse(dataBuffer)
    return data.text
  } catch (error) {
    console.error('Error reading PDF:', error)
    throw error
  }
}

// Function to download image and save locally
async function downloadImage(url, savePath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    await fs.ensureDir(path.dirname(savePath))
    await fs.writeFile(savePath, response.data)
    console.log(`[TS-LOG] Image saved: ${savePath}`)
    return `/images/${path.basename(savePath)}`
  } catch (error) {
    console.error(`[TS-LOG][ERROR] Failed to download image from ${url}:`, error.message)
    // Return a placeholder path
    return '/images/placeholder.png'
  }
}

// Function to fetch LinkedIn profile data (public info)
async function fetchLinkedInData(linkedinUrl) {
  try {
    // Note: LinkedIn doesn't allow direct scraping without authentication
    // This is a placeholder - you'll need to manually provide the data
    // or use LinkedIn API with proper authentication
    console.log(`[TS-LOG] Fetching LinkedIn data from: ${linkedinUrl}`)
    
    // For now, return a structure that can be manually filled
    return {
      name: '',
      bio: '',
      imageUrl: '',
      linkedin: linkedinUrl,
    }
  } catch (error) {
    console.error(`[TS-LOG][ERROR] Failed to fetch LinkedIn data:`, error.message)
    return {
      name: '',
      bio: '',
      imageUrl: '',
      linkedin: linkedinUrl,
    }
  }
}

// Function to parse course data from PDF text
function parseCourseData(pdfText) {
  const courses = []
  
  // This is a template - you'll need to adjust based on actual PDF structure
  // Common patterns to look for:
  // - Course titles (usually in headings)
  // - Descriptions (paragraphs after titles)
  // - Pricing information
  // - Duration information
  // - Syllabus/modules
  
  // Split text into lines for processing
  const lines = pdfText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // Example parsing logic (adjust based on your PDF structure)
  let currentCourse = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Detect course title (usually all caps or has specific keywords)
    if (line.match(/^(FLUTTER|MERN|AI|ML|ARTIFICIAL INTELLIGENCE|MACHINE LEARNING)/i)) {
      if (currentCourse) {
        courses.push(currentCourse)
      }
      currentCourse = {
        title: line,
        description: '',
        shortDescription: '',
        price: 0,
        originalPrice: 0,
        duration: '',
        level: 'intermediate',
        tags: [],
        syllabus: [],
        whatYouWillLearn: [],
        requirements: [],
        thumbnailUrl: '',
      }
    }
    
    // Add more parsing logic based on PDF structure
    if (currentCourse) {
      // Parse description
      if (line.length > 50 && !currentCourse.description) {
        currentCourse.description = line
        currentCourse.shortDescription = line.substring(0, 200)
      }
      
      // Parse price
      const priceMatch = line.match(/₹?(\d+[,\d]*)/)
      if (priceMatch && !currentCourse.price) {
        currentCourse.price = parseInt(priceMatch[1].replace(/,/g, ''))
      }
      
      // Parse duration
      const durationMatch = line.match(/(\d+)\s*(weeks?|months?|hours?|days?)/i)
      if (durationMatch) {
        currentCourse.duration = line
      }
    }
  }
  
  if (currentCourse) {
    courses.push(currentCourse)
  }
  
  return courses
}

// Main extraction function
async function extractCourseData() {
  try {
    console.log('[TS-LOG] Starting PDF data extraction...')
    
    // Path to PDF file
    const pdfPath = path.join(__dirname, '../../../Perfect.pdf')
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at: ${pdfPath}`)
    }
    
    // Extract text from PDF
    console.log('[TS-LOG] Reading PDF file...')
    const pdfText = await extractPdfText(pdfPath)
    
    // Save extracted text for review
    const outputDir = path.join(__dirname, '../../../logs')
    await fs.ensureDir(outputDir)
    await fs.writeFile(path.join(outputDir, 'extracted_pdf_text.txt'), pdfText)
    console.log('[TS-LOG] PDF text extracted and saved to logs/extracted_pdf_text.txt')
    
    // Parse course data
    console.log('[TS-LOG] Parsing course data from PDF...')
    const courses = parseCourseData(pdfText)
    
    console.log(`[TS-LOG] Found ${courses.length} courses in PDF`)
    
    // Map courses to teachers
    const coursesWithTeachers = courses.map((course, index) => {
      const titleLower = course.title.toLowerCase()
      let teacherKey = null
      
      if (titleLower.includes('flutter')) {
        teacherKey = 'flutter'
      } else if (titleLower.includes('mern')) {
        teacherKey = 'mern'
      } else if (titleLower.includes('ai') || titleLower.includes('artificial intelligence')) {
        teacherKey = 'ai'
      } else if (titleLower.includes('ml') || titleLower.includes('machine learning')) {
        teacherKey = 'ml'
      }
      
      if (teacherKey && TEACHER_MAPPINGS[teacherKey]) {
        course.instructor = {
          name: TEACHER_MAPPINGS[teacherKey].name,
          linkedin: TEACHER_MAPPINGS[teacherKey].linkedin,
        }
      }
      
      return course
    })
    
    // Save parsed data
    await fs.writeFile(
      path.join(outputDir, 'parsed_courses.json'),
      JSON.stringify(coursesWithTeachers, null, 2)
    )
    
    console.log('[TS-LOG] Course data parsed and saved to logs/parsed_courses.json')
    console.log('[TS-LOG] Please review the extracted data and update manually if needed')
    
    return coursesWithTeachers
  } catch (error) {
    console.error('[TS-LOG][ERROR] Error extracting course data:', error)
    throw error
  }
}

// Export for use in other scripts
export { extractCourseData, downloadImage, fetchLinkedInData }

// Run if called directly
if (import.meta.url === `file://${path.resolve(process.argv[1])}` || process.argv[1]?.includes('extractPdfData.js')) {
  extractCourseData()
    .then(() => {
      console.log('[TS-LOG] Extraction complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[TS-LOG][ERROR] Extraction failed:', error)
      process.exit(1)
    })
}

