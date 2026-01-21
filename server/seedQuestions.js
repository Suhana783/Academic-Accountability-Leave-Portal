import mongoose from 'mongoose'
import dotenv from 'dotenv'
import QuestionBank from './src/models/QuestionBank.js'

dotenv.config()

const sampleQuestions = [
  // Data Structures - Easy
  {
    question: 'What is the time complexity of accessing an element in an array by index?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correctAnswer: 0,
    subject: 'Data Structures',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which data structure uses LIFO (Last In First Out) principle?',
    options: ['Queue', 'Stack', 'Array', 'Tree'],
    correctAnswer: 1,
    subject: 'Data Structures',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'In which data structure elements are stored in contiguous memory locations?',
    options: ['Linked List', 'Tree', 'Array', 'Graph'],
    correctAnswer: 2,
    subject: 'Data Structures',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What is the first element of a queue called?',
    options: ['Top', 'Front', 'Head', 'Start'],
    correctAnswer: 1,
    subject: 'Data Structures',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which operation is used to add an element to a stack?',
    options: ['Push', 'Pop', 'Insert', 'Add'],
    correctAnswer: 0,
    subject: 'Data Structures',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What type of data structure is a binary search tree?',
    options: ['Linear', 'Non-linear', 'Sequential', 'Random'],
    correctAnswer: 1,
    subject: 'Data Structures',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which data structure is best for implementing recursion?',
    options: ['Queue', 'Stack', 'Array', 'Hash Table'],
    correctAnswer: 1,
    subject: 'Data Structures',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What is the maximum number of children a binary tree node can have?',
    options: ['1', '2', '3', 'Unlimited'],
    correctAnswer: 1,
    subject: 'Data Structures',
    difficulty: 'Easy',
    marks: 1
  },

  // Data Structures - Medium
  {
    question: 'What is the time complexity of searching in a balanced binary search tree?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 2,
    subject: 'Data Structures',
    difficulty: 'Medium',
    marks: 1
  },
  {
    question: 'Which traversal technique visits the root node last?',
    options: ['Preorder', 'Inorder', 'Postorder', 'Level order'],
    correctAnswer: 2,
    subject: 'Data Structures',
    difficulty: 'Medium',
    marks: 1
  },
  {
    question: 'What is the space complexity of merge sort?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctAnswer: 2,
    subject: 'Data Structures',
    difficulty: 'Medium',
    marks: 1
  },
  {
    question: 'In which data structure can we find both the minimum and maximum element in O(1) time?',
    options: ['Array', 'Min-Max Heap', 'Binary Search Tree', 'Queue'],
    correctAnswer: 1,
    subject: 'Data Structures',
    difficulty: 'Medium',
    marks: 1
  },
  {
    question: 'What is the average time complexity of hash table operations?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correctAnswer: 0,
    subject: 'Data Structures',
    difficulty: 'Medium',
    marks: 1
  },

  // Java - Easy
  {
    question: 'Which keyword is used to inherit a class in Java?',
    options: ['inherits', 'extends', 'implements', 'super'],
    correctAnswer: 1,
    subject: 'Java',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What is the default value of a boolean variable in Java?',
    options: ['true', 'false', '0', 'null'],
    correctAnswer: 1,
    subject: 'Java',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which method is the entry point of any Java application?',
    options: ['start()', 'run()', 'main()', 'init()'],
    correctAnswer: 2,
    subject: 'Java',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What is the size of int data type in Java?',
    options: ['8 bits', '16 bits', '32 bits', '64 bits'],
    correctAnswer: 2,
    subject: 'Java',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which package is imported by default in Java?',
    options: ['java.util', 'java.io', 'java.lang', 'java.net'],
    correctAnswer: 2,
    subject: 'Java',
    difficulty: 'Easy',
    marks: 1
  },

  // DBMS - Easy
  {
    question: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Sequential Query Language'],
    correctAnswer: 0,
    subject: 'DBMS',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which SQL command is used to retrieve data from a database?',
    options: ['GET', 'SELECT', 'RETRIEVE', 'FETCH'],
    correctAnswer: 1,
    subject: 'DBMS',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What is a primary key in a database?',
    options: ['A key that opens the database', 'A unique identifier for a record', 'The first column in a table', 'A foreign key reference'],
    correctAnswer: 1,
    subject: 'DBMS',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which command is used to delete a table in SQL?',
    options: ['DELETE', 'REMOVE', 'DROP', 'ERASE'],
    correctAnswer: 2,
    subject: 'DBMS',
    difficulty: 'Easy',
    marks: 1
  },

  // Operating System - Easy
  {
    question: 'What is the main function of an operating system?',
    options: ['Manage hardware', 'Run applications', 'Provide user interface', 'All of the above'],
    correctAnswer: 3,
    subject: 'Operating System',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which scheduling algorithm is based on time quantum?',
    options: ['FCFS', 'SJF', 'Round Robin', 'Priority'],
    correctAnswer: 2,
    subject: 'Operating System',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What is a process in operating systems?',
    options: ['A program in execution', 'A stored program', 'A CPU instruction', 'A memory location'],
    correctAnswer: 0,
    subject: 'Operating System',
    difficulty: 'Easy',
    marks: 1
  },

  // Web Development - Easy
  {
    question: 'What does HTML stand for?',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
    correctAnswer: 0,
    subject: 'Web Development',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which CSS property is used to change text color?',
    options: ['font-color', 'text-color', 'color', 'foreground-color'],
    correctAnswer: 2,
    subject: 'Web Development',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What is the correct way to declare a JavaScript variable?',
    options: ['variable name', 'v name', 'var name', 'declare name'],
    correctAnswer: 2,
    subject: 'Web Development',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which HTTP method is used to send data to a server?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctAnswer: 1,
    subject: 'Web Development',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
    correctAnswer: 1,
    subject: 'Web Development',
    difficulty: 'Easy',
    marks: 1
  },

  // Computer Networks - Easy
  {
    question: 'What does IP stand for?',
    options: ['Internet Protocol', 'Internal Protocol', 'Interconnected Protocol', 'Information Protocol'],
    correctAnswer: 0,
    subject: 'Computer Networks',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'Which layer of the OSI model handles routing?',
    options: ['Physical', 'Data Link', 'Network', 'Transport'],
    correctAnswer: 2,
    subject: 'Computer Networks',
    difficulty: 'Easy',
    marks: 1
  },
  {
    question: 'What is the standard port number for HTTP?',
    options: ['21', '22', '80', '443'],
    correctAnswer: 2,
    subject: 'Computer Networks',
    difficulty: 'Easy',
    marks: 1
  }
]

const seedQuestions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Connected for seeding...')

    // Clear existing questions
    await QuestionBank.deleteMany({})
    console.log('Cleared existing questions')

    // Insert sample questions
    await QuestionBank.insertMany(sampleQuestions)
    console.log(`✅ Successfully added ${sampleQuestions.length} questions to the database`)

    // Show summary
    const subjects = await QuestionBank.distinct('subject')
    console.log('\n📊 Question Bank Summary:')
    for (const subject of subjects) {
      const easy = await QuestionBank.countDocuments({ subject, difficulty: 'Easy' })
      const medium = await QuestionBank.countDocuments({ subject, difficulty: 'Medium' })
      const hard = await QuestionBank.countDocuments({ subject, difficulty: 'Hard' })
      console.log(`  ${subject}: Easy=${easy}, Medium=${medium}, Hard=${hard}`)
    }

    process.exit(0)
  } catch (error) {
    console.error('Error seeding questions:', error)
    process.exit(1)
  }
}

seedQuestions()
