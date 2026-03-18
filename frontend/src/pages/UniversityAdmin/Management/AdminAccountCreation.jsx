import React, { useState } from 'react';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const initialState = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  role: '',
  staff_id: '',
  password: '',
  faculty_id: '',
  department_id: '',
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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };


const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const requiredFields = ['first_name', 'last_name', 'username', 'email', 'password', 'role'];
    for (const field of requiredFields) {
      if (!form[field]) {
        setError(`Please fill in ${field.replace('_', ' ')}`);
        return;
      }
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/management/create-admin/', form);
      setSuccess('Account created successfully!');
      setForm(initialState);
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to create account. Please check your input and try again.');
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
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>


          {/* Exam Officer Fields */}
          {form.role === 'exam_officer' && (
            <>
              <div className="form-group">
                <label>First Name</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input name="username" value={form.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Staff ID (optional)</label>
                <input name="staff_id" value={form.staff_id} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>
            </>
          )}


          {/* HOD Fields */}
          {form.role === 'hod' && (
            <>
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
                <label>Username</label>
                <input name="username" value={form.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Staff ID</label>
                <input name="staff_id" value={form.staff_id} onChange={handleChange} required />
              </div>
            </>
          )}


          {/* Dean Fields */}
          {form.role === 'dean' && (
            <>
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
                <label>Username</label>
                <input name="username" value={form.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Staff ID</label>
                <input name="staff_id" value={form.staff_id} onChange={handleChange} required />
              </div>
            </>
          )}
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
