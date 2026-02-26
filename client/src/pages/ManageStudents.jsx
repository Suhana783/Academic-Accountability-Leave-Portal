import { useEffect, useMemo, useState } from 'react'
import { createAdmin, createStudent, getAllAdmins, getAllStudents, removeUserByEmail } from '../services/authService'
import { colors, spacing, borderRadius, typography, transitions } from '../utils/designSystem'

const ManageStudents = () => {
  const [students, setStudents] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [studentForm, setStudentForm] = useState({ username: '', email: '', password: '' })
  const [adminForm, setAdminForm] = useState({ username: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const [studentsData, adminsData] = await Promise.all([getAllStudents(), getAllAdmins()])
      setStudents(studentsData)
      setAdmins(adminsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const allUsers = useMemo(() => {
    const formattedStudents = students.map((user) => ({ ...user, role: 'student' }))
    const formattedAdmins = admins.map((user) => ({ ...user, role: 'admin' }))
    return [...formattedStudents, ...formattedAdmins]
  }, [students, admins])

  const handleChange = (setter) => (e) => {
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const resetMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    resetMessages()

    if (!studentForm.username || !studentForm.email || !studentForm.password) {
      setError('Username, email, and password are required to add a student.')
      return
    }

    setSubmitting(true)
    try {
      await createStudent(studentForm)
      setSuccess('Student created successfully.')
      setStudentForm({ username: '', email: '', password: '' })
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    resetMessages()

    if (!adminForm.username || !adminForm.email || !adminForm.password) {
      setError('Username, email, and password are required to add an admin.')
      return
    }

    setSubmitting(true)
    try {
      await createAdmin(adminForm)
      setSuccess('Admin created successfully.')
      setAdminForm({ username: '', email: '', password: '' })
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (email, roleLabel) => {
    resetMessages()
    setSubmitting(true)
    try {
      await removeUserByEmail(email)
      setSuccess(`${roleLabel} deleted successfully.`)
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing.xxxl }}>
        <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>⏳</div>
        <p style={{ ...typography.body_lg, color: colors.gray_600 }}>Loading users...</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: spacing.xxxl }}>
        <h1 style={{ ...typography.h1, margin: 0, color: colors.gray_900 }}>Manage Users</h1>
        <p style={{ ...typography.body_lg, color: colors.gray_600, margin: `${spacing.md} 0 0 0` }}>
          Add and remove student/admin accounts
        </p>
      </div>

      {(error || success) && (
        <div style={{
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.xl,
          background: error ? colors.danger_light : colors.success_light,
          color: error ? colors.danger_dark : colors.success_dark,
          border: `1px solid ${error ? colors.danger : colors.success}`
        }}>
          {error || success}
        </div>
      )}

      <div style={{
        background: colors.white,
        border: `1px solid ${colors.gray_200}`,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        boxShadow: colors.shadow_sm,
        marginBottom: spacing.xxxl
      }}>
        <div style={{ padding: spacing.lg, borderBottom: `1px solid ${colors.gray_200}` }}>
          <h2 style={{ ...typography.h4, margin: 0, color: colors.gray_900, fontSize: '18px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.2px' }}>Users</h2>
        </div>
        {allUsers.length === 0 ? (
          <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.gray_600 }}>
            No users found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: colors.gray_50, textAlign: 'left' }}>
                  <th style={{ padding: spacing.md, fontSize: '13px', textTransform: 'uppercase', color: colors.gray_600, fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.5px' }}>Username</th>
                  <th style={{ padding: spacing.md, fontSize: '13px', textTransform: 'uppercase', color: colors.gray_600, fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.5px' }}>Email</th>
                  <th style={{ padding: spacing.md, fontSize: '13px', textTransform: 'uppercase', color: colors.gray_600, fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.5px' }}>Role</th>
                  <th style={{ padding: spacing.md, fontSize: '13px', textTransform: 'uppercase', color: colors.gray_600, fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user, idx) => (
                  <tr key={`${user.email}-${idx}`} style={{ borderTop: `1px solid ${colors.gray_200}` }}>
                    <td style={{ padding: spacing.md, color: colors.gray_900, fontWeight: 600, fontSize: '16px', lineHeight: 1.5, letterSpacing: '0.2px' }}>{user.username || user.name}</td>
                    <td style={{ padding: spacing.md, color: colors.gray_700, fontSize: '16px', lineHeight: 1.5, letterSpacing: '0.2px' }}>{user.email}</td>
                    <td style={{ padding: spacing.md, color: colors.gray_700, textTransform: 'capitalize', fontSize: '16px', lineHeight: 1.5, letterSpacing: '0.2px' }}>{user.role}</td>
                    <td style={{ padding: spacing.md }}>
                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => handleDeleteUser(user.email, user.role === 'admin' ? 'Admin' : 'Student')}
                        disabled={submitting}
                        style={{ padding: `${spacing.xs} ${spacing.md}`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}
                      >
                        {user.role === 'admin' ? 'Delete Admin' : 'Delete Student'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: spacing.lg }}>
        <form
          className="card"
          onSubmit={handleCreateStudent}
          style={{ marginBottom: 0 }}
        >
          <h2>Add Student</h2>
          <p className="muted">Create a new student account.</p>

          <div className="form">
            <div>
              <label>Username</label>
              <input
                name="username"
                type="text"
                value={studentForm.username}
                onChange={handleChange(setStudentForm)}
                placeholder="Student username"
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={studentForm.email}
                onChange={handleChange(setStudentForm)}
                placeholder="student@example.com"
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={studentForm.password}
                onChange={handleChange(setStudentForm)}
                placeholder="Set a password"
                required
              />
            </div>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Student'}
            </button>
          </div>
        </form>

        <form
          className="card"
          onSubmit={handleCreateAdmin}
          style={{ marginBottom: 0 }}
        >
          <h2>Add Admin</h2>
          <p className="muted">Create a new admin account.</p>

          <div className="form">
            <div>
              <label>Username</label>
              <input
                name="username"
                type="text"
                value={adminForm.username}
                onChange={handleChange(setAdminForm)}
                placeholder="Admin username"
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={adminForm.email}
                onChange={handleChange(setAdminForm)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={adminForm.password}
                onChange={handleChange(setAdminForm)}
                placeholder="Set a password"
                required
              />
            </div>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManageStudents
