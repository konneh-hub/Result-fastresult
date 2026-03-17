import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const Results = () => {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('all');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get(`/students/${user.id}/results/`);
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching results:', error);
        // Mock data for demonstration
        setResults([
          {
            id: 1,
            course_code: 'CS101',
            course_name: 'Introduction to Computer Science',
            score: 85,
            grade: 'A',
            credits: 3,
            semester: 'Fall 2023'
          },
          {
            id: 2,
            course_code: 'MATH201',
            course_name: 'Calculus II',
            score: 78,
            grade: 'B+',
            credits: 4,
            semester: 'Fall 2023'
          },
          {
            id: 3,
            course_code: 'PHY101',
            course_name: 'Physics I',
            score: 92,
            grade: 'A',
            credits: 3,
            semester: 'Spring 2024'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  const filteredResults = selectedSemester === 'all'
    ? results
    : results.filter(result => result.semester === selectedSemester);

  const calculateGPA = (results) => {
    if (results.length === 0) return 0;
    const totalPoints = results.reduce((sum, result) => {
      const gradePoints = { 'A': 4, 'B+': 3.5, 'B': 3, 'C+': 2.5, 'C': 2, 'D': 1, 'F': 0 };
      return sum + (gradePoints[result.grade] || 0) * result.credits;
    }, 0);
    const totalCredits = results.reduce((sum, result) => sum + result.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const semesters = [...new Set(results.map(result => result.semester))];

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="results-page">
      <h1>Semester Results</h1>
      <p className="page-description">View your academic performance and grades.</p>

      <div className="results-filters">
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

      <div className="results-summary">
        <div className="summary-card">
          <h3>Semester GPA</h3>
          <p className="gpa-value">{calculateGPA(filteredResults)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Courses</h3>
          <p className="summary-value">{filteredResults.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Credits</h3>
          <p className="summary-value">{filteredResults.reduce((sum, result) => sum + result.credits, 0)}</p>
        </div>
      </div>

      <div className="results-table">
        {filteredResults.length === 0 ? (
          <div className="no-results">
            <p>No results available for the selected semester</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Semester</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(result => (
                <tr key={result.id}>
                  <td>{result.course_code}</td>
                  <td>{result.course_name}</td>
                  <td>{result.credits}</td>
                  <td>{result.score}</td>
                  <td className={`grade ${result.grade.startsWith('A') ? 'excellent' : result.grade.startsWith('B') ? 'good' : result.grade.startsWith('C') ? 'average' : 'poor'}`}>
                    {result.grade}
                  </td>
                  <td>{result.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="results-actions">
        <button className="btn-primary">Download Result Slip</button>
        <button className="btn-secondary">View Detailed Transcript</button>
      </div>
    </div>
  );
};

export default Results;
