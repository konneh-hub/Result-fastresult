import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';
import SessionSwitcher from './SessionSwitcher';
import QuickAddMenu from './QuickAddMenu';
import './Topbar.css';

const Topbar = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin/');
  const isDashboard = location.pathname === '/admin/dashboard';

  return (
    <div className="topbar">
      <div className="topbar-left">
        {isAdminPage && !isDashboard && (
          <Link to="/admin/dashboard" className="back-to-dashboard">
            ← Back to Dashboard
          </Link>
        )}
        <h2>University ICT Admin</h2>
      </div>
      <div className="topbar-center">
        <SearchBar />
      </div>
      <div className="topbar-right">
        <QuickAddMenu />
        <SessionSwitcher />
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default Topbar;