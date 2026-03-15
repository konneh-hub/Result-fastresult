import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import './HOD.css';

const VerifyResults = () => {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [filter, setFilter] = useState('submitted'); // submitted, verified, rejected

  useEffect(() => {
    fetchResults();
  }, [user, filter]);

  const fetchResults = async () => {
    try {
      setLoading(true);

      const response = await api.get('/results/');
      const departmentResults = response.data.filter(
        result => result.course_registration?.course?.department === user.department_id &&
                 (filter === 'all' || result.status === filter)
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

  const handleVerifyResult = async (resultId, action) => {
    try {
      setVerifying(true);
      setMessage('');

      if (action === 'verify') {
        await api.patch(`/results/${resultId}/verify/`, {});
        setMessage('Result verified successfully!');
        setMessageType('success');
      } else if (action === 'reject') {
        await api.patch(`/results/${resultId}/`, { status: 'rejected' });
        setMessage('Result rejected and returned to lecturer');
        setMessageType('success');
      }

      fetchResults();

    } catch (err) {
      console.error('Error updating result:', err);
      setMessage('Failed to update result status');
      setMessageType('error');
    } finally {
      setVerifying(false);
    }
  };

  const viewResultDetails = (result) => {
    setSelectedResult(result);
  };

  const closeModal = () => {
    setSelectedResult(null);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading results for verification...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Verify Lecturer Results</h1>
          <p>Review and approve/reject results submitted by lecturers</p>
        </div>

        {message && (
          <div className={messageType === 'success' ? 'success' : 'error'}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Results for Verification</h2>
            <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
              >
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <p>No results found for the selected filter.</p>
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
                        color: result.status === 'verified' ? 'var(--success)' :
                               result.status === 'rejected' ? 'var(--error)' : 'var(--warning)',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {result.status}
                      </span>
                    </td>
                    <td>{new Date(result.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn"
                          onClick={() => viewResultDetails(result)}
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          View
                        </button>
                        {result.status === 'submitted' && (
                          <>
                            <button
                              className="btn"
                              style={{ backgroundColor: 'var(--success)', fontSize: '12px', padding: '5px 10px' }}
                              onClick={() => handleVerifyResult(result.id, 'verify')}
                              disabled={verifying}
                            >
                              Verify
                            </button>
                            <button
                              className="btn"
                              style={{ backgroundColor: 'var(--error)', fontSize: '12px', padding: '5px 10px' }}
                              onClick={() => handleVerifyResult(result.id, 'reject')}
                              disabled={verifying}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
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
                <h2>Result Details</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>

              <div style={{ padding: '20px' }}>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Student:</strong> {selectedResult.course_registration?.student?.user?.first_name} {selectedResult.course_registration?.student?.user?.last_name}
                  </div>
                  <div className="info-item">
                    <strong>Matric Number:</strong> {selectedResult.course_registration?.student?.matric_number}
                  </div>
                  <div className="info-item">
                    <strong>Course:</strong> {selectedResult.course_registration?.course?.name} ({selectedResult.course_registration?.course?.code})
                  </div>
                  <div className="info-item">
                    <strong>Lecturer:</strong> {selectedResult.lecturer?.user?.first_name} {selectedResult.lecturer?.user?.last_name}
                  </div>
                  <div className="info-item">
                    <strong>Grade:</strong> {selectedResult.grade || 'Not assigned'}
                  </div>
                  <div className="info-item">
                    <strong>Score:</strong> {selectedResult.score || 'Not assigned'}
                  </div>
                  <div className="info-item">
                    <strong>Status:</strong> {selectedResult.status}
                  </div>
                  <div className="info-item">
                    <strong>Submitted:</strong> {new Date(selectedResult.submitted_at).toLocaleString()}
                  </div>
                </div>

                {selectedResult.comments && (
                  <div style={{ marginTop: '20px' }}>
                    <strong>Comments:</strong>
                    <p>{selectedResult.comments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyResults;
