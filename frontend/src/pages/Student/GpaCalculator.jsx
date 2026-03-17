import React, { useState } from 'react';

const GpaCalculator = () => {
  const [courses, setCourses] = useState([
    { id: 1, name: '', credits: 3, score: '', grade: '' }
  ]);

  const gradeScale = {
    'A': { points: 4.0, range: '90-100' },
    'B+': { points: 3.5, range: '85-89' },
    'B': { points: 3.0, range: '80-84' },
    'C+': { points: 2.5, range: '75-79' },
    'C': { points: 2.0, range: '70-74' },
    'D': { points: 1.0, range: '60-69' },
    'F': { points: 0.0, range: '0-59' }
  };

  const calculateGradeFromScore = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return '';

    if (numScore >= 90) return 'A';
    if (numScore >= 85) return 'B+';
    if (numScore >= 80) return 'B';
    if (numScore >= 75) return 'C+';
    if (numScore >= 70) return 'C';
    if (numScore >= 60) return 'D';
    return 'F';
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const credits = parseFloat(course.credits) || 0;
      const grade = course.grade || calculateGradeFromScore(course.score);
      const gradePoints = gradeScale[grade]?.points || 0;

      totalPoints += gradePoints * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const addCourse = () => {
    const newId = Math.max(...courses.map(c => c.id)) + 1;
    setCourses([...courses, { id: newId, name: '', credits: 3, score: '', grade: '' }]);
  };

  const removeCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(course => {
      if (course.id === id) {
        const updatedCourse = { ...course, [field]: value };

        // Auto-calculate grade from score if score is provided
        if (field === 'score' && value) {
          updatedCourse.grade = calculateGradeFromScore(value);
        }

        return updatedCourse;
      }
      return course;
    }));
  };

  const resetCalculator = () => {
    setCourses([{ id: 1, name: '', credits: 3, score: '', grade: '' }]);
  };

  return (
    <div className="gpa-calculator-page">
      <h1>GPA Calculator</h1>
      <p className="page-description">Calculate your estimated GPA by entering course details and scores.</p>

      <div className="calculator-container">
        <div className="courses-section">
          <h3>Course Details</h3>
          {courses.map(course => (
            <div key={course.id} className="course-row">
              <input
                type="text"
                placeholder="Course Name"
                value={course.name}
                onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                className="course-name"
              />
              <input
                type="number"
                placeholder="Credits"
                value={course.credits}
                onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                className="course-credits"
                min="1"
                max="6"
              />
              <input
                type="number"
                placeholder="Score (%)"
                value={course.score}
                onChange={(e) => updateCourse(course.id, 'score', e.target.value)}
                className="course-score"
                min="0"
                max="100"
              />
              <select
                value={course.grade}
                onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                className="course-grade"
              >
                <option value="">Select Grade</option>
                {Object.entries(gradeScale).map(([grade, info]) => (
                  <option key={grade} value={grade}>
                    {grade} ({info.range}%)
                  </option>
                ))}
              </select>
              {courses.length > 1 && (
                <button
                  className="remove-course-btn"
                  onClick={() => removeCourse(course.id)}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <div className="calculator-actions">
            <button className="btn-secondary" onClick={addCourse}>Add Course</button>
            <button className="btn-outline" onClick={resetCalculator}>Reset</button>
          </div>
        </div>

        <div className="results-section">
          <h3>Calculated GPA</h3>
          <div className="gpa-result">
            <span className="gpa-value">{calculateGPA()}</span>
            <span className="gpa-scale">/ 4.0</span>
          </div>

          <div className="gpa-summary">
            <div className="summary-item">
              <span>Total Courses:</span>
              <span>{courses.length}</span>
            </div>
            <div className="summary-item">
              <span>Total Credits:</span>
              <span>{courses.reduce((sum, course) => sum + (parseFloat(course.credits) || 0), 0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grade-scale-info">
        <h3>Grade Scale Reference</h3>
        <div className="grade-scale-table">
          <table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Points</th>
                <th>Percentage Range</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(gradeScale).map(([grade, info]) => (
                <tr key={grade}>
                  <td>{grade}</td>
                  <td>{info.points}</td>
                  <td>{info.range}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GpaCalculator;
