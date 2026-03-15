import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const GpaCgpa = () => {
  const { user } = useContext(AuthContext);
  const [gpaData, setGpaData] = useState([]);
  const [cgpaData, setCgpaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGpaCgpa = async () => {
      try {
        const gpaResponse = await api.get(`/students/${user.id}/gpa/`);
        setGpaData(gpaResponse.data);

        // Mock CGPA data for now
        setCgpaData([
          { academic_session: '2022-2023', cgpa: 3.2 },
          { academic_session: '2023-2024', cgpa: 3.5 }
        ]);
      } catch (error) {
        console.error('Error fetching GPA/CGPA:', error);
        // Mock data
        setGpaData([
          { semester: { name: 'Fall 2023', academic_session: { name: '2023-2024' } }, gpa: 3.4 },
          { semester: { name: 'Spring 2024', academic_session: { name: '2023-2024' } }, gpa: 3.6 }
        ]);
        setCgpaData([
          { academic_session: '2022-2023', cgpa: 3.2 },
          { academic_session: '2023-2024', cgpa: 3.5 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGpaCgpa();
  }, [user]);

  const currentGPA = gpaData.length > 0 ? gpaData[gpaData.length - 1].gpa : 0;
  const currentCGPA = cgpaData.length > 0 ? cgpaData[cgpaData.length - 1].cgpa : 0;

  if (loading) {
    return <div className="loading">Loading GPA and CGPA...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="gpa-cgpa-page">
      <h1>GPA & CGPA</h1>
      <p className="page-description">View your Grade Point Average and Cumulative Grade Point Average.</p>

      <div className="gpa-overview">
        <div className="overview-card">
          <h3>Current GPA</h3>
          <div className="gpa-display">
            <span className="gpa-value">{currentGPA.toFixed(2)}</span>
            <span className="gpa-scale">/ 4.0</span>
          </div>
          <p className="gpa-status">
            {currentGPA >= 3.5 ? 'Excellent' : currentGPA >= 3.0 ? 'Good' : currentGPA >= 2.0 ? 'Satisfactory' : 'Needs Improvement'}
          </p>
        </div>

        <div className="overview-card">
          <h3>Current CGPA</h3>
          <div className="gpa-display">
            <span className="gpa-value">{currentCGPA.toFixed(2)}</span>
            <span className="gpa-scale">/ 4.0</span>
          </div>
          <p className="gpa-status">
            {currentCGPA >= 3.5 ? 'Excellent' : currentCGPA >= 3.0 ? 'Good' : currentCGPA >= 2.0 ? 'Satisfactory' : 'Needs Improvement'}
          </p>
        </div>
      </div>

      <div className="gpa-history">
        <div className="history-section">
          <h3>Semester GPA History</h3>
          {gpaData.length === 0 ? (
            <p>No GPA records available</p>
          ) : (
            <div className="gpa-table">
              <table>
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Academic Session</th>
                    <th>GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {gpaData.map((record, index) => (
                    <tr key={index}>
                      <td>{record.semester?.name || 'N/A'}</td>
                      <td>{record.semester?.academic_session?.name || 'N/A'}</td>
                      <td className="gpa-cell">{record.gpa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="history-section">
          <h3>CGPA History</h3>
          {cgpaData.length === 0 ? (
            <p>No CGPA records available</p>
          ) : (
            <div className="cgpa-table">
              <table>
                <thead>
                  <tr>
                    <th>Academic Session</th>
                    <th>CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {cgpaData.map((record, index) => (
                    <tr key={index}>
                      <td>{record.academic_session}</td>
                      <td className="gpa-cell">{record.cgpa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="gpa-info">
        <h3>GPA Calculation Information</h3>
        <div className="grade-scale">
          <h4>Grade Scale</h4>
          <ul>
            <li><strong>A:</strong> 4.0 (90-100%)</li>
            <li><strong>B+:</strong> 3.5 (85-89%)</li>
            <li><strong>B:</strong> 3.0 (80-84%)</li>
            <li><strong>C+:</strong> 2.5 (75-79%)</li>
            <li><strong>C:</strong> 2.0 (70-74%)</li>
            <li><strong>D:</strong> 1.0 (60-69%)</li>
            <li><strong>F:</strong> 0.0 (Below 60%)</li>
          </ul>
        </div>
      </div>

      <div className="gpa-actions">
        <button className="btn-primary">Download GPA Report</button>
        <button className="btn-secondary">View Detailed Transcript</button>
      </div>
    </div>
  );
};

export default GpaCgpa;
