import mongoose from 'mongoose'

const syllabusSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  lessons: {
    type: Number,
    required: true,
    min: 1,
  },
  order: {
    type: Number,
    required: true,
  },
})

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: [200, 'Short description cannot exceed 200 characters'],
  },
  syllabus: [syllabusSchema],
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
  },
  duration: {
    type: String,
    required: [true, 'Course duration is required'],
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: 'Level must be beginner, intermediate, or advanced',
    },
  },
  tags: [{
    type: String,
    trim: true,
  }],
  thumbnailUrl: {
    type: String,
    required: true,
  },
  previewUrl: {
    type: String,
  },
  instructor: {
    name: {
      type: String,
      required: true,
    },
    bio: String,
    imageUrl: String,
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
    },
  },
  whatYouWillLearn: [{
    type: String,
    required: true,
  }],
  requirements: [{
    type: String,
    required: true,
  }],
  isPublished: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    default: 0,
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
  studentsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  certificateTemplate: {
    templateUrl: String,
    logoUrl: String,
    signatureUrl: String,
  },
}, {
  timestamps: true,
})

// Indexes for better performance (slug already has unique index from schema definition)
courseSchema.index({ isPublished: 1, position: 1 })
courseSchema.index({ level: 1 })
courseSchema.index({ tags: 1 })
courseSchema.index({ 'rating.average': -1 })
courseSchema.index({ studentsCount: -1 })

// Virtual for discount percentage
courseSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
  }
  return 0
})

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true })
courseSchema.set('toObject', { virtuals: true })

// Pre-save middleware to generate slug
courseSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

// Static method to find published courses
courseSchema.statics.findPublished = function() {
  return this.find({ isPublished: true }).sort({ position: 1 })
}

// Static method to find featured courses
courseSchema.statics.findFeatured = function() {
  return this.find({ isPublished: true, isFeatured: true }).sort({ position: 1 })
}

const Course = mongoose.model('Course', courseSchema)

export default Course