import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLeave } from '../services/leaveService'
import { createTest, getTestByLeave } from '../services/testService'

const defaultMcq = { question: '', options: '', correctAnswer: 0, marks: 1 }
const defaultCoding = { question: '', expectedOutput: '', marks: 1 }

const LeaveReviewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [leave, setLeave] = useState(null)
  const [existingTest, setExistingTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: 'Assessment for Leave',
    description: 'Please complete this test to process your leave request.',
    passMarks: 0
  })
  const [mcqs, setMcqs] = useState([defaultMcq])
  const [codingQuestions, setCodingQuestions] = useState([defaultCoding])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaveData, test] = await Promise.all([
          getLeave(id),
          getTestByLeave(id).catch(() => null)
        ])
        setLeave(leaveData)
        setExistingTest(test)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const updateMcq = (index, field, value) => {
    setMcqs((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const updateCoding = (index, field, value) => {
    setCodingQuestions((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const addMcq = () => setMcqs((prev) => [...prev, { ...defaultMcq }])
  const addCoding = () => setCodingQuestions((prev) => [...prev, { ...defaultCoding }])

  const handleCreateTest = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        leaveId: id,
        title: form.title,
        description: form.description,
        passMarks: Number(form.passMarks),
        mcqQuestions: mcqs
          .filter(q => q.question.trim())
          .map((q) => ({
            question: q.question,
            options: q.options.split(',').map((o) => o.trim()).filter(Boolean),
            correctAnswer: Number(q.correctAnswer),
            marks: Number(q.marks)
          })),
        codingQuestions: codingQuestions
          .filter(q => q.question.trim())
          .map((q) => ({
            question: q.question,
            expectedOutput: q.expectedOutput,
            marks: Number(q.marks)
          }))
      }

      await createTest(payload)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="muted">Loading...</p>
  if (error && !existingTest) return <p className="error">{error}</p>
  if (!leave) return <p className="muted">Leave not found.</p>

  return (
    <div className="card">
      <h2>Review Leave</h2>
      <p><strong>Student:</strong> {leave.student?.name} ({leave.student?.email})</p>
      <p><strong>Dates:</strong> {leave.startDate?.slice(0,10)} → {leave.endDate?.slice(0,10)}</p>
      <p><strong>Reason:</strong> {leave.reason}</p>
      <p><strong>Status:</strong> {leave.status}</p>

      {existingTest ? (
        <div className="info-box">
          <p>A test already exists for this leave.</p>
          <button className="btn" onClick={() => navigate(`/test/${existingTest._id}`)}>
            View Test
          </button>
        </div>
      ) : (
        <form className="form" onSubmit={handleCreateTest}>
          <h3>Create Test</h3>
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

          <label>Description</label>
          <textarea
            rows="2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label>Pass Marks (minimum score to pass)</label>
          <input
            type="number"
            value={form.passMarks}
            onChange={(e) => setForm({ ...form, passMarks: e.target.value })}
          />

          <h4>MCQ Questions</h4>
          {mcqs.map((q, idx) => (
            <div key={idx} className="question-block">
              <label>Question {idx + 1}</label>
              <input
                value={q.question}
                onChange={(e) => updateMcq(idx, 'question', e.target.value)}
                placeholder="Enter your question"
              />
              <label>Options (comma separated)</label>
              <input
                value={q.options}
                onChange={(e) => updateMcq(idx, 'options', e.target.value)}
                placeholder="Option A, Option B, Option C, Option D"
              />
              <label>Correct Answer Index (0-based)</label>
              <input
                type="number"
                value={q.correctAnswer}
                onChange={(e) => updateMcq(idx, 'correctAnswer', e.target.value)}
              />
              <label>Marks</label>
              <input
                type="number"
                value={q.marks}
                onChange={(e) => updateMcq(idx, 'marks', e.target.value)}
              />
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={addMcq}>
            Add MCQ Question
          </button>

          <h4>Coding Questions</h4>
          {codingQuestions.map((q, idx) => (
            <div key={idx} className="question-block">
              <label>Coding Question {idx + 1}</label>
              <textarea
                rows="3"
                value={q.question}
                onChange={(e) => updateCoding(idx, 'question', e.target.value)}
                placeholder="Enter your coding question"
              />
              <label>Expected Output (exact match required)</label>
              <textarea
                rows="2"
                value={q.expectedOutput}
                onChange={(e) => updateCoding(idx, 'expectedOutput', e.target.value)}
                placeholder="Enter the expected output"
              />
              <label>Marks</label>
              <input
                type="number"
                value={q.marks}
                onChange={(e) => updateCoding(idx, 'marks', e.target.value)}
              />
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={addCoding}>
            Add Coding Question
          </button>

          {error && <div className="error">{error}</div>}
          <button className="btn" type="submit">Create Test</button>
        </form>
      )}
    </div>
  )
}

export default LeaveReviewPage
