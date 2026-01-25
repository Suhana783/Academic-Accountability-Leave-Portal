import express from 'express'
import {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  getAllLeaves,
  updateLeaveStatus,
  deleteLeave,
  updateMyLeave
} from '../controllers/leaveController.js'
import { protect, adminOnly, studentOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// Student routes
router.post('/', protect, studentOnly, applyLeave)
router.get('/my-leaves', protect, studentOnly, getMyLeaves)
router.delete('/:id', protect, studentOnly, deleteLeave)
router.put('/:id', protect, studentOnly, updateMyLeave)

// Admin routes
router.get('/', protect, adminOnly, getAllLeaves)
router.put('/:id/status', protect, adminOnly, updateLeaveStatus)

// Both student and admin can access
router.get('/:id', protect, getLeaveById)

export default router
