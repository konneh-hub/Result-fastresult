import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './HOD.css';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [reportData, setReportData] = useState({});
  const [reportType, setReportType] = useState('department-overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
    end: new Date().toISOString().split('T')[0] // Today
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = async () => {
    try {
      setLoading(true);
      setMessage('');

      let data = {};

      switch (reportType) {
        case 'department-overview':
          data = await generateDepartmentOverview();
          break;
        case 'student-performance':
          data = await generateStudentPerformance();
          break;
        case 'lecturer-workload':
          data = await generateLecturerWorkload();
          break;
        case 'course-statistics':
          data = await generateCourseStatistics();
          break;
        default:
          data = {};
      }

      setReportData(data);

    } catch (err) {
      console.error('Error generating report:', err);
      setMessage('Failed to generate report');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const generateDepartmentOverview = async () => {
    const departmentId = user?.department_id || user?.department?.id;
    if (!departmentId) throw new Error('Department not assigned');

    const [studentsRes, lecturersRes, coursesRes, resultsRes] = await Promise.all([
      api.get(`/departments/${departmentId}/students/`),
      api.get(`/departments/${departmentId}/lecturers/`),
      api.get(`/departments/${departmentId}/courses/`),
      api.get('/results/')
    ]);

    const departmentResults = resultsRes.data.filter(
      result => result.course_registration?.course?.department === departmentId
    );

    return {
      title: 'Department Overview Report',
      generatedAt: new Date().toLocaleString(),
      period: `${dateRange.start} to ${dateRange.end}`,
      summary: {
        totalStudents: studentsRes.data.length,
        totalLecturers: lecturersRes.data.length,
        totalCourses: coursesRes.data.length,
        totalResults: departmentResults.length,
        submittedResults: departmentResults.filter(r => r.status === 'submitted').length,
        verifiedResults: departmentResults.filter(r => r.status === 'verified').length,
        completionRate: departmentResults.length ?
          Math.round((departmentResults.filter(r => r.status === 'verified').length / departmentResults.length) * 100) : 0
      }
    };
  };

  const generateStudentPerformance = async () => {
    const resultsRes = await api.get('/results/');
    const departmentResults = resultsRes.data.filter(
      result => result.course_registration?.course?.department === user.department_id &&
               result.status === 'verified'
    );

    // Group by grade
    const gradeDistribution = {};
    departmentResults.forEach(result => {
      const grade = result.grade || 'N/A';
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    return {
      title: 'Student Performance Report',
      generatedAt: new Date().toLocaleString(),
      period: `${dateRange.start} to ${dateRange.end}`,
      gradeDistribution: Object.entries(gradeDistribution),
      totalResults: departmentResults.length,
      averageScore: departmentResults.length ?
        Math.round(departmentResults.reduce((sum, r) => sum + (r.score || 0), 0) / departmentResults.length) : 0
    };
  };

  const generateLecturerWorkload = async () => {
    const departmentId = user?.department_id || user?.department?.id;
    if (!departmentId) throw new Error('Department not assigned');

    const [lecturersRes, assignmentsRes] = await Promise.all([
      api.get(`/departments/${departmentId}/lecturers/`),
      api.get('/course-assignments/')
    ]);

    const departmentAssignments = assignmentsRes.data.filter(
      assignment => assignment.course?.department === departmentId
    );

    const workloadData = lecturersRes.data.map(lecturer => {
      const lecturerAssignments = departmentAssignments.filter(a => a.lecturer === lecturer.id);
      return {
        lecturer: `${lecturer.user.first_name} ${lecturer.user.last_name}`,
        courses: lecturerAssignments.length,
        courseList: lecturerAssignments.map(a => a.course?.name).join(', ')
      };
    });

    return {
      title: 'Lecturer Workload Report',
      generatedAt: new Date().toLocaleString(),
      period: `${dateRange.start} to ${dateRange.end}`,
      workloadData,
      totalAssignments: departmentAssignments.length,
      averageWorkload: lecturersRes.data.length ?
        (departmentAssignments.length / lecturersRes.data.length).toFixed(1) : 0
    };
  };

  const generateCourseStatistics = async () => {
    const coursesRes = await api.get(`/departments/${user.department_id}/courses/`);
    const resultsRes = await api.get('/results/');

    const courseStats = await Promise.all(
      coursesRes.data.map(async (course) => {
        const courseResults = resultsRes.data.filter(
          result => result.course_registration?.course?.id === course.id
        );

        return {
          course: course.name,
          code: course.code,
          totalStudents: courseResults.length,
          submitted: courseResults.filter(r => r.status === 'submitted').length,
          verified: courseResults.filter(r => r.status === 'verified').length,
          completionRate: courseResults.length ?
            Math.round((courseResults.filter(r => r.status === 'verified').length / courseResults.length) * 100) : 0
        };
      })
    );

    return {
      title: 'Course Statistics Report',
      generatedAt: new Date().toLocaleString(),
      period: `${dateRange.start} to ${dateRange.end}`,
      courseStats
    };
  };

  const exportReport = async () => {
    try {
      setGenerating(true);

      // Create a simple text report for now
      let reportContent = `${reportData.title}\n`;
      reportContent += `Generated: ${reportData.generatedAt}\n`;
      reportContent += `Period: ${reportData.period}\n\n`;

      if (reportData.summary) {
        reportContent += 'SUMMARY:\n';
        Object.entries(reportData.summary).forEach(([key, value]) => {
          reportContent += `${key.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${value}\n`;
        });
      }

      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage('Report exported successfully!');
      setMessageType('success');

    } catch (err) {
      console.error('Error exporting report:', err);
      setMessage('Failed to export report');
      setMessageType('error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Department Reports</h1>
          <p>Generate and view department performance reports</p>
        </div>

        {message && (
          <div className={messageType === 'success' ? 'success' : 'error'}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <h2>Report Configuration</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
              <label htmlFor="report-type"><strong>Report Type:</strong></label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
              >
                <option value="department-overview">Department Overview</option>
                <option value="student-performance">Student Performance</option>
                <option value="lecturer-workload">Lecturer Workload</option>
                <option value="course-statistics">Course Statistics</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="start-date"><strong>Start Date:</strong></label>
              <input
                type="date"
                id="start-date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="end-date"><strong>End Date:</strong></label>
              <input
                type="date"
                id="end-date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            </div>

            <button
              className="btn"
              onClick={exportReport}
              disabled={generating || loading}
              style={{ backgroundColor: 'var(--success)' }}
            >
              {generating ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Report Results</h2>
          {loading ? (
            <div className="loading">Generating report...</div>
          ) : (
            <div className="report-display">
              <h3>{reportData.title}</h3>
              <p><strong>Generated:</strong> {reportData.generatedAt}</p>
              <p><strong>Period:</strong> {reportData.period}</p>

              {reportData.summary && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Summary</h4>
                  <div className="info-grid">
                    {Object.entries(reportData.summary).map(([key, value]) => (
                      <div key={key} className="info-item">
                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportData.gradeDistribution && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Grade Distribution</h4>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Grade</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.gradeDistribution.map(([grade, count]) => (
                        <tr key={grade}>
                          <td>{grade}</td>
                          <td>{count}</td>
                          <td>{Math.round((count / reportData.totalResults) * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportData.workloadData && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Lecturer Workload</h4>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Lecturer</th>
                        <th>Courses Assigned</th>
                        <th>Course List</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.workloadData.map((data, index) => (
                        <tr key={index}>
                          <td>{data.lecturer}</td>
                          <td>{data.courses}</td>
                          <td>{data.courseList || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportData.courseStats && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Course Statistics</h4>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Code</th>
                        <th>Total Students</th>
                        <th>Submitted</th>
                        <th>Verified</th>
                        <th>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.courseStats.map((stat, index) => (
                        <tr key={index}>
                          <td>{stat.course}</td>
                          <td>{stat.code}</td>
                          <td>{stat.totalStudents}</td>
                          <td>{stat.submitted}</td>
                          <td>{stat.verified}</td>
                          <td>{stat.completionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
