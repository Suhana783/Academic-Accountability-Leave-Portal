import Test from '../models/Test.js'
import TestResult from '../models/TestResult.js'
import Leave from '../models/Leave.js'
import {
  evaluateAllMCQs,
  evaluateAllCodingQuestions,
  generateFeedback
} from '../utils/evaluationHelper.js'

/**
 * Simple evaluation service
 */
class EvaluationService {
  /**
   * Process and evaluate a test submission
   */
  async processTestSubmission(testId, studentId, submission) {
    try {
      // Fetch the test
      const test = await Test.findById(testId).populate({
        path: 'leave',
        populate: {
          path: 'student'
        }
      })

      if (!test) {
        throw new Error('Test not found')
      }

      // Verify test belongs to this student's leave
      if (test.leave.student._id.toString() !== studentId.toString()) {
        throw new Error('This test is not assigned to you')
      }

      // Check if already submitted
      const existingResult = await TestResult.findOne({
        test: testId,
        student: studentId
      })

      if (existingResult) {
        throw new Error('Test already submitted')
      }

      // Evaluate MCQs
      const mcqEvaluation = evaluateAllMCQs(
        test.mcqQuestions,
        submission.mcqAnswers || []
      )

      // Evaluate Coding Questions
      const codingEvaluation = evaluateAllCodingQuestions(
        test.codingQuestions,
        submission.codingAnswers || []
      )

      // Calculate total score
      const mcqScore = mcqEvaluation.totalScore
      const codingScore = codingEvaluation.totalScore
      const totalScore = mcqScore + codingScore
      const maxScore = test.totalMarks
      const passed = totalScore >= test.passMarks

      // Generate feedback
      const feedback = generateFeedback(totalScore, maxScore, passed)

      // Create result object
      const resultData = {
        test: testId,
        student: studentId,
        leave: test.leave._id,
        mcqAnswers: mcqEvaluation.evaluatedAnswers,
        codingAnswers: codingEvaluation.evaluatedAnswers,
        mcqScore,
        codingScore,
        totalScore,
        maxScore,
        passed,
        passMarks: test.passMarks,
        feedback,
        submittedAt: new Date(),
        timeTaken: submission.timeTaken || 0
      }

      return resultData
    } catch (error) {
      throw error
    }
  }

  /**
   * Update leave status based on test result
   */
  async updateLeaveStatus(leaveId, passed) {
    try {
      const leave = await Leave.findById(leaveId)

      if (!leave) {
        throw new Error('Leave not found')
      }

      leave.status = passed ? 'approved' : 'rejected'
      leave.reviewedAt = new Date()
      leave.adminRemarks = passed
        ? 'Leave approved - test passed'
        : 'Leave rejected - test failed'

      await leave.save()

      return leave
    } catch (error) {
      throw error
    }
  }

  /**
   * Complete submission: evaluate and update leave
   */
  async completeSubmission(testId, studentId, submission) {
    try {
      // Process and evaluate
      const resultData = await this.processTestSubmission(
        testId,
        studentId,
        submission
      )

      // Save result
      const testResult = await TestResult.create(resultData)

      // Update leave status
      const updatedLeave = await this.updateLeaveStatus(
        resultData.leave,
        resultData.passed
      )

      // Populate references
      await testResult.populate([
        { path: 'test', select: 'title description totalMarks passMarks' },
        { path: 'student', select: 'name email' },
        { path: 'leave', select: 'startDate endDate status reason' }
      ])

      return {
        testResult,
        leaveStatus: updatedLeave.status,
        message: resultData.passed
          ? 'Congratulations! You passed the test. Your leave has been approved.'
          : 'Unfortunately, you did not pass the test. Your leave has been rejected.'
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Get test result by student and test
   */
  async getTestResult(testId, studentId) {
    try {
      const result = await TestResult.findOne({
        test: testId,
        student: studentId
      }).populate([
        { path: 'test', select: 'title description totalMarks passMarks' },
        { path: 'student', select: 'name email' },
        { path: 'leave', select: 'startDate endDate status reason' }
      ])

      return result
    } catch (error) {
      throw error
    }
  }

  /**
   * Get all results for a student
   */
  async getStudentResults(studentId) {
    try {
      const results = await TestResult.find({ student: studentId })
        .populate([
          { path: 'test', select: 'title description totalMarks passMarks' },
          { path: 'leave', select: 'startDate endDate status reason' }
        ])
        .sort({ submittedAt: -1 })

      return results
    } catch (error) {
      throw error
    }
  }
}

export default new EvaluationService()
