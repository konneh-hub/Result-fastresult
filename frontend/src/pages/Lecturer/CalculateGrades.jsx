import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const CalculateGrades = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [gradingPolicy, setGradingPolicy] = useState({
    quiz1_weight: 10,
    quiz2_weight: 10,
    assignment1_weight: 15,
    assignment2_weight: 15,
    midterm_weight: 20,
    project_weight: 30
  });
  const [calculatedGrades, setCalculatedGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsAndData();
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

  const fetchStudentsAndData = async () => {
    if (!selectedCourse) return;

    try {
      const [studentsResponse, policyResponse] = await Promise.all([
        api.get(`/courses/${selectedCourse.id}/students/`),
        api.get(`/courses/${selectedCourse.id}/grading-policy/`)
      ]);

      setStudents(studentsResponse.data);

      // Set grading policy if available
      if (policyResponse.data) {
        setGradingPolicy(policyResponse.data);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const calculateGrade = (student) => {
    // This would typically fetch assessment data from the backend
    // For now, we'll use mock calculation
    const assessments = {
      quiz1: student.quiz1 || 0,
      quiz2: student.quiz2 || 0,
      assignment1: student.assignment1 || 0,
      assignment2: student.assignment2 || 0,
      midterm: student.midterm || 0,
      project: student.project || 0
    };

    // Calculate weighted total
    const totalScore =
      (assessments.quiz1 * gradingPolicy.quiz1_weight / 100) +
      (assessments.quiz2 * gradingPolicy.quiz2_weight / 100) +
      (assessments.assignment1 * gradingPolicy.assignment1_weight / 100) +
      (assessments.assignment2 * gradingPolicy.assignment2_weight / 100) +
      (assessments.midterm * gradingPolicy.midterm_weight / 100) +
      (assessments.project * gradingPolicy.project_weight / 100);

    // Determine letter grade
    let letterGrade;
    if (totalScore >= 90) letterGrade = 'A+';
    else if (totalScore >= 85) letterGrade = 'A';
    else if (totalScore >= 80) letterGrade = 'A-';
    else if (totalScore >= 75) letterGrade = 'B+';
    else if (totalScore >= 70) letterGrade = 'B';
    else if (totalScore >= 65) letterGrade = 'B-';
    else if (totalScore >= 60) letterGrade = 'C+';
    else if (totalScore >= 55) letterGrade = 'C';
    else if (totalScore >= 50) letterGrade = 'C-';
    else if (totalScore >= 45) letterGrade = 'D';
    else letterGrade = 'F';

    return {
      student_id: student.student_id,
      student_name: `${student.first_name} ${student.last_name}`,
      total_score: totalScore.toFixed(2),
      letter_grade: letterGrade,
      assessments
    };
  };

  const handleCalculateGrades = async () => {
    if (!selectedCourse) return;

    setCalculating(true);
    setMessage('');

    try {
      // Calculate grades for all students
      const grades = students.map(calculateGrade);
      setCalculatedGrades(grades);

      setMessage('Grades calculated successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error('Error calculating grades:', err);
      setMessage('Error calculating grades');
    } finally {
      setCalculating(false);
    }
  };

  const saveGrades = async () => {
    if (calculatedGrades.length === 0) return;

    setCalculating(true);
    setMessage('');

    try {
      // Save calculated grades to backend
      await api.post(`/courses/${selectedCourse.id}/calculate-grades/`, {
        grades: calculatedGrades,
        grading_policy: gradingPolicy
      });

      setMessage('Grades saved successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error('Error saving grades:', err);
      setMessage('Error saving grades');
    } finally {
      setCalculating(false);
    }
  };

  const updateGradingPolicy = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setGradingPolicy(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const totalWeight = Object.values(gradingPolicy).reduce((sum, weight) => sum + weight, 0);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading grade calculator...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Calculate Grades</h1>
          <p>Calculate final grades based on assessment scores and grading policies</p>
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

          {selectedCourse && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="dashboard-section">
                  <h2>Grading Policy</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label>Quiz 1 (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradingPolicy.quiz1_weight}
                        onChange={(e) => updateGradingPolicy('quiz1_weight', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Quiz 2 (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradingPolicy.quiz2_weight}
                        onChange={(e) => updateGradingPolicy('quiz2_weight', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Assignment 1 (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradingPolicy.assignment1_weight}
                        onChange={(e) => updateGradingPolicy('assignment1_weight', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Assignment 2 (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradingPolicy.assignment2_weight}
                        onChange={(e) => updateGradingPolicy('assignment2_weight', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Midterm (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradingPolicy.midterm_weight}
                        onChange={(e) => updateGradingPolicy('midterm_weight', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Project (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradingPolicy.project_weight}
                        onChange={(e) => updateGradingPolicy('project_weight', e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: totalWeight === 100 ? 'var(--success)' : 'var(--error)',
                    color: 'white',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    Total Weight: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
                  </div>
                </div>

                <div className="dashboard-section">
                  <h2>Grade Scale</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '14px' }}>
                    <div>90-100: A+</div>
                    <div>85-89: A</div>
                    <div>80-84: A-</div>
                    <div>75-79: B+</div>
                    <div>70-74: B</div>
                    <div>65-69: B-</div>
                    <div>60-64: C+</div>
                    <div>55-59: C</div>
                    <div>50-54: C-</div>
                    <div>45-49: D</div>
                    <div>0-44: F</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <button
                  className="btn btn-success"
                  onClick={handleCalculateGrades}
                  disabled={calculating || totalWeight !== 100}
                  style={{ marginRight: '10px' }}
                >
                  {calculating ? 'Calculating...' : 'Calculate Grades'}
                </button>
                {calculatedGrades.length > 0 && (
                  <button
                    className="btn"
                    onClick={saveGrades}
                    disabled={calculating}
                  >
                    Save Grades
                  </button>
                )}
              </div>

              {calculatedGrades.length > 0 && (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Quiz 1</th>
                        <th>Quiz 2</th>
                        <th>Assignment 1</th>
                        <th>Assignment 2</th>
                        <th>Midterm</th>
                        <th>Project</th>
                        <th>Total Score</th>
                        <th>Final Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedGrades.map((grade, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                            {grade.student_id}
                          </td>
                          <td>{grade.student_name}</td>
                          <td>{grade.assessments.quiz1 || '-'}</td>
                          <td>{grade.assessments.quiz2 || '-'}</td>
                          <td>{grade.assessments.assignment1 || '-'}</td>
                          <td>{grade.assessments.assignment2 || '-'}</td>
                          <td>{grade.assessments.midterm || '-'}</td>
                          <td>{grade.assessments.project || '-'}</td>
                          <td style={{ fontWeight: '600' }}>{grade.total_score}%</td>
                          <td style={{
                            fontWeight: '600',
                            color: grade.letter_grade === 'F' ? 'var(--error)' : 'var(--success)'
                          }}>
                            {grade.letter_grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {!selectedCourse && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              Please select a course to calculate grades.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculateGrades;
