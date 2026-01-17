# 🎬 LIVE DEMO SCRIPT

Follow this exact script to demonstrate your project in 5 minutes!

---

## 🎯 Demo Overview

You will show:
1. Admin creating a test with MCQ + Coding questions
2. Student taking the test
3. Automatic evaluation and leave approval

**Time:** 5 minutes
**Audience:** College evaluators

---

## 📝 PRE-DEMO SETUP (Do this before starting)

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev

# Terminal 3 - Seed database (if not done)
cd server && node seed.js
```

**Open browser:** http://localhost:5173

---

## 🎬 DEMO SCRIPT

### Step 1: Login as Admin (30 seconds)

**Say:** "First, I'll login as an admin to review leave requests."

**Do:**
1. Enter email: `admin@example.com`
2. Enter password: `admin123`
3. Click "Login"
4. **Show:** Admin dashboard with "View All Leaves" button

**Say:** "As admin, I can see all leave requests and create tests for them."

---

### Step 2: View Leave Requests (20 seconds)

**Do:**
1. Click "View All Leaves"
2. **Show:** List of leave requests with student names and status

**Say:** "Here are the leave applications. Let me review one."

**Do:**
1. Click on any "pending" leave request
2. Click "Review" button

---

### Step 3: Create Test (1 minute)

**Say:** "Now I'll create a test for this student. The system supports both MCQ and coding questions."

**Do:**

1. **MCQ Question:**
   - Question: `What is the capital of France?`
   - Options: `Berlin, Paris, Rome, Madrid`
   - Correct Answer: `1` (Paris is index 1)
   - Marks: `1`

2. Click "Add Coding Question"

3. **Coding Question:**
   - Question: `Write code to print "Hello World"`
   - Expected Output: `Hello World`
   - Marks: `2`

4. **Pass Marks:** `2` (need 2 out of 3 to pass)

5. Click "Create Test"

**Say:** "The test is created. Notice the leave status changed to 'test_assigned'. Now the student can take this test."

---

### Step 4: Logout and Login as Student (20 seconds)

**Do:**
1. Click "Logout" (or just go to login page)
2. Enter email: `student@example.com`
3. Enter password: `student123`
4. Click "Login"
5. **Show:** Student dashboard

**Say:** "Now I'm logged in as the student who applied for leave."

---

### Step 5: View Leaves and Take Test (30 seconds)

**Do:**
1. Click "My Leaves"
2. **Show:** The leave with status "test_assigned"
3. Click "Take Test" button

**Say:** "The student can see that a test has been assigned. Let's take it."

---

### Step 6: Answer Questions (1 minute)

**Say:** "The test has both MCQ and coding questions. I'll answer them now."

**Do:**

1. **MCQ Question:**
   - Read the question
   - Select "Paris" (option 1)

2. **Coding Question:**
   - Read the question
   - In the textarea, type: `Hello World`

3. Click "Submit Test"

**Say:** "I've submitted the test. The system will now evaluate it automatically."

---

### Step 7: View Results (45 seconds)

**Show:** Test result page with:
- Total Score: 3/3
- Status: PASSED
- Leave Status: approved
- Feedback message
- MCQ result: Correct ✓
- Coding result: Correct ✓

**Say:** "Look! The system automatically evaluated both questions:
- The MCQ answer was correct: +1 mark
- The coding output matched exactly: +2 marks
- Total score is 3 out of 3
- Since 3 is greater than the pass marks (2), the student PASSED
- And most importantly, the leave status automatically changed to APPROVED!"

---

### Step 8: Show Failed Scenario (Optional - 45 seconds)

**Say:** "Let me show what happens if a student fails."

**Do:**
1. Logout, login as admin
2. Create another test for a different leave
3. Logout, login as that student
4. Take test but give WRONG answers:
   - MCQ: Select wrong option
   - Coding: Type `hello world` (lowercase, should fail)
5. Submit test
6. **Show:** 
   - Score: 0/3
   - Status: FAILED
   - Leave Status: rejected

**Say:** "When the student scores below pass marks, the leave is automatically rejected. This is the core feature of our test-based system."

---

## 🎯 KEY POINTS TO EMPHASIZE

1. **Automatic Evaluation:** "No manual checking needed. The system compares answers automatically."

2. **Both Question Types:** "Supports MCQ for theory and Coding for practical skills."

3. **Simple Logic:** "MCQ uses index comparison, Coding uses exact string match."

4. **Auto Status Update:** "Leave status changes automatically based on test result."

5. **Role-Based:** "Admin creates tests, students take tests. Clear separation."

---

## 💡 ANSWER COMMON QUESTIONS

**Q: What if student submits wrong output?**
A: The system compares submitted output with expected output (exact match). If it doesn't match, marks = 0.

**Q: Can you have only MCQ or only Coding?**
A: Yes! You can add any combination. The system calculates total marks from all questions.

**Q: What about percentage passing?**
A: We use absolute marks (e.g., "need 3 out of 5") instead of percentages to keep it simple.

**Q: Can student retake the test?**
A: Currently no. Each test can only be submitted once to prevent multiple attempts.

**Q: How does the coding evaluation work?**
A: It's a simple string comparison: `submittedOutput.trim() === expectedOutput.trim()`. If they match exactly, full marks. Otherwise, zero.

---

## ✅ DEMO COMPLETE!

**Final Words:** "As you can see, the system fully integrates academic testing into leave management. It's simple, automatic, and works end-to-end. Thank you!"

**Total Time:** 4-5 minutes

---

## 🚨 BACKUP PLAN (If something doesn't work)

1. **Can't login:** Use seed.js to recreate accounts
2. **No leaves:** Login as student, apply for leave first
3. **Test not showing:** Check browser console, refresh page
4. **Server error:** Check terminal logs, restart server

---

## 📊 DEMO SUCCESS CHECKLIST

Before starting, verify:
- ✅ Backend running (port 5000)
- ✅ Frontend running (port 5173)
- ✅ Database seeded (admin + student accounts exist)
- ✅ MongoDB connected
- ✅ Browser open to http://localhost:5173

**You're ready to impress! Good luck! 🎉**
