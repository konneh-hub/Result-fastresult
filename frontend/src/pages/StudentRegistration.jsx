import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import api from '../services/api';

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    student_id: '',
    university_id: '',
    password: '',
    confirm_password: ''
  });
  const [universities, setUniversities] = useState([]);
  const [errors, setErrors] = useState({});
  const [registrationError, setRegistrationError] = useState('');
  const { registerStudent } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await api.get('/universities/');
        setUniversities(response.data);
      } catch (err) {
        console.error('Failed to load universities:', err);
      }
    };
    fetchUniversities();
  }, []);

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
    setRegistrationError('');
    // final validation
    const ok = validatePasswords(formData.password, formData.confirm_password);
    if (!ok) return;

    const payload = {
      student_id: formData.student_id,
      university_id: formData.university_id,
      password: formData.password
    };

    const result = await registerStudent(payload);
    if (result.success) {
      navigate('/login');
    } else {
      setRegistrationError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="registration">
      <form onSubmit={handleSubmit} className="auth-card card-form">
        <h1>Student Registration</h1>
        <p className="form-description">Enter your student ID and select your university to create an account.</p>
        {registrationError && <div className="error-message">{registrationError}</div>}
        <input name="student_id" placeholder="Student ID" onChange={handleChange} required />
        <select name="university_id" value={formData.university_id} onChange={handleChange} required>
          <option value="">Select University</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required autoComplete="new-password" minLength={8} />
        {errors.password && <div className="field-error">{errors.password}</div>}
        <input name="confirm_password" type="password" placeholder="Confirm Password" onChange={handleChange} required autoComplete="new-password" />
        {errors.confirm_password && <div className="field-error">{errors.confirm_password}</div>}
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