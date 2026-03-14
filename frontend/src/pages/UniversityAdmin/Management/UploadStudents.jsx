import React, { useState, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const UploadStudents = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResult(null);
      setErrors([]);
    } else {
      alert('Please select a valid CSV file.');
      e.target.value = null;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setUploading(true);
    setUploadResult(null);
    setErrors([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/management/students/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data.errors || [error.response.data.message || 'Upload failed']);
      } else {
        setErrors(['An unexpected error occurred during upload.']);
      }
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `first_name,last_name,email,matric_number,program_id,level
John,Doe,john.doe@university.edu,2024001,1,100
Jane,Smith,jane.smith@university.edu,2024002,1,100`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Bulk Upload Students</h1>
        </div>

        <div className="upload-section">
          <div className="upload-info">
            <h3>Upload Instructions</h3>
            <p>Upload a CSV file containing student information. The file must include the following columns:</p>
            <ul>
              <li><strong>first_name:</strong> Student's first name</li>
              <li><strong>last_name:</strong> Student's last name</li>
              <li><strong>email:</strong> Student's email address</li>
              <li><strong>matric_number:</strong> Unique matriculation number</li>
              <li><strong>program_id:</strong> ID of the program the student is enrolled in</li>
              <li><strong>level:</strong> Academic level (100, 200, 300, 400, etc.)</li>
            </ul>
            <button className="btn-secondary" onClick={downloadTemplate}>
              Download Template
            </button>
          </div>

          <div className="upload-form">
            <div className="form-group">
              <label>Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Students'}
            </button>
          </div>

          {uploadResult && (
            <div className="upload-result success">
              <h3>Upload Successful</h3>
              <p>Successfully uploaded {uploadResult.successful_uploads} students.</p>
              {uploadResult.duplicates > 0 && (
                <p>Skipped {uploadResult.duplicates} duplicate entries.</p>
              )}
            </div>
          )}

          {errors.length > 0 && (
            <div className="upload-result error">
              <h3>Upload Failed</h3>
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadStudents;
