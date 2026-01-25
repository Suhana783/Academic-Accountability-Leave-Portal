import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTestResult } from '../services/testService'
import { updateLeaveStatus } from '../services/leaveService'
import { useAuth } from '../context/AuthContext'

const TestResultPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approveLoading, setApproveLoading] = useState(false)
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

  if (loading) return <p className="muted">Loading result...</p>
  if (error) return <p className="error">{error}</p>
  if (!result) return <p className="muted">No result found.</p>

  return (
    <div className="card">
      <h2>Test Result</h2>
      <p className="muted">{result.test?.title}</p>

      {message && (
        <div className="info-box success">{message}</div>
      )}

      {user?.role === 'admin' && result.leave?.status !== 'approved' && (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn"
            onClick={handleApprove}
            disabled={approveLoading}
            style={{ background: '#22c55e', borderColor: '#16a34a' }}
          >
            {approveLoading ? 'Approving...' : 'Approve Leave'}
          </button>
          <span className="muted" style={{ fontSize: '13px' }}>
            Override: approve leave even if the test was failed.
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
