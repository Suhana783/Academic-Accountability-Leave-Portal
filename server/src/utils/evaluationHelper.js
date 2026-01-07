/**
 * Evaluation Helper Utilities
 * Contains reusable functions for evaluating MCQ and coding questions
 */

/**
 * Evaluate a single MCQ answer
 * @param {Number} submittedAnswer - Answer selected by student (index)
 * @param {Number} correctAnswer - Correct answer index
 * @param {Number} marks - Marks for the question
 * @returns {Object} - Evaluation result
 */
export const evaluateMCQ = (submittedAnswer, correctAnswer, marks) => {
  const isCorrect = submittedAnswer === correctAnswer
  const marksAwarded = isCorrect ? marks : 0

  return {
    isCorrect,
    marksAwarded,
    correctAnswer
  }
}

/**
 * Evaluate all MCQ questions
 * @param {Array} mcqQuestions - Array of MCQ questions from test
 * @param {Array} submittedAnswers - Array of submitted MCQ answers
 * @returns {Object} - Contains evaluated answers and total score
 */
export const evaluateAllMCQs = (mcqQuestions, submittedAnswers) => {
  if (!mcqQuestions || mcqQuestions.length === 0) {
    return {
      evaluatedAnswers: [],
      totalScore: 0,
      totalQuestions: 0
    }
  }

  let totalScore = 0
  const evaluatedAnswers = []

  mcqQuestions.forEach((question, index) => {
    // Find the submitted answer for this question
    const submission = submittedAnswers?.find(
      (ans) => ans.questionIndex === index
    )

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
      // Question not attempted
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
    totalScore,
    totalQuestions: mcqQuestions.length
  }
}

/**
 * Compare two strings (trim and normalize)
 * @param {String} str1 - First string
 * @param {String} str2 - Second string
 * @returns {Boolean} - True if strings match
 */
export const compareOutputs = (str1, str2) => {
  if (!str1 || !str2) return false

  // Normalize: trim, remove extra spaces, handle line breaks
  const normalize = (str) =>
    str
      .toString()
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .toLowerCase()

  return normalize(str1) === normalize(str2)
}

/**
 * Evaluate a single coding question based on test cases
 * @param {Object} codingQuestion - The coding question object
 * @param {String} submittedCode - Code submitted by student
 * @param {String} submittedOutput - Output string provided by student
 * @returns {Object} - Evaluation result with test case results
 */
export const evaluateCodingQuestion = (
  codingQuestion,
  submittedCode,
  submittedOutput
) => {
  const testCaseResults = []
  let passedTestCases = 0

  // Since we're not executing code, we expect student to provide output
  // We'll compare their output with expected outputs for each test case

  if (!codingQuestion.testCases || codingQuestion.testCases.length === 0) {
    return {
      testCaseResults: [],
      passedTestCases: 0,
      totalTestCases: 0,
      marksAwarded: 0
    }
  }

  const totalTestCases = codingQuestion.testCases.length

  // Parse submitted output (expected format: outputs separated by newlines or delimiters)
  const submittedOutputs = submittedOutput
    ? submittedOutput.split('\n').map((line) => line.trim())
    : []

  codingQuestion.testCases.forEach((testCase, index) => {
    const studentOutput = submittedOutputs[index] || ''
    const passed = compareOutputs(studentOutput, testCase.expectedOutput)

    testCaseResults.push({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      submittedOutput: studentOutput,
      passed
    })

    if (passed) {
      passedTestCases++
    }
  })

  // Calculate marks based on test cases passed
  // Partial scoring: proportional to test cases passed
  const marksAwarded =
    (passedTestCases / totalTestCases) * codingQuestion.marks

  return {
    testCaseResults,
    passedTestCases,
    totalTestCases,
    marksAwarded: parseFloat(marksAwarded.toFixed(2))
  }
}

/**
 * Evaluate all coding questions
 * @param {Array} codingQuestions - Array of coding questions from test
 * @param {Array} submittedAnswers - Array of submitted coding answers
 * @returns {Object} - Contains evaluated answers and total score
 */
export const evaluateAllCodingQuestions = (
  codingQuestions,
  submittedAnswers
) => {
  if (!codingQuestions || codingQuestions.length === 0) {
    return {
      evaluatedAnswers: [],
      totalScore: 0,
      totalQuestions: 0
    }
  }

  let totalScore = 0
  const evaluatedAnswers = []

  codingQuestions.forEach((question, index) => {
    // Find the submitted answer for this question
    const submission = submittedAnswers?.find(
      (ans) => ans.questionIndex === index
    )

    if (submission) {
      const result = evaluateCodingQuestion(
        question,
        submission.submittedCode,
        submission.submittedOutput
      )

      evaluatedAnswers.push({
        questionIndex: index,
        submittedCode: submission.submittedCode,
        testCaseResults: result.testCaseResults,
        passedTestCases: result.passedTestCases,
        totalTestCases: result.totalTestCases,
        marksAwarded: result.marksAwarded
      })

      totalScore += result.marksAwarded
    } else {
      // Question not attempted
      evaluatedAnswers.push({
        questionIndex: index,
        submittedCode: '',
        testCaseResults: [],
        passedTestCases: 0,
        totalTestCases: question.testCases?.length || 0,
        marksAwarded: 0
      })
    }
  })

  return {
    evaluatedAnswers,
    totalScore: parseFloat(totalScore.toFixed(2)),
    totalQuestions: codingQuestions.length
  }
}

/**
 * Generate feedback based on performance
 * @param {Number} percentage - Score percentage
 * @param {Boolean} passed - Whether student passed
 * @returns {String} - Feedback message
 */
export const generateFeedback = (percentage, passed) => {
  if (percentage >= 90) {
    return 'Outstanding performance! Your leave request has been approved.'
  } else if (percentage >= 75) {
    return 'Excellent work! Your leave request has been approved.'
  } else if (percentage >= 60) {
    return 'Good effort. Your leave request has been approved.'
  } else if (percentage >= 50) {
    return 'Your performance was below the passing threshold. Please review the material and try again.'
  } else {
    return 'Your performance needs significant improvement. Please prepare better before resubmitting.'
  }
}
