/**
 * Simple evaluation helpers for MCQ and coding questions
 * No complex validations - just basic comparison logic
 */

/**
 * Evaluate a single MCQ answer
 */
export const evaluateMCQ = (submittedAnswer, correctAnswer, marks) => {
  // Convert both to numbers for comparison to handle any string/number mismatches
  const submitted = Number(submittedAnswer)
  const correct = Number(correctAnswer)
  const isCorrect = submitted === correct
  const marksAwarded = isCorrect ? marks : 0

  return {
    isCorrect,
    marksAwarded,
    correctAnswer
  }
}

/**
 * Evaluate all MCQ questions
 */
export const evaluateAllMCQs = (mcqQuestions, submittedAnswers) => {
  if (!mcqQuestions || mcqQuestions.length === 0) {
    return {
      evaluatedAnswers: [],
      totalScore: 0
    }
  }

  let totalScore = 0
  const evaluatedAnswers = []

  mcqQuestions.forEach((question, index) => {
    const submission = submittedAnswers?.find(ans => ans.questionIndex === index)

    if (submission) {
      const result = evaluateMCQ(
        submission.selectedAnswer,
        question.correctAnswer,
        question.marks
      )

      evaluatedAnswers.push({
        questionIndex: index,
        selectedAnswer: submission.selectedAnswer,
        correctAnswer: result.correctAnswer,
        isCorrect: result.isCorrect,
        marksAwarded: result.marksAwarded
      })

      totalScore += result.marksAwarded
    } else {
      evaluatedAnswers.push({
        questionIndex: index,
        selectedAnswer: null,
        correctAnswer: question.correctAnswer,
        isCorrect: false,
        marksAwarded: 0
      })
    }
  })

  return {
    evaluatedAnswers,
    totalScore
  }
}

/**
 * Evaluate a single coding question
 * Simple string comparison - exact match after trim
 */
export const evaluateCoding = (submittedOutput, expectedOutput, marks) => {
  const submitted = (submittedOutput || '').trim()
  const expected = (expectedOutput || '').trim()
  
  const isCorrect = submitted === expected
  const marksAwarded = isCorrect ? marks : 0
  
  return {
    isCorrect,
    marksAwarded,
    expectedOutput: expected
  }
}

/**
 * Evaluate all coding questions
 */
export const evaluateAllCodingQuestions = (codingQuestions, submittedAnswers) => {
  if (!codingQuestions || codingQuestions.length === 0) {
    return {
      evaluatedAnswers: [],
      totalScore: 0
    }
  }

  let totalScore = 0
  const evaluatedAnswers = []

  codingQuestions.forEach((question, index) => {
    const submission = submittedAnswers?.find(ans => ans.questionIndex === index)
    const submittedOutput = submission ? submission.submittedOutput : ''

    const result = evaluateCoding(
      submittedOutput,
      question.expectedOutput,
      question.marks
    )
    
    evaluatedAnswers.push({
      questionIndex: index,
      submittedOutput,
      expectedOutput: result.expectedOutput,
      isCorrect: result.isCorrect,
      marksAwarded: result.marksAwarded
    })
    
    totalScore += result.marksAwarded
  })

  return {
    evaluatedAnswers,
    totalScore
  }
}

/**
 * Generate simple feedback
 */
export const generateFeedback = (score, maxScore, passed) => {
  if (passed) {
    return `Congratulations! You scored ${score}/${maxScore}. Your leave has been approved.`
  } else {
    return `You scored ${score}/${maxScore}. Unfortunately, you did not pass the test. Your leave status is currently rejected, but the admin can review and override this decision.`
  }
}
