import express from 'express'
import {
  createTest,
  getAllTests,
  getTestById,
  getTestByLeaveId,
  updateTest,
  deleteTest,
  getMyTests
} from '../controllers/testController.js'
import { protect, adminOnly, studentOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// Admin routes
router.post('/', protect, adminOnly, createTest)
router.get('/', protect, adminOnly, getAllTests)
router.put('/:id', protect, adminOnly, updateTest)
router.delete('/:id', protect, adminOnly, deleteTest)

// Student routes
router.get('/my-tests', protect, studentOnly, getMyTests)

// Both admin and student can access
router.get('/:id', protect, getTestById)
router.get('/leave/:leaveId', protect, getTestByLeaveId)

export default router
