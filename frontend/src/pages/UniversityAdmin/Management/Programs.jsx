import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const Programs = () => {
  const { user } = useContext(AuthContext);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    degree_type: '',
    duration_years: ''
  });

  const degreeTypes = [
    { value: 'bachelor', label: 'Bachelor Degree' },
    { value: 'master', label: 'Master Degree' },
    { value: 'phd', label: 'PhD' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'certificate', label: 'Certificate' }
  ];

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs/');
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProgram) {
        await api.put(`/programs/${editingProgram.id}/`, formData);
      } else {
        await api.post('/programs/', formData);
      }
      fetchPrograms();
      setShowForm(false);
      setEditingProgram(null);
      setFormData({ name: '', code: '', department: '', degree_type: '', duration_years: '' });
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      code: program.code || '',
      department: program.department || '',
      degree_type: program.degree_type || '',
      duration_years: program.duration_years || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await api.delete(`/programs/${programId}/`);
        fetchPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProgram(null);
    setFormData({ name: '', code: '', department: '', degree_type: '', duration_years: '' });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading programs...</h2>
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
          <h1>Manage Programs</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Program
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingProgram ? 'Edit Program' : 'Add Program'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Program Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Program Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(department => (
                      <option key={department.id} value={department.id}>
                        {department.name} ({department.faculty_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Degree Type *</label>
                  <select
                    value={formData.degree_type}
                    onChange={(e) => setFormData({...formData, degree_type: e.target.value})}
                    required
                  >
                    <option value="">Select Degree Type</option>
                    {degreeTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.duration_years}
                    onChange={(e) => setFormData({...formData, duration_years: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingProgram ? 'Update' : 'Create'}
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
                <th>Department</th>
                <th>Degree Type</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program.id}>
                  <td>{program.name}</td>
                  <td>{program.code || '-'}</td>
                  <td>{program.department_name || '-'}</td>
                  <td>{program.degree_type ? program.degree_type.charAt(0).toUpperCase() + program.degree_type.slice(1) : '-'}</td>
                  <td>{program.duration_years ? `${program.duration_years} years` : '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(program)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(program.id)}>
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

export default Programs;
