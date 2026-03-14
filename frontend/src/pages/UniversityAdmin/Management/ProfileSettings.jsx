
import React, { useState, useEffect, useContext } from 'react';
import api from '../../../services/api';
import AuthContext from '../../../contexts/AuthContext';

const ProfileSettings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.put('/auth/profile/', form);
      setSuccess('Profile updated successfully.');
      setUser(res.data.user);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings-page">
      <h2>Profile Settings</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div>
          <label>First Name</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} />
        </div>
        <div>
          <label>Last Name</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} />
        </div>
        <div>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default ProfileSettings;
