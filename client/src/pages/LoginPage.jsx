import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { login, loading, user } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  // Lock the viewport to prevent any vertical scroll while on the login page
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlHeight = html.style.height
    const prevBodyHeight = body.style.height
    const prevBodyOverflow = body.style.overflow

    html.style.height = '100%'
    body.style.height = '100%'
    body.style.overflow = 'hidden'

    return () => {
      html.style.height = prevHtmlHeight
      body.style.height = prevBodyHeight
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  // Redirect when already logged in
  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin')
    else if (user?.role) navigate('/student')
  }, [user, navigate])

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

      const loginUser = await login(form.email, form.password)
      
      // Role-based redirection
      if (loginUser.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/student')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  // Features list for left section
  const features = [
    {
      icon: '✓',
      title: 'Easy Leave Management',
      description: 'Submit and track your leave requests effortlessly.'
    },
    {
      icon: '⚡',
      title: 'Real-time Updates',
      description: 'Get instant notifications on your request status'
    },
    {
      icon: '🔒',
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security'
    }
  ]

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      margin: 0,
      padding: 0
    }}>
      {/* Left Side - Gradient Section with Welcome Content */}
      <div style={{
        flex: '0 0 50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        color: 'white',
        minHeight: '100vh'
      }}>
        <div style={{ maxWidth: '420px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '800',
            margin: '0 0 12px 0',
            lineHeight: '1.2',
            letterSpacing: '-1px'
          }}>
            Welcome to
          </h1>
          <h2 style={{
            fontSize: '56px',
            fontWeight: '800',
            margin: '0 0 32px 0',
            color: '#FFD700',
            lineHeight: '1.2',
            letterSpacing: '-1px'
          }}>
            Academic Leave<br />Portal
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 48px 0',
            lineHeight: '1.6'
          }}>
            Streamline your academic accountability and leave management with our comprehensive portal system.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {feature.icon}
                </div>
                <div>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '15px',
                    marginBottom: '4px'
                  }}>
                    {feature.title}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.4'
                  }}>
                    {feature.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - White Background Section */}
      <div style={{
        flex: '0 0 50%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        minHeight: '100vh'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '380px'
        }}>
          <div className="card" style={{ border: 'none', boxShadow: 'none', background: 'transparent', padding: 0 }}>
            <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '24px' }}>
              Academic Accountability<br />Leave Portal
            </h2>
            <p className="muted" style={{ textAlign: 'center', marginBottom: '28px' }}>
              Login with your email and password
            </p>
            
            <form className="form" onSubmit={onSubmit}>
              <div>
                <label>Email</label>
                <input 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={onChange}
                  placeholder="Enter your email"
                  required 
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <div className="error">{error}</div>}

              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
            <div className="info-box" style={{ marginTop: '24px', fontSize: '13px' }}>
              <strong>Note:</strong> Only administrators can create new user accounts. 
              Please contact your administrator for account creation.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="flex: '0 0 50%'"] {
            flex-basis: 100% !important;
          }
          div[style*="background: 'linear-gradient'"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default LoginPage
