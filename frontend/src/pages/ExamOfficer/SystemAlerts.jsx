import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const SystemAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/management/system-alerts/');
      setAlerts(response.data);
    } catch (err) {
      setError('Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (id) => {
    try {
      await api.post(`/management/dismiss-alert/${id}/`);
      fetchAlerts();
    } catch (err) {
      setError('Failed to dismiss alert.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>System Alerts</h1>
        </div>
        {error && <div className="error">{error}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert ${alert.severity}`}>
                <h3>{alert.title}</h3>
                <p>{alert.message}</p>
                <small>{alert.timestamp}</small>
                <button onClick={() => dismissAlert(alert.id)}>Dismiss</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAlerts;
