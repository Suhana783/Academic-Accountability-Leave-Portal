import Test from '../models/Test.js'
import Leave from '../models/Leave.js'
import TestResult from '../models/TestResult.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import evaluationService from '../services/evaluationService.js'
import automaticTestService from '../services/automaticTestService.js'

// @desc    Create test for a leave request (Admin)
// @route   POST /api/test
// @access  Private (Admin)
export const createTest = asyncHandler(async (req, res) => {
  const {
    leaveId,
    title,
    description,
    mcqQuestions,
    codingQuestions,
    passMarks,
    duration
  } = req.body

  // Validate required fields
  if (!leaveId || !title) {
    return errorResponse(res, 400, 'Please provide leave ID and test title')
  }

  // Check if leave exists
  const leave = await Leave.findById(leaveId)
  if (!leave) {
    return errorResponse(res, 404, 'Leave request not found')
  }

  // Check if test already exists for this leave
  const existingTest = await Test.findOne({ leave: leaveId })
  if (existingTest) {
    return errorResponse(res, 400, 'Test already exists for this leave request')
  }

  // Create test
  const test = await Test.create({
    leave: leaveId,
    createdBy: req.user._id,
    title,
    description,
    mcqQuestions: mcqQuestions || [],
    codingQuestions: codingQuestions || [],
    passMarks: passMarks || 0,
    duration: duration || 3600
  })

  // Update leave status to test_assigned
  leave.status = 'test_assigned'
  leave.reviewedBy = req.user._id
  leave.reviewedAt = new Date()
  await leave.save()

  // Populate references
  await test.populate('leave')
  await test.populate('createdBy', 'name email')

  successResponse(res, 201, 'Test created successfully', { test })
})

// @desc    Get test by ID
// @route   GET /api/test/:id
// @access  Private
export const getTestById = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id)
    .populate({
      path: 'leave',
      populate: {
        path: 'student',
        select: 'name email department'
      }
    })
    .populate('createdBy', 'name email')

  if (!test) {
    return errorResponse(res, 404, 'Test not found')
  }

  successResponse(res, 200, 'Test retrieved successfully', { test })
})

// @desc    Get test by leave ID
// @route   GET /api/test/leave/:leaveId
// @access  Private
export const getTestByLeaveId = asyncHandler(async (req, res) => {
  const test = await Test.findOne({ leave: req.params.leaveId })
    .populate({
      path: 'leave',
      populate: {
        path: 'student',
        select: 'name email department'
      }
    })
    .populate('createdBy', 'name email')

  if (!test) {
    return errorResponse(res, 404, 'No test found for this leave request', null)
  }

  // Students can only see tests for their own leave requests
  if (req.user.role === 'student') {
    const leave = await Leave.findById(test.leave._id)
    if (leave.student.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to access this test', null)
    }
  }

  successResponse(res, 200, 'Test retrieved successfully', { test })
})

// @desc    Update test (Admin)
// @route   PUT /api/test/:id
// @access  Private (Admin)
export const updateTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id)

  if (!test) {
    return errorResponse(res, 404, 'Test not found')
  }

  const {
    title,
    description,
    mcqQuestions,
    codingQuestions,
    passMarks,
    isActive
  } = req.body

  // Update fields
  if (title) test.title = title
  if (description) test.description = description
  if (mcqQuestions) test.mcqQuestions = mcqQuestions
  if (codingQuestions) test.codingQuestions = codingQuestions
  if (passMarks !== undefined) test.passMarks = passMarks
  if (isActive !== undefined) test.isActive = isActive

  await test.save()

  await test.populate({
    path: 'leave',
    populate: {
      path: 'student',
      select: 'name email department'
    }
  })
  await test.populate('createdBy', 'name email')

  successResponse(res, 200, 'Test updated successfully', { test })
})

// @desc    Delete test (Admin)
// @route   DELETE /api/test/:id
// @access  Private (Admin)
export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id)

  if (!test) {
    return errorResponse(res, 404, 'Test not found')
  }

  await Test.findByIdAndDelete(req.params.id)

  successResponse(res, 200, 'Test deleted successfully', null)
})

// @desc    Get all tests for admin
// @route   GET /api/test
// @access  Private (Admin)
export const getAllTests = asyncHandler(async (req, res) => {
  const tests = await Test.find()
    .populate({
      path: 'leave',
      populate: {
        path: 'student',
        select: 'name email department'
      }
    })
    .populate('createdBy', 'name email')
    .sort('-createdAt')

  successResponse(res, 200, 'Tests retrieved successfully', {
    count: tests.length,
    tests
  })
})

// @desc    Get tests for student
// @route   GET /api/test/my-tests
// @access  Private (Student)
export const getMyTests = asyncHandler(async (req, res) => {
  // Find all leaves for the current student
  const leaves = await Leave.find({ student: req.user._id })

  const leaveIds = leaves.map((leave) => leave._id)

  // Find tests for those leaves
  const tests = await Test.find({ leave: { $in: leaveIds } })
    .populate({
      path: 'leave',
      populate: {
        path: 'student',
        select: 'name email department'
      }
    })
    .populate('createdBy', 'name email')
    .sort('-createdAt')

  successResponse(res, 200, 'Tests retrieved successfully', {
    count: tests.length,
    tests
  })
})

// ============================================
// TEST SUBMISSION AND EVALUATION CONTROLLERS
// ============================================

// @desc    Submit test (Student)
// @route   POST /api/test/:id/submit
// @access  Private (Student)
export const submitTest = asyncHandler(async (req, res) => {
  const testId = req.params.id
  const studentId = req.user._id
  const { mcqAnswers, codingAnswers, timeTaken, tabSwitchCount } = req.body

  // Prepare submission object
  const submission = {
    mcqAnswers: mcqAnswers || [],
    codingAnswers: codingAnswers || [],
    timeTaken: timeTaken || 0,
    tabSwitchCount: tabSwitchCount || 0
  }

  try {
    // Process submission through evaluation service
    const result = await evaluationService.completeSubmission(
      testId,
      studentId,
      submission
    )

    successResponse(res, 201, result.message, {
      testResult: result.testResult,
      leaveStatus: result.leaveStatus
    })
  } catch (error) {
    return errorResponse(res, 400, error.message)
  }
})

// @desc    Get test result (Student/Admin)
// @route   GET /api/test/:id/result
// @access  Private
export const getTestResult = asyncHandler(async (req, res) => {
  const testId = req.params.id

  let result

  if (req.user.role === 'student') {
    // Students can only see their own results
    result = await evaluationService.getTestResult(testId, req.user._id)
  } else {
    // Admins can see any result
    result = await TestResult.findOne({ test: testId }).populate([
      { path: 'test', select: 'title description totalMarks passPercentage' },
      { path: 'student', select: 'name email department' },
      { path: 'leave', select: 'startDate endDate status reason retestRequested retestApproved retestUsed reevaluationUsed' }
    ])
  }

  if (!result) {
    return errorResponse(res, 404, 'Test result not found')
  }

  successResponse(res, 200, 'Test result retrieved successfully', { result })
})

// @desc    Reevaluate test result
// @route   POST /api/test/:id/reevaluate
// @access  Private (Student/Admin)
export const reevaluateTest = asyncHandler(async (req, res) => {
  const testId = req.params.id

  // Find the test result
  const testResult = await TestResult.findOne({ test: testId })
    .populate('student', 'name email')
    .populate('leave')

  if (!testResult) {
    return errorResponse(res, 404, 'Test result not found')
  }

  // Enforce single reevaluation per leave/test
  const leave = await Leave.findById(testResult.leave._id)
  if (!leave) {
    return errorResponse(res, 404, 'Associated leave not found')
  }

  if (leave.reevaluationUsed) {
    return errorResponse(res, 400, 'Reevaluation already used for this leave')
  }

  // If student, verify it's their own result
  if (req.user.role === 'student' && testResult.student._id.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'You can only reevaluate your own test')
  }

  try {
    // IMPORTANT: Fetch the original test questions from the database to get correct answers
    const test = await Test.findById(testId)
    
    if (!test) {
      return errorResponse(res, 404, 'Test not found')
    }

    // Reevaluate MCQ answers using the ORIGINAL test questions as source of truth
    let mcqScore = 0
    const reevaluatedMcqAnswers = testResult.mcqAnswers.map(ans => {
      // Get the original question from the test
      const originalQuestion = test.mcqQuestions[ans.questionIndex]
      
      if (!originalQuestion) {
        console.error(`Question ${ans.questionIndex} not found in test`)
        return ans
      }

      const questionMarks = originalQuestion.marks || 1
      
      // Convert both to numbers for safe comparison
      const submitted = Number(ans.selectedAnswer)
      const correct = Number(originalQuestion.correctAnswer)
      const isCorrect = submitted === correct
      const marksAwarded = isCorrect ? questionMarks : 0
      
      console.log(`📝 MCQ Q${ans.questionIndex + 1}: Submitted=${submitted}, Correct=${correct}, Match=${isCorrect}, Marks=${marksAwarded}`)
      console.log(`   Question: "${originalQuestion.question.substring(0, 50)}..."`)
      
      mcqScore += marksAwarded
      
      return {
        questionIndex: ans.questionIndex,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: correct,
        isCorrect,
        marksAwarded
      }
    })

    // Reevaluate coding answers using original test questions
    let codingScore = 0
    const reevaluatedCodingAnswers = testResult.codingAnswers.map(ans => {
      const originalQuestion = test.codingQuestions[ans.questionIndex]
      
      if (!originalQuestion) {
        console.error(`Coding question ${ans.questionIndex} not found in test`)
        return ans
      }

      const questionMarks = originalQuestion.marks || 1
      
      const submitted = (ans.submittedOutput || '').trim()
      const expected = (originalQuestion.expectedOutput || '').trim()
      const isCorrect = submitted === expected
      const marksAwarded = isCorrect ? questionMarks : 0
      
      console.log(`💻 Coding Q${ans.questionIndex + 1}: Match=${isCorrect}, Marks=${marksAwarded}`)
      
      codingScore += marksAwarded
      
      return {
        questionIndex: ans.questionIndex,
        submittedOutput: ans.submittedOutput,
        expectedOutput: expected,
        isCorrect,
        marksAwarded
      }
    })

    // Calculate new scores
    const totalScore = mcqScore + codingScore
    const maxScore = testResult.maxScore
    const passed = totalScore >= testResult.passMarks
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

    console.log(`✅ Reevaluation: ${totalScore}/${maxScore} (${percentage}%) - ${passed ? 'PASSED' : 'FAILED'}`)

    // Generate feedback
    const { generateFeedback } = await import('../utils/evaluationHelper.js')
    const feedback = generateFeedback(totalScore, maxScore, passed)

    // Update the result
    testResult.mcqAnswers = reevaluatedMcqAnswers
    testResult.codingAnswers = reevaluatedCodingAnswers
    testResult.mcqScore = mcqScore
    testResult.codingScore = codingScore
    testResult.totalScore = totalScore
    testResult.passed = passed
    testResult.percentage = percentage
    testResult.feedback = feedback

    await testResult.save()

    // Mark reevaluation consumed
    leave.reevaluationUsed = true
    await leave.save()

    // Update leave status based on new result
    await evaluationService.updateLeaveStatus(testResult.leave._id, passed)

    // Populate and return updated result
    await testResult.populate([
      { path: 'test', select: 'title description totalMarks passMarks' },
      { path: 'student', select: 'name email department' },
      { path: 'leave', select: 'startDate endDate status reason retestRequested retestApproved retestUsed reevaluationUsed' }
    ])

    successResponse(res, 200, 'Test reevaluated successfully', { result: testResult })
  } catch (error) {
    console.error('Reevaluation error:', error)
    return errorResponse(res, 400, error.message)
  }
})

// @desc    Request a retest (Student) - only once
// @route   POST /api/test/:id/retest/request
// @access  Private (Student)
export const requestRetest = asyncHandler(async (req, res) => {
  const testId = req.params.id

  const testResult = await TestResult.findOne({ test: testId, student: req.user._id })
  if (!testResult) {
    return errorResponse(res, 404, 'Test result not found for this student')
  }

  const leave = await Leave.findById(testResult.leave)
  if (!leave) {
    return errorResponse(res, 404, 'Associated leave not found')
  }

  if (leave.retestUsed) {
    return errorResponse(res, 400, 'Retest already used for this leave')
  }

  if (leave.retestApproved) {
    return errorResponse(res, 400, 'Retest already approved')
  }

  if (leave.retestRequested) {
    return errorResponse(res, 400, 'Retest request is already pending admin approval')
  }

  leave.retestRequested = true
  leave.retestApproved = false
  await leave.save()

  successResponse(res, 200, 'Retest requested. Await admin approval.', { leave })
})

// @desc    Approve a retest (Admin)
// @route   POST /api/test/:id/retest/approve
// @access  Private (Admin)
export const approveRetest = asyncHandler(async (req, res) => {
  const testId = req.params.id

  const testResult = await TestResult.findOne({ test: testId })
  if (!testResult) {
    return errorResponse(res, 404, 'Test result not found')
  }

  const leave = await Leave.findById(testResult.leave)
  if (!leave) {
    return errorResponse(res, 404, 'Associated leave not found')
  }

  if (leave.retestUsed) {
    return errorResponse(res, 400, 'Retest already used for this leave')
  }

  if (leave.retestApproved) {
    return errorResponse(res, 400, 'Retest already approved')
  }

  leave.retestApproved = true
  leave.retestRequested = false
  leave.status = 'test_assigned'
  leave.reviewedBy = req.user._id
  leave.reviewedAt = new Date()
  await leave.save()

  successResponse(res, 200, 'Retest approved. Student can retake once.', { leave })
})

// @desc    Get all test results for current student
// @route   GET /api/test/results/my-results
// @access  Private (Student)
export const getMyResults = asyncHandler(async (req, res) => {
  const results = await evaluationService.getStudentResults(req.user._id)

  successResponse(res, 200, 'Test results retrieved successfully', {
    count: results.length,
    results
  })
})

// @desc    Get all test results (Admin)
// @route   GET /api/test/results/all
// @access  Private (Admin)
export const getAllResults = asyncHandler(async (req, res) => {
  const results = await TestResult.find()
    .populate('test', 'title totalMarks passPercentage')
    .populate('student', 'name email department')
    .populate('leave', 'startDate endDate reason status')
    .sort('-submittedAt')

  successResponse(res, 200, 'Test results retrieved successfully', {
    count: results.length,
    results
  })
})

// @desc    Get test results by student (Admin)
// @route   GET /api/test/results/student/:studentId
// @access  Private (Admin)
export const getResultsByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params

  const results = await TestResult.find({ student: studentId })
    .populate('test', 'title totalMarks passPercentage')
    .populate('student', 'name email department')
    .populate('leave', 'startDate endDate reason status')
    .sort('-submittedAt')

  // Calculate statistics
  const totalTests = results.length
  const passedTests = results.filter(r => r.passed).length
  const failedTests = totalTests - passedTests
  const averagePercentage = totalTests > 0
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalTests)
    : 0

  successResponse(res, 200, 'Student test results retrieved successfully', {
    count: results.length,
    results,
    statistics: {
      totalTests,
      passedTests,
      failedTests,
      averagePercentage
    }
  })
})

// @desc    Get my test statistics (Student)
// @route   GET /api/test/my-statistics
// @access  Private (Student)
export const getMyStatistics = asyncHandler(async (req, res) => {
  const studentId = req.user._id

  // Pull all leaves for the student so we can include tests that are assigned but not yet submitted
  const leaves = await Leave.find({ student: studentId }).select('_id')
  const leaveIds = leaves.map((leave) => leave._id)

  // All tests assigned to this student's leaves (even if not submitted)
  const assignedTests = await Test.find({ leave: { $in: leaveIds } }).select('_id')
  const assignedCount = assignedTests.length

  // All submitted results for the student
  const results = await TestResult.find({ student: studentId })

  const submittedCount = results.length
  const passedTests = results.filter((r) => r.passed).length
  const failedTests = submittedCount - passedTests
  const averageScore = submittedCount > 0
    ? results.reduce((sum, r) => sum + r.percentage, 0) / submittedCount
    : 0

  const statistics = {
    totalTests: assignedCount,
    assignedTests: assignedCount,
    submittedTests: submittedCount,
    pendingTests: Math.max(assignedCount - submittedCount, 0),
    passedTests,
    failedTests,
    averageScore: Math.round(averageScore * 100) / 100,
    passRate: submittedCount > 0 ? Math.round((passedTests / submittedCount) * 100) : 0,
    completionRate: assignedCount > 0 ? Math.round((submittedCount / assignedCount) * 100) : 0
  }

  successResponse(res, 200, 'Statistics retrieved successfully', { statistics })
})

// @desc    Delete test result (Admin)
// @desc    Delete test result
// @route   DELETE /api/test/results/:resultId
// @access  Private (Admin or Student for own result retake)
export const deleteTestResult = asyncHandler(async (req, res) => {
  const { resultId } = req.params

  const result = await TestResult.findById(resultId)

  if (!result) {
    return errorResponse(res, 404, 'Test result not found')
  }

  const leave = await Leave.findById(result.leave)
  if (!leave) {
    return errorResponse(res, 404, 'Associated leave not found')
  }

  // Check if student is trying to delete their own result (for retake)
  if (req.user.role === 'student' && result.student.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'You can only delete your own test result')
  }

  // Students can only delete if retest is approved and not already used
  if (req.user.role === 'student') {
    if (!leave.retestApproved) {
      return errorResponse(res, 400, 'Retest must be approved by admin before deleting result')
    }
    if (leave.retestUsed) {
      return errorResponse(res, 400, 'Retest already used for this leave')
    }
  }

  await TestResult.findByIdAndDelete(resultId)

  // Mark retest consumption when applicable
  if (req.user.role === 'student' && leave.retestApproved) {
    leave.retestUsed = true
    leave.retestApproved = false
    leave.retestRequested = false
    leave.status = 'test_assigned'
    await leave.save()
  }

  successResponse(res, 200, 'Test result deleted successfully', null)
})

// ============================================
// AUTOMATIC TEST GENERATION
// ============================================

// @desc    Generate test automatically based on criteria
// @route   POST /api/test/auto-generate
// @access  Private (Admin)
export const generateAutomaticTest = asyncHandler(async (req, res) => {
  const {
    leaveId,
    subject,
    difficulty,
    numberOfQuestions,
    totalMarks,
    passingPercentage,
    duration,
    title,
    description
  } = req.body

  // Validate required fields
  if (!leaveId || !subject || !difficulty || !numberOfQuestions || !totalMarks) {
    return errorResponse(
      res,
      400,
      'Please provide all required fields: leaveId, subject, difficulty, numberOfQuestions, totalMarks'
    )
  }

  try {
    // Generate test data using service
    const testData = await automaticTestService.generateTest({
      leaveId,
      subject,
      difficulty,
      numberOfQuestions: Number(numberOfQuestions),
      totalMarks: Number(totalMarks),
      passingPercentage: Number(passingPercentage) || 60,
      duration: Number(duration) || 3600,
      title,
      description
    })

    // Create test with admin as creator
    const test = await Test.create({
      ...testData,
      createdBy: req.user._id
    })

    // Update leave status to test_assigned
    const leave = await Leave.findById(leaveId)
    leave.status = 'test_assigned'
    leave.reviewedBy = req.user._id
    leave.reviewedAt = new Date()
    await leave.save()

    // Populate references
    await test.populate('leave')
    await test.populate('createdBy', 'name email')

    successResponse(res, 201, 'Test generated and assigned successfully', { test })
  } catch (error) {
    return errorResponse(res, 400, error.message)
  }
})

// @desc    Get available subjects from question bank
// @route   GET /api/test/subjects
// @access  Private (Admin)
export const getAvailableSubjects = asyncHandler(async (req, res) => {
  try {
    const subjects = await automaticTestService.getAvailableSubjects()
    successResponse(res, 200, 'Subjects retrieved successfully', { subjects })
  } catch (error) {
    return errorResponse(res, 400, error.message)
  }
})

// @desc    Get question count by criteria
// @route   GET /api/test/question-count
// @access  Private (Admin)
export const getQuestionCount = asyncHandler(async (req, res) => {
  const { subject, difficulty } = req.query

  if (!subject || !difficulty) {
    return errorResponse(res, 400, 'Please provide subject and difficulty')
  }

  try {
    const count = await automaticTestService.getQuestionCount(subject, difficulty)
    successResponse(res, 200, 'Question count retrieved successfully', { count })
  } catch (error) {
    return errorResponse(res, 400, error.message)
  }
})

