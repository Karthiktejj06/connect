import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const { getToken } = useClerkAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded) {
        if (clerkUser) {
          const token = await getToken();
          const userData = {
            _id: clerkUser.id,
            username: clerkUser.username || `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || clerkUser.emailAddresses[0].emailAddress.split('@')[0],
            email: clerkUser.emailAddresses[0].emailAddress,
            token: token
          };
          setUser(userData);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
          localStorage.removeItem('user');
        }
        setLoading(false);
      }
    };
    syncUser();
  }, [clerkUser, isLoaded, getToken]);

  const login = () => openSignIn();
  const register = () => openSignUp();
  const logout = () => signOut();

  const updateProfile = async (username) => {
    // With Clerk, you update profile via Clerk UI or specific Clerk hooks/API
    // We can redirect them to Clerk profile or use clerkUser.update()
    try {
      if (clerkUser) {
        await clerkUser.update({ username });
        return { success: true, username };
      }
      return { success: false, message: 'No user logged in' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const changePassword = () => {
    // Redirect to Clerk profile settings
    window.location.href = 'https://accounts.clerk.com/user';
  };

  const deleteAccount = () => {
    // Redirect to Clerk profile settings or handle via API
    window.location.href = 'https://accounts.clerk.com/user';
  };

  const loginWithGoogle = () => {
    // Clerk handles Google login via its own UI
    openSignIn({ initialValues: { strategy: 'oauth_google' } });
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
