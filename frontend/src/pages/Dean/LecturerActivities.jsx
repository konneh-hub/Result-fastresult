import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const LecturerActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get('/dean/lecturer-activities/');
        setActivities(response.data);
      } catch (err) {
        console.error('Error fetching lecturer activities:', err);
        setError('Failed to load lecturer activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <div className="loading">Loading activities...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="lecturer-activities-page">
      <h1>Lecturer Activities</h1>
      <p className="page-description">Monitor teaching, result submission, and approval activity for lecturer accounts.</p>

      {activities.length === 0 ? (
        <div className="no-data">
          <p>No activities recorded yet.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Activity</th>
              <th>Details</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(activity => (
              <tr key={activity.id}>
                <td>{activity.user}</td>
                <td>{activity.activity}</td>
                <td>{activity.details || '—'}</td>
                <td>{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LecturerActivities;
