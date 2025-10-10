import { demoLeads, demoMessages, demoWithdrawals, isDemoMode } from '../utils/demoData';

// Mock API responses for demo mode
export const demoApi = {
  // Mock leads API
  getLeads: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: demoLeads,
          success: true
        });
      }, 500); // Simulate network delay
    });
  },

  createLead: (leadData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLead = {
          _id: `demo-lead-${Date.now()}`,
          ...leadData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: 'demo-user-1'
        };
        resolve({
          data: newLead,
          success: true,
          message: 'Lead created successfully'
        });
      }, 500);
    });
  },

  updateLead: (leadId, updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lead = demoLeads.find(l => l._id === leadId);
        if (lead) {
          const updatedLead = {
            ...lead,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          resolve({
            data: updatedLead,
            success: true,
            message: 'Lead updated successfully'
          });
        } else {
          resolve({
            data: null,
            success: false,
            message: 'Lead not found'
          });
        }
      }, 500);
    });
  },

  // Mock messages API
  getMessages: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: demoMessages,
          success: true
        });
      }, 300);
    });
  },

  sendMessage: (messageData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage = {
          _id: `demo-message-${Date.now()}`,
          ...messageData,
          timestamp: new Date().toISOString(),
          read: false
        };
        resolve({
          data: newMessage,
          success: true,
          message: 'Message sent successfully'
        });
      }, 300);
    });
  },

  // Mock withdrawals API
  getWithdrawals: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: demoWithdrawals,
          success: true
        });
      }, 400);
    });
  },

  createWithdrawal: (withdrawalData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newWithdrawal = {
          _id: `demo-withdrawal-${Date.now()}`,
          ...withdrawalData,
          status: 'pending',
          requestedAt: new Date().toISOString()
        };
        resolve({
          data: newWithdrawal,
          success: true,
          message: 'Withdrawal request submitted successfully'
        });
      }, 500);
    });
  },

  // Mock dashboard data
  getDashboardData: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            totalLeads: 15,
            successfulLeads: 8,
            pendingLeads: 4,
            rejectedLeads: 3,
            totalEarnings: 2500.00,
            walletBalance: 1250.50,
            recentLeads: demoLeads.slice(0, 3),
            recentMessages: demoMessages.slice(0, 2)
          },
          success: true
        });
      }, 400);
    });
  }
};

// Helper function to check if we should use demo API
export const shouldUseDemoApi = () => {
  return isDemoMode();
};

// Mock axios interceptor for demo mode
export const setupDemoInterceptors = (axios) => {
  // Request interceptor to handle demo API calls
  axios.interceptors.request.use(
    (config) => {
      if (shouldUseDemoApi()) {
        // Store original config for potential fallback
        config._isDemoRequest = true;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle demo API responses
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // If it's a demo request and the server is not available, handle gracefully
      if (error.config && error.config._isDemoRequest && shouldUseDemoApi()) {
        console.log('Demo mode: Server request failed, using mock data');
        // You could implement fallback logic here if needed
      }
      return Promise.reject(error);
    }
  );
};
