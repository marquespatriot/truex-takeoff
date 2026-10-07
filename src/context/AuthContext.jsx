import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:3001/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('truex_auth_token') || sessionStorage.getItem('truex_auth_token');
    const storedUser = localStorage.getItem('truex_auth_user') || sessionStorage.getItem('truex_auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        clearAuthStorage();
      }
    }
    setIsLoading(false);
  }, []);

  const clearAuthStorage = () => {
    localStorage.removeItem('truex_auth_token');
    localStorage.removeItem('truex_auth_user');
    sessionStorage.removeItem('truex_auth_token');
    sessionStorage.removeItem('truex_auth_user');
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      setUser(data.user);
      setToken(data.token);

      const storage = rememberMe ? localStorage : sessionStorage;
      clearAuthStorage();
      storage.setItem('truex_auth_token', data.token);
      storage.setItem('truex_auth_user', JSON.stringify(data.user));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    setToken(null);
    window.location.hash = '#/login';
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (err) {
      return { success: true, message: 'If an authorized account matches that email address, a secure password reset link has been dispatched.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        forgotPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
