import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Dashboard from "../pages/Dashboard/Dashboard";
import Tasks from "../pages/Tasks/Tasks";
import Workers from "../pages/Workers/Workers";
import Verifications from "../pages/Verifications/Verifications";
import Escrow from "../pages/Escrow/Escrow";
import Transactions from "../pages/Transactions/Transactions";
import Reports from "../pages/Reports/Reports";
import ReportDetail from "../pages/Reports/ReportDetail";
import Settings from "../pages/Settings/Settings";
import Profile from "../pages/Profile/Profile";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import { useAuth } from "../context/AuthContext";
import { LoadingSkeleton } from "../components/shared/DataState";

function GuestOnly({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth();
  if (bootstrapping) {
    return (
      <div className="w-full max-w-md">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestOnly>
              <Signup />
            </GuestOnly>
          }
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/verifications" element={<Verifications />} />
          <Route path="/escrow" element={<Escrow />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:taskId" element={<ReportDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
