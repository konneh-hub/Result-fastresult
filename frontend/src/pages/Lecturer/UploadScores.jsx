import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const UploadScores = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [uploadType, setUploadType] = useState('exam'); // exam, ca, final
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lecturers/${user.id}/courses/`);
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage('Please select a valid Excel (.xlsx) or CSV file');
        setFile(null);
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setMessage('File size must be less than 10MB');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedCourse || !file) {
      setMessage('Please select a course and file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', uploadType);
      formData.append('course', selectedCourse.id);

      const response = await api.post('/scores/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Scores uploaded successfully!');
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error('Error uploading scores:', err);
      if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage('Error uploading scores. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    if (!selectedCourse) {
      setMessage('Please select a course first');
      return;
    }

    // Create a sample CSV template
    const headers = ['student_id', 'score', 'grade'];
    const sampleData = [
      ['STU001', '85', 'A'],
      ['STU002', '72', 'B+'],
      ['STU003', '91', 'A+']
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCourse.code}_scores_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading upload page...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Upload Student Scores</h1>
          <p>Upload score sheets for your assigned courses</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('successfully') ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
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
              <label htmlFor="upload-type">Upload Type</label>
              <select
                id="upload-type"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
              >
                <option value="exam">Exam Scores</option>
                <option value="ca">Continuous Assessment</option>
                <option value="final">Final Grades</option>
              </select>
            </div>
          </div>

          {selectedCourse && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={downloadTemplate}
                  style={{ fontSize: '14px' }}
                >
                  📥 Download Template
                </button>
              </div>

              <div className="file-upload" style={{ marginBottom: '20px' }}>
                <input
                  type="file"
                  id="file-input"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-input" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                  <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px' }}>
                    {file ? file.name : 'Click to select file'}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Supported formats: Excel (.xlsx, .xls) or CSV
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    Maximum file size: 10MB
                  </div>
                </label>
              </div>

              {file && (
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--background)', borderRadius: '4px' }}>
                  <h4>Selected File:</h4>
                  <p><strong>Name:</strong> {file.name}</p>
                  <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p><strong>Type:</strong> {file.type}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-success"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  style={{ flex: 1 }}
                >
                  {uploading ? 'Uploading...' : 'Upload Scores'}
                </button>
                {file && (
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setFile(null);
                      const fileInput = document.getElementById('file-input');
                      if (fileInput) fileInput.value = '';
                    }}
                    style={{ fontSize: '14px', padding: '10px 20px' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {!selectedCourse && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
              <h3>Please select a course</h3>
              <p>Choose a course from the dropdown above to upload scores</p>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Upload Instructions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h3>📋 File Format</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Use the template provided above</li>
                <li>Include columns: student_id, score, grade</li>
                <li>Score should be numeric (0-100)</li>
                <li>Grade should be letter grade (A, B+, etc.)</li>
              </ul>
            </div>
            <div>
              <h3>⚠️ Important Notes</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Files must be in Excel or CSV format</li>
                <li>Maximum file size is 10MB</li>
                <li>Student IDs must match enrolled students</li>
                <li>Existing scores will be overwritten</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadScores;
