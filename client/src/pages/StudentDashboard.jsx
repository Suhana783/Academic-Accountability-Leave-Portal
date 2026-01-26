import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyLeaves } from '../services/leaveService'
import { getMyStatistics } from '../services/testService'
import { Link, useNavigate } from 'react-router-dom'

const StudentDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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

  const leaveStats = [
    { label: 'Pending', value: counts.pending, icon: '📋', bgColor: '#FFF4E6', iconColor: '#FF9800', status: 'pending' },
    { label: 'Test Assigned', value: counts.test_assigned, icon: '📝', bgColor: '#E3F2FD', iconColor: '#2196F3', status: 'test_assigned' },
    { label: 'Approved', value: counts.approved, icon: '✓', bgColor: '#E8F5E9', iconColor: '#4CAF50', status: 'approved' },
    { label: 'Rejected', value: counts.rejected, icon: '✕', bgColor: '#FFEBEE', iconColor: '#F44336', status: 'rejected' }
  ]

  const assignedTests = testStats?.assignedTests ?? testStats?.totalTests ?? 0
  const submittedTests = testStats?.submittedTests ?? testStats?.totalTests ?? 0
  const passedTests = testStats?.passedTests ?? 0
  const failedTests = testStats?.failedTests ?? Math.max(submittedTests - passedTests, 0)
  const passRate = testStats?.passRate ?? (submittedTests > 0 ? Math.round((passedTests / submittedTests) * 100) : 0)
  const pendingTests = testStats?.pendingTests ?? Math.max(assignedTests - submittedTests, 0)

  const testStatCards = testStats ? [
    { label: 'Total Tests', value: assignedTests, icon: '📊', bgColor: '#F3E5F5', iconColor: '#9C27B0' },
    { label: 'Completed', value: submittedTests, icon: '✅', bgColor: '#E8F5E9', iconColor: '#4CAF50' },
    { label: 'Pending', value: pendingTests, icon: '⏳', bgColor: '#FFF4E6', iconColor: '#FF9800' },
    { label: 'Pass Rate', value: `${passRate}%`, icon: '📈', bgColor: '#FCE4EC', iconColor: '#E91E63' }
  ] : []

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 35%, #d6dcff 100%)', 
      padding: '36px 20px 32px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: '18px',
          padding: '22px 24px',
          boxShadow: '0 14px 40px rgba(59, 68, 150, 0.18)',
          border: '1px solid rgba(255,255,255,0.9)',
          backdropFilter: 'blur(6px)'
        }}>
          <h1 style={{ 
            fontSize: '34px', 
            fontWeight: '800', 
            margin: '0 0 8px 0', 
            color: '#1f2937',
            letterSpacing: '-0.5px'
          }}>
            Welcome, {user?.name}
          </h1>
          <p style={{ 
            fontSize: '15px', 
            color: '#4b5563', 
            margin: 0,
            fontWeight: '500'
          }}>
            Role: {user?.role} | Email: {user?.email}
          </p>
        </div>

        {loading && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '20px',
              animation: 'spin 2s linear infinite',
              display: 'inline-block'
            }}>⚙️</div>
            <p style={{ color: '#6c757d', fontSize: '16px', margin: 0, fontWeight: '500' }}>Loading your data...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Leave Requests Section */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ 
                background: 'white', 
                borderRadius: '20px', 
                padding: '25px 30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.8)'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  marginTop: 0,
                  marginBottom: '20px', 
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  📋 Leave Requests
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px'
                }}>
                  {leaveStats.map((stat, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(`/my-leaves?status=${stat.status}`)}
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '28px 24px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.25)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        fontSize: '80px',
                        opacity: '0.1',
                        transform: 'rotate(-15deg)'
                      }}>
                        {stat.icon}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          background: stat.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '26px',
                          marginRight: '15px'
                        }}>
                          {stat.icon}
                        </div>
                        <div style={{ fontSize: '40px', fontWeight: '800', color: stat.iconColor }}>
                          {stat.value}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', letterSpacing: '0.5px' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Results Section */}
            {testStats && (
              <div style={{ marginBottom: '30px' }}>
                <div style={{ 
                  background: 'white', 
                  borderRadius: '20px', 
                  padding: '25px 30px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.8)'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    marginTop: 0,
                    marginBottom: '20px', 
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    📊 Test Results
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px'
                  }}>
                    {testStatCards.map((stat, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'white',
                          borderRadius: '16px',
                          padding: '28px 24px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                          e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.25)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)'
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-20px',
                          right: '-20px',
                          fontSize: '80px',
                          opacity: '0.1',
                          transform: 'rotate(-15deg)'
                        }}>
                          {stat.icon}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: stat.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '26px',
                            marginRight: '15px'
                          }}>
                            {stat.icon}
                          </div>
                          <div style={{ fontSize: '40px', fontWeight: '800', color: stat.iconColor }}>
                            {stat.value}
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: '600', letterSpacing: '0.5px' }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '25px 30px',
              marginBottom: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                marginTop: 0, 
                marginBottom: '18px', 
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                ⚡ Quick Actions
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to="/apply-leave" style={{ 
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)', 
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.25)',
                  transition: 'all 0.3s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(99, 102, 241, 0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.25)'
                }}
                >
                  ➕ Apply Leave
                </Link>
                <Link to="/my-leaves" style={{ 
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: '0 10px 25px rgba(244, 63, 94, 0.18)',
                  transition: 'all 0.3s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(244, 63, 94, 0.28)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(244, 63, 94, 0.18)'
                }}
                >
                  👁️ View My Leaves
                </Link>
                <Link to="/my-results" style={{ 
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.18)',
                  transition: 'all 0.3s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.28)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.18)'
                }}
                >
                  📊 My Results
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
