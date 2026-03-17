import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    submitted: 0,
    pending: 0,
    approved: 0,
    published: 0,
    locked: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/management/exam-officer-stats/');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Exam Officer Dashboard</h1>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Submitted Results</h3>
            <p>{stats.submitted}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Approvals</h3>
            <p>{stats.pending}</p>
          </div>
          <div className="stat-card">
            <h3>Approved Results</h3>
            <p>{stats.approved}</p>
          </div>
          <div className="stat-card">
            <h3>Published Results</h3>
            <p>{stats.published}</p>
          </div>
          <div className="stat-card">
            <h3>Locked Results</h3>
            <p>{stats.locked}</p>
          </div>
        </div>
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <a href="/exam-officer/verify-results" className="btn">Verify Results</a>
            <a href="/exam-officer/pending-approvals" className="btn">Pending Approvals</a>
            <a href="/exam-officer/approve-results" className="btn">Approve Results</a>
            <a href="/exam-officer/publish-results" className="btn">Publish Results</a>
            <a href="/exam-officer/lock-results" className="btn">Lock Results</a>
            <a href="/exam-officer/reports" className="btn">Generate Reports</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;