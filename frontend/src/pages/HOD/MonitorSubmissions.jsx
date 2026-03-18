import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import './HOD.css';

const MonitorSubmissions = () => {
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, verified

  useEffect(() => {
    fetchSubmissionData();
  }, [user]);

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);

      const departmentId = user?.department_id || user?.department?.id;
      if (!departmentId) {
        setError('Department not assigned to this account. Please contact an administrator.');
        return;
      }

      // Fetch department courses
      const coursesResponse = await api.get(`/departments/${departmentId}/courses/`);
      setCourses(coursesResponse.data);

      // Fetch department lecturers
      const lecturersResponse = await api.get(`/departments/${departmentId}/lecturers/`);
      setLecturers(lecturersResponse.data);

      // Fetch results for department courses
      const resultsResponse = await api.get('/results/');
      const departmentResults = resultsResponse.data.filter(
        result => result.course_registration?.course?.department === departmentId
      );

      // Group results by course and lecturer
      const submissionMap = {};

      coursesResponse.data.forEach(course => {
        lecturersResponse.data.forEach(lecturer => {
          const key = `${course.id}-${lecturer.id}`;
          submissionMap[key] = {
            course: course,
            lecturer: lecturer,
            results: [],
            status: 'pending'
          };
        });
      });

      // Populate with actual results
      departmentResults.forEach(result => {
        const courseId = result.course_registration?.course?.id;
        const lecturerId = result.lecturer?.id;

        if (courseId && lecturerId) {
          const key = `${courseId}-${lecturerId}`;
          if (submissionMap[key]) {
            submissionMap[key].results.push(result);
            submissionMap[key].status = result.status || 'submitted';
          }
        }
      });

      const submissionArray = Object.values(submissionMap);
      setSubmissions(submissionArray);

    } catch (err) {
      setError('Failed to load submission data');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubmissions = () => {
    if (filter === 'all') return submissions;
    return submissions.filter(submission => submission.status === filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'var(--success)';
      case 'submitted': return 'var(--warning)';
      case 'pending': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const submitted = submissions.filter(s => s.status === 'submitted').length;
    const verified = submissions.filter(s => s.status === 'verified').length;
    const pending = total - submitted - verified;

    return { total, submitted, verified, pending };
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading submission monitoring data...</div>
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

  const stats = getSubmissionStats();
  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Monitor Result Submissions</h1>
          <p>Track result submission progress across courses and lecturers</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Expected Submissions</h3>
            <p>{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Submitted</h3>
            <p style={{ color: 'var(--warning)' }}>{stats.submitted}</p>
          </div>
          <div className="stat-card">
            <h3>Verified</h3>
            <p style={{ color: 'var(--success)' }}>{stats.verified}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p style={{ color: 'var(--error)' }}>{stats.pending}</p>
          </div>
          <div className="stat-card">
            <h3>Completion Rate</h3>
            <p>{stats.total ? Math.round(((stats.submitted + stats.verified) / stats.total) * 100) : 0}%</p>
          </div>
        </div>

        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Submission Status</h2>
            <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
              >
                <option value="all">All Submissions</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <p>No submissions found for the selected filter.</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Lecturer</th>
                  <th>Status</th>
                  <th>Results Count</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission, index) => (
                  <tr key={`${submission.course.id}-${submission.lecturer.id}`}>
                    <td>{submission.course.code}</td>
                    <td>{submission.course.name}</td>
                    <td>
                      {submission.lecturer.user.first_name} {submission.lecturer.user.last_name}
                    </td>
                    <td>
                      <span style={{
                        color: getStatusColor(submission.status),
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {submission.status}
                      </span>
                    </td>
                    <td>{submission.results.length}</td>
                    <td>
                      {submission.results.length > 0 ?
                        new Date(submission.results[0].submitted_at).toLocaleDateString() :
                        'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Submission Summary by Course</h2>
          <table className="results-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Total Lecturers</th>
                <th>Submitted</th>
                <th>Verified</th>
                <th>Pending</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => {
                const courseSubmissions = submissions.filter(s => s.course.id === course.id);
                const submitted = courseSubmissions.filter(s => s.status === 'submitted').length;
                const verified = courseSubmissions.filter(s => s.status === 'verified').length;
                const pending = courseSubmissions.length - submitted - verified;
                const progress = courseSubmissions.length ?
                  Math.round(((submitted + verified) / courseSubmissions.length) * 100) : 0;

                return (
                  <tr key={course.id}>
                    <td>{course.code} - {course.name}</td>
                    <td>{courseSubmissions.length}</td>
                    <td>{submitted}</td>
                    <td>{verified}</td>
                    <td>{pending}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '100px',
                          height: '8px',
                          backgroundColor: 'var(--border)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: progress === 100 ? 'var(--success)' : 'var(--warning)',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                        <span>{progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonitorSubmissions;
