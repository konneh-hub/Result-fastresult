import React from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Management</h3>
      </div>
      <ul className="sidebar-menu">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/faculties">Manage Faculties</Link></li>
        <li><Link to="/admin/departments">Manage Departments</Link></li>
        <li><Link to="/admin/programs">Manage Programs</Link></li>
        <li><Link to="/admin/courses">Manage Courses</Link></li>
        <li><Link to="/admin/upload-students">Upload Student Information</Link></li>
        <li><Link to="/admin/upload-lecturers">Upload Lecturer Information</Link></li>
        <li><Link to="/admin/sessions">Manage Academic Sessions</Link></li>
        <li><Link to="/admin/semesters">Manage Semesters</Link></li>
        <li><Link to="/admin/assign-roles">Assign Roles</Link></li>
        <li><Link to="/admin/user-management">User Management</Link></li>
        <li><Link to="/admin/reports">Reports & Analytics</Link></li>
        <li><Link to="/admin/notifications">Notifications</Link></li>
        <li><Link to="/admin/activity-logs">Activity Logs</Link></li>
        <li><Link to="/admin/profile">Profile Settings</Link></li>
        <li><Link to="/admin/change-password">Change Password</Link></li>
      </ul>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;