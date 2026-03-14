import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const Departments = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    faculty: '',
    head: '',
    description: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
    fetchLecturers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await api.get('/faculties/');
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
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
      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment.id}/`, formData);
      } else {
        await api.post('/departments/', formData);
      }
      fetchDepartments();
      setShowForm(false);
      setEditingDepartment(null);
      setFormData({ name: '', code: '', faculty: '', head: '', description: '' });
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code || '',
      faculty: department.faculty || '',
      head: department.head || '',
      description: department.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${departmentId}/`);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDepartment(null);
    setFormData({ name: '', code: '', faculty: '', head: '', description: '' });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading departments...</h2>
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
          <h1>Manage Departments</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Department
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingDepartment ? 'Edit Department' : 'Add Department'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Department Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Faculty *</label>
                  <select
                    value={formData.faculty}
                    onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                    required
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map(faculty => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Head of Department</label>
                  <select
                    value={formData.head}
                    onChange={(e) => setFormData({...formData, head: e.target.value})}
                  >
                    <option value="">Select Head</option>
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
                    {editingDepartment ? 'Update' : 'Create'}
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
                <th>Faculty</th>
                <th>Head</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(department => (
                <tr key={department.id}>
                  <td>{department.name}</td>
                  <td>{department.code || '-'}</td>
                  <td>{department.faculty_name || '-'}</td>
                  <td>{department.head_name || '-'}</td>
                  <td>{department.description || '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(department)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(department.id)}>
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

export default Departments;
