import React, { useState } from 'react';
import api from '../services/api';

const IconFacebook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.06 5.66 21.11 10.44 21.93v-6.96H7.9v-2.9h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.77-1.61 1.56v1.88h2.74l-.44 2.9h-2.3V21.9C18.34 21.11 22 17.06 22 12.07z" fill="currentColor"/>
  </svg>
);

const IconWhatsApp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.52 3.48A11.88 11.88 0 0 0 12 0C5.37 0 .08 5.29.08 11.92a11.8 11.8 0 0 0 1.99 6.46L0 24l5.78-2.98a11.92 11.92 0 0 0 6.22 1.64c6.63 0 11.92-5.29 11.92-11.92 0-3.18-1.24-6.16-3.4-8.26zM12 21.5a9.1 9.1 0 0 1-4.93-1.48l-.35-.22-3.43 1.77 1.02-3.33-.23-.35A9.1 9.1 0 1 1 12 21.5zm5.02-7.04c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.62.14-.19.27-.72.88-.88 1.06-.16.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.33-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.31.4-.47.13-.16.17-.27.27-.45.09-.18.04-.34-.02-.47-.06-.12-.62-1.5-.85-2.06-.22-.54-.45-.47-.62-.48-.16-.01-.35-.01-.53-.01-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.28 0 1.34.98 2.64 1.12 2.82.14.18 1.95 3 4.73 4.21 3.28 1.42 3.28 0 3.86-.01.59-.01 1.98-.81 2.26-1.59.28-.78.28-1.45.2-1.59-.09-.14-.27-.22-.55-.36z" fill="currentColor"/>
  </svg>
);

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
  </svg>
);

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      // Attempt to post to API; fallback to console if endpoint missing
      if (api && api.post) {
        await api.post('/contact/', form);
      } else {
        // eslint-disable-next-line no-console
        console.log('Contact submit (no API):', form);
      }
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="contact contact-page">
      <h1>Contact Us</h1>
      <p>If you have questions or need support, fill the form below.</p>

      <div className="contact-grid">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
          </div>

          <div className="form-field">
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          </div>

          <div className="form-field">
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
          </div>

          <div className="form-field">
            <input id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" />
          </div>

          <div className="form-field">
            <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={6} placeholder="Message" required />
          </div>

          <div className="contact-actions">
            <button type="submit" className="btn btn-primary">{status === 'sending' ? 'Sending…' : 'Send Message'}</button>
            {status === 'sent' && <span className="contact-status success">Message sent — we will reply soon.</span>}
            {status === 'error' && <span className="contact-status error">Failed to send — try again later.</span>}
          </div>
        </form>

        <aside className="contact-info">
          <div className="social-box">
            <h3 className="social-title">Media & Contacts</h3>
            <div className="social-row">
              <a href="https://facebook.com/" target="_blank" rel="noreferrer" className="social-btn facebook"><IconFacebook /><span>Facebook</span></a>
              <a href="https://wa.me/15551234567" target="_blank" rel="noreferrer" className="social-btn whatsapp"><IconWhatsApp /><span>WhatsApp</span></a>
              <a href="mailto:media@srms.com" className="social-btn mail"><IconMail /><span>Email</span></a>
            </div>
          </div>

          <div className="media-contact">
            <h3>Press Office</h3>
            <p>press@srms.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Contact;