import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTestResult } from '../services/testService'

const TestResultPage = () => {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getTestResult(id)
        setResult(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  if (loading) return <p className="muted">Loading result...</p>
  if (error) return <p className="error">{error}</p>
  if (!result) return <p className="muted">No result found.</p>

  return (
    <div className="card">
      <h2>Test Result</h2>
      <p className="muted">{result.test?.title}</p>
      <div className="grid">
        <div className="tile">MCQ Score: {result.mcqScore}</div>
        <div className="tile">Coding Score: {result.codingScore}</div>
        <div className="tile">Total: {result.totalScore} / {result.maxScore}</div>
        <div className="tile">Percentage: {result.percentage}%</div>
        <div className="tile">Status: {result.passed ? 'Passed' : 'Failed'}</div>
        <div className="tile">Leave Status: {result.leave?.status}</div>
      </div>
      <div className="section">
        <h3>MCQ Details</h3>
        {result.mcqAnswers?.map((ans, idx) => (
          <div key={idx} className="list-item">
            <div>Q{ans.questionIndex + 1}</div>
            <div className="muted">Selected: {ans.selectedAnswer}, Correct: {ans.correctAnswer}</div>
            <div className={ans.isCorrect ? 'badge success' : 'badge danger'}>
              {ans.isCorrect ? 'Correct' : 'Wrong'} ({ans.marksAwarded} marks)
            </div>
          </div>
        ))}
      </div>
      <div className="section">
        <h3>Coding Details</h3>
        {result.codingAnswers?.map((ans, idx) => (
          <div key={idx} className="list-item">
            <div>Q{ans.questionIndex + 1}</div>
            <div className="muted">Passed {ans.passedTestCases}/{ans.totalTestCases} cases</div>
            <div>Marks: {ans.marksAwarded}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestResultPage
