import mongoose from 'mongoose'

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'FAQ question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters'],
  },
  answer: {
    type: String,
    required: [true, 'FAQ answer is required'],
    maxlength: [2000, 'Answer cannot exceed 2000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['general', 'courses', 'billing', 'technical', 'support'],
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
  tags: [{
    type: String,
    trim: true,
  }],
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0,
  },
  notHelpful: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
})

// Indexes for better performance
faqSchema.index({ isActive: 1, position: 1 })
faqSchema.index({ category: 1 })
faqSchema.index({ isFeatured: 1 })
faqSchema.index({ tags: 1 })

// Virtual for helpful percentage
faqSchema.virtual('helpfulPercentage').get(function() {
  const total = this.helpful + this.notHelpful
  if (total === 0) return 0
  return Math.round((this.helpful / total) * 100)
})

// Ensure virtual fields are serialized
faqSchema.set('toJSON', { virtuals: true })
faqSchema.set('toObject', { virtuals: true })

// Static method to find active FAQs
faqSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ position: 1 })
}

// Static method to find featured FAQs
faqSchema.statics.findFeatured = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ position: 1 })
}

// Static method to find by category
faqSchema.statics.findByCategory = function(category) {
  return this.find({ isActive: true, category }).sort({ position: 1 })
}

// Instance method to increment views
faqSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Instance method to mark as helpful
faqSchema.methods.markHelpful = function() {
  this.helpful += 1
  return this.save()
}

// Instance method to mark as not helpful
faqSchema.methods.markNotHelpful = function() {
  this.notHelpful += 1
  return this.save()
}

const FAQ = mongoose.model('FAQ', faqSchema)

export default FAQ
