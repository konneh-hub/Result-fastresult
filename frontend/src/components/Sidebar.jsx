import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import {
  MdDashboard,
  MdSchool,
  MdBusiness,
  MdLibraryBooks,
  MdBook,
  MdPersonAdd,
  MdSupervisorAccount,
  MdEvent,
  MdCalendarViewMonth,
  MdAssignmentInd,
  MdPeople,
  MdAnalytics,
  MdNotifications,
  MdHistory,
  MdSettings,
  MdLock,
  MdLogout,
  MdCheckCircle,
  MdPending,
  MdPublish,
  MdLockOpen,
  MdEdit,
  MdAssessment,
  MdWarning
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getMenuItems = () => {
    const role = user?.role?.toLowerCase();

    if (role === 'university_admin' || role === 'university ict admin') {
      return [
        { path: '/admin/dashboard', icon: MdDashboard, label: 'Dashboard' },
        { path: '/admin/faculties', icon: MdSchool, label: 'Manage Faculties' },
        { path: '/admin/departments', icon: MdBusiness, label: 'Manage Departments' },
        { path: '/admin/programs', icon: MdLibraryBooks, label: 'Manage Programs' },
        { path: '/admin/courses', icon: MdBook, label: 'Manage Courses' },
        { path: '/admin/upload-students', icon: MdPersonAdd, label: 'Upload Student Information' },
        { path: '/admin/upload-lecturers', icon: MdSupervisorAccount, label: 'Upload Lecturer Information' },
        { path: '/admin/sessions', icon: MdEvent, label: 'Manage Academic Sessions' },
        { path: '/admin/semesters', icon: MdCalendarViewMonth, label: 'Manage Semesters' },
        { path: '/admin/assign-roles', icon: MdAssignmentInd, label: 'Assign Roles' },
        { path: '/admin/user-management', icon: MdPeople, label: 'User Management' },
        { path: '/admin/create-admin', icon: MdSupervisorAccount, label: 'Create Admin Account' },
        { path: '/admin/reports', icon: MdAnalytics, label: 'Reports & Analytics' },
        { path: '/admin/notifications', icon: MdNotifications, label: 'Notifications' },
        { path: '/admin/activity-logs', icon: MdHistory, label: 'Activity Logs' },
        { path: '/admin/profile', icon: MdSettings, label: 'Profile Settings' },
        { path: '/admin/change-password', icon: MdLock, label: 'Change Password' }
      ];
    } else if (role === 'exam_officer' || role === 'exam officer') {
      return [
        { path: '/exam-officer/dashboard', icon: MdDashboard, label: 'Dashboard' },
        { path: '/exam-officer/submitted-results', icon: MdCheckCircle, label: 'Submitted Results' },
        { path: '/exam-officer/pending-approvals', icon: MdPending, label: 'Pending Approvals' },
        { path: '/exam-officer/verify-results', icon: MdAssessment, label: 'Verify Results' },
        { path: '/exam-officer/approve-results', icon: MdCheckCircle, label: 'Approve Results' },
        { path: '/exam-officer/publish-results', icon: MdPublish, label: 'Publish Results' },
        { path: '/exam-officer/lock-results', icon: MdLock, label: 'Lock Results' },
        { path: '/exam-officer/reopen-results', icon: MdLockOpen, label: 'Reopen Results' },
        { path: '/exam-officer/result-corrections', icon: MdEdit, label: 'Result Corrections' },
        { path: '/exam-officer/grading-policies', icon: MdBook, label: 'Grading Policies' },
        { path: '/exam-officer/system-alerts', icon: MdWarning, label: 'System Alerts' },
        { path: '/exam-officer/reports', icon: MdAnalytics, label: 'Reports' },
        { path: '/exam-officer/profile', icon: MdSettings, label: 'Profile Settings' },
        { path: '/exam-officer/change-password', icon: MdLock, label: 'Change Password' }
      ];
    } else if (role === 'dean') {
      return [
        { path: '/dean/dashboard', icon: MdDashboard, label: 'Dashboard' },
        { path: '/dean/departments', icon: MdBusiness, label: 'Departments' },
        { path: '/dean/lecturer-activities', icon: MdSupervisorAccount, label: 'Lecturer Activities' },
        { path: '/dean/course-assignments', icon: MdAssignmentInd, label: 'Course Assignments' },
        { path: '/dean/review-results', icon: MdAssessment, label: 'Review Results' },
        { path: '/dean/approve-results', icon: MdCheckCircle, label: 'Approve Results' },
        { path: '/dean/return-results', icon: MdEdit, label: 'Return Results' },
        { path: '/dean/reports', icon: MdAnalytics, label: 'Reports' },
        { path: '/dean/profile', icon: MdSettings, label: 'Profile Settings' },
        { path: '/dean/change-password', icon: MdLock, label: 'Change Password' }
      ];
    } else if (role === 'hod' || role === 'head of department' || role === 'head_of_department') {
      return [
        { path: '/hod/dashboard', icon: MdDashboard, label: 'Dashboard' },
        { path: '/hod/department-stats', icon: MdAnalytics, label: 'Department Stats' },
        { path: '/hod/lecturer-workload', icon: MdSupervisorAccount, label: 'Lecturer Workload' },
        { path: '/hod/assign-courses', icon: MdAssignmentInd, label: 'Assign Courses' },
        { path: '/hod/monitor-submissions', icon: MdAssessment, label: 'Monitor Submissions' },
        { path: '/hod/verify-results', icon: MdCheckCircle, label: 'Verify Results' },
        { path: '/hod/return-corrections', icon: MdEdit, label: 'Return Corrections' },
        { path: '/hod/submit-to-dean', icon: MdPublish, label: 'Submit to Dean' },
        { path: '/hod/reports', icon: MdAnalytics, label: 'Reports' },
        { path: '/hod/notifications', icon: MdNotifications, label: 'Notifications' },
        { path: '/hod/profile', icon: MdSettings, label: 'Profile Settings' },
        { path: '/hod/change-password', icon: MdLock, label: 'Change Password' }
      ];
    } else if (role === 'lecturer') {
      return [
        { path: '/lecturer/dashboard', icon: MdDashboard, label: 'Dashboard' },
        { path: '/lecturer/assigned-courses', icon: MdBook, label: 'Assigned Courses' },
        { path: '/lecturer/course-students', icon: MdPeople, label: 'Course Students' },
        { path: '/lecturer/course-materials', icon: MdLibraryBooks, label: 'Course Materials' },
        { path: '/lecturer/continuous-assessments', icon: MdAssessment, label: 'Continuous Assessments' },
        { path: '/lecturer/upload-scores', icon: MdPublish, label: 'Upload Scores' },
        { path: '/lecturer/edit-scores', icon: MdEdit, label: 'Edit Scores' },
        { path: '/lecturer/calculate-grades', icon: MdAnalytics, label: 'Calculate Grades' },
        { path: '/lecturer/submit-results', icon: MdCheckCircle, label: 'Submit Results' },
        { path: '/lecturer/performance', icon: MdAnalytics, label: 'Performance Tracking' },
        { path: '/lecturer/notifications', icon: MdNotifications, label: 'Notifications' },
        { path: '/lecturer/profile', icon: MdSettings, label: 'Profile Settings' },
        { path: '/lecturer/change-password', icon: MdLock, label: 'Change Password' }
      ];
    } else if (role === 'student') {
      return [
        { path: '/student/dashboard', icon: MdDashboard, label: 'Dashboard' },
        { path: '/student/results', icon: MdAssessment, label: 'Results' },
        { path: '/student/download-slip', icon: MdBook, label: 'Download Slip' },
        { path: '/student/gpa-cgpa', icon: MdAnalytics, label: 'GPA/CGPA' },
        { path: '/student/history', icon: MdHistory, label: 'History' },
        { path: '/student/course-info', icon: MdLibraryBooks, label: 'Course Info' },
        { path: '/student/academic-progress', icon: MdAnalytics, label: 'Academic Progress' },
        { path: '/student/gpa-calculator', icon: MdAnalytics, label: 'GPA Calculator' },
        { path: '/student/graduation-tracker', icon: MdCheckCircle, label: 'Graduation Tracker' },
        { path: '/student/transcript-request', icon: MdBook, label: 'Transcript Request' },
        { path: '/student/profile', icon: MdSettings, label: 'Profile' },
        { path: '/student/change-password', icon: MdLock, label: 'Change Password' },
        { path: '/student/notifications', icon: MdNotifications, label: 'Notifications' }
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? '→' : '←'}
        </button>
        {!isCollapsed && <h3>Management</h3>}
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <li key={index}>
              <Link to={item.path}>
                <IconComponent className="sidebar-icon" />
                {!isCollapsed && <span className="sidebar-text">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <button className="logout-button" onClick={handleLogout}>
        <MdLogout className="sidebar-icon" />
        {!isCollapsed && <span className="sidebar-text">Logout</span>}
      </button>
    </div>
  );
};

export default Sidebar;