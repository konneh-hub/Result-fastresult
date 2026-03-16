import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    university: '',
    faculty: '',
    department: '',
    program: ''
  });
  const [errors, setErrors] = useState({});
  const { registerStudent } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // live-validate password fields
    if (name === 'password' || name === 'confirm_password') {
      validatePasswords(name === 'password' ? value : formData.password, name === 'confirm_password' ? value : formData.confirm_password);
    }
  };

  const validatePasswords = (password, confirm) => {
    const e = {};
    // basic strength rules
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(password)) e.password = 'Include at least one uppercase letter.';
    else if (!/[a-z]/.test(password)) e.password = 'Include at least one lowercase letter.';
    else if (!/[0-9]/.test(password)) e.password = 'Include at least one number.';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) e.password = 'Include at least one special character.';

    if (confirm !== undefined && password !== confirm) e.confirm_password = 'Passwords do not match.';
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // final validation
    const ok = validatePasswords(formData.password, formData.confirm_password);
    if (!ok) return;

    const payload = { ...formData };
    delete payload.confirm_password;

    const result = await registerStudent(payload);
    if (result.success) {
      navigate('/login');
    } else {
      alert(result.message || 'Registration failed');
    }
  };

  return (
    <div className="registration">
      <form onSubmit={handleSubmit} className="auth-card card-form">
        <h1>Student Registration</h1>
        <input name="student_id" placeholder="Student ID" onChange={handleChange} required />
        <input name="first_name" placeholder="First Name" onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required autoComplete="email" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required autoComplete="new-password" minLength={8} />
        {errors.password && <div className="field-error">{errors.password}</div>}
        <input name="confirm_password" type="password" placeholder="Confirm Password" onChange={handleChange} required autoComplete="new-password" />
        {errors.confirm_password && <div className="field-error">{errors.confirm_password}</div>}
        <input name="university" placeholder="University" onChange={handleChange} required />
        <input name="faculty" placeholder="Faculty" onChange={handleChange} required />
        <input name="department" placeholder="Department" onChange={handleChange} required />
        <input name="program" placeholder="Program" onChange={handleChange} required />
        <button type="submit" disabled={!!errors.password || !!errors.confirm_password}>Register</button>
        <div className="form-divider" />
        <div className="registration-meta">
          <div className="alt-card">
            <p>Already have an account?</p>
            <div className="alt-actions">
              <Link to="/login" className="btn-link">Login</Link>
              <Link to="/register/lecturer" className="btn-link">Register as Lecturer</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistration;