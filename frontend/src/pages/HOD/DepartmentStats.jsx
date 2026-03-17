import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import './HOD.css';

const DepartmentStats = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [studentStats, setStudentStats] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartmentStats();
  }, [user]);

  const fetchDepartmentStats = async () => {
    try {
      setLoading(true);

      // Fetch department overview
      const overviewResponse = await api.get(`/departments/${user.department_id}/`);
      setStats(overviewResponse.data);

      // Fetch students by program
      const studentsResponse = await api.get(`/departments/${user.department_id}/students/`);
      const programStats = {};
      studentsResponse.data.forEach(student => {
        const programName = student.program?.name || 'Unknown';
        programStats[programName] = (programStats[programName] || 0) + 1;
      });
      setStudentStats(Object.entries(programStats));

      // Fetch courses and their enrollment
      const coursesResponse = await api.get(`/departments/${user.department_id}/courses/`);
      const courseData = await Promise.all(
        coursesResponse.data.map(async (course) => {
          try {
            const enrollmentResponse = await api.get(`/courses/${course.id}/enrollment/`);
            return {
              ...course,
              enrolled: enrollmentResponse.data.count || 0
            };
          } catch {
            return { ...course, enrolled: 0 };
          }
        })
      );
      setCourseStats(courseData);

    } catch (err) {
      setError('Failed to load department statistics');
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading department statistics...</div>
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
          <h1>Department Statistics</h1>
          <p>Overview of {stats.name} department performance and metrics</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Students</h3>
            <p>{stats.student_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Lecturers</h3>
            <p>{stats.lecturer_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p>{stats.course_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Active Programs</h3>
            <p>{stats.program_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Results Submitted</h3>
            <p>{stats.result_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Average Class Size</h3>
            <p>{stats.student_count && stats.course_count ?
                Math.round(stats.student_count / stats.course_count) : 0}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Students by Program</h2>
          {studentStats.length === 0 ? (
            <p>No student data available.</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Number of Students</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.map(([program, count]) => (
                  <tr key={program}>
                    <td>{program}</td>
                    <td>{count}</td>
                    <td>
                      {stats.student_count ?
                        Math.round((count / stats.student_count) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Course Enrollment Statistics</h2>
          {courseStats.length === 0 ? (
            <p>No course data available.</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Enrolled Students</th>
                  <th>Capacity Status</th>
                </tr>
              </thead>
              <tbody>
                {courseStats.map(course => (
                  <tr key={course.id}>
                    <td>{course.code}</td>
                    <td>{course.name}</td>
                    <td>{course.enrolled}</td>
                    <td>
                      <span style={{
                        color: course.enrolled > 30 ? 'var(--error)' :
                               course.enrolled > 20 ? 'var(--warning)' : 'var(--success)'
                      }}>
                        {course.enrolled > 30 ? 'Over Capacity' :
                         course.enrolled > 20 ? 'Near Capacity' : 'Available'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Lecturer Workload Summary</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Average Courses per Lecturer:</strong> {
                stats.lecturer_count && stats.course_count ?
                (stats.course_count / stats.lecturer_count).toFixed(1) : 0
              }
            </div>
            <div className="info-item">
              <strong>Student-Lecturer Ratio:</strong> {
                stats.lecturer_count && stats.student_count ?
                Math.round(stats.student_count / stats.lecturer_count) : 0
              }:1
            </div>
            <div className="info-item">
              <strong>Total Course Assignments:</strong> {stats.course_count || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentStats;
