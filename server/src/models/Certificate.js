import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [200, 'Course name cannot exceed 200 characters'],
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Student name cannot exceed 100 characters'],
  },
  studentEmail: {
    type: String,
    required: [true, 'Student email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      },
      message: 'Please provide a valid email address',
    },
  },
  completionDate: {
    type: Date,
    required: [true, 'Completion date is required'],
    default: Date.now,
  },
  certificateId: {
    type: String,
    required: [true, 'Certificate ID is required'],
    unique: true,
    trim: true,
  },
  templateUrl: {
    type: String,
    default: '/images/certificate.png', // Default certificate template
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  issuedBy: {
    type: String,
    required: [true, 'Issuer name is required'],
    trim: true,
    default: 'Techspert',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  metadata: {
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'Pass', 'Fail'],
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number, // in hours
    },
    skills: [{
      type: String,
      trim: true,
    }],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  downloadedAt: {
    type: Date,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// Indexes for better performance (certificateId and verificationCode already have unique indexes from schema definition)
certificateSchema.index({ studentEmail: 1 })
certificateSchema.index({ course: 1 })
certificateSchema.index({ student: 1 })
certificateSchema.index({ completionDate: -1 })
certificateSchema.index({ isActive: 1 })

// Virtual for certificate URL
certificateSchema.virtual('certificateUrl').get(function() {
  return `/api/certificates/${this.certificateId}/download`
})

// Virtual for verification URL
certificateSchema.virtual('verificationUrl').get(function() {
  return `/api/certificates/verify/${this.verificationCode}`
})

// Ensure virtual fields are serialized
certificateSchema.set('toJSON', { virtuals: true })
certificateSchema.set('toObject', { virtuals: true })

// Pre-save middleware to generate certificate ID and verification code
certificateSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate unique certificate ID
    if (!this.certificateId) {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substr(2, 5)
      this.certificateId = `TC-${timestamp}-${random}`.toUpperCase()
    }
    
    // Generate verification code
    if (!this.verificationCode) {
      this.verificationCode = Math.random().toString(36).substr(2, 8).toUpperCase()
    }
  }
  next()
})

// Instance method to mark as downloaded
certificateSchema.methods.markDownloaded = function() {
  this.downloadCount += 1
  this.downloadedAt = new Date()
  return this.save()
}

// Static method to find by verification code
certificateSchema.statics.findByVerificationCode = function(code) {
  return this.findOne({ verificationCode: code, isActive: true })
}

// Static method to find by certificate ID
certificateSchema.statics.findByCertificateId = function(id) {
  return this.findOne({ certificateId: id, isActive: true })
}

// Static method to find student certificates
certificateSchema.statics.findByStudent = function(studentId) {
  return this.find({ student: studentId, isActive: true }).sort({ completionDate: -1 })
}

// Static method to find course certificates
certificateSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId, isActive: true }).sort({ completionDate: -1 })
}

const Certificate = mongoose.model('Certificate', certificateSchema)

export default Certificate
