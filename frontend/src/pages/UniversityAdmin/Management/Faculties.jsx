import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const Faculties = () => {
  const { user } = useContext(AuthContext);
  const [faculties, setFaculties] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    dean: '',
    description: ''
  });

  useEffect(() => {
    fetchFaculties();
    fetchLecturers();
  }, []);

  const fetchFaculties = async () => {
    try {
      const response = await api.get('/faculties/');
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await api.get('/lecturers/');
      setLecturers(response.data);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await api.put(`/faculties/${editingFaculty.id}/`, formData);
      } else {
        await api.post('/faculties/', formData);
      }
      fetchFaculties();
      setShowForm(false);
      setEditingFaculty(null);
      setFormData({ name: '', code: '', dean: '', description: '' });
    } catch (error) {
      console.error('Error saving faculty:', error);
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      code: faculty.code || '',
      dean: faculty.dean || '',
      description: faculty.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty?')) {
      try {
        await api.delete(`/faculties/${facultyId}/`);
        fetchFaculties();
      } catch (error) {
        console.error('Error deleting faculty:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingFaculty(null);
    setFormData({ name: '', code: '', dean: '', description: '' });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading faculties...</h2>
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
          <h1>Manage Faculties</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Faculty
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingFaculty ? 'Edit Faculty' : 'Add Faculty'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Faculty Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Faculty Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Dean</label>
                  <select
                    value={formData.dean}
                    onChange={(e) => setFormData({...formData, dean: e.target.value})}
                  >
                    <option value="">Select Dean</option>
                    {lecturers.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.first_name} {lecturer.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingFaculty ? 'Update' : 'Create'}
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
                <th>Code</th>
                <th>Dean</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map(faculty => (
                <tr key={faculty.id}>
                  <td>{faculty.name}</td>
                  <td>{faculty.code || '-'}</td>
                  <td>{faculty.dean_name || '-'}</td>
                  <td>{faculty.description || '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(faculty)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(faculty.id)}>
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

export default Faculties;
