import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllResults, getResultsByStudent, deleteTestResult } from '../services/testService'

const AdminResultsPage = () => {
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)

  const loadAllResults = async () => {
    try {
      setError('')
      setLoading(true)
      setStatistics(null)
      const data = await getAllResults()
      setResults(data)
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllResults()
  }, [])

  const handleFilter = async (e) => {
    e.preventDefault()
    if (!filter.trim()) {
      return loadAllResults()
    }
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
      setStatistics(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (resultId) => {
    if (!confirm('Are you sure you want to delete this test result?')) {
      return
    }
    try {
      await deleteTestResult(resultId)
      // Remove the deleted result from the current list
      setResults(results.filter(r => r._id !== resultId))
      // Recalculate statistics if they exist
      if (statistics) {
        const updatedResults = results.filter(r => r._id !== resultId)
        const totalTests = updatedResults.length
        const passedTests = updatedResults.filter(r => r.passed).length
        const failedTests = totalTests - passedTests
        const averagePercentage = totalTests > 0
          ? Math.round(updatedResults.reduce((sum, r) => sum + r.percentage, 0) / totalTests)
          : 0
        setStatistics({
          totalTests,
          passedTests,
          failedTests,
          averagePercentage
        })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h2>Test Results (Admin)</h2>
      <form className="form" onSubmit={handleFilter}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label>Filter by Student ID</label>
            <input
              placeholder="Enter student ID to filter (leave empty to see all)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              type="text"
            />
          </div>
          <button className="btn" type="submit">Filter</button>
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
              <div className="muted">
                {r.percentage}% | {r.passed ? 'Passed' : 'Failed'} | 
                Time: {Math.floor((r.timeTaken || 0) / 60)}m
                {r.tabSwitchCount > 0 && ` | ⚠️ Switches: ${r.tabSwitchCount}`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link 
                to={`/test/${r.test?._id}/result`} 
                className="btn" 
                style={{ padding: '6px 14px', fontSize: '14px' }}
              >
                View
              </Link>
              <div className="badge">{r.leave?.status}</div>
              <button 
                className="btn ghost" 
                style={{ padding: '4px 12px', fontSize: '14px' }}
                onClick={() => handleDelete(r._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {results.length === 0 && !loading && <p>No results found.</p>}
      </div>
    </div>
  )
}

export default AdminResultsPage
