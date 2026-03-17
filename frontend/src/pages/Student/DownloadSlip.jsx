import React, { useState, useEffect } from 'react';

const DownloadSlip = () => {
  const [availableSlips, setAvailableSlips] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Mock available result slips
    setAvailableSlips([
      { id: '2024-spring', name: 'Spring 2024 Semester Results', date: '2024-06-15' },
      { id: '2023-fall', name: 'Fall 2023 Semester Results', date: '2024-01-15' },
      { id: '2023-summer', name: 'Summer 2023 Semester Results', date: '2023-08-15' }
    ]);
  }, []);

  const handleDownload = async () => {
    if (!selectedSlip) return;

    setDownloading(true);
    try {
      // Mock download process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, this would trigger a file download
      const slip = availableSlips.find(s => s.id === selectedSlip);
      alert(`Downloading ${slip.name}...`);

      // Simulate file download
      const element = document.createElement('a');
      const file = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      element.href = URL.createObjectURL(file);
      element.download = `result_slip_${selectedSlip}.pdf`;
      element.click();

    } catch (error) {
      console.error('Error downloading slip:', error);
      alert('Error downloading result slip. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="download-slip-page">
      <h1>Download Result Slip</h1>
      <p className="page-description">Download your official semester result slips in PDF format.</p>

      <div className="download-info">
        <div className="info-card">
          <h3>Result Slip Information</h3>
          <ul>
            <li><strong>Format:</strong> PDF</li>
            <li><strong>Validity:</strong> Official university document</li>
            <li><strong>Cost:</strong> Free for current students</li>
            <li><strong>Processing:</strong> Instant download</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Important Notes</h3>
          <ul>
            <li>Only published results are available for download</li>
            <li>Result slips include your GPA and course grades</li>
            <li>Keep downloaded files in a secure location</li>
            <li>Contact registrar for any discrepancies</li>
          </ul>
        </div>
      </div>

      <div className="download-section">
        <h3>Select Result Slip to Download</h3>

        {availableSlips.length === 0 ? (
          <div className="no-slips">
            <p>No result slips available for download</p>
          </div>
        ) : (
          <div className="slip-selection">
            <div className="form-group">
              <label htmlFor="slip-select">Available Result Slips</label>
              <select
                id="slip-select"
                value={selectedSlip}
                onChange={(e) => setSelectedSlip(e.target.value)}
              >
                <option value="">Select a result slip</option>
                {availableSlips.map(slip => (
                  <option key={slip.id} value={slip.id}>
                    {slip.name} - {new Date(slip.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="slip-preview">
              {selectedSlip && (
                <div className="preview-card">
                  <h4>Selected Result Slip</h4>
                  {(() => {
                    const slip = availableSlips.find(s => s.id === selectedSlip);
                    return slip ? (
                      <div className="slip-details">
                        <p><strong>Semester:</strong> {slip.name}</p>
                        <p><strong>Publication Date:</strong> {new Date(slip.date).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> Available for Download</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <div className="download-actions">
              <button
                className="btn-primary"
                onClick={handleDownload}
                disabled={!selectedSlip || downloading}
              >
                {downloading ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="recent-downloads">
        <h3>Recent Downloads</h3>
        <div className="downloads-list">
          <div className="download-item">
            <div className="download-info">
              <h4>Spring 2024 Results</h4>
              <p>Downloaded on {new Date().toLocaleDateString()}</p>
            </div>
            <button className="btn-outline">Download Again</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadSlip;
