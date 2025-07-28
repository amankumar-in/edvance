import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router";
import App from "../src/App";
import { ErrorBoundaryWrapper, ProtectedLayout, ProtectedRoute, PublicRoute } from '../src/components';
import { AuthLayout, CreateParentProfile, CreateSocialWorkerProfile, CreateStudentProfile, CreateTeacherProfile, EmailVerification, ForgotPassword, Home, Login, NotFound, ParentDashboard, Register, ResetPassword, RoleSelection, SelectProfile, SocialWorkerDashboard, TeacherDashboard, } from "../src/pages";
import { ParentChildren, ParentClaims, CreateTask as ParentCreateTask, ParentLayout, ParentTasks, PendingRedemptions } from "../src/pages/parent";
import CreateParentReward from "../src/pages/parent/CreateReward";
import ParentRewards from "../src/pages/parent/ParentRewards";
import ParentLinkedAccounts from "../src/pages/parent/settings/LinkedAccounts";
import TaskDetails from "../src/pages/parent/TaskDetails";
import { CreateEditCategory, CreateReward, CreateRewardCategory, CreateTask, Overview, Parents, PlatformAdminDashboardLayout, RewardCategories, RewardRedemptions, Rewards, ScholarshipPoints, SchoolAdmins, SocialWorkers, Students, TaskCategories, Tasks, Teachers, UserDetails, Users } from "../src/pages/platform-admin";
import { ClassAttendance, ClassDetails, ClassOverview, ClassStudents, EditSchoolProfile, JoinRequests, SchoolAdminDashboard, SchoolAdminDashboardLayout, Administrators as SchoolAdministrators, Classes as SchoolClasses, SchoolProfile, Students as SchoolStudents, Teachers as SchoolTeachers, SchoolTasks, SchoolRewards, CreateTask as SchoolCreateTask, CreateSchoolReward, TaskClaims, SchoolRewardRedemption } from "../src/pages/school-admin";
import SettingsLayout from "../src/pages/SettingsLayout";
import StudentLinkedAccounts from "../src/pages/student/settings/LinkedAccounts";
import NotificationSettings from "../src/pages/student/settings/NotificationSettings";
import StudentAttendance from "../src/pages/student/StudentAttendance";
import StudentDashboard from "../src/pages/student/StudentDashboard";
import StudentLayout from "../src/pages/student/StudentLayout";
import StudentNotifications from "../src/pages/student/StudentNotifications";
import StudentPoints from "../src/pages/student/StudentPoints";
import StudentRedemptionHistory from "../src/pages/student/StudentRedemptionHistory";
import StudentRewards from "../src/pages/student/StudentRewards";
import StudentTaskDetail from "../src/pages/student/StudentTaskDetail";
import StudentTasks from "../src/pages/student/StudentTasks";
import StudentAttendanceBasePage from "../src/pages/student/StudentAttendanceBasePage";
import { CreateEditTeacherReward, CreateTeacherTask, TeacherClasses, TeacherDashboardLayout, TeacherRewardRedemption, TeacherRewards, TeacherTaskClaims, TeacherTasks } from "../src/pages/teacher";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={
      <ErrorBoundaryWrapper>
        <App />
      </ErrorBoundaryWrapper>
    }>

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

          {/* Parent Routes */}
          <Route path="parent" >
            {/* <Route index element={<Navigate to="dashboard" replace />} /> */}
            <Route element={<ParentLayout />} >
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route path="tasks" element={<ParentTasks />} />
              <Route path="tasks/create" element={<ParentCreateTask />} />
              <Route path="tasks/edit/:id" element={<ParentCreateTask />} />
              <Route path="tasks/:id" element={<TaskDetails />} />
              <Route path="claims" element={<ParentClaims />} />
              <Route path="children" element={<ParentChildren />} />
              <Route path="rewards" element={<ParentRewards />} />
              <Route path="rewards/create" element={<CreateParentReward />} />
              <Route path="rewards/edit/:id" element={<CreateParentReward />} />
              <Route path="pending-redemptions" element={<PendingRedemptions />} />
            </Route>
            <Route path="create-profile" element={<CreateParentProfile />} />
            <Route path="settings" element={<SettingsLayout />} >
              <Route index element={<Navigate to="linked-accounts" replace />} />
              <Route path="linked-accounts" element={<ParentLinkedAccounts />} />
            </Route>
          </Route>
          <Route path="social-worker">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SocialWorkerDashboard />} />
            <Route path="create-profile" element={<CreateSocialWorkerProfile />} />
          </Route>

          {/* Student Routes */}
          <Route path="student" >
            {/* <Route index element={<Navigate to="dashboard" replace />} /> */}
            <Route element={<StudentLayout />} >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="tasks" element={<StudentTasks />} />
              <Route path="tasks/:id" element={<StudentTaskDetail />} />
              <Route path="attendance" element={<StudentAttendanceBasePage />} />
              <Route path="attendance/:classId" element={<StudentAttendance />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="points" element={<StudentPoints />} />
              <Route path="rewards" element={<StudentRewards />} />
              <Route path="redemption-history" element={<StudentRedemptionHistory />} />
            </Route>
            <Route path="create-profile" element={<CreateStudentProfile />} />
            <Route path="settings" element={<SettingsLayout />} >
              <Route index element={<Navigate to="linked-accounts" replace />} />
              <Route path="linked-accounts" element={<StudentLinkedAccounts />} />
              <Route path="notifications" element={<NotificationSettings />} />
            </Route>
          </Route>
        </Route>

        {/* Teacher Routes */}
        <Route path="teacher" >
          <Route element={<TeacherDashboardLayout />} >
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="classes/:classId" element={<ClassDetails />} >
              <Route index element={<ClassOverview />} />
              <Route path="students" element={<ClassStudents />} />
              <Route path="attendance" element={<ClassAttendance />} />
            </Route>
            <Route path="tasks" element={<TeacherTasks />} />
            <Route path="tasks/create" element={<CreateTeacherTask />} />
            <Route path="tasks/edit/:id" element={<CreateTeacherTask />} />
            <Route path="claims" element={<TeacherTaskClaims />} />
            <Route path="rewards" element={<TeacherRewards />} />
            <Route path="rewards/create" element={<CreateEditTeacherReward />} />
            <Route path="rewards/edit/:id" element={<CreateEditTeacherReward />} />
            <Route path="reward-redemption" element={<TeacherRewardRedemption />} />
          </Route>
            <Route path="create-profile" element={<CreateTeacherProfile />} />
        </Route>

        {/* School Admin Routes */}
        <Route path="school-admin">
          <Route element={<SchoolAdminDashboardLayout />}>
            <Route path="dashboard" element={<SchoolAdminDashboard />} />
            <Route path="join-requests" element={<JoinRequests />} />
            <Route path="profile" element={<SchoolProfile />} />
            <Route path="school/edit" element={<EditSchoolProfile />} />
            <Route path="school/create" element={<EditSchoolProfile />} />
            <Route path="students" element={<SchoolStudents />} />
            <Route path="teachers" element={<SchoolTeachers />} />
            <Route path="classes" element={<SchoolClasses />} />
            <Route path="classes/:classId" element={<ClassDetails />} >
              <Route index element={<ClassOverview />} />
              <Route path="students" element={<ClassStudents />} />
              <Route path="attendance" element={<ClassAttendance />} />
            </Route>
            <Route path="administrators" element={<SchoolAdministrators />} />
            <Route path="tasks" element={<SchoolTasks />} />
            <Route path="tasks/create" element={<SchoolCreateTask />} />
            <Route path="tasks/edit/:id" element={<SchoolCreateTask />} />
            <Route path="rewards" element={<SchoolRewards />} />
            <Route path="rewards/create" element={<CreateSchoolReward />} />
            <Route path="rewards/edit/:id" element={<CreateSchoolReward />} />
            <Route path="claims" element={<TaskClaims />} />
            <Route path="reward-redemption" element={<SchoolRewardRedemption />} />
          </Route>
        </Route>

        {/* Platform Admin Routes */}
        <Route path="platform-admin">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PlatformAdminDashboardLayout />} >
            <Route index element={<Overview />} />
            <Route path="users" element={<Users />} >
              <Route index element={<Navigate to="students" replace />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="parents" element={<Parents />} />
              <Route path="social-workers" element={<SocialWorkers />} />
              <Route path="school-admins" element={<SchoolAdmins />} />
            </Route>
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/create" element={<CreateTask />} />
            <Route path="tasks/edit/:id" element={<CreateTask />} />
            <Route path="task-categories" element={<TaskCategories />} />
            <Route path="task-categories/create" element={<CreateEditCategory />} />
            <Route path="task-categories/edit/:id" element={<CreateEditCategory />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="rewards/create" element={<CreateReward />} />
            <Route path="reward-categories" element={<RewardCategories />} />
            <Route path="reward-categories/create" element={<CreateRewardCategory />} />
            <Route path="reward-categories/edit/:id" element={<CreateRewardCategory />} />
            <Route path="reward-redemptions" element={<RewardRedemptions />} />
            <Route path="scholarship-points" element={<ScholarshipPoints />} />
            <Route path="users/user/:id" element={<UserDetails />} />
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
