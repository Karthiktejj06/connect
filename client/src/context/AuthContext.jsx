import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (username) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = storedUser?.token;
      
      const { data } = await axios.put(`${API_URL}/auth/profile`, 
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: data }));
      return { success: true, username: data.username };
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = storedUser?.token;
      
      const { data } = await axios.put(`${API_URL}/auth/profile/password`, 
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      return { success: true };
    } catch (error) {
      console.error('Password update error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Password update failed' };
    }
  };

  const deleteAccount = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = storedUser?.token;
      
      await axios.delete(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logout();
      return { success: true };
    } catch (error) {
      console.error('Account deletion error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Deletion failed' };
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/google`, { idToken });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Google login failed' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
