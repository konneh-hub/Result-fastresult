import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const LockResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await api.get('/management/approved-results/');
      setResults(response.data);
    } catch (err) {
      setError('Failed to load approved results.');
    } finally {
      setLoading(false);
    }
  };

  const lockResult = async (id) => {
    try {
      await api.post(`/management/lock-result/${id}/`);
      fetchResults();
    } catch (err) {
      setError('Failed to lock result.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Lock Results</h1>
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id}>
                  <td>{result.course_name}</td>
                  <td>{result.lecturer_name}</td>
                  <td>{result.status}</td>
                  <td>
                    {result.status === 'approved' && (
                      <button onClick={() => lockResult(result.id)}>Lock</button>
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

export default LockResults;
