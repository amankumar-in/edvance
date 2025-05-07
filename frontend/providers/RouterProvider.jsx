import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";
import App from "../src/App";
import { ParentRoutes, PlatformAdminRoutes, SchoolAdminRoutes, SocialWorkerRoutes, StudentRoutes, TeacherRoutes } from '../src/routes'
import { AuthLayout, EmailVerification, ForgotPassword, Home, Login, NotFound, Register, ResetPassword, RoleSelection, SelectProfile } from "../src/pages";
import { ProtectedLayout, ProtectedRoute, PublicRoute } from '../src/components'

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
          <Route path="parent/*" element={<ParentRoutes />} />
          <Route path="platform-admin/*" element={<PlatformAdminRoutes />} />
          <Route path="school-admin/*" element={<SchoolAdminRoutes />} />
          <Route path="social-worker/*" element={<SocialWorkerRoutes />} />
          <Route path="student/*" element={<StudentRoutes />} />
          <Route path="teacher/*" element={<TeacherRoutes />} />
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
