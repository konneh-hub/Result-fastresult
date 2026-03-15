import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const History = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/students/${user.id}/history/`);
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
        // Mock data
        setHistory([
          {
            semester: 'Fall 2023',
            courses: [
              { code: 'CS101', name: 'Introduction to Computer Science', credits: 3, grade: 'A', score: 92 },
              { code: 'MATH201', name: 'Calculus II', credits: 4, grade: 'B+', score: 85 },
              { code: 'PHY101', name: 'Physics I', credits: 3, grade: 'A', score: 88 }
            ],
            gpa: 3.7,
            totalCredits: 10
          },
          {
            semester: 'Spring 2024',
            courses: [
              { code: 'CS201', name: 'Data Structures', credits: 3, grade: 'A-', score: 89 },
              { code: 'MATH202', name: 'Linear Algebra', credits: 3, grade: 'B', score: 82 },
              { code: 'ENG101', name: 'Technical Writing', credits: 2, grade: 'A', score: 95 }
            ],
            gpa: 3.5,
            totalCredits: 8
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const filteredHistory = selectedSemester === 'all'
    ? history
    : history.filter(record => record.semester === selectedSemester);

  const semesters = [...new Set(history.map(record => record.semester))];
  const totalCredits = history.reduce((sum, record) => sum + record.totalCredits, 0);
  const overallGPA = history.length > 0
    ? (history.reduce((sum, record) => sum + record.gpa, 0) / history.length).toFixed(2)
    : 0;

  if (loading) {
    return <div className="loading">Loading academic history...</div>;
  }

  return (
    <div className="history-page">
      <h1>Academic History</h1>
      <p className="page-description">Complete record of your academic performance across all semesters.</p>

      <div className="history-summary">
        <div className="summary-card">
          <h3>Total Semesters</h3>
          <p className="summary-value">{history.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Credits Earned</h3>
          <p className="summary-value">{totalCredits}</p>
        </div>
        <div className="summary-card">
          <h3>Overall GPA</h3>
          <p className="summary-value">{overallGPA}</p>
        </div>
        <div className="summary-card">
          <h3>Academic Standing</h3>
          <p className="summary-value">
            {overallGPA >= 3.5 ? 'Excellent' : overallGPA >= 3.0 ? 'Good' : overallGPA >= 2.0 ? 'Satisfactory' : 'Needs Improvement'}
          </p>
        </div>
      </div>

      <div className="history-filters">
        <label htmlFor="semester-select">Filter by Semester:</label>
        <select
          id="semester-select"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          <option value="all">All Semesters</option>
          {semesters.map(semester => (
            <option key={semester} value={semester}>{semester}</option>
          ))}
        </select>
      </div>

      <div className="semester-history">
        {filteredHistory.length === 0 ? (
          <div className="no-history">
            <p>No academic history available</p>
          </div>
        ) : (
          filteredHistory.map((record, index) => (
            <div key={index} className="semester-record">
              <div className="semester-header">
                <h3>{record.semester}</h3>
                <div className="semester-stats">
                  <span>GPA: {record.gpa}</span>
                  <span>Credits: {record.totalCredits}</span>
                </div>
              </div>

              <div className="courses-table">
                <table>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Credits</th>
                      <th>Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.courses.map((course, courseIndex) => (
                      <tr key={courseIndex}>
                        <td>{course.code}</td>
                        <td>{course.name}</td>
                        <td>{course.credits}</td>
                        <td>{course.score}</td>
                        <td className={`grade ${course.grade.startsWith('A') ? 'excellent' : course.grade.startsWith('B') ? 'good' : course.grade.startsWith('C') ? 'average' : 'poor'}`}>
                          {course.grade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="history-actions">
        <button className="btn-primary">Download Full Transcript</button>
        <button className="btn-secondary">Export as PDF</button>
        <button className="btn-outline">Print History</button>
      </div>
    </div>
  );
};

export default History;
