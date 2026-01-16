import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createAdmin } from '../services/authService'

const AddAdminPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '' 
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required')
      return
    }

    setLoading(true)
    try {
      const result = await createAdmin(form)
      setSuccess(`Admin "${result.user.name}" created successfully!`)
      setForm({ name: '', email: '', password: '' })
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to create admin')
    } finally {
      setLoading(false)
    }
  }

  // Ensure only admins can access
  if (user?.role !== 'admin') {
    return (
      <div className="card">
        <h2>Access Denied</h2>
        <p>Only administrators can access this page.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Add New Admin</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Create a new administrator account. Admins can manage users, reviews, and system settings.
      </p>

      <form className="form" onSubmit={onSubmit}>
        <label>Admin Name *</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={onChange}
          placeholder="Enter admin's full name"
          required
        />

        <label>Email *</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Enter admin's email"
          required
        />

        <label>Password *</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Set a password for the admin"
          required
        />

        {error && <div className="error">{error}</div>}
        {success && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Admin'}
        </button>
      </form>

      <button 
        className="btn" 
        style={{ marginTop: '15px', backgroundColor: '#6c757d' }}
        onClick={() => navigate('/admin')}
      >
        Back to Admin Dashboard
      </button>
    </div>
  )
}

export default AddAdminPage
