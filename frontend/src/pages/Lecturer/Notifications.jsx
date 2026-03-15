import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

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
      const response = await api.get(`/lecturers/${user.id}/notifications/`);
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Mock data for demonstration
      setNotifications([
        {
          id: 1,
          title: 'Course Assignment Updated',
          message: 'Your course assignment for CSC 101 has been updated. Please review the changes.',
          type: 'course',
          is_read: false,
          created_at: '2024-01-15T10:30:00Z',
          priority: 'high'
        },
        {
          id: 2,
          title: 'Result Submission Deadline',
          message: 'Reminder: Results for CSC 201 must be submitted by end of week.',
          type: 'deadline',
          is_read: false,
          created_at: '2024-01-14T14:20:00Z',
          priority: 'medium'
        },
        {
          id: 3,
          title: 'System Maintenance',
          message: 'The system will be under maintenance this weekend from 11 PM to 3 AM.',
          type: 'system',
          is_read: true,
          created_at: '2024-01-13T09:15:00Z',
          priority: 'low'
        },
        {
          id: 4,
          title: 'New Student Enrollment',
          message: '5 new students have been enrolled in your MTH 101 course.',
          type: 'enrollment',
          is_read: true,
          created_at: '2024-01-12T16:45:00Z',
          priority: 'medium'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read/`);
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Update locally for demo
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read/');
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Update locally for demo
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}/`);
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      if (selectedNotification && selectedNotification.id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      // Update locally for demo
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      if (selectedNotification && selectedNotification.id === notificationId) {
        setSelectedNotification(null);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course': return '📚';
      case 'deadline': return '⏰';
      case 'system': return '⚙️';
      case 'enrollment': return '👥';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--error)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Notifications</h1>
          <p>Stay updated with important messages and announcements</p>
        </div>

        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setFilter('all')}
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`btn ${filter === 'read' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn btn-secondary">
                Mark All as Read
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedNotification ? '1fr 2fr' : '1fr', gap: '20px' }}>
            <div className="notifications-list">
              {filteredNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <p>No notifications found.</p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? 'unread' : ''} ${selectedNotification?.id === notification.id ? 'selected' : ''}`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4>{notification.title}</h4>
                        <span className="notification-priority" style={{ backgroundColor: getPriorityColor(notification.priority) }}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <span>{formatDate(notification.created_at)}</span>
                        {!notification.is_read && (
                          <span className="unread-indicator">●</span>
                        )}
                      </div>
                    </div>
                    <div className="notification-actions">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="btn-icon"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="btn-icon delete"
                        title="Delete notification"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedNotification && (
              <div className="notification-detail">
                <div className="notification-detail-header">
                  <h3>{selectedNotification.title}</h3>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="btn-icon"
                    title="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="notification-detail-meta">
                  <span className="notification-type">
                    {getNotificationIcon(selectedNotification.type)} {selectedNotification.type}
                  </span>
                  <span className="notification-date">
                    {new Date(selectedNotification.created_at).toLocaleString()}
                  </span>
                  <span
                    className="notification-priority-detail"
                    style={{ backgroundColor: getPriorityColor(selectedNotification.priority) }}
                  >
                    {selectedNotification.priority} priority
                  </span>
                </div>
                <div className="notification-detail-content">
                  <p>{selectedNotification.message}</p>
                </div>
                {!selectedNotification.is_read && (
                  <div style={{ marginTop: '20px' }}>
                    <button
                      onClick={() => markAsRead(selectedNotification.id)}
                      className="btn btn-primary"
                    >
                      Mark as Read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
