import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ApproveResults = () => {
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const response = await api.get('/dean/results/approve/');
        setApproved(response.data);
      } catch (err) {
        console.error('Error fetching approved results:', err);
        setError('Failed to load approved results');
      } finally {
        setLoading(false);
      }
    };

    fetchApproved();
  }, []);

  if (loading) {
    return <div className="loading">Loading approved results...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="approve-results-page">
      <h1>Approved Results</h1>
      <p className="page-description">View verified results pending final approval.</p>

      {approved.length === 0 ? (
        <div className="no-data">
          <p>No approved result verifications found.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Verified By</th>
              <th>Verified At</th>
            </tr>
          </thead>
          <tbody>
            {approved.map(item => (
              <tr key={item.id}>
                <td>{item.course}</td>
                <td>{item.verified_by}</td>
                <td>{item.verified_at ? new Date(item.verified_at).toLocaleString() : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApproveResults;
