import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const normalizeRole = (role) => (role || '').toString().trim().toLowerCase();

const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (normalizeRole(user.role) !== normalizeRole(role)) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;