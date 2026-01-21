import OpenAI from 'openai'
import Test from '../models/Test.js'
import Leave from '../models/Leave.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

class AutomaticTestService {
  /**
   * Generate questions using OpenAI based on subject and difficulty
   */
  async generateQuestionsWithAI(subject, difficulty, numberOfQuestions) {
    try {
      const prompt = `Generate exactly ${numberOfQuestions} multiple choice questions (MCQs) about ${subject} with ${difficulty} difficulty level.

For each question, provide:
1. Question text
2. Exactly 4 options (A, B, C, D)
3. The correct answer index (0 for A, 1 for B, 2 for C, 3 for D)

Format your response as a JSON array of objects with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Make sure questions are clear, educational, and appropriate for ${difficulty} difficulty level.
Return ONLY the JSON array, no other text.`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert teacher creating educational assessment questions. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const content = response.choices[0].message.content.trim()
      
      // Parse the JSON response
      let questions
      try {
        // Try to extract JSON if wrapped in markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[1])
        } else {
          questions = JSON.parse(content)
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', content)
        throw new Error('Failed to generate valid questions. Please try again.')
      }

      // Validate the response
      if (!Array.isArray(questions) || questions.length !== numberOfQuestions) {
        throw new Error(`Expected ${numberOfQuestions} questions but got ${questions?.length || 0}`)
      }

      // Validate each question
      for (const q of questions) {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
          throw new Error('Invalid question format received from AI')
        }
      }

      return questions
    } catch (error) {
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.')
      }
      throw error
    }
  }

  /**
   * Generate test automatically based on criteria using AI
   */
  async generateTest(criteria) {
    const {
      leaveId,
      subject,
      difficulty,
      numberOfQuestions,
      totalMarks,
      passingPercentage,
      duration,
      title,
      description
    } = criteria

    try {
      // 1. Validate leave exists
      const leave = await Leave.findById(leaveId)
      if (!leave) {
        throw new Error('Leave request not found')
      }

      // 2. Check if test already exists
      const existingTest = await Test.findOne({ leave: leaveId })
      if (existingTest) {
        throw new Error('Test already exists for this leave request')
      }

      // 3. Generate questions using AI
      const aiQuestions = await this.generateQuestionsWithAI(subject, difficulty, numberOfQuestions)

      // 4. Calculate marks per question
      const marksPerQuestion = Math.floor(totalMarks / numberOfQuestions)
      const remainderMarks = totalMarks % numberOfQuestions

      // 5. Build MCQ questions array for test
      const mcqQuestions = aiQuestions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: index === 0 ? marksPerQuestion + remainderMarks : marksPerQuestion
      }))

      // 6. Calculate pass marks
      const passMarks = Math.ceil((totalMarks * passingPercentage) / 100)

      // 7. Return test data
      return {
        leave: leaveId,
        title: title || `${subject} - ${difficulty} Assessment`,
        description: description || `AI-generated test for ${subject}. Complete all questions to process your leave request.`,
        mcqQuestions: mcqQuestions,
        codingQuestions: [],
        totalMarks: totalMarks,
        passMarks: passMarks,
        duration: duration || 3600,
        isActive: true
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Get available subjects (no longer needed but kept for compatibility)
   */
  async getAvailableSubjects() {
    // Return common subjects since we're using AI now
    return [
      'Data Structures',
      'Java',
      'Python',
      'JavaScript',
      'DBMS',
      'Operating System',
      'Computer Networks',
      'Web Development',
      'Machine Learning',
      'Algorithms',
      'C++',
      'Software Engineering'
    ]
  }

  /**
   * Get question count (always return high number since AI generates on demand)
   */
  async getQuestionCount(subject, difficulty) {
    // AI can generate unlimited questions
    return 100
  }
}

export default new AutomaticTestService()
