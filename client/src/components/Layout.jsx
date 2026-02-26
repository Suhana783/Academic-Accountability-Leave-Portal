import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, borderRadius, typography, transitions } from '../utils/designSystem'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup'

  if (isLoginPage) {
    return <main>{children}</main>
  }

  const studentMenuItems = [
    { label: 'Dashboard', icon: '📊', path: '/student' },
    { label: 'Apply Leave', icon: '✍️', path: '/apply-leave' },
    { label: 'My Leaves', icon: '📋', path: '/my-leaves' },
    { label: 'Take Test', icon: '📝', path: '/take-test' },
    { label: 'My Results', icon: '🏆', path: '/my-results' },
  ]

  const adminMenuItems = [
    { label: 'Dashboard', icon: '📊', path: '/admin' },
    { label: 'Manage Students', icon: '👥', path: '/admin/students' },
    { label: 'Leave Requests', icon: '📋', path: '/admin/leave-requests' },
    { label: 'Results', icon: '📈', path: '/admin/results' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems

  const sidebarStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRight: 'none',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: colors.shadow_lg,
  }

  const brandStyle = {
    padding: spacing.xl,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  }

  const brandIconStyle = {
    fontSize: '28px',
  }

  const brandTextStyle = {
    ...typography.h4,
    color: colors.white,
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: 1.5,
    letterSpacing: '0.2px',
  }

  const navStyle = {
    flex: 1,
    padding: spacing.lg,
    overflowY: 'auto',
  }

  const menuItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md} ${spacing.lg}`,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    textDecoration: 'none',
    color: colors.white,
    background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'}`,
    cursor: 'pointer',
    transition: `all ${transitions.base}`,
    ...typography.body,
    fontSize: '17px',
    lineHeight: 1.5,
    letterSpacing: '0.2px',
    fontWeight: isActive ? '700' : '600',
  })

  const logoutBoxStyle = {
    padding: spacing.lg,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  }

  const mainContentStyle = {
    minHeight: '100vh',
    background: colors.bg_secondary,
    display: 'flex',
    flexDirection: 'column',
  }

  const topBarStyle = {
    background: colors.white,
    borderBottom: `1px solid ${colors.gray_200}`,
    padding: `${spacing.lg} ${spacing.xl}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: colors.shadow_sm,
  }

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
  }

  const userNameStyle = {
    ...typography.body_sm,
    color: colors.gray_700,
    fontWeight: '600',
  }

  const logoutButtonStyle = {
    padding: `${spacing.sm} ${spacing.lg}`,
    background: 'rgba(255, 255, 255, 0.2)',
    color: colors.white,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    transition: `all ${transitions.base}`,
    width: '100%',
    textAlign: 'center',
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar" style={sidebarStyle}>
        {/* Brand */}
        <div style={brandStyle}>
          <div style={brandIconStyle}>🎓</div>
          <div>
            <h3 style={brandTextStyle}>LeaveHub</h3>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={navStyle}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={menuItemStyle(isActive)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Box */}
        <div style={logoutBoxStyle}>
          <button
            style={logoutButtonStyle}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content" style={mainContentStyle}>
        {/* Top Bar */}
        <div style={topBarStyle}>
          <div style={{ ...typography.h4, color: colors.gray_900, fontSize: '18px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.2px' }}>
            {user?.role === 'admin' ? '👨‍💼 Admin Panel' : '👤 Student Portal'}
          </div>
          <div style={userInfoStyle}>
            <span style={userNameStyle}>{user?.name}</span>
            <span style={{ ...typography.body_sm, color: colors.gray_500, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
              {user?.role === 'admin' ? 'Administrator' : 'Student'}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <main style={{ padding: spacing.xl, flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
