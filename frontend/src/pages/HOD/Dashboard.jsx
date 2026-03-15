import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import './HOD.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [departmentStats, setDepartmentStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch department statistics
      const statsResponse = await api.get(`/departments/${user.department_id}/`);
      setDepartmentStats(statsResponse.data);

      // Fetch recent activities (you might need to create this endpoint)
      // const activitiesResponse = await api.get('/hod/recent-activities/');
      // setRecentActivities(activitiesResponse.data);

      // Fetch pending approvals
      const approvalsResponse = await api.get('/management/pending-approvals/');
      setPendingApprovals(approvalsResponse.data);

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Head of Department Dashboard</h1>
          <p>Welcome back, {user.first_name} {user.last_name}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Students</h3>
            <p>{departmentStats.student_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Lecturers</h3>
            <p>{departmentStats.lecturer_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p>{departmentStats.course_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Results Submitted</h3>
            <p>{departmentStats.result_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Approvals</h3>
            <p>{pendingApprovals.length || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Active Programs</h3>
            <p>{departmentStats.program_count || 0}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="btn" onClick={() => window.location.href = '/hod/assign-courses'}>
              Assign Courses
            </button>
            <button className="btn" onClick={() => window.location.href = '/hod/verify-results'}>
              Verify Results
            </button>
            <button className="btn" onClick={() => window.location.href = '/hod/monitor-submissions'}>
              Monitor Submissions
            </button>
            <button className="btn" onClick={() => window.location.href = '/hod/department-stats'}>
              View Statistics
            </button>
            <button className="btn" onClick={() => window.location.href = '/hod/reports'}>
              Generate Reports
            </button>
          </div>
        </div>

        {pendingApprovals.length > 0 && (
          <div className="dashboard-section">
            <h2>Pending Approvals</h2>
            <div className="pending-list">
              {pendingApprovals.slice(0, 5).map((approval, index) => (
                <div key={index} className="pending-item">
                  <p>{approval.description}</p>
                  <small>{approval.date}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <h2>Department Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Department:</strong> {departmentStats.name}
            </div>
            <div className="info-item">
              <strong>Faculty:</strong> {departmentStats.faculty_name}
            </div>
            <div className="info-item">
              <strong>Head:</strong> {departmentStats.head_name || 'Not assigned'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;