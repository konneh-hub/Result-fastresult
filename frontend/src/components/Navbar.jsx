import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

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

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const rolePath = user?.role ? roleToPath(user.role) : '';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">SRMS</Link>
      </div>
      <ul className="navbar-nav">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/universities">Universities</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        {user ? (
          <>
            {rolePath && <li><Link to={`/${rolePath}/dashboard`}>Dashboard</Link></li>}
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;