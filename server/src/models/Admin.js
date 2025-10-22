import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Admin name is required'],
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
    enum: ['super-admin', 'admin', 'moderator'],
    default: 'admin',
  },
  permissions: {
    courses: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
    },
    projects: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
    },
    alumni: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
    },
    admin: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
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
  profile: {
    imageUrl: String,
    bio: String,
    phone: String,
    department: String,
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light',
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800, // 7 days
    },
  }],
}, {
  timestamps: true,
})

// Indexes
adminSchema.index({ role: 1 })
adminSchema.index({ isActive: 1 })

// Virtual for account lock status (DISABLED - no login attempt restrictions)
adminSchema.virtual('isLocked').get(function() {
  return false // Always return false - no account locking
})

// Ensure virtual fields are serialized
adminSchema.set('toJSON', { virtuals: true })
adminSchema.set('toObject', { virtuals: true })

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
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
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Instance method to increment login attempts (DISABLED - no login attempt restrictions)
adminSchema.methods.incLoginAttempts = function() {
  // Do nothing - login attempts are not tracked or restricted
  return Promise.resolve()
}

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  })
}

// Instance method to check permission
adminSchema.methods.hasPermission = function(resource, action) {
  if (this.role === 'super-admin') return true
  if (!this.permissions[resource]) return false
  return this.permissions[resource][action] === true
}

// Static method to find active admins
adminSchema.statics.findActive = function() {
  return this.find({ isActive: true })
}

// Static method to find by role
adminSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true })
}

const Admin = mongoose.model('Admin', adminSchema)

export default Admin