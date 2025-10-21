import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team member name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters'],
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  imageUrl: {
    type: String,
    default: null,
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
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters'],
  },
  experience: {
    type: Number,
    min: 0,
    max: 50,
  },
  specialties: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  position: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Indexes for better performance
teamSchema.index({ isActive: 1, position: 1 })
teamSchema.index({ role: 1 })
teamSchema.index({ department: 1 })
teamSchema.index({ isFeatured: 1 })

// Static method to find active team members
teamSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ position: 1 })
}

// Static method to find featured team members
teamSchema.statics.findFeatured = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ position: 1 })
}

// Static method to find by department
teamSchema.statics.findByDepartment = function(department) {
  return this.find({ isActive: true, department }).sort({ position: 1 })
}

const Team = mongoose.model('Team', teamSchema)

export default Team
