# Quick Start Guide - New Auth System

## For Developers

### 1. Backend Setup
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### 3. Create Initial Admin (Database)
```bash
# Option A: Using MongoDB directly
# Create user in 'users' collection:
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "hashed_password", // Use bcrypt hash of "admin123"
  "role": "admin",
  "isActive": true,
  "createdAt": new Date()
}

# Option B: Create seed script (future)
# We can add a seeding script to automatically create initial admin
```

### 4. Test Login
- Navigate to http://localhost:5173
- Login: `admin@example.com` / `admin123`
- Should redirect to `/admin`

---

## For Admins (Using the Portal)

### First Time Setup
1. Login with your admin credentials
2. You see the Admin Dashboard
3. Click "Add Student" to create student accounts

### Creating a Student Account
1. Go to Admin Dashboard
2. Click "Add Student" button
3. Fill in:
   - **Student Name**: e.g., "Alice Johnson"
   - **Email**: Must be unique (e.g., "alice@university.edu")
   - **Password**: Create a secure password
   - **Department**: (Optional) e.g., "Computer Science"
4. Click "Create Student"
5. Share the email and password with the student

### Creating Another Admin
1. Go to Admin Dashboard
2. Click "Add Admin" button
3. Fill in:
   - **Admin Name**: e.g., "Bob Manager"
   - **Email**: Must be unique
   - **Password**: Create a secure password
4. Click "Create Admin"
5. New admin can login and manage users

### Student Onboarding
1. Student receives email with their login credentials
2. Student visits the portal
3. Clicks "Login"
4. Enters email and password
5. Auto-redirected to Student Dashboard
6. Can apply for leave, take tests, view results

---

## Role Comparison

### What an Admin Can Do
- ✅ Login to `/admin` dashboard
- ✅ Create student accounts
- ✅ Create other admin accounts
- ✅ Review pending leave requests
- ✅ Assign tests to students
- ✅ View test results
- ❌ Cannot apply for leave themselves

### What a Student Can Do
- ✅ Login to `/student` dashboard
- ✅ Apply for leave
- ✅ View their own leave history
- ✅ Take assigned tests
- ✅ View test results
- ❌ Cannot access admin pages
- ❌ Cannot create accounts
- ❌ Cannot see other students' data

---

## Common Tasks

### Reset Forgotten Admin Password
```bash
# Method 1: Database direct update (if you have MongoDB access)
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { password: <new_bcrypt_hash> } }
)

# Method 2: Create new admin account (easier)
# Have an existing admin create a new admin with the old admin's email
```

### Deactivate a Student Account
```bash
# Update in MongoDB
db.users.updateOne(
  { email: "student@example.com" },
  { $set: { isActive: false } }
)
# Student will see: "Your account has been deactivated. Please contact admin."
```

### Export List of All Students
```javascript
// Query in MongoDB
db.users.find(
  { role: "student" },
  { name: 1, email: 1, department: 1, leaveBalance: 1 }
).pretty()
```

---

## API Endpoints (for Testing with Postman)

```
POST   /api/auth/login                 → Get token
GET    /api/auth/me                    → Get current user (requires token)
POST   /api/auth/logout                → Logout (requires token)
POST   /api/auth/create-student        → Create student (requires admin token)
POST   /api/auth/create-admin          → Create admin (requires admin token)
```

See `POSTMAN_ENDPOINTS.md` for full details and request/response examples.

---

## Troubleshooting

### "Unauthorized" Error When Creating Users
- **Cause**: Token is missing or invalid
- **Fix**: Make sure you're logged in as an admin and have valid token
- **Check**: Verify token in browser DevTools → Application → localStorage

### "User with this email already exists"
- **Cause**: Email is already registered
- **Fix**: Use a different email address

### Student Can Access Admin Pages
- **Cause**: Role-based routing not working
- **Fix**: Check browser console for errors, clear cache and refresh
- **Debug**: Open DevTools, check localStorage for correct role

### Login Not Working
- **Cause**: Backend server not running
- **Fix**: Ensure `npm start` is running in `/server` directory
- **Check**: http://localhost:5000 should be accessible

### Can't Create Student After Admin Login
- **Cause**: Admin role check failing
- **Fix**: Verify your user actually has role="admin" in database
- **Command**: `db.users.findOne({ email: "admin@example.com" })`

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/academic-leave-portal
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Project Structure

```
Academic-Leave-Portal/
├── server/
│   ├── src/
│   │   ├── controllers/authController.js    ← Updated: removed register
│   │   ├── routes/authRoutes.js             ← Updated: new admin routes
│   │   ├── middleware/authMiddleware.js     ← Unchanged
│   │   ├── models/User.js                   ← Unchanged
│   │   └── ...
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx                ← Updated: simplified
│   │   │   ├── AdminDashboard.jsx           ← Updated: added user mgmt
│   │   │   ├── AddStudentPage.jsx           ← NEW
│   │   │   ├── AddAdminPage.jsx             ← NEW
│   │   │   └── ...
│   │   ├── context/AuthContext.jsx          ← Updated: removed signup
│   │   ├── services/
│   │   │   ├── authService.js               ← Updated: new endpoints
│   │   │   ├── api.js                       ← Updated: better interceptor
│   │   │   └── ...
│   │   ├── components/ProtectedRoute.jsx    ← Updated: better comments
│   │   └── App.jsx                          ← Updated: new routes
│   └── package.json
├── AUTH_REDESIGN_SUMMARY.md                 ← NEW: Complete documentation
├── POSTMAN_ENDPOINTS.md                     ← NEW: API reference
└── README.md
```

---

## Key Features of New System

✅ **No Public Signup** - Only admins create users  
✅ **Simple Login** - Just email and password, no tabs  
✅ **Role Persistence** - Role stored and verified on backend  
✅ **Session Restore** - Auto-login after page refresh  
✅ **Token Management** - Automatic cleanup on expiration  
✅ **Role-Based Access** - Frontend + backend validation  
✅ **Interview Friendly** - Easy to explain and demonstrate  

---

## Next Steps (Optional Enhancements)

1. **Email Notifications**
   - Send credentials to newly created students
   - Send notifications on test assignment

2. **Dashboard Stats**
   - Show admin: total students, pending leaves, completed tests
   - Show student: leaves used, tests pending, results

3. **Bulk User Import**
   - CSV upload for creating multiple students
   - Useful for semester start

4. **Audit Logging**
   - Track who created/modified user accounts
   - Log all admin actions

5. **Two-Factor Authentication**
   - OTP via email for admins
   - Extra security layer

---

## Support

For issues or questions:
1. Check browser console for errors (F12)
2. Check server logs in terminal
3. Review `AUTH_REDESIGN_SUMMARY.md` for detailed flow
4. Check MongoDB for user data
5. Test with Postman (see `POSTMAN_ENDPOINTS.md`)
