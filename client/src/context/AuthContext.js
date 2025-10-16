import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { demoLogin, isDemoMode, getDemoUserType, demoUsers } from '../utils/demoData';

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        user: null,
        isAuthenticated: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Check if it's demo mode
        if (isDemoMode()) {
          const userType = getDemoUserType();
          const user = demoUsers[userType];
          if (user) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: user
            });
            // Redirect to dashboard if user is on homepage
            if (window.location.pathname === '/') {
              navigate('/dashboard');
            }
            return;
          }
        }
        
        // Regular authentication
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: response.data
          });
          // Redirect to dashboard if user is on homepage
          if (window.location.pathname === '/') {
            navigate('/dashboard');
          }
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData
      });
      
      toast.success('Login successful!');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    console.log('Registering user:', name, email, password);
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData
      });
      
      toast.success('Registration successful!');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
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
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData
      });
      
      toast.success(`Demo login successful! Welcome ${userData.name}`);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Demo login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      });
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
    demoLoginUser
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
