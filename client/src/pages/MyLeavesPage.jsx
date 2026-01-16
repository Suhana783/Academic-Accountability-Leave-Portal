import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyLeaves } from '../services/leaveService'
import { getTestByLeave } from '../services/testService'

const MyLeavesPage = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const data = await getMyLeaves()
        setLeaves(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaves()
  }, [])

  const handleTakeTest = async (leaveId) => {
    try {
      const test = await getTestByLeave(leaveId)
      if (test?._id) {
        navigate(`/test/${test._id}`)
      } else {
        setError('Test not found for this leave yet.')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h2>My Leaves</h2>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {leaves.length === 0 && !loading && <p>No leave requests yet.</p>}
      <div className="list">
        {leaves.map((leave) => (
          <div key={leave._id} className="list-item">
            <div>
              <strong>{leave.reason}</strong>
              <div className="muted">{leave.startDate?.slice(0, 10)} → {leave.endDate?.slice(0, 10)}</div>
              <div className={`status status-${leave.status}`}>{leave.status}</div>
            </div>
            <div className="item-actions">
              <Link className="btn ghost" to={`/leave/${leave._id}`}>Details</Link>
              {leave.status === 'test_assigned' && (
                <button className="btn" onClick={() => handleTakeTest(leave._id)}>Take Test</button>
              )}
              {leave.status === 'approved' && <span className="badge success">Approved</span>}
              {leave.status === 'rejected' && <span className="badge danger">Rejected</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyLeavesPage
