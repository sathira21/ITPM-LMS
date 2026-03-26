import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import TeacherDashboard from './pages/Dashboard/TeacherDashboard';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import GuardianDashboard from './pages/Dashboard/GuardianDashboard';
import UserList from './pages/Users/UserList';
import UserForm from './pages/Users/UserForm';
import GuardianLinks from './pages/Guardians/GuardianLinks';
import ReportList from './pages/Reports/ReportList';
import ReportView from './pages/Reports/ReportView';
import ReportForm from './pages/Reports/ReportForm';
import GroupList from './pages/Groups/GroupList';
import GroupDetail from './pages/Groups/GroupDetail';
import ActivityLog from './pages/Activity/ActivityLog';
import MaterialsPage from './pages/Materials/MaterialsPage';
import FeedbackPage from './pages/Feedback/FeedbackPage';
import QuizPage from './pages/Quiz/QuizPage';
import ProgressDashboard from './pages/Progress/ProgressDashboard';
import CoursesPage from './pages/Courses/CoursesPage';
import SupportTicketPage from './pages/SupportTickets/SupportTicketPage';

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'admin')    return <AdminDashboard />;
  if (user.role === 'teacher')  return <TeacherDashboard />;
  if (user.role === 'student')  return <StudentDashboard />;
  if (user.role === 'guardian') return <GuardianDashboard />;
  return <Navigate to="/" replace />;
};

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Loading...</p>
    </div>
  </div>
);

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-purple-700">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-semibold text-lg">eduCare LMS</p>
      </div>
    </div>
  );

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Protected app routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardRouter />} />
        <Route path="users"           element={<ProtectedRoute roles={['admin']}><UserList /></ProtectedRoute>} />
        <Route path="users/new"       element={<ProtectedRoute roles={['admin']}><UserForm /></ProtectedRoute>} />
        <Route path="users/:id/edit"  element={<ProtectedRoute roles={['admin']}><UserForm /></ProtectedRoute>} />
        <Route path="guardians"       element={<ProtectedRoute roles={['admin','teacher']}><GuardianLinks /></ProtectedRoute>} />
        <Route path="reports"         element={<ProtectedRoute><ReportList /></ProtectedRoute>} />
        <Route path="reports/new"     element={<ProtectedRoute roles={['admin','teacher']}><ReportForm /></ProtectedRoute>} />
        <Route path="reports/:id"     element={<ProtectedRoute><ReportView /></ProtectedRoute>} />
        <Route path="groups"          element={<ProtectedRoute><GroupList /></ProtectedRoute>} />
        <Route path="groups/:id"      element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
        <Route path="activity"        element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
        <Route path="materials"       element={<ProtectedRoute><MaterialsPage /></ProtectedRoute>} />
        <Route path="progress"        element={<ProtectedRoute roles={['admin','teacher']}><ProgressDashboard /></ProtectedRoute>} />
        <Route path="courses"         element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
        <Route path="feedback"        element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
        <Route path="quiz"            element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="support-tickets" element={<ProtectedRoute roles={['admin','student']}><SupportTicketPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
