import React, { useState } from 'react';

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      question: 'How do I register for courses?',
      answer: 'Course registration is done through the Course Registration section. Select your desired courses and submit for approval.'
    },
    {
      question: 'How can I check my grades?',
      answer: 'Your grades are available in the Results section. You can view semester results and calculate your GPA.'
    },
    {
      question: 'What should I do if I forget my password?',
      answer: 'Use the "Forgot Password" link on the login page to reset your password. You will receive instructions via email.'
    },
    {
      question: 'How do I request a transcript?',
      answer: 'Go to the Transcript Request section, fill out the form with your requirements, and submit. Processing takes 3-5 days.'
    },
    {
      question: 'Can I change my course registration after the deadline?',
      answer: 'Late changes require approval from your department head. Contact your academic advisor for assistance.'
    }
  ];

  const guides = [
    { title: 'Getting Started Guide', description: 'Learn the basics of using the student portal' },
    { title: 'Course Registration Tutorial', description: 'Step-by-step guide to registering for courses' },
    { title: 'Grade Calculation Guide', description: 'Understanding GPA and CGPA calculations' },
    { title: 'Document Download Guide', description: 'How to download transcripts and certificates' }
  ];

  const contacts = [
    { name: 'Academic Advisor', email: 'advisor@university.edu', phone: '+1-234-567-8901' },
    { name: 'IT Support', email: 'it@university.edu', phone: '+1-234-567-8902' },
    { name: 'Registrar Office', email: 'registrar@university.edu', phone: '+1-234-567-8903' },
    { name: 'Financial Aid', email: 'finaid@university.edu', phone: '+1-234-567-8904' }
  ];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSupportForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitSupport = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Support request submitted successfully! You will receive a response within 24 hours.');
      setSupportForm({
        subject: '',
        category: '',
        message: '',
        priority: 'normal'
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="help-support-page">
      <h1>Help & Support</h1>
      <p className="page-description">Find answers to common questions, access guides, and get support when you need it.</p>

      <div className="help-tabs">
        <button
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          FAQ
        </button>
        <button
          className={`tab-btn ${activeTab === 'guides' ? 'active' : ''}`}
          onClick={() => setActiveTab('guides')}
        >
          Guides
        </button>
        <button
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Support
        </button>
        <button
          className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          Submit Request
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'faq' && (
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h4>{faq.question}</h4>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'guides' && (
          <div className="guides-section">
            <h3>User Guides & Tutorials</h3>
            <div className="guides-grid">
              {guides.map((guide, index) => (
                <div key={index} className="guide-card">
                  <h4>{guide.title}</h4>
                  <p>{guide.description}</p>
                  <button className="btn-outline">View Guide</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="contact-section">
            <h3>Contact Information</h3>
            <div className="contact-grid">
              {contacts.map((contact, index) => (
                <div key={index} className="contact-card">
                  <h4>{contact.name}</h4>
                  <p><strong>Email:</strong> {contact.email}</p>
                  <p><strong>Phone:</strong> {contact.phone}</p>
                  <button className="btn-outline">Send Email</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'request' && (
          <div className="support-request-section">
            <h3>Submit Support Request</h3>
            <form className="support-form" onSubmit={handleSubmitSupport}>
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={supportForm.subject}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={supportForm.category}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="academic">Academic Question</option>
                  <option value="registration">Course Registration</option>
                  <option value="grades">Grades & Results</option>
                  <option value="account">Account & Profile</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={supportForm.priority}
                  onChange={handleFormChange}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={supportForm.message}
                  onChange={handleFormChange}
                  rows="6"
                  placeholder="Describe your issue or question in detail..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="quick-help">
        <h3>Quick Help</h3>
        <div className="quick-help-grid">
          <div className="help-item">
            <h4>📚 Academic Resources</h4>
            <p>Access study materials, syllabi, and academic calendars</p>
          </div>
          <div className="help-item">
            <h4>💰 Financial Aid</h4>
            <p>Information about scholarships, grants, and payment options</p>
          </div>
          <div className="help-item">
            <h4>🏠 Housing</h4>
            <p>On-campus housing applications and information</p>
          </div>
          <div className="help-item">
            <h4>🎓 Career Services</h4>
            <p>Resume help, job search assistance, and career counseling</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
