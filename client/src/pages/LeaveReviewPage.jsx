import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLeave } from '../services/leaveService'
import { 
  createTest, 
  getTestByLeave, 
  generateAutomaticTest,
  getAvailableSubjects,
  getQuestionCount 
} from '../services/testService'

const defaultMcq = { question: '', options: '', correctAnswer: 0, marks: 1 }
const defaultCoding = { question: '', expectedOutput: '', marks: 1 }

const LeaveReviewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [leave, setLeave] = useState(null)
  const [existingTest, setExistingTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAutoGenerate, setShowAutoGenerate] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [questionCount, setQuestionCount] = useState(0)
  
  const [form, setForm] = useState({
    title: 'Assessment for Leave',
    description: 'Please complete this test to process your leave request.',
    passMarks: 0,
    duration: 3600 // Default 1 hour
  })
  
  const [autoForm, setAutoForm] = useState({
    subject: '',
    difficulty: 'Medium',
    numberOfQuestions: 5,
    totalMarks: 20,
    passingPercentage: 60,
    duration: 30 // minutes
  })
  
  const [mcqs, setMcqs] = useState([defaultMcq])
  const [codingQuestions, setCodingQuestions] = useState([defaultCoding])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaveData, test, subjects] = await Promise.all([
          getLeave(id),
          getTestByLeave(id).catch(() => null),
          getAvailableSubjects().catch(() => [])
        ])
        setLeave(leaveData)
        setExistingTest(test)
        setAvailableSubjects(subjects)
        if (subjects.length > 0) {
          setAutoForm(prev => ({ ...prev, subject: subjects[0] }))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Fetch question count when subject or difficulty changes
  useEffect(() => {
    const fetchCount = async () => {
      if (autoForm.subject && autoForm.difficulty) {
        try {
          const count = await getQuestionCount(autoForm.subject, autoForm.difficulty)
          setQuestionCount(count)
        } catch (err) {
          setQuestionCount(0)
        }
      }
    }
    fetchCount()
  }, [autoForm.subject, autoForm.difficulty])

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
        duration: Number(form.duration),
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

  const handleAutoGenerateTest = async (e) => {
    e.preventDefault()
    setError('')
    
    if (autoForm.numberOfQuestions > questionCount) {
      setError(`Only ${questionCount} questions available. Please reduce the number of questions or choose different criteria.`)
      return
    }
    
    try {
      const payload = {
        leaveId: id,
        subject: autoForm.subject,
        difficulty: autoForm.difficulty,
        numberOfQuestions: Number(autoForm.numberOfQuestions),
        totalMarks: Number(autoForm.totalMarks),
        passingPercentage: Number(autoForm.passingPercentage),
        duration: Number(autoForm.duration) * 60 // Convert minutes to seconds
      }

      await generateAutomaticTest(payload)
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
        <>
          {/* Toggle Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              className={!showAutoGenerate ? 'btn' : 'btn ghost'}
              type="button"
              onClick={() => setShowAutoGenerate(false)}
            >
              📝 Create Manually
            </button>
            <button 
              className={showAutoGenerate ? 'btn' : 'btn ghost'}
              type="button"
              onClick={() => setShowAutoGenerate(true)}
            >
              🤖 Generate Automatically
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          {showAutoGenerate ? (
            // AUTOMATIC TEST GENERATION FORM
            <form className="form" onSubmit={handleAutoGenerateTest}>
              <h3>🤖 Automatic Test Generation</h3>
              
              <label>Subject / Topic *</label>
              <input
                type="text"
                value={autoForm.subject}
                onChange={(e) => setAutoForm({ ...autoForm, subject: e.target.value })}
                placeholder="e.g., Data Structures, Java, DBMS, Web Development"
                required
              />
              {availableSubjects.length > 0 && (
                <p className="muted" style={{ marginTop: '-10px', fontSize: '12px' }}>
                  Available: {availableSubjects.join(', ')}
                </p>
              )}

              <label>Difficulty Level *</label>
              <select 
                value={autoForm.difficulty} 
                onChange={(e) => setAutoForm({ ...autoForm, difficulty: e.target.value })}
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {questionCount > 0 && (
                <p className="muted" style={{ marginTop: '-10px' }}>
                  ℹ️ {questionCount} questions available for this criteria
                </p>
              )}

              <label>Number of Questions *</label>
              <input
                type="number"
                value={autoForm.numberOfQuestions}
                onChange={(e) => setAutoForm({ ...autoForm, numberOfQuestions: Number(e.target.value) })}
                min="1"
                max={questionCount || 100}
                required
              />

              <label>Total Marks *</label>
              <input
                type="number"
                value={autoForm.totalMarks}
                onChange={(e) => setAutoForm({ ...autoForm, totalMarks: Number(e.target.value) })}
                min="1"
                required
              />

              <label>Passing Percentage *</label>
              <input
                type="number"
                value={autoForm.passingPercentage}
                onChange={(e) => setAutoForm({ ...autoForm, passingPercentage: Number(e.target.value) })}
                min="1"
                max="100"
                required
              />

              <label>Test Duration (minutes) *</label>
              <input
                type="number"
                value={autoForm.duration}
                onChange={(e) => setAutoForm({ ...autoForm, duration: Number(e.target.value) })}
                min="5"
                max="180"
                required
              />

              <button className="btn" type="submit">
                🚀 Generate Test Automatically
              </button>
            </form>
          ) : (
            // MANUAL TEST CREATION FORM
            <form className="form" onSubmit={handleCreateTest}>
              <h3>Create Test Manually</h3>
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

          <label>Test Duration (in minutes)</label>
          <input
            type="number"
            value={Math.floor(form.duration / 60)}
            onChange={(e) => setForm({ ...form, duration: Number(e.target.value) * 60 })}
            min="5"
            max="180"
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

          <button className="btn" type="submit">Create Test</button>
        </form>
          )}
        </>
      )}
    </div>
  )
}

export default LeaveReviewPage
