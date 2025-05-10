import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router";
import App from "../src/App";
import { ProtectedLayout, ProtectedRoute, PublicRoute } from '../src/components';
import { AuthLayout, CreateParentProfile, CreateSocialWorkerProfile, CreateStudentProfile, CreateTeacherProfile, EmailVerification, ForgotPassword, Home, Login, NotFound, ParentDashboard, Register, ResetPassword, RoleSelection, SchoolAdminDashboard, SelectProfile, SocialWorkerDashboard, StudentDashboard, TeacherDashboard } from "../src/pages";
import { Overview, PlatformAdminDashboardLayout, Users } from "../src/pages/platform-admin";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="role-selection" element={<RoleSelection />} />
          <Route path="email-verification" element={<EmailVerification />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="select-profile" element={<SelectProfile />} />
          <Route path="parent" >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="create-profile" element={<CreateParentProfile />} />
          </Route>
          <Route path="school-admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SchoolAdminDashboard />} />
          </Route>
          <Route path="social-worker">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SocialWorkerDashboard />} />
            <Route path="create-profile" element={<CreateSocialWorkerProfile />} />
          </Route>
          <Route path="student" >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="create-profile" element={<CreateStudentProfile />} />
          </Route>
          <Route path="teacher" >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="create-profile" element={<CreateTeacherProfile />} />
          </Route>
        </Route>
        <Route path="platform-admin">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PlatformAdminDashboardLayout />} >
            <Route index element={<Overview />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
