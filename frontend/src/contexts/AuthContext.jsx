import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setLoading(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await api.get('/auth/profile/');
          setUser(response.data);
        } catch {
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { token, user: loginUser } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Some backend responses may not include the user object; fall back to /profile
      const user = loginUser || (await api.get('/auth/profile/')).data;

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
      await api.post('/auth/register/student/', data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  const registerLecturer = async (data) => {
    try {
      await api.post('/auth/register/lecturer/', data);
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