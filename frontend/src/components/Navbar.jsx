import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'About', to: '/about' },
    { name: 'Universities', to: '/universities' },
    { name: 'Contact', to: '/contact' },
  ];

  const toggleDropdown = (name) => {
    setActiveDropdown((cur) => (cur === name ? null : name));
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-brand">
        <Link to="/">SRMS</Link>
      </div>
      <div className="nav-right">
        {/* Desktop nav */}
        <ul className="navbar-nav desktop-nav">
          {navLinks.map((link) => (
            <li key={link.name} className="nav-item" onMouseLeave={() => setActiveDropdown(null)}>
              <div className="nav-link-wrap">
                <Link to={link.to} className="nav-link">{link.name}</Link>
              </div>
            </li>
          ))}

          {user ? (
            <>
              {rolePath && <li className="nav-item"><Link to={`/${rolePath}/dashboard`} className="nav-link">Dashboard</Link></li>}
              <li className="nav-item"><button className="nav-button" onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <li className="nav-item"><Link to="/login" className="nav-link">Login</Link></li>
          )}
        </ul>

        <ThemeSwitcher />

        {/* Mobile toggle */}
        <button
          className={`nav-toggle ${menuOpen ? 'open' : ''}`}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <>
                <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile backdrop */}
      <div className={`mobile-backdrop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Mobile panel */}
      <div className={`mobile-panel ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-panel-inner">
          <div className="mobile-header">
            <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-logo">SRMS</Link>
            <button onClick={() => setMenuOpen(false)} className="close-mobile" aria-label="Close menu">✕</button>
          </div>

          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <div key={link.name} className="mobile-item">
                <Link to={link.to} onClick={() => setMenuOpen(false)} className="mobile-link">{link.name}</Link>
              </div>
            ))}

            <div className="mobile-item">
              {user ? (
                <>
                  {rolePath && <Link to={`/${rolePath}/dashboard`} onClick={() => setMenuOpen(false)} className="mobile-link">Dashboard</Link>}
                  <button className="mobile-link" onClick={() => { setMenuOpen(false); handleLogout(); }}>Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="mobile-link">Login</Link>
              )}
            </div>

            {/* mobile CTA removed per design */}
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;