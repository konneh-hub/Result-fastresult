import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipient_type: 'all',
    recipient_id: '',
    priority: 'normal'
  });

  const recipientTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'students', label: 'All Students' },
    { value: 'lecturers', label: 'All Lecturers' },
    { value: 'faculty', label: 'Specific Faculty' },
    { value: 'department', label: 'Specific Department' },
    { value: 'individual', label: 'Individual User' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotification) {
        await api.put(`/notifications/${editingNotification.id}/`, formData);
      } else {
        await api.post('/notifications/', formData);
      }
      fetchNotifications();
      setShowForm(false);
      setEditingNotification(null);
      setFormData({
        title: '',
        message: '',
        recipient_type: 'all',
        recipient_id: '',
        priority: 'normal'
      });
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      recipient_type: notification.recipient_type,
      recipient_id: notification.recipient_id || '',
      priority: notification.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await api.delete(`/notifications/${notificationId}/`);
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingNotification(null);
    setFormData({
      title: '',
      message: '',
      recipient_type: 'all',
      recipient_id: '',
      priority: 'normal'
    });
  };

  const getRecipientTypeDisplay = (type) => {
    const typeObj = recipientTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'urgent';
      case 'high': return 'high';
      case 'normal': return 'normal';
      case 'low': return 'low';
      default: return 'normal';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading notifications...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Manage Notifications</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create Notification
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingNotification ? 'Edit Notification' : 'Create Notification'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Recipient Type *</label>
                  <select
                    value={formData.recipient_type}
                    onChange={(e) => setFormData({...formData, recipient_type: e.target.value})}
                    required
                  >
                    {recipientTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {(formData.recipient_type === 'faculty' || formData.recipient_type === 'department' || formData.recipient_type === 'individual') && (
                  <div className="form-group">
                    <label>Recipient ID</label>
                    <input
                      type="text"
                      value={formData.recipient_id}
                      onChange={(e) => setFormData({...formData, recipient_id: e.target.value})}
                      placeholder={`Enter ${formData.recipient_type} ID`}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingNotification ? 'Update' : 'Create'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Recipient Type</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(notification => (
                <tr key={notification.id}>
                  <td>{notification.title}</td>
                  <td className="message-cell">{notification.message}</td>
                  <td>{getRecipientTypeDisplay(notification.recipient_type)}</td>
                  <td>
                    <span className={`priority ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  </td>
                  <td>{new Date(notification.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(notification)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(notification.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
