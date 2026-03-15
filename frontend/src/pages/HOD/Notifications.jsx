import React, { useEffect, useState, useContext } from 'react';
import AuthContext from "../../contexts/AuthContext.jsx";
import api from '../../services/api';
import './HOD.css';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get('/notifications/');
      // Filter notifications for the department/university
      const departmentNotifications = response.data.filter(
        notification => notification.university === user.university_id
      );

      setNotifications(departmentNotifications);

    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/`, { is_read: true });
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(notif =>
          api.patch(`/notifications/${notif.id}/`, { is_read: true })
        )
      );

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.is_read);
      case 'read':
        return notifications.filter(n => n.is_read);
      default:
        return notifications;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'var(--error)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'announcement':
        return '📢';
      case 'alert':
        return '🚨';
      case 'reminder':
        return '⏰';
      case 'update':
        return '📝';
      default:
        return '📌';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading notifications...</div>
        </div>
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Department Notifications</h1>
          <p>Stay updated with announcements and important messages</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Notifications</h3>
            <p>{notifications.length}</p>
          </div>
          <div className="stat-card">
            <h3>Unread</h3>
            <p style={{ color: unreadCount > 0 ? 'var(--warning)' : 'var(--success)' }}>
              {unreadCount}
            </p>
          </div>
          <div className="stat-card">
            <h3>This Week</h3>
            <p>{notifications.filter(n => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(n.created_at) > weekAgo;
            }).length}</p>
          </div>
          <div className="stat-card">
            <h3>High Priority</h3>
            <p style={{ color: 'var(--error)' }}>
              {notifications.filter(n => n.priority?.toLowerCase() === 'high').length}
            </p>
          </div>
        </div>

        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Notifications</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
              {unreadCount > 0 && (
                <button
                  className="btn"
                  onClick={markAllAsRead}
                  style={{ backgroundColor: 'var(--secondary)' }}
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              {filter === 'unread' ? 'No unread notifications.' :
               filter === 'read' ? 'No read notifications.' :
               'No notifications available.'}
            </p>
          ) : (
            <div className="alerts-list">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`alert ${!notification.is_read ? 'unread' : ''}`}
                  style={{
                    borderLeftColor: getPriorityColor(notification.priority),
                    cursor: 'pointer',
                    opacity: notification.is_read ? 0.7 : 1
                  }}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                    setSelectedNotification(
                      selectedNotification?.id === notification.id ? null : notification
                    );
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>{getTypeIcon(notification.type)}</span>
                        {notification.title}
                        {!notification.is_read && (
                          <span style={{
                            backgroundColor: 'var(--warning)',
                            color: 'var(--text-primary)',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            NEW
                          </span>
                        )}
                      </h3>
                      <p style={{ margin: '0 0 5px 0' }}>{notification.message}</p>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span>From: {notification.sent_by_name || 'System'}</span>
                        <span>Priority: <span style={{ color: getPriorityColor(notification.priority) }}>
                          {notification.priority || 'Normal'}
                        </span></span>
                        <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {!notification.is_read && (
                        <button
                          className="btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          style={{ fontSize: '10px', padding: '3px 8px', backgroundColor: 'var(--success)' }}
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedNotification?.id === notification.id && (
                    <div style={{
                      marginTop: '15px',
                      padding: '15px',
                      backgroundColor: 'var(--background)',
                      borderRadius: '4px',
                      border: '1px solid var(--border)'
                    }}>
                      <h4>Full Details</h4>
                      <p><strong>Type:</strong> {notification.type}</p>
                      <p><strong>Priority:</strong> {notification.priority}</p>
                      <p><strong>Sender:</strong> {notification.sent_by_name || 'System'}</p>
                      <p><strong>Created:</strong> {new Date(notification.created_at).toLocaleString()}</p>
                      {notification.expires_at && (
                        <p><strong>Expires:</strong> {new Date(notification.expires_at).toLocaleString()}</p>
                      )}
                      <div style={{ marginTop: '10px' }}>
                        <strong>Message:</strong>
                        <p style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{notification.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
