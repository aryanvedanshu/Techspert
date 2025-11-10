import mongoose from 'mongoose'

const trainerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Trainer name is required'],
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
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
  },
  imageUrl: {
    type: String,
  },
  phone: {
    type: String,
    trim: true,
  },
  specialization: {
    type: [String],
    default: [],
  },
  experience: {
    type: Number,
    min: 0,
    default: 0,
  },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    website: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  totalStudents: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalCourses: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
})

// Indexes for better performance
trainerSchema.index({ email: 1 }, { unique: true }) // Unique index for email
trainerSchema.index({ isActive: 1 })
trainerSchema.index({ 'rating.average': -1 })

const Trainer = mongoose.model('Trainer', trainerSchema)

export default Trainer

