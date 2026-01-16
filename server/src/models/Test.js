import mongoose from 'mongoose'

const mcqQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [String],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  marks: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
})

const testSchema = new mongoose.Schema(
  {
    leave: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leave',
      required: [true, 'Leave reference is required'],
      unique: true // One test per leave request
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin reference is required']
    },
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    mcqQuestions: {
      type: [mcqQuestionSchema],
      default: []
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [1, 'Total marks must be at least 1']
    },
    passPercentage: {
      type: Number,
      required: [true, 'Pass percentage is required'],
      min: [0, 'Pass percentage cannot be negative'],
      max: [100, 'Pass percentage cannot exceed 100'],
      default: 60
    },
    timeLimit: {
      type: Number, // in minutes
      required: [true, 'Time limit is required'],
      min: [5, 'Time limit must be at least 5 minutes'],
      default: 60
    },
    isActive: {
      type: Boolean,
      default: true
    },
    scheduledAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Calculate total marks from questions
testSchema.pre('save', function (next) {
  let total = 0

  if (this.mcqQuestions && this.mcqQuestions.length > 0) {
    total = this.mcqQuestions.reduce((sum, q) => sum + (q.marks || 1), 0)
  }

  if (total > 0) {
    this.totalMarks = total
  }

  next()
})

// Index for faster queries
testSchema.index({ leave: 1 })
testSchema.index({ createdBy: 1 })

const Test = mongoose.model('Test', testSchema)

export default Test
