import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const EditScores = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, exam, ca, final

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchScores();
    }
  }, [selectedCourse, filterType]);

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

  const fetchScores = async () => {
    if (!selectedCourse) return;

    try {
      let url = `/courses/${selectedCourse.id}/scores/`;
      if (filterType !== 'all') {
        url += `?type=${filterType}`;
      }

      const response = await api.get(url);
      setScores(response.data);
    } catch (err) {
      console.error('Error fetching scores:', err);
      setScores([]);
    }
  };

  const handleScoreChange = (scoreId, field, value) => {
    setScores(prev => prev.map(score =>
      score.id === scoreId
        ? { ...score, [field]: value }
        : score
    ));
  };

  const saveScore = async (scoreId) => {
    const score = scores.find(s => s.id === scoreId);
    if (!score) return;

    setSaving(true);
    setMessage('');

    try {
      await api.patch(`/scores/${scoreId}/`, {
        score: score.score,
        grade: score.grade,
        remarks: score.remarks
      });

      setMessage('Score updated successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error('Error saving score:', err);
      setMessage('Error saving score');
    } finally {
      setSaving(false);
    }
  };

  const saveAllScores = async () => {
    setSaving(true);
    setMessage('');

    try {
      const updatePromises = scores.map(score =>
        api.patch(`/scores/${score.id}/`, {
          score: score.score,
          grade: score.grade,
          remarks: score.remarks
        })
      );

      await Promise.all(updatePromises);
      setMessage('All scores updated successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error('Error saving scores:', err);
      setMessage('Error saving some scores');
    } finally {
      setSaving(false);
    }
  };

  const filteredScores = scores.filter(score =>
    score.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    score.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGradeFromScore = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading edit scores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Edit Scores</h1>
          <p>Edit and correct student scores before final submission</p>
        </div>

        {message && (
          <div className="alert success" style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <div style={{ marginBottom: '20px' }}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="course-select">Select Course</label>
                <select
                  id="course-select"
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === parseInt(e.target.value));
                    setSelectedCourse(course);
                  }}
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="filter-type">Filter by Type</label>
                <select
                  id="filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Scores</option>
                  <option value="exam">Exam Scores</option>
                  <option value="ca">Continuous Assessment</option>
                  <option value="final">Final Grades</option>
                </select>
              </div>
            </div>
          </div>

          {selectedCourse && (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <input
                    type="text"
                    placeholder="Search by student name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      width: '300px'
                    }}
                  />
                </div>
                <button
                  className="btn btn-success"
                  onClick={saveAllScores}
                  disabled={saving || scores.length === 0}
                >
                  {saving ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>

              {filteredScores.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                  {searchTerm ? 'No students found matching your search.' : 'No scores available for editing.'}
                </p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Score Type</th>
                        <th>Score</th>
                        <th>Grade</th>
                        <th>Remarks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScores.map(score => (
                        <tr key={score.id}>
                          <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                            {score.student_id}
                          </td>
                          <td>{score.student_name}</td>
                          <td>
                            <span className={`status-badge ${
                              score.score_type === 'exam' ? 'status-approved' :
                              score.score_type === 'ca' ? 'status-submitted' :
                              'status-pending'
                            }`}>
                              {score.score_type?.charAt(0).toUpperCase() + score.score_type?.slice(1) || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={score.score || ''}
                              onChange={(e) => handleScoreChange(score.id, 'score', e.target.value)}
                              style={{ width: '70px', padding: '4px', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={score.grade || ''}
                              onChange={(e) => handleScoreChange(score.id, 'grade', e.target.value)}
                              style={{ width: '50px', padding: '4px', textAlign: 'center' }}
                              placeholder={getGradeFromScore(score.score)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={score.remarks || ''}
                              onChange={(e) => handleScoreChange(score.id, 'remarks', e.target.value)}
                              style={{ width: '120px', padding: '4px' }}
                              placeholder="Optional remarks"
                            />
                          </td>
                          <td>
                            <button
                              className="btn"
                              onClick={() => saveScore(score.id)}
                              disabled={saving}
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--background)', borderRadius: '4px' }}>
                <h3>Grade Scale Reference</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginTop: '10px' }}>
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
                <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Grades are automatically suggested based on scores, but you can override them manually.
                </p>
              </div>
            </>
          )}

          {!selectedCourse && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              Please select a course to edit scores.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditScores;
