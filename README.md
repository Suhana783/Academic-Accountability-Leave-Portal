# Academic Accountability Leave Portal

A full-stack leave management system that combines test-based evaluation for student leave approvals. Admins manage students and approve/reject leave requests based on test performance.

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB, JWT  
**Frontend:** React, Vite, React Router, Context API  
**Database:** MongoDB with Mongoose  
**Authentication:** JWT + bcryptjs

---

## Project Structure

```
server/
├── src/
│   ├── models/      # User, Leave, Test, TestResult schemas
│   ├── controllers/ # Authentication, Leave, Test logic
│   ├── routes/      # API endpoints
│   ├── services/    # Test evaluation service
│   └── middleware/  # Auth & error handling
│
client/
├── src/
│   ├── pages/       # Dashboard, ApplyLeave, TakeTest, etc.
│   ├── services/    # API service calls
│   ├── context/     # Authentication context
│   └── styles/      # Global CSS & typography
```

---

## Main Features

- **Admin Dashboard:** View students, manage admins, review leave requests, track test assignments
- **Student Portal:** Apply for leave, take assigned tests, view results and leave status
- **Leave Management:** Submit leave requests with dates and reasons
- **Test System:** Admin creates tests with MCQ and coding questions; students take tests and get instant evaluation
- **Automated Evaluation:** Tests evaluated automatically; leave status updates based on test results
- **Role-Based Access:** Separate interfaces for admins and students
- **Authentication:** Secure JWT-based login with password hashing

---

## How to Run

1. **Install Dependencies (Backend)**
   ```bash
   cd server
   npm install
   ```

2. **Install Dependencies (Frontend)**
   ```bash
   cd client
   npm install
   ```

3. **Start Backend**
   ```bash
   cd server
   npm run dev
   ```

4. **Start Frontend** (new terminal)
   ```bash
   cd client
   npm run dev
   ```

5. **Seed Database** (first time only)
   ```bash
   cd server
   node seed.js
   ```

6. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - Default Admin: `admin@example.com` / `admin123`
   - Default Student: `student@example.com` / `student123`

---

## API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Student/Admin login |
| `/api/auth/register` | POST | Create new student |
| `/api/leaves` | GET/POST | Get all leaves / Create leave |
| `/api/leaves/:id` | PATCH | Update leave status |
| `/api/tests` | GET/POST | Get/Create tests |
| `/api/tests/:id/submit` | POST | Submit test answers |
| `/api/results` | GET | Get test results |

---

## Known Limitations

- String comparison only for coding question evaluation (no advanced parsing)
- No complex leave policies (simple approval/rejection based on test pass/fail)
- Single timezone support
- No real-time notifications
- Limited file upload capabilities
