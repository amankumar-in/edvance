import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router";
import App from "../App";
import ErrorBoundaryWrapper from "../components/ErrorBoundaryWrapper";
import ProtectedLayout from "../components/ProtectedLayout";
import AuthLayout from "../pages/auth/AuthLayout";
import EmailVerification from '../pages/auth/EmailVerification'
import ForgotPassword from "../pages/auth/ForgotPassword";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import NotFound from "../pages/NotFound";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import RoleSelection from "../pages/auth/RoleSelection";
import SelectProfile from "../pages/auth/SelectProfile";
import ParentLayout from "../pages/parent/ParentLayout";
import PlatformAdminDashboardLayout from "../pages/platform-admin/PlatformAdminDashboardLayout";
import ProtectedRoute, { RoleBasedRedirect } from "../pages/ProtectedRoute";
import SchoolAdminDashboardLayout from "../pages/school-admin/SchoolAdminDashboardLayout";
import SettingsLayout from "../pages/SettingsLayout";
import StudentLayout from "../pages/student/StudentLayout";
import TeacherDashboardLayout from "../pages/teacher/TeacherDashboardLayout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <ErrorBoundaryWrapper>
          <App />
        </ErrorBoundaryWrapper>
      }
    >

      {/* Public Routes */}
      <Route element={<RoleBasedRedirect />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="role-selection" element={<RoleSelection />} />
          <Route path="email-verification" element={<EmailVerification />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="/" element={<Home />} />
      </Route>

      {/* TODO: Protect <SelectProfile /> route — allow access only post-login if user has multiple roles to choose from */}
      <Route path="select-profile" element={<SelectProfile />} />

      {/* Parent Routes */}
      <Route path="parent" element={<ProtectedRoute allowedRole='parent' />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route element={<ProtectedLayout />}>
          <Route element={<ParentLayout />} >
            <Route path="dashboard"
              lazy={() => import("../pages/parent/ParentDashboard")
                .then(({ default: ParentDashboard }) => ({ Component: ParentDashboard, }))}
            />
            <Route path="tasks"
              lazy={() => import("../pages/parent/ParentTasks")
                .then(({ default: ParentTasks }) => ({ Component: ParentTasks, }))}
            />
            <Route path="tasks/create"
              lazy={() => import("../pages/parent/CreateTask")
                .then(({ default: CreateTask }) => ({ Component: CreateTask, }))}
            />
            <Route path="tasks/edit/:id"
              lazy={() => import("../pages/parent/CreateTask")
                .then(({ default: CreateTask }) => ({ Component: CreateTask, }))}
            />
            <Route path="tasks/:id"
              lazy={() => import("../pages/parent/TaskDetails")
                .then(({ default: TaskDetails }) => ({ Component: TaskDetails, }))}
            />
            <Route path="claims"
              lazy={() => import("../pages/parent/ParentClaims")
                .then(({ default: ParentClaims }) => ({ Component: ParentClaims, }))}
            />
            <Route path="children"
              lazy={() => import("../pages/parent/ParentChildren")
                .then(({ default: ParentChildren }) => ({ Component: ParentChildren, }))}
            />
            <Route path="rewards"
              lazy={() => import("../pages/parent/ParentRewards")
                .then(({ default: ParentRewards }) => ({ Component: ParentRewards, }))}
            />
            <Route path="rewards/create"
              lazy={() => import("../pages/parent/CreateReward")
                .then(({ default: CreateReward }) => ({ Component: CreateReward, }))}
            />
            <Route path="rewards/edit/:id"
              lazy={() => import("../pages/parent/CreateReward")
                .then(({ default: CreateReward }) => ({ Component: CreateReward, }))}
            />
            <Route path="pending-redemptions"
              lazy={() => import("../pages/parent/PendingRedemptions")
                .then(({ default: PendingRedemptions }) => ({ Component: PendingRedemptions, }))}
            />
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="linked-accounts" replace />} />
              <Route path="linked-accounts"
                lazy={() => import("../pages/parent/settings/LinkedAccounts")
                  .then(({ default: ParentLinkedAccounts }) => ({ Component: ParentLinkedAccounts, }))}
              />
            </Route>
          </Route>
          <Route path="create-profile"
            lazy={() => import("../pages/parent/CreateParentProfile")
              .then(({ default: CreateParentProfile }) => ({ Component: CreateParentProfile, }))}
          />
        </Route>
      </Route>

      {/* Social Worker Routes */}
      <Route path="social-worker" element={<ProtectedRoute allowedRole='social_worker' />}>
        <Route element={<Navigate to="dashboard" replace />} />
        <Route element={<ProtectedLayout />}>
          <Route index
            lazy={() => import("../pages/social-worker/SocialWorkerDashboard")
              .then(({ default: SocialWorkerDashboard }) => ({ Component: SocialWorkerDashboard, }))}
          />
          <Route path="dashboard"
            lazy={() => import("../pages/social-worker/SocialWorkerDashboard")
              .then(({ default: SocialWorkerDashboard }) => ({ Component: SocialWorkerDashboard, }))}
          />
          <Route path="create-profile"
            lazy={() => import("../pages/social-worker/CreateSocialWorkerProfile")
              .then(({ default: CreateSocialWorkerProfile }) => ({ Component: CreateSocialWorkerProfile, }))}
          />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route path="student" element={<ProtectedRoute allowedRole='student' />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route element={<ProtectedLayout />}>
          <Route element={<StudentLayout />} >
            {/* dashboard */}
            <Route path="dashboard"
              lazy={() => import("../pages/student/StudentDashboard")
                .then(({ default: StudentDashboard }) => ({ Component: StudentDashboard }))}
            />

            {/* tasks */}
            <Route path="tasks"
              lazy={() => import("../pages/student/StudentTasks")
                .then(({ default: StudentTasks }) => ({ Component: StudentTasks }))}
            />
            <Route path="tasks/:id"
              lazy={() => import("../pages/student/StudentTaskDetail")
                .then(({ default: StudentTaskDetail }) => ({ Component: StudentTaskDetail, }))}
            />

            {/* attendance */}
            <Route path="attendance"
              lazy={() => import("../pages/student/StudentAttendanceBasePage")
                .then(({ default: StudentAttendanceBasePage }) => ({ Component: StudentAttendanceBasePage, }))
              }
            />
            <Route path="attendance/:classId"
              lazy={() => import("../pages/student/StudentAttendance")
                .then(({ default: StudentAttendance }) => ({ Component: StudentAttendance, }))}
            />

            {/* notifications */}
            <Route path="notifications"
              lazy={() => import("../pages/student/StudentNotifications")
                .then(({ default: StudentNotifications }) => ({ Component: StudentNotifications, }))}
            />

            {/* points / rewards */}
            <Route path="points"
              lazy={() => import("../pages/student/StudentPoints")
                .then(({ default: StudentPoints }) => ({ Component: StudentPoints }))} />
            <Route path="rewards"
              lazy={() => import("../pages/student/StudentRewards")
                .then(({ default: StudentRewards }) => ({ Component: StudentRewards }))}
            />
            <Route path="redemption-history"
              lazy={() => import("../pages/student/StudentRedemptionHistory")
                .then(({ default: StudentRedemptionHistory }) => ({ Component: StudentRedemptionHistory, }))}
            />

            {/* settings nested routes */}
            <Route path="settings"
              lazy={() => import("../pages/SettingsLayout")
                .then(({ default: SettingsLayout }) => ({ Component: SettingsLayout }))}
            >
              <Route index element={<Navigate to="linked-accounts" replace />} />
              <Route path="linked-accounts"
                lazy={() => import("../pages/student/settings/LinkedAccounts")
                  .then(({ default: StudentLinkedAccounts }) => ({ Component: StudentLinkedAccounts, }))}
              />
              <Route path="notifications"
                lazy={() => import("../pages/student/settings/NotificationSettings")
                  .then(({ default: NotificationSettings }) => ({ Component: NotificationSettings, }))}
              />
            </Route>
          </Route>

          {/* create-profile stays outside StudentLayout */}
          <Route path="create-profile"
            lazy={() => import("../pages/student/CreateStudentProfile")
              .then(({ default: CreateStudentProfile }) => ({ Component: CreateStudentProfile }))}
          />
        </Route>
      </Route>

      {/* Teacher Routes */}
      <Route path="teacher" element={<ProtectedRoute allowedRole='teacher' />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route element={<TeacherDashboardLayout />} >
          <Route path="dashboard"
            lazy={() => import("../pages/teacher/TeacherDashboard")
              .then(({ default: TeacherDashboard }) => ({ Component: TeacherDashboard, }))}
          />
          <Route path="classes"
            lazy={() => import("../pages/teacher/TeacherClasses")
              .then(({ default: TeacherClasses }) => ({ Component: TeacherClasses, }))}
          />
          <Route path="classes/:classId"
            lazy={() => import("../pages/school-admin/ClassDetails")
              .then(({ default: ClassDetails }) => ({ Component: ClassDetails, }))}
          >
            <Route index
              lazy={() => import("../pages/school-admin/class-details/Overview")
                .then(({ default: ClassOverview }) => ({ Component: ClassOverview, }))}
            />
            <Route path="students"
              lazy={() => import("../pages/school-admin/class-details/Students")
                .then(({ default: ClassStudents }) => ({ Component: ClassStudents, }))}
            />
            <Route path="attendance"
              lazy={() => import("../pages/school-admin/class-details/Attendance")
                .then(({ default: ClassAttendance }) => ({ Component: ClassAttendance, }))}
            />
          </Route>
          <Route path="tasks"
            lazy={() => import("../pages/teacher/Tasks")
              .then(({ default: TeacherTasks }) => ({ Component: TeacherTasks, }))}
          />
          <Route path="tasks/create"
            lazy={() => import("../pages/teacher/CreateTask")
              .then(({ default: CreateTeacherTask }) => ({ Component: CreateTeacherTask, }))}
          />
          <Route path="tasks/edit/:id"
            lazy={() => import("../pages/teacher/CreateTask")
              .then(({ default: CreateTeacherTask }) => ({ Component: CreateTeacherTask, }))}
          />
          <Route path="claims"
            lazy={() => import("../pages/teacher/TaskClaims")
              .then(({ default: TeacherTaskClaims }) => ({ Component: TeacherTaskClaims, }))}
          />
          <Route path="rewards"
            lazy={() => import("../pages/teacher/Rewards")
              .then(({ default: TeacherRewards }) => ({ Component: TeacherRewards, }))}
          />
          <Route path="rewards/create"
            lazy={() => import("../pages/teacher/CreateEditReward")
              .then(({ default: CreateEditTeacherReward }) => ({ Component: CreateEditTeacherReward, }))}
          />
          <Route path="rewards/edit/:id"
            lazy={() => import("../pages/teacher/CreateEditReward")
              .then(({ default: CreateEditTeacherReward }) => ({ Component: CreateEditTeacherReward, }))}
          />
          <Route path="reward-redemption"
            lazy={() => import("../pages/teacher/RewardRedemption")
              .then(({ default: TeacherRewardRedemption }) => ({ Component: TeacherRewardRedemption, }))}
          />
        </Route>
        <Route path="create-profile"
          lazy={() => import("../pages/teacher/CreateTeacherProfile")
            .then(({ default: CreateTeacherProfile }) => ({ Component: CreateTeacherProfile, }))}
        />
      </Route>

      {/* School Admin Routes */}
      <Route path="school-admin" element={<ProtectedRoute allowedRole='school_admin' />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route element={<SchoolAdminDashboardLayout />}>
          <Route path="dashboard"
            lazy={() => import("../pages/school-admin/SchoolAdminDashboard")
              .then(({ default: SchoolAdminDashboard }) => ({ Component: SchoolAdminDashboard, }))}
          />
          <Route path="join-requests"
            lazy={() => import("../pages/school-admin/JoinRequests")
              .then(({ default: JoinRequests }) => ({ Component: JoinRequests, }))}
          />
          <Route path="profile"
            lazy={() => import("../pages/school-admin/SchoolProfile")
              .then(({ default: SchoolProfile }) => ({ Component: SchoolProfile, }))}
          />
          <Route path="school/edit"
            lazy={() => import("../pages/school-admin/EditSchoolProfile")
              .then(({ default: EditSchoolProfile }) => ({ Component: EditSchoolProfile, }))}
          />
          <Route path="school/create"
            lazy={() => import("../pages/school-admin/EditSchoolProfile")
              .then(({ default: EditSchoolProfile }) => ({ Component: EditSchoolProfile, }))}
          />
          <Route path="students"
            lazy={() => import("../pages/school-admin/Students")
              .then(({ default: SchoolStudents }) => ({ Component: SchoolStudents, }))}
          />
          <Route path="teachers"
            lazy={() => import("../pages/school-admin/Teachers")
              .then(({ default: SchoolTeachers }) => ({ Component: SchoolTeachers, }))}
          />
          <Route path="classes"
            lazy={() => import("../pages/school-admin/Classes")
              .then(({ default: SchoolClasses }) => ({ Component: SchoolClasses, }))}
          />
          <Route path="classes/:classId"
            lazy={() => import("../pages/school-admin/ClassDetails")
              .then(({ default: ClassDetails }) => ({ Component: ClassDetails, }))}
          >
            <Route index
              lazy={() => import("../pages/school-admin/class-details/Overview")
                .then(({ default: ClassOverview }) => ({ Component: ClassOverview, }))}
            />
            <Route path="students"
              lazy={() => import("../pages/school-admin/class-details/Students")
                .then(({ default: ClassStudents }) => ({ Component: ClassStudents, }))}
            />
            <Route path="attendance"
              lazy={() => import("../pages/school-admin/class-details/Attendance")
                .then(({ default: ClassAttendance }) => ({ Component: ClassAttendance, }))}
            />
          </Route>
          <Route path="administrators"
            lazy={() => import("../pages/school-admin/Administrators")
              .then(({ default: SchoolAdministrators }) => ({ Component: SchoolAdministrators, }))}
          />
          <Route path="tasks"
            lazy={() => import("../pages/school-admin/Tasks")
              .then(({ default: SchoolTasks }) => ({ Component: SchoolTasks, }))}
          />
          <Route path="tasks/create"
            lazy={() => import("../pages/school-admin/CreateTask")
              .then(({ default: SchoolCreateTask }) => ({ Component: SchoolCreateTask, }))}
          />
          <Route path="tasks/edit/:id"
            lazy={() => import("../pages/school-admin/CreateTask")
              .then(({ default: SchoolCreateTask }) => ({ Component: SchoolCreateTask, }))}
          />
          <Route path="rewards"
            lazy={() => import("../pages/school-admin/Rewards")
              .then(({ default: SchoolRewards }) => ({ Component: SchoolRewards, }))}
          />
          <Route path="rewards/create"
            lazy={() => import("../pages/school-admin/CreateEditRewards")
              .then(({ default: CreateSchoolReward }) => ({ Component: CreateSchoolReward, }))}
          />
          <Route path="rewards/edit/:id"
            lazy={() => import("../pages/school-admin/CreateEditRewards")
              .then(({ default: CreateSchoolReward }) => ({ Component: CreateSchoolReward, }))}
          />
          <Route path="claims"
            lazy={() => import("../pages/school-admin/TaskClaims")
              .then(({ default: TaskClaims }) => ({ Component: TaskClaims, }))}
          />
          <Route path="reward-redemption"
            lazy={() => import("../pages/school-admin/RewardRedemption")
              .then(({ default: SchoolRewardRedemption }) => ({ Component: SchoolRewardRedemption, }))}
          />
        </Route>
      </Route>

      {/* Platform Admin Routes */}
      <Route path="platform-admin" element={<ProtectedRoute allowedRole='platform_admin' />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PlatformAdminDashboardLayout />} >
          <Route index
            lazy={() => import("../pages/platform-admin/Overview")
              .then(({ default: Overview }) => ({ Component: Overview, }))}
          />
          <Route path="users"
            lazy={() => import("../pages/platform-admin/Users")
              .then(({ default: Users }) => ({ Component: Users, }))}
          >
            <Route index element={<Navigate to="students" replace />} />
            <Route path="students"
              lazy={() => import("../pages/platform-admin/tabs/Students")
                .then(({ default: Students }) => ({ Component: Students, }))}
            />
            <Route path="teachers"
              lazy={() => import("../pages/platform-admin/tabs/Teachers")
                .then(({ default: Teachers }) => ({ Component: Teachers, }))}
            />
            <Route path="parents"
              lazy={() => import("../pages/platform-admin/tabs/Parents")
                .then(({ default: Parents }) => ({ Component: Parents, }))}
            />
            <Route path="social-workers"
              lazy={() => import("../pages/platform-admin/tabs/SocialWorkers")
                .then(({ default: SocialWorkers }) => ({ Component: SocialWorkers, }))}
            />
            <Route path="school-admins"
              lazy={() => import("../pages/platform-admin/tabs/SchoolAdmins")
                .then(({ default: SchoolAdmins }) => ({ Component: SchoolAdmins, }))}
            />
          </Route>
          <Route path="tasks"
            lazy={() => import("../pages/platform-admin/Tasks")
              .then(({ default: Tasks }) => ({ Component: Tasks, }))}
          />
          <Route path="tasks/create"
            lazy={() => import("../pages/platform-admin/CreateTask")
              .then(({ default: CreateTask }) => ({ Component: CreateTask, }))}
          />
          <Route path="tasks/edit/:id"
            lazy={() => import("../pages/platform-admin/CreateTask")
              .then(({ default: CreateTask }) => ({ Component: CreateTask, }))}
          />
          <Route path="task-categories"
            lazy={() => import("../pages/platform-admin/TaskCategories")
              .then(({ default: TaskCategories }) => ({ Component: TaskCategories, }))}
          />
          <Route path="task-categories/create"
            lazy={() => import("../pages/platform-admin/CreateEditCategory")
              .then(({ default: CreateEditCategory }) => ({ Component: CreateEditCategory, }))}
          />
          <Route path="task-categories/edit/:id"
            lazy={() => import("../pages/platform-admin/CreateEditCategory")
              .then(({ default: CreateEditCategory }) => ({ Component: CreateEditCategory, }))}
          />
          <Route path="rewards"
            lazy={() => import("../pages/platform-admin/Rewards")
              .then(({ default: Rewards }) => ({ Component: Rewards, }))}
          />
          <Route path="rewards/create"
            lazy={() => import("../pages/platform-admin/CreateReward")
              .then(({ default: CreateReward }) => ({ Component: CreateReward, }))}
          />
          <Route path="rewards/edit/:id"
            lazy={() => import("../pages/platform-admin/CreateReward")
              .then(({ default: CreateReward }) => ({ Component: CreateReward, }))}
          />
          <Route path="reward-categories"
            lazy={() => import("../pages/platform-admin/RewardCategories")
              .then(({ default: RewardCategories }) => ({ Component: RewardCategories, }))}
          />
          <Route path="reward-categories/create"
            lazy={() => import("../pages/platform-admin/CreateRewardCategory")
              .then(({ default: CreateRewardCategory }) => ({ Component: CreateRewardCategory, }))}
          />
          <Route path="reward-categories/edit/:id"
            lazy={() => import("../pages/platform-admin/CreateRewardCategory")
              .then(({ default: CreateRewardCategory }) => ({ Component: CreateRewardCategory, }))}
          />
          <Route path="reward-redemptions"
            lazy={() => import("../pages/platform-admin/RewardRedemptions")
              .then(({ default: RewardRedemptions }) => ({ Component: RewardRedemptions, }))}
          />
          <Route path="scholarship-points"
            lazy={() => import("../pages/platform-admin/ScholarshipPoints")
              .then(({ default: ScholarshipPoints }) => ({ Component: ScholarshipPoints, }))}
          />
          <Route path="users/user/:id"
            lazy={() => import("../pages/platform-admin/UserDetails")
              .then(({ default: UserDetails }) => ({ Component: UserDetails, }))}
          />
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
