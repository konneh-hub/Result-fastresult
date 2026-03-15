import React, { useState } from 'react';

const TranscriptRequest = () => {
  const [requestForm, setRequestForm] = useState({
    purpose: '',
    copies: 1,
    deliveryMethod: 'pickup',
    recipientName: '',
    recipientAddress: '',
    urgency: 'normal',
    additionalNotes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRequestForm({
      purpose: '',
      copies: 1,
      deliveryMethod: 'pickup',
      recipientName: '',
      recipientAddress: '',
      urgency: 'normal',
      additionalNotes: ''
    });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="transcript-request-page">
        <div className="success-message">
          <h1>Request Submitted Successfully!</h1>
          <p>Your transcript request has been submitted and is being processed.</p>
          <div className="request-details">
            <h3>Request Details</h3>
            <p><strong>Request ID:</strong> TR-{Date.now()}</p>
            <p><strong>Purpose:</strong> {requestForm.purpose}</p>
            <p><strong>Copies:</strong> {requestForm.copies}</p>
            <p><strong>Delivery:</strong> {requestForm.deliveryMethod}</p>
            <p><strong>Processing Time:</strong> 3-5 business days</p>
          </div>
          <button className="btn-primary" onClick={resetForm}>Submit Another Request</button>
        </div>
      </div>
    );
  }

  return (
    <div className="transcript-request-page">
      <h1>Official Transcript Request</h1>
      <p className="page-description">Request an official academic transcript for employment, further studies, or other purposes.</p>

      <div className="transcript-info">
        <div className="info-card">
          <h3>Transcript Information</h3>
          <ul>
            <li><strong>Processing Time:</strong> 3-5 business days</li>
            <li><strong>Cost:</strong> $5 per copy</li>
            <li><strong>Validity:</strong> Official transcripts are valid indefinitely</li>
            <li><strong>Format:</strong> PDF and sealed envelope options available</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Important Notes</h3>
          <ul>
            <li>All fees must be paid before processing</li>
            <li>Transcripts are sent directly to recipients</li>
            <li>Requests cannot be cancelled once processed</li>
            <li>Keep your request ID for tracking</li>
          </ul>
        </div>
      </div>

      <form className="transcript-request-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Request Details</h3>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Transcript *</label>
            <select
              id="purpose"
              name="purpose"
              value={requestForm.purpose}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Purpose</option>
              <option value="employment">Employment</option>
              <option value="further-studies">Further Studies</option>
              <option value="graduate-school">Graduate School Application</option>
              <option value="professional-certification">Professional Certification</option>
              <option value="immigration">Immigration/Visa</option>
              <option value="personal-records">Personal Records</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="copies">Number of Copies *</label>
            <input
              type="number"
              id="copies"
              name="copies"
              value={requestForm.copies}
              onChange={handleInputChange}
              min="1"
              max="10"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="urgency">Urgency Level</label>
            <select
              id="urgency"
              name="urgency"
              value={requestForm.urgency}
              onChange={handleInputChange}
            >
              <option value="normal">Normal (3-5 days)</option>
              <option value="rush">Rush (1-2 days) - Additional $10</option>
              <option value="express">Express (Same day) - Additional $25</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Delivery Information</h3>

          <div className="form-group">
            <label htmlFor="deliveryMethod">Delivery Method *</label>
            <select
              id="deliveryMethod"
              name="deliveryMethod"
              value={requestForm.deliveryMethod}
              onChange={handleInputChange}
              required
            >
              <option value="pickup">Pickup at Registrar's Office</option>
              <option value="mail">Mail to Address</option>
              <option value="email">Email (Digital Copy)</option>
            </select>
          </div>

          {(requestForm.deliveryMethod === 'mail') && (
            <>
              <div className="form-group">
                <label htmlFor="recipientName">Recipient Name *</label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={requestForm.recipientName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="recipientAddress">Recipient Address *</label>
                <textarea
                  id="recipientAddress"
                  name="recipientAddress"
                  value={requestForm.recipientAddress}
                  onChange={handleInputChange}
                  rows="3"
                  required
                ></textarea>
              </div>
            </>
          )}
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>

          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={requestForm.additionalNotes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any special instructions or additional information..."
            ></textarea>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <button type="button" className="btn-secondary" onClick={resetForm}>
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default TranscriptRequest;
