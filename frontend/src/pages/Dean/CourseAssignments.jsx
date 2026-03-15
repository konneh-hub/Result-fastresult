import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const CourseAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get('/dean/course-assignments/');
        setAssignments(response.data);
      } catch (err) {
        console.error('Error fetching course assignments:', err);
        setError('Failed to load course assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) {
    return <div className="loading">Loading course assignments...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="course-assignments-page">
      <h1>Course Assignments</h1>
      <p className="page-description">Review and manage course assignments for your faculty.</p>

      {assignments.length === 0 ? (
        <div className="no-data">
          <p>No course assignments found yet.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Lecturer</th>
              <th>Semester</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id}>
                <td>{a.course_code} - {a.course_name}</td>
                <td>{a.lecturer}</td>
                <td>{a.semester || '—'}</td>
                <td>{a.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CourseAssignments;
