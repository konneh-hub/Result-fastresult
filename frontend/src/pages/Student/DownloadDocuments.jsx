import React, { useState } from 'react';

const DownloadDocuments = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [downloading, setDownloading] = useState(null);

  const documentCategories = {
    academic: [
      { id: 'transcript', name: 'Academic Transcript', description: 'Complete academic record', format: 'PDF' },
      { id: 'certificate', name: 'Course Certificates', description: 'Individual course completion certificates', format: 'PDF' },
      { id: 'gradeslip', name: 'Grade Report', description: 'Detailed grade breakdown', format: 'PDF' }
    ],
    administrative: [
      { id: 'enrollment', name: 'Enrollment Letter', description: 'Proof of enrollment', format: 'PDF' },
      { id: 'clearance', name: 'Clearance Form', description: 'Academic clearance certificate', format: 'PDF' },
      { id: 'id-card', name: 'Student ID Template', description: 'ID card replacement form', format: 'PDF' }
    ],
    financial: [
      { id: 'fee-structure', name: 'Fee Structure', description: 'Current fee information', format: 'PDF' },
      { id: 'payment-receipt', name: 'Payment Receipts', description: 'Fee payment confirmations', format: 'PDF' },
      { id: 'scholarship', name: 'Scholarship Information', description: 'Available scholarships', format: 'PDF' }
    ],
    other: [
      { id: 'calendar', name: 'Academic Calendar', description: 'Important dates and deadlines', format: 'PDF' },
      { id: 'handbook', name: 'Student Handbook', description: 'University policies and procedures', format: 'PDF' },
      { id: 'forms', name: 'Application Forms', description: 'Various application forms', format: 'ZIP' }
    ]
  };

  const handleDownload = async (documentId, documentName) => {
    setDownloading(documentId);
    try {
      // Mock download process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate file download
      const element = document.createElement('a');
      const file = new Blob([`Mock content for ${documentName}`], { type: 'application/pdf' });
      element.href = URL.createObjectURL(file);
      element.download = `${documentId}.pdf`;
      element.click();

      alert(`${documentName} downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const getFilteredDocuments = () => {
    if (selectedCategory === 'all') {
      return Object.entries(documentCategories).flatMap(([category, docs]) =>
        docs.map(doc => ({ ...doc, category }))
      );
    }
    return documentCategories[selectedCategory]?.map(doc => ({ ...doc, category: selectedCategory })) || [];
  };

  return (
    <div className="download-documents-page">
      <h1>Download Documents</h1>
      <p className="page-description">Access and download your academic documents, certificates, and university resources.</p>

      <div className="download-info">
        <div className="info-card">
          <h3>Document Access</h3>
          <ul>
            <li><strong>Availability:</strong> 24/7 access to documents</li>
            <li><strong>Formats:</strong> PDF, ZIP archives</li>
            <li><strong>Cost:</strong> Free for official documents</li>
            <li><strong>Updates:</strong> Documents are regularly updated</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Security & Privacy</h3>
          <ul>
            <li>All downloads are logged for security</li>
            <li>Official documents include digital signatures</li>
            <li>Personal information is protected</li>
            <li>Contact registrar for sensitive documents</li>
          </ul>
        </div>
      </div>

      <div className="document-filters">
        <h3>Filter Documents</h3>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Documents
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'academic' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('academic')}
          >
            Academic
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'administrative' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('administrative')}
          >
            Administrative
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'financial' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('financial')}
          >
            Financial
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'other' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('other')}
          >
            Other
          </button>
        </div>
      </div>

      <div className="documents-grid">
        {getFilteredDocuments().map(document => (
          <div key={document.id} className="document-card">
            <div className="document-header">
              <h4>{document.name}</h4>
              <span className="document-category">{document.category}</span>
            </div>
            <div className="document-description">
              <p>{document.description}</p>
            </div>
            <div className="document-meta">
              <span className="format">Format: {document.format}</span>
            </div>
            <div className="document-actions">
              <button
                className="btn-primary"
                onClick={() => handleDownload(document.id, document.name)}
                disabled={downloading === document.id}
              >
                {downloading === document.id ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="download-history">
        <h3>Recent Downloads</h3>
        <div className="history-list">
          <div className="history-item">
            <div className="history-info">
              <h4>Academic Transcript</h4>
              <p>Downloaded on {new Date().toLocaleDateString()}</p>
            </div>
            <button className="btn-outline">Download Again</button>
          </div>
          <div className="history-item">
            <div className="history-info">
              <h4>Student Handbook</h4>
              <p>Downloaded on {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
            </div>
            <button className="btn-outline">Download Again</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadDocuments;
