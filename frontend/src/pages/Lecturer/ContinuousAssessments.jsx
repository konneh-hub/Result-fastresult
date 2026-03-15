import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const ContinuousAssessments = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [assessmentData, setAssessmentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsAndAssessments();
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

  const fetchStudentsAndAssessments = async () => {
    if (!selectedCourse) return;

    try {
      const [studentsResponse, assessmentsResponse] = await Promise.all([
        api.get(`/courses/${selectedCourse.id}/students/`),
        api.get(`/courses/${selectedCourse.id}/assessments/`)
      ]);

      setStudents(studentsResponse.data);

      // Initialize assessment data
      const initialData = {};
      studentsResponse.data.forEach(student => {
        const existingAssessment = assessmentsResponse.data.find(a => a.student === student.id);
        initialData[student.id] = {
          quiz1: existingAssessment?.quiz1 || '',
          quiz2: existingAssessment?.quiz2 || '',
          assignment1: existingAssessment?.assignment1 || '',
          assignment2: existingAssessment?.assignment2 || '',
          midterm: existingAssessment?.midterm || '',
          project: existingAssessment?.project || ''
        };
      });
      setAssessmentData(initialData);

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleScoreChange = (studentId, assessmentType, value) => {
    const numValue = value === '' ? '' : Math.max(0, Math.min(100, parseFloat(value) || 0));
    setAssessmentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentType]: numValue
      }
    }));
  };

  const calculateTotal = (studentData) => {
    const scores = Object.values(studentData).filter(score => score !== '');
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + parseFloat(score), 0) / scores.length;
  };

  const saveAssessments = async () => {
    if (!selectedCourse) return;

    setSaving(true);
    setMessage('');

    try {
      const assessmentPromises = students.map(student => {
        const data = assessmentData[student.id];
        return api.post(`/courses/${selectedCourse.id}/assessments/`, {
          student: student.id,
          ...data
        });
      });

      await Promise.all(assessmentPromises);
      setMessage('Continuous assessment scores saved successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error('Error saving assessments:', err);
      setMessage('Error saving assessment scores');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading continuous assessments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Continuous Assessments</h1>
          <p>Enter and manage continuous assessment scores for your courses</p>
        </div>

        {message && (
          <div className="alert success" style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

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

          {selectedCourse && students.length > 0 && (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Assessment Scores - {selectedCourse.code}</h2>
                <button
                  className="btn btn-success"
                  onClick={saveAssessments}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save All Scores'}
                </button>
              </div>

              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Quiz 1 (10%)</th>
                      <th>Quiz 2 (10%)</th>
                      <th>Assignment 1 (15%)</th>
                      <th>Assignment 2 (15%)</th>
                      <th>Midterm (20%)</th>
                      <th>Project (30%)</th>
                      <th>Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const studentData = assessmentData[student.id] || {};
                      const average = calculateTotal(studentData);

                      return (
                        <tr key={student.id}>
                          <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                            {student.student_id}
                          </td>
                          <td>{student.first_name} {student.last_name}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={studentData.quiz1 || ''}
                              onChange={(e) => handleScoreChange(student.id, 'quiz1', e.target.value)}
                              style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={studentData.quiz2 || ''}
                              onChange={(e) => handleScoreChange(student.id, 'quiz2', e.target.value)}
                              style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={studentData.assignment1 || ''}
                              onChange={(e) => handleScoreChange(student.id, 'assignment1', e.target.value)}
                              style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={studentData.assignment2 || ''}
                              onChange={(e) => handleScoreChange(student.id, 'assignment2', e.target.value)}
                              style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={studentData.midterm || ''}
                              onChange={(e) => handleScoreChange(student.id, 'midterm', e.target.value)}
                              style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={studentData.project || ''}
                              onChange={(e) => handleScoreChange(student.id, 'project', e.target.value)}
                              style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ fontWeight: '600', color: average >= 50 ? 'var(--success)' : 'var(--error)' }}>
                            {average.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--background)', borderRadius: '4px' }}>
                <h3>Assessment Weighting</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  <div>Quiz 1 & 2: 20% (10% each)</div>
                  <div>Assignment 1 & 2: 30% (15% each)</div>
                  <div>Midterm: 20%</div>
                  <div>Project: 30%</div>
                </div>
                <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  The average shown is a simple average of entered scores. Final grading will be calculated based on the weighted formula.
                </p>
              </div>
            </>
          )}

          {selectedCourse && students.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              No students enrolled in this course.
            </p>
          )}

          {!selectedCourse && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              Please select a course to enter continuous assessment scores.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContinuousAssessments;
