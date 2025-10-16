import axios from 'axios';
import { demoApi, shouldUseDemoApi, setupDemoInterceptors } from './demoApi';

// Create axios instance
const baseURL = process.env.REACT_APP_API_URL || '/api';
console.log('API Base URL:', baseURL);
console.log('REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Setup demo interceptors
setupDemoInterceptors(api);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => shouldUseDemoApi() ? Promise.resolve({ data: JSON.parse(localStorage.getItem('demoUser') || '{}') }) : api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Leads API
export const leadsAPI = {
  getLeads: () => shouldUseDemoApi() ? demoApi.getLeads() : api.get('/leads'),
  getLead: (id) => shouldUseDemoApi() ? Promise.resolve({ data: demoApi.getLeads().data.find(l => l._id === id) }) : api.get(`/leads/${id}`),
  createLead: (leadData) => shouldUseDemoApi() ? demoApi.createLead(leadData) : api.post('/leads', leadData),
  updateLeadStatus: (id, statusData) => shouldUseDemoApi() ? demoApi.updateLead(id, statusData) : api.put(`/leads/${id}/status`, statusData),
  getAllLeads: () => shouldUseDemoApi() ? demoApi.getLeads() : api.get('/leads/admin/all')
};

// Wallet API
export const walletAPI = {
  getWallet: () => shouldUseDemoApi() ? Promise.resolve({ data: { balance: 1250.50, totalEarnings: 2500.00, pendingWithdrawals: 0 } }) : api.get('/wallet'),
  requestWithdrawal: (withdrawalData) => shouldUseDemoApi() ? demoApi.createWithdrawal(withdrawalData) : api.post('/wallet/withdraw', withdrawalData),
  getWithdrawals: () => shouldUseDemoApi() ? demoApi.getWithdrawals() : api.get('/wallet/withdrawals'),
  getAllWithdrawals: () => shouldUseDemoApi() ? demoApi.getWithdrawals() : api.get('/wallet/admin/withdrawals'),
  updateWithdrawalStatus: (id, statusData) => shouldUseDemoApi() ? Promise.resolve({ data: { success: true, message: 'Demo mode - status update simulated' } }) : api.put(`/wallet/admin/withdrawals/${id}`, statusData),
  updateWalletBalance: (balanceData) => shouldUseDemoApi() ? Promise.resolve({ data: { success: true, message: 'Demo mode - balance update simulated' } }) : api.put('/wallet/admin/balance', balanceData)
};

// Chat API
export const chatAPI = {
  sendMessage: (messageData) => shouldUseDemoApi() ? demoApi.sendMessage(messageData) : api.post('/chat/send', messageData),
  getConversations: () => shouldUseDemoApi() ? Promise.resolve({ data: [] }) : api.get('/chat/conversations'),
  getMessages: (userId) => shouldUseDemoApi() ? demoApi.getMessages() : api.get(`/chat/messages/${userId}`),
  getUsers: () => shouldUseDemoApi() ? Promise.resolve({ data: [] }) : api.get('/chat/admin/users')
};

// Users API
export const usersAPI = {
  getUsers: () => shouldUseDemoApi() ? Promise.resolve({ data: [] }) : api.get('/users'),
  getUser: (id) => shouldUseDemoApi() ? Promise.resolve({ data: null }) : api.get(`/users/${id}`),
  updateUserStatus: (id, statusData) => shouldUseDemoApi() ? Promise.resolve({ data: { success: true, message: 'Demo mode - status update simulated' } }) : api.put(`/users/${id}/status`, statusData),
  updateUserRole: (id, roleData) => shouldUseDemoApi() ? Promise.resolve({ data: { success: true, message: 'Demo mode - role update simulated' } }) : api.put(`/users/${id}/role`, roleData)
};

// Queries API
export const queriesAPI = {
  createQuery: (data) => api.post('/queries', data),
  getQueries: () => api.get('/admin/queries'),
  getQuery: (id) => api.get(`/admin/queries/${id}`),
  updateStatus: (id, statusData) => api.put(`/admin/queries/${id}/status`, statusData)
};

// File upload API
export const uploadAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(percentCompleted);
      }
    });
  }
};

// Health check API
export const healthAPI = {
  check: () => api.get('/health')
};

export default api;
