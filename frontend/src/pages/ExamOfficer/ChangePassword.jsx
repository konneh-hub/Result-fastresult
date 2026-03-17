import React, { useState } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const ChangePassword = () => {
  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/change-password/', {
        old_password: form.old_password,
        new_password: form.new_password
      });
      setSuccess('Password changed successfully!');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Change Password</h1>
        </div>
        <form className="password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Old Password</label>
            <input name="old_password" type="password" value={form.old_password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input name="new_password" type="password" value={form.new_password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
        </form>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default ChangePassword;
