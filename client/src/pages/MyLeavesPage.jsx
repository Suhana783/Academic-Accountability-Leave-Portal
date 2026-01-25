import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getMyLeaves } from '../services/leaveService'
import { getTestByLeave } from '../services/testService'

const MyLeavesPage = () => {
  const [leaves, setLeaves] = useState([])
  const [filteredLeaves, setFilteredLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get('status')

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

  useEffect(() => {
    if (statusFilter) {
      setFilteredLeaves(leaves.filter((leave) => leave.status === statusFilter))
    } else {
      setFilteredLeaves(leaves)
    }
  }, [statusFilter, leaves])

  const handleTakeTest = async (leaveId) => {
    try {
      const test = await getTestByLeave(leaveId)
      if (test?._id) {
        navigate(`/test/${test._id}`)
      } else {
        setError('Test not found for this leave yet.')
      }
    } catch (err) {
      // Handle 404 gracefully - test hasn't been assigned yet
      if (err.response?.status === 404) {
        setError('Test not assigned yet. Please wait for the admin to assign a test.')
      } else {
        setError(err.message || 'Error loading test')
      }
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>My Leaves</h2>
        {statusFilter && (
          <button 
            className="btn ghost"
            onClick={() => navigate('/my-leaves')}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Clear Filter ({statusFilter})
          </button>
        )}
      </div>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {filteredLeaves.length === 0 && !loading && (
        <p>{statusFilter ? `No ${statusFilter} leave requests.` : 'No leave requests yet.'}</p>
      )}
      <div className="list">
        {filteredLeaves.map((leave) => (
          <div key={leave._id} className="list-item">
            <div>
              <strong>{leave.reason}</strong>
              <div className="muted">{leave.startDate?.slice(0, 10)} → {leave.endDate?.slice(0, 10)}</div>
              <div className={`status status-${leave.status}`}>{leave.status}</div>
            </div>
            <div className="item-actions">
              <Link className="btn ghost" to={`/leave/${leave._id}`}>Details</Link>
              {leave.status === 'pending' && (
                <Link className="btn" to={`/leave/${leave._id}/edit`}>Edit</Link>
              )}
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
