import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTestById, submitTest } from '../services/testService'

const TakeTestPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mcqAnswers, setMcqAnswers] = useState([])
  const [codingAnswers, setCodingAnswers] = useState([])

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await getTestById(id)
        setTest(data)
        // Initialize answers arrays
        setMcqAnswers(
          (data?.mcqQuestions || []).map((_, idx) => ({
            questionIndex: idx,
            selectedAnswer: null
          }))
        )
        setCodingAnswers(
          (data?.codingQuestions || []).map((_, idx) => ({
            questionIndex: idx,
            submittedOutput: ''
          }))
        )
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTest()
  }, [id])

  const handleMcqChange = (qIndex, value) => {
    setMcqAnswers((prev) =>
      prev.map((item) =>
        item.questionIndex === qIndex ? { ...item, selectedAnswer: Number(value) } : item
      )
    )
  }

  const handleCodingChange = (qIndex, value) => {
    setCodingAnswers((prev) =>
      prev.map((item) =>
        item.questionIndex === qIndex ? { ...item, submittedOutput: value } : item
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        mcqAnswers: mcqAnswers,
        codingAnswers: codingAnswers,
        timeTaken: 0
      }
      await submitTest(id, payload)
      navigate(`/test/${id}/result`)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="muted">Loading test...</p>
  if (error) return <p className="error">{error}</p>
  if (!test) return <p className="muted">Test not found.</p>

  return (
    <div className="card">
      <h2>{test.title}</h2>
      <p className="muted">{test.description}</p>
      <p className="muted"><strong>Total Marks:</strong> {test.totalMarks} | <strong>Pass Marks:</strong> {test.passMarks}</p>
      
      <form className="form" onSubmit={handleSubmit}>
        {test.mcqQuestions && test.mcqQuestions.length > 0 && (
          <>
            <h3>MCQ Questions</h3>
            {test.mcqQuestions.map((q, idx) => (
              <div key={idx} className="question-block">
                <div className="question-title">{idx + 1}. {q.question}</div>
                <div className="muted">Marks: {q.marks}</div>
                <div className="options">
                  {q.options.map((opt, optIndex) => (
                    <label key={optIndex} className="option">
                      <input
                        type="radio"
                        name={`mcq-${idx}`}
                        value={optIndex}
                        checked={mcqAnswers[idx]?.selectedAnswer === optIndex}
                        onChange={(e) => handleMcqChange(idx, e.target.value)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {test.codingQuestions && test.codingQuestions.length > 0 && (
          <>
            <h3>Coding Questions</h3>
            {test.codingQuestions.map((q, idx) => (
              <div key={idx} className="question-block">
                <div className="question-title">{idx + 1}. {q.question}</div>
                <div className="muted">Marks: {q.marks}</div>
                <label>Your Output (provide exact output)</label>
                <textarea
                  rows="4"
                  value={codingAnswers[idx]?.submittedOutput || ''}
                  onChange={(e) => handleCodingChange(idx, e.target.value)}
                  placeholder="Enter the output of your code here..."
                />
              </div>
            ))}
          </>
        )}

        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit">Submit Test</button>
      </form>
    </div>
  )
}

export default TakeTestPage
