import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginApi, getMe } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  // Sync token + user to storage
  const persistAuth = (newUser, newToken) => {
    setUser(newUser)
    setToken(newToken)
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  }

  const handleLogin = async (email, password) => {
    setLoading(true)
    try {
      const data = await loginApi(email, password)
      persistAuth(data.user, data.token)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    persistAuth(null, null)
  }

  // On mount, if token exists but user is missing, fetch profile
  useEffect(() => {
    const bootstrap = async () => {
      if (token && !user) {
        setLoading(true)
        try {
          const me = await getMe()
          persistAuth(me, token)
        } catch (error) {
          logout()
        } finally {
          setLoading(false)
        }
      }
    }
    bootstrap()
  }, [token, user])

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role,
      isAuthenticated: Boolean(token),
      loading,
      login: handleLogin,
      logout
    }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
