import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for existing token and validate it on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/auth/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          handleRoleNavigation(data.user.role);
        } else {
          // If token is invalid, remove it
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Token validation error:', err);
        localStorage.removeItem('token');
      }
      
      setIsLoading(false);
    };

    validateToken();
  }, []);

  const handleRoleNavigation = (role) => {
    switch (role) {
      case 'student':
        navigate('/student');
        break;
      case 'professor':
        navigate('/professor');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/student');
    }
  };

  const login = async (email, password) => {
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem('token', data.token);
      setUser(data.user);
      handleRoleNavigation(data.user.role);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem('token', data.token);
      setUser(data.user);
      handleRoleNavigation(data.user.role);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const sendOtp = async (email) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      login,
      register,
      logout,
      sendOtp
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};