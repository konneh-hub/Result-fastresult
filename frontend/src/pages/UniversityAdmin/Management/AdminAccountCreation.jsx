import React, { useState } from 'react';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const initialState = {
  first_name: '',
  last_name: '',
  email: '',
  role: '',
  department: '',
  faculty: '',
  staff_id: '',
  password: '',
};

const roles = [
  { value: 'exam_officer', label: 'Exam Officer' },
  { value: 'dean', label: 'Dean' },
  { value: 'hod', label: 'Head of Department' },
];

const AdminAccountCreation = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.post('/management/create-admin/', form);
      setSuccess('Administrator account created successfully!');
      setForm(initialState);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Create Administrator Account</h1>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Faculty</label>
            <input name="faculty" value={form.faculty} onChange={handleChange} placeholder="Faculty (for Dean)" />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input name="department" value={form.department} onChange={handleChange} placeholder="Department (for HOD/Exam Officer)" />
          </div>
          <div className="form-group">
            <label>Staff ID</label>
            <input name="staff_id" value={form.staff_id} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-actions">
            <button className="btn-edit" style={{background:'var(--btn-primary)',color:'white'}} type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          </div>
          {success && <div className="upload-result success">{success}</div>}
          {error && <div className="upload-result error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminAccountCreation;
