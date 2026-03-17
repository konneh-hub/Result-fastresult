import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const AcademicSessions = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/academic-sessions/');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching academic sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSession) {
        await api.put(`/academic-sessions/${editingSession.id}/`, formData);
      } else {
        await api.post('/academic-sessions/', formData);
      }
      fetchSessions();
      setShowForm(false);
      setEditingSession(null);
      setFormData({ name: '', start_date: '', end_date: '', is_current: false });
    } catch (error) {
      console.error('Error saving academic session:', error);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      start_date: session.start_date,
      end_date: session.end_date,
      is_current: session.is_current
    });
    setShowForm(true);
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this academic session?')) {
      try {
        await api.delete(`/academic-sessions/${sessionId}/`);
        fetchSessions();
      } catch (error) {
        console.error('Error deleting academic session:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSession(null);
    setFormData({ name: '', start_date: '', end_date: '', is_current: false });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading academic sessions...</h2>
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
          <h1>Manage Academic Sessions</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Academic Session
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingSession ? 'Edit Academic Session' : 'Add Academic Session'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Session Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., 2023/2024 Academic Year"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_current}
                      onChange={(e) => setFormData({...formData, is_current: e.target.checked})}
                    />
                    Is Current Session
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingSession ? 'Update' : 'Create'}
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
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Current</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.id}>
                  <td>{session.name}</td>
                  <td>{new Date(session.start_date).toLocaleDateString()}</td>
                  <td>{new Date(session.end_date).toLocaleDateString()}</td>
                  <td>{session.is_current ? 'Yes' : 'No'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(session)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(session.id)}>
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

export default AcademicSessions;
