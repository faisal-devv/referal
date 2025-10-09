// API Endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Lead Categories
export const LEAD_CATEGORIES = [
  { value: 'IT', label: 'IT Services', color: 'bg-blue-100 text-blue-800' },
  { value: 'Banking', label: 'Banking & Finance', color: 'bg-green-100 text-green-800' },
  { value: 'Real Estate', label: 'Real Estate', color: 'bg-purple-100 text-purple-800' },
  { value: 'Construction', label: 'Construction', color: 'bg-orange-100 text-orange-800' }
];

// Lead Status
export const LEAD_STATUS = [
  { value: 'submitted', label: 'Submitted', color: 'bg-gray-100 text-gray-800' },
  { value: 'trying_to_contact', label: 'Trying to Contact', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'proposal_submitted', label: 'Proposal Submitted', color: 'bg-purple-100 text-purple-800' },
  { value: 'negotiating', label: 'Negotiating', color: 'bg-blue-100 text-blue-800' },
  { value: 'deal_closed', label: 'Deal Closed', color: 'bg-green-100 text-green-800' },
  { value: 'deal_lost', label: 'Deal Lost', color: 'bg-red-100 text-red-800' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' }
];

// Withdrawal Status
export const WITHDRAWAL_STATUS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'processed', label: 'Processed', color: 'bg-blue-100 text-blue-800' }
];

// Currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' }
];

// Commission Rates
export const COMMISSION_RATES = {
  IT: { min: 5, max: 10 },
  Banking: { min: 8, max: 15 },
  'Real Estate': { min: 10, max: 15 },
  Construction: { min: 5, max: 12 }
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
};

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  PHONE_MIN_LENGTH: 10,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 500
};
