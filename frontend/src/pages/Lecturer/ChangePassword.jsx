import React, { useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const ChangePassword = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.new_password)) {
      newErrors.new_password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (formData.current_password === formData.new_password) {
      newErrors.new_password = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const response = await api.post('/auth/change-password/', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });

      setMessage('Password changed successfully!');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: '', color: 'var(--text-secondary)' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z\d]/.test(password)) score++;

    if (score <= 2) return { level: 'Weak', color: 'var(--error)' };
    if (score <= 3) return { level: 'Fair', color: 'var(--warning)' };
    if (score <= 4) return { level: 'Good', color: 'var(--secondary)' };
    return { level: 'Strong', color: 'var(--success)' };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Change Password</h1>
          <p>Update your password to keep your account secure</p>
        </div>

        <div className="dashboard-section">
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="password-form">
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="current_password">Current Password *</label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  className={errors.current_password ? 'error' : ''}
                  placeholder="Enter your current password"
                />
                {errors.current_password && <span className="error-text">{errors.current_password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="new_password">New Password *</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className={errors.new_password ? 'error' : ''}
                  placeholder="Enter your new password"
                />
                {formData.new_password && (
                  <div style={{ marginTop: '5px' }}>
                    <span style={{
                      fontSize: '12px',
                      color: passwordStrength.color,
                      fontWeight: 'bold'
                    }}>
                      Password strength: {passwordStrength.level}
                    </span>
                  </div>
                )}
                {errors.new_password && <span className="error-text">{errors.new_password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className={errors.confirm_password ? 'error' : ''}
                  placeholder="Confirm your new password"
                />
                {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
              </div>
            </div>

            <div className="password-requirements">
              <h3>Password Requirements:</h3>
              <ul>
                <li className={formData.new_password.length >= 8 ? 'met' : ''}>
                  At least 8 characters long
                </li>
                <li className={/[a-z]/.test(formData.new_password) ? 'met' : ''}>
                  Contains at least one lowercase letter
                </li>
                <li className={/[A-Z]/.test(formData.new_password) ? 'met' : ''}>
                  Contains at least one uppercase letter
                </li>
                <li className={/\d/.test(formData.new_password) ? 'met' : ''}>
                  Contains at least one number
                </li>
                <li className={formData.new_password !== formData.current_password ? 'met' : ''}>
                  Different from current password
                </li>
              </ul>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFormData({
                  current_password: '',
                  new_password: '',
                  confirm_password: ''
                })}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
