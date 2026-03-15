import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import './HOD.css';

const AssignCourses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch department courses
      const coursesResponse = await api.get(`/departments/${user.department_id}/courses/`);
      setCourses(coursesResponse.data);

      // Fetch department lecturers
      const lecturersResponse = await api.get(`/departments/${user.department_id}/lecturers/`);
      setLecturers(lecturersResponse.data);

      // Fetch current assignments
      const assignmentsResponse = await api.get('/course-assignments/');
      const departmentAssignments = assignmentsResponse.data.filter(
        assignment => assignment.course?.department === user.department_id
      );
      setAssignments(departmentAssignments);

    } catch (err) {
      console.error('Error fetching data:', err);
      setMessage('Failed to load data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !selectedLecturer) {
      setMessage('Please select both course and lecturer');
      setMessageType('error');
      return;
    }

    try {
      setAssigning(true);
      setMessage('');

      const response = await api.post('/course-assignments/', {
        course: selectedCourse,
        lecturer: selectedLecturer
      });

      setMessage('Course assigned successfully!');
      setMessageType('success');
      setSelectedCourse('');
      setSelectedLecturer('');

      // Refresh assignments
      fetchData();

    } catch (err) {
      console.error('Error assigning course:', err);
      setMessage('Failed to assign course. It may already be assigned.');
      setMessageType('error');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignCourse = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to unassign this course?')) {
      return;
    }

    try {
      await api.delete(`/course-assignments/${assignmentId}/`);
      setMessage('Course unassigned successfully!');
      setMessageType('success');
      fetchData();
    } catch (err) {
      console.error('Error unassigning course:', err);
      setMessage('Failed to unassign course');
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading course assignments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Assign Courses to Lecturers</h1>
          <p>Manage course assignments for your department</p>
        </div>

        {message && (
          <div className={messageType === 'success' ? 'success' : 'error'}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <h2>Assign New Course</h2>
          <form onSubmit={handleAssignCourse}>
            <div className="form-group">
              <label htmlFor="course">Select Course:</label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="">Choose a course...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="lecturer">Select Lecturer:</label>
              <select
                id="lecturer"
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                required
              >
                <option value="">Choose a lecturer...</option>
                {lecturers.map(lecturer => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.user.first_name} {lecturer.user.last_name} ({lecturer.employee_id})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={assigning}
            >
              {assigning ? 'Assigning...' : 'Assign Course'}
            </button>
          </form>
        </div>

        <div className="dashboard-section">
          <h2>Current Assignments</h2>
          {assignments.length === 0 ? (
            <p>No course assignments found.</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Lecturer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td>{assignment.course?.code}</td>
                    <td>{assignment.course?.name}</td>
                    <td>
                      {assignment.lecturer?.user?.first_name} {assignment.lecturer?.user?.last_name}
                    </td>
                    <td>
                      <button
                        className="btn"
                        style={{ backgroundColor: 'var(--error)' }}
                        onClick={() => handleUnassignCourse(assignment.id)}
                      >
                        Unassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignCourses;
