import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/dean/reports/');
        setReports(response.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!reports) {
    return <div className="error">No reports data available</div>;
  }

  return (
    <div className="reports-page">
      <h1>Faculty Reports & Analytics</h1>
      <p className="page-description">Comprehensive overview of faculty performance and statistics.</p>

      {/* Faculty Overview */}
      <div className="report-section">
        <h2>Faculty Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{reports.faculty_overview.departments}</h3>
            <p>Departments</p>
          </div>
          <div className="stat-card">
            <h3>{reports.faculty_overview.courses}</h3>
            <p>Courses</p>
          </div>
          <div className="stat-card">
            <h3>{reports.faculty_overview.lecturers}</h3>
            <p>Lecturers</p>
          </div>
          <div className="stat-card">
            <h3>{reports.faculty_overview.students}</h3>
            <p>Students</p>
          </div>
        </div>
      </div>

      {/* Result Statistics */}
      <div className="report-section">
        <h2>Result Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{reports.result_statistics.total_results}</h3>
            <p>Total Results</p>
          </div>
          <div className="stat-card">
            <h3>{reports.result_statistics.passed_results}</h3>
            <p>Passed Results</p>
          </div>
          <div className="stat-card">
            <h3>{reports.result_statistics.pass_rate}%</h3>
            <p>Pass Rate</p>
          </div>
        </div>
      </div>

      {/* Submission Statistics */}
      <div className="report-section">
        <h2>Submission Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{reports.submission_statistics.total_submissions}</h3>
            <p>Total Submissions</p>
          </div>
          <div className="stat-card">
            <h3>{reports.submission_statistics.verified_submissions}</h3>
            <p>Verified</p>
          </div>
          <div className="stat-card">
            <h3>{reports.submission_statistics.approved_submissions}</h3>
            <p>Approved</p>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="report-section">
        <h2>Department Performance</h2>
        {reports.department_performance.length === 0 ? (
          <div className="no-data">
            <p>No department performance data available.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Students</th>
                <th>Courses</th>
                <th>Results</th>
                <th>Pass Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {reports.department_performance.map(dept => (
                <tr key={dept.name}>
                  <td>{dept.name}</td>
                  <td>{dept.students}</td>
                  <td>{dept.courses}</td>
                  <td>{dept.results}</td>
                  <td>{dept.pass_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Export Options */}
      <div className="report-section">
        <h2>Export Reports</h2>
        <div className="export-options">
          <button className="btn-primary">Export as PDF</button>
          <button className="btn-outline">Export as Excel</button>
          <button className="btn-secondary">Print Report</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
