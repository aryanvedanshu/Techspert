import mongoose from 'mongoose'

const featureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Feature title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Feature description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true,
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    validate: {
      validator: function(v) {
        return /^from-\w+-\d+\s+to-\w+-\d+$/.test(v)
      },
      message: 'Color must be in format "from-color-500 to-color-500"',
    },
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['homepage', 'about', 'courses', 'general'],
    default: 'general',
  },
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
  link: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v)
      },
      message: 'Link must be a valid URL',
    },
  },
}, {
  timestamps: true,
})

// Indexes for better performance
featureSchema.index({ isActive: 1, position: 1 })
featureSchema.index({ category: 1 })
featureSchema.index({ isFeatured: 1 })

// Static method to find active features
featureSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ position: 1 })
}

// Static method to find featured features
featureSchema.statics.findFeatured = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ position: 1 })
}

// Static method to find by category
featureSchema.statics.findByCategory = function(category) {
  return this.find({ isActive: true, category }).sort({ position: 1 })
}

const Feature = mongoose.model('Feature', featureSchema)

export default Feature
