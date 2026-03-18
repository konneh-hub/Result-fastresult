import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/dean/overview/');
        setOverview(response.data);
      } catch (err) {
        console.error('Error loading dean overview:', err);
        setError('Failed to load overview');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dean-dashboard">
      <Sidebar />
      <div className="dean-dashboard-main">
        <h1>Dean Dashboard</h1>

        {overview && (
          <div className="stats">
            <div className="stat-card">
              <h3>Faculty</h3>
              <p>{overview.faculty?.name || 'Not assigned'}</p>
            </div>
            <div className="stat-card">
              <h3>Departments</h3>
              <p>{overview.stats.departments}</p>
            </div>
            <div className="stat-card">
              <h3>Courses</h3>
              <p>{overview.stats.courses}</p>
            </div>
            <div className="stat-card">
              <h3>Lecturers</h3>
              <p>{overview.stats.lecturers}</p>
            </div>
            <div className="stat-card">
              <h3>Students</h3>
              <p>{overview.stats.students}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Submissions</h3>
              <p>{overview.stats.pending_submissions}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Approvals</h3>
              <p>{overview.stats.pending_approvals}</p>
            </div>
          </div>
        )}

        <div className="dashboard-nav">
          <h2>Quick Links</h2>
          <ul>
            <li><Link to="/dean/departments">Departments</Link></li>
            <li><Link to="/dean/course-assignments">Course Assignments</Link></li>
            <li><Link to="/dean/review-results">Review Results</Link></li>
            <li><Link to="/dean/approve-results">Approve Results</Link></li>
            <li><Link to="/dean/return-results">Return Results</Link></li>
            <li><Link to="/dean/lecturer-activities">Lecturer Activities</Link></li>
            <li><Link to="/dean/profile">Profile Settings</Link></li>
            <li><Link to="/dean/change-password">Change Password</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;