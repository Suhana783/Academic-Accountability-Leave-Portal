import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTestById, getTestResult, submitTest } from '../services/testService'
import { useAuth } from '../context/AuthContext'
import { colors, spacing, borderRadius, typography, transitions } from '../utils/designSystem'

const TakeTestDetailPage = () => {
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
  const isSubmittingRef = useRef(false)
  const isAdmin = user?.role === 'admin'

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  useEffect(() => {
    const fetchTest = async () => {
      try {
        if (!isAdmin) {
          try {
            const existingResult = await getTestResult(id)
            if (existingResult) {
              navigate(`/test/${id}/result`)
              return
            }
          } catch (resultError) {
            if (resultError?.message !== 'Test result not found') {
              setError(resultError.message)
              setLoading(false)
              return
            }
          }
        }

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
  }, [id, isAdmin, navigate])

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

  // Tab switch detection (anti-cheating) - accurate detection
  useEffect(() => {
    if (isAdmin) return // Don't track for admin

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingRef.current) {
        setTabSwitchCount((prev) => prev + 1)
        setShowWarning(true)
        setTimeout(() => setShowWarning(false), 2500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAdmin])

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing.xxxl }}>
        <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>⏳</div>
        <p style={{ ...typography.body_lg, color: colors.gray_600 }}>Loading test...</p>
      </div>
    )
  }

  if (error && !test) {
    return (
      <div style={{ padding: spacing.xl, background: colors.danger_light, borderRadius: borderRadius.lg, color: colors.danger_dark }}>
        {error}
      </div>
    )
  }

  if (!test) {
    return (
      <div style={{ padding: spacing.xl, background: colors.gray_100, borderRadius: borderRadius.lg, color: colors.gray_600 }}>
        Test not found.
      </div>
    )
  }

  const timeIsLow = timeRemaining <= 300 // Less than 5 minutes

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: `0 ${spacing.lg}` }}>
      {/* Warning for tab switch */}
      {!isAdmin && showWarning && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: colors.danger,
          color: colors.white,
          padding: `${spacing.md} ${spacing.lg}`,
          borderRadius: borderRadius.lg,
          fontSize: '16px',
          fontWeight: '600',
          zIndex: 1001,
          boxShadow: colors.shadow_lg,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm
        }}>
          ⚠️ Tab switch detected!
        </div>
      )}

      {/* Admin Notice */}
      {isAdmin && (
        <div style={{
          background: colors.primary_light,
          border: `1px solid ${colors.primary}`,
          color: colors.primary,
          padding: spacing.md,
          borderRadius: borderRadius.md,
          marginBottom: spacing.lg,
          fontWeight: '600',
          textAlign: 'center'
        }}>
          📋 Admin Preview Mode - Test is read-only
        </div>
      )}

      {/* Sticky Top Bar */}
      {!isAdmin && (
        <div style={{
          position: 'sticky',
          top: 0,
          background: colors.white,
          padding: spacing.md,
          borderRadius: borderRadius.md,
          marginBottom: spacing.lg,
          border: `2px solid ${timeIsLow ? colors.danger : colors.primary}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          boxShadow: colors.shadow_md,
          flexWrap: 'wrap',
          gap: spacing.md
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <span style={{ fontSize: '20px' }}>⏱️</span>
              <strong style={{ color: timeIsLow ? colors.danger : colors.gray_900, fontSize: '18px' }}>
                {formatTime(timeRemaining)}
              </strong>
              {timeIsLow && <span style={{ color: colors.danger, fontSize: '14px', marginLeft: spacing.xs }}>⚠️ Hurry!</span>}
            </div>
            {tabSwitchCount > 0 && (
              <div style={{
                padding: `${spacing.xs} ${spacing.md}`,
                background: colors.warning_light,
                color: colors.warning_dark,
                borderRadius: borderRadius.full,
                fontSize: '13px',
                fontWeight: '600',
                border: `1px solid ${colors.warning}`
              }}>
                ⚠️ Tab Switches: {tabSwitchCount}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || timeRemaining === 0}
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              background: isSubmitting || timeRemaining === 0 ? colors.gray_400 : colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: isSubmitting || timeRemaining === 0 ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: `all ${transitions.base}`
            }}
          >
            {isSubmitting ? '⏳ Submitting...' : '✓ Submit Test'}
          </button>
        </div>
      )}

      {/* Test Header */}
      <div style={{
        background: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        border: `1px solid ${colors.gray_200}`,
        boxShadow: colors.shadow_sm
      }}>
        <h2 style={{ ...typography.h2, margin: 0, marginBottom: spacing.sm, color: colors.gray_900 }}>
          {test.title}
        </h2>
        <p style={{ ...typography.body, color: colors.gray_600, marginBottom: spacing.md }}>
          {test.description}
        </p>
        <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', fontSize: '14px', color: colors.gray_700 }}>
          <div><strong>Total Marks:</strong> {test.totalMarks}</div>
          <div><strong>Pass Marks:</strong> {test.passMarks}</div>
          <div><strong>Questions:</strong> {test.mcqQuestions?.length || 0}</div>
        </div>
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit}>
        {test.mcqQuestions && test.mcqQuestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {test.mcqQuestions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  background: colors.white,
                  padding: spacing.lg,
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.gray_200}`,
                  boxShadow: colors.shadow_sm
                }}
              >
                <div style={{ marginBottom: spacing.md }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: spacing.sm
                  }}>
                    <span style={{
                      padding: `${spacing.xs} ${spacing.md}`,
                      background: colors.primary_light,
                      color: colors.primary,
                      borderRadius: borderRadius.full,
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Question {idx + 1}
                    </span>
                    <span style={{ fontSize: '12px', color: colors.gray_600, fontWeight: '600' }}>
                      {q.marks} marks
                    </span>
                  </div>
                  <p style={{
                    ...typography.body,
                    color: colors.gray_900,
                    fontWeight: '500',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    margin: `${spacing.md} 0 0 0`
                  }}>
                    {q.question}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                  {q.options.map((opt, optIndex) => {
                    const isSelected = mcqAnswers.find(a => a.questionIndex === q.originalIndex)?.selectedAnswer === optIndex
                    return (
                      <label
                        key={optIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing.md,
                          padding: spacing.md,
                          background: isSelected ? colors.primary_light : colors.gray_50,
                          border: `2px solid ${isSelected ? colors.primary : colors.gray_200}`,
                          borderRadius: borderRadius.md,
                          cursor: 'pointer',
                          transition: `all ${transitions.base}`,
                          fontSize: '15px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = colors.gray_100
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = colors.gray_50
                        }}
                      >
                        <input
                          type="radio"
                          name={`mcq-${idx}`}
                          value={optIndex}
                          checked={isSelected}
                          onChange={(e) => handleMcqChange(q.originalIndex, e.target.value)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: colors.primary
                          }}
                        />
                        <span style={{
                          fontWeight: '600',
                          minWidth: '24px',
                          color: isSelected ? colors.primary : colors.gray_700
                        }}>
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <span style={{ color: isSelected ? colors.primary : colors.gray_800 }}>
                          {opt}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {test.codingQuestions && test.codingQuestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, marginTop: spacing.lg }}>
            <h3 style={{ ...typography.h3, color: colors.gray_900 }}>Coding Questions</h3>
            {test.codingQuestions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  background: colors.white,
                  padding: spacing.lg,
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.gray_200}`,
                  boxShadow: colors.shadow_sm
                }}
              >
                <div style={{ marginBottom: spacing.md }}>
                  <span style={{
                    padding: `${spacing.xs} ${spacing.md}`,
                    background: colors.secondary_light,
                    color: colors.secondary,
                    borderRadius: borderRadius.full,
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: spacing.sm,
                    display: 'inline-block'
                  }}>
                    Coding Question {idx + 1} ({q.marks} marks)
                  </span>
                  <p style={{ ...typography.body, color: colors.gray_900, fontWeight: '500', marginTop: spacing.sm }}>
                    {q.question}
                  </p>
                </div>
                <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: '600', color: colors.gray_700, fontSize: '14px' }}>
                  Your Output (provide exact output)
                </label>
                <textarea
                  rows="5"
                  value={codingAnswers[idx]?.submittedOutput || ''}
                  onChange={(e) => handleCodingChange(idx, e.target.value)}
                  placeholder="Enter the output of your code here..."
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray_300}`,
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            marginTop: spacing.lg,
            padding: spacing.md,
            background: colors.danger_light,
            color: colors.danger_dark,
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.danger}`
          }}>
            {error}
          </div>
        )}

        {!isAdmin && (
          <div style={{ marginTop: spacing.xl, textAlign: 'center' }}>
            <button
              type="submit"
              disabled={isSubmitting || timeRemaining === 0}
              style={{
                padding: `${spacing.md} ${spacing.xxl}`,
                background: isSubmitting || timeRemaining === 0 ? colors.gray_400 : colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: isSubmitting || timeRemaining === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: `all ${transitions.base}`,
                boxShadow: colors.shadow_md
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && timeRemaining > 0) {
                  e.currentTarget.style.background = colors.primary_dark
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && timeRemaining > 0) {
                  e.currentTarget.style.background = colors.primary
                }
              }}
            >
              {isSubmitting ? '⏳ Submitting Test...' : '✓ Submit Test'}
            </button>
          </div>
        )}

        {isAdmin && (
          <div style={{ marginTop: spacing.xl, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: `${spacing.md} ${spacing.xl}`,
                background: colors.gray_200,
                color: colors.gray_700,
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              ← Back to Leave Requests
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default TakeTestDetailPage
