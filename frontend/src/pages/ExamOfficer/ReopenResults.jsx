import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const ReopenResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await api.get('/management/locked-published-results/');
      setResults(response.data);
    } catch (err) {
      setError('Failed to load results.');
    } finally {
      setLoading(false);
    }
  };

  const reopenResult = async (id) => {
    if (window.confirm('Are you sure you want to reopen this result?')) {
      try {
        await api.post(`/management/reopen-result/${id}/`);
        fetchResults();
      } catch (err) {
        setError('Failed to reopen result.');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Reopen Results</h1>
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
                    {(result.status === 'locked' || result.status === 'published') && (
                      <button onClick={() => reopenResult(result.id)}>Reopen</button>
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

export default ReopenResults;
