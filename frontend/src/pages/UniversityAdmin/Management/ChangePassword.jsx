
import React, { useState } from 'react';
import api from '../../../services/api';

const ChangePassword = () => {
  const [form, setForm] = useState({ old_password: '', new_password: '' });
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
      await api.post('/auth/change-password/', form);
      setSuccess('Password changed successfully.');
      setForm({ old_password: '', new_password: '' });
    } catch (err) {
      setError(err.response?.data?.old_password?.[0] || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit} className="change-password-form">
        <div>
          <label>Current Password</label>
          <input name="old_password" type="password" value={form.old_password} onChange={handleChange} required />
        </div>
        <div>
          <label>New Password</label>
          <input name="new_password" type="password" value={form.new_password} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default ChangePassword;
