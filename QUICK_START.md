# 🚀 QUICK START GUIDE

## Step-by-Step Setup

### 1. Setup MongoDB
Make sure MongoDB is running on your system:
```bash
# Check if MongoDB is running
mongosh

# Or start MongoDB service
sudo systemctl start mongod
```

### 2. Setup Backend

```bash
# Navigate to server folder
cd server

# Install dependencies (already done)
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/leave-management
JWT_SECRET=mysecretkey123
PORT=5000
EOF

# Start server
npm run dev
```

Server will run on http://localhost:5000

### 3. Setup Frontend

```bash
# Open new terminal
# Navigate to client folder
cd client

# Install dependencies (already done)
npm install

# Start frontend
npm run dev
```

Frontend will run on http://localhost:5173

### 4. Initialize Database with Sample Data

```bash
# In server folder
cd server
node seed.js
```

This creates:
- **Admin Account:**
  - Email: admin@college.edu
  - Password: admin123

- **Student Accounts:**
  - Email: student1@college.edu, Password: student123
  - Email: student2@college.edu, Password: student123

### 5. Login & Test

1. Go to http://localhost:5173
2. Login as Admin (admin@college.edu / admin123)
3. Create a student or use existing student
4. Logout and login as Student
5. Apply for leave
6. Logout and login as Admin
7. Review the leave and create a test
8. Logout and login as Student
9. Take the test
10. View result and leave status

---

## 🎯 DEMO FLOW

### As Admin:
1. Login → Dashboard shows all leaves
2. Click "View All Leaves"
3. Select a pending leave → "Review"
4. Create test with:
   - MCQ: "What is 2+2?" Options: 3,4,5,6 Correct: 1 Marks: 1
   - Coding: "Print Hello World" Expected: "Hello World" Marks: 1
   - Pass Marks: 1 (need at least 1/2 to pass)
5. Submit test

### As Student:
1. Login → Dashboard
2. Click "Apply Leave"
3. Fill dates and reason → Submit
4. View "My Leaves" → See status "test_assigned"
5. Click "Take Test"
6. Answer MCQ and Coding question
7. Submit test
8. View result → Leave status changes to "approved" or "rejected"

---

## 🔧 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running: `sudo systemctl status mongod`
- Check connection string in .env file

### Port Already in Use
- Backend: Change PORT in server/.env
- Frontend: Change port in client/vite.config.js

### Module Not Found
- Run `npm install` in both server and client folders

---

## 📁 Project Structure

```
Academic-Accountability-Leave-Portal/
├── server/              # Backend (Express + MongoDB)
│   ├── src/
│   │   ├── models/      # Database schemas
│   │   ├── controllers/ # Route handlers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth & error handling
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helper functions
│   ├── .env            # Environment variables
│   └── package.json
│
└── client/             # Frontend (React + Vite)
    ├── src/
    │   ├── pages/      # UI pages
    │   ├── components/ # Reusable components
    │   ├── services/   # API calls
    │   ├── context/    # State management
    │   └── styles/     # CSS
    └── package.json
```

---

## ✅ Ready to Go!

Your system is now ready for demonstration and evaluation! 🎉
