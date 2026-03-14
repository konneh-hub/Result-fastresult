import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const normalizeRole = (role) => (role || '').toString().trim().toLowerCase();

  const roleToPath = (role) => {
    const normalized = normalizeRole(role);
    const map = {
      'university ict admin': 'admin',
      'exam officer': 'exam-officer',
      dean: 'dean',
      'head of department': 'hod',
      lecturer: 'lecturer',
      student: 'student',
    };
    return map[normalized] || normalized.replace(/\s+/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      alert('Login failed');
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <Link to="/forgot-password">Forgot Password?</Link>
      <Link to="/register/student">Register as Student</Link>
      <Link to="/register/lecturer">Register as Lecturer</Link>
    </div>
  );
};

export default Login;