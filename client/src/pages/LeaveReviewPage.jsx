import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLeave } from '../services/leaveService'
import { createTest, getTestByLeave } from '../services/testService'

const defaultQuestion = { question: '', options: '', correctAnswer: 0, marks: 1 }

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
    passPercentage: 60,
    timeLimit: 60
  })
  const [mcqs, setMcqs] = useState([defaultQuestion])

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

  const addMcq = () => setMcqs((prev) => [...prev, { ...defaultQuestion }])

  const handleCreateTest = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        leaveId: id,
        title: form.title,
        description: form.description,
        passPercentage: Number(form.passPercentage),
        timeLimit: Number(form.timeLimit),
        mcqQuestions: mcqs.map((q) => ({
          question: q.question,
          options: q.options.split(',').map((o) => o.trim()).filter(Boolean),
          correctAnswer: Number(q.correctAnswer),
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

          <label>Pass Percentage</label>
          <input
            type="number"
            value={form.passPercentage}
            onChange={(e) => setForm({ ...form, passPercentage: e.target.value })}
          />

          <label>Time Limit (minutes)</label>
          <input
            type="number"
            value={form.timeLimit}
            onChange={(e) => setForm({ ...form, timeLimit: e.target.value })}
          />

          <h4>MCQ Questions (Any type of question with multiple choice options)</h4>
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

          {error && <div className="error">{error}</div>}
          <button className="btn" type="submit">Create Test</button>
        </form>
      )}
    </div>
  )
}

export default LeaveReviewPage
