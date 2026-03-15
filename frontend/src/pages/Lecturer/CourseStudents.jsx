import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const CourseStudents = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lecturers/${user.id}/courses/`);
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedCourse) return;

    try {
      const response = await api.get(`/courses/${selectedCourse.id}/students/`);
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    }
  };

  const filteredStudents = students.filter(student =>
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading course students...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Course Students</h1>
          <p>View and manage students enrolled in your courses</p>
        </div>

        <div className="dashboard-section">
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="course-select" style={{ marginRight: '10px', fontWeight: '500' }}>
              Select Course:
            </label>
            <select
              id="course-select"
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = courses.find(c => c.id === parseInt(e.target.value));
                setSelectedCourse(course);
              }}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="stat-card">
                  <h3>Total Students</h3>
                  <p>{students.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Students</h3>
                  <p>{students.filter(s => s.status === 'active').length}</p>
                </div>
                <div className="stat-card">
                  <h3>Male</h3>
                  <p>{students.filter(s => s.gender === 'M').length}</p>
                </div>
                <div className="stat-card">
                  <h3>Female</h3>
                  <p>{students.filter(s => s.gender === 'F').length}</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search students by ID, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {selectedCourse ? (
            filteredStudents.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                {searchTerm ? 'No students found matching your search.' : 'No students enrolled in this course.'}
              </p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Gender</th>
                      <th>Status</th>
                      <th>Enrollment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.id}>
                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                          {student.student_id}
                        </td>
                        <td>{student.first_name} {student.last_name}</td>
                        <td>{student.email}</td>
                        <td>{student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'}</td>
                        <td>
                          <span className={`status-badge ${student.status === 'active' ? 'status-approved' : 'status-pending'}`}>
                            {student.status?.charAt(0).toUpperCase() + student.status?.slice(1) || 'Active'}
                          </span>
                        </td>
                        <td>{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              Please select a course to view students.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseStudents;
