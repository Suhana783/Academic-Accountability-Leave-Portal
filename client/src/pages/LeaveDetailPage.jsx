import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLeave } from '../services/leaveService'

const LeaveDetailPage = () => {
  const { id } = useParams()
  const [leave, setLeave] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const data = await getLeave(id)
        setLeave(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLeave()
  }, [id])

  if (loading) return <p className="muted">Loading...</p>
  if (error) return <p className="error">{error}</p>
  if (!leave) return <p className="muted">Leave not found.</p>

  return (
    <div className="card">
      <h2>Leave Details</h2>
      <p><strong>Reason:</strong> {leave.reason}</p>
      <p><strong>Dates:</strong> {leave.startDate?.slice(0,10)} → {leave.endDate?.slice(0,10)}</p>
      <p><strong>Status:</strong> {leave.status}</p>
      <p><strong>Type:</strong> {leave.leaveType}</p>
      {leave.adminRemarks && <p><strong>Admin Remarks:</strong> {leave.adminRemarks}</p>}
    </div>
  )
}

export default LeaveDetailPage
