import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyLeave } from '../services/leaveService'

const ApplyLeavePage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'personal'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await applyLeave(form)
      navigate('/my-leaves')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Apply for Leave</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>Start Date</label>
        <input type="date" name="startDate" value={form.startDate} onChange={onChange} required />

        <label>End Date</label>
        <input type="date" name="endDate" value={form.endDate} onChange={onChange} required />

        <label>Reason</label>
        <textarea
          name="reason"
          rows="3"
          value={form.reason}
          onChange={onChange}
          placeholder="Provide a brief reason"
          required
        />

        <label>Leave Type</label>
        <select name="leaveType" value={form.leaveType} onChange={onChange}>
          <option value="personal">Personal</option>
          <option value="sick">Sick</option>
          <option value="emergency">Emergency</option>
          <option value="vacation">Vacation</option>
          <option value="other">Other</option>
        </select>

        {error && <div className="error">{error}</div>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Leave'}
        </button>
      </form>
    </div>
  )
}

export default ApplyLeavePage
