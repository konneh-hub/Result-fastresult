import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const PendingApprovals = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await api.get('/management/pending-approvals/');
      setResults(response.data);
    } catch (err) {
      setError('Failed to load pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  const approveResult = async (id) => {
    try {
      await api.post(`/management/approve-result/${id}/`);
      fetchResults();
    } catch (err) {
      setError('Failed to approve result.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Pending Approvals</h1>
        </div>
        {error && <div className="error">{error}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Lecturer</th>
                <th>Submitted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id}>
                  <td>{result.course_name}</td>
                  <td>{result.lecturer_name}</td>
                  <td>{result.submitted_date}</td>
                  <td>
                    <button onClick={() => approveResult(result.id)}>Approve</button>
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

export default PendingApprovals;
