import { useEffect, useState } from 'react'
import { getAllLeaves, updateLeaveStatus } from '../services/leaveService'
import { generateAutomaticTest, getAvailableSubjects, getTestByLeave } from '../services/testService'
import { colors, spacing, borderRadius, typography, transitions, statusColors } from '../utils/designSystem'

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [testForm, setTestForm] = useState({
    subject: '',
    difficulty: 'medium',
    numberOfQuestions: 10,
    totalMarks: 100,
    passingPercentage: 60,
    duration: 1800
  })
  const [showViewTestModal, setShowViewTestModal] = useState(false)
  const [viewingTest, setViewingTest] = useState(null)
  const [loadingTest, setLoadingTest] = useState(false)

  const loadLeaves = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllLeaves()
      setLeaves(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaves()
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      const data = await getAvailableSubjects()
      setSubjects(data)
      if (data.length > 0) {
        setTestForm(prev => ({ ...prev, subject: data[0] }))
      }
    } catch (err) {
      console.error('Failed to load subjects:', err)
    }
  }

  const handleAssignTest = (leave) => {
    setSelectedLeave(leave)
    setShowTestModal(true)
  }

  const handleGenerateTest = async (e) => {
    e.preventDefault()
    if (!selectedLeave) return

    setActionLoading(`${selectedLeave._id}-test_assigned`)
    try {
      await generateAutomaticTest({
        leaveId: selectedLeave._id,
        ...testForm
      })
      setShowTestModal(false)
      setSelectedLeave(null)
      await loadLeaves()
    } catch (err) {
      setError(err.message || 'Failed to assign test')
    } finally {
      setActionLoading('')
    }
  }

  const handleViewTest = async (leave) => {
    setLoadingTest(true)
    setShowViewTestModal(true)
    try {
      const test = await getTestByLeave(leave._id)
      setViewingTest(test)
    } catch (err) {
      setError(err.message || 'Failed to load test')
      setShowViewTestModal(false)
    } finally {
      setLoadingTest(false)
    }
  }

  const getStatusBadge = (status) => {
    const badgeStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: `${spacing.xs} ${spacing.md}`,
      borderRadius: borderRadius.full,
      fontSize: '11px',
      fontWeight: '600',
      border: `1.5px solid`,
    }

    const statusConfig = {
      pending: { icon: '⏳', ...statusColors.pending },
      test_assigned: { icon: '📝', ...statusColors.test_assigned },
      approved: { icon: '✅', ...statusColors.approved },
      rejected: { icon: '❌', ...statusColors.rejected },
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <span style={{
        ...badgeStyle,
        background: config.bg,
        color: config.text,
        borderColor: config.border
      }}>
        <span>{config.icon}</span>
        <span>{status === 'test_assigned' ? 'Test Assigned' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    )
  }

  const handleStatusUpdate = async (leaveId, status) => {
    setActionLoading(`${leaveId}-${status}`)
    try {
      await updateLeaveStatus(leaveId, { status })
      await loadLeaves()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading('')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing.xxxl }}>
        <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>⏳</div>
        <p style={{ ...typography.body_lg, color: colors.gray_600 }}>Loading leave requests...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: spacing.xl, background: colors.danger_light, borderRadius: borderRadius.lg, color: colors.danger_dark }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: spacing.xxxl }}>
        <h1 style={{ ...typography.h1, margin: 0, color: colors.gray_900 }}>Leave Requests</h1>
        <p style={{ ...typography.body_lg, color: colors.gray_600, margin: `${spacing.md} 0 0 0` }}>
          Review and manage student leave requests
        </p>
      </div>

      <div style={{
        background: colors.white,
        border: `1px solid ${colors.gray_200}`,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        boxShadow: colors.shadow_sm
      }}>
        {leaves.length === 0 ? (
          <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.gray_600 }}>
            No leave requests found
          </div>
        ) : (
          <div>
            {leaves.map((leave, idx) => (
              <div
                key={leave._id}
                style={{
                  padding: spacing.lg,
                  borderBottom: idx !== leaves.length - 1 ? `1px solid ${colors.gray_200}` : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: spacing.lg,
                  transition: `background ${transitions.base}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.gray_50
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.white
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ ...typography.body, fontWeight: '600', color: colors.gray_900, fontSize: '16px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                    {leave.student?.name || leave.student?.username || 'Student'}
                  </div>
                  <p style={{ ...typography.body_sm, color: colors.gray_600, margin: `${spacing.sm} 0 0 0`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                    {leave.startDate?.slice(0, 10)} → {leave.endDate?.slice(0, 10)}
                  </p>
                  <p style={{ ...typography.body_sm, color: colors.gray_600, margin: `${spacing.sm} 0 0 0`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                    {leave.reason}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: spacing.md }}>
                  {getStatusBadge(leave.status)}
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {leave.status === 'test_assigned' && (
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => handleViewTest(leave)}
                        style={{ padding: `${spacing.xs} ${spacing.md}`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}
                      >
                        👁️ View Test
                      </button>
                    )}
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => handleStatusUpdate(leave._id, 'approved')}
                      disabled={actionLoading === `${leave._id}-approved`}
                      style={{ padding: `${spacing.xs} ${spacing.md}`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                      disabled={actionLoading === `${leave._id}-rejected`}
                      style={{ padding: `${spacing.xs} ${spacing.md}`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}
                    >
                      Reject
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => handleAssignTest(leave)}
                      disabled={actionLoading === `${leave._id}-test_assigned`}
                      style={{ padding: `${spacing.xs} ${spacing.md}`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}
                    >
                      Assign Test
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Assignment Modal */}
      {showTestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: colors.white,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ ...typography.h2, marginBottom: spacing.lg }}>Assign Test</h2>
            <form onSubmit={handleGenerateTest}>
              <div style={{ marginBottom: spacing.md }}>
                <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: '600' }}>Subject</label>
                <select
                  value={testForm.subject}
                  onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray_300}`,
                    fontSize: '14px'
                  }}
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: spacing.md }}>
                <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: '600' }}>Difficulty</label>
                <select
                  value={testForm.difficulty}
                  onChange={(e) => setTestForm({ ...testForm, difficulty: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray_300}`,
                    fontSize: '14px'
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div style={{ marginBottom: spacing.md }}>
                <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: '600' }}>Number of Questions</label>
                <input
                  type="number"
                  min="5"
                  max="20"
                  value={testForm.numberOfQuestions}
                  onChange={(e) => setTestForm({ ...testForm, numberOfQuestions: parseInt(e.target.value) })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray_300}`,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: spacing.md }}>
                <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: '600' }}>Total Marks</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={testForm.totalMarks}
                  onChange={(e) => setTestForm({ ...testForm, totalMarks: parseInt(e.target.value) })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray_300}`,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: spacing.md }}>
                <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: '600' }}>Passing Percentage</label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={testForm.passingPercentage}
                  onChange={(e) => setTestForm({ ...testForm, passingPercentage: parseInt(e.target.value) })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray_300}`,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: spacing.lg }}>
                <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: '600' }}>Duration (seconds)</label>
                <input
                  type="number"
                  min="600"
                  max="7200"
                  step="300"
                  value={testForm.duration}
                  onChange={(e) => setTestForm({ ...testForm, duration: parseInt(e.target.value) })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray_300}`,
                    fontSize: '14px'
                  }}
                />
                <small style={{ color: colors.gray_600 }}>
                  {Math.floor(testForm.duration / 60)} minutes
                </small>
              </div>

              <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setShowTestModal(false)
                    setSelectedLeave(null)
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Generating...' : 'Generate & Assign Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Test Modal */}
      {showViewTestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing.lg
        }}>
          <div style={{
            background: colors.white,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {loadingTest ? (
              <div style={{ textAlign: 'center', padding: spacing.xl }}>
                <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>⏳</div>
                <p style={{ ...typography.body_lg, color: colors.gray_600 }}>Loading test...</p>
              </div>
            ) : viewingTest ? (
              <>
                <div style={{ marginBottom: spacing.xl, borderBottom: `2px solid ${colors.gray_200}`, paddingBottom: spacing.lg }}>
                  <h2 style={{ ...typography.h2, marginBottom: spacing.sm }}>{viewingTest.title || 'Test Preview'}</h2>
                  <p style={{ ...typography.body, color: colors.gray_600, marginBottom: spacing.md }}>
                    {viewingTest.description}
                  </p>
                  <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', fontSize: '14px' }}>
                    <div>
                      <strong>Total Marks:</strong> {viewingTest.totalMarks}
                    </div>
                    <div>
                      <strong>Pass Marks:</strong> {viewingTest.passMarks}
                    </div>
                    <div>
                      <strong>Duration:</strong> {Math.floor(viewingTest.duration / 60)} minutes
                    </div>
                    <div>
                      <strong>Questions:</strong> {viewingTest.mcqQuestions?.length || 0}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: spacing.xl }}>
                  <h3 style={{ ...typography.h3, marginBottom: spacing.lg }}>Questions</h3>
                  {viewingTest.mcqQuestions && viewingTest.mcqQuestions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                      {viewingTest.mcqQuestions.map((q, index) => (
                        <div 
                          key={index}
                          style={{
                            padding: spacing.lg,
                            background: colors.gray_50,
                            borderRadius: borderRadius.md,
                            border: `1px solid ${colors.gray_200}`
                          }}
                        >
                          <div style={{ marginBottom: spacing.md }}>
                            <strong style={{ color: colors.primary }}>Question {index + 1}</strong>
                            <span style={{ marginLeft: spacing.sm, fontSize: '13px', color: colors.gray_600 }}>
                              ({q.marks} marks)
                            </span>
                          </div>
                          <p style={{ ...typography.body, marginBottom: spacing.md, fontWeight: '500' }}>
                            {q.question}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                            {q.options.map((option, optIndex) => (
                              <div 
                                key={optIndex}
                                style={{
                                  padding: spacing.sm,
                                  background: q.correctAnswer === optIndex ? colors.success_light : colors.white,
                                  border: `1px solid ${q.correctAnswer === optIndex ? colors.success : colors.gray_300}`,
                                  borderRadius: borderRadius.sm,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: spacing.sm
                                }}
                              >
                                <span style={{ 
                                  fontWeight: '600',
                                  minWidth: '24px',
                                  color: q.correctAnswer === optIndex ? colors.success_dark : colors.gray_700
                                }}>
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <span style={{ 
                                  color: q.correctAnswer === optIndex ? colors.success_dark : colors.gray_800
                                }}>
                                  {option}
                                </span>
                                {q.correctAnswer === optIndex && (
                                  <span style={{ marginLeft: 'auto', color: colors.success_dark, fontWeight: '600' }}>
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: colors.gray_600, textAlign: 'center', padding: spacing.xl }}>
                      No questions found in this test.
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: spacing.lg, borderTop: `1px solid ${colors.gray_200}` }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setShowViewTestModal(false)
                      setViewingTest(null)
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: spacing.xl }}>
                <p style={{ color: colors.gray_600 }}>No test data available.</p>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowViewTestModal(false)
                    setViewingTest(null)
                  }}
                  style={{ marginTop: spacing.lg }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveRequests
