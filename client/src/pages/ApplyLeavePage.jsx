import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyLeave } from '../services/leaveService'
import { colors, spacing, borderRadius, typography, transitions } from '../utils/designSystem'

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

  const formFieldStyle = {
    marginBottom: spacing.lg
  }

  const labelStyle = {
    display: 'block',
    ...typography.label,
    color: colors.gray_700,
    marginBottom: spacing.sm
  }

  const inputStyle = {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    border: `1.5px solid ${colors.gray_200}`,
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: `all ${transitions.base}`,
    boxSizing: 'border-box',
  }

  const createInputHandler = () => ({
    onFocus: (e) => {
      e.currentTarget.style.borderColor = colors.primary
      e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`
    },
    onBlur: (e) => {
      e.currentTarget.style.borderColor = colors.gray_200
      e.currentTarget.style.boxShadow = 'none'
    }
  })

  const leaveTypes = [
    { value: 'personal', label: '👤 Personal' },
    { value: 'sick', label: '🏥 Sick' },
    { value: 'emergency', label: '🚨 Emergency' },
    { value: 'vacation', label: '✈️ Vacation' },
    { value: 'other', label: '📝 Other' }
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing.xxxl }}>
        <h1 style={{ ...typography.h1, margin: 0, color: colors.gray_900 }}>Apply for Leave</h1>
        <p style={{ ...typography.body_lg, color: colors.gray_600, margin: `${spacing.md} 0 0 0` }}>
          Submit a new leave request and get it reviewed
        </p>
      </div>

      {/* Form Card */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.gray_200}`,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        boxShadow: colors.shadow_sm,
        maxWidth: '600px'
      }}>
        <form onSubmit={onSubmit}>
          {/* Start Date */}
          <div style={formFieldStyle}>
            <label style={labelStyle}>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={onChange}
              required
              style={inputStyle}
              {...createInputHandler()}
            />
          </div>

          {/* End Date */}
          <div style={formFieldStyle}>
            <label style={labelStyle}>End Date</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={onChange}
              required
              style={inputStyle}
              {...createInputHandler()}
            />
          </div>

          {/* Leave Type */}
          <div style={formFieldStyle}>
            <label style={labelStyle}>Leave Type</label>
            <select
              name="leaveType"
              value={form.leaveType}
              onChange={onChange}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${colors.gray_600}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '20px',
                paddingRight: spacing.xxxl
              }}
              {...createInputHandler()}
            >
              {leaveTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div style={formFieldStyle}>
            <label style={labelStyle}>Reason for Leave</label>
            <textarea
              name="reason"
              rows="4"
              value={form.reason}
              onChange={onChange}
              placeholder="Provide a brief reason for your leave request"
              required
              style={{
                ...inputStyle,
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '100px'
              }}
              {...createInputHandler()}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: spacing.lg,
              padding: spacing.md,
              background: colors.danger_light,
              border: `1px solid ${colors.danger}20`,
              borderRadius: borderRadius.md,
              color: colors.danger,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ❌ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.xl }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: spacing.md,
                background: loading ? colors.gray_400 : colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: borderRadius.md,
                ...typography.body,
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: `all ${transitions.base}`,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = colors.primary_dark
                  e.currentTarget.style.boxShadow = colors.shadow_md
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = colors.primary
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {loading ? '⏳ Submitting...' : '✅ Submit Leave Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-leaves')}
              style={{
                flex: 1,
                padding: spacing.md,
                background: colors.gray_100,
                color: colors.gray_700,
                border: `1.5px solid ${colors.gray_200}`,
                borderRadius: borderRadius.md,
                ...typography.body,
                fontWeight: '700',
                cursor: 'pointer',
                transition: `all ${transitions.base}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.gray_200
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.gray_100
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: spacing.xl,
        padding: spacing.lg,
        background: colors.primary_light,
        border: `1px solid ${colors.primary}30`,
        borderRadius: borderRadius.lg,
        ...typography.body_sm,
        color: colors.primary_dark,
        maxWidth: '600px'
      }}>
        <strong>ℹ️ Important:</strong> After submitting your leave request, you may be required to take a test depending on the leave type and duration. Your leave will be reviewed by an administrator.
      </div>
    </div>
  )
}

export default ApplyLeavePage
