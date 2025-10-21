import mongoose from 'mongoose'

const contactInfoSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Contact type is required'],
    enum: ['email', 'phone', 'address', 'social', 'office_hours'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  value: {
    type: String,
    required: [true, 'Value is required'],
    trim: true,
    maxlength: [500, 'Value cannot exceed 500 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true,
  },
  link: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v) || /^mailto:.+/.test(v) || /^tel:.+/.test(v)
      },
      message: 'Link must be a valid URL, email, or phone number',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  position: {
    type: Number,
    default: 0,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    enum: ['general', 'support', 'sales', 'technical'],
    default: 'general',
  },
}, {
  timestamps: true,
})

// Indexes for better performance
contactInfoSchema.index({ isActive: 1, position: 1 })
contactInfoSchema.index({ type: 1 })
contactInfoSchema.index({ isPrimary: 1 })
contactInfoSchema.index({ category: 1 })

// Static method to find active contact info
contactInfoSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ position: 1 })
}

// Static method to find by type
contactInfoSchema.statics.findByType = function(type) {
  return this.find({ isActive: true, type }).sort({ position: 1 })
}

// Static method to find primary contact
contactInfoSchema.statics.findPrimary = function(type) {
  return this.findOne({ isActive: true, type, isPrimary: true })
}

// Static method to find by category
contactInfoSchema.statics.findByCategory = function(category) {
  return this.find({ isActive: true, category }).sort({ position: 1 })
}

const ContactInfo = mongoose.model('ContactInfo', contactInfoSchema)

export default ContactInfo
