import Test from '../models/Test.js'
import TestResult from '../models/TestResult.js'
import Leave from '../models/Leave.js'
import {
  evaluateAllMCQs,
  evaluateAllCodingQuestions,
  generateFeedback
} from '../utils/evaluationHelper.js'

/**
 * Service for handling test evaluation and result processing
 */
class EvaluationService {
  /**
   * Process and evaluate a test submission
   * @param {String} testId - Test ID
   * @param {String} studentId - Student ID
   * @param {Object} submission - Submission data (mcqAnswers, codingAnswers)
   * @returns {Object} - Evaluation result
   */
  async processTestSubmission(testId, studentId, submission) {
    try {
      // 1. Fetch the test with all questions
      const test = await Test.findById(testId).populate('leave')

      if (!test) {
        throw new Error('Test not found')
      }

      // 2. Verify test belongs to this student's leave
      if (test.leave.student.toString() !== studentId) {
        throw new Error('Unauthorized: This test is not assigned to you')
      }

      // 3. Check if already submitted
      const existingResult = await TestResult.findOne({
        test: testId,
        student: studentId
      })

      if (existingResult) {
        throw new Error('Test already submitted. Multiple submissions not allowed')
      }

      // 4. Evaluate MCQ Questions
      const mcqEvaluation = evaluateAllMCQs(
        test.mcqQuestions,
        submission.mcqAnswers
      )

      // 5. Evaluate Coding Questions
      const codingEvaluation = evaluateAllCodingQuestions(
        test.codingQuestions,
        submission.codingAnswers
      )

      // 6. Calculate total scores
      const mcqScore = mcqEvaluation.totalScore
      const codingScore = codingEvaluation.totalScore
      const totalScore = parseFloat((mcqScore + codingScore).toFixed(2))
      const maxScore = test.totalMarks
      const percentage = parseFloat(((totalScore / maxScore) * 100).toFixed(2))
      const passed = percentage >= test.passPercentage

      // 7. Generate feedback
      const feedback = generateFeedback(percentage, passed)

      // 8. Create result object
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
        percentage,
        passed,
        passPercentage: test.passPercentage,
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
   * @param {String} leaveId - Leave ID
   * @param {Boolean} passed - Whether student passed the test
   * @returns {Object} - Updated leave
   */
  async updateLeaveStatus(leaveId, passed) {
    try {
      const leave = await Leave.findById(leaveId)

      if (!leave) {
        throw new Error('Leave not found')
      }

      // Update status based on test result
      leave.status = passed ? 'approved' : 'rejected'
      leave.reviewedAt = new Date()
      leave.adminRemarks = passed
        ? 'Leave approved based on successful test completion'
        : 'Leave rejected due to test failure. Please retake the test.'

      await leave.save()

      return leave
    } catch (error) {
      throw error
    }
  }

  /**
   * Complete submission process: evaluate test and update leave
   * @param {String} testId - Test ID
   * @param {String} studentId - Student ID
   * @param {Object} submission - Submission data
   * @returns {Object} - Complete result with leave update status
   */
  async completeSubmission(testId, studentId, submission) {
    try {
      // 1. Process and evaluate the test
      const resultData = await this.processTestSubmission(
        testId,
        studentId,
        submission
      )

      // 2. Save the result
      const testResult = await TestResult.create(resultData)

      // 3. Update leave status
      const updatedLeave = await this.updateLeaveStatus(
        resultData.leave,
        resultData.passed
      )

      // 4. Populate references for response
      await testResult.populate([
        { path: 'test', select: 'title description totalMarks passPercentage' },
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
   * @param {String} testId - Test ID
   * @param {String} studentId - Student ID
   * @returns {Object} - Test result
   */
  async getTestResult(testId, studentId) {
    try {
      const result = await TestResult.findOne({
        test: testId,
        student: studentId
      }).populate([
        { path: 'test', select: 'title description totalMarks passPercentage' },
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
   * @param {String} studentId - Student ID
   * @returns {Array} - Array of test results
   */
  async getStudentResults(studentId) {
    try {
      const results = await TestResult.find({ student: studentId })
        .populate([
          { path: 'test', select: 'title description totalMarks passPercentage' },
          { path: 'leave', select: 'startDate endDate status reason' }
        ])
        .sort({ submittedAt: -1 })

      return results
    } catch (error) {
      throw error
    }
  }

  /**
   * Get statistics for a student
   * @param {String} studentId - Student ID
   * @returns {Object} - Statistics
   */
  async getStudentStatistics(studentId) {
    try {
      const results = await TestResult.find({ student: studentId })

      const totalTests = results.length
      const passedTests = results.filter((r) => r.passed).length
      const failedTests = totalTests - passedTests
      const averagePercentage =
        totalTests > 0
          ? parseFloat(
              (
                results.reduce((sum, r) => sum + r.percentage, 0) / totalTests
              ).toFixed(2)
            )
          : 0

      return {
        totalTests,
        passedTests,
        failedTests,
        averagePercentage,
        passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0
      }
    } catch (error) {
      throw error
    }
  }
}

export default new EvaluationService()
