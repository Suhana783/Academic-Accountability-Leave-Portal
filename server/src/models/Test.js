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
    required: true
  },
  marks: {
    type: Number,
    default: 1
  }
})

const codingQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  expectedOutput: {
    type: String,
    required: true,
    trim: true
  },
  marks: {
    type: Number,
    default: 1
  }
})

const testSchema = new mongoose.Schema(
  {
    leave: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leave',
      required: true,
      unique: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
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
    codingQuestions: {
      type: [codingQuestionSchema],
      default: []
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    passMarks: {
      type: Number,
      required: true,
      default: 0
    },
    duration: {
      type: Number,
      default: 3600, // Default 1 hour in seconds
      comment: 'Test duration in seconds'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

// Calculate total marks and passMarks from questions
testSchema.pre('save', function (next) {
  let total = 0

  if (this.mcqQuestions && this.mcqQuestions.length > 0) {
    total += this.mcqQuestions.reduce((sum, q) => sum + (q.marks || 1), 0)
  }

  if (this.codingQuestions && this.codingQuestions.length > 0) {
    total += this.codingQuestions.reduce((sum, q) => sum + (q.marks || 1), 0)
  }

  if (total > 0) {
    this.totalMarks = total
    // Default passMarks is 60% of totalMarks if not set
    if (!this.passMarks) {
      this.passMarks = Math.ceil(total * 0.6)
    }
  }

  next()
})

const Test = mongoose.model('Test', testSchema)

export default Test
