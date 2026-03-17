import React, { useState } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [filters, setFilters] = useState({});
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/management/generate-report/', { type: reportType, filters });
      setReportData(response.data);
    } catch (err) {
      setError('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Reports</h1>
        </div>
        <div className="report-generator">
          <div className="form-group">
            <label>Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="">Select Type</option>
              <option value="result_summary">Result Summary</option>
              <option value="grade_distribution">Grade Distribution</option>
              <option value="submission_stats">Submission Statistics</option>
            </select>
          </div>
          {reportType === 'result_summary' && (
            <div className="form-group">
              <label>Course</label>
              <input name="course" onChange={handleFilterChange} />
            </div>
          )}
          <button onClick={generateReport} disabled={loading || !reportType}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {reportData && (
          <div className="report-display">
            <h2>Report Results</h2>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
