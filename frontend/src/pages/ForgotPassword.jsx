import React, { useState } from 'react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement forgot password functionality
    alert('Password reset functionality is not yet implemented. Please contact your administrator.');
  };

  return (
    <div className="forgot-password">
      <div className="forgot-layout">
        <div className="forgot-card">
          <h1>Forgot Password</h1>
          <p className="subtitle">Enter your account email and we'll send a password reset link.</p>

          <form onSubmit={handleSubmit} className="card-form">
            <label className="label">Email address</label>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="btn-primary">Send Reset Email</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;