import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [gpa, setGpa] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [academicProgress, setAcademicProgress] = useState({
    completedCredits: 0,
    totalCredits: 120,
    currentLevel: 1
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch GPA
        const gpaResponse = await api.get(`/students/${user.id}/gpa/`);
        const gpaRecords = gpaResponse.data;
        if (gpaRecords.length > 0) {
          setGpa(gpaRecords[gpaRecords.length - 1].gpa);
        }

        // Fetch notifications (assuming endpoint exists)
        try {
          const notificationsResponse = await api.get('/auth/notifications/');
          setNotifications(notificationsResponse.data.slice(0, 5)); // Show latest 5
        } catch {
          console.log('Notifications not available');
        }

        // Fetch academic progress (assuming endpoint exists)
        try {
          const progressResponse = await api.get('/auth/academic-progress/');
          setAcademicProgress(progressResponse.data);
        } catch {
          console.log('Academic progress not available');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Student Dashboard</h1>
      
      <div className="dashboard-overview">
        <div className="overview-card">
          <h3>Current GPA</h3>
          <p className="gpa-value">{gpa.toFixed(2)}</p>
        </div>
        
        <div className="overview-card">
          <h3>Academic Progress</h3>
          <p>{academicProgress.completedCredits} / {academicProgress.totalCredits} Credits</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(academicProgress.completedCredits / academicProgress.totalCredits) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="overview-card">
          <h3>Current Level</h3>
          <p>Level {academicProgress.currentLevel}</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="notifications-section">
          <h2>Recent Notifications</h2>
          {notifications.length > 0 ? (
            <ul className="notifications-list">
              {notifications.map(notification => (
                <li key={notification.id} className="notification-item">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <small>{new Date(notification.created_at).toLocaleDateString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent notifications</p>
          )}
        </div>
      </div>

      <nav className="dashboard-nav">
        <h2>Quick Access</h2>
        <ul>
          <li><a href="/student/results">View Results</a></li>
          <li><a href="/student/download-slip">Download Result Slip</a></li>
          <li><a href="/student/gpa-cgpa">View GPA and CGPA</a></li>
          <li><a href="/student/history">Academic History</a></li>
          <li><a href="/student/profile">Profile</a></li>
          <li><a href="/student/notifications">All Notifications</a></li>
          <li><a href="/student/academic-progress">Academic Progress</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;