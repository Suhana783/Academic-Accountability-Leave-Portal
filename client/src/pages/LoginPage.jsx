import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      if (!form.email || !form.password) {
        setError('Email and password are required')
        return
      }

      const user = await login(form.email, form.password)
      
      // Role-based redirection
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/student')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="card">
      <h2>Academic Accountability Leave Portal</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Login with your email and password
      </p>
      
      <form className="form" onSubmit={onSubmit}>
        <label>Email</label>
        <input 
          name="email" 
          type="email" 
          value={form.email} 
          onChange={onChange}
          placeholder="Enter your email"
          required 
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Enter your password"
          required
        />

        {error && <div className="error">{error}</div>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p style={{ 
        marginTop: '20px', 
        fontSize: '14px', 
        color: '#666',
        textAlign: 'center'
      }}>
        <strong>Note:</strong> Only administrators can create new user accounts. 
        Please contact your administrator for account creation.
      </p>
    </div>
  )
}

export default LoginPage
