import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTestById, submitTest } from '../services/testService'
import { useAuth } from '../context/AuthContext'

const TakeTestPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mcqAnswers, setMcqAnswers] = useState([])
  const [codingAnswers, setCodingAnswers] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef(null)
  const lastSwitchAtRef = useRef(0)
  const isSubmittingRef = useRef(false)
  const isAdmin = user?.role === 'admin'

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await getTestById(id)
        
        // Add original index to each question before shuffling
        if (data.mcqQuestions && data.mcqQuestions.length > 0) {
          data.mcqQuestions = data.mcqQuestions.map((q, idx) => ({
            ...q,
            originalIndex: idx
          }))
          data.mcqQuestions = shuffleArray(data.mcqQuestions)
        }
        
        setTest(data)
        setTimeRemaining(data.duration || 3600) // Default 1 hour
        
        // Initialize answers arrays with original question index
        setMcqAnswers(
          (data?.mcqQuestions || []).map((q) => ({
            questionIndex: q.originalIndex,
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

  // Timer countdown
  useEffect(() => {
    if (!test || timeRemaining <= 0) return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          if (!isAdmin) {
            handleAutoSubmit()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [test, isAdmin])

  // Tab switch detection (anti-cheating) with debounce and submission guard
  useEffect(() => {
    const incrementSwitchIfNeeded = () => {
      if (isSubmittingRef.current) return
      const now = Date.now()
      if (now - lastSwitchAtRef.current < 1200) return
      lastSwitchAtRef.current = now
      setTabSwitchCount((prev) => prev + 1)
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementSwitchIfNeeded()
      }
    }

    const handleBlur = () => {
      if (!document.hidden) {
        incrementSwitchIfNeeded()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAutoSubmit = async () => {
    if (isSubmitting || isAdmin) return
    setIsSubmitting(true)
    isSubmittingRef.current = true
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    
    try {
      const payload = {
        mcqAnswers: mcqAnswers,
        codingAnswers: codingAnswers,
        timeTaken,
        tabSwitchCount
      }
      await submitTest(id, payload)
      navigate(`/test/${id}/result`)
    } catch (err) {
      setError(err.message)
      setIsSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  const handleMcqChange = (originalIndex, value) => {
    setMcqAnswers((prev) =>
      prev.map((item) =>
        item.questionIndex === originalIndex ? { ...item, selectedAnswer: Number(value) } : item
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
    if (isSubmitting || isAdmin) return
    setIsSubmitting(true)
    isSubmittingRef.current = true
    setError('')
    
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    
    try {
      const payload = {
        mcqAnswers: mcqAnswers,
        codingAnswers: codingAnswers,
        timeTaken,
        tabSwitchCount
      }
      await submitTest(id, payload)
      navigate(`/test/${id}/result`)
    } catch (err) {
      setError(err.message)
      setIsSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  if (loading) return <p className="muted">Loading test...</p>
  if (error && !test) return <p className="error">{error}</p>
  if (!test) return <p className="muted">Test not found.</p>

  const timeIsLow = timeRemaining <= 300 // Less than 5 minutes

  return (
    <div className="card">
      {isAdmin && (
        <div style={{
          background: '#e0f2fe',
          border: '1px solid #60a5fa',
          color: '#1d4ed8',
          padding: '12px 14px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontWeight: 600
        }}>
          Admin view: test is read-only. Submission and timer auto-submit are disabled.
        </div>
      )}

      {/* Timer Display (hidden for admin) */}
      {!isAdmin && (
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          background: timeIsLow ? '#fee' : '#e8f4ff', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '20px',
          border: timeIsLow ? '2px solid #f44' : '2px solid #4a90e2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div>
            <strong style={{ color: timeIsLow ? '#d00' : '#333' }}>
              Time Remaining: {formatTime(timeRemaining)}
            </strong>
            {timeIsLow && <span style={{ marginLeft: '10px', color: '#d00' }}>⚠️ Hurry Up!</span>}
          </div>
          {tabSwitchCount > 0 && (
            <div style={{ color: '#e67700' }}>
              ⚠️ Tab Switches: {tabSwitchCount}
            </div>
          )}
        </div>
      )}

      {/* Warning for tab switch */}
      {!isAdmin && showWarning && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ff4444',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          ⚠️ Warning: Tab switch detected!
        </div>
      )}
      
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
                        checked={mcqAnswers.find(a => a.questionIndex === q.originalIndex)?.selectedAnswer === optIndex}
                        onChange={(e) => handleMcqChange(q.originalIndex, e.target.value)}
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
        {!isAdmin && (
          <button 
            className="btn" 
            type="submit" 
            disabled={isSubmitting || timeRemaining === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        )}
        {isAdmin && (
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate(-1)}
            style={{ marginTop: '8px' }}
          >
            ← Back
          </button>
        )}
      </form>
    </div>
  )
}

export default TakeTestPage
