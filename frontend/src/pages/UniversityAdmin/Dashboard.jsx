import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './Dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totals: { students: 0, lecturers: 0, courses: 0, departments: 0 },
    result_progress: { total: 0, submitted: 0, verified: 0, approved: 0, pending_approvals: 0 }
  });
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [departmentOverview, setDepartmentOverview] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all dashboard data in parallel
        const [
          statsResponse,
          enrollmentResponse,
          activitiesResponse,
          approvalsResponse,
          departmentsResponse,
          eventsResponse
        ] = await Promise.all([
          api.get('/dashboard/stats/'),
          api.get('/dashboard/student-enrollment-chart/'),
          api.get('/dashboard/activities/'),
          api.get('/dashboard/pending-approvals/'),
          api.get('/dashboard/department-overview/'),
          api.get('/dashboard/upcoming-events/')
        ]);

        setStats(statsResponse.data);
        setEnrollmentData(enrollmentResponse.data);
        setRecentActivities(activitiesResponse.data);
        setPendingApprovals(approvalsResponse.data);
        setDepartmentOverview(departmentsResponse.data);
        setUpcomingEvents(eventsResponse.data);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Get university name for dashboard title
  const getDashboardTitle = () => {
    if (user && user.university_name) {
      return `${user.university_name} Dashboard`;
    }
    return 'University ICT Admin Dashboard';
  };

  // Chart data for student enrollment
  const enrollmentChartData = {
    labels: enrollmentData.map(item => item.year),
    datasets: [{
      label: 'Students Enrolled',
      data: enrollmentData.map(item => item.count),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };

  // Chart data for result submission progress
  const resultProgressData = {
    labels: ['Total Results', 'Submitted', 'Verified', 'Approved'],
    datasets: [{
      data: [
        stats.result_progress.total,
        stats.result_progress.submitted,
        stats.result_progress.verified,
        stats.result_progress.approved
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)'
      ],
      borderWidth: 1
    }]
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading dashboard data...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>{getDashboardTitle()}</h1>

        {/* TOTAL CARDS */}
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Students</h3>
            <p className="stat-number">{stats.totals.students}</p>
          </div>
          <div className="stat-card">
            <h3>Total Lecturers</h3>
            <p className="stat-number">{stats.totals.lecturers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p className="stat-number">{stats.totals.courses}</p>
          </div>
          <div className="stat-card">
            <h3>Total Departments</h3>
            <p className="stat-number">{stats.totals.departments}</p>
          </div>
        </div>

        {/* STUDENT ENROLLMENT CHART */}
        <div className="dashboard-section">
          <h2>Student Enrollment Chart</h2>
          <div className="chart-container">
            <Line
              data={enrollmentChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Student Enrollment Over Time' }
                }
              }}
            />
          </div>
        </div>

        {/* RESULT SUBMISSION PROGRESS */}
        <div className="dashboard-section">
          <h2>Result Submission Progress</h2>
          <div className="chart-container">
            <Doughnut
              data={resultProgressData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'right' },
                  title: { display: true, text: 'Result Processing Status' }
                }
              }}
            />
          </div>
        </div>

        <div className="dashboard-grid">
          {/* RECENT ACTIVITIES */}
          <div className="dashboard-section">
            <h2>Recent Activities</h2>
            <div className="activity-list">
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-header">
                      <span className="activity-user">{activity.user}</span>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-details">{activity.details}</div>
                  </div>
                ))
              ) : (
                <p>No recent activities</p>
              )}
            </div>
          </div>

          {/* PENDING APPROVALS */}
          <div className="dashboard-section">
            <h2>Pending Approvals</h2>
            <div className="approval-list">
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map(approval => (
                  <div key={approval.id} className="approval-item">
                    <div className="approval-course">{approval.course}</div>
                    <div className="approval-lecturer">{approval.lecturer}</div>
                    <div className="approval-dept">{approval.department}</div>
                    <div className="approval-date">
                      {new Date(approval.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p>No pending approvals</p>
              )}
            </div>
          </div>
        </div>

        {/* DEPARTMENT OVERVIEW TABLE */}
        <div className="dashboard-section">
          <h2>Department Overview</h2>
          <div className="table-container">
            <table className="department-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Faculty</th>
                  <th>Students</th>
                  <th>Lecturers</th>
                  <th>Courses</th>
                  <th>Results</th>
                </tr>
              </thead>
              <tbody>
                {departmentOverview.map(dept => (
                  <tr key={dept.id}>
                    <td>{dept.name}</td>
                    <td>{dept.faculty}</td>
                    <td>{dept.students}</td>
                    <td>{dept.lecturers}</td>
                    <td>{dept.courses}</td>
                    <td>{dept.results}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* UPCOMING ACADEMIC EVENTS */}
        <div className="dashboard-section">
          <h2>Upcoming Academic Events</h2>
          <div className="events-list">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="event-item">
                  <div className="event-header">
                    <span className="event-title">{event.title}</span>
                    <span className="event-type">{event.type}</span>
                  </div>
                  <div className="event-dates">
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </div>
                  <div className="event-description">{event.description}</div>
                </div>
              ))
            ) : (
              <p>No upcoming events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;