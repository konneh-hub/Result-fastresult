import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Fetch university stats
    // Assuming user has university_id
    api.get(`/universities/${user.university_id}/stats/`).then(response => setStats(response.data));
  }, [user]);

  return (
    <div className="dashboard">
      <h1>University ICT Admin Dashboard</h1>
      <div className="stats">
        <div>Total Students: {stats.total_students}</div>
        <div>Total Lecturers: {stats.total_lecturers}</div>
        <div>Active Courses: {stats.active_courses}</div>
        <div>Pending Results: {stats.pending_results}</div>
      </div>
      <nav>
        <ul>
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
      </nav>
    </div>
  );
};

export default Dashboard;