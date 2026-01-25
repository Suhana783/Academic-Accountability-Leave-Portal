import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllLeaves } from '../services/leaveService'
import { getAllStudents, getAllAdmins } from '../services/authService'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [leaves, setLeaves] = useState([])
  const [students, setStudents] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('leaves')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesData, studentsData, adminsData] = await Promise.all([
          getAllLeaves(),
          getAllStudents(),
          getAllAdmins()
        ])
        console.log('Fetched leavesData:', leavesData)
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

  const pending = leaves.filter((l) => l.status === 'pending')
  const assigned = leaves.filter((l) => l.status === 'test_assigned')
  const approved = leaves.filter((l) => l.status === 'approved')
  const rejected = leaves.filter((l) => l.status === 'rejected')

  // Stats configuration
  const stats = [
    { label: 'Pending Requests', value: pending.length, icon: '⏳', bgColor: '#fff3cd', iconColor: '#ff9800', textColor: '#856404' },
    { label: 'Tests Created', value: assigned.length, icon: '📝', bgColor: '#cfe2ff', iconColor: '#0d6efd', textColor: '#084298' },
    { label: 'Approved Leaves', value: approved.length, icon: '✅', bgColor: '#d1e7dd', iconColor: '#198754', textColor: '#0f5132' },
    { label: 'Rejected Leaves', value: rejected.length, icon: '❌', bgColor: '#f8d7da', iconColor: '#dc3545', textColor: '#842029' },
    { label: 'Total Students', value: students.length, icon: '👨‍🎓', bgColor: '#e7d6f8', iconColor: '#9c27b0', textColor: '#5e2573' },
    { label: 'Total Admins', value: admins.length, icon: '👤', bgColor: '#ffe5d9', iconColor: '#ff5722', textColor: '#ad3e17' }
  ]

  return (
    <div style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 35%, #d6dcff 100%)', minHeight: '100vh', padding: '36px 20px' }}>
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
          <h1 style={{ fontSize: '34px', fontWeight: '800', margin: '0 0 8px 0', color: '#1f2937', letterSpacing: '-0.5px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '15px', color: '#4b5563', margin: 0, fontWeight: '500' }}>
            Monitor leave requests, manage users, and track test results
          </p>
        </div>

        {/* Statistics Cards */}
        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '35px'
          }}>
            {stats.map((stat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (stat.label === 'Rejected Leaves') {
                    navigate('/admin/results')
                  }
                }}
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
        )}

        {/* Quick Actions */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '25px 30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: 0, marginBottom: '18px', color: '#333' }}>
            ⚡ Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link className="btn" to="/admin/add-student" style={{ 
              textDecoration: 'none', 
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)', 
              border: 'none',
              padding: '10px 18px',
              fontWeight: '700',
              borderRadius: '999px',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.25)'
            }}>
              ➕ Add Student
            </Link>
            <Link className="btn" to="/admin/add-admin" style={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #f97316 0%, #fb7185 100%)',
              border: 'none',
              padding: '10px 18px',
              fontWeight: '700',
              borderRadius: '999px',
              boxShadow: '0 10px 25px rgba(249, 115, 22, 0.18)'
            }}>
              ➕ Add Admin
            </Link>
            <Link className="btn" to="/admin/remove-user" style={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
              border: 'none',
              padding: '10px 18px',
              fontWeight: '700',
              borderRadius: '999px',
              color: 'white',
              boxShadow: '0 10px 25px rgba(244, 63, 94, 0.18)'
            }}>
              🗑️ Remove User
            </Link>
            <Link className="btn" to="/admin/results" style={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
              border: 'none',
              padding: '10px 18px',
              fontWeight: '700',
              borderRadius: '999px',
              color: 'white',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.18)'
            }}>
              📊 View Results
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          padding: '0',
          boxShadow: '0 22px 50px rgba(79, 70, 229, 0.12)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.9)',
          backdropFilter: 'blur(6px)'
        }}>
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '3px solid #f0f0f0',
            background: 'linear-gradient(to bottom, #fafafa, #fff)',
            padding: '0 30px'
          }}>
            <button
              style={{
                padding: '18px 28px',
                border: 'none',
                background: activeTab === 'leaves' ? 'white' : 'transparent',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                borderBottom: activeTab === 'leaves' ? '3px solid #667eea' : '3px solid transparent',
                marginBottom: '-3px',
                transition: 'all 0.3s',
                color: activeTab === 'leaves' ? '#667eea' : '#6c757d',
                borderRadius: '12px 12px 0 0'
              }}
              onClick={() => setActiveTab('leaves')}
            >
              📋 Leave Management
            </button>
            <button
              style={{
                padding: '18px 28px',
                border: 'none',
                background: activeTab === 'students' ? 'white' : 'transparent',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                borderBottom: activeTab === 'students' ? '3px solid #667eea' : '3px solid transparent',
                marginBottom: '-3px',
                transition: 'all 0.3s',
                color: activeTab === 'students' ? '#667eea' : '#6c757d',
                borderRadius: '12px 12px 0 0'
              }}
              onClick={() => setActiveTab('students')}
            >
              👨‍🎓 Students ({students.length})
            </button>
            <button
              style={{
                padding: '18px 28px',
                border: 'none',
                background: activeTab === 'admins' ? 'white' : 'transparent',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                borderBottom: activeTab === 'admins' ? '3px solid #667eea' : '3px solid transparent',
                marginBottom: '-3px',
                transition: 'all 0.3s',
                color: activeTab === 'admins' ? '#667eea' : '#6c757d',
                borderRadius: '12px 12px 0 0'
              }}
              onClick={() => setActiveTab('admins')}
            >
              👤 Admins ({admins.length})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '28px' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '20px',
                  animation: 'spin 2s linear infinite',
                  display: 'inline-block'
                }}>⚙️</div>
                <p style={{ color: '#6c757d', fontSize: '16px' }}>Loading data...</p>
              </div>
            )}
            
            {error && (
              <div style={{ 
                background: '#f8d7da', 
                color: '#842029', 
                padding: '20px', 
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                {error}
              </div>
            )}

            {/* Leave Management Tab */}
            {activeTab === 'leaves' && !loading && (
              <div>
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#333' }}>
                  📥 Pending Leaves ({pending.length})
                </h4>
                <div style={{ marginBottom: '40px' }}>
                  {pending.map((leave) => (
                    <div key={leave._id} style={{
                      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '15px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                      border: '2px solid rgba(255,255,255,0.8)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '17px', color: '#333' }}>{leave.student?.name}</strong>
                          <div style={{ marginTop: '8px', fontSize: '14px', color: '#555' }}>
                            <span style={{ marginRight: '15px' }}>📝 {leave.reason}</span>
                          </div>
                          <div style={{ marginTop: '6px', fontSize: '13px', color: '#666' }}>
                            📅 {leave.startDate?.slice(0,10)} → {leave.endDate?.slice(0,10)}
                          </div>
                        </div>
                        <Link 
                          className="btn" 
                          to={`/admin/leaves/${leave._id}`} 
                          style={{ 
                            textDecoration: 'none',
                            background: 'white',
                            color: '#667eea',
                            border: '2px solid #667eea',
                            fontWeight: '600',
                            boxShadow: '0 4px 10px rgba(102, 126, 234, 0.2)'
                          }}
                        >
                          👁️ Review
                        </Link>
                      </div>
                    </div>
                  ))}
                  {pending.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                      <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
                      <p>No pending leaves at the moment.</p>
                    </div>
                  )}
                </div>

                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#333' }}>
                  ✅ Test Assigned ({assigned.length})
                </h4>
                  <div>
                  {assigned.map((leave) => (
                    <div key={leave._id} style={{
                      background: 'linear-gradient(120deg, #f8fafc 0%, #eef2ff 50%, #fdf2f8 100%)',
                      borderRadius: '14px',
                      padding: '18px',
                      marginBottom: '14px',
                      boxShadow: '0 14px 30px rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99,102,241,0.12)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '17px', color: '#333' }}>{leave.student?.name}</strong>
                          <div style={{ marginTop: '8px', fontSize: '14px', color: '#555' }}>
                            📝 {leave.reason}
                          </div>
                          <div style={{ marginTop: '6px', fontSize: '13px' }}>
                            <span style={{ background: '#ff9800', color: 'white', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                              📝 Test Assigned
                            </span>
                          </div>
                        </div>
                        <Link 
                          className="btn" 
                          to={`/admin/leaves/${leave._id}`} 
                          style={{ 
                            textDecoration: 'none',
                            background: 'white',
                            color: '#ff9800',
                            border: '2px solid #ff9800',
                            fontWeight: '600'
                          }}
                        >
                          👁️ View
                        </Link>
                      </div>
                    </div>
                  ))}
                  {assigned.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                      <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
                      <p>No leaves with tests assigned.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && !loading && (
              <div>
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#333' }}>
                  👨‍🎓 Registered Students ({students.length})
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: 'white', borderRadius: '10px 0 0 0' }}>Name</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: 'white' }}>Email</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: 'white' }}>Password</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: 'white' }}>Department</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: 'white' }}>Leave Bal.</th>
                        <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: 'white', borderRadius: '0 10px 0 0' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={student.id} style={{
                          background: idx % 2 === 0 ? '#f8f9fa' : 'white',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
                          e.currentTarget.style.transform = 'scale(1.01)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = idx % 2 === 0 ? '#f8f9fa' : 'white'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                        >
                          <td style={{ padding: '16px', fontWeight: '600', color: '#333' }}>{student.name}</td>
                          <td style={{ padding: '16px', color: '#333', fontSize: '14px' }}>
                            {student.email}
                          </td>
                          <td style={{ padding: '16px', color: '#333', fontSize: '14px' }}>
                            {student.password}
                          </td>
                          <td style={{ padding: '16px', color: '#6c757d' }}>{student.department || '—'}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontWeight: '700',
                              fontSize: '13px'
                            }}>
                              {student.leaveBalance}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '700',
                              background: student.isActive ? 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              color: student.isActive ? '#155724' : 'white',
                              border: student.isActive ? '2px solid #28a745' : '2px solid #dc3545'
                            }}>
                              {student.isActive ? '✓ Active' : '✗ Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {students.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6c757d' }}>
                      <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍🎓</div>
                      <p style={{ fontSize: '18px', fontWeight: '600' }}>No students registered yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admins Tab */}
            {activeTab === 'admins' && !loading && (
              <div>
                <h4 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#333' }}>
                  👤 Registered Admins ({admins.length})
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: 'white', borderRadius: '10px 0 0 0' }}>Name</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: 'white' }}>Email</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: 'white' }}>Password</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: 'white' }}>Department</th>
                        <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: 'white', borderRadius: '0 10px 0 0' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin, idx) => (
                        <tr key={admin.id} style={{
                          background: idx % 2 === 0 ? '#f8f9fa' : 'white',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                          e.currentTarget.style.transform = 'scale(1.01)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = idx % 2 === 0 ? '#f8f9fa' : 'white'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                        >
                          <td style={{ padding: '16px', fontWeight: '600', color: '#333' }}>{admin.name}</td>
                          <td style={{ padding: '16px', color: '#333', fontSize: '14px' }}>
                            {admin.email}
                          </td>
                          <td style={{ padding: '16px', color: '#333', fontSize: '14px' }}>
                            {admin.password}
                          </td>
                          <td style={{ padding: '16px', color: '#6c757d' }}>{admin.department || '—'}</td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '700',
                              background: admin.isActive ? 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              color: admin.isActive ? '#155724' : 'white',
                              border: admin.isActive ? '2px solid #28a745' : '2px solid #dc3545'
                            }}>
                              {admin.isActive ? '✓ Active' : '✗ Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {admins.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6c757d' }}>
                      <div style={{ fontSize: '64px', marginBottom: '20px' }}>👤</div>
                      <p style={{ fontSize: '18px', fontWeight: '600' }}>No admins registered yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
