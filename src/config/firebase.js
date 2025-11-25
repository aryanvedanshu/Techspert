import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'
import logger from '../utils/logger'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

logger.functionEntry('firebase initialization')
logger.info('Loading Firebase configuration from environment variables', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  projectId: firebaseConfig.projectId || 'NOT SET',
  authDomain: firebaseConfig.authDomain || 'NOT SET'
})

// Validate Firebase configuration
const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
]

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key])

if (missingKeys.length > 0) {
  // Log what we actually received for debugging
  const receivedValues = requiredConfigKeys.map(key => ({
    key,
    value: firebaseConfig[key] ? `${firebaseConfig[key].substring(0, 10)}...` : 'undefined',
    envVar: `VITE_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1').slice(1)}`
  }))
  
  logger.error('Missing Firebase configuration keys', new Error('Firebase config incomplete'), {
    missing: missingKeys,
    receivedValues,
    message: 'Please check your .env file in the client/ directory and ensure all Firebase configuration variables are set. Make sure to restart the dev server after adding environment variables.',
    help: 'The .env file must be in the client/ directory (not the root). Restart the dev server with: npm run dev'
  })
  
  console.error('❌ Firebase Configuration Error')
  console.error('Missing keys:', missingKeys)
  console.error('Received values:', receivedValues)
  console.error('💡 Make sure:')
  console.error('   1. The .env file is in the client/ directory')
  console.error('   2. All variables start with VITE_')
  console.error('   3. You have restarted the dev server (npm run dev)')
  
  throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}. Check console for details.`)
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  logger.info('Firebase app initialized successfully', {
    projectId: firebaseConfig.projectId
  })
} catch (error) {
  logger.error('Firebase initialization error', error, {
    errorMessage: error.message,
    errorStack: error.stack
  })
  throw error
}

// Initialize Firebase services
let auth, db, storage, analytics

try {
  auth = getAuth(app)
  logger.info('Firebase Auth initialized')
} catch (error) {
  logger.error('Firebase Auth initialization error', error)
  throw error
}

try {
  db = getFirestore(app)
  logger.info('Firestore initialized')
} catch (error) {
  logger.error('Firestore initialization error', error)
  throw error
}

try {
  storage = getStorage(app)
  logger.info('Firebase Storage initialized')
} catch (error) {
  logger.error('Firebase Storage initialization error', error)
  throw error
}

// Initialize Analytics only if measurementId is provided
if (firebaseConfig.measurementId && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  try {
    analytics = getAnalytics(app)
    logger.info('Firebase Analytics initialized')
  } catch (error) {
    logger.warn('Firebase Analytics initialization error (non-critical)', error)
  }
}

logger.functionExit('firebase initialization', { success: true })

export { app, auth, db, storage, analytics }
export default app

