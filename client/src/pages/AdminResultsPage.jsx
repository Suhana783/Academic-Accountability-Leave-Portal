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
      setFilter('')
      setStatistics(null)
      const data = await getAllResults()
      setResults(data)
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
    if (!filter.trim()) return loadAll()
    try {
      setLoading(true)
      setError('')
      setStatistics(null)
      const { results: filtered, statistics: stats } = await getResultsByStudent(filter)
      setResults(filtered)
      setStatistics(stats)
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    await loadAll()
  }

  return (
    <div className="card">
      <h2>Test Results (Admin)</h2>
      <form className="form" onSubmit={handleFilter}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label>Filter by Student ID</label>
            <input
              placeholder="Enter student ID to filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              type="text"
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" type="submit">Filter</button>
            <button className="btn ghost" type="button" onClick={handleReset}>Reset</button>
          </div>
        </div>
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
