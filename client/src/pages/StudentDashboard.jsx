import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyLeaves } from '../services/leaveService'
import { Link } from 'react-router-dom'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyLeaves()
        setLeaves(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const counts = leaves.reduce(
    (acc, leave) => {
      acc[leave.status] = (acc[leave.status] || 0) + 1
      return acc
    },
    { pending: 0, test_assigned: 0, approved: 0, rejected: 0 }
  )

  return (
    <div className="card">
      <h2>Welcome, {user?.name}</h2>
      <p className="muted">Role: {user?.role} | Email: {user?.email}</p>
      <div className="grid">
        <div className="tile">Pending: {counts.pending}</div>
        <div className="tile">Test Assigned: {counts.test_assigned}</div>
        <div className="tile">Approved: {counts.approved}</div>
        <div className="tile">Rejected: {counts.rejected}</div>
      </div>
      <div className="actions-row">
        <Link className="btn" to="/apply-leave">Apply Leave</Link>
        <Link className="btn" to="/my-leaves">View My Leaves</Link>
        <Link className="btn" to="/my-results">My Results</Link>
      </div>
      {loading && <p className="muted">Loading your leaves...</p>}
    </div>
  )
}

export default StudentDashboard
