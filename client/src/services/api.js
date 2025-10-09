import axios from 'axios';

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
  getMe: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Leads API
export const leadsAPI = {
  getLeads: () => api.get('/leads'),
  getLead: (id) => api.get(`/leads/${id}`),
  createLead: (leadData) => api.post('/leads', leadData),
  updateLeadStatus: (id, statusData) => api.put(`/leads/${id}/status`, statusData),
  getAllLeads: () => api.get('/leads/admin/all')
};

// Wallet API
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  requestWithdrawal: (withdrawalData) => api.post('/wallet/withdraw', withdrawalData),
  getWithdrawals: () => api.get('/wallet/withdrawals'),
  getAllWithdrawals: () => api.get('/wallet/admin/withdrawals'),
  updateWithdrawalStatus: (id, statusData) => api.put(`/wallet/admin/withdrawals/${id}`, statusData),
  updateWalletBalance: (balanceData) => api.put('/wallet/admin/balance', balanceData)
};

// Chat API
export const chatAPI = {
  sendMessage: (messageData) => api.post('/chat/send', messageData),
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (userId) => api.get(`/chat/messages/${userId}`),
  getUsers: () => api.get('/chat/admin/users')
};

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUserStatus: (id, statusData) => api.put(`/users/${id}/status`, statusData),
  updateUserRole: (id, roleData) => api.put(`/users/${id}/role`, roleData)
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
