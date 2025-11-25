/**
 * Quick script to verify Firebase environment variables are loaded correctly
 * Run with: node verify-env.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
  const envPath = join(__dirname, '.env')
  const envContent = readFileSync(envPath, 'utf-8')
  
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ]
  
  console.log('✅ .env file found at:', envPath)
  console.log('\n📋 Checking required variables:\n')
  
  const missing = []
  const found = []
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm')
    const match = envContent.match(regex)
    
    if (match && match[1] && match[1].trim() !== '') {
      const value = match[1].trim()
      const preview = value.length > 20 ? value.substring(0, 20) + '...' : value
      console.log(`  ✅ ${varName}: ${preview}`)
      found.push(varName)
    } else {
      console.log(`  ❌ ${varName}: NOT FOUND or EMPTY`)
      missing.push(varName)
    }
  })
  
  console.log('\n📊 Summary:')
  console.log(`  Found: ${found.length}/${requiredVars.length}`)
  console.log(`  Missing: ${missing.length}/${requiredVars.length}`)
  
  if (missing.length > 0) {
    console.log('\n❌ Missing variables:')
    missing.forEach(v => console.log(`   - ${v}`))
    console.log('\n💡 Make sure all variables are set in client/.env')
    process.exit(1)
  } else {
    console.log('\n✅ All required variables are set!')
    console.log('\n⚠️  Remember to restart the dev server after updating .env:')
    console.log('   npm run dev')
    process.exit(0)
  }
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('❌ .env file not found!')
    console.error('   Expected location: client/.env')
    console.error('\n💡 Create the file by copying env.example:')
    console.error('   cp env.example .env')
    console.error('   Then add your Firebase configuration values')
  } else {
    console.error('❌ Error reading .env file:', error.message)
  }
  process.exit(1)
}

