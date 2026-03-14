import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Fetch university stats (if available)
    if (!user?.university_id) return;

    api
      .get(`/universities/${user.university_id}/stats/`)
      .then(response => setStats(response.data))
      .catch(() => {
        // Ignore -- stats endpoint may not exist yet
      });
  }, [user]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>University ICT Admin Dashboard</h1>
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Students</h3>
            <p>{stats.total_students || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Lecturers</h3>
            <p>{stats.total_lecturers || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Active Courses</h3>
            <p>{stats.active_courses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Results</h3>
            <p>{stats.pending_results || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;