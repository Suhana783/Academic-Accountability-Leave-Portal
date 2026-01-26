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
  reevaluateTest,
  requestRetest,
  approveRetest,
  getMyResults,
  getMyStatistics,
  getAllResults,
  getResultsByStudent,
  deleteTestResult,
  generateAutomaticTest,
  getAvailableSubjects,
  getQuestionCount
} from '../controllers/testController.js'
import { protect, adminOnly, studentOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// Admin routes - general
router.post('/', protect, adminOnly, createTest)
router.post('/auto-generate', protect, adminOnly, generateAutomaticTest)
router.get('/', protect, adminOnly, getAllTests)
router.get('/subjects', protect, adminOnly, getAvailableSubjects)
router.get('/question-count', protect, adminOnly, getQuestionCount)
router.put('/:id', protect, adminOnly, updateTest)
router.delete('/:id', protect, adminOnly, deleteTest)

// Results routes - specific paths before :id wildcard
router.get('/results/all', protect, adminOnly, getAllResults)
router.get('/results/student/:studentId', protect, adminOnly, getResultsByStudent)
router.delete('/results/:resultId/retake', protect, deleteTestResult) // Allow students to delete own result for retake - MUST come before general delete
router.delete('/results/:resultId', protect, adminOnly, deleteTestResult) // Admin-only delete

// Student routes - specific paths
router.get('/my-tests', protect, studentOnly, getMyTests)
router.post('/:id/submit', protect, studentOnly, submitTest)
router.post('/:id/reevaluate', protect, reevaluateTest)
router.post('/:id/retest/request', protect, studentOnly, requestRetest)
router.post('/:id/retest/approve', protect, adminOnly, approveRetest)
router.get('/results/my-results', protect, studentOnly, getMyResults)
router.get('/statistics/me', protect, studentOnly, getMyStatistics)

// Both admin and student can access - generic routes AFTER specific ones
router.get('/leave/:leaveId', protect, getTestByLeaveId)
router.get('/:id/result', protect, getTestResult)
router.get('/:id', protect, getTestById)

export default router
