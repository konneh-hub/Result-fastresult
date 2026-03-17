import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const Courses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    program: '',
    semester: '',
    credit_hours: '',
    description: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchPrograms();
    fetchSemesters();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs/');
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await api.get('/semesters/');
      setSemesters(response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}/`, formData);
      } else {
        await api.post('/courses/', formData);
      }
      fetchCourses();
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ name: '', code: '', program: '', semester: '', credit_hours: '', description: '' });
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code || '',
      program: course.program || '',
      semester: course.semester || '',
      credit_hours: course.credit_hours || '',
      description: course.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${courseId}/`);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({ name: '', code: '', program: '', semester: '', credit_hours: '', description: '' });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading courses...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Manage Courses</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Course
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Program *</label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({...formData, program: e.target.value})}
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>
                        {program.name} ({program.department_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(semester => (
                      <option key={semester.id} value={semester.id}>
                        {semester.name} ({semester.academic_session_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.credit_hours}
                    onChange={(e) => setFormData({...formData, credit_hours: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingCourse ? 'Update' : 'Create'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Program</th>
                <th>Semester</th>
                <th>Credit Hours</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td>{course.code || '-'}</td>
                  <td>{course.program_name || '-'}</td>
                  <td>{course.semester_name || '-'}</td>
                  <td>{course.credit_hours || '-'}</td>
                  <td>{course.description || '-'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(course)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(course.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Courses;
