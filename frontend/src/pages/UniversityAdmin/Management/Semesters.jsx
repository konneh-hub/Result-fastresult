import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const Semesters = () => {
  const { user } = useContext(AuthContext);
  const [semesters, setSemesters] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    academic_session: '',
    start_date: '',
    end_date: '',
    is_current: false
  });

  useEffect(() => {
    fetchSemesters();
    fetchAcademicSessions();
  }, []);

  const fetchSemesters = async () => {
    try {
      const response = await api.get('/semesters/');
      setSemesters(response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicSessions = async () => {
    try {
      const response = await api.get('/academic-sessions/');
      setAcademicSessions(response.data);
    } catch (error) {
      console.error('Error fetching academic sessions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSemester) {
        await api.put(`/semesters/${editingSemester.id}/`, formData);
      } else {
        await api.post('/semesters/', formData);
      }
      fetchSemesters();
      setShowForm(false);
      setEditingSemester(null);
      setFormData({ name: '', academic_session: '', start_date: '', end_date: '', is_current: false });
    } catch (error) {
      console.error('Error saving semester:', error);
    }
  };

  const handleEdit = (semester) => {
    setEditingSemester(semester);
    setFormData({
      name: semester.name,
      academic_session: semester.academic_session,
      start_date: semester.start_date,
      end_date: semester.end_date,
      is_current: semester.is_current
    });
    setShowForm(true);
  };

  const handleDelete = async (semesterId) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      try {
        await api.delete(`/semesters/${semesterId}/`);
        fetchSemesters();
      } catch (error) {
        console.error('Error deleting semester:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSemester(null);
    setFormData({ name: '', academic_session: '', start_date: '', end_date: '', is_current: false });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading semesters...</h2>
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
          <h1>Manage Semesters</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Semester
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingSemester ? 'Edit Semester' : 'Add Semester'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Semester Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., First Semester, Second Semester"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Academic Session *</label>
                  <select
                    value={formData.academic_session}
                    onChange={(e) => setFormData({...formData, academic_session: e.target.value})}
                    required
                  >
                    <option value="">Select Academic Session</option>
                    {academicSessions.map(session => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
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
                    Is Current Semester
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingSemester ? 'Update' : 'Create'}
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
                <th>Academic Session</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Current</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map(semester => (
                <tr key={semester.id}>
                  <td>{semester.name}</td>
                  <td>{semester.academic_session_name || '-'}</td>
                  <td>{new Date(semester.start_date).toLocaleDateString()}</td>
                  <td>{new Date(semester.end_date).toLocaleDateString()}</td>
                  <td>{semester.is_current ? 'Yes' : 'No'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(semester)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(semester.id)}>
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

export default Semesters;
