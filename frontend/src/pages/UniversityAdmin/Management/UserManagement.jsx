
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showProfile, setShowProfile] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [showRole, setShowRole] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/management/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.post(`/management/deactivate-user/${userId}/`);
        fetchUsers();
      } catch (error) {
        console.error('Error deactivating user:', error);
      }
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await api.post(`/management/activate-user/${userId}/`);
      fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    if (bulkAction === 'activate') {
      for (const id of selectedUsers) await handleActivateUser(id);
    } else if (bulkAction === 'deactivate') {
      for (const id of selectedUsers) await handleDeactivateUser(id);
    } else if (bulkAction === 'delete') {
      // Implement delete logic here
    }
    setSelectedUsers([]);
    setBulkAction('');
  };

  const getRoleDisplay = (user) => {
    if (user.role === 'student') return 'Student';
    if (user.role === 'lecturer') return 'Lecturer';
    if (user.role === 'hod') return 'Head of Department';
    if (user.role === 'dean') return 'Dean';
    if (user.role === 'exam_officer') return 'Exam Officer';
    if (user.role === 'university_admin') return 'University Admin';
    return 'Unassigned';
  };

  const getStatusDisplay = (user) => {
    if (!user.is_active) return 'Inactive';
    if (user.status === 'pending') return 'Pending Approval';
    if (user.status === 'suspended') return 'Suspended';
    return 'Active';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.student_id && user.student_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.staff_id && user.staff_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || getStatusDisplay(user).toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading users...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>User Management</h1>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by Name, Email, Student ID, Staff ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="filter-select">
              <option value="">All Users</option>
              <option value="student">Students</option>
              <option value="lecturer">Lecturers</option>
              <option value="hod">HODs</option>
              <option value="dean">Deans</option>
              <option value="exam_officer">Exam Officers</option>
              <option value="inactive">Inactive Users</option>
              <option value="pending">Pending Accounts</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bulk-actions">
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="filter-select">
            <option value="">Bulk Actions</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="delete">Delete</option>
            <option value="export">Export</option>
          </select>
          <button onClick={handleBulkAction} className="btn-edit" disabled={!bulkAction || selectedUsers.length === 0}>Apply</button>
        </div>

        {/* Users Card Grid */}
        <div className="user-card-grid">
          {filteredUsers.map(user => (
            <div className="user-card" key={user.id}>
              <div className="user-card-header">
                <div className="user-card-name">
                  <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} />
                  <span>{user.first_name} {user.last_name}</span>
                </div>
                <span className={`status ${getStatusDisplay(user).toLowerCase().replace(' ', '-')}`}>{getStatusDisplay(user)}</span>
              </div>
              <div className="user-card-info">
                <div><b>User ID:</b> {user.student_id || user.staff_id || user.id}</div>
                <div><b>Role:</b> {getRoleDisplay(user)}</div>
                <div><b>Position:</b> {user.position || '-'}</div>
                <div><b>Faculty:</b> {user.faculty_name || '-'}</div>
                <div><b>Department:</b> {user.department_name || '-'}</div>
                <div><b>Email:</b> {user.email}</div>
                <div><b>Date Registered:</b> {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-'}</div>
              </div>
              <div className="user-card-actions">
                <button className="btn-edit" style={{background: 'var(--btn-primary)', color: 'white', marginRight: 8}} onClick={() => setShowProfile(user)}>View</button>
                <button className="btn-edit" style={{background: 'var(--btn-success)', color: 'white', marginRight: 8}} onClick={() => setShowEdit(user)}>Edit</button>
                <button className="btn-edit" style={{background: 'var(--btn-warning)', color: 'white', marginRight: 8}} onClick={() => setShowRole(user)}>Role/Position</button>
                {user.is_active ? (
                  <button className="btn-delete" style={{background: 'var(--btn-danger)', color: 'white', marginRight: 8}} onClick={() => handleDeactivateUser(user.id)}>Deactivate</button>
                ) : (
                  <button className="btn-edit" style={{background: 'var(--btn-success)', color: 'white', marginRight: 8}} onClick={() => handleActivateUser(user.id)}>Activate</button>
                )}
                <button className="btn-edit" style={{background: 'var(--btn-primary)', color: 'white', marginRight: 8}}>Reset Password</button>
                <button className="btn-delete" style={{background: 'var(--btn-danger)', color: 'white'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Modals for Profile, Edit, Role Assignment */}
        {showProfile && (
          <div className="modal">
            <div className="modal-content">
              <h2>User Profile</h2>
              <p><b>Name:</b> {showProfile.first_name} {showProfile.last_name}</p>
              <p><b>Role:</b> {getRoleDisplay(showProfile)}</p>
              <p><b>Position:</b> {showProfile.position || '-'}</p>
              <p><b>Faculty:</b> {showProfile.faculty_name || '-'}</p>
              <p><b>Department:</b> {showProfile.department_name || '-'}</p>
              <p><b>Email:</b> {showProfile.email}</p>
              <p><b>Last Login:</b> {showProfile.last_login ? new Date(showProfile.last_login).toLocaleString() : 'Never'}</p>
              <p><b>Account Status:</b> {getStatusDisplay(showProfile)}</p>
              <button onClick={() => setShowProfile(null)} className="btn-edit">Close</button>
            </div>
          </div>
        )}
        {showEdit && (
          <div className="modal">
            <div className="modal-content">
              <h2>Edit User</h2>
              {/* Implement edit form here */}
              <button onClick={() => setShowEdit(null)} className="btn-edit">Close</button>
            </div>
          </div>
        )}
        {showRole && (
          <div className="modal">
            <div className="modal-content">
              <h2>Assign Role / Position</h2>
              {/* Implement role/position assignment form here */}
              <button onClick={() => setShowRole(null)} className="btn-edit">Close</button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="summary-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p>{users.filter(u => u.is_active).length}</p>
          </div>
          <div className="stat-card">
            <h3>Students</h3>
            <p>{users.filter(u => u.role === 'student').length}</p>
          </div>
          <div className="stat-card">
            <h3>Lecturers</h3>
            <p>{users.filter(u => u.role === 'lecturer').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
