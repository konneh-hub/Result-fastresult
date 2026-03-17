import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import './HOD.css';

const LecturerWorkload = () => {
  const { user } = useContext(AuthContext);
  const [lecturers, setLecturers] = useState([]);
  const [workloadData, setWorkloadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLecturerWorkload();
  }, [user]);

  const fetchLecturerWorkload = async () => {
    try {
      setLoading(true);

      // Fetch department lecturers
      const lecturersResponse = await api.get(`/departments/${user.department_id}/lecturers/`);
      setLecturers(lecturersResponse.data);

      // Fetch course assignments for workload calculation
      const assignmentsResponse = await api.get('/course-assignments/');
      const departmentAssignments = assignmentsResponse.data.filter(
        assignment => assignment.course?.department === user.department_id
      );

      // Calculate workload per lecturer
      const workloadMap = {};
      lecturersResponse.data.forEach(lecturer => {
        workloadMap[lecturer.id] = {
          lecturer: lecturer,
          courses: [],
          totalStudents: 0,
          courseCount: 0
        };
      });

      // Process assignments
      for (const assignment of departmentAssignments) {
        if (workloadMap[assignment.lecturer?.id]) {
          workloadMap[assignment.lecturer.id].courses.push(assignment.course);
          workloadMap[assignment.lecturer.id].courseCount += 1;

          // Try to get enrollment count for the course
          try {
            const enrollmentResponse = await api.get(`/courses/${assignment.course.id}/enrollment/`);
            workloadMap[assignment.lecturer.id].totalStudents += enrollmentResponse.data.count || 0;
          } catch {
            // If enrollment data not available, continue
          }
        }
      }

      const workloadArray = Object.values(workloadMap);
      setWorkloadData(workloadArray);

    } catch (err) {
      setError('Failed to load lecturer workload data');
      console.error('Workload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadStatus = (courseCount) => {
    if (courseCount >= 5) return { status: 'High', color: 'var(--error)' };
    if (courseCount >= 3) return { status: 'Medium', color: 'var(--warning)' };
    return { status: 'Low', color: 'var(--success)' };
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading lecturer workload data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Lecturer Workload Distribution</h1>
          <p>Monitor teaching load and course assignments across department lecturers</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Lecturers</h3>
            <p>{lecturers.length}</p>
          </div>
          <div className="stat-card">
            <h3>Assigned Courses</h3>
            <p>{workloadData.reduce((sum, data) => sum + data.courseCount, 0)}</p>
          </div>
          <div className="stat-card">
            <h3>Average Courses/Lecturer</h3>
            <p>{lecturers.length ? (workloadData.reduce((sum, data) => sum + data.courseCount, 0) / lecturers.length).toFixed(1) : 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Students</h3>
            <p>{workloadData.reduce((sum, data) => sum + data.totalStudents, 0)}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Lecturer Workload Overview</h2>
          {workloadData.length === 0 ? (
            <p>No lecturer data available.</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Lecturer Name</th>
                  <th>Employee ID</th>
                  <th>Courses Assigned</th>
                  <th>Total Students</th>
                  <th>Average Class Size</th>
                  <th>Workload Status</th>
                </tr>
              </thead>
              <tbody>
                {workloadData.map(data => {
                  const workloadStatus = getWorkloadStatus(data.courseCount);
                  const avgClassSize = data.courseCount > 0 ? Math.round(data.totalStudents / data.courseCount) : 0;

                  return (
                    <tr key={data.lecturer.id}>
                      <td>
                        {data.lecturer.user.first_name} {data.lecturer.user.last_name}
                      </td>
                      <td>{data.lecturer.employee_id}</td>
                      <td>{data.courseCount}</td>
                      <td>{data.totalStudents}</td>
                      <td>{avgClassSize}</td>
                      <td>
                        <span style={{ color: workloadStatus.color, fontWeight: 'bold' }}>
                          {workloadStatus.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Course Assignments Details</h2>
          {workloadData.map(data => (
            data.courses.length > 0 && (
              <div key={data.lecturer.id} style={{ marginBottom: '20px' }}>
                <h3>{data.lecturer.user.first_name} {data.lecturer.user.last_name}</h3>
                <table className="results-table" style={{ marginBottom: '15px' }}>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Estimated Enrollment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.courses.map(course => (
                      <tr key={course.id}>
                        <td>{course.code}</td>
                        <td>{course.name}</td>
                        <td>N/A</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ))}
        </div>

        <div className="dashboard-section">
          <h2>Workload Analysis</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Lecturers with High Workload (5+ courses):</strong> {
                workloadData.filter(data => data.courseCount >= 5).length
              }
            </div>
            <div className="info-item">
              <strong>Lecturers with Medium Workload (3-4 courses):</strong> {
                workloadData.filter(data => data.courseCount >= 3 && data.courseCount < 5).length
              }
            </div>
            <div className="info-item">
              <strong>Lecturers with Low Workload (1-2 courses):</strong> {
                workloadData.filter(data => data.courseCount >= 1 && data.courseCount < 3).length
              }
            </div>
            <div className="info-item">
              <strong>Unassigned Lecturers:</strong> {
                workloadData.filter(data => data.courseCount === 0).length
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerWorkload;
