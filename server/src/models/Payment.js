import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  // Payment identification
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  // Related entities
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
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true,
  },
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR'],
  },
  // Payment method
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'paypal', 'bank_transfer', 'wallet', 'crypto'],
  },
  // Stripe integration
  stripe: {
    paymentIntentId: String,
    chargeId: String,
    customerId: String,
    sessionId: String,
    webhookId: String,
  },
  // Payment status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  // Payment processing
  processedAt: Date,
  failedAt: Date,
  failureReason: String,
  // Refund information
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
    },
    processedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  totalRefunded: {
    type: Number,
    default: 0,
  },
  // Instructor payout (for marketplace)
  instructorPayout: {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: Number,
    percentage: {
      type: Number,
      default: 70, // 70% to instructor, 30% to platform
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending',
    },
    paidAt: Date,
    transactionId: String,
  },
  // Payment metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web',
    },
    coupon: {
      code: String,
      discount: Number,
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
    },
    tax: {
      amount: Number,
      rate: Number,
      jurisdiction: String,
    },
  },
  // Payment description
  description: {
    type: String,
    required: true,
  },
  // Receipt information
  receipt: {
    url: String,
    number: String,
    sentAt: Date,
  },
  // Dispute information
  disputes: [{
    disputeId: String,
    reason: String,
    status: {
      type: String,
      enum: ['warning_needs_response', 'warning_under_review', 'warning_closed', 'needs_response', 'under_review', 'charge_refunded', 'won', 'lost'],
    },
    amount: Number,
    currency: String,
    createdAt: Date,
    evidence: {
      customer_communication: String,
      customer_email_address: String,
      customer_name: String,
      customer_purchase_ip: String,
      customer_signature: String,
      duplicate_charge_documentation: String,
      duplicate_charge_explanation: String,
      duplicate_charge_id: String,
      product_description: String,
      receipt: String,
      refund_policy: String,
      refund_policy_disclosure: String,
      refund_refusal_explanation: String,
      service_documentation: String,
      service_date: Date,
      shipping_address: String,
      shipping_carrier: String,
      shipping_date: Date,
      shipping_documentation: String,
      shipping_tracking_number: String,
      uncategorized_file: String,
      uncategorized_text: String,
    },
  }],
  // Payment notes
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
}, {
  timestamps: true,
})

// Indexes for performance
paymentSchema.index({ paymentId: 1 })
paymentSchema.index({ student: 1, createdAt: -1 })
paymentSchema.index({ course: 1, createdAt: -1 })
paymentSchema.index({ status: 1, createdAt: -1 })
paymentSchema.index({ 'stripe.paymentIntentId': 1 })
paymentSchema.index({ 'stripe.chargeId': 1 })

// Virtual for net amount after refunds
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.totalRefunded
})

// Virtual for platform fee
paymentSchema.virtual('platformFee').get(function() {
  if (this.instructorPayout.percentage) {
    return this.amount * (1 - this.instructorPayout.percentage / 100)
  }
  return 0
})

// Virtual for instructor amount
paymentSchema.virtual('instructorAmount').get(function() {
  if (this.instructorPayout.percentage) {
    return this.amount * (this.instructorPayout.percentage / 100)
  }
  return 0
})

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true })
paymentSchema.set('toObject', { virtuals: true })

// Instance method to add refund
paymentSchema.methods.addRefund = function(refundData) {
  const refund = {
    refundId: refundData.refundId,
    amount: refundData.amount,
    reason: refundData.reason,
    status: refundData.status || 'pending',
    processedAt: refundData.processedAt,
    createdAt: new Date(),
  }
  
  this.refunds.push(refund)
  this.totalRefunded += refundData.amount
  
  // Update payment status based on refund amount
  if (this.totalRefunded >= this.amount) {
    this.status = 'refunded'
  } else if (this.totalRefunded > 0) {
    this.status = 'partially_refunded'
  }
  
  return this.save()
}

// Instance method to process instructor payout
paymentSchema.methods.processInstructorPayout = function(transactionId) {
  this.instructorPayout.status = 'paid'
  this.instructorPayout.paidAt = new Date()
  this.instructorPayout.transactionId = transactionId
  return this.save()
}

// Instance method to add dispute
paymentSchema.methods.addDispute = function(disputeData) {
  const dispute = {
    disputeId: disputeData.disputeId,
    reason: disputeData.reason,
    status: disputeData.status,
    amount: disputeData.amount,
    currency: disputeData.currency,
    createdAt: new Date(),
    evidence: disputeData.evidence || {},
  }
  
  this.disputes.push(dispute)
  return this.save()
}

// Static method to find payments by student
paymentSchema.statics.findByStudent = function(studentId) {
  return this.find({ student: studentId })
    .populate('course', 'title thumbnailUrl')
    .sort({ createdAt: -1 })
}

// Static method to find payments by course
paymentSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId })
    .populate('student', 'name email')
    .sort({ createdAt: -1 })
}

// Static method to get payment statistics
paymentSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
        },
        successfulAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedAmount: { $sum: '$totalRefunded' },
        averagePayment: { $avg: '$amount' },
      }
    }
  ])
}

// Static method to get revenue by period
paymentSchema.statics.getRevenueByPeriod = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'succeeded'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ])
}

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment
