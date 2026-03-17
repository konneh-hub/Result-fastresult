import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const ProfileSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    bio: '',
    office_hours: '',
    profile_picture: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lecturers/${user.id}/profile/`);
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Mock data for demonstration
      setProfile({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@university.edu',
        phone: '+1-555-0123',
        department: 'Computer Science',
        specialization: 'Software Engineering',
        bio: 'Experienced lecturer with 10+ years in computer science education.',
        office_hours: 'Monday-Friday: 9 AM - 5 PM',
        profile_picture: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profile_picture: 'Please select a valid image file.'
        }));
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profile_picture: 'File size must be less than 5MB.'
        }));
        return;
      }
      setProfile(prev => ({
        ...prev,
        profile_picture: file
      }));
      setErrors(prev => ({
        ...prev,
        profile_picture: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profile.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!profile.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!profile.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = 'Email is invalid';

    if (!profile.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!profile.department.trim()) newErrors.department = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage('Please fix the errors below.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const formData = new FormData();
      Object.keys(profile).forEach(key => {
        if (profile[key] !== null) {
          formData.append(key, profile[key]);
        }
      });

      const response = await api.put(`/lecturers/${user.id}/profile/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile(response.data);
      updateUser(response.data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
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
          <p>Update your personal information and lecturer profile</p>
        </div>

        <div className="dashboard-section">
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="first_name">First Name *</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={profile.first_name}
                    onChange={handleInputChange}
                    className={errors.first_name ? 'error' : ''}
                  />
                  {errors.first_name && <span className="error-text">{errors.first_name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name *</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={profile.last_name}
                    onChange={handleInputChange}
                    className={errors.last_name ? 'error' : ''}
                  />
                  {errors.last_name && <span className="error-text">{errors.last_name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Academic Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="department">Department *</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={profile.department}
                    onChange={handleInputChange}
                    className={errors.department ? 'error' : ''}
                  />
                  {errors.department && <span className="error-text">{errors.department}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={profile.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineering, Data Science"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell students about your background, experience, and teaching philosophy..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="office_hours">Office Hours</label>
                <input
                  type="text"
                  id="office_hours"
                  name="office_hours"
                  value={profile.office_hours}
                  onChange={handleInputChange}
                  placeholder="e.g., Monday-Friday: 9 AM - 5 PM"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Profile Picture</h2>
              <div className="form-group">
                <label htmlFor="profile_picture">Upload Profile Picture</label>
                <input
                  type="file"
                  id="profile_picture"
                  name="profile_picture"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {errors.profile_picture && <span className="error-text">{errors.profile_picture}</span>}
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '5px' }}>
                  Accepted formats: JPG, PNG, GIF. Maximum size: 5MB.
                </small>
                {profile.profile_picture && typeof profile.profile_picture === 'string' && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={profile.profile_picture}
                      alt="Current profile"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
