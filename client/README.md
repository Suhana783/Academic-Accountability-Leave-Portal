# Academic Accountability Leave Management Portal — Frontend (React + Vite)

This frontend implements a clean, functional UI for Students and Admins and connects to the existing backend APIs. The focus is on clarity, academic-friendliness, and modular code with minimal styling.

## Why These Design Choices

- **Axios Instance**: Centralized `baseURL` and `Authorization` header via interceptors for consistent API calls and reduced boilerplate.
- **Auth Context**: Single source of truth for `user` and `token`, with localStorage persistence and lazy bootstrap using `/auth/me`. Keeps auth logic decoupled from pages.
- **Protected Routing**: Role-aware guards (`ProtectedRoute`) ensure only authorized users access student/admin views. Avoids duplicating checks in each page.
- **Services Layer**: `authService`, `leaveService`, `testService` encapsulate API contracts. Improves readability and change resilience.
- **Simple UI Components**: `Layout` provides a top navigation shell and logout, keeping pages focused on business logic.
- **Minimal Styling**: Global CSS with common classes (`card`, `btn`, `form`, `list`, `grid`) for clarity without heavy frameworks.

## Project Structure

- Pages: user flows
  - Login, Student Dashboard, Apply Leave, My Leaves, Take Test, Test Result, My Results, Admin Dashboard, Leave Review, Admin Results
- Components: reusable UI
  - Layout, ProtectedRoute
- Context: global state
  - AuthContext
- Services: API integration
  - api, authService, leaveService, testService

## Routing Overview

- Public
  - `/login` → LoginPage
- Student (protected)
  - `/student` → StudentDashboard
  - `/apply-leave` → ApplyLeavePage
  - `/my-leaves` → MyLeavesPage
  - `/leave/:id` → LeaveDetailPage
  - `/test/:id` → TakeTestPage
  - `/test/:id/result` → TestResultPage
  - `/my-results` → MyResultsPage
- Admin (protected)
  - `/admin` → AdminDashboard
  - `/admin/leaves/:id` → LeaveReviewPage
  - `/admin/results` → AdminResultsPage

## Auth Flow

1. User submits credentials on `/login` → `authService.login()`
2. Response returns `user` and `token`
3. AuthContext persists both to localStorage and in-memory
4. Axios attaches `Bearer <token>` automatically via interceptor
5. If a token exists but `user` is missing on load, AuthContext calls `authService.getMe()`

## API Integration Map

- Auth
  - `POST /api/auth/login` → login
  - `GET /api/auth/me` → bootstrap user
- Leave (student/admin)
  - `POST /api/leave` → applyLeave
  - `GET /api/leave/my-leaves` → getMyLeaves
  - `GET /api/leave/:id` → getLeave
  - `GET /api/leave` → getAllLeaves (admin)
  - `PUT /api/leave/:id/status` → updateLeaveStatus (admin)
- Tests
  - `GET /api/test/:id` → getTestById
  - `GET /api/test/leave/:leaveId` → getTestByLeave
  - `POST /api/test/:id/submit` → submitTest
  - `GET /api/test/:id/result` → getTestResult
  - `GET /api/test/results/my-results` → getMyResults
  - `GET /api/test/statistics/me` → getMyStatistics
  - `GET /api/test/results/all` → getAllResults (admin)
  - `GET /api/test/results/student/:studentId` → getResultsByStudent (admin)

## Environment & Setup

Create `.env` in `client/`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Install and run:

```
npm install
npm run dev
```

## Key Files

- Services
  - `src/services/api.js` — Axios instance with interceptors
  - `src/services/authService.js` — login, register, me
  - `src/services/leaveService.js` — leave operations
  - `src/services/testService.js` — test operations and results
- Context & Components
  - `src/context/AuthContext.jsx` — auth state, persistence, bootstrap
  - `src/components/ProtectedRoute.jsx` — role-based guard
  - `src/components/Layout.jsx` — navigation shell + logout
- Pages
  - `src/pages/LoginPage.jsx` — email/password login, redirects by role
  - `src/pages/StudentDashboard.jsx` — summary and quick actions
  - `src/pages/ApplyLeavePage.jsx` — leave application form
  - `src/pages/MyLeavesPage.jsx` — list leaves, take test if assigned
  - `src/pages/TakeTestPage.jsx` — render MCQs and coding inputs and submit
  - `src/pages/TestResultPage.jsx` — show scoring and leave status
  - `src/pages/MyResultsPage.jsx` — history + stats
  - `src/pages/AdminDashboard.jsx` — pending and assigned leaves
  - `src/pages/LeaveReviewPage.jsx` — build MCQ + coding test for a leave
  - `src/pages/AdminResultsPage.jsx` — all results + filter by student

## Styling

Minimal global styles live in `src/styles/index.css`. Classes used across the app:
- Layout: `app-shell`, `app-header`, `app-main`, `brand`, `nav`, `nav-link`, `user-box`
- UI: `card`, `form`, `btn`, `btn ghost`, `grid`, `tile`, `list`, `list-item`, `badge`, `status-*`, `error`, `muted`

## Security Considerations

- JWT stored in localStorage for simplicity (academically suitable). Interceptors attach token for each request.
- Route guards enforce role-based access.
- No frontend attempt to execute code; coding test submission sends outputs as text.

## Extensibility

- Swap localStorage with cookies or memory storage.
- Add pagination to lists.
- Enhance admin workflows (bulk approvals, richer filters).
- Improve styling with a design system if needed.

## Testing Tips

- Verify login redirects by role.
- Student: apply leave → see `test_assigned` after admin creates test → take test → view result.
- Admin: review pending leaves → create tests → monitor results.
