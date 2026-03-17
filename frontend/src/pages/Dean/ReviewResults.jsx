import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ReviewResults = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await api.get('/dean/results/review/');
        setSubmissions(response.data);
      } catch (err) {
        console.error('Error fetching result submissions:', err);
        setError('Failed to load result submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dean/results/review/');
      setSubmissions(response.data);
    } catch (err) {
      console.error('Error refreshing submissions:', err);
      setError('Failed to refresh submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (submissionId, action) => {
    setActionLoading(true);
    try {
      if (action === 'approve') {
        await api.post(`/dean/results/${submissionId}/approve/`);
      } else if (action === 'return') {
        await api.post(`/dean/results/${submissionId}/return/`);
      }

      await refresh();
    } catch (err) {
      console.error(`Error ${action}ing submission:`, err);
      setError(`Failed to ${action} submission. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="review-results-page">
      <h1>Review Result Submissions</h1>
      <p className="page-description">
        Review lecturer submissions ready for approval or return for corrections.
      </p>

      {submissions.length === 0 ? (
        <div className="no-data">
          <p>No submissions pending review.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Submitted By</th>
              <th>Submitted At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub.id}>
                <td>{sub.course}</td>
                <td>{sub.submitted_by}</td>
                <td>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '—'}</td>
                <td>
                  <button
                    className="btn-primary"
                    disabled={actionLoading}
                    onClick={() => handleAction(sub.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-outline"
                    disabled={actionLoading}
                    onClick={() => handleAction(sub.id, 'return')}
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReviewResults;
