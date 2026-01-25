import Leave from '../models/Leave.js'
import User from '../models/User.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Apply for leave (Student)
// @route   POST /api/leave
// @access  Private (Student)
export const applyLeave = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason, leaveType } = req.body

  // Validate required fields
  if (!startDate || !endDate || !reason) {
    return errorResponse(res, 400, 'Please provide start date, end date, and reason')
  }

  // Validate dates
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (start < today) {
    return errorResponse(res, 400, 'Start date cannot be in the past')
  }

  if (end < start) {
    return errorResponse(res, 400, 'End date must be after or equal to start date')
  }

  // Calculate leave duration
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  // Check leave balance
  const user = await User.findById(req.user._id)
  if (user.leaveBalance < diffDays) {
    return errorResponse(
      res,
      400,
      `Insufficient leave balance. You have ${user.leaveBalance} days remaining.`
    )
  }

  // Create leave request
  const leave = await Leave.create({
    student: req.user._id,
    startDate,
    endDate,
    reason,
    leaveType: leaveType || 'personal',
    status: 'pending'
  })

  // Populate student details
  await leave.populate('student', 'name email department')

  successResponse(res, 201, 'Leave application submitted successfully', { leave })
})

// @desc    Get all leave requests for current student
// @route   GET /api/leave/my-leaves
// @access  Private (Student)
export const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ student: req.user._id })
    .populate('student', 'name email department')
    .populate('reviewedBy', 'name email')
    .sort('-createdAt')

  successResponse(res, 200, 'Leave requests retrieved successfully', {
    count: leaves.length,
    leaves
  })
})

// @desc    Get single leave request
// @route   GET /api/leave/:id
// @access  Private
export const getLeaveById = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id)
    .populate('student', 'name email department')
    .populate('reviewedBy', 'name email')

  if (!leave) {
    return errorResponse(res, 404, 'Leave request not found')
  }

  // Check access: student can only see their own leaves, admin can see all
  if (req.user.role === 'student' && leave.student._id.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized to access this leave request')
  }

  successResponse(res, 200, 'Leave request retrieved successfully', { leave })
})

// @desc    Get all leave requests (Admin)
// @route   GET /api/leave
// @access  Private (Admin)
export const getAllLeaves = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query

  // Build query
  const query = {}

  if (status) {
    query.status = status
  }

  if (startDate && endDate) {
    query.startDate = { $gte: new Date(startDate) }
    query.endDate = { $lte: new Date(endDate) }
  }

  const leaves = await Leave.find(query)
    .populate('student', 'name email department')
    .populate('reviewedBy', 'name email')
    .sort('-createdAt')

  successResponse(res, 200, 'Leave requests retrieved successfully', {
    count: leaves.length,
    leaves
  })
})

// @desc    Update own pending leave (Student)
// @route   PUT /api/leave/:id
// @access  Private (Student - only when pending)
export const updateMyLeave = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason, leaveType } = req.body

  const leave = await Leave.findById(req.params.id)

  if (!leave) {
    return errorResponse(res, 404, 'Leave request not found')
  }

  // Ensure only the owner can edit
  if (leave.student.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized to edit this leave request')
  }

  // Only pending leaves can be edited
  if (leave.status !== 'pending') {
    return errorResponse(res, 400, 'Only pending leave requests can be edited')
  }

  // Validate required fields
  if (!startDate || !endDate || !reason) {
    return errorResponse(res, 400, 'Please provide start date, end date, and reason')
  }

  // Validate dates
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (start < today) {
    return errorResponse(res, 400, 'Start date cannot be in the past')
  }

  if (end < start) {
    return errorResponse(res, 400, 'End date must be after or equal to start date')
  }

  // Apply updates
  leave.startDate = start
  leave.endDate = end
  leave.reason = reason
  if (leaveType) {
    leave.leaveType = leaveType
  }

  // Saving will recalculate totalDays via pre-save hook
  await leave.save()

  await leave.populate('student', 'name email department')

  successResponse(res, 200, 'Leave request updated successfully', { leave })
})

// @desc    Update leave status (Admin)
// @route   PUT /api/leave/:id/status
// @access  Private (Admin)
export const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status, adminRemarks } = req.body

  if (!status) {
    return errorResponse(res, 400, 'Please provide status')
  }

  const validStatuses = ['pending', 'test_assigned', 'approved', 'rejected']
  if (!validStatuses.includes(status)) {
    return errorResponse(res, 400, `Status must be one of: ${validStatuses.join(', ')}`)
  }

  const leave = await Leave.findById(req.params.id)

  if (!leave) {
    return errorResponse(res, 404, 'Leave request not found')
  }

  // Update leave
  leave.status = status
  if (adminRemarks) {
    leave.adminRemarks = adminRemarks
  }
  leave.reviewedBy = req.user._id
  leave.reviewedAt = new Date()

  await leave.save()

  // If approved, deduct from leave balance
  if (status === 'approved') {
    const user = await User.findById(leave.student)
    user.leaveBalance -= leave.totalDays
    await user.save()
  }

  await leave.populate('student', 'name email department')
  await leave.populate('reviewedBy', 'name email')

  successResponse(res, 200, 'Leave status updated successfully', { leave })
})

// @desc    Delete leave request
// @route   DELETE /api/leave/:id
// @access  Private (Student - own leaves only)
export const deleteLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id)

  if (!leave) {
    return errorResponse(res, 404, 'Leave request not found')
  }

  // Check if student is deleting their own leave
  if (leave.student.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized to delete this leave request')
  }

  // Only pending leaves can be deleted
  if (leave.status !== 'pending') {
    return errorResponse(res, 400, 'Cannot delete leave request that is already processed')
  }

  await leave.deleteOne()

  successResponse(res, 200, 'Leave request deleted successfully', null)
})
