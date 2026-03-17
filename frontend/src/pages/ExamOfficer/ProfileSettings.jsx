import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const ProfileSettings = () => {
  const { user, login } = useContext(AuthContext);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        ...form,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/auth/profile/', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
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
      setForm({ ...form, old_password: '', new_password: '', confirm_password: '' });
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
          <h1>Profile Settings</h1>
        </div>
        <div className="profile-settings">
          <div className="settings-section">
            <h2>Update Profile</h2>
            <form onSubmit={handleProfileUpdate}>
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
              <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Profile'}</button>
            </form>
          </div>
          <div className="settings-section">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange}>
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
          </div>
        </div>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default ProfileSettings;
