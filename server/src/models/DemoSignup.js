import mongoose from 'mongoose'

const demoSignupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      },
      message: 'Please provide a valid email address',
    },
  },
  phone: {
    type: String,
    trim: true,
  },
  courseInterest: {
    type: String,
    trim: true,
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'attended', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  contactedAt: {
    type: Date,
  },
  attendedAt: {
    type: Date,
  },
}, {
  timestamps: true,
})

// Indexes for better performance
demoSignupSchema.index({ email: 1 })
demoSignupSchema.index({ status: 1 })
demoSignupSchema.index({ createdAt: -1 })

const DemoSignup = mongoose.model('DemoSignup', demoSignupSchema)

export default DemoSignup

