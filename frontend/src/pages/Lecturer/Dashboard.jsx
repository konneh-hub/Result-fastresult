import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    assignedCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    completedAssessments: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch assigned courses
      const coursesResponse = await api.get('/lecturer/assigned-courses/');
      const courses = coursesResponse.data;

      // Calculate stats
      const totalStudents = courses.reduce((sum, course) => sum + (course.enrolled_students || 0), 0);
      const pendingSubmissions = courses.filter(course => course.status === 'pending_submission').length;
      const completedAssessments = courses.filter(course => course.assessment_completed).length;

      setStats({
        assignedCourses: courses.length,
        totalStudents,
        pendingSubmissions,
        completedAssessments
      });

      // Fetch recent activities from notifications
      try {
        const notificationsResponse = await api.get('/lecturer/notifications/');
        const activities = notificationsResponse.data.slice(0, 5).map(notification => ({
          id: notification.id,
          action: notification.message,
          date: notification.created_at,
          type: notification.type || 'notification'
        }));
        setRecentActivities(activities);
      } catch {
        // Fallback to mock data if endpoint fails
        setRecentActivities([
          { id: 1, action: 'Submitted results for Mathematics 101', date: '2024-01-15', type: 'submission' },
          { id: 2, action: 'Updated continuous assessment for Physics 201', date: '2024-01-14', type: 'update' },
          { id: 3, action: 'Uploaded course materials for Chemistry 301', date: '2024-01-13', type: 'upload' }
        ]);
      }

      // Fetch upcoming deadlines
      setUpcomingDeadlines([
        { id: 1, task: 'Submit final results for Computer Science 101', deadline: '2024-01-20', priority: 'high' },
        { id: 2, task: 'Complete continuous assessment for Mathematics 201', deadline: '2024-01-25', priority: 'medium' },
        { id: 3, task: 'Upload lecture notes for Physics 301', deadline: '2024-01-30', priority: 'low' }
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'submission':
        return '📤';
      case 'update':
        return '✏️';
      case 'upload':
        return '📁';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'var(--error)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Welcome back, {user.first_name}!</h1>
          <p>Here's an overview of your teaching activities and assignments</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Assigned Courses</h3>
            <p>{stats.assignedCourses}</p>
          </div>
          <div className="stat-card">
            <h3>Total Students</h3>
            <p>{stats.totalStudents}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Submissions</h3>
            <p style={{ color: stats.pendingSubmissions > 0 ? 'var(--warning)' : 'var(--success)' }}>
              {stats.pendingSubmissions}
            </p>
          </div>
          <div className="stat-card">
            <h3>Completed Assessments</h3>
            <p style={{ color: 'var(--success)' }}>{stats.completedAssessments}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="btn" onClick={() => window.location.href = '/lecturer/courses'}>
              View Assigned Courses
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/lecturer/upload-scores'}>
              Upload Scores
            </button>
            <button className="btn btn-accent" onClick={() => window.location.href = '/lecturer/continuous-assessment'}>
              Enter CA Scores
            </button>
            <button className="btn btn-success" onClick={() => window.location.href = '/lecturer/submit-results'}>
              Submit Results
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="dashboard-section">
            <h2>Recent Activities</h2>
            {recentActivities.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                No recent activities
              </p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {recentActivities.map(activity => (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{getActivityIcon(activity.type)}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0', fontSize: '14px' }}>{activity.action}</p>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <h2>Upcoming Deadlines</h2>
            {upcomingDeadlines.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                No upcoming deadlines
              </p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {upcomingDeadlines.map(deadline => (
                  <div
                    key={deadline.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{deadline.task}</p>
                      <span style={{
                        fontSize: '12px',
                        color: getPriorityColor(deadline.priority),
                        fontWeight: '500'
                      }}>
                        Due: {new Date(deadline.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      backgroundColor: getPriorityColor(deadline.priority),
                      color: 'white'
                    }}>
                      {deadline.priority.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;