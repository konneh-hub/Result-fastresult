import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import './HOD.css';

const ReturnCorrections = () => {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchResults();
  }, [user]);

  const fetchResults = async () => {
    try {
      setLoading(true);

      const response = await api.get('/results/');
      const departmentResults = response.data.filter(
        result => result.course_registration?.course?.department === user.department_id &&
                 (result.status === 'verified' || result.status === 'submitted')
      );

      setResults(departmentResults);

    } catch (err) {
      console.error('Error fetching results:', err);
      setMessage('Failed to load results');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnForCorrection = async (resultId) => {
    if (!correctionReason.trim()) {
      setMessage('Please provide a reason for returning the result');
      setMessageType('error');
      return;
    }

    try {
      setReturning(true);
      setMessage('');

      await api.patch(`/results/${resultId}/`, {
        status: 'returned',
        correction_reason: correctionReason,
        returned_by: user.id,
        returned_at: new Date().toISOString()
      });

      setMessage('Result returned to lecturer for corrections!');
      setMessageType('success');
      setSelectedResult(null);
      setCorrectionReason('');
      fetchResults();

    } catch (err) {
      console.error('Error returning result:', err);
      setMessage('Failed to return result for correction');
      setMessageType('error');
    } finally {
      setReturning(false);
    }
  };

  const openReturnModal = (result) => {
    setSelectedResult(result);
    setCorrectionReason('');
  };

  const closeModal = () => {
    setSelectedResult(null);
    setCorrectionReason('');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading results for corrections...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Return Results for Corrections</h1>
          <p>Return incorrect or incomplete results to lecturers for corrections</p>
        </div>

        {message && (
          <div className={messageType === 'success' ? 'success' : 'error'}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <h2>Results Available for Correction</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
            Select results that need corrections and provide detailed feedback to lecturers.
          </p>

          {results.length === 0 ? (
            <p>No results available for correction.</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Lecturer</th>
                  <th>Grade</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr key={result.id}>
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
                    <td>
                      <span style={{
                        color: result.status === 'verified' ? 'var(--success)' : 'var(--warning)',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {result.status}
                      </span>
                    </td>
                    <td>{new Date(result.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn"
                        style={{ backgroundColor: 'var(--warning)', color: 'var(--text-primary)' }}
                        onClick={() => openReturnModal(result)}
                      >
                        Return for Correction
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedResult && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Return Result for Correction</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>

              <div style={{ padding: '20px' }}>
                <div className="info-grid" style={{ marginBottom: '20px' }}>
                  <div className="info-item">
                    <strong>Student:</strong> {selectedResult.course_registration?.student?.user?.first_name} {selectedResult.course_registration?.student?.user?.last_name}
                  </div>
                  <div className="info-item">
                    <strong>Course:</strong> {selectedResult.course_registration?.course?.name} ({selectedResult.course_registration?.course?.code})
                  </div>
                  <div className="info-item">
                    <strong>Lecturer:</strong> {selectedResult.lecturer?.user?.first_name} {selectedResult.lecturer?.user?.last_name}
                  </div>
                  <div className="info-item">
                    <strong>Current Grade:</strong> {selectedResult.grade || 'Not assigned'}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="correction-reason">
                    <strong>Reason for Correction:</strong>
                  </label>
                  <textarea
                    id="correction-reason"
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Please provide detailed feedback on what needs to be corrected..."
                    rows="4"
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    className="btn"
                    style={{ backgroundColor: 'var(--warning)', color: 'var(--text-primary)' }}
                    onClick={() => handleReturnForCorrection(selectedResult.id)}
                    disabled={returning || !correctionReason.trim()}
                  >
                    {returning ? 'Returning...' : 'Return for Correction'}
                  </button>
                  <button
                    className="btn"
                    onClick={closeModal}
                    style={{ backgroundColor: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnCorrections;
