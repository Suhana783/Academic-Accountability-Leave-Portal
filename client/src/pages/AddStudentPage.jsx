import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createStudent } from '../services/authService'

const AddStudentPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    department: '' 
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
      const result = await createStudent(form)
      setSuccess(`Student "${result.user.name}" created successfully!`)
      setForm({ name: '', email: '', password: '', department: '' })
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to create student')
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
      <h2>Add New Student</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Create a new student account and share credentials with them.
      </p>

      <form className="form" onSubmit={onSubmit}>
        <label>Student Name *</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={onChange}
          placeholder="Enter student's full name"
          required
        />

        <label>Email *</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Enter student's email"
          required
        />

        <label>Password *</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Set a password for the student"
          required
        />

        <label>Department (optional)</label>
        <input
          name="department"
          type="text"
          value={form.department}
          onChange={onChange}
          placeholder="e.g., Computer Science, Engineering"
        />

        {error && <div className="error">{error}</div>}
        {success && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Student'}
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

export default AddStudentPage
