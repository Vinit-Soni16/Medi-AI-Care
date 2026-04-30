import { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/layout/Layout';
import Spinner from '@/components/ui/Spinner';

// Lazy-loaded pages for code-splitting
const Landing      = lazy(() => import('@/pages/Landing'));
const Login        = lazy(() => import('@/pages/Login'));
const Register     = lazy(() => import('@/pages/Register'));
const Dashboard    = lazy(() => import('@/pages/Dashboard'));
const Chat         = lazy(() => import('@/pages/Chat'));
const Digitizer    = lazy(() => import('@/pages/Digitizer'));
const Appointments = lazy(() => import('@/pages/Appointments'));
const Analytics    = lazy(() => import('@/pages/Analytics'));
const Profile      = lazy(() => import('@/pages/Profile'));
const AdminPanel   = lazy(() => import('@/pages/AdminPanel'));
const NotFound     = lazy(() => import('@/pages/NotFound'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-3 text-sm text-slate-500 font-medium">Loading MediAI Care...</p>
    </div>
  </div>
);

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuthStore();
  if (token && user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes – wrapped in Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/chat"         element={<Chat />} />
          <Route path="/digitizer"    element={<Digitizer />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/analytics"    element={<Analytics />} />
          <Route path="/profile"      element={<Profile />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
