import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllLeaves } from '../services/leaveService'
import { getAllStudents, getAllAdmins } from '../services/authService'
import { colors, spacing, borderRadius, typography, transitions, statusColors } from '../utils/designSystem'

const AdminDashboard = () => {
  const [leaves, setLeaves] = useState([])
  const [students, setStudents] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesData, studentsData, adminsData] = await Promise.all([
          getAllLeaves(),
          getAllStudents(),
          getAllAdmins()
        ])
        setLeaves(leavesData)
        setStudents(studentsData)
        setAdmins(adminsData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = [
    { label: 'Total Students', value: students.length, icon: '👥', color: colors.primary },
    { label: 'Total Admins', value: admins.length, icon: '🔑', color: colors.success },
    { label: 'Pending Leaves', value: leaves.filter(l => l.status === 'pending').length, icon: '⏳', color: colors.warning }
  ]

  const getStatusBadge = (status) => {
    const badgeStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: `${spacing.xs} ${spacing.md}`,
      borderRadius: borderRadius.full,
      fontSize: '11px',
      fontWeight: '600',
      border: `1.5px solid`,
    }

    const statusConfig = {
      pending: { icon: '⏳', ...statusColors.pending },
      test_assigned: { icon: '📝', ...statusColors.test_assigned },
      approved: { icon: '✅', ...statusColors.approved },
      rejected: { icon: '❌', ...statusColors.rejected },
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <span style={{
        ...badgeStyle,
        background: config.bg,
        color: config.text,
        borderColor: config.border
      }}>
        <span>{config.icon}</span>
        <span>{status === 'test_assigned' ? 'Test Created' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing.xxxl }}>
        <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>⏳</div>
        <p style={{ ...typography.body_lg, color: colors.gray_600 }}>Loading admin data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: spacing.xl, background: colors.danger_light, borderRadius: borderRadius.lg, color: colors.danger_dark }}>
        Error: {error}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing.xxxl }}>
        <h1 style={{ ...typography.h1, margin: 0, color: colors.gray_900 }}>Admin Dashboard</h1>
        <p style={{ ...typography.body_lg, color: colors.gray_600, margin: `${spacing.md} 0 0 0` }}>
          Manage students and leave requests
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{ marginBottom: spacing.xxxl, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.lg }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: colors.white,
              border: `1px solid ${colors.gray_200}`,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              boxShadow: colors.shadow_sm,
              transition: `all ${transitions.base}`,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = colors.shadow_md
              e.currentTarget.style.borderColor = stat.color
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = colors.shadow_sm
              e.currentTarget.style.borderColor = colors.gray_200
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
              <span style={{ ...typography.body_sm, color: colors.gray_600, fontWeight: '600', fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>{stat.label}</span>
              <span style={{ fontSize: '24px', opacity: 0.6 }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: '38px', fontWeight: '800', color: stat.color, lineHeight: 1, letterSpacing: '0.2px' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: spacing.xxxl, display: 'flex', gap: spacing.lg, flexWrap: 'wrap' }}>
        <Link to="/admin/leave-requests" style={{
          padding: `${spacing.md} ${spacing.lg}`,
          background: colors.primary,
          color: colors.white,
          borderRadius: borderRadius.md,
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '15px',
          lineHeight: 1.5,
          letterSpacing: '0.2px',
          cursor: 'pointer',
          transition: `all ${transitions.base}`,
          border: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.primary_dark
          e.currentTarget.style.boxShadow = colors.shadow_md
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.primary
          e.currentTarget.style.boxShadow = 'none'
        }}
        >
          📋 Pending Leave Requests
        </Link>
        <Link to="/admin/students" style={{
          padding: `${spacing.md} ${spacing.lg}`,
          background: colors.success,
          color: colors.white,
          borderRadius: borderRadius.md,
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '15px',
          lineHeight: 1.5,
          letterSpacing: '0.2px',
          cursor: 'pointer',
          transition: `all ${transitions.base}`,
          border: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.success_dark
          e.currentTarget.style.boxShadow = colors.shadow_md
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.success
          e.currentTarget.style.boxShadow = 'none'
        }}
        >
          👥 Manage Students
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: spacing.lg, display: 'flex', gap: spacing.lg, borderBottom: `2px solid ${colors.gray_200}` }}>
        {['overview', 'leaves', 'students', 'admins'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? `3px solid ${colors.primary}` : '3px solid transparent',
              color: activeTab === tab ? colors.primary : colors.gray_600,
              fontWeight: activeTab === tab ? '700' : '600',
              fontSize: '16px',
              lineHeight: 1.5,
              letterSpacing: '0.2px',
              cursor: 'pointer',
              transition: `all ${transitions.base}`,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) e.currentTarget.style.color = colors.gray_900
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) e.currentTarget.style.color = colors.gray_600
            }}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'leaves' && '📋 Leaves'}
            {tab === 'students' && '👥 Students'}
            {tab === 'admins' && '🔑 Admins'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {/* Leaves Tab */}
        {activeTab === 'leaves' && (
          <div style={{
            background: colors.white,
            border: `1px solid ${colors.gray_200}`,
            borderRadius: borderRadius.lg,
            overflow: 'hidden',
            boxShadow: colors.shadow_sm
          }}>
            {leaves.length === 0 ? (
              <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.gray_600 }}>
                No leave requests found
              </div>
            ) : (
              <div>
                {leaves.map((leave, idx) => (
                  <div
                    key={leave._id}
                    style={{
                      padding: spacing.lg,
                      borderBottom: idx !== leaves.length - 1 ? `1px solid ${colors.gray_200}` : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: `background ${transitions.base}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.gray_50
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.white
                    }}
                  >
                    <div>
                      <div style={{ ...typography.body, fontWeight: '600', color: colors.gray_900, fontSize: '16px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                        {(leave.student?.name || leave.student?.username || leave.studentName)} - {leave.startDate?.slice(0, 10)} to {leave.endDate?.slice(0, 10)}
                      </div>
                      <p style={{ ...typography.body_sm, color: colors.gray_600, margin: `${spacing.sm} 0 0 0`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                        {leave.reason}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center' }}>
                      {getStatusBadge(leave.status)}
                      <Link
                        to="/admin/leave-requests"
                        style={{
                          padding: `${spacing.sm} ${spacing.md}`,
                          background: colors.primary_light,
                          color: colors.primary,
                          borderRadius: borderRadius.md,
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: `all ${transitions.base}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.primary
                          e.currentTarget.style.color = colors.white
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = colors.primary_light
                          e.currentTarget.style.color = colors.primary
                        }}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div style={{
            background: colors.white,
            border: `1px solid ${colors.gray_200}`,
            borderRadius: borderRadius.lg,
            overflow: 'hidden',
            boxShadow: colors.shadow_sm
          }}>
            {students.length === 0 ? (
              <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.gray_600 }}>
                No students found
              </div>
            ) : (
              <div>
                {students.map((student, idx) => (
                  <div
                    key={student._id}
                    style={{
                      padding: spacing.lg,
                      borderBottom: idx !== students.length - 1 ? `1px solid ${colors.gray_200}` : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: `background ${transitions.base}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.gray_50
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.white
                    }}
                  >
                    <div>
                      <div style={{ ...typography.body, fontWeight: '600', color: colors.gray_900, fontSize: '16px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                        {student.username || student.name}
                      </div>
                      <p style={{ ...typography.body_sm, color: colors.gray_600, margin: `${spacing.sm} 0 0 0`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                        {student.email}
                      </p>
                    </div>
                    <Link
                      to="/admin/students"
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        background: colors.primary_light,
                        color: colors.primary,
                        borderRadius: borderRadius.md,
                        textDecoration: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: `all ${transitions.base}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.primary
                        e.currentTarget.style.color = colors.white
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.primary_light
                        e.currentTarget.style.color = colors.primary
                      }}
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div style={{
            background: colors.white,
            border: `1px solid ${colors.gray_200}`,
            borderRadius: borderRadius.lg,
            overflow: 'hidden',
            boxShadow: colors.shadow_sm
          }}>
            {admins.length === 0 ? (
              <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.gray_600 }}>
                No admins found
              </div>
            ) : (
              <div>
                {admins.map((admin, idx) => (
                  <div
                    key={admin._id}
                    style={{
                      padding: spacing.lg,
                      borderBottom: idx !== admins.length - 1 ? `1px solid ${colors.gray_200}` : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: `background ${transitions.base}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.gray_50
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.white
                    }}
                  >
                    <div>
                      <div style={{ ...typography.body, fontWeight: '600', color: colors.gray_900, fontSize: '16px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                        {admin.username || admin.name}
                      </div>
                      <p style={{ ...typography.body_sm, color: colors.gray_600, margin: `${spacing.sm} 0 0 0`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                        {admin.email}
                      </p>
                    </div>
                    <span style={{
                      padding: `${spacing.xs} ${spacing.md}`,
                      background: colors.primary_light,
                      color: colors.primary,
                      borderRadius: borderRadius.full,
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      👤 Admin
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing.lg }}>
            {/* Recent Leaves */}
            <div style={{
              background: colors.white,
              border: `1px solid ${colors.gray_200}`,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              boxShadow: colors.shadow_sm
            }}>
              <h3 style={{ ...typography.h4, margin: `0 0 ${spacing.lg} 0`, color: colors.gray_900, fontSize: '18px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.2px' }}>Recent Leaves</h3>
              {leaves.slice(0, 5).map((leave) => (
                <div key={leave._id} style={{ marginBottom: spacing.md, paddingBottom: spacing.md, borderBottom: `1px solid ${colors.gray_200}` }}>
                  <div style={{ ...typography.body_sm, fontWeight: '600', color: colors.gray_900, fontSize: '16px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                    {(leave.student?.name || leave.student?.username || leave.studentName)}
                  </div>
                  <p style={{ ...typography.body_sm, color: colors.gray_600, margin: `${spacing.xs} 0 0 0`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                    {leave.startDate?.slice(0, 10)} to {leave.endDate?.slice(0, 10)}
                  </p>
                  {getStatusBadge(leave.status)}
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div style={{
              background: colors.white,
              border: `1px solid ${colors.gray_200}`,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              boxShadow: colors.shadow_sm
            }}>
              <h3 style={{ ...typography.h4, margin: `0 0 ${spacing.lg} 0`, color: colors.gray_900 }}>Summary</h3>
              <div style={{ marginBottom: spacing.md }}>
                <p style={{ ...typography.body_sm, color: colors.gray_600, margin: 0, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>Total Leaves</p>
                <p style={{ fontSize: '30px', fontWeight: '800', color: colors.primary, margin: `${spacing.sm} 0 0 0`, letterSpacing: '0.2px' }}>
                  {leaves.length}
                </p>
              </div>
              <div style={{ marginBottom: spacing.md }}>
                <p style={{ ...typography.body_sm, color: colors.gray_600, margin: 0, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>Pending Approval</p>
                <p style={{ fontSize: '30px', fontWeight: '800', color: colors.warning, margin: `${spacing.sm} 0 0 0`, letterSpacing: '0.2px' }}>
                  {leaves.filter(l => l.status === 'pending').length}
                </p>
              </div>
              <div>
                <p style={{ ...typography.body_sm, color: colors.gray_600, margin: 0, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>Active Students</p>
                <p style={{ fontSize: '30px', fontWeight: '800', color: colors.success, margin: `${spacing.sm} 0 0 0`, letterSpacing: '0.2px' }}>
                  {students.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
