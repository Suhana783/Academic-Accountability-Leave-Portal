import mongoose from 'mongoose'

/**
 * Schema for storing student's test submission and evaluation results
 */
const testResultSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Test reference is required']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required']
    },
    leave: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leave',
      required: [true, 'Leave reference is required']
    },
    
    // MCQ Submissions
    mcqAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true
        },
        selectedAnswer: {
          type: Number,
          required: true
        },
        correctAnswer: {
          type: Number,
          required: true
        },
        isCorrect: {
          type: Boolean,
          required: true
        },
        marksAwarded: {
          type: Number,
          default: 0
        }
      }
    ],
    
    // Coding Submissions
    codingAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true
        },
        submittedCode: {
          type: String,
          required: true
        },
        testCaseResults: [
          {
            input: String,
            expectedOutput: String,
            submittedOutput: String,
            passed: {
              type: Boolean,
              default: false
            }
          }
        ],
        passedTestCases: {
          type: Number,
          default: 0
        },
        totalTestCases: {
          type: Number,
          required: true
        },
        marksAwarded: {
          type: Number,
          default: 0
        }
      }
    ],
    
    // Scores and Results
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
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    
    // Pass/Fail Status
    passed: {
      type: Boolean,
      required: true
    },
    passPercentage: {
      type: Number,
      required: true
    },
    
    // Metadata
    submittedAt: {
      type: Date,
      default: Date.now
    },
    timeTaken: {
      type: Number, // in seconds
      min: 0
    },
    
    // Remarks
    feedback: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

// Ensure one submission per student per test
testResultSchema.index({ test: 1, student: 1 }, { unique: true })

// Index for faster queries
testResultSchema.index({ student: 1 })
testResultSchema.index({ leave: 1 })
testResultSchema.index({ passed: 1 })

// Calculate percentage before saving
testResultSchema.pre('save', function (next) {
  if (this.maxScore > 0) {
    this.percentage = parseFloat(((this.totalScore / this.maxScore) * 100).toFixed(2))
    this.passed = this.percentage >= this.passPercentage
  }
  next()
})

const TestResult = mongoose.model('TestResult', testResultSchema)

export default TestResult
