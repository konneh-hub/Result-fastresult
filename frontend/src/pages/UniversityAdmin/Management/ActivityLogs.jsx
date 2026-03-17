import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const ActivityLogs = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get('/activity-logs/');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = !actionFilter || log.action === actionFilter;

    const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);

    return matchesSearch && matchesAction && matchesDate;
  });

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'create';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'update';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'delete';
    if (action.includes('LOGIN')) return 'login';
    if (action.includes('LOGOUT')) return 'logout';
    return 'other';
  };

  const exportLogs = () => {
    // In a real implementation, this would trigger a CSV download
    console.log('Exporting activity logs');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading activity logs...</h2>
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
          <h1>Activity Logs</h1>
          <button className="btn-secondary" onClick={exportLogs}>
            Export Logs
          </button>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by user, action, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Actions</option>
              <option value="USER_LOGIN">Login</option>
              <option value="USER_LOGOUT">Logout</option>
              <option value="CREATE_FACULTY">Create Faculty</option>
              <option value="UPDATE_FACULTY">Update Faculty</option>
              <option value="DELETE_FACULTY">Delete Faculty</option>
              <option value="CREATE_DEPARTMENT">Create Department</option>
              <option value="UPDATE_DEPARTMENT">Update Department</option>
              <option value="DELETE_DEPARTMENT">Delete Department</option>
              <option value="CREATE_PROGRAM">Create Program</option>
              <option value="UPDATE_PROGRAM">Update Program</option>
              <option value="DELETE_PROGRAM">Delete Program</option>
              <option value="CREATE_COURSE">Create Course</option>
              <option value="UPDATE_COURSE">Update Course</option>
              <option value="DELETE_COURSE">Delete Course</option>
              <option value="BULK_UPLOAD_STUDENTS">Bulk Upload Students</option>
              <option value="BULK_UPLOAD_LECTURERS">Bulk Upload Lecturers</option>
              <option value="ASSIGN_ROLE">Assign Role</option>
            </select>
          </div>
          <div className="filter-group">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            />
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.user_name}</td>
                  <td>
                    <span className={`action-badge ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="details-cell">{log.details}</td>
                  <td>{log.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="log-summary">
          <div className="summary-stats">
            <div className="stat-card">
              <h3>Total Logs</h3>
              <p>{logs.length}</p>
            </div>
            <div className="stat-card">
              <h3>Today's Logs</h3>
              <p>{logs.filter(log => log.timestamp.startsWith(new Date().toISOString().split('T')[0])).length}</p>
            </div>
            <div className="stat-card">
              <h3>Login Events</h3>
              <p>{logs.filter(log => log.action.includes('LOGIN')).length}</p>
            </div>
            <div className="stat-card">
              <h3>Data Changes</h3>
              <p>{logs.filter(log => ['CREATE', 'UPDATE', 'DELETE'].some(action => log.action.includes(action))).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
