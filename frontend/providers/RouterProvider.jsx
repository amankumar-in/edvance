import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import App from "../src/App";
import Login from "../src/pages/auth/Login";
import ForgotPassword from "../src/pages/auth/ForgotPassword";
import RoleSelection from "../src/pages/auth/RoleSelection";
import Register from "../src/pages/auth/Register.jsx";
import AuthLayout from "../src/pages/auth/AuthLayout";
import ResetPassword from "../src/pages/auth/ResetPassword";
import EmailVerification from "../src/pages/auth/EmailVerification";
import CreateProfile from "../src/pages/profile/CreateProfile";
import ProtectedRoute from "../src/components/ProtectedRoute";
import Dashboard from "../src/pages/dashboard/Dashboard";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="role-selection" element={<RoleSelection />} />
        <Route path="email-verification" element={<EmailVerification />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile/create" element={<CreateProfile />} />
      </Route>

      {/* Fallback */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Route>
  )
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
