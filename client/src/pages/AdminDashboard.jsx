import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllLeaves } from '../services/leaveService'

const AdminDashboard = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const data = await getAllLeaves()
        setLeaves(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaves()
  }, [])

  const pending = leaves.filter((l) => l.status === 'pending')
  const assigned = leaves.filter((l) => l.status === 'test_assigned')

  return (
    <div>
      <div className="card">
        <h2>Admin Dashboard</h2>
        
        {/* User Management Section */}
        <h3 style={{ marginTop: '20px', marginBottom: '15px' }}>User Management</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <Link className="btn" to="/admin/add-student">Add Student</Link>
          <Link className="btn" to="/admin/add-admin">Add Admin</Link>
          <Link className="btn danger" to="/admin/remove-user">Remove User</Link>
          <Link className="btn" to="/admin/results">View Test Results</Link>
        </div>

        {/* Leave Management Section */}
        <h3>Leave Management</h3>
        {loading && <p className="muted">Loading...</p>}
        {error && <p className="error">{error}</p>}

        <h4>Pending Leaves</h4>
        <div className="list">
          {pending.map((leave) => (
            <div key={leave._id} className="list-item">
              <div>
                <strong>{leave.student?.name}</strong> - {leave.reason}
                <div className="muted">{leave.startDate?.slice(0,10)} → {leave.endDate?.slice(0,10)}</div>
              </div>
              <Link className="btn" to={`/admin/leaves/${leave._id}`}>Review</Link>
            </div>
          ))}
          {pending.length === 0 && <p className="muted">No pending leaves.</p>}
        </div>

        <h4>Test Assigned</h4>
        <div className="list">
          {assigned.map((leave) => (
            <div key={leave._id} className="list-item">
              <div>
                <strong>{leave.student?.name}</strong> - {leave.reason}
                <div className="muted">Status: {leave.status}</div>
              </div>
              <Link className="btn ghost" to={`/admin/leaves/${leave._id}`}>View</Link>
            </div>
          ))}
          {assigned.length === 0 && <p className="muted">No leaves with tests assigned.</p>}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
