import User from '../models/User.js'
import { generateToken } from '../services/authService.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body

  // Validate required fields
  if (!name || !email || !password) {
    return errorResponse(res, 400, 'Please provide name, email, and password')
  }

  // Check if user already exists
  const userExists = await User.findOne({ email })
  if (userExists) {
    return errorResponse(res, 400, 'User with this email already exists')
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    department
  })

  // Generate token
  const token = generateToken(user._id)

  // Send response
  successResponse(res, 201, 'User registered successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    },
    token
  })
})

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
