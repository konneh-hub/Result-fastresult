import React, { useEffect, useState, useContext } from 'react';
import AuthContext from "../../contexts/AuthContext.jsx";
import api from '../../services/api';
import './HOD.css';

const SubmitToDean = () => {
  const { user } = useContext(AuthContext);
  const [verifiedResults, setVerifiedResults] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [submissionNote, setSubmissionNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchVerifiedResults();
  }, [user]);

  const fetchVerifiedResults = async () => {
    try {
      setLoading(true);

      const response = await api.get('/results/');
      const departmentVerifiedResults = response.data.filter(
        result => result.course_registration?.course?.department === user.department_id &&
                 result.status === 'verified'
      );

      setVerifiedResults(departmentVerifiedResults);

    } catch (err) {
      console.error('Error fetching verified results:', err);
      setMessage('Failed to load verified results');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (resultId) => {
    setSelectedResults(prev =>
      prev.includes(resultId)
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const handleSelectAll = () => {
    if (selectedResults.length === verifiedResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(verifiedResults.map(result => result.id));
    }
  };

  const handleSubmitToDean = async () => {
    if (selectedResults.length === 0) {
      setMessage('Please select at least one result to submit');
      setMessageType('error');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');

      // Update selected results status to 'submitted_to_dean'
      const updatePromises = selectedResults.map(resultId =>
        api.patch(`/results/${resultId}/`, {
          status: 'submitted_to_dean',
          submitted_to_dean_at: new Date().toISOString(),
          submission_note: submissionNote
        })
      );

      await Promise.all(updatePromises);

      setMessage(`${selectedResults.length} result(s) successfully submitted to dean for approval!`);
      setMessageType('success');
      setSelectedResults([]);
      setSubmissionNote('');
      fetchVerifiedResults();

    } catch (err) {
      console.error('Error submitting results to dean:', err);
      setMessage('Failed to submit results to dean');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading verified results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Submit Results to Dean</h1>
          <p>Forward verified results to the dean for final approval</p>
        </div>

        {message && (
          <div className={messageType === 'success' ? 'success' : 'error'}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Verified Results Ready for Submission</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {selectedResults.length} of {verifiedResults.length} selected
              </span>
              <button
                className="btn"
                onClick={handleSelectAll}
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                {selectedResults.length === verifiedResults.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {verifiedResults.length === 0 ? (
            <p>No verified results available for submission to dean.</p>
          ) : (
            <>
              <table className="results-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedResults.length === verifiedResults.length && verifiedResults.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Lecturer</th>
                    <th>Grade</th>
                    <th>Score</th>
                    <th>Verified Date</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedResults.map(result => (
                    <tr key={result.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedResults.includes(result.id)}
                          onChange={() => handleSelectResult(result.id)}
                        />
                      </td>
                      <td>
                        {result.course_registration?.student?.user?.first_name}{' '}
                        {result.course_registration?.student?.user?.last_name}
                      </td>
                      <td>{result.course_registration?.course?.code}</td>
                      <td>
                        {result.lecturer?.user?.first_name} {result.lecturer?.user?.last_name}
                      </td>
                      <td>{result.grade || 'N/A'}</td>
                      <td>{result.score || 'N/A'}</td>
                      <td>{result.verified_at ? new Date(result.verified_at).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedResults.length > 0 && (
                <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'var(--background)', borderRadius: '8px' }}>
                  <h3>Submission Details</h3>
                  <div className="form-group">
                    <label htmlFor="submission-note">
                      <strong>Submission Note (Optional):</strong>
                    </label>
                    <textarea
                      id="submission-note"
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      placeholder="Add any additional notes for the dean..."
                      rows="3"
                      style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                    />
                  </div>

                  <div style={{ marginTop: '15px' }}>
                    <button
                      className="btn"
                      onClick={handleSubmitToDean}
                      disabled={submitting}
                      style={{ backgroundColor: 'var(--success)' }}
                    >
                      {submitting ? 'Submitting...' : `Submit ${selectedResults.length} Result(s) to Dean`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Submission Summary</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Total Verified Results:</strong> {verifiedResults.length}
            </div>
            <div className="info-item">
              <strong>Selected for Submission:</strong> {selectedResults.length}
            </div>
            <div className="info-item">
              <strong>Remaining to Submit:</strong> {verifiedResults.length - selectedResults.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitToDean;
