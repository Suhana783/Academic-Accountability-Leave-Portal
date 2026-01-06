import Test from '../models/Test.js'
import Leave from '../models/Leave.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'
import { asyncHandler } from '../middleware/errorHandler.js'

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
    passPercentage,
    timeLimit,
    scheduledAt,
    expiresAt
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

  // Validate questions
  if (
    (!mcqQuestions || mcqQuestions.length === 0) &&
    (!codingQuestions || codingQuestions.length === 0)
  ) {
    return errorResponse(res, 400, 'Test must have at least one question (MCQ or Coding)')
  }

  // Create test
  const test = await Test.create({
    leave: leaveId,
    createdBy: req.user._id,
    title,
    description,
    mcqQuestions: mcqQuestions || [],
    codingQuestions: codingQuestions || [],
    passPercentage: passPercentage || 60,
    timeLimit: timeLimit || 60,
    scheduledAt,
    expiresAt
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

// @desc    Get all tests (Admin)
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

  // Students can only see tests for their own leave requests
  if (req.user.role === 'student') {
    const leave = await Leave.findById(test.leave._id)
    if (leave.student.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to access this test')
    }
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
    return errorResponse(res, 404, 'No test found for this leave request')
  }

  // Students can only see tests for their own leave requests
  if (req.user.role === 'student') {
    const leave = await Leave.findById(test.leave._id)
    if (leave.student.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to access this test')
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
    passPercentage,
    timeLimit,
    scheduledAt,
    expiresAt,
    isActive
  } = req.body

  // Update fields
  if (title) test.title = title
  if (description) test.description = description
  if (mcqQuestions) test.mcqQuestions = mcqQuestions
  if (codingQuestions) test.codingQuestions = codingQuestions
  if (passPercentage !== undefined) test.passPercentage = passPercentage
  if (timeLimit) test.timeLimit = timeLimit
  if (scheduledAt) test.scheduledAt = scheduledAt
  if (expiresAt) test.expiresAt = expiresAt
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

  // Update associated leave status back to pending
  const leave = await Leave.findById(test.leave)
  if (leave && leave.status === 'test_assigned') {
    leave.status = 'pending'
    await leave.save()
  }

  await test.deleteOne()

  successResponse(res, 200, 'Test deleted successfully', null)
})

// @desc    Get tests for current student's leaves
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
