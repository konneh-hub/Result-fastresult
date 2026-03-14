import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
      axios.get('/api/auth/profile/')
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
      const response = await axios.post('/api/auth/login/', { username, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response.data };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const registerStudent = async (data) => {
    try {
      await axios.post('/api/auth/register/student/', data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response.data };
    }
  };

  const registerLecturer = async (data) => {
    try {
      await axios.post('/api/auth/register/lecturer/', data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response.data };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerStudent, registerLecturer, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;