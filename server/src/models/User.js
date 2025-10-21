import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      },
      message: 'Please provide a valid email address',
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student',
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters'],
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v)
      },
      message: 'Website must be a valid URL',
    },
  },
  socialLinks: {
    github: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/github\.com\/.+/.test(v)
        },
        message: 'GitHub URL must be a valid GitHub profile URL',
      },
    },
    linkedin: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(v)
        },
        message: 'LinkedIn URL must be a valid LinkedIn profile URL',
      },
    },
    twitter: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?twitter\.com\/.+/.test(v)
        },
        message: 'Twitter URL must be a valid Twitter profile URL',
      },
    },
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800, // 7 days
    },
  }],
  // Student-specific fields
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  }],
  certificates: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    certificateUrl: String,
  }],
  // Instructor-specific fields
  instructorProfile: {
    title: String,
    company: String,
    experience: Number, // years
    specialties: [String],
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
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'connections'],
        default: 'public',
      },
      showEmail: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true },
    },
  },
}, {
  timestamps: true,
})

// Indexes for better performance
// Indexes (email already has unique index from schema definition)
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ 'enrolledCourses.course': 1 })
userSchema.index({ 'instructorProfile.isVerified': 1 })

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name
})

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    })
  }

  const updates = { $inc: { loginAttempts: 1 } }
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }

  return this.updateOne(updates)
}

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  })
}

// Instance method to check if user is enrolled in a course
userSchema.methods.isEnrolledIn = function(courseId) {
  return this.enrolledCourses.some(
    enrollment => enrollment.course.toString() === courseId.toString()
  )
}

// Instance method to get enrollment for a course
userSchema.methods.getEnrollment = function(courseId) {
  return this.enrolledCourses.find(
    enrollment => enrollment.course.toString() === courseId.toString()
  )
}

// Instance method to enroll in a course
userSchema.methods.enrollInCourse = function(courseId) {
  if (!this.isEnrolledIn(courseId)) {
    this.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date(),
    })
    return this.save()
  }
  return Promise.resolve(this)
}

// Instance method to update course progress
userSchema.methods.updateCourseProgress = function(courseId, progress) {
  const enrollment = this.getEnrollment(courseId)
  if (enrollment) {
    enrollment.progress = Math.min(100, Math.max(0, progress))
    if (progress >= 100 && !enrollment.completed) {
      enrollment.completed = true
      enrollment.completedAt = new Date()
    }
    return this.save()
  }
  return Promise.reject(new Error('User not enrolled in this course'))
}

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true })
}

// Static method to find by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true })
}

// Static method to find verified instructors
userSchema.statics.findVerifiedInstructors = function() {
  return this.find({ 
    role: 'instructor', 
    isActive: true,
    'instructorProfile.isVerified': true 
  })
}

// Static method to find students enrolled in a course
userSchema.statics.findStudentsInCourse = function(courseId) {
  return this.find({ 
    role: 'student',
    isActive: true,
    'enrolledCourses.course': courseId 
  })
}

const User = mongoose.model('User', userSchema)

export default User
