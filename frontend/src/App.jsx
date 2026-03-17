import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Topbar from './components/Topbar/Topbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Universities from './pages/Universities';
import Contact from './pages/Contact';
import Login from './pages/Login';
import StudentRegistration from './pages/StudentRegistration';
import LecturerRegistration from './pages/LecturerRegistration';
import ForgotPassword from './pages/ForgotPassword';
import UniversityAdminDashboard from './pages/UniversityAdmin/Dashboard';
import Faculties from './pages/UniversityAdmin/Management/Faculties';
import Departments from './pages/UniversityAdmin/Management/Departments';
import Programs from './pages/UniversityAdmin/Management/Programs';
import Courses from './pages/UniversityAdmin/Management/Courses';
import UploadStudents from './pages/UniversityAdmin/Management/UploadStudents';
import UploadLecturers from './pages/UniversityAdmin/Management/UploadLecturers';
import AcademicSessions from './pages/UniversityAdmin/Management/AcademicSessions';
import Semesters from './pages/UniversityAdmin/Management/Semesters';
import AssignRoles from './pages/UniversityAdmin/Management/AssignRoles';
import UserManagement from './pages/UniversityAdmin/Management/UserManagement';
import Reports from './pages/UniversityAdmin/Management/Reports';
import Notifications from './pages/UniversityAdmin/Management/Notifications';
import ActivityLogs from './pages/UniversityAdmin/Management/ActivityLogs';
import ProfileSettings from './pages/UniversityAdmin/Management/ProfileSettings';
import ChangePassword from './pages/UniversityAdmin/Management/ChangePassword';

import AdminAccountCreation from './pages/UniversityAdmin/Management/AdminAccountCreation';

import ExamOfficerDashboard from './pages/ExamOfficer/Dashboard';
import SubmittedResults from './pages/ExamOfficer/SubmittedResults';
import PendingApprovals from './pages/ExamOfficer/PendingApprovals';
import PublishedResults from './pages/ExamOfficer/PublishedResults';
import SystemAlerts from './pages/ExamOfficer/SystemAlerts';
import VerifyResults from './pages/ExamOfficer/VerifyResults';
import GradingPolicies from './pages/ExamOfficer/GradingPolicies';
import ApproveResults from './pages/ExamOfficer/ApproveResults';
import PublishResults from './pages/ExamOfficer/PublishResults';
import LockResults from './pages/ExamOfficer/LockResults';
import ReopenResults from './pages/ExamOfficer/ReopenResults';
import ResultCorrections from './pages/ExamOfficer/ResultCorrections';
import ExamOfficerReports from './pages/ExamOfficer/Reports';
import ExamOfficerProfile from './pages/ExamOfficer/ProfileSettings';
import ExamOfficerChangePassword from './pages/ExamOfficer/ChangePassword';

import DeanDashboard from './pages/Dean/Dashboard';
import DeanDepartments from './pages/Dean/Departments';
import LecturerActivities from './pages/Dean/LecturerActivities';
import CourseAssignments from './pages/Dean/CourseAssignments';
import ReviewResults from './pages/Dean/ReviewResults';
import DeanApproveResults from './pages/Dean/ApproveResults';
import ReturnResults from './pages/Dean/ReturnResults';
import DeanReports from './pages/Dean/Reports';
import DeanProfile from './pages/Dean/ProfileSettings';
import DeanChangePassword from './pages/Dean/ChangePassword';

import HODDashboard from './pages/HOD/Dashboard';
import DepartmentStats from './pages/HOD/DepartmentStats';
import LecturerWorkload from './pages/HOD/LecturerWorkload';
import HodAssignCourses from './pages/HOD/AssignCourses';
import MonitorSubmissions from './pages/HOD/MonitorSubmissions';
import HodVerifyResults from './pages/HOD/VerifyResults';
import ReturnCorrections from './pages/HOD/ReturnCorrections';
import SubmitToDean from './pages/HOD/SubmitToDean';
import HodReports from './pages/HOD/Reports';
import HodNotifications from './pages/HOD/Notifications';
import HodProfile from './pages/HOD/ProfileSettings';
import HodChangePassword from './pages/HOD/ChangePassword';

import LecturerDashboard from './pages/Lecturer/Dashboard';
import AssignedCourses from './pages/Lecturer/AssignedCourses';
import CourseStudents from './pages/Lecturer/CourseStudents';
import CourseMaterials from './pages/Lecturer/CourseMaterials';
import ContinuousAssessments from './pages/Lecturer/ContinuousAssessments';
import UploadScores from './pages/Lecturer/UploadScores';
import EditScores from './pages/Lecturer/EditScores';
import CalculateGrades from './pages/Lecturer/CalculateGrades';
import SubmitResults from './pages/Lecturer/SubmitResults';
import LecturerPerformance from './pages/Lecturer/PerformanceTracking';
import LecturerNotifications from './pages/Lecturer/Notifications';
import LecturerProfile from './pages/Lecturer/ProfileSettings';
import LecturerChangePassword from './pages/Lecturer/ChangePassword';

import StudentDashboard from './pages/Student/Dashboard';
import StudentResults from './pages/Student/Results';
import StudentDownloadSlip from './pages/Student/DownloadSlip';
import StudentGpaCgpa from './pages/Student/GpaCgpa';
import StudentHistory from './pages/Student/History';
import StudentCourseInfo from './pages/Student/CourseInfo';
import StudentProgress from './pages/Student/AcademicProgress';
import StudentGpaCalculator from './pages/Student/GpaCalculator';
import GraduationTracker from './pages/Student/GraduationTracker';
import TranscriptRequest from './pages/Student/TranscriptRequest';
import StudentProfile from './pages/Student/Profile';
import StudentChangePassword from './pages/Student/ChangePassword';
import StudentNotifications from './pages/Student/Notifications';
import AcademicCalendar from './pages/Student/AcademicCalendar';
import HelpSupport from './pages/Student/HelpSupport';
import DownloadDocuments from './pages/Student/DownloadDocuments';

import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();

  const publicPaths = ['/', '/about', '/universities', '/contact', '/login', '/register/student', '/register/lecturer', '/forgot-password'];

  const isPublicPage = publicPaths.includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin/');

  return (
    <div className="App">
      {isPublicPage && <Navbar />}
      {isAdminPage && <Topbar />}
      <main>
        <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/universities" element={<Universities />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register/student" element={<StudentRegistration />} />
              <Route path="/register/lecturer" element={<LecturerRegistration />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute role="university_admin"><UniversityAdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/faculties" element={<ProtectedRoute role="university_admin"><Faculties /></ProtectedRoute>} />
              <Route path="/admin/departments" element={<ProtectedRoute role="university_admin"><Departments /></ProtectedRoute>} />
              <Route path="/admin/programs" element={<ProtectedRoute role="university_admin"><Programs /></ProtectedRoute>} />
              <Route path="/admin/courses" element={<ProtectedRoute role="university_admin"><Courses /></ProtectedRoute>} />
              <Route path="/admin/upload-students" element={<ProtectedRoute role="university_admin"><UploadStudents /></ProtectedRoute>} />
              <Route path="/admin/upload-lecturers" element={<ProtectedRoute role="university_admin"><UploadLecturers /></ProtectedRoute>} />
              <Route path="/admin/sessions" element={<ProtectedRoute role="university_admin"><AcademicSessions /></ProtectedRoute>} />
              <Route path="/admin/semesters" element={<ProtectedRoute role="university_admin"><Semesters /></ProtectedRoute>} />
              <Route path="/admin/assign-roles" element={<ProtectedRoute role="university_admin"><AssignRoles /></ProtectedRoute>} />
              <Route path="/admin/user-management" element={<ProtectedRoute role="university_admin"><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/create-admin" element={<ProtectedRoute role="university_admin"><AdminAccountCreation /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute role="university_admin"><Reports /></ProtectedRoute>} />
              <Route path="/admin/notifications" element={<ProtectedRoute role="university_admin"><Notifications /></ProtectedRoute>} />
              <Route path="/admin/activity-logs" element={<ProtectedRoute role="university_admin"><ActivityLogs /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute role="university_admin"><ProfileSettings /></ProtectedRoute>} />
              <Route path="/admin/change-password" element={<ProtectedRoute role="university_admin"><ChangePassword /></ProtectedRoute>} />

              {/* Redirect legacy role paths */}
              <Route path="/university-ict-admin/*" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/university-ict admin/*" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/university-ict%20admin/*" element={<Navigate to="/admin/dashboard" replace />} />

              <Route path="/exam-officer/dashboard" element={<ProtectedRoute role="Exam Officer"><ExamOfficerDashboard /></ProtectedRoute>} />
              <Route path="/exam-officer/submitted-results" element={<ProtectedRoute role="Exam Officer"><SubmittedResults /></ProtectedRoute>} />
              <Route path="/exam-officer/pending-approvals" element={<ProtectedRoute role="Exam Officer"><PendingApprovals /></ProtectedRoute>} />
              <Route path="/exam-officer/published-results" element={<ProtectedRoute role="Exam Officer"><PublishedResults /></ProtectedRoute>} />
              <Route path="/exam-officer/alerts" element={<ProtectedRoute role="Exam Officer"><SystemAlerts /></ProtectedRoute>} />
              <Route path="/exam-officer/verify-results" element={<ProtectedRoute role="Exam Officer"><VerifyResults /></ProtectedRoute>} />
              <Route path="/exam-officer/grading-policies" element={<ProtectedRoute role="Exam Officer"><GradingPolicies /></ProtectedRoute>} />
              <Route path="/exam-officer/approve-results" element={<ProtectedRoute role="Exam Officer"><ApproveResults /></ProtectedRoute>} />
              <Route path="/exam-officer/publish-results" element={<ProtectedRoute role="Exam Officer"><PublishResults /></ProtectedRoute>} />
              <Route path="/exam-officer/lock-results" element={<ProtectedRoute role="Exam Officer"><LockResults /></ProtectedRoute>} />
              <Route path="/exam-officer/reopen-results" element={<ProtectedRoute role="Exam Officer"><ReopenResults /></ProtectedRoute>} />
              <Route path="/exam-officer/corrections" element={<ProtectedRoute role="Exam Officer"><ResultCorrections /></ProtectedRoute>} />
              <Route path="/exam-officer/reports" element={<ProtectedRoute role="Exam Officer"><ExamOfficerReports /></ProtectedRoute>} />
              <Route path="/exam-officer/profile" element={<ProtectedRoute role="Exam Officer"><ExamOfficerProfile /></ProtectedRoute>} />
              <Route path="/exam-officer/change-password" element={<ProtectedRoute role="Exam Officer"><ExamOfficerChangePassword /></ProtectedRoute>} />

              <Route path="/dean/dashboard" element={<ProtectedRoute role="Dean"><DeanDashboard /></ProtectedRoute>} />
              <Route path="/dean/departments" element={<ProtectedRoute role="Dean"><DeanDepartments /></ProtectedRoute>} />
              <Route path="/dean/lecturer-activities" element={<ProtectedRoute role="Dean"><LecturerActivities /></ProtectedRoute>} />
              <Route path="/dean/course-assignments" element={<ProtectedRoute role="Dean"><CourseAssignments /></ProtectedRoute>} />
              <Route path="/dean/review-results" element={<ProtectedRoute role="Dean"><ReviewResults /></ProtectedRoute>} />
              <Route path="/dean/approve-results" element={<ProtectedRoute role="Dean"><DeanApproveResults /></ProtectedRoute>} />
              <Route path="/dean/return-results" element={<ProtectedRoute role="Dean"><ReturnResults /></ProtectedRoute>} />
              <Route path="/dean/reports" element={<ProtectedRoute role="Dean"><DeanReports /></ProtectedRoute>} />
              <Route path="/dean/profile" element={<ProtectedRoute role="Dean"><DeanProfile /></ProtectedRoute>} />
              <Route path="/dean/change-password" element={<ProtectedRoute role="Dean"><DeanChangePassword /></ProtectedRoute>} />

              <Route path="/hod/dashboard" element={<ProtectedRoute role="Head of Department"><HODDashboard /></ProtectedRoute>} />
              <Route path="/hod/department-stats" element={<ProtectedRoute role="Head of Department"><DepartmentStats /></ProtectedRoute>} />
              <Route path="/hod/lecturer-workload" element={<ProtectedRoute role="Head of Department"><LecturerWorkload /></ProtectedRoute>} />
              <Route path="/hod/assign-courses" element={<ProtectedRoute role="Head of Department"><HodAssignCourses /></ProtectedRoute>} />
              <Route path="/hod/monitor-submissions" element={<ProtectedRoute role="Head of Department"><MonitorSubmissions /></ProtectedRoute>} />
              <Route path="/hod/verify-results" element={<ProtectedRoute role="Head of Department"><HodVerifyResults /></ProtectedRoute>} />
              <Route path="/hod/return-corrections" element={<ProtectedRoute role="Head of Department"><ReturnCorrections /></ProtectedRoute>} />
              <Route path="/hod/submit-to-dean" element={<ProtectedRoute role="Head of Department"><SubmitToDean /></ProtectedRoute>} />
              <Route path="/hod/reports" element={<ProtectedRoute role="Head of Department"><HodReports /></ProtectedRoute>} />
              <Route path="/hod/notifications" element={<ProtectedRoute role="Head of Department"><HodNotifications /></ProtectedRoute>} />
              <Route path="/hod/profile" element={<ProtectedRoute role="Head of Department"><HodProfile /></ProtectedRoute>} />
              <Route path="/hod/change-password" element={<ProtectedRoute role="Head of Department"><HodChangePassword /></ProtectedRoute>} />

              <Route path="/lecturer/dashboard" element={<ProtectedRoute role="Lecturer"><LecturerDashboard /></ProtectedRoute>} />
              <Route path="/lecturer/assigned-courses" element={<ProtectedRoute role="Lecturer"><AssignedCourses /></ProtectedRoute>} />
              <Route path="/lecturer/course-students" element={<ProtectedRoute role="Lecturer"><CourseStudents /></ProtectedRoute>} />
              <Route path="/lecturer/course-materials" element={<ProtectedRoute role="Lecturer"><CourseMaterials /></ProtectedRoute>} />
              <Route path="/lecturer/assessments" element={<ProtectedRoute role="Lecturer"><ContinuousAssessments /></ProtectedRoute>} />
              <Route path="/lecturer/upload-scores" element={<ProtectedRoute role="Lecturer"><UploadScores /></ProtectedRoute>} />
              <Route path="/lecturer/edit-scores" element={<ProtectedRoute role="Lecturer"><EditScores /></ProtectedRoute>} />
              <Route path="/lecturer/calculate-grades" element={<ProtectedRoute role="Lecturer"><CalculateGrades /></ProtectedRoute>} />
              <Route path="/lecturer/submit-results" element={<ProtectedRoute role="Lecturer"><SubmitResults /></ProtectedRoute>} />
              <Route path="/lecturer/performance" element={<ProtectedRoute role="Lecturer"><LecturerPerformance /></ProtectedRoute>} />
              <Route path="/lecturer/notifications" element={<ProtectedRoute role="Lecturer"><LecturerNotifications /></ProtectedRoute>} />
              <Route path="/lecturer/profile" element={<ProtectedRoute role="Lecturer"><LecturerProfile /></ProtectedRoute>} />
              <Route path="/lecturer/change-password" element={<ProtectedRoute role="Lecturer"><LecturerChangePassword /></ProtectedRoute>} />

              <Route path="/student/dashboard" element={<ProtectedRoute role="Student"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/results" element={<ProtectedRoute role="Student"><StudentResults /></ProtectedRoute>} />
              <Route path="/student/download-slip" element={<ProtectedRoute role="Student"><StudentDownloadSlip /></ProtectedRoute>} />
              <Route path="/student/gpa-cgpa" element={<ProtectedRoute role="Student"><StudentGpaCgpa /></ProtectedRoute>} />
              <Route path="/student/history" element={<ProtectedRoute role="Student"><StudentHistory /></ProtectedRoute>} />
              <Route path="/student/courses" element={<ProtectedRoute role="Student"><StudentCourseInfo /></ProtectedRoute>} />
              <Route path="/student/progress" element={<ProtectedRoute role="Student"><StudentProgress /></ProtectedRoute>} />
              <Route path="/student/gpa-calculator" element={<ProtectedRoute role="Student"><StudentGpaCalculator /></ProtectedRoute>} />
              <Route path="/student/graduation-tracker" element={<ProtectedRoute role="Student"><GraduationTracker /></ProtectedRoute>} />
              <Route path="/student/transcript" element={<ProtectedRoute role="Student"><TranscriptRequest /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute role="Student"><StudentProfile /></ProtectedRoute>} />
              <Route path="/student/change-password" element={<ProtectedRoute role="Student"><StudentChangePassword /></ProtectedRoute>} />
              <Route path="/student/notifications" element={<ProtectedRoute role="Student"><StudentNotifications /></ProtectedRoute>} />
              <Route path="/student/calendar" element={<ProtectedRoute role="Student"><AcademicCalendar /></ProtectedRoute>} />
              <Route path="/student/help" element={<ProtectedRoute role="Student"><HelpSupport /></ProtectedRoute>} />
              <Route path="/student/download-docs" element={<ProtectedRoute role="Student"><DownloadDocuments /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      );
    }

export default App;
