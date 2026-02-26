import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyTests } from '../services/testService'
import { colors, spacing, borderRadius, typography, transitions } from '../utils/designSystem'

const TakeTestPage = () => {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTests = async () => {
      console.log('TakeTestPage loaded')
      try {
        const data = await getMyTests()
        const assignedTests = (data || []).filter((test) => test?.leave?.status === 'test_assigned')
        setTests(assignedTests)
        console.log('Assigned tests:', assignedTests)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing.xxxl }}>
        <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>⏳</div>
        <p style={{ ...typography.body_lg, color: colors.gray_600 }}>Loading assigned tests...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: spacing.xl, background: colors.danger_light, borderRadius: borderRadius.lg, color: colors.danger_dark }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: spacing.xxxl }}>
        <h1 style={{ ...typography.h1, margin: 0, color: colors.gray_900 }}>Take Test</h1>
        <p style={{ ...typography.body_lg, color: colors.gray_600, margin: `${spacing.md} 0 0 0` }}>
          View and start your assigned tests
        </p>
      </div>

      {tests.length === 0 ? (
        <div style={{
          background: colors.white,
          border: `1px solid ${colors.gray_200}`,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          textAlign: 'center',
          boxShadow: colors.shadow_sm
        }}>
          <div style={{ fontSize: '40px', marginBottom: spacing.md }}>📝</div>
          <div style={{ ...typography.h4, color: colors.gray_900, marginBottom: spacing.sm }}>
            No tests assigned yet
          </div>
          <p style={{ ...typography.body, color: colors.gray_600, margin: 0 }}>
            Check back later once an admin assigns a test to your leave request.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: spacing.lg }}>
          {tests.map((test) => (
            <div
              key={test._id}
              style={{
                background: colors.white,
                border: `1px solid ${colors.gray_200}`,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                boxShadow: colors.shadow_sm,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.md,
                transition: `all ${transitions.base}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ ...typography.h4, color: colors.gray_900, margin: 0 }}>{test.title}</div>
                <span style={{ fontSize: '24px', opacity: 0.6 }}>🧪</span>
              </div>
              <p style={{ ...typography.body_sm, color: colors.gray_600, margin: 0 }}>
                {test.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ ...typography.body_sm, color: colors.gray_500 }}>
                  Duration: {Math.round((test.duration || 3600) / 60)} mins
                </div>
                <Link
                  to={`/test/${test._id}`}
                  style={{
                    padding: `${spacing.sm} ${spacing.lg}`,
                    background: colors.primary,
                    color: colors.white,
                    borderRadius: borderRadius.md,
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: `all ${transitions.base}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.primary_dark
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.primary
                  }}
                >
                  Start Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TakeTestPage
