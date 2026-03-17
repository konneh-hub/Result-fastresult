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
      const errorData = error.response?.data;
      let errorMessage = 'Login failed';
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const registerStudent = async (data) => {
    try {
      const response = await api.post('/auth/register/student/', data);
      return { success: true, message: response.data?.message || 'Account created successfully' };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMsg, message: errorMsg };
    }
  };

  const registerLecturer = async (data) => {
    try {
      const response = await api.post('/auth/register/lecturer/', data);
      return { success: true, message: response.data?.message || 'Account created successfully' };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMsg, message: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerStudent, registerLecturer, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;