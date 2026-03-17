import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/management/reports-analytics/');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (reportType) => {
    // In a real implementation, this would trigger a download
    console.log(`Exporting ${reportType} report`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading reports...</h2>
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
          <h1>Reports & Analytics</h1>
        </div>

        <div className="report-tabs">
          <button
            className={`tab-button ${selectedReport === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedReport('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${selectedReport === 'enrollment' ? 'active' : ''}`}
            onClick={() => setSelectedReport('enrollment')}
          >
            Enrollment
          </button>
          <button
            className={`tab-button ${selectedReport === 'performance' ? 'active' : ''}`}
            onClick={() => setSelectedReport('performance')}
          >
            Performance
          </button>
          <button
            className={`tab-button ${selectedReport === 'faculty' ? 'active' : ''}`}
            onClick={() => setSelectedReport('faculty')}
          >
            Faculty Reports
          </button>
        </div>

        <div className="report-content">
          {selectedReport === 'overview' && (
            <div className="report-section">
              <div className="report-header">
                <h2>System Overview</h2>
                <button className="btn-secondary" onClick={() => exportReport('overview')}>
                  Export PDF
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Students</h3>
                  <p className="stat-number">{reports.total_students || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Lecturers</h3>
                  <p className="stat-number">{reports.total_lecturers || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Courses</h3>
                  <p className="stat-number">{reports.total_courses || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Results</h3>
                  <p className="stat-number">{reports.active_results || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Faculties</h3>
                  <p className="stat-number">{reports.total_faculties || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Departments</h3>
                  <p className="stat-number">{reports.total_departments || 0}</p>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'enrollment' && (
            <div className="report-section">
              <div className="report-header">
                <h2>Enrollment Statistics</h2>
                <button className="btn-secondary" onClick={() => exportReport('enrollment')}>
                  Export PDF
                </button>
              </div>

              <div className="chart-placeholder">
                <h3>Enrollment by Program</h3>
                <div className="placeholder-content">
                  <p>Enrollment chart would be displayed here</p>
                  <p>Data: {JSON.stringify(reports.enrollment_by_program || {})}</p>
                </div>
              </div>

              <div className="chart-placeholder">
                <h3>Enrollment Trends</h3>
                <div className="placeholder-content">
                  <p>Enrollment trends chart would be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'performance' && (
            <div className="report-section">
              <div className="report-header">
                <h2>Academic Performance</h2>
                <button className="btn-secondary" onClick={() => exportReport('performance')}>
                  Export PDF
                </button>
              </div>

              <div className="chart-placeholder">
                <h3>Grade Distribution</h3>
                <div className="placeholder-content">
                  <p>Grade distribution chart would be displayed here</p>
                  <p>Data: {JSON.stringify(reports.grade_distribution || {})}</p>
                </div>
              </div>

              <div className="chart-placeholder">
                <h3>Pass/Fail Rates</h3>
                <div className="placeholder-content">
                  <p>Pass/fail rates chart would be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'faculty' && (
            <div className="report-section">
              <div className="report-header">
                <h2>Faculty Reports</h2>
                <button className="btn-secondary" onClick={() => exportReport('faculty')}>
                  Export PDF
                </button>
              </div>

              <div className="faculty-stats">
                {reports.faculty_reports && reports.faculty_reports.map(faculty => (
                  <div key={faculty.id} className="faculty-card">
                    <h3>{faculty.name}</h3>
                    <div className="faculty-metrics">
                      <div className="metric">
                        <span>Departments:</span>
                        <span>{faculty.departments_count}</span>
                      </div>
                      <div className="metric">
                        <span>Students:</span>
                        <span>{faculty.students_count}</span>
                      </div>
                      <div className="metric">
                        <span>Courses:</span>
                        <span>{faculty.courses_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
