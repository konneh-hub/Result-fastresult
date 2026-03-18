import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';
import SessionSwitcher from './SessionSwitcher';
import QuickAddMenu from './QuickAddMenu';
import './Topbar.css';

const Topbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const roleSegment = pathSegments[0] || '';
  const roleDashboardPath = `/${roleSegment}/dashboard`;
  const isRoleDashboard = location.pathname === roleDashboardPath;
  const isRolePage = ['admin', 'exam-officer', 'dean', 'hod', 'lecturer', 'student'].includes(roleSegment);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get display name for the admin
  const getAdminDisplayName = () => {
    if (user) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || user.username || 'Administrator';
    }
    return 'Administrator';
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        {isRolePage && !isRoleDashboard && (
          <Link to={roleDashboardPath} className="back-to-dashboard">
            ← Back to Dashboard
          </Link>
        )}
        <h2>{getAdminDisplayName()}</h2>
      </div>
      <div className="topbar-center">
        <SearchBar />
      </div>
      <div className="topbar-right">
        <button className="hamburger" onClick={toggleMobileMenu}>
          ☰
        </button>
        <div className={`topbar-items ${isMobileMenuOpen ? 'open' : ''}`}>
          <QuickAddMenu />
          <SessionSwitcher />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
};

export default Topbar;