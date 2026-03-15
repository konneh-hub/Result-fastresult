import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/auth/notifications/');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/`, { is_read: true });
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      <p className="page-description">Stay updated with system announcements and important messages.</p>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications available</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
            >
              <div className="notification-header">
                <h3>{notification.title}</h3>
                <span className="notification-date">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="notification-content">
                <p>{notification.message}</p>
              </div>
              <div className="notification-meta">
                <span className="recipient-type">{notification.recipient_type}</span>
                {!notification.is_read && (
                  <button
                    className="mark-read-btn"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
