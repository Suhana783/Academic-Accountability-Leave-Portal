import express from 'express'
import {
  createTest,
  getAllTests,
  getTestById,
  getTestByLeaveId,
  updateTest,
  deleteTest,
  getMyTests,
  submitTest,
  getTestResult,
  getMyResults,
  getMyStatistics,
  getAllResults,
  getResultsByStudent
} from '../controllers/testController.js'
import { protect, adminOnly, studentOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// Admin routes
router.post('/', protect, adminOnly, createTest)
router.get('/', protect, adminOnly, getAllTests)
router.put('/:id', protect, adminOnly, updateTest)
router.delete('/:id', protect, adminOnly, deleteTest)
router.get('/results/all', protect, adminOnly, getAllResults)
router.get('/results/student/:studentId', protect, adminOnly, getResultsByStudent)

// Student routes
router.get('/my-tests', protect, studentOnly, getMyTests)
router.post('/:id/submit', protect, studentOnly, submitTest)
router.get('/results/my-results', protect, studentOnly, getMyResults)
router.get('/statistics/me', protect, studentOnly, getMyStatistics)

// Both admin and student can access
router.get('/:id', protect, getTestById)
router.get('/leave/:leaveId', protect, getTestByLeaveId)
router.get('/:id/result', protect, getTestResult)

export default router
