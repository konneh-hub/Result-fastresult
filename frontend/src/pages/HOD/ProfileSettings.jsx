import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import './HOD.css';

const ProfileSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    university: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Fetch user profile data
      const userResponse = await api.get(`/users/${user.id}/`);
      const departmentResponse = await api.get(`/departments/${user.department_id}/`);
      const universityResponse = await api.get(`/universities/${user.university_id}/`);

      setProfile({
        first_name: userResponse.data.first_name || '',
        last_name: userResponse.data.last_name || '',
        email: userResponse.data.email || '',
        phone: userResponse.data.phone || '',
        department: departmentResponse.data.name,
        university: universityResponse.data.name
      });

    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrors({});
    setMessage('');

    try {
      const response = await api.patch(`/users/${user.id}/`, {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone
      });

      // Update the user context
      updateUser(response.data);

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setMessage('Error updating profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setErrors({});
    setMessage('');

    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrors({ confirm_password: ['Passwords do not match'] });
      setChangingPassword(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setErrors({ new_password: ['Password must be at least 8 characters long'] });
      setChangingPassword(false);
      return;
    }

    try {
      await api.post('/auth/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      setMessage('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error('Error changing password:', err);
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setMessage('Error changing password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChangeInput = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Profile Settings</h1>
          <p>Manage your account information and security settings</p>
        </div>

        {message && (
          <div className="alert success" style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Information
            </button>
            <button
              className={`tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={profile.first_name}
                    onChange={handleProfileChange}
                    required
                  />
                  {errors.first_name && (
                    <span className="error">{errors.first_name[0]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={profile.last_name}
                    onChange={handleProfileChange}
                    required
                  />
                  {errors.last_name && (
                    <span className="error">{errors.last_name[0]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    required
                  />
                  {errors.email && (
                    <span className="error">{errors.email[0]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                  />
                  {errors.phone && (
                    <span className="error">{errors.phone[0]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    readOnly
                    style={{ backgroundColor: 'var(--background)', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label>University</label>
                  <input
                    type="text"
                    value={profile.university}
                    readOnly
                    style={{ backgroundColor: 'var(--background)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn"
                  disabled={updating}
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="form">
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="current_password">Current Password</label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChangeInput}
                    required
                  />
                  {errors.current_password && (
                    <span className="error">{errors.current_password[0]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChangeInput}
                    required
                    minLength="8"
                  />
                  {errors.new_password && (
                    <span className="error">{errors.new_password[0]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChangeInput}
                    required
                    minLength="8"
                  />
                  {errors.confirm_password && (
                    <span className="error">{errors.confirm_password[0]}</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn"
                  disabled={changingPassword}
                  style={{ backgroundColor: 'var(--warning)' }}
                >
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>

              <div style={{ marginTop: '15px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <p><strong>Password Requirements:</strong></p>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li>At least 8 characters long</li>
                  <li>Should contain a mix of letters, numbers, and symbols</li>
                  <li>Different from your current password</li>
                </ul>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
