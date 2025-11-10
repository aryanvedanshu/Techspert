import mongoose from 'mongoose'
import logger from '../utils/logger.js'

const connectDB = async (retryCount = 0) => {
  const MAX_RETRIES = 5
  const RETRY_DELAY = 2000 // 2 seconds
  
  logger.functionEntry('connectDB', { retryCount, maxRetries: MAX_RETRIES })
  logger.info('Starting MongoDB connection process', {
    mongoUri: process.env.MONGO_URI ? 'configured' : 'missing',
    retryAttempt: retryCount + 1
  })
  
  try {
    logger.debug('Attempting to connect to MongoDB', {
      serverSelectionTimeout: '10s',
      socketTimeout: '45s',
      bufferCommands: false
    })
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
      bufferCommands: false, // Disable mongoose buffering - ensures direct DB access
    })

    logger.info('🍃 MongoDB Connected successfully', {
      host: conn.connection.host,
      name: conn.connection.name,
      readyState: conn.connection.readyState
    })
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`)
    
    // Handle connection events with logging
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', err, {
        errorName: err.name,
        errorMessage: err.message,
        readyState: mongoose.connection.readyState
      })
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected - attempting reconnection', {
        readyState: mongoose.connection.readyState,
        retryDelay: RETRY_DELAY
      })
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (mongoose.connection.readyState === 0) {
          logger.info('Attempting to reconnect to MongoDB', { retryCount: 0 })
          connectDB(0)
        }
      }, RETRY_DELAY)
    })

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully', {
        host: mongoose.connection.host,
        readyState: mongoose.connection.readyState
      })
    })

    // Log all database operations
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established', {
        host: mongoose.connection.host,
        name: mongoose.connection.name
      })
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.functionEntry('SIGINT handler - MongoDB shutdown')
      logger.info('SIGINT received, closing MongoDB connection')
      await mongoose.connection.close()
      logger.info('MongoDB connection closed through app termination')
      console.log('MongoDB connection closed through app termination')
      logger.functionExit('SIGINT handler - MongoDB shutdown')
      process.exit(0)
    })

    logger.functionExit('connectDB', { success: true, host: conn.connection.host })

  } catch (error) {
    logger.error('Error connecting to MongoDB', error, {
      errorMessage: error.message,
      errorName: error.name,
      retryCount,
      maxRetries: MAX_RETRIES
    })
    
    if (retryCount < MAX_RETRIES) {
      logger.warn(`Retrying connection in ${RETRY_DELAY}ms...`, {
        attempt: retryCount + 1,
        maxRetries: MAX_RETRIES
      })
      setTimeout(() => {
        connectDB(retryCount + 1)
      }, RETRY_DELAY)
    } else {
      logger.error('Max retry attempts reached. Exiting...', {
        retryCount,
        maxRetries: MAX_RETRIES
      })
      process.exit(1)
    }
  }
}

export { connectDB }