import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import StudentDashboard from './pages/StudentDashboard'
import ApplyLeavePage from './pages/ApplyLeavePage'
import MyLeavesPage from './pages/MyLeavesPage'
import TakeTestPage from './pages/TakeTestPage'
import TestResultPage from './pages/TestResultPage'
import MyResultsPage from './pages/MyResultsPage'
import LeaveDetailPage from './pages/LeaveDetailPage'
import EditLeavePage from './pages/EditLeavePage'
import AdminDashboard from './pages/AdminDashboard'
import LeaveReviewPage from './pages/LeaveReviewPage'
import AdminResultsPage from './pages/AdminResultsPage'
import AddStudentPage from './pages/AddStudentPage'
import AddAdminPage from './pages/AddAdminPage'
import RemoveUserPage from './pages/RemoveUserPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Student routes */}
            <Route element={<ProtectedRoute roles={['student']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/apply-leave" element={<ApplyLeavePage />} />
              <Route path="/my-leaves" element={<MyLeavesPage />} />
              <Route path="/leave/:id" element={<LeaveDetailPage />} />
              <Route path="/leave/:id/edit" element={<EditLeavePage />} />
              <Route path="/my-results" element={<MyResultsPage />} />
            </Route>

            {/* Shared test view/result (students take tests, admins can view) */}
            <Route element={<ProtectedRoute roles={['student', 'admin']} />}>
              <Route path="/test/:id" element={<TakeTestPage />} />
              <Route path="/test/:id/result" element={<TestResultPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/leaves/:id" element={<LeaveReviewPage />} />
              <Route path="/admin/results" element={<AdminResultsPage />} />
              <Route path="/admin/add-student" element={<AddStudentPage />} />
              <Route path="/admin/add-admin" element={<AddAdminPage />} />
              <Route path="/admin/remove-user" element={<RemoveUserPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App
