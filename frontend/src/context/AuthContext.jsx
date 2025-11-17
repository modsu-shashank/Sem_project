import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Password validation function
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  const API_BASE_URL =
    import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, '') ||
    'http://localhost:5000/api';

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("rgo_user");
      const savedToken = localStorage.getItem("rgo_token");
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      }
    } catch (error) {
      console.error("Error loading user data from localStorage:", error);
      localStorage.removeItem("rgo_user");
      localStorage.removeItem("rgo_token");
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.data.user);
      setToken(data.data.token);
      
      try {
        localStorage.setItem("rgo_user", JSON.stringify(data.data.user));
        localStorage.setItem("rgo_token", data.data.token);
      } catch (error) {
        console.error("Error saving user to localStorage:", error);
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.data.user);
      setToken(data.data.token);
      
      try {
        localStorage.setItem("rgo_user", JSON.stringify(data.data.user));
        localStorage.setItem("rgo_token", data.data.token);
      } catch (error) {
        console.error("Error saving user to localStorage:", error);
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("rgo_user");
    localStorage.removeItem("rgo_token");
  };

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    getAuthHeaders,
    isAuthenticated: !!user && !!token,
    userRole: user?.role || null,
    switchToAdminMode: () => {}, // Placeholder for now
    switchToUserMode: () => {}, // Placeholder for now
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
