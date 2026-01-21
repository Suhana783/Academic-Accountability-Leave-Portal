# Automatic Test Generation Feature

## Overview
This feature allows admins to automatically generate tests for student leave requests using a question bank approach - no AI or complex algorithms required!

## How It Works

### 1. Question Bank
- Questions are stored in MongoDB database
- Each question has: subject, difficulty, options, correct answer, marks
- Questions can be easily added or removed

### 2. Admin Workflow
When reviewing a leave request, admin can:
- Choose **"Generate Automatically"** option
- Select criteria:
  - Subject (Data Structures, Java, DBMS, etc.)
  - Difficulty (Easy, Medium, Hard)
  - Number of questions
  - Total marks
  - Passing percentage
  - Duration

### 3. System Generates Test
- Fetches questions from database based on criteria
- Randomly shuffles questions
- Assigns marks evenly
- Creates test automatically
- Links test to leave request

## Setup Instructions

### 1. Seed Question Bank
First, populate the question bank with sample questions:

```bash
cd server
npm run seed-questions
```

This will add 40+ sample questions across multiple subjects.

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 3. Use the Feature
1. Login as admin
2. Go to Admin Dashboard
3. Click on any pending leave request
4. Click **"🤖 Generate Automatically"** button
5. Fill the form with test criteria
6. Click **"🚀 Generate Test Automatically"**
7. Test created and assigned instantly!

## Files Created

### Backend
- `server/src/models/QuestionBank.js` - Question database model
- `server/src/services/automaticTestService.js` - Test generation logic
- `server/src/controllers/testController.js` - Added 3 new endpoints
- `server/src/routes/testRoutes.js` - Added routes
- `server/seedQuestions.js` - Sample questions seeder

### Frontend
- Updated `client/src/pages/LeaveReviewPage.jsx` - Added auto-generate UI
- Updated `client/src/services/testService.js` - Added API calls

## API Endpoints

### 1. Generate Automatic Test
```
POST /api/test/auto-generate
Body: {
  leaveId, subject, difficulty, 
  numberOfQuestions, totalMarks, 
  passingPercentage, duration
}
```

### 2. Get Available Subjects
```
GET /api/test/subjects
Returns: List of available subjects
```

### 3. Get Question Count
```
GET /api/test/question-count?subject=Java&difficulty=Easy
Returns: Number of available questions
```

## Adding More Questions

### Option 1: Directly in Database
Use MongoDB Compass or any MongoDB client to add questions to the `questionbanks` collection.

### Option 2: Create Custom Seeder
Modify `server/seedQuestions.js` and run:
```bash
npm run seed-questions
```

### Question Schema
```javascript
{
  question: "What is...?",
  options: ["A", "B", "C", "D"],
  correctAnswer: 0,  // Index of correct option
  subject: "Java",
  difficulty: "Easy",
  marks: 1,
  isActive: true
}
```

## Benefits

✅ **No AI Required** - Simple database query approach
✅ **Fast** - Questions retrieved in milliseconds  
✅ **Scalable** - Add unlimited questions easily
✅ **Fair** - Random selection prevents memorization
✅ **Flexible** - Admin controls all parameters
✅ **Automated** - No manual test creation needed

## Future Enhancements (Optional)

- Add question management UI for admin
- Import questions from CSV/Excel
- Question usage analytics
- Difficulty-based scoring
- Multi-subject tests
- Question categories/tags

## Troubleshooting

**Error: "Not enough questions available"**
- Solution: Run `npm run seed-questions` or add more questions to database

**Error: "Subject not found"**
- Solution: Check if questions exist for selected subject and difficulty

**Questions not showing in dropdown**
- Solution: Verify questions are added with `isActive: true`

---

**That's it!** The automatic test generation feature is fully implemented and ready to use! 🎉
