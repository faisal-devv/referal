import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { demoLogin, isDemoMode, getDemoUserType, demoUsers } from '../utils/demoData';

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// ── JWT helpers ───────────────────────────────────────────────────────────────

const decodeTokenPayload = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) return true;
  // Give a 30-second buffer so we don't expire tokens that are about to expire
  return payload.exp * 1000 < Date.now() + 30_000;
};

// ── Friendly error messages ───────────────────────────────────────────────────

export const friendlyError = (error) => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
    return 'Unable to connect. Please check your internet connection.';
  }

  const status = error.response?.status;
  const raw = (
    error.response?.data?.message ||
    error.response?.data?.errors?.[0]?.msg ||
    ''
  ).toLowerCase();

  if (status === 429) return 'Too many attempts. Please wait a few minutes and try again.';
  if (status === 500) return 'Something went wrong on our end. Please try again shortly.';
  if (status === 403) return error.response?.data?.message || 'You don\'t have permission to do that.';
  if (status === 404) return 'The requested resource was not found.';

  if (raw.includes('jwt expired') || raw.includes('token expired'))
    return 'Your session has expired. Please sign in again.';
  if (raw.includes('invalid signature') || raw.includes('jsonwebtokenerror') || raw.includes('invalid token'))
    return 'Your session is invalid. Please sign in again.';
  if (raw.includes('invalid email or password') || raw.includes('incorrect password'))
    return 'Incorrect email or password. Please try again.';
  if (raw.includes('user already exists') || raw.includes('email already'))
    return 'An account with this email already exists.';
  if (raw.includes('registrations are currently disabled') || (raw.includes('registration') && raw.includes('disabled')))
    return 'Registrations are currently closed. Please contact support.';
  if (raw.includes('current password is incorrect'))
    return 'The current password you entered is incorrect.';
  if (raw.includes('failed to send reset email'))
    return 'Failed to send reset email. Please try again later.';
  if (raw.includes('invalid or expired reset'))
    return 'This reset link is invalid or has expired. Please request a new one.';
  if (raw.includes('network error'))
    return 'A network error occurred. Please check your connection.';

  // Fall back to the server message if it looks user-friendly, else generic
  const serverMsg = error.response?.data?.message;
  if (serverMsg && serverMsg.length < 120) return serverMsg;
  return 'Something went wrong. Please try again.';
};

// ── Reducer ───────────────────────────────────────────────────────────────────

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, isAuthenticated: true, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, user: null, isAuthenticated: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const sessionToastShown = useRef(false);

  // Core logout — clears everything without a toast (used internally)
  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Session-expired logout — shows a friendly toast once
  const expireSession = useCallback(() => {
    clearSession();
    if (!sessionToastShown.current) {
      sessionToastShown.current = true;
      toast.error('Your session has expired. Please sign in again.', {
        duration: 5000,
        icon: '🔒',
      });
      // Reset the flag after a moment so future sessions can show it again
      setTimeout(() => { sessionToastShown.current = false; }, 10_000);
    }
  }, [clearSession]);

  // Set axios auth header on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check auth on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'LOGOUT' });
        return;
      }

      // Demo mode shortcut
      if (isDemoMode()) {
        const userType = getDemoUserType();
        const user = demoUsers[userType];
        if (user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          return;
        }
      }

      // Check expiry before hitting the network
      if (isTokenExpired(token)) {
        clearSession();
        dispatch({ type: 'LOGOUT' });
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_BASE_URL}/auth/me`);
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      } catch (error) {
        clearSession();
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, [clearSession]);

  // Periodic token-expiry check every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        expireSession();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [expireSession]);

  // Listen for 401s fired by the api.js interceptor
  useEffect(() => {
    const handle = () => {
      // Only trigger if user is currently authenticated (avoid noise on public API calls)
      if (localStorage.getItem('token')) {
        expireSession();
      }
    };
    window.addEventListener('auth:session-expired', handle);
    return () => window.removeEventListener('auth:session-expired', handle);
  }, [expireSession]);

  // ── Auth actions ────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const message = friendlyError(error);
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
      dispatch({ type: 'LOGOUT' });
      toast.success('Account created! Please sign in.');
      return { success: true };
    } catch (error) {
      const message = friendlyError(error);
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    clearSession();
    toast.success('Signed out successfully.');
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const demoLoginUser = (userType = 'regular') => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { token, ...userData } = demoLogin(userType);

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      toast.success(`Demo login successful! Welcome ${userData.name}`);
      return { success: true };
    } catch (error) {
      const message = error.message || 'Demo login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    demoLoginUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
