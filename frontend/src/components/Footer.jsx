import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer footer-pro">
      <div className="footer-inner">
        <div className="footer-section footer-left">
          <p className="site-note">FastResult — a lightweight student result management website for universities and colleges.</p>
        </div>

        <div className="footer-section footer-right">
          <h4>Contact</h4>
          <p>Email: support@fastresult.example</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p className="copyright">&copy; 2026 Student Result Management System.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;