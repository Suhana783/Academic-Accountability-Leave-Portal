# 🏗️ SYSTEM ARCHITECTURE

## 📊 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACADEMIC LEAVE PORTAL                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐                              ┌──────────────────┐
│                  │                              │                  │
│  ADMIN           │◄─────────────────────────────┤  STUDENT         │
│  - Create users  │                              │  - Apply leave   │
│  - Review leaves │                              │  - Take test     │
│  - Create tests  │                              │  - View result   │
│  - View results  │                              │                  │
│                  │                              │                  │
└────────┬─────────┘                              └────────┬─────────┘
         │                                                  │
         │                    JWT Auth                     │
         │                    Token                        │
         └──────────────────────┬──────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │                       │
                    │   EXPRESS SERVER      │
                    │   (Node.js)           │
                    │                       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │                       │
                    │  EVALUATION ENGINE    │
                    │  - MCQ Compare        │
                    │  - Coding Compare     │
                    │  - Auto Status Update │
                    │                       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │                       │
                    │   MONGODB DATABASE    │
                    │   - Users             │
                    │   - Leaves            │
                    │   - Tests             │
                    │   - Results           │
                    │                       │
                    └───────────────────────┘
```

---

## 🔄 Data Flow

### 1. Leave Application Flow
```
Student fills form → POST /api/leave → Save to DB → Status: pending
```

### 2. Test Creation Flow
```
Admin creates test → POST /api/test → Save to DB → Update leave status to "test_assigned"
```

### 3. Test Submission & Evaluation Flow
```
Student submits test
    ↓
POST /api/test/:id/submit
    ↓
evaluationService.completeSubmission()
    ↓
evaluateAllMCQs() + evaluateAllCodingQuestions()
    ↓
Calculate totalScore
    ↓
Compare with passMarks
    ↓
if (passed) → Leave status = "approved"
if (failed) → Leave status = "rejected"
    ↓
Save TestResult to DB
    ↓
Return result + message to student
```

---

## 📦 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "admin",
  department: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Leave Collection
```javascript
{
  _id: ObjectId,
  student: ObjectId → User,
  startDate: Date,
  endDate: Date,
  reason: String,
  status: "pending" | "test_assigned" | "approved" | "rejected",
  adminRemarks: String,
  reviewedBy: ObjectId → User,
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Test Collection
```javascript
{
  _id: ObjectId,
  leave: ObjectId → Leave (unique),
  createdBy: ObjectId → User,
  title: String,
  description: String,
  mcqQuestions: [
    {
      question: String,
      options: [String],
      correctAnswer: Number,
      marks: Number
    }
  ],
  codingQuestions: [
    {
      question: String,
      expectedOutput: String,
      marks: Number
    }
  ],
  totalMarks: Number (auto-calculated),
  passMarks: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### TestResult Collection
```javascript
{
  _id: ObjectId,
  test: ObjectId → Test,
  student: ObjectId → User,
  leave: ObjectId → Leave,
  mcqAnswers: [
    {
      questionIndex: Number,
      selectedAnswer: Number,
      correctAnswer: Number,
      isCorrect: Boolean,
      marksAwarded: Number
    }
  ],
  codingAnswers: [
    {
      questionIndex: Number,
      submittedOutput: String,
      expectedOutput: String,
      isCorrect: Boolean,
      marksAwarded: Number
    }
  ],
  mcqScore: Number,
  codingScore: Number,
  totalScore: Number,
  maxScore: Number,
  passed: Boolean,
  passMarks: Number,
  feedback: String,
  submittedAt: Date,
  timeTaken: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Flow

```
User enters email + password
    ↓
POST /api/auth/login
    ↓
Find user in DB
    ↓
Compare password (bcrypt)
    ↓
Generate JWT token (user._id + role)
    ↓
Return token + user data
    ↓
Frontend stores token
    ↓
All API calls include: Authorization: Bearer <token>
    ↓
authMiddleware verifies token
    ↓
Attach req.user (with role)
    ↓
Route handler checks role
    ↓
Allow/Deny access
```

---

## 🎯 Evaluation Algorithm

### MCQ Evaluation
```javascript
for each mcqQuestion:
  if (submittedAnswer === correctAnswer):
    marksAwarded = question.marks
  else:
    marksAwarded = 0
  
  mcqScore += marksAwarded
```

### Coding Evaluation
```javascript
for each codingQuestion:
  submittedOutput = submitted.trim()
  expectedOutput = question.expectedOutput.trim()
  
  if (submittedOutput === expectedOutput):
    marksAwarded = question.marks
  else:
    marksAwarded = 0
  
  codingScore += marksAwarded
```

### Final Decision
```javascript
totalScore = mcqScore + codingScore

if (totalScore >= test.passMarks):
  result.passed = true
  leave.status = "approved"
else:
  result.passed = false
  leave.status = "rejected"
```

---

## 🌐 API Routes

```
auth/
  POST   /login                    (Public)
  POST   /create-student          (Admin only)
  POST   /create-admin            (Admin only)
  GET    /me                      (Authenticated)

leave/
  POST   /                        (Student only)
  GET    /                        (Admin only)
  GET    /my-leaves               (Student only)
  GET    /:id                     (Authenticated)

test/
  POST   /                        (Admin only)
  GET    /:id                     (Authenticated)
  PUT    /:id                     (Admin only)
  DELETE /:id                     (Admin only)
  GET    /leave/:leaveId          (Authenticated)
  POST   /:id/submit              (Student only)
  GET    /:id/result              (Authenticated)
```

---

## 🎨 Frontend Architecture

```
App.jsx
  ↓
AuthContext (provides: user, login, logout)
  ↓
Router
  ├── / → LoginPage
  ├── /admin → ProtectedRoute(role: admin)
  │   ├── /admin → AdminDashboard
  │   ├── /admin/leaves → ViewAllLeaves
  │   ├── /admin/students → AddStudent
  │   ├── /admin/admins → AddAdmin
  │   └── /leave/:id/review → LeaveReviewPage
  │
  └── /student → ProtectedRoute(role: student)
      ├── /student → StudentDashboard
      ├── /student/apply → ApplyLeave
      ├── /student/leaves → MyLeaves
      ├── /test/:id → TakeTestPage
      └── /test/:id/result → TestResultPage
```

---

## 🔧 Key Components

### Backend Services
- **authService.js:** JWT generation and verification
- **evaluationService.js:** Test evaluation logic
- **evaluationHelper.js:** MCQ and coding comparison functions

### Backend Middleware
- **authMiddleware.js:** Token verification, role checking
- **errorHandler.js:** Centralized error handling

### Frontend Services
- **authService.js:** Login, logout, token management
- **leaveService.js:** Leave CRUD operations
- **testService.js:** Test operations, submission

### Frontend Context
- **AuthContext.jsx:** User state, authentication methods

---

## 📊 State Management

### Backend (MongoDB)
- Persistent data in collections
- Mongoose for schema validation
- Indexed queries for performance

### Frontend (React Context)
- User state (name, email, role, token)
- Login/Logout methods
- Protected route checks

---

## 🎯 Security Features

✅ **Password Hashing:** bcryptjs with salt
✅ **JWT Tokens:** Signed with secret key
✅ **Role-Based Access:** Middleware checks user.role
✅ **Protected Routes:** Frontend + Backend validation
✅ **CORS:** Configured for localhost:3000
✅ **Input Sanitization:** Express validators

---

## 🚀 Performance Optimizations

✅ **Database Indexing:** On student, leave, test IDs
✅ **Populate Queries:** Efficient relation fetching
✅ **Simple Logic:** No complex computations
✅ **Minimal Dependencies:** Only essential packages

---

## ✅ SYSTEM READY

All components working together to provide:
- Secure authentication
- Role-based features
- Automatic evaluation
- End-to-end leave management

**No additional configuration needed!** 🎉
