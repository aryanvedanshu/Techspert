import mongoose from 'mongoose'

const connectDB = async (retryCount = 0) => {
  const MAX_RETRIES = 5
  const RETRY_DELAY = 2000 // 2 seconds
  
  console.log("[TS-LOG][DB] Starting MongoDB connection process")
  console.log("[TS-LOG][DB] MongoDB URI:", process.env.MONGO_URI ? "Set" : "Not set")
  console.log("[TS-LOG][DB] Retry attempt:", retryCount + 1)
  
  try {
    console.log("[TS-LOG][DB] Attempting to connect to MongoDB")
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
      bufferCommands: false, // Disable mongoose buffering
    })

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`)
    console.log("[TS-LOG][DB] MongoDB connection successful - Host:", conn.connection.host)
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error("[TS-LOG][ERROR] MongoDB connection error:", err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log("[TS-LOG][DB] MongoDB disconnected - attempting reconnection")
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (mongoose.connection.readyState === 0) {
          console.log("[TS-LOG][DB] Attempting to reconnect to MongoDB")
          connectDB(0)
        }
      }, RETRY_DELAY)
    })

    mongoose.connection.on('reconnected', () => {
      console.log("[TS-LOG][DB] MongoDB reconnected successfully")
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log("[TS-LOG][SHUTDOWN] SIGINT received, closing MongoDB connection")
      await mongoose.connection.close()
      console.log('MongoDB connection closed through app termination')
      process.exit(0)
    })

  } catch (error) {
    console.error("[TS-LOG][ERROR] Error connecting to MongoDB:", error.message)
    console.error("[TS-LOG][ERROR] Full error:", error)
    
    if (retryCount < MAX_RETRIES) {
      console.log(`[TS-LOG][DB] Retrying connection in ${RETRY_DELAY}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`)
      setTimeout(() => {
        connectDB(retryCount + 1)
      }, RETRY_DELAY)
    } else {
      console.error("[TS-LOG][ERROR] Max retry attempts reached. Exiting...")
      process.exit(1)
    }
  }
}

export { connectDB }