import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
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
  MdLogout
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
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