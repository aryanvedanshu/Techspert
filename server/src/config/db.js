import mongoose from 'mongoose'

const connectDB = async () => {
  console.log("[TS-LOG][DB] Starting MongoDB connection process")
  console.log("[TS-LOG][DB] MongoDB URI:", process.env.MONGO_URI ? "Set" : "Not set")
  
  try {
    console.log("[TS-LOG][DB] Attempting to connect to MongoDB")
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`)
    console.log("[TS-LOG][DB] MongoDB connection successful - Host:", conn.connection.host)
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error("[TS-LOG][ERROR] MongoDB connection error:", err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log("[TS-LOG][DB] MongoDB disconnected")
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
    process.exit(1)
  }
}

export { connectDB }