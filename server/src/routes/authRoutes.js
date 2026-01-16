import express from 'express'
import { login, getMe, logout, createStudent, createAdmin } from '../controllers/authController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/login', login)

// Protected routes
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)

// Admin-only routes
router.post('/create-student', protect, restrictTo('admin'), createStudent)
router.post('/create-admin', protect, restrictTo('admin'), createAdmin)

export default router
