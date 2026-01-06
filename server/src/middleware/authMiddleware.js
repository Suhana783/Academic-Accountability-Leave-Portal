import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { errorResponse } from '../utils/responseHelper.js'

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    // Check if token exists
    if (!token) {
      return errorResponse(res, 401, 'Not authorized, no token provided')
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        return errorResponse(res, 401, 'User not found')
      }

      if (!req.user.isActive) {
        return errorResponse(res, 401, 'User account is inactive')
      }

      next()
    } catch (error) {
      return errorResponse(res, 401, 'Not authorized, token invalid or expired')
    }
  } catch (error) {
    return errorResponse(res, 500, 'Server error in authentication')
  }
}

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. This action requires ${roles.join(' or ')} role.`
      )
    }
    next()
  }
}

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Access denied. Admin privileges required.')
  }
  next()
}

// Student only middleware
export const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return errorResponse(res, 403, 'Access denied. Student privileges required.')
  }
  next()
}
