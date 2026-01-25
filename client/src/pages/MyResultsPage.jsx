import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyResults, getMyStatistics } from '../services/testService'

const MyResultsPage = () => {
  const [results, setResults] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, statistics] = await Promise.all([
          getMyResults(),
          getMyStatistics()
        ])
        setResults(res)
        setStats(statistics)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="card">
      <h2>My Results</h2>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {stats && (
        (() => {
          const assignedTests = stats.assignedTests ?? stats.totalTests ?? 0
          const submittedTests = stats.submittedTests ?? stats.totalTests ?? 0
          const passedTests = stats.passedTests ?? 0
          const failedTests = stats.failedTests ?? Math.max(submittedTests - passedTests, 0)
          const pendingTests = stats.pendingTests ?? Math.max(assignedTests - submittedTests, 0)
          const passRate = stats.passRate ?? (submittedTests > 0 ? Math.round((passedTests / submittedTests) * 100) : 0)

          return (
        <div className="grid">
          <div className="tile">
            <strong>Total Tests</strong>
            <div>{assignedTests}</div>
          </div>
          <div className="tile">
            <strong>Completed</strong>
            <div>{submittedTests}</div>
          </div>
          <div className="tile">
            <strong>Pending</strong>
            <div>{pendingTests}</div>
          </div>
          <div className="tile">
            <strong>Passed</strong>
            <div style={{ color: '#4caf50' }}>{passedTests}</div>
          </div>
          <div className="tile">
            <strong>Failed</strong>
            <div style={{ color: '#f44336' }}>{failedTests}</div>
          </div>
          <div className="tile">
            <strong>Pass Rate</strong>
            <div>{passRate}%</div>
          </div>
          <div className="tile">
            <strong>Average Score</strong>
            <div>{stats.averageScore}%</div>
          </div>
        </div>
          )
        })()
      )}
      <div className="list">
        {results.map((r) => (
          <div key={r._id} className="list-item">
            <div>
              <strong>{r.test?.title}</strong>
              <div className="muted">
                Score: {r.totalScore}/{r.maxScore} ({r.percentage}%) | 
                {r.passed ? ' ✓ Passed' : ' ✗ Failed'} | 
                Time: {Math.floor((r.timeTaken || 0) / 60)}m
              </div>
            </div>
            <Link className="btn ghost" to={`/test/${r.test?._id}/result`}>View Details</Link>
          </div>
        ))}
        {results.length === 0 && !loading && <p>No results yet.</p>}
      </div>
    </div>
  )
}

export default MyResultsPage
