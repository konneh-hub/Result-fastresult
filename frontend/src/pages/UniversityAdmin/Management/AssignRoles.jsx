import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const AssignRoles = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    department: '',
    faculty: ''
  });

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'lecturer', label: 'Lecturer' },
    { value: 'hod', label: 'Head of Department' },
    { value: 'dean', label: 'Dean' },
    { value: 'exam_officer', label: 'Exam Officer' },
    { value: 'university_admin', label: 'University Admin' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/management/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAssignment = async (userId) => {
    setSelectedUser(userId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/management/users/assign-role/', {
        user_id: selectedUser,
        role: formData.role,
        department_id: formData.department || null,
        faculty_id: formData.faculty || null
      });

      fetchUsers();
      setShowForm(false);
      setSelectedUser(null);
      setFormData({ role: '', department: '', faculty: '' });
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedUser(null);
    setFormData({ role: '', department: '', faculty: '' });
  };

  const getRoleDisplay = (user) => {
    if (user.role === 'student') return 'Student';
    if (user.role === 'lecturer') return 'Lecturer';
    if (user.role === 'hod') return 'Head of Department';
    if (user.role === 'dean') return 'Dean';
    if (user.role === 'exam_officer') return 'Exam Officer';
    if (user.role === 'university_admin') return 'University Admin';
    return 'Unassigned';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading users...</h2>
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
          <h1>Assign User Roles</h1>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Assign Role</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                {(formData.role === 'lecturer' || formData.role === 'hod') && (
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      placeholder="Enter department ID"
                    />
                  </div>
                )}
                {formData.role === 'dean' && (
                  <div className="form-group">
                    <label>Faculty</label>
                    <input
                      type="text"
                      value={formData.faculty}
                      onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                      placeholder="Enter faculty ID"
                    />
                  </div>
                )}
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Assign Role
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
                <th>Email</th>
                <th>Current Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleDisplay(user)}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleRoleAssignment(user.id)}>
                      Assign Role
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

export default AssignRoles;
