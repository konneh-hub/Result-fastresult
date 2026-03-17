import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState({ score: 0, label: '' });
  const [loginError, setLoginError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const normalizeRole = (role) => (role || '').toString().trim().toLowerCase();

  const roleToPath = (role) => {
    const normalized = normalizeRole(role);
    const map = {
      'university_admin': 'admin',
      'university ict admin': 'admin',
      'exam officer': 'exam-officer',
      'exam_officer': 'exam-officer',
      dean: 'dean',
      'head of department': 'hod',
      'head_of_department': 'hod',
      lecturer: 'lecturer',
      student: 'student',
    };
    return map[normalized] || normalized.replace(/\s+/g, '-').replace(/_/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const result = await login(username, password);
    if (result.success && result.user) {
      const rolePath = roleToPath(result.user.role);
      if (rolePath) {
        navigate(`/${rolePath}/dashboard`);
        return;
      }
    }
    if (result.success) {
      navigate('/');
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : 'Invalid username or password';
      setLoginError(errorMsg);
    }
  };

  const evaluatePassword = (pwd) => {
    let score = 0;
    if (!pwd) {
      setStrength({ score: 0, label: '' });
      return;
    }
    if (pwd.length >= 8) score += 2;
    else if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;

    let label = 'Very weak';
    if (score >= 5) label = 'Very strong';
    else if (score >= 4) label = 'Strong';
    else if (score >= 3) label = 'Medium';
    else if (score >= 2) label = 'Weak';

    setStrength({ score, label });
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit} className="auth-card card-form">
        <h1>Login</h1>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); evaluatePassword(e.target.value); }}
          required
          autoComplete="current-password"
        />

        <div className="password-strength" aria-hidden={strength.label === ''}>
          <div className="strength-bar" data-score={strength.score} />
          <div className="strength-text">{strength.label}</div>
        </div>

        {loginError && (
          <div className="error-message" style={{ color: '#d32f2f', marginBottom: '15px', fontSize: '14px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            {loginError}
          </div>
        )}

        <button type="submit">Login</button>

        <div className="form-divider" />
        <div className="login-meta">
          <Link to="/forgot-password" className="text-link">Forgot Password?</Link>

          <div className="alt-card">
            <p>Don't have an account?</p>
            <div className="alt-actions">
              <Link to="/register/student" className="btn-link">Register as Student</Link>
              <Link to="/register/lecturer" className="btn-link">Register as Lecturer</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;