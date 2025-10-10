// Demo data for offline testing
export const demoUsers = {
  regular: {
    _id: 'demo-user-1',
    name: 'John Demo',
    email: 'demo@example.com',
    role: 'user',
    wallet: {
      balance: 1250.50,
      totalEarnings: 2500.00,
      pendingWithdrawals: 0
    },
    stats: {
      totalLeads: 15,
      successfulLeads: 8,
      pendingLeads: 4,
      rejectedLeads: 3
    },
    createdAt: new Date('2024-01-15').toISOString(),
    isDemo: true
  },
  employee: {
    _id: 'demo-employee-1',
    name: 'Sarah Employee',
    email: 'employee@example.com',
    role: 'employee',
    wallet: {
      balance: 850.25,
      totalEarnings: 1200.00,
      pendingWithdrawals: 150.00
    },
    stats: {
      totalLeads: 25,
      successfulLeads: 18,
      pendingLeads: 5,
      rejectedLeads: 2
    },
    createdAt: new Date('2024-02-01').toISOString(),
    isDemo: true
  },
  admin: {
    _id: 'demo-admin-1',
    name: 'Admin Demo',
    email: 'admin@example.com',
    role: 'admin',
    wallet: {
      balance: 5000.00,
      totalEarnings: 10000.00,
      pendingWithdrawals: 0
    },
    stats: {
      totalLeads: 100,
      successfulLeads: 75,
      pendingLeads: 15,
      rejectedLeads: 10
    },
    createdAt: new Date('2024-01-01').toISOString(),
    isDemo: true
  }
};

export const demoLeads = [
  {
    _id: 'demo-lead-1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1-555-0123',
    company: 'Acme Corporation',
    status: 'pending',
    value: 5000,
    source: 'Website',
    notes: 'Interested in enterprise package',
    createdAt: new Date('2024-03-15').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
    assignedTo: 'demo-user-1'
  },
  {
    _id: 'demo-lead-2',
    name: 'Tech Startup Inc',
    email: 'founder@techstartup.com',
    phone: '+1-555-0456',
    company: 'Tech Startup Inc',
    status: 'successful',
    value: 2500,
    source: 'Referral',
    notes: 'Converted to premium plan',
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-03-12').toISOString(),
    assignedTo: 'demo-user-1'
  },
  {
    _id: 'demo-lead-3',
    name: 'Global Solutions Ltd',
    email: 'sales@globalsolutions.com',
    phone: '+1-555-0789',
    company: 'Global Solutions Ltd',
    status: 'rejected',
    value: 10000,
    source: 'Cold Call',
    notes: 'Not interested in current offerings',
    createdAt: new Date('2024-03-08').toISOString(),
    updatedAt: new Date('2024-03-09').toISOString(),
    assignedTo: 'demo-user-1'
  }
];

export const demoMessages = [
  {
    _id: 'demo-message-1',
    sender: 'demo-user-1',
    receiver: 'demo-employee-1',
    message: 'Hi! I have a new lead that needs follow-up.',
    timestamp: new Date('2024-03-15T10:30:00').toISOString(),
    read: false
  },
  {
    _id: 'demo-message-2',
    sender: 'demo-employee-1',
    receiver: 'demo-user-1',
    message: 'Sure! I can help with that. What are the details?',
    timestamp: new Date('2024-03-15T10:35:00').toISOString(),
    read: true
  },
  {
    _id: 'demo-message-3',
    sender: 'demo-user-1',
    receiver: 'demo-employee-1',
    message: 'It\'s Acme Corporation, they\'re interested in our enterprise package.',
    timestamp: new Date('2024-03-15T10:40:00').toISOString(),
    read: false
  }
];

export const demoWithdrawals = [
  {
    _id: 'demo-withdrawal-1',
    userId: 'demo-user-1',
    amount: 500.00,
    status: 'pending',
    requestedAt: new Date('2024-03-14').toISOString(),
    method: 'bank_transfer',
    accountDetails: {
      bankName: 'Demo Bank',
      accountNumber: '****1234',
      routingNumber: '123456789'
    }
  },
  {
    _id: 'demo-withdrawal-2',
    userId: 'demo-user-1',
    amount: 250.00,
    status: 'completed',
    requestedAt: new Date('2024-03-01').toISOString(),
    completedAt: new Date('2024-03-03').toISOString(),
    method: 'paypal',
    accountDetails: {
      email: 'demo@example.com'
    }
  }
];

// Demo login function
export const demoLogin = (userType = 'regular') => {
  const user = demoUsers[userType];
  if (!user) {
    throw new Error('Invalid demo user type');
  }
  
  // Create a mock token for demo mode
  const demoToken = `demo-token-${userType}-${Date.now()}`;
  
  return {
    token: demoToken,
    ...user
  };
};

// Check if current session is demo mode
export const isDemoMode = () => {
  const token = localStorage.getItem('token');
  return token && token.startsWith('demo-token-');
};

// Get demo user type from token
export const getDemoUserType = () => {
  const token = localStorage.getItem('token');
  if (token && token.startsWith('demo-token-')) {
    const parts = token.split('-');
    return parts[2]; // regular, employee, or admin
  }
  return null;
};
