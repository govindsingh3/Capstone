import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import AppLayout from "../layouts/AppLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { canRoleAccessPath } from "../shared/auth/roleAccess.js";

const Login = lazy(() => import("../pages/Login.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage.jsx"));
const InstitutionPage = lazy(() => import("../features/institution/InstitutionPage.jsx"));
const SimulationLabPage = lazy(() => import("../features/simulation/SimulationLabPage.jsx"));
const AIInsightsPage = lazy(() => import("../features/insights/AIInsightsPage.jsx"));
const LearningCenterPage = lazy(() => import("../features/learning/LearningCenterPage.jsx"));
const ReportsPage = lazy(() => import("../features/reports/ReportsPage.jsx"));

const RouteLoader = () => (
  <div className="glass-card grid min-h-[220px] place-items-center p-6 text-sm text-muted">Loading module...</div>
);

const LazyRoute = ({ children }) => <Suspense fallback={<RouteLoader />}>{children}</Suspense>;

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const RoleRoute = ({ children, path }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!canRoleAccessPath(user.role, path)) return <Navigate to="/" replace />;
  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <LazyRoute>
      <DashboardPage />
    </LazyRoute>
  );
};

export const AppRoutes = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route
        path="/login"
        element={
          <LazyRoute>
            <Login />
          </LazyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <LazyRoute>
            <Register />
          </LazyRoute>
        }
      />
    </Route>

    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route
        path="/"
        element={
          <RoleRoute path="/">
            <DashboardRouter />
          </RoleRoute>
        }
      />
      <Route
        path="/institution"
        element={
          <RoleRoute path="/institution">
            <LazyRoute>
              <InstitutionPage />
            </LazyRoute>
          </RoleRoute>
        }
      />
      <Route
        path="/simulation"
        element={
          <RoleRoute path="/simulation">
            <LazyRoute>
              <SimulationLabPage />
            </LazyRoute>
          </RoleRoute>
        }
      />
      <Route
        path="/ai-insights"
        element={
          <RoleRoute path="/ai-insights">
            <LazyRoute>
              <AIInsightsPage />
            </LazyRoute>
          </RoleRoute>
        }
      />
      <Route
        path="/learning"
        element={
          <RoleRoute path="/learning">
            <LazyRoute>
              <LearningCenterPage />
            </LazyRoute>
          </RoleRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <RoleRoute path="/reports">
            <LazyRoute>
              <ReportsPage />
            </LazyRoute>
          </RoleRoute>
        }
      />
    </Route>
  </Routes>
);
