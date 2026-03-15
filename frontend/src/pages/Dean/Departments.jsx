import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/dean/departments/');
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return <div className="loading">Loading departments...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="departments-page">
      <h1>Faculty Departments</h1>
      <p className="page-description">View departments in your faculty and keep track of performance metrics.</p>

      {departments.length === 0 ? (
        <div className="no-data">
          <p>No departments found for your faculty.</p>
        </div>
      ) : (
        <div className="departments-grid">
          {departments.map(dept => (
            <div key={dept.id} className="department-card">
              <h3>{dept.name}</h3>
              <div className="dept-stats">
                <div>
                  <strong>Courses:</strong> {dept.courses}
                </div>
                <div>
                  <strong>Lecturers:</strong> {dept.lecturers}
                </div>
                <div>
                  <strong>Students:</strong> {dept.students}
                </div>
              </div>
              <div className="dept-actions">
                <button className="btn-outline">View Details</button>
                <button className="btn-secondary">Export Report</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Departments;
