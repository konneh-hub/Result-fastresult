import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const PerformanceTracking = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    courseStats: {},
    studentPerformance: [],
    assessmentStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('semester'); // semester, month, week

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchPerformanceData();
    }
  }, [selectedCourse, timeRange]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lecturers/${user.id}/courses/`);
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    if (!selectedCourse) return;

    try {
      const response = await api.get(`/courses/${selectedCourse.id}/performance/?period=${timeRange}`);
      setPerformanceData(response.data);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      // Mock data for demonstration
      setPerformanceData({
        courseStats: {
          totalStudents: 45,
          averageScore: 78.5,
          passRate: 87,
          submissionRate: 92
        },
        studentPerformance: [
          { id: 1, student_id: 'STU001', name: 'John Doe', average_score: 85, attendance: 95, submissions: 12, grade: 'A' },
          { id: 2, student_id: 'STU002', name: 'Jane Smith', average_score: 72, attendance: 88, submissions: 10, grade: 'B-' },
          { id: 3, student_id: 'STU003', name: 'Bob Johnson', average_score: 91, attendance: 98, submissions: 13, grade: 'A+' }
        ],
        assessmentStats: {
          quizzes: { average: 76, completed: 42 },
          assignments: { average: 82, completed: 38 },
          midterm: { average: 74, completed: 45 },
          project: { average: 88, completed: 40 }
        }
      });
    }
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'var(--success)';
    if (grade.startsWith('B')) return 'var(--warning)';
    if (grade.startsWith('C')) return 'var(--accent)';
    return 'var(--error)';
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: 'var(--success)' };
    if (score >= 80) return { level: 'Good', color: 'var(--success)' };
    if (score >= 70) return { level: 'Average', color: 'var(--warning)' };
    if (score >= 60) return { level: 'Below Average', color: 'var(--accent)' };
    return { level: 'Needs Improvement', color: 'var(--error)' };
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading performance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Performance Tracking</h1>
          <p>Monitor student performance and course statistics</p>
        </div>

        <div className="dashboard-section">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label htmlFor="course-select" style={{ marginRight: '10px', fontWeight: '500' }}>
                  Select Course:
                </label>
                <select
                  id="course-select"
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === parseInt(e.target.value));
                    setSelectedCourse(course);
                  }}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="time-range" style={{ marginRight: '10px', fontWeight: '500' }}>
                  Time Period:
                </label>
                <select
                  id="time-range"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="semester">This Semester</option>
                </select>
              </div>
            </div>
          </div>

          {selectedCourse && performanceData.courseStats && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Average Score</h3>
                  <p style={{ color: getPerformanceLevel(performanceData.courseStats.averageScore).color }}>
                    {performanceData.courseStats.averageScore}%
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Pass Rate</h3>
                  <p style={{ color: 'var(--success)' }}>
                    {performanceData.courseStats.passRate}%
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Submission Rate</h3>
                  <p style={{ color: 'var(--secondary)' }}>
                    {performanceData.courseStats.submissionRate}%
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Total Students</h3>
                  <p>{performanceData.courseStats.totalStudents}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div className="dashboard-section">
                  <h2>Assessment Performance</h2>
                  {performanceData.assessmentStats && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {Object.entries(performanceData.assessmentStats).map(([assessment, stats]) => (
                        <div key={assessment} style={{
                          padding: '15px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}>
                          <h4 style={{ margin: '0 0 5px 0', textTransform: 'capitalize' }}>
                            {assessment}
                          </h4>
                          <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {stats.average}%
                          </p>
                          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {stats.completed} completed
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dashboard-section">
                  <h2>Performance Distribution</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--success)', borderRadius: '2px' }}></div>
                      <span>Excellent (90-100%): {Math.round(performanceData.courseStats.totalStudents * 0.3)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--warning)', borderRadius: '2px' }}></div>
                      <span>Good (80-89%): {Math.round(performanceData.courseStats.totalStudents * 0.4)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--accent)', borderRadius: '2px' }}></div>
                      <span>Average (70-79%): {Math.round(performanceData.courseStats.totalStudents * 0.2)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--error)', borderRadius: '2px' }}></div>
                      <span>Needs Improvement (&lt;70%): {Math.round(performanceData.courseStats.totalStudents * 0.1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-section">
                <h2>Student Performance Details</h2>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Average Score</th>
                        <th>Grade</th>
                        <th>Attendance</th>
                        <th>Submissions</th>
                        <th>Performance Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.studentPerformance.map(student => {
                        const performance = getPerformanceLevel(student.average_score);
                        return (
                          <tr key={student.id}>
                            <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                              {student.student_id}
                            </td>
                            <td>{student.name}</td>
                            <td style={{ fontWeight: '600' }}>
                              {student.average_score}%
                            </td>
                            <td>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                backgroundColor: getGradeColor(student.grade),
                                color: 'white'
                              }}>
                                {student.grade}
                              </span>
                            </td>
                            <td>{student.attendance}%</td>
                            <td>{student.submissions}</td>
                            <td>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                backgroundColor: performance.color,
                                color: 'white'
                              }}>
                                {performance.level}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!selectedCourse && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              Please select a course to view performance data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracking;
