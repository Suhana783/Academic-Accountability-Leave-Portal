import mongoose from 'mongoose'

const questionBankSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length >= 2
        },
        message: 'At least 2 options are required'
      }
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Data Structures',
        'Java',
        'DBMS',
        'Operating System',
        'Computer Networks',
        'Web Development',
        'Python',
        'C++',
        'JavaScript',
        'Algorithms',
        'Software Engineering',
        'Machine Learning'
      ]
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    marks: {
      type: Number,
      default: 1,
      min: 1
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

// Index for faster queries
questionBankSchema.index({ subject: 1, difficulty: 1, isActive: 1 })

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema)

export default QuestionBank
