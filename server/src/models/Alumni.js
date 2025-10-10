import mongoose from 'mongoose'

const alumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Alumni name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
  },
  course: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  graduationDate: {
    type: Date,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  testimonial: {
    type: String,
    required: [true, 'Testimonial is required'],
    maxlength: [500, 'Testimonial cannot exceed 500 characters'],
  },
  socialLinks: {
    linkedin: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(v)
        },
        message: 'LinkedIn URL must be a valid LinkedIn profile URL',
      },
    },
    github: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/github\.com\/.+/.test(v)
        },
        message: 'GitHub URL must be a valid GitHub profile URL',
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
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v)
        },
        message: 'Website URL must be a valid URL',
      },
    },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      },
      message: 'Please provide a valid email address',
    },
  },
  skills: [{
    type: String,
    required: true,
    trim: true,
  }],
  achievements: [{
    title: {
      type: String,
      required: true,
    },
    description: String,
    date: Date,
  }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    default: 0,
  },
  salary: {
    type: Number,
    min: 0,
  },
  salaryCurrency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 50,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
})

// Indexes for better performance
alumniSchema.index({ isApproved: 1, isFeatured: 1, position: 1 })
alumniSchema.index({ course: 1 })
alumniSchema.index({ company: 1 })
alumniSchema.index({ skills: 1 })
alumniSchema.index({ tags: 1 })
alumniSchema.index({ graduationDate: -1 })
alumniSchema.index({ location: 1 })

// Virtual for years since graduation
alumniSchema.virtual('yearsSinceGraduation').get(function() {
  const now = new Date()
  const diffTime = Math.abs(now - this.graduationDate)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365))
})

// Virtual for skill count
alumniSchema.virtual('skillCount').get(function() {
  return this.skills.length
})

// Ensure virtual fields are serialized
alumniSchema.set('toJSON', { virtuals: true })
alumniSchema.set('toObject', { virtuals: true })

// Static method to find approved alumni
alumniSchema.statics.findApproved = function() {
  return this.find({ isApproved: true }).sort({ position: 1, graduationDate: -1 })
}

// Static method to find featured alumni
alumniSchema.statics.findFeatured = function() {
  return this.find({ isApproved: true, isFeatured: true }).sort({ position: 1 })
}

// Static method to find alumni by course
alumniSchema.statics.findByCourse = function(courseName) {
  return this.find({ isApproved: true, course: courseName }).sort({ graduationDate: -1 })
}

// Static method to find alumni by company
alumniSchema.statics.findByCompany = function(companyName) {
  return this.find({ isApproved: true, company: companyName }).sort({ graduationDate: -1 })
}

// Static method to find alumni by skill
alumniSchema.statics.findBySkill = function(skill) {
  return this.find({ isApproved: true, skills: skill }).sort({ graduationDate: -1 })
}

const Alumni = mongoose.model('Alumni', alumniSchema)

export default Alumni