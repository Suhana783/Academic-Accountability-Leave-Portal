import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, borderRadius, typography, transitions } from '../utils/designSystem'

const LoginPage = () => {
  const { login, loading, user } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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
      if (loginUser.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/student')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  const features = [
    { icon: '📋', title: 'Leave Management', desc: 'Submit and track requests easily' },
    { icon: '⚡', title: 'Real-time Updates', desc: 'Instant status notifications' },
    { icon: '🔒', title: 'Secure & Reliable', desc: 'Enterprise-grade security' }
  ]

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: colors.bg_secondary,
    }}>
      {/* Left Section - Gradient with Features */}
      <div style={{
        flex: '0 0 45%',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary_dark} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: spacing.xxxl,
        color: colors.white,
      }}>
        <div style={{ maxWidth: '420px' }}>
          <div style={{ marginBottom: spacing.xxxl }}>
            <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>🎓</div>
            <h1 style={{ ...typography.h1, color: colors.white, margin: 0, marginBottom: spacing.md }}>
              LeaveHub
            </h1>
            <p style={{ ...typography.body_lg, color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
              Academic Accountability Leave Portal
            </p>
          </div>

          <p style={{
            ...typography.body_lg,
            color: 'rgba(255, 255, 255, 0.95)',
            margin: `0 0 ${spacing.xxxl} 0`,
            lineHeight: '1.6'
          }}>
            Streamline your leave management with our comprehensive portal system. Submit, track, and manage your academic leaves with ease.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {features.map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: spacing.lg, alignItems: 'flex-start' }}>
                <div style={{
                  fontSize: '28px',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {feat.icon}
                </div>
                <div>
                  <div style={{ ...typography.h4, color: colors.white, margin: 0, marginBottom: spacing.sm }}>
                    {feat.title}
                  </div>
                  <p style={{ ...typography.body_sm, color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div style={{
        flex: '0 0 55%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxxl,
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: spacing.xxxl }}>
            <h2 style={{ ...typography.h2, color: colors.gray_900, margin: 0, marginBottom: spacing.md }}>
              Welcome Back
            </h2>
            <p style={{ ...typography.body_lg, color: colors.gray_600, margin: 0 }}>
              Login to your account to continue
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                ...typography.label,
                color: colors.gray_700,
                marginBottom: spacing.sm
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  border: `1.5px solid ${colors.gray_200}`,
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: `all ${transitions.base}`,
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.gray_200
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label style={{
                display: 'block',
                ...typography.label,
                color: colors.gray_700,
                marginBottom: spacing.sm
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    paddingRight: spacing.xxxl,
                    borderRadius: borderRadius.md,
                    border: `1.5px solid ${colors.gray_200}`,
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: `all ${transitions.base}`,
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.gray_200
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: spacing.md,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: 0,
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: spacing.md,
                background: colors.danger_light,
                border: `1px solid ${colors.danger}20`,
                borderRadius: borderRadius.md,
                color: colors.danger,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                background: loading ? colors.gray_400 : colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: borderRadius.md,
                ...typography.body,
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: `all ${transitions.base}`,
                width: '100%',
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
              {loading ? '🔄 Logging in...' : '🚀 Login'}
            </button>
          </form>

          {/* Info Box */}
          <div style={{
            marginTop: spacing.xl,
            padding: spacing.lg,
            background: colors.primary_light,
            border: `1px solid ${colors.primary}30`,
            borderRadius: borderRadius.md,
            ...typography.body_sm,
            color: colors.primary_dark
          }}>
            <strong>ℹ️ Note:</strong> Only administrators can create new accounts. Contact your administrator to get access.
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
