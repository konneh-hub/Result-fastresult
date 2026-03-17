import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const AssignedCourses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    fetchAssignedCourses();
  }, [user]);

  const fetchAssignedCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lecturers/${user.id}/courses/`);
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching assigned courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCourses = () => {
    switch (filter) {
      case 'active':
        return courses.filter(course => course.status === 'active');
      case 'completed':
        return courses.filter(course => course.status === 'completed');
      default:
        return courses;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-approved',
      completed: 'status-submitted',
      pending: 'status-pending'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'status-pending'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
      </span>
    );
  };

  const handleViewStudents = (course) => {
    // Navigate to course students page with course data
    window.location.href = `/lecturer/course-students?course=${course.id}`;
  };

  const handleViewMaterials = (course) => {
    window.location.href = `/lecturer/course-materials?course=${course.id}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading assigned courses...</div>
        </div>
      </div>
    );
  }

  const filteredCourses = getFilteredCourses();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Assigned Courses</h1>
          <p>Manage your teaching assignments and course responsibilities</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p>{courses.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active Courses</h3>
            <p>{courses.filter(c => c.status === 'active').length}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p>{courses.filter(c => c.status === 'completed').length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Students</h3>
            <p>{courses.reduce((sum, course) => sum + (course.enrolled_students || 0), 0)}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Courses</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
            >
              <option value="all">All Courses</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          {filteredCourses.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              {filter === 'active' ? 'No active courses assigned.' :
               filter === 'completed' ? 'No completed courses.' :
               'No courses assigned yet.'}
            </p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(course => (
                    <tr key={course.id}>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {course.code}
                      </td>
                      <td>{course.name}</td>
                      <td>{course.department_name}</td>
                      <td>{course.semester}</td>
                      <td>{course.enrolled_students || 0}</td>
                      <td>{getStatusBadge(course.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn"
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                            onClick={() => handleViewStudents(course)}
                          >
                            Students
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                            onClick={() => handleViewMaterials(course)}
                          >
                            Materials
                          </button>
                          <button
                            className="btn btn-accent"
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                            onClick={() => window.location.href = `/lecturer/continuous-assessment?course=${course.id}`}
                          >
                            CA Scores
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Course Details</h3>
                <button className="close-btn" onClick={() => setSelectedCourse(null)}>×</button>
              </div>
              <div>
                <p><strong>Code:</strong> {selectedCourse.code}</p>
                <p><strong>Name:</strong> {selectedCourse.name}</p>
                <p><strong>Department:</strong> {selectedCourse.department_name}</p>
                <p><strong>Semester:</strong> {selectedCourse.semester}</p>
                <p><strong>Credits:</strong> {selectedCourse.credits}</p>
                <p><strong>Description:</strong> {selectedCourse.description}</p>
                <p><strong>Enrolled Students:</strong> {selectedCourse.enrolled_students || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedCourses;
