import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ReturnResults = () => {
  const [returnedActivities, setReturnedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReturnedActivities = async () => {
      try {
        const response = await api.get('/dean/lecturer-activities/');
        const returned = response.data.filter(activity =>
          activity.activity?.toLowerCase().includes('returned')
        );
        setReturnedActivities(returned);
      } catch (err) {
        console.error('Error fetching returned activities:', err);
        setError('Failed to load returned submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchReturnedActivities();
  }, []);

  if (loading) {
    return <div className="loading">Loading returned submissions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="return-results-page">
      <h1>Returned Submissions</h1>
      <p className="page-description">
        View submissions that have been returned for correction. These are logged in the activity feed.
      </p>

      {returnedActivities.length === 0 ? (
        <div className="no-data">
          <p>No returned submissions found.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>By</th>
              <th>Activity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {returnedActivities.map(activity => (
              <tr key={activity.id}>
                <td>{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '–'}</td>
                <td>{activity.user || 'System'}</td>
                <td>{activity.activity}</td>
                <td>{activity.details || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReturnResults;
