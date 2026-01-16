import { useEffect, useState } from 'react'
import { getAllResults, getResultsByStudent } from '../services/testService'

const AdminResultsPage = () => {
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)

  const loadAll = async () => {
    try {
      setError('')
      setLoading(true)
      const data = await getAllResults()
      setResults(data)
      setStatistics(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleFilter = async (e) => {
    e.preventDefault()
    if (!filter) return loadAll()
    try {
      setLoading(true)
      const { results: filtered, statistics: stats } = await getResultsByStudent(filter)
      setResults(filtered)
      setStatistics(stats)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Test Results (Admin)</h2>
      <form className="form inline" onSubmit={handleFilter}>
        <input
          placeholder="Filter by studentId"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button className="btn" type="submit">Filter</button>
        <button className="btn ghost" type="button" onClick={loadAll}>Reset</button>
      </form>

      {statistics && (
        <div className="grid">
          <div className="tile">Tests: {statistics.totalTests}</div>
          <div className="tile">Passed: {statistics.passedTests}</div>
          <div className="tile">Failed: {statistics.failedTests}</div>
          <div className="tile">Avg %: {statistics.averagePercentage}</div>
        </div>
      )}

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="list">
        {results.map((r) => (
          <div key={r._id} className="list-item">
            <div>
              <strong>{r.student?.name}</strong> — {r.test?.title}
              <div className="muted">{r.percentage}% | {r.passed ? 'Passed' : 'Failed'}</div>
            </div>
            <div className="badge">{r.leave?.status}</div>
          </div>
        ))}
        {results.length === 0 && !loading && <p>No results found.</p>}
      </div>
    </div>
  )
}

export default AdminResultsPage
