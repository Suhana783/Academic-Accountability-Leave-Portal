import { useState } from 'react'
import { removeUser } from '../services/authService'

const RemoveUserPage = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deletedUser, setDeletedUser] = useState(null)

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.email || !form.password) {
      setError('Please provide email and password')
      return
    }

    setShowConfirm(true)
  }

  const confirmDelete = async () => {
    setShowConfirm(false)
    setLoading(true)

    try {
      const result = await removeUser(form.email, form.password)
      setDeletedUser(result.user)
      setSuccess(`User "${result.user.name}" (${result.user.email}) has been successfully removed!`)
      setForm({ email: '', password: '' })
    } catch (err) {
      setError(err.message || 'Failed to remove user')
      setDeletedUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ email: '', password: '' })
    setError('')
    setSuccess('')
    setDeletedUser(null)
  }

  return (
    <div className="card">
      <h2>Remove User</h2>
      <p className="muted">
        Delete a student or admin account by providing their email and password.
      </p>

      <form className="form" onSubmit={onSubmit} style={{ marginTop: '24px' }}>
        <div>
          <label>Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="Enter user email to remove"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter user password to confirm"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>

        <p className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
          ⚠️ Password verification is required for security. This action cannot be undone.
        </p>

        {error && <div className="error">{error}</div>}
        {success && (
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '2px solid #86efac',
            marginBottom: '12px'
          }}>
            {success}
          </div>
        )}

        <div className="actions-row">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Remove User'}
          </button>
          <button
            className="btn ghost"
            type="button"
            onClick={handleReset}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '28px',
            borderRadius: '16px',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginBottom: '12px', color: '#dc2626' }}>⚠️ Confirm Deletion</h3>
            <p className="muted" style={{ marginBottom: '20px', lineHeight: '1.6' }}>
              Are you sure you want to permanently remove the user with email <strong>{form.email}</strong>?
            </p>
            <p className="muted" style={{ fontSize: '12px', marginBottom: '20px' }}>
              This action is irreversible. All associated data will be deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn danger"
                onClick={confirmDelete}
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Deleting...' : 'Yes, Remove'}
              </button>
              <button
                className="btn ghost"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deletedUser && (
        <div className="info-box" style={{ marginTop: '24px', borderColor: '#86efac' }}>
          <strong>Removed User Details:</strong>
          <div style={{ marginTop: '12px', display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div><strong>Name:</strong> {deletedUser.name}</div>
            <div><strong>Email:</strong> {deletedUser.email}</div>
            <div><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{deletedUser.role}</span></div>
            <div><strong>ID:</strong> {deletedUser.id}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RemoveUserPage
