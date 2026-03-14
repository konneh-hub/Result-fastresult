import React, { useState, useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const UploadLecturers = () => {
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
      const response = await api.post('/management/lecturers/upload/', formData, {
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
    const csvContent = `first_name,last_name,email,staff_id,department_id,rank
Dr. John,Doe,john.doe@university.edu,LEC001,1,Professor
Jane,Smith,jane.smith@university.edu,LEC002,1,Senior Lecturer`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecturer_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Bulk Upload Lecturers</h1>
        </div>

        <div className="upload-section">
          <div className="upload-info">
            <h3>Upload Instructions</h3>
            <p>Upload a CSV file containing lecturer information. The file must include the following columns:</p>
            <ul>
              <li><strong>first_name:</strong> Lecturer's first name</li>
              <li><strong>last_name:</strong> Lecturer's last name</li>
              <li><strong>email:</strong> Lecturer's email address</li>
              <li><strong>staff_id:</strong> Unique staff ID</li>
              <li><strong>department_id:</strong> ID of the department the lecturer belongs to</li>
              <li><strong>rank:</strong> Academic rank (Professor, Associate Professor, Senior Lecturer, Lecturer, etc.)</li>
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
              {uploading ? 'Uploading...' : 'Upload Lecturers'}
            </button>
          </div>

          {uploadResult && (
            <div className="upload-result success">
              <h3>Upload Successful</h3>
              <p>Successfully uploaded {uploadResult.successful_uploads} lecturers.</p>
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

export default UploadLecturers;
