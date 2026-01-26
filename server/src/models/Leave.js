import mongoose from 'mongoose'

const leaveSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    leaveType: {
      type: String,
      enum: ['personal', 'sick', 'emergency', 'vacation', 'other'],
      default: 'personal'
    },
    status: {
      type: String,
      enum: ['pending', 'test_assigned', 'approved', 'rejected'],
      default: 'pending'
    },
    adminRemarks: {
      type: String,
      trim: true,
    },
    // Retest / reevaluation controls
    retestRequested: {
      type: Boolean,
      default: false
    },
    retestApproved: {
      type: Boolean,
      default: false
    },
    retestUsed: {
      type: Boolean,
      default: false
    },
    reevaluationUsed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Calculate total days before saving
leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both days
    this.totalDays = diffDays
  }
  next()
})

// Index for faster queries
leaveSchema.index({ student: 1, status: 1 })
leaveSchema.index({ startDate: 1, endDate: 1 })

const Leave = mongoose.model('Leave', leaveSchema)

export default Leave
