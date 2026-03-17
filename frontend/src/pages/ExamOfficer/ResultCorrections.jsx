import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const ResultCorrections = () => {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCorrections();
  }, []);

  const fetchCorrections = async () => {
    setLoading(true);
    try {
      const response = await api.get('/management/result-corrections/');
      setCorrections(response.data);
    } catch (err) {
      setError('Failed to load correction requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleCorrection = async (id, action) => {
    try {
      await api.post(`/management/handle-correction/${id}/`, { action });
      fetchCorrections();
    } catch (err) {
      setError('Failed to handle correction.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Result Corrections</h1>
        </div>
        {error && <div className="error">{error}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Request</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {corrections.map(correction => (
                <tr key={correction.id}>
                  <td>{correction.student_name}</td>
                  <td>{correction.course_name}</td>
                  <td>{correction.request_details}</td>
                  <td>{correction.status}</td>
                  <td>
                    {correction.status === 'pending' && (
                      <>
                        <button onClick={() => handleCorrection(correction.id, 'approve')}>Approve</button>
                        <button onClick={() => handleCorrection(correction.id, 'reject')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ResultCorrections;
