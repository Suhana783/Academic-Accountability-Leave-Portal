import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTestResult, reevaluateTest, deleteTestResultForRetake, requestRetest, approveRetest } from '../services/testService'
import { updateLeaveStatus } from '../services/leaveService'
import { useAuth } from '../context/AuthContext'

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

  if (loading) return <p className="muted">Loading result...</p>
  if (error) return <p className="error">{error}</p>
  if (!result) return <p className="muted">No result found.</p>

  const leaveFlags = result.leave || {}
  const retestRequested = !!leaveFlags.retestRequested
  const retestApproved = !!leaveFlags.retestApproved
  const retestUsed = !!leaveFlags.retestUsed
  const reevaluationUsed = !!leaveFlags.reevaluationUsed
  const canRequestRetest = !retestRequested && !retestApproved && !retestUsed
  const canRetake = retestApproved && !retestUsed

  return (
    <div className="card">
      <h2>Test Result</h2>
      <p className="muted">{result.test?.title}</p>

      {message && (
        <div className="info-box success">{message}</div>
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
      
      <div className="grid">
        <div className="tile">
          <strong>Total Score</strong>
          <div>{result.totalScore} / {result.maxScore}</div>
        </div>
        <div className="tile">
          <strong>Percentage</strong>
          <div>{result.percentage || 0}%</div>
        </div>
        <div className="tile">
          <strong>Status</strong>
          <div className={result.passed ? 'badge success' : 'badge danger'}>
            {result.passed ? 'PASSED' : 'FAILED'}
          </div>
        </div>
        <div className="tile">
          <strong>Leave Status</strong>
          <div>{result.leave?.status}</div>
        </div>
      </div>

      <div className="grid" style={{ marginTop: '10px' }}>
        <div className="tile">
          <strong>Time Taken</strong>
          <div>{Math.floor((result.timeTaken || 0) / 60)} min {(result.timeTaken || 0) % 60} sec</div>
        </div>
        {result.tabSwitchCount !== undefined && (
          <div className="tile">
            <strong>Tab Switches</strong>
            <div style={{ color: result.tabSwitchCount > 5 ? '#e67700' : 'inherit' }}>
              {result.tabSwitchCount} {result.tabSwitchCount > 5 && '⚠️'}
            </div>
          </div>
        )}
      </div>

      {result.feedback && (
        <div className={result.passed ? 'info-box success' : 'info-box'}>
          <p>{result.feedback}</p>
        </div>
      )}

      {result.mcqAnswers && result.mcqAnswers.length > 0 && (
        <div className="section">
          <h3>MCQ Results (Score: {result.mcqScore})</h3>
          {result.mcqAnswers.map((ans, idx) => (
            <div key={idx} className="list-item">
              <div>
                <strong>Question {ans.questionIndex + 1}</strong>
                <div className="muted">
                  Your Answer: {ans.selectedAnswer !== null ? `Option ${ans.selectedAnswer}` : 'Not answered'} | 
                  Correct Answer: Option {ans.correctAnswer}
                </div>
              </div>
              <div className={ans.isCorrect ? 'badge success' : 'badge danger'}>
                {ans.isCorrect ? '✓ Correct' : '✗ Wrong'} ({ans.marksAwarded} marks)
              </div>
            </div>
          ))}
        </div>
      )}

      {result.codingAnswers && result.codingAnswers.length > 0 && (
        <div className="section">
          <h3>Coding Results (Score: {result.codingScore})</h3>
          {result.codingAnswers.map((ans, idx) => (
            <div key={idx} className="question-block">
              <div>
                <strong>Question {ans.questionIndex + 1}</strong>
                <div className={ans.isCorrect ? 'badge success' : 'badge danger'}>
                  {ans.isCorrect ? '✓ Correct' : '✗ Wrong'} ({ans.marksAwarded} marks)
                </div>
              </div>
              <div>
                <label>Your Output:</label>
                <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                  {ans.submittedOutput || '(No output submitted)'}
                </pre>
              </div>
              <div>
                <label>Expected Output:</label>
                <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                  {ans.expectedOutput}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TestResultPage
