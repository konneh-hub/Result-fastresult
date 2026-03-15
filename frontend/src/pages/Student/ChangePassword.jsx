import React, { useState } from 'react';
import api from '../../services/api';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password/', {
        old_password: formData.currentPassword,
        new_password: formData.newPassword
      });

      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to change password. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="change-password-page">
        <div className="success-message">
          <h1>Password Changed Successfully!</h1>
          <p>Your password has been updated. You will be redirected to login with your new password.</p>
          <button
            className="btn-primary"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="change-password-page">
      <h1>Change Password</h1>
      <p className="page-description">Update your account password to keep your account secure.</p>

      <div className="password-requirements">
        <h3>Password Requirements</h3>
        <ul>
          <li>At least 8 characters long</li>
          <li>Contains at least one uppercase letter</li>
          <li>Contains at least one lowercase letter</li>
          <li>Contains at least one number</li>
          <li>Different from your current password</li>
        </ul>
      </div>

      <form className="password-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password *</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            className={errors.currentPassword ? 'error' : ''}
          />
          {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password *</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className={errors.newPassword ? 'error' : ''}
          />
          {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.location.href = '/student/profile'}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="password-tips">
        <h3>Password Security Tips</h3>
        <ul>
          <li>Use a unique password for each account</li>
          <li>Avoid using personal information in your password</li>
          <li>Change your password regularly</li>
          <li>Never share your password with others</li>
          <li>Use a password manager to generate and store strong passwords</li>
        </ul>
      </div>
    </div>
  );
};

export default ChangePassword;
