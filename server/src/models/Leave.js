import mongoose from 'mongoose'

const leaveSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value >= this.startDate
        },
        message: 'End date must be after or equal to start date'
      }
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
      minlength: [10, 'Reason must be at least 10 characters long'],
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'test_assigned', 'approved', 'rejected'],
        message: 'Status must be one of: pending, test_assigned, approved, rejected'
      },
      default: 'pending'
    },
    leaveType: {
      type: String,
      enum: ['sick', 'personal', 'emergency', 'vacation', 'other'],
      default: 'personal'
    },
    totalDays: {
      type: Number,
      min: [1, 'Leave must be at least 1 day']
    },
    adminRemarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin remarks cannot exceed 500 characters']
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
