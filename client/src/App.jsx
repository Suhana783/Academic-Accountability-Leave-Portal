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
import TakeTestDetailPage from './pages/TakeTestDetailPage'
import TestResultPage from './pages/TestResultPage'
import MyResultsPage from './pages/MyResultsPage'
import LeaveDetailPage from './pages/LeaveDetailPage'
import EditLeavePage from './pages/EditLeavePage'
import AdminDashboard from './pages/AdminDashboard'
import AdminResultsPage from './pages/AdminResultsPage'
import ManageStudents from './pages/ManageStudents'
import LeaveRequests from './pages/LeaveRequests'

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
              <Route path="/take-test" element={<TakeTestPage />} />
              <Route path="/my-results" element={<MyResultsPage />} />
            </Route>

            {/* Shared test view/result (students take tests, admins can view) */}
            <Route element={<ProtectedRoute roles={['student', 'admin']} />}>
              <Route path="/test/:id" element={<TakeTestDetailPage />} />
              <Route path="/test/:id/result" element={<TestResultPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<ManageStudents />} />
              <Route path="/admin/leave-requests" element={<LeaveRequests />} />
              <Route path="/admin/results" element={<AdminResultsPage />} />
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
