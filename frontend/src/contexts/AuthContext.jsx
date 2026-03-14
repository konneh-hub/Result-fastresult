import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user profile
      api.profile()
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.login({ username, password });
      const { token, user: loginUser } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Some backend responses may not include the user object; fall back to /profile
      const user = loginUser || (await api.profile()).data;

      setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const registerStudent = async (data) => {
    try {
      await api.registerStudent(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  const registerLecturer = async (data) => {
    try {
      await api.registerLecturer(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerStudent, registerLecturer, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;