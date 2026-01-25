import User from '../models/User.js'
import { generateToken } from '../services/authService.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Validate required fields
  if (!email || !password) {
    return errorResponse(res, 400, 'Please provide email and password')
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return errorResponse(res, 401, 'Invalid email or password')
  }

  // Check if user is active
  if (!user.isActive) {
    return errorResponse(res, 401, 'Your account has been deactivated. Please contact admin.')
  }

  // Compare password
  const isPasswordCorrect = await user.comparePassword(password)

  if (!isPasswordCorrect) {
    return errorResponse(res, 401, 'Invalid email or password')
  }

  // Generate token
  const token = generateToken(user._id)

  // Send response
  successResponse(res, 200, 'Login successful', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      leaveBalance: user.leaveBalance
    },
    token
  })
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  successResponse(res, 200, 'User details retrieved successfully', { user })
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // In JWT-based auth, logout is handled on client side by removing token
  // This endpoint is optional and can be used for logging/tracking purposes
  successResponse(res, 200, 'Logout successful', null)
})

// @desc    Create a new student (Admin only)
// @route   POST /api/auth/create-student
// @access  Private/Admin
export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body

  // Validate required fields
  if (!name || !email || !password) {
    return errorResponse(res, 400, 'Please provide name, email, and password')
  }

  // Check if user already exists
  const userExists = await User.findOne({ email })
  if (userExists) {
    return errorResponse(res, 400, 'User with this email already exists')
  }

  // Create student user
  const user = await User.create({
    name,
    email,
    password,
    role: 'student',
    department
  })

  // Send response (no token for created user)
  successResponse(res, 201, 'Student created successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      leaveBalance: user.leaveBalance
    }
  })
})

// @desc    Create a new admin (Admin only)
// @route   POST /api/auth/create-admin
// @access  Private/Admin
export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  // Validate required fields
  if (!name || !email || !password) {
    return errorResponse(res, 400, 'Please provide name, email, and password')
  }

  // Check if user already exists
  const userExists = await User.findOne({ email })
  if (userExists) {
    return errorResponse(res, 400, 'User with this email already exists')
  }

  // Create admin user
  const user = await User.create({
    name,
    email,
    password,
    role: 'admin'
  })

  // Send response (no token for created user)
  successResponse(res, 201, 'Admin created successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
})

// @desc    Delete a user (Admin only)
// @route   DELETE /api/auth/remove-user
// @access  Private/Admin
export const removeUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Validate required fields
  if (!email || !password) {
    return errorResponse(res, 400, 'Please provide email and password')
  }

  // Find user with password field
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return errorResponse(res, 404, 'User not found')
  }

  // Verify password before deletion
  const isPasswordCorrect = await user.comparePassword(password)

  if (!isPasswordCorrect) {
    return errorResponse(res, 401, 'Invalid password')
  }

  // Get user details before deletion
  const deletedUserInfo = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }

  // Delete the user
  await User.deleteOne({ _id: user._id })

  successResponse(res, 200, 'User removed successfully', {
    user: deletedUserInfo
  })
})

// @desc    Get all students (Admin only)
// @route   GET /api/auth/students
// @access  Private/Admin
export const getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).select('+password')

  successResponse(res, 200, 'Students retrieved successfully', {
    students: students.map(s => ({
      id: s._id,
      name: s.name,
      email: s.email,
      password: s.password,
      department: s.department,
      leaveBalance: s.leaveBalance,
      isActive: s.isActive,
      createdAt: s.createdAt
    }))
  })
})

// @desc    Get all admins (Admin only)
// @route   GET /api/auth/admins
// @access  Private/Admin
export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' }).select('+password')

  successResponse(res, 200, 'Admins retrieved successfully', {
    admins: admins.map(a => ({
      id: a._id,
      name: a.name,
      email: a.email,
      password: a.password,
      department: a.department,
      isActive: a.isActive,
      createdAt: a.createdAt
    }))
  })
});

