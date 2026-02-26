import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTestResult, reevaluateTest, deleteTestResultForRetake, requestRetest, approveRetest } from '../services/testService'
import { updateLeaveStatus } from '../services/leaveService'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, borderRadius, typography, transitions } from '../utils/designSystem'

const TestResultPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approveLoading, setApproveLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  const [reevalLoading, setReevalLoading] = useState(false)
  const [retakeLoading, setRetakeLoading] = useState(false)
  const [retestRequestLoading, setRetestRequestLoading] = useState(false)
  const [retestApproveLoading, setRetestApproveLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getTestResult(id)
        setResult(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  const handleApprove = async () => {
    if (!result?.leave?._id) return
    setError('')
    setMessage('')
    setApproveLoading(true)
    try {
      const updated = await updateLeaveStatus(result.leave._id, {
        status: 'approved',
        adminRemarks: 'Approved by admin override'
      })
      setResult((prev) => prev ? { ...prev, leave: { ...prev.leave, status: updated.status } } : prev)
      setMessage('Leave approved successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setApproveLoading(false)
    }
  }

  const handleReject = async () => {
    if (!result?.leave?._id) return
    if (!window.confirm('Reject this leave due to cheating or policy violation?')) return
    setError('')
    setMessage('')
    setRejectLoading(true)
    try {
      const updated = await updateLeaveStatus(result.leave._id, {
        status: 'rejected',
        adminRemarks: 'Rejected by admin (suspicious activity/tab switches)'
      })
      setResult((prev) => prev ? { ...prev, leave: { ...prev.leave, status: updated.status, adminRemarks: updated.adminRemarks } } : prev)
      setMessage('Leave has been rejected for this test result.')
    } catch (err) {
      setError(err.message)
    } finally {
      setRejectLoading(false)
    }
  }

  const handleRequestRetake = async () => {
    if (retestRequested || retestApproved || retestUsed) return
    setError('')
    setMessage('')
    setRetestRequestLoading(true)
    try {
      const updatedLeave = await requestRetest(id)
      setResult((prev) => prev ? { ...prev, leave: { ...prev.leave, ...updatedLeave } } : prev)
      setMessage('Retest requested. Waiting for admin approval.')
    } catch (err) {
      setError(err.message)
    } finally {
      setRetestRequestLoading(false)
    }
  }

  const handleApproveRetake = async () => {
    if (retestApproved || retestUsed) return
    setError('')
    setMessage('')
    setRetestApproveLoading(true)
    try {
      const updatedLeave = await approveRetest(id)
      setResult((prev) => prev ? { ...prev, leave: { ...prev.leave, ...updatedLeave } } : prev)
      setMessage('Retest approved. Student can retake once.')
    } catch (err) {
      setError(err.message)
    } finally {
      setRetestApproveLoading(false)
    }
  }

  const handleReevaluate = async () => {
    setError('')
    setMessage('')
    setReevalLoading(true)
    try {
      const reevaluatedResult = await reevaluateTest(id)
      setResult(reevaluatedResult)
      setMessage('Test has been reevaluated successfully! Check your updated results above.')
    } catch (err) {
      setError(err.message)
    } finally {
      setReevalLoading(false)
    }
  }

  const handleRetakeTest = async () => {
    if (!window.confirm('This will delete your current result and allow you to retake the test. Are you sure?')) {
      return
    }
    
    setError('')
    setMessage('')
    setRetakeLoading(true)
    try {
      // Delete current result using retake endpoint
      await deleteTestResultForRetake(result._id)
      
      // Redirect to take test page
      navigate(`/test/${id}`)
    } catch (err) {
      setError(err.message)
      setRetakeLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing.xxxl }}>
        <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>⏳</div>
        <p style={{ ...typography.body_lg, color: colors.gray_600 }}>Loading result...</p>
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

  if (!result) {
    return (
      <div style={{ padding: spacing.xl, background: colors.gray_100, borderRadius: borderRadius.lg, color: colors.gray_600 }}>
        No result found.
      </div>
    )
  }

  const leaveFlags = result.leave || {}
  const retestRequested = !!leaveFlags.retestRequested
  const retestApproved = !!leaveFlags.retestApproved
  const retestUsed = !!leaveFlags.retestUsed
  const reevaluationUsed = !!leaveFlags.reevaluationUsed
  const canRequestRetest = !retestRequested && !retestApproved && !retestUsed
  const canRetake = retestApproved && !retestUsed

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: `0 ${spacing.lg}` }}>
      {/* Header */}
      <div style={{
        background: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        border: `1px solid ${colors.gray_200}`,
        boxShadow: colors.shadow_sm
      }}>
        <h2 style={{ ...typography.h2, margin: 0, marginBottom: spacing.sm, color: colors.gray_900 }}>
          Test Result
        </h2>
        <p style={{ ...typography.body, color: colors.gray_600, margin: 0 }}>
          {result.test?.title}
        </p>
      </div>

      {message && (
        <div style={{
          padding: spacing.md,
          background: colors.success_light,
          color: colors.success_dark,
          borderRadius: borderRadius.md,
          marginBottom: spacing.lg,
          border: `1px solid ${colors.success}`
        }}>
          {message}
        </div>
      )}

      {/* Reevaluation / Retest for Students */}
      {user?.role === 'student' && (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn"
              onClick={handleReevaluate}
              disabled={reevalLoading || reevaluationUsed}
              style={{ background: '#3b82f6', borderColor: '#2563eb', marginRight: '10px' }}
            >
              {reevalLoading ? 'Reevaluating...' : reevaluationUsed ? 'Reevaluation Used' : '🔄 Request Reevaluation'}
            </button>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {canRequestRetest && (
                <button
                  className="btn"
                  onClick={handleRequestRetake}
                  disabled={retestRequestLoading}
                  style={{ background: '#f59e0b', borderColor: '#d97706' }}
                >
                  {retestRequestLoading ? 'Requesting...' : '📝 Request Retest'}
                </button>
              )}

              {retestRequested && !retestApproved && (
                <span className="badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
                  Retest requested — awaiting admin
                </span>
              )}

              {canRetake && (
                <button
                  className="btn"
                  onClick={handleRetakeTest}
                  disabled={retakeLoading}
                  style={{ background: '#f59e0b', borderColor: '#d97706' }}
                >
                  {retakeLoading ? 'Processing...' : '📝 Retake Test (once)'}
                </button>
              )}

              {retestUsed && (
                <span className="badge" style={{ background: '#e5e7eb', color: '#374151', border: '1px solid #d1d5db' }}>
                  Retest already used
                </span>
              )}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <span className="muted" style={{ fontSize: '13px', display: 'block', marginTop: '5px' }}>
              <strong>One-time rules</strong>
            </span>
            <span className="muted" style={{ fontSize: '13px', display: 'block' }}>
              • Reevaluation is allowed once per leave.
            </span>
            <span className="muted" style={{ fontSize: '13px', display: 'block' }}>
              • Retest must be approved by admin and can be taken only once.
            </span>
          </div>
        </div>
      )}

      {user?.role === 'admin' && result.leave && (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {result.leave.status !== 'approved' && (
            <button
              className="btn"
              onClick={handleApprove}
              disabled={approveLoading}
              style={{ background: '#22c55e', borderColor: '#16a34a' }}
            >
              {approveLoading ? 'Approving...' : 'Approve Leave'}
            </button>
          )}
          {retestRequested && !retestApproved && !retestUsed && (
            <button
              className="btn"
              onClick={handleApproveRetake}
              disabled={retestApproveLoading}
              style={{ background: '#0ea5e9', borderColor: '#0284c7' }}
            >
              {retestApproveLoading ? 'Approving...' : 'Approve Retest'}
            </button>
          )}
          <button
            className="btn danger"
            onClick={handleReject}
            disabled={rejectLoading}
            style={{ minWidth: '160px' }}
          >
            {rejectLoading ? 'Rejecting...' : 'Reject Leave'}
          </button>
          <span className="muted" style={{ fontSize: '13px' }}>
            Reject when cheating is detected (e.g., high tab switches) regardless of score. Approve retest only once.
          </span>
        </div>
      )}
      
      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing.lg,
        marginBottom: spacing.lg
      }}>
        <div style={{
          background: colors.white,
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.gray_200}`,
          boxShadow: colors.shadow_sm,
          textAlign: 'center'
        }}>
          <div style={{ ...typography.body_sm, color: colors.gray_600, marginBottom: spacing.xs }}>Total Score</div>
          <div style={{ ...typography.h2, color: colors.gray_900, margin: 0 }}>
            {result.totalScore} / {result.maxScore}
          </div>
        </div>

        <div style={{
          background: colors.white,
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.gray_200}`,
          boxShadow: colors.shadow_sm,
          textAlign: 'center'
        }}>
          <div style={{ ...typography.body_sm, color: colors.gray_600, marginBottom: spacing.xs }}>Percentage</div>
          <div style={{ ...typography.h2, color: colors.primary, margin: 0 }}>
            {result.percentage || 0}%
          </div>
        </div>

        <div style={{
          background: colors.white,
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.gray_200}`,
          boxShadow: colors.shadow_sm,
          textAlign: 'center'
        }}>
          <div style={{ ...typography.body_sm, color: colors.gray_600, marginBottom: spacing.xs }}>Status</div>
          <div style={{
            display: 'inline-block',
            padding: `${spacing.xs} ${spacing.lg}`,
            background: result.passed ? colors.success_light : colors.danger_light,
            color: result.passed ? colors.success_dark : colors.danger_dark,
            borderRadius: borderRadius.full,
            fontWeight: '600',
            fontSize: '14px',
            border: `1px solid ${result.passed ? colors.success : colors.danger}`
          }}>
            {result.passed ? '✓ PASSED' : '✗ FAILED'}
          </div>
        </div>

        <div style={{
          background: colors.white,
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.gray_200}`,
          boxShadow: colors.shadow_sm,
          textAlign: 'center'
        }}>
          <div style={{ ...typography.body_sm, color: colors.gray_600, marginBottom: spacing.xs }}>Leave Status</div>
          <div style={{ ...typography.h4, color: colors.gray_900, margin: 0, textTransform: 'capitalize' }}>
            {result.leave?.status || 'N/A'}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div style={{
        background: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        border: `1px solid ${colors.gray_200}`,
        boxShadow: colors.shadow_sm,
        display: 'flex',
        gap: spacing.xl,
        flexWrap: 'wrap',
        justifyContent: 'space-around'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...typography.body_sm, color: colors.gray_600, marginBottom: spacing.xs }}>Time Taken</div>
          <div style={{ ...typography.body, fontWeight: '600', color: colors.gray_900 }}>
            {Math.floor((result.timeTaken || 0) / 60)} min {(result.timeTaken || 0) % 60} sec
          </div>
        </div>
        {result.tabSwitchCount !== undefined && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...typography.body_sm, color: colors.gray_600, marginBottom: spacing.xs }}>Tab Switches</div>
            <div style={{
              ...typography.body,
              fontWeight: '600',
              color: result.tabSwitchCount > 5 ? colors.danger : colors.gray_900
            }}>
              {result.tabSwitchCount} {result.tabSwitchCount > 5 && '⚠️'}
            </div>
          </div>
        )}
      </div>

      {result.feedback && (
        <div style={{
          padding: spacing.lg,
          background: result.passed ? colors.success_light : colors.warning_light,
          color: result.passed ? colors.success_dark : colors.warning_dark,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.lg,
          border: `1px solid ${result.passed ? colors.success : colors.warning}`
        }}>
          <p style={{ margin: 0 }}>{result.feedback}</p>
        </div>
      )}

      {/* MCQ Results */}
      {result.mcqAnswers && result.mcqAnswers.length > 0 && (
        <div style={{
          background: colors.white,
          padding: spacing.xl,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.lg,
          border: `1px solid ${colors.gray_200}`,
          boxShadow: colors.shadow_sm
        }}>
          <h3 style={{ ...typography.h3, margin: 0, marginBottom: spacing.lg, color: colors.gray_900 }}>
            MCQ Results <span style={{ color: colors.gray_600, fontSize: '16px' }}>(Score: {result.mcqScore})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {result.mcqAnswers.map((ans, idx) => (
              <div
                key={idx}
                style={{
                  padding: spacing.md,
                  background: ans.isCorrect ? colors.success_light : colors.danger_light,
                  border: `2px solid ${ans.isCorrect ? colors.success : colors.danger}`,
                  borderRadius: borderRadius.md,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: spacing.md,
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong style={{ color: colors.gray_900 }}>Question {ans.questionIndex + 1}</strong>
                  <div style={{ ...typography.body_sm, color: colors.gray_700, marginTop: spacing.xs }}>
                    <span>Your Answer: <strong>{ans.selectedAnswer !== null ? `Option ${String.fromCharCode(65 + ans.selectedAnswer)}` : 'Not answered'}</strong></span>
                    {' | '}
                    <span>Correct Answer: <strong style={{ color: ans.isCorrect ? colors.success_dark : colors.danger_dark }}>Option {String.fromCharCode(65 + ans.correctAnswer)}</strong></span>
                  </div>
                </div>
                <div style={{
                  padding: `${spacing.xs} ${spacing.md}`,
                  background: ans.isCorrect ? colors.success : colors.danger,
                  color: colors.white,
                  borderRadius: borderRadius.full,
                  fontSize: '13px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}>
                  {ans.isCorrect ? '✓ Correct' : '✗ Wrong'} ({ans.marksAwarded} marks)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coding Results */}
      {result.codingAnswers && result.codingAnswers.length > 0 && (
        <div style={{
          background: colors.white,
          padding: spacing.xl,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.lg,
          border: `1px solid ${colors.gray_200}`,
          boxShadow: colors.shadow_sm
        }}>
          <h3 style={{ ...typography.h3, margin: 0, marginBottom: spacing.lg, color: colors.gray_900 }}>
            Coding Results <span style={{ color: colors.gray_600, fontSize: '16px' }}>(Score: {result.codingScore})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {result.codingAnswers.map((ans, idx) => (
              <div
                key={idx}
                style={{
                  padding: spacing.lg,
                  background: colors.gray_50,
                  border: `2px solid ${ans.isCorrect ? colors.success : colors.danger}`,
                  borderRadius: borderRadius.md
                }}
              >
                <div style={{ marginBottom: spacing.md, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: colors.gray_900 }}>Question {ans.questionIndex + 1}</strong>
                  <div style={{
                    padding: `${spacing.xs} ${spacing.md}`,
                    background: ans.isCorrect ? colors.success : colors.danger,
                    color: colors.white,
                    borderRadius: borderRadius.full,
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {ans.isCorrect ? '✓ Correct' : '✗ Wrong'} ({ans.marksAwarded} marks)
                  </div>
                </div>
                <div style={{ marginBottom: spacing.md }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: spacing.xs, color: colors.gray_700 }}>
                    Your Output:
                  </label>
                  <pre style={{
                    background: colors.white,
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray_300}`,
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    margin: 0
                  }}>
                    {ans.submittedOutput || '(No output submitted)'}
                  </pre>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: spacing.xs, color: colors.gray_700 }}>
                    Expected Output:
                  </label>
                  <pre style={{
                    background: colors.success_light,
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.success}`,
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    margin: 0
                  }}>
                    {ans.expectedOutput}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestResultPage
