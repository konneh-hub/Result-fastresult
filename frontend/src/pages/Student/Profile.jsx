import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const Profile = () => {
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
    address: '',
    emergency_contact: '',
    emergency_phone: ''
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
          address: response.data.address || '',
          emergency_contact: response.data.emergency_contact || '',
          emergency_phone: response.data.emergency_phone || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Mock data
        const mockProfile = {
          id: user.id,
          student_id: 'STU001',
          first_name: 'John',
          last_name: 'Doe',
          email: user.email,
          phone: '+1234567890',
          address: '123 Main St, City, Country',
          emergency_contact: 'Jane Doe',
          emergency_phone: '+0987654321',
          faculty: 'Computer Science',
          department: 'Software Engineering',
          program: 'BSc Computer Science',
          level: 3,
          enrollment_date: '2021-09-01'
        };
        setProfile(mockProfile);
        setFormData({
          first_name: mockProfile.first_name,
          last_name: mockProfile.last_name,
          email: mockProfile.email,
          phone: mockProfile.phone,
          address: mockProfile.address,
          emergency_contact: mockProfile.emergency_contact,
          emergency_phone: mockProfile.emergency_phone
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
      address: profile.address || '',
      emergency_contact: profile.emergency_contact || '',
      emergency_phone: profile.emergency_phone || ''
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
      <h1>Student Profile</h1>
      <p className="page-description">Manage your personal information and academic details.</p>

      <div className="profile-layout">
        <div className="profile-info">
          <div className="info-section">
            <h3>Academic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Student ID</label>
                <span>{profile.student_id}</span>
              </div>
              <div className="info-item">
                <label>Faculty</label>
                <span>{profile.faculty}</span>
              </div>
              <div className="info-item">
                <label>Department</label>
                <span>{profile.department}</span>
              </div>
              <div className="info-item">
                <label>Program</label>
                <span>{profile.program}</span>
              </div>
              <div className="info-item">
                <label>Level</label>
                <span>{profile.level}</span>
              </div>
              <div className="info-item">
                <label>Enrollment Date</label>
                <span>{new Date(profile.enrollment_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <h3>Personal Information</h3>
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

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="emergency_contact">Emergency Contact</label>
                    <input
                      type="text"
                      id="emergency_contact"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="emergency_phone">Emergency Phone</label>
                    <input
                      type="tel"
                      id="emergency_phone"
                      name="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <span>{profile.first_name} {profile.last_name}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{profile.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <span>{profile.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Address</label>
                  <span>{profile.address || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Emergency Contact</label>
                  <span>{profile.emergency_contact || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Emergency Phone</label>
                  <span>{profile.emergency_phone || 'Not provided'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="profile-photo">
            <div className="photo-placeholder">
              <span>{profile.first_name?.[0]}{profile.last_name?.[0]}</span>
            </div>
            <button className="btn-outline">Change Photo</button>
          </div>

          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <button className="btn-outline">Change Password</button>
            <button className="btn-outline">Privacy Settings</button>
            <button className="btn-outline">Notification Preferences</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
