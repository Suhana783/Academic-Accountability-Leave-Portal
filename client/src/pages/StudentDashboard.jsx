import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyLeaves } from '../services/leaveService'
import { getMyStatistics } from '../services/testService'
import { Link } from 'react-router-dom'
import { colors, spacing, borderRadius, typography, transitions, statusColors } from '../utils/designSystem'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [testStats, setTestStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaveData, statsData] = await Promise.all([
          getMyLeaves(),
          getMyStatistics()
        ])
        setLeaves(leaveData)
        setTestStats(statsData)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const counts = leaves.reduce(
    (acc, leave) => {
      acc[leave.status] = (acc[leave.status] || 0) + 1
      return acc
    },
    { pending: 0, test_assigned: 0, approved: 0, rejected: 0 }
  )

  const assignedTests = testStats?.assignedTests ?? testStats?.totalTests ?? 0
  const submittedTests = testStats?.submittedTests ?? testStats?.totalTests ?? 0
  const passedTests = testStats?.passedTests ?? 0
  const pendingTests = testStats?.pendingTests ?? Math.max(assignedTests - submittedTests, 0)
  const passRate = testStats?.passRate ?? (submittedTests > 0 ? Math.round((passedTests / submittedTests) * 100) : 0)

  const actionCards = [
    { label: 'Apply Leave', icon: '✍️', desc: 'Submit new leave request', to: '/apply-leave', color: colors.primary },
    { label: 'My Leaves', icon: '📋', desc: 'View all your requests', to: '/my-leaves', color: colors.warning },
    { label: 'Take Test', icon: '📝', desc: 'Take assigned test', to: '/take-test', color: colors.success },
    { label: 'My Results', icon: '🏆', desc: 'View test scores', to: '/my-results', color: colors.danger }
  ]

  const statCards = [
    { label: 'Total Leaves', value: counts.pending + counts.test_assigned + counts.approved + counts.rejected, icon: '📋', color: colors.primary },
    { label: 'Pending Leaves', value: counts.pending, icon: '⏳', color: colors.warning },
    { label: 'Tests Assigned', value: assignedTests, icon: '📝', color: colors.success },
    { label: 'Tests Completed', value: submittedTests, icon: '✅', color: colors.danger }
  ]

  const getStatusBadge = (status) => {
    const badgeStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: `${spacing.xs} ${spacing.md}`,
      borderRadius: borderRadius.full,
      fontSize: '12px',
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
        <p style={{ ...typography.body_lg, color: colors.gray_600 }}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing.xxxl }}>
        <h1 style={{ ...typography.h1, margin: 0, color: colors.gray_900 }}>Welcome back, {user?.name}</h1>
        <p style={{ ...typography.body_lg, color: colors.gray_600, margin: `${spacing.md} 0 0 0` }}>
          Manage your leave requests and tests
        </p>
      </div>

      {/* Action Cards */}
      <div style={{ marginBottom: spacing.xxxl }}>
        <h2 style={{ ...typography.h3, margin: `0 0 ${spacing.lg} 0`, color: colors.gray_900 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: spacing.lg }}>
          {actionCards.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              style={{
                textDecoration: 'none',
                padding: spacing.lg,
                borderRadius: borderRadius.lg,
                border: `2px solid ${colors.gray_200}`,
                background: colors.white,
                cursor: 'pointer',
                transition: `all ${transitions.base}`,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.md,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = action.color
                e.currentTarget.style.boxShadow = `0 0 0 3px ${action.color}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.gray_200
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ ...typography.h4, color: colors.gray_900, margin: 0, fontSize: '18px', fontWeight: '600', lineHeight: 1.5, letterSpacing: '0.2px' }}>{action.label}</div>
                  <p style={{ ...typography.body_sm, color: colors.gray_600, margin: `${spacing.sm} 0 0 0`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>{action.desc}</p>
                </div>
                <div style={{ fontSize: '24px', opacity: 0.7 }}>{action.icon}</div>
              </div>
              <div style={{ fontSize: '15px', color: action.color, fontWeight: '600', lineHeight: 1.5, letterSpacing: '0.2px' }}>Go →</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div style={{ marginBottom: spacing.xxxl }}>
        <h2 style={{ ...typography.h3, margin: `0 0 ${spacing.lg} 0`, color: colors.gray_900 }}>📊 Your Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: spacing.lg }}>
          {statCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: colors.white,
                border: `1px solid ${colors.gray_200}`,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                boxShadow: colors.shadow_sm,
                transition: `all ${transitions.base}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = colors.shadow_md
                e.currentTarget.style.borderColor = stat.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = colors.shadow_sm
                e.currentTarget.style.borderColor = colors.gray_200
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
      </div>

      {/* Test Performance */}
      {testStats && (
        <div style={{ marginBottom: spacing.xxxl }}>
          <h2 style={{ ...typography.h3, margin: `0 0 ${spacing.lg} 0`, color: colors.gray_900 }}>📈 Test Performance</h2>
          <div style={{
            background: colors.white,
            border: `1px solid ${colors.gray_200}`,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            boxShadow: colors.shadow_sm
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: spacing.lg }}>
              <div>
                <p style={{ ...typography.body_sm, color: colors.gray_600, margin: 0, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>Pass Rate</p>
                <div style={{ fontSize: '34px', fontWeight: '800', color: colors.success, marginTop: spacing.sm, letterSpacing: '0.2px' }}>
                  {passRate}%
                </div>
              </div>
              <div>
                <p style={{ ...typography.body_sm, color: colors.gray_600, margin: 0, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>Tests Passed</p>
                <div style={{ fontSize: '34px', fontWeight: '800', color: colors.primary, marginTop: spacing.sm, letterSpacing: '0.2px' }}>
                  {passedTests}
                </div>
              </div>
              <div>
                <p style={{ ...typography.body_sm, color: colors.gray_600, margin: 0, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>Pending Tests</p>
                <div style={{ fontSize: '34px', fontWeight: '800', color: colors.warning, marginTop: spacing.sm, letterSpacing: '0.2px' }}>
                  {pendingTests}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Leaves */}
      <div>
        <h2 style={{ ...typography.h3, margin: `0 0 ${spacing.lg} 0`, color: colors.gray_900 }}>📋 Recent Leave Requests</h2>
        <div style={{
          background: colors.white,
          border: `1px solid ${colors.gray_200}`,
          borderRadius: borderRadius.lg,
          overflow: 'hidden',
          boxShadow: colors.shadow_sm
        }}>
          {leaves.length === 0 ? (
            <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.gray_600 }}>
              No leave requests yet. <Link to="/apply-leave" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '600' }}>Create one now</Link>
            </div>
          ) : (
            <div>
              {leaves.slice(0, 5).map((leave) => (
                <div
                  key={leave._id}
                  style={{
                    padding: spacing.lg,
                    borderBottom: `1px solid ${colors.gray_200}`,
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
                      {leave.startDate?.slice(0, 10)} to {leave.endDate?.slice(0, 10)}
                    </div>
                    <p style={{ ...typography.body_sm, color: colors.gray_600, margin: `${spacing.sm} 0 0 0`, fontSize: '15px', lineHeight: 1.5, letterSpacing: '0.2px' }}>
                      {leave.reason}
                    </p>
                  </div>
                  {getStatusBadge(leave.status)}
                </div>
              ))}
              {leaves.length > 5 && (
                <div style={{ padding: spacing.lg, textAlign: 'center', borderTop: `1px solid ${colors.gray_200}` }}>
                  <Link to="/my-leaves" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '600' }}>
                    View all leaves →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
