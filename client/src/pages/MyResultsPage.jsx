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
        <div className="grid">
          <div className="tile">Total Tests: {stats.totalTests}</div>
          <div className="tile">Passed: {stats.passedTests}</div>
          <div className="tile">Failed: {stats.failedTests}</div>
          <div className="tile">Avg %: {stats.averagePercentage}</div>
        </div>
      )}
      <div className="list">
        {results.map((r) => (
          <div key={r._id} className="list-item">
            <div>
              <strong>{r.test?.title}</strong>
              <div className="muted">{r.percentage}% - {r.passed ? 'Passed' : 'Failed'}</div>
            </div>
            <Link className="btn ghost" to={`/test/${r.test?._id}/result`}>View</Link>
          </div>
        ))}
        {results.length === 0 && !loading && <p>No results yet.</p>}
      </div>
    </div>
  )
}

export default MyResultsPage
