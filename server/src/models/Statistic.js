import mongoose from 'mongoose'

const statisticSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Statistic label is required'],
    trim: true,
    maxlength: [100, 'Label cannot exceed 100 characters'],
  },
  value: {
    type: String,
    required: [true, 'Statistic value is required'],
    trim: true,
    maxlength: [50, 'Value cannot exceed 50 characters'],
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['homepage', 'about', 'dashboard', 'general'],
    default: 'general',
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters'],
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
  color: {
    type: String,
    default: 'from-primary-500 to-secondary-500',
    validate: {
      validator: function(v) {
        return /^from-\w+-\d+\s+to-\w+-\d+$/.test(v)
      },
      message: 'Color must be in format "from-color-500 to-color-500"',
    },
  },
}, {
  timestamps: true,
})

// Indexes for better performance
statisticSchema.index({ isActive: 1, position: 1 })
statisticSchema.index({ category: 1 })
statisticSchema.index({ isFeatured: 1 })

// Static method to find active statistics
statisticSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ position: 1 })
}

// Static method to find featured statistics
statisticSchema.statics.findFeatured = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ position: 1 })
}

// Static method to find by category
statisticSchema.statics.findByCategory = function(category) {
  return this.find({ isActive: true, category }).sort({ position: 1 })
}

const Statistic = mongoose.model('Statistic', statisticSchema)

export default Statistic
