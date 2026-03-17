import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile/');
        setProfile(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        const mockProfile = {
          id: user.id,
          first_name: user.first_name || 'Dean',
          last_name: user.last_name || 'User',
          email: user.email,
          phone: '+1234567890',
          address: '123 Faculty Drive'
        };
        setProfile(mockProfile);
        setFormData({
          first_name: mockProfile.first_name,
          last_name: mockProfile.last_name,
          email: mockProfile.email,
          phone: mockProfile.phone,
          address: mockProfile.address
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile/', formData);
      setProfile(prev => ({ ...prev, ...formData }));
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || ''
    });
    setEditing(false);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found</div>;
  }

  return (
    <div className="profile-page">
      <h1>Dean Profile</h1>
      <p className="page-description">Manage your profile and contact information.</p>

      <div className="profile-layout">
        <div className="profile-info">
          <div className="info-section">
            <h3>Account Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>User ID</label>
                <span>{profile.id}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{profile.email}</span>
              </div>
              <div className="info-item">
                <label>Role</label>
                <span>{profile.role || 'Dean'}</span>
              </div>
              {profile.faculty && (
                <div className="info-item">
                  <label>Faculty</label>
                  <span>{profile.faculty}</span>
                </div>
              )}
              {profile.department && (
                <div className="info-item">
                  <label>Department</label>
                  <span>{profile.department}</span>
                </div>
              )}
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <h3>Contact Information</h3>
              {!editing && (
                <button className="btn-outline" onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="button-row">
                  <button className="btn-primary" disabled={saving} onClick={handleSave}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-outline" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>Phone</label>
                  <span>{profile.phone}</span>
                </div>
                <div className="info-item">
                  <label>Address</label>
                  <span>{profile.address}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
