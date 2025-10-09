// Validation rules
export const validationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return `Must be no more than ${max} characters long`;
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  },

  confirmPassword: (password) => (value) => {
    if (!value) return null;
    if (value !== password) {
      return 'Passwords do not match';
    }
    return null;
  },

  number: (value) => {
    if (!value) return null;
    if (isNaN(value) || value < 0) {
      return 'Must be a positive number';
    }
    return null;
  },

  minValue: (min) => (value) => {
    if (!value) return null;
    if (parseFloat(value) < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },

  maxValue: (max) => (value) => {
    if (!value) return null;
    if (parseFloat(value) > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  oneOf: (options) => (value) => {
    if (!value) return null;
    if (!options.includes(value)) {
      return `Must be one of: ${options.join(', ')}`;
    }
    return null;
  }
};

// Validate form data
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = data[field];
    
    for (const rule of fieldRules) {
      const error = rule(value, data);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation schemas
export const schemas = {
  login: {
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required]
  },

  register: {
    name: [validationRules.required, validationRules.minLength(2)],
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.password],
    confirmPassword: [validationRules.required, validationRules.confirmPassword]
  },

  lead: {
    category: [validationRules.required, validationRules.oneOf(['IT', 'Banking', 'Real Estate', 'Construction'])],
    companyName: [validationRules.required, validationRules.minLength(2)],
    contactPerson: [validationRules.required, validationRules.minLength(2)],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.required, validationRules.phone],
    description: [validationRules.required, validationRules.minLength(10), validationRules.maxLength(500)],
    value: [validationRules.required, validationRules.number, validationRules.minValue(1000)],
    currency: [validationRules.required, validationRules.oneOf(['USD', 'AED', 'EUR', 'SAR'])]
  },

  withdrawal: {
    amount: [validationRules.required, validationRules.number, validationRules.minValue(1)],
    currency: [validationRules.required, validationRules.oneOf(['USD', 'AED', 'EUR', 'SAR'])],
    accountHolderName: [validationRules.required, validationRules.minLength(2)],
    bankName: [validationRules.required, validationRules.minLength(2)],
    accountNumber: [validationRules.required, validationRules.minLength(8)],
    routingNumber: [validationRules.required, validationRules.minLength(6)]
  },

  message: {
    message: [validationRules.required, validationRules.minLength(1), validationRules.maxLength(1000)]
  }
};
