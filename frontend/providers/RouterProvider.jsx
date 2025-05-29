import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router";
import { lazy, Suspense } from "react";
import App from "../src/App";
import { ProtectedLayout, ProtectedRoute, PublicRoute } from '../src/components';

// Lazy load all components to prevent loading everything at once
const AuthLayout = lazy(() => import("../src/pages/auth/AuthLayout"));
const CreateParentProfile = lazy(() => import("../src/pages/parent/CreateParentProfile"));
const CreateSocialWorkerProfile = lazy(() => import("../src/pages/social-worker/CreateSocialWorkerProfile"));
const CreateStudentProfile = lazy(() => import("../src/pages/student/CreateStudentProfile"));
const CreateTeacherProfile = lazy(() => import("../src/pages/teacher/CreateTeacherProfile"));
const EmailVerification = lazy(() => import("../src/pages/auth/EmailVerification"));
const ForgotPassword = lazy(() => import("../src/pages/auth/ForgotPassword"));
const Home = lazy(() => import("../src/pages/Home"));
const Login = lazy(() => import("../src/pages/auth/Login"));
const NotFound = lazy(() => import("../src/pages/NotFound"));
const ParentDashboard = lazy(() => import("../src/pages/parent/ParentDashboard"));
const Register = lazy(() => import("../src/pages/auth/Register"));
const ResetPassword = lazy(() => import("../src/pages/auth/ResetPassword"));
const RoleSelection = lazy(() => import("../src/pages/auth/RoleSelection"));
const SelectProfile = lazy(() => import("../src/pages/auth/SelectProfile"));
const SocialWorkerDashboard = lazy(() => import("../src/pages/social-worker/SocialWorkerDashboard"));
const StudentDashboard = lazy(() => import("../src/pages/student/StudentDashboard"));
const TeacherDashboard = lazy(() => import("../src/pages/teacher/TeacherDashboard"));

const ParentLinkedAccounts = lazy(() => import("../src/pages/parent/settings/LinkedAccounts"));
const Overview = lazy(() => import("../src/pages/platform-admin/Overview"));
const Parents = lazy(() => import("../src/pages/platform-admin/tabs/Parents"));
const PlatformAdminDashboardLayout = lazy(() => import("../src/pages/platform-admin/PlatformAdminDashboardLayout"));
const SchoolAdmins = lazy(() => import("../src/pages/platform-admin/tabs/SchoolAdmins"));
const SocialWorkers = lazy(() => import("../src/pages/platform-admin/tabs/SocialWorkers"));
const Students = lazy(() => import("../src/pages/platform-admin/tabs/Students"));
const Teachers = lazy(() => import("../src/pages/platform-admin/tabs/Teachers"));
const UserDetails = lazy(() => import("../src/pages/platform-admin/UserDetails"));
const Users = lazy(() => import("../src/pages/platform-admin/Users"));
const CreateTask = lazy(() => import("../src/pages/platform-admin/CreateTask"));
const EditTask = lazy(() => import("../src/pages/platform-admin/EditTask"));
const TaskHelp = lazy(() => import("../src/pages/platform-admin/TaskHelp"));
const Tasks = lazy(() => import("../src/pages/platform-admin/Tasks"));
const Categories = lazy(() => import("../src/pages/platform-admin/Categories"));
const JoinRequests = lazy(() => import("../src/pages/school-admin/JoinRequests"));
const SchoolAdminDashboard = lazy(() => import("../src/pages/school-admin/SchoolAdminDashboard"));
const SchoolAdminDashboardLayout = lazy(() => import("../src/pages/school-admin/SchoolAdminDashboardLayout"));
const SettingsLayout = lazy(() => import("../src/pages/SettingsLayout"));
const StudentLinkedAccounts = lazy(() => import("../src/pages/student/settings/LinkedAccounts"));
const StudentTaskHomepage = lazy(() => import("../src/pages/student/TaskHomepage"));
const ParentTaskHomepage = lazy(() => import("../src/pages/parent/TaskHomepage"));
const TestTaskHomepage = lazy(() => import("../src/pages/TestTaskHomepage"));

// Loading component
const LoadingFallback = () => <div className="flex items-center justify-center h-32">Loading...</div>;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<Suspense fallback={<LoadingFallback />}><AuthLayout /></Suspense>}>
          <Route path="login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
          <Route path="forgot-password" element={<Suspense fallback={<LoadingFallback />}><ForgotPassword /></Suspense>} />
          <Route path="reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense>} />
          <Route path="role-selection" element={<Suspense fallback={<LoadingFallback />}><RoleSelection /></Suspense>} />
          <Route path="email-verification" element={<Suspense fallback={<LoadingFallback />}><EmailVerification /></Suspense>} />
          <Route path="register" element={<Suspense fallback={<LoadingFallback />}><Register /></Suspense>} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />
          <Route path="select-profile" element={<Suspense fallback={<LoadingFallback />}><SelectProfile /></Suspense>} />
          <Route path="parent" >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><ParentDashboard /></Suspense>} />
            <Route path="tasks" element={<Suspense fallback={<LoadingFallback />}><ParentTaskHomepage /></Suspense>} />
            <Route path="create-profile" element={<Suspense fallback={<LoadingFallback />}><CreateParentProfile /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><SettingsLayout /></Suspense>} >
              <Route index element={<Navigate to="linked-accounts" replace />} />
              <Route path="linked-accounts" element={<Suspense fallback={<LoadingFallback />}><ParentLinkedAccounts /></Suspense>} />
            </Route>
          </Route>
          <Route path="social-worker">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><SocialWorkerDashboard /></Suspense>} />
            <Route path="create-profile" element={<Suspense fallback={<LoadingFallback />}><CreateSocialWorkerProfile /></Suspense>} />
          </Route>
          <Route path="student" >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><StudentDashboard /></Suspense>} />
            <Route path="tasks" element={<Suspense fallback={<LoadingFallback />}><StudentTaskHomepage /></Suspense>} />
            <Route path="create-profile" element={<Suspense fallback={<LoadingFallback />}><CreateStudentProfile /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><SettingsLayout /></Suspense>} >
              <Route index element={<Navigate to="linked-accounts" replace />} />
              <Route path="linked-accounts" element={<Suspense fallback={<LoadingFallback />}><StudentLinkedAccounts /></Suspense>} />
            </Route>
          </Route>
          <Route path="teacher" >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><TeacherDashboard /></Suspense>} />
            <Route path="create-profile" element={<Suspense fallback={<LoadingFallback />}><CreateTeacherProfile /></Suspense>} />
          </Route>
          {/* Test route for new task components */}
          <Route path="test-tasks" element={<Suspense fallback={<LoadingFallback />}><TestTaskHomepage /></Suspense>} />
        </Route>
        <Route path="school-admin">
          <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><SchoolAdminDashboardLayout /></Suspense>}>
            <Route index element={<Suspense fallback={<LoadingFallback />}><SchoolAdminDashboard /></Suspense>} />
            <Route path="join-requests" element={<Suspense fallback={<LoadingFallback />}><JoinRequests /></Suspense>} />
          </Route>
        </Route>
        <Route path="platform-admin">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><PlatformAdminDashboardLayout /></Suspense>} >
            <Route index element={<Suspense fallback={<LoadingFallback />}><Overview /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<LoadingFallback />}><Users /></Suspense>} >
              <Route index element={<Navigate to="students" replace />} />
              <Route path="students" element={<Suspense fallback={<LoadingFallback />}><Students /></Suspense>} />
              <Route path="teachers" element={<Suspense fallback={<LoadingFallback />}><Teachers /></Suspense>} />
              <Route path="parents" element={<Suspense fallback={<LoadingFallback />}><Parents /></Suspense>} />
              <Route path="social-workers" element={<Suspense fallback={<LoadingFallback />}><SocialWorkers /></Suspense>} />
              <Route path="school-admins" element={<Suspense fallback={<LoadingFallback />}><SchoolAdmins /></Suspense>} />
            </Route>
            <Route path="tasks" element={<Suspense fallback={<LoadingFallback />}><Tasks /></Suspense>} />
            <Route path="tasks/create" element={<Suspense fallback={<LoadingFallback />}><CreateTask /></Suspense>} />
            <Route path="tasks/edit/:id" element={<Suspense fallback={<LoadingFallback />}><EditTask /></Suspense>} />
            <Route path="tasks/help" element={<Suspense fallback={<LoadingFallback />}><TaskHelp /></Suspense>} />
            <Route path="categories" element={<Suspense fallback={<LoadingFallback />}><Categories /></Suspense>} />
            <Route path="users/user/:id" element={<Suspense fallback={<LoadingFallback />}><UserDetails /></Suspense>} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
    </Route>
  )
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
