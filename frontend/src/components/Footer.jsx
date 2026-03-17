import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer footer-pro">
      <div className="footer-inner">
        <div className="footer-section footer-left">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/universities">Universities</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section footer-center">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/register/student">Register (Student)</Link></li>
            <li><Link to="/register/lecturer">Register (Lecturer)</Link></li>
            <li><Link to="/forgot-password">Forgot Password</Link></li>
          </ul>
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