import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLeave, updateLeave } from '../services/leaveService'

const EditLeavePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '', leaveType: 'personal' })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const leave = await getLeave(id)
        if (!leave) {
          setError('Leave not found')
        } else {
          setStatus(leave.status)
          setForm({
            startDate: leave.startDate?.slice(0,10) || '',
            endDate: leave.endDate?.slice(0,10) || '',
            reason: leave.reason || '',
            leaveType: leave.leaveType || 'personal'
          })
        }
      } catch (e) {
        setError(e.message || 'Failed to load leave')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await updateLeave(id, form)
      navigate('/my-leaves?status=pending')
    } catch (e) {
      setError(e.message || 'Failed to update leave')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card"><p className="muted">Loading...</p></div>

  if (status !== 'pending') {
    return (
      <div className="card">
        <h2>Edit Leave</h2>
        <p className="muted">Only pending leaves can be edited.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Edit Leave</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>Start Date</label>
        <input type="date" name="startDate" value={form.startDate} onChange={onChange} required />

        <label>End Date</label>
        <input type="date" name="endDate" value={form.endDate} onChange={onChange} required />

        <label>Reason</label>
        <textarea name="reason" rows="3" value={form.reason} onChange={onChange} required />

        <label>Leave Type</label>
        <select name="leaveType" value={form.leaveType} onChange={onChange}>
          <option value="personal">Personal</option>
          <option value="sick">Sick</option>
          <option value="emergency">Emergency</option>
          <option value="vacation">Vacation</option>
          <option value="other">Other</option>
        </select>

        {error && <div className="error">{error}</div>}

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default EditLeavePage
