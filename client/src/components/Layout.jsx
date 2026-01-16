import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Academic Leave Portal</div>
        {user && (
          <nav className="nav">
            {user.role === 'student' && (
              <>
                <Link to="/student" className="nav-link">Dashboard</Link>
                <Link to="/apply-leave" className="nav-link">Apply Leave</Link>
                <Link to="/my-leaves" className="nav-link">My Leaves</Link>
                <Link to="/my-results" className="nav-link">My Results</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className="nav-link">Admin Dashboard</Link>
                <Link to="/admin/results" className="nav-link">Results</Link>
              </>
            )}
          </nav>
        )}
        <div className="user-box">
          {user ? (
            <>
              <span className="user-name">{user.name} ({user.role})</span>
              <button className="btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn">Login</Link>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}

export default Layout
