import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import './Lecturer.css';

const CourseMaterials = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null,
    material_type: 'lecture_notes'
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchMaterials();
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

  const fetchMaterials = async () => {
    if (!selectedCourse) return;

    try {
      const response = await api.get(`/courses/${selectedCourse.id}/materials/`);
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setMaterials([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setMessage('File size must be less than 50MB');
        return;
      }
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.title || !uploadForm.file) {
      setMessage('Please provide a title and select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);
      formData.append('material_type', uploadForm.material_type);
      formData.append('course', selectedCourse.id);
      formData.append('uploaded_by', user.id);

      await api.post('/materials/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Material uploaded successfully!');
      setUploadForm({
        title: '',
        description: '',
        file: null,
        material_type: 'lecture_notes'
      });
      setShowUploadForm(false);

      // Reset file input
      const fileInput = document.getElementById('material-file');
      if (fileInput) fileInput.value = '';

      // Refresh materials list
      fetchMaterials();

      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      console.error('Error uploading material:', err);
      setMessage('Error uploading material. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await api.delete(`/materials/${materialId}/`);
      setMessage('Material deleted successfully!');
      fetchMaterials();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting material:', err);
      setMessage('Error deleting material');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('doc') || fileType?.includes('word')) return '📝';
    if (fileType?.includes('ppt') || fileType?.includes('presentation')) return '📊';
    if (fileType?.includes('xls') || fileType?.includes('excel')) return '📈';
    if (fileType?.includes('zip') || fileType?.includes('rar')) return '📦';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('video')) return '🎥';
    return '📄';
  };

  const getMaterialTypeLabel = (type) => {
    const labels = {
      lecture_notes: 'Lecture Notes',
      assignments: 'Assignments',
      quizzes: 'Quizzes',
      presentations: 'Presentations',
      resources: 'Resources',
      other: 'Other'
    };
    return labels[type] || 'Other';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="loading">Loading course materials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Course Materials</h1>
          <p>Upload and manage course materials for your students</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('successfully') ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
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
                <button
                  className="btn btn-success"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  {showUploadForm ? 'Cancel Upload' : 'Upload Material'}
                </button>
              )}
            </div>
          </div>

          {showUploadForm && selectedCourse && (
            <div className="dashboard-section" style={{ marginBottom: '20px', border: '2px solid var(--primary)' }}>
              <h2>Upload New Material</h2>
              <form onSubmit={handleUpload}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                      type="text"
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="material-type">Material Type</label>
                    <select
                      id="material-type"
                      value={uploadForm.material_type}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, material_type: e.target.value }))}
                    >
                      <option value="lecture_notes">Lecture Notes</option>
                      <option value="assignments">Assignments</option>
                      <option value="quizzes">Quizzes</option>
                      <option value="presentations">Presentations</option>
                      <option value="resources">Resources</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      placeholder="Optional description..."
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="material-file">File *</label>
                    <input
                      type="file"
                      id="material-file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png,.mp4,.avi,.mov"
                      onChange={handleFileChange}
                      required
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>
                      Supported formats: PDF, Word, PowerPoint, Excel, ZIP, Images, Videos (Max 50MB)
                    </small>
                  </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Material'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {selectedCourse ? (
            materials.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
                <h3>No materials uploaded yet</h3>
                <p>Upload lecture notes, assignments, and other course materials for your students.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {materials.map(material => (
                  <div
                    key={material.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: 'var(--surface)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                      <div style={{ fontSize: '32px' }}>
                        {getFileIcon(material.file_type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 5px 0', color: 'var(--primary)' }}>
                          {material.title}
                        </h3>
                        <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {material.description || 'No description'}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span>Type: {getMaterialTypeLabel(material.material_type)}</span>
                          <span>Size: {material.file_size ? `${(material.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</span>
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Uploaded: {new Date(material.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button
                        className="btn"
                        style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                        onClick={() => window.open(material.file_url, '_blank')}
                      >
                        Download
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '8px' }}
                        onClick={() => deleteMaterial(material.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              Please select a course to manage materials.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseMaterials;
