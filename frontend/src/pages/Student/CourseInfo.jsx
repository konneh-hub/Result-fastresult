import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const CourseInfo = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Get student's course registrations
        const response = await api.get(`/students/${user.id}/`);
        // Assuming the student object has course registrations
        // For now, using mock data
        setCourses([
          {
            id: 1,
            code: 'CS101',
            name: 'Introduction to Computer Science',
            credits: 3,
            lecturer: 'Dr. John Smith',
            schedule: 'Mon/Wed 10:00-11:30',
            room: 'Room 101'
          },
          {
            id: 2,
            code: 'MATH201',
            name: 'Calculus II',
            credits: 4,
            lecturer: 'Prof. Jane Doe',
            schedule: 'Tue/Thu 14:00-15:30',
            room: 'Room 205'
          },
          {
            id: 3,
            code: 'PHY101',
            name: 'Physics I',
            credits: 3,
            lecturer: 'Dr. Bob Wilson',
            schedule: 'Mon/Fri 09:00-10:30',
            room: 'Lab 301'
          }
        ]);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load course information');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  if (loading) {
    return <div className="loading">Loading course information...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="course-info-page">
      <h1>Course Information</h1>
      <p className="page-description">View details of your registered courses for the current semester.</p>

      <div className="courses-summary">
        <div className="summary-card">
          <h3>Total Courses</h3>
          <p className="summary-value">{courses.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Credits</h3>
          <p className="summary-value">{courses.reduce((sum, course) => sum + course.credits, 0)}</p>
        </div>
        <div className="summary-card">
          <h3>Current Semester</h3>
          <p className="summary-value">Fall 2024</p>
        </div>
      </div>

      <div className="courses-list">
        {courses.length === 0 ? (
          <div className="no-courses">
            <p>No courses registered for this semester</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <h3>{course.code} - {course.name}</h3>
                <span className="course-credits">{course.credits} Credits</span>
              </div>
              <div className="course-details">
                <div className="detail-item">
                  <strong>Lecturer:</strong> {course.lecturer}
                </div>
                <div className="detail-item">
                  <strong>Schedule:</strong> {course.schedule}
                </div>
                <div className="detail-item">
                  <strong>Room:</strong> {course.room}
                </div>
              </div>
              <div className="course-actions">
                <button className="btn-outline">View Syllabus</button>
                <button className="btn-outline">Course Materials</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="course-actions">
        <button className="btn-primary">Add/Drop Courses</button>
        <button className="btn-secondary">Download Course Schedule</button>
      </div>
    </div>
  );
};

export default CourseInfo;
