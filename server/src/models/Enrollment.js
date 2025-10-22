import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  // Live session attendance tracking
  sessionsAttended: [{
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
    attendedAt: Date,
    duration: Number, // in minutes
  }],
  // Course completion requirements
  requirements: {
    attendanceRequired: {
      type: Number,
      default: 80, // percentage
    },
    assignmentsCompleted: {
      type: Number,
      default: 0,
    },
    totalAssignments: {
      type: Number,
      default: 0,
    },
  },
  // Payment information
  payment: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentMethod: String,
    transactionId: String,
    paidAt: Date,
    refunded: {
      type: Boolean,
      default: false,
    },
    refundedAt: Date,
    refundAmount: Number,
  },
  // Certificate information
  certificate: {
    issued: {
      type: Boolean,
      default: false,
    },
    issuedAt: Date,
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
    },
  },
  // Notes and feedback
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Status tracking
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'dropped', 'refunded'],
    default: 'active',
  },
}, {
  timestamps: true,
})

// Compound index to ensure one enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

// Indexes for performance
enrollmentSchema.index({ student: 1, status: 1 })
enrollmentSchema.index({ course: 1, status: 1 })
enrollmentSchema.index({ enrolledAt: -1 })
enrollmentSchema.index({ completedAt: -1 })

// Virtual for attendance percentage
enrollmentSchema.virtual('attendancePercentage').get(function() {
  if (this.sessionsAttended.length === 0) return 0
  // This would need to be calculated based on total sessions in the course
  return Math.round((this.sessionsAttended.length / 10) * 100) // Placeholder calculation
})

// Virtual for assignment completion percentage
enrollmentSchema.virtual('assignmentCompletionPercentage').get(function() {
  if (this.requirements.totalAssignments === 0) return 100
  return Math.round((this.requirements.assignmentsCompleted / this.requirements.totalAssignments) * 100)
})

// Ensure virtual fields are serialized
enrollmentSchema.set('toJSON', { virtuals: true })
enrollmentSchema.set('toObject', { virtuals: true })

// Instance method to update progress
enrollmentSchema.methods.updateProgress = function(newProgress) {
  this.progress = Math.min(100, Math.max(0, newProgress))
  this.lastAccessedAt = new Date()
  
  if (this.progress >= 100 && !this.completed) {
    this.completed = true
    this.completedAt = new Date()
    this.status = 'completed'
  }
  
  return this.save()
}

// Instance method to mark session attendance
enrollmentSchema.methods.markSessionAttendance = function(sessionId, duration = 0) {
  const existingAttendance = this.sessionsAttended.find(
    attendance => attendance.sessionId.toString() === sessionId.toString()
  )
  
  if (!existingAttendance) {
    this.sessionsAttended.push({
      sessionId,
      attendedAt: new Date(),
      duration,
    })
    return this.save()
  }
  
  return Promise.resolve(this)
}

// Instance method to complete assignment
enrollmentSchema.methods.completeAssignment = function() {
  this.requirements.assignmentsCompleted += 1
  return this.save()
}

// Static method to find enrollments by student
enrollmentSchema.statics.findByStudent = function(studentId) {
  return this.find({ student: studentId }).populate('course', 'title thumbnailUrl duration level')
}

// Static method to find enrollments by course
enrollmentSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId }).populate('student', 'name email avatar')
}

// Static method to get enrollment statistics
enrollmentSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        activeEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageProgress: { $avg: '$progress' },
        totalRevenue: { $sum: '$payment.amount' },
      }
    }
  ])
}

const Enrollment = mongoose.model('Enrollment', enrollmentSchema)

export default Enrollment
