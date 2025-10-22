import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  // Session scheduling
  scheduledAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: [15, 'Session must be at least 15 minutes'],
    max: [480, 'Session cannot exceed 8 hours'],
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC',
  },
  // Live session details
  sessionType: {
    type: String,
    enum: ['live', 'recorded', 'hybrid'],
    default: 'live',
  },
  platform: {
    type: String,
    enum: ['zoom', 'google-meet', 'teams', 'custom'],
    required: true,
  },
  // Zoom/Meet integration
  meetingDetails: {
    meetingId: String,
    joinUrl: String,
    password: String,
    hostKey: String,
    // For Zoom
    zoomMeetingId: String,
    zoomJoinUrl: String,
    zoomPassword: String,
    // For Google Meet
    meetLink: String,
    calendarEventId: String,
  },
  // Recording settings
  recording: {
    enabled: {
      type: Boolean,
      default: true,
    },
    consentRequired: {
      type: Boolean,
      default: true,
    },
    autoStart: {
      type: Boolean,
      default: false,
    },
    cloudRecording: {
      type: Boolean,
      default: true,
    },
    localRecording: {
      type: Boolean,
      default: false,
    },
  },
  // Session materials
  materials: [{
    title: String,
    description: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'assignment'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Session status
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled', 'rescheduled'],
    default: 'scheduled',
  },
  // Attendance tracking
  attendance: {
    totalRegistered: {
      type: Number,
      default: 0,
    },
    totalAttended: {
      type: Number,
      default: 0,
    },
    attendees: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      joinedAt: Date,
      leftAt: Date,
      duration: Number, // in minutes
      attendancePercentage: Number, // percentage of session attended
    }],
  },
  // Session analytics
  analytics: {
    peakConcurrentUsers: {
      type: Number,
      default: 0,
    },
    averageAttendanceDuration: {
      type: Number,
      default: 0,
    },
    engagementScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    chatMessages: {
      type: Number,
      default: 0,
    },
    questionsAsked: {
      type: Number,
      default: 0,
    },
  },
  // Session recordings
  recordings: [{
    url: String,
    duration: Number, // in minutes
    size: Number, // in bytes
    format: {
      type: String,
      enum: ['mp4', 'webm', 'mov'],
    },
    quality: {
      type: String,
      enum: ['720p', '1080p', '4k'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
  }],
  // Chat and interaction
  chatEnabled: {
    type: Boolean,
    default: true,
  },
  qaEnabled: {
    type: Boolean,
    default: true,
  },
  breakoutRooms: {
    enabled: {
      type: Boolean,
      default: false,
    },
    rooms: [{
      name: String,
      participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
    }],
  },
  // Notifications
  notifications: {
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: Date,
    followUpSent: {
      type: Boolean,
      default: false,
    },
    followUpSentAt: Date,
  },
  // Session notes and feedback
  notes: String,
  feedback: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
})

// Indexes for performance
sessionSchema.index({ course: 1, scheduledAt: 1 })
sessionSchema.index({ instructor: 1, scheduledAt: 1 })
sessionSchema.index({ status: 1, scheduledAt: 1 })
sessionSchema.index({ 'meetingDetails.meetingId': 1 })

// Virtual for session duration in hours
sessionSchema.virtual('durationHours').get(function() {
  return Math.round((this.duration / 60) * 10) / 10
})

// Virtual for attendance percentage
sessionSchema.virtual('attendancePercentage').get(function() {
  if (this.attendance.totalRegistered === 0) return 0
  return Math.round((this.attendance.totalAttended / this.attendance.totalRegistered) * 100)
})

// Virtual for average feedback rating
sessionSchema.virtual('averageRating').get(function() {
  if (this.feedback.length === 0) return 0
  const totalRating = this.feedback.reduce((sum, f) => sum + f.rating, 0)
  return Math.round((totalRating / this.feedback.length) * 10) / 10
})

// Ensure virtual fields are serialized
sessionSchema.set('toJSON', { virtuals: true })
sessionSchema.set('toObject', { virtuals: true })

// Pre-save middleware to update attendance count
sessionSchema.pre('save', function(next) {
  if (this.isModified('attendance.attendees')) {
    this.attendance.totalAttended = this.attendance.attendees.length
  }
  next()
})

// Instance method to add attendee
sessionSchema.methods.addAttendee = function(studentId, joinedAt = new Date()) {
  const existingAttendee = this.attendance.attendees.find(
    attendee => attendee.student.toString() === studentId.toString()
  )
  
  if (!existingAttendee) {
    this.attendance.attendees.push({
      student: studentId,
      joinedAt,
    })
    this.attendance.totalAttended = this.attendance.attendees.length
    return this.save()
  }
  
  return Promise.resolve(this)
}

// Instance method to remove attendee
sessionSchema.methods.removeAttendee = function(studentId, leftAt = new Date()) {
  const attendeeIndex = this.attendance.attendees.findIndex(
    attendee => attendee.student.toString() === studentId.toString()
  )
  
  if (attendeeIndex !== -1) {
    const attendee = this.attendance.attendees[attendeeIndex]
    attendee.leftAt = leftAt
    attendee.duration = Math.round((leftAt - attendee.joinedAt) / (1000 * 60)) // duration in minutes
    
    // Calculate attendance percentage
    attendee.attendancePercentage = Math.min(100, Math.round((attendee.duration / this.duration) * 100))
    
    this.attendance.totalAttended = this.attendance.attendees.length
    return this.save()
  }
  
  return Promise.resolve(this)
}

// Instance method to add feedback
sessionSchema.methods.addFeedback = function(studentId, rating, comment = '') {
  const existingFeedback = this.feedback.find(
    f => f.student.toString() === studentId.toString()
  )
  
  if (existingFeedback) {
    existingFeedback.rating = rating
    existingFeedback.comment = comment
    existingFeedback.submittedAt = new Date()
  } else {
    this.feedback.push({
      student: studentId,
      rating,
      comment,
      submittedAt: new Date(),
    })
  }
  
  return this.save()
}

// Static method to find upcoming sessions
sessionSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    status: 'scheduled',
    scheduledAt: { $gte: new Date() }
  })
  .populate('course', 'title thumbnailUrl')
  .populate('instructor', 'name avatar')
  .sort({ scheduledAt: 1 })
  .limit(limit)
}

// Static method to find sessions by course
sessionSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId })
    .populate('instructor', 'name avatar')
    .sort({ scheduledAt: 1 })
}

// Static method to find sessions by instructor
sessionSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor: instructorId })
    .populate('course', 'title thumbnailUrl')
    .sort({ scheduledAt: -1 })
}

const Session = mongoose.model('Session', sessionSchema)

export default Session
