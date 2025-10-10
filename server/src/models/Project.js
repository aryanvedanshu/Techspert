import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: [200, 'Short description cannot exceed 200 characters'],
  },
  imageUrl: {
    type: String,
    required: true,
  },
  githubUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/github\.com\/.+/.test(v)
      },
      message: 'GitHub URL must be a valid GitHub repository URL',
    },
  },
  liveUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v)
      },
      message: 'Live URL must be a valid URL',
    },
  },
  technologies: [{
    type: String,
    required: true,
    trim: true,
  }],
  course: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
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
    required: true,
  },
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
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  screenshots: [{
    url: String,
    alt: String,
    order: Number,
  }],
  features: [{
    type: String,
    required: true,
  }],
  challenges: [{
    type: String,
    required: true,
  }],
  lessonsLearned: [{
    type: String,
    required: true,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
})

// Indexes for better performance
projectSchema.index({ isApproved: 1, isFeatured: 1, position: 1 })
projectSchema.index({ course: 1 })
projectSchema.index({ technologies: 1 })
projectSchema.index({ tags: 1 })
projectSchema.index({ completionDate: -1 })
projectSchema.index({ views: -1 })
projectSchema.index({ likes: -1 })

// Virtual for project age
projectSchema.virtual('ageInDays').get(function() {
  const now = new Date()
  const diffTime = Math.abs(now - this.completionDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for technology count
projectSchema.virtual('technologyCount').get(function() {
  return this.technologies.length
})

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true })
projectSchema.set('toObject', { virtuals: true })

// Static method to find approved projects
projectSchema.statics.findApproved = function() {
  return this.find({ isApproved: true }).sort({ position: 1, completionDate: -1 })
}

// Static method to find featured projects
projectSchema.statics.findFeatured = function() {
  return this.find({ isApproved: true, isFeatured: true }).sort({ position: 1 })
}

// Static method to find projects by course
projectSchema.statics.findByCourse = function(courseName) {
  return this.find({ isApproved: true, course: courseName }).sort({ completionDate: -1 })
}

// Static method to find projects by technology
projectSchema.statics.findByTechnology = function(technology) {
  return this.find({ isApproved: true, technologies: technology }).sort({ completionDate: -1 })
}

// Instance method to increment views
projectSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Instance method to increment likes
projectSchema.methods.incrementLikes = function() {
  this.likes += 1
  return this.save()
}

const Project = mongoose.model('Project', projectSchema)

export default Project