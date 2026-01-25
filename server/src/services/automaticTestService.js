import Test from '../models/Test.js'
import Leave from '../models/Leave.js'

// Predefined question bank (intermediate level) grouped by subject
const QUESTION_BANK = {
  javascript: [
    {
      question: 'What is the output of `console.log(typeof NaN)`?',
      options: ['number', 'NaN', 'undefined', 'object'],
      correctAnswer: 0
    },
    {
      question: 'Which array method returns a new array with elements that pass a test?',
      options: ['map', 'filter', 'forEach', 'reduce'],
      correctAnswer: 1
    },
    {
      question: 'What does `===` check that `==` does not?',
      options: ['Type only', 'Value only', 'Type and value', 'Reference'],
      correctAnswer: 2
    },
    {
      question: 'Which statement is true about `let` vs `var`?',
      options: ['Both are function-scoped', 'Both are block-scoped', '`let` is block-scoped, `var` is function-scoped', '`var` is block-scoped, `let` is function-scoped'],
      correctAnswer: 2
    },
    {
      question: 'How do you create a shallow copy of an array?',
      options: ['arr.copy()', '[...arr]', 'arr.clone()', 'arr.copyOf()'],
      correctAnswer: 1
    },
    {
      question: 'Which object method converts an object to a JSON string?',
      options: ['JSON.stringify', 'Object.toJSON', 'JSON.parse', 'Object.stringify'],
      correctAnswer: 0
    },
    {
      question: 'What is a closure?',
      options: [
        'A function that returns another function',
        'A function with access to its lexical scope even when executed outside that scope',
        'A function that closes variables',
        'A function without parameters'
      ],
      correctAnswer: 1
    },
    {
      question: 'Which of these is NOT a primitive type?',
      options: ['string', 'boolean', 'object', 'symbol'],
      correctAnswer: 2
    }
  ],
  'react.js': [
    {
      question: 'What hook replaces most class lifecycle methods in function components?',
      options: ['useState', 'useEffect', 'useMemo', 'useContext'],
      correctAnswer: 1
    },
    {
      question: 'What is the purpose of keys when rendering lists?',
      options: ['Improve styling', 'Optimize re-renders and track items', 'Add accessibility', 'Trigger animations'],
      correctAnswer: 1
    },
    {
      question: 'Which hook shares state across components via context?',
      options: ['useRef', 'useContext', 'useReducer', 'useCallback'],
      correctAnswer: 1
    },
    {
      question: 'What does React Strict Mode mainly help with?',
      options: ['Production optimization', 'Styling consistency', 'Highlighting potential side-effect issues', 'Caching assets'],
      correctAnswer: 2
    },
    {
      question: 'Which hook is best for complex state transitions?',
      options: ['useState', 'useReducer', 'useRef', 'useLayoutEffect'],
      correctAnswer: 1
    },
    {
      question: 'What does `useMemo` return?',
      options: ['A memoized value', 'A memoized function', 'A memoized component', 'A memoized hook'],
      correctAnswer: 0
    },
    {
      question: 'What happens when state is updated in React?',
      options: ['DOM updates immediately', 'Component re-renders and virtual DOM diff runs', 'Nothing until reload', 'Only parent re-renders'],
      correctAnswer: 1
    },
    {
      question: 'How do you lazily load a component?',
      options: ['import Component from "./Comp"', 'React.lazy(() => import("./Comp"))', 'useMemo(Component)', 'useEffect(import)'],
      correctAnswer: 1
    }
  ],
  python: [
    {
      question: 'What is the result of `len({1,2,2,3})`?',
      options: ['4', '3', '2', '0'],
      correctAnswer: 1
    },
    {
      question: 'Which keyword is used to handle exceptions?',
      options: ['catch', 'handle', 'except', 'error'],
      correctAnswer: 2
    },
    {
      question: 'What is a list comprehension?',
      options: ['A memory view', 'A concise way to create lists from iterables', 'A generator', 'A lambda'],
      correctAnswer: 1
    },
    {
      question: 'Which built-in is used to iterate with indices?',
      options: ['items()', 'keys()', 'enumerate()', 'range()'],
      correctAnswer: 2
    },
    {
      question: 'What does the `*args` syntax allow?',
      options: ['Keyword arguments', 'Variable positional arguments', 'Static typing', 'Decorators'],
      correctAnswer: 1
    },
    {
      question: 'What is the output of `"".join(["a","b","c"])`?',
      options: ['abc', 'a b c', 'a,b,c', 'None'],
      correctAnswer: 0
    },
    {
      question: 'Which data structure preserves insertion order in Python 3.7+?',
      options: ['dict', 'set', 'frozenset', 'heapq'],
      correctAnswer: 0
    },
    {
      question: 'How do you create a virtual environment?',
      options: ['python -m venv venv', 'pip create venv', 'virtualenv install', 'env make'],
      correctAnswer: 0
    }
  ]
}

const pickQuestions = (subject, numberOfQuestions) => {
  const key = subject?.toLowerCase()
  const pool = QUESTION_BANK[key]
  if (!pool || pool.length === 0) {
    throw new Error('No predefined questions available for this subject.')
  }

  // Shuffle a shallow copy and take the requested amount (with wrap if needed)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const result = []
  for (let i = 0; i < numberOfQuestions; i++) {
    result.push(shuffled[i % shuffled.length])
  }
  return result
}

class AutomaticTestService {
  /**
   * Generate questions using predefined banks (intermediate level)
   */
  async generateQuestionsWithAI(subject, difficulty, numberOfQuestions) {
    // Difficulty ignored for now; all questions are intermediate
    return pickQuestions(subject, numberOfQuestions)
  }

  /**
   * Generate test automatically based on predefined question banks
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

      // 3. Generate questions using predefined bank
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
        description: description || `Predefined test for ${subject}. Complete all questions to process your leave request.`,
        mcqQuestions: mcqQuestions,
        codingQuestions: [],
        totalMarks: totalMarks,
        passMarks: passMarks,
        duration: duration || 1800, // default 30 minutes
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
    return Object.keys(QUESTION_BANK).map((key) => key.replace(/\b\w/g, (c) => c.toUpperCase()))
  }

  /**
   * Get question count from predefined bank
   */
  async getQuestionCount(subject, difficulty) {
    const key = subject?.toLowerCase()
    const pool = QUESTION_BANK[key]
    return pool ? pool.length : 0
  }
}

export default new AutomaticTestService()
