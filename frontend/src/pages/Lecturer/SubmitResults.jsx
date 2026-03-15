import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const SubmitResults = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [submissionData, setSubmissionData] = useState({
    notes: '',
    submit_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lecturers/${user.id}/courses/`);
      // Filter courses that are ready for submission (have calculated grades)
      const readyCourses = response.data.filter(course =>
        course.status === 'grades_calculated' || course.status === 'ready_for_submission'
      );
      setCourses(readyCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelection = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map(course => course.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      setMessage('Please select at least one course to submit');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      await api.post('/results/submit/', {
        courses: selectedCourses,
        notes: submissionData.notes,
        submit_date: submissionData.submit_date,
        lecturer: user.id
      });

      setMessage('Results submitted successfully for departmental approval!');
      setSelectedCourses([]);
      setSubmissionData({ notes: '', submit_date: new Date().toISOString().split('T')[0] });

      // Refresh courses list
      fetchCourses();

      setTimeout(() => setMessage(''), 5000);

    } catch (err) {
      console.error('Error submitting results:', err);
      if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage('Error submitting results. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading submit results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Submit Results for Approval</h1>
          <p>Submit completed course results for departmental verification and approval</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('successfully') ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <h2>Courses Ready for Submission</h2>

          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
              <h3>No courses ready for submission</h3>
              <p>Courses must have calculated grades before they can be submitted for approval.</p>
              <p style={{ marginTop: '10px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => window.location.href = '/lecturer/calculate-grades'}
                >
                  Calculate Grades
                </button>
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <button
                    className="btn btn-secondary"
                    onClick={handleSelectAll}
                    style={{ fontSize: '14px' }}
                  >
                    {selectedCourses.length === courses.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>
                    {selectedCourses.length} of {courses.length} courses selected
                  </span>
                </div>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCourses.length === courses.length && courses.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Students</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCourseSelection(course.id)}
                          />
                        </td>
                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                          {course.code}
                        </td>
                        <td>{course.name}</td>
                        <td>{course.enrolled_students || 0}</td>
                        <td>
                          <span className={`status-badge ${
                            course.status === 'ready_for_submission' ? 'status-approved' :
                            course.status === 'grades_calculated' ? 'status-submitted' :
                            'status-pending'
                          }`}>
                            {course.status?.replace('_', ' ').charAt(0).toUpperCase() + course.status?.slice(1).replace('_', ' ') || 'Ready'}
                          </span>
                        </td>
                        <td>{course.updated_at ? new Date(course.updated_at).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedCourses.length > 0 && (
                <div className="dashboard-section" style={{ marginTop: '20px' }}>
                  <h2>Submission Details</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="submit-date">Submission Date</label>
                      <input
                        type="date"
                        id="submit-date"
                        value={submissionData.submit_date}
                        onChange={(e) => setSubmissionData(prev => ({ ...prev, submit_date: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="notes">Additional Notes (Optional)</label>
                      <textarea
                        id="notes"
                        value={submissionData.notes}
                        onChange={(e) => setSubmissionData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional notes for the department head..."
                        rows="4"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--background)', borderRadius: '4px' }}>
                    <h3>Submission Summary</h3>
                    <p><strong>Courses Selected:</strong> {selectedCourses.length}</p>
                    <p><strong>Submission Date:</strong> {new Date(submissionData.submit_date).toLocaleDateString()}</p>
                    {submissionData.notes && (
                      <p><strong>Notes:</strong> {submissionData.notes}</p>
                    )}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '10px' }}>
                      Once submitted, these results will be sent to the Department Head for verification and approval.
                      You will be notified of the approval status.
                    </p>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button
                      className="btn btn-success"
                      onClick={handleSubmit}
                      disabled={submitting}
                      style={{ fontSize: '16px', padding: '12px 24px' }}
                    >
                      {submitting ? 'Submitting...' : `Submit ${selectedCourses.length} Course${selectedCourses.length > 1 ? 's' : ''} for Approval`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Submission Guidelines</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h3>✅ Requirements</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>All student scores must be entered</li>
                <li>Grades must be calculated</li>
                <li>Continuous assessment completed</li>
                <li>Final exam scores recorded</li>
              </ul>
            </div>
            <div>
              <h3>📋 Process</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Submit to Department Head</li>
                <li>Wait for verification</li>
                <li>Address any corrections requested</li>
                <li>Final approval and publishing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitResults;
