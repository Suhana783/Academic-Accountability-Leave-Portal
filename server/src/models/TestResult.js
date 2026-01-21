import mongoose from 'mongoose'

const testResultSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    leave: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leave',
      required: true
    },
    
    // MCQ Submissions
    mcqAnswers: [
      {
        questionIndex: Number,
        selectedAnswer: Number,
        correctAnswer: Number,
        isCorrect: Boolean,
        marksAwarded: Number
      }
    ],
    
    // Coding Submissions
    codingAnswers: [
      {
        questionIndex: Number,
        submittedOutput: String,
        expectedOutput: String,
        isCorrect: Boolean,
        marksAwarded: Number
      }
    ],
    
    // Scores
    mcqScore: {
      type: Number,
      default: 0
    },
    codingScore: {
      type: Number,
      default: 0
    },
    totalScore: {
      type: Number,
      required: true,
      default: 0
    },
    maxScore: {
      type: Number,
      required: true
    },
    
    // Pass/Fail Status
    passed: {
      type: Boolean,
      required: true
    },
    passMarks: {
      type: Number,
      required: true
    },
    
    // Metadata
    submittedAt: {
      type: Date,
      default: Date.now
    },
    timeTaken: {
      type: Number,
      default: 0
    },
    tabSwitchCount: {
      type: Number,
      default: 0,
      comment: 'Number of times student switched tabs during test'
    },
    feedback: {
      type: String,
      trim: true
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

// Ensure one submission per student per test
testResultSchema.index({ test: 1, student: 1 }, { unique: true })

const TestResult = mongoose.model('TestResult', testResultSchema)

export default TestResult
