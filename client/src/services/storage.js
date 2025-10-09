// Local storage utilities
export const storage = {
  // Set item
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  // Get item
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  // Remove item
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // Clear all
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Check if key exists
  has: (key) => {
    return localStorage.getItem(key) !== null;
  },

  // Get all keys
  keys: () => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }
};

// Session storage utilities
export const sessionStorage = {
  // Set item
  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
      return false;
    }
  },

  // Get item
  get: (key, defaultValue = null) => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue;
    }
  },

  // Remove item
  remove: (key) => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
      return false;
    }
  },

  // Clear all
  clear: () => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  }
};

// Token management
export const tokenStorage = {
  set: (token) => storage.set('token', token),
  get: () => storage.get('token'),
  remove: () => storage.remove('token'),
  has: () => storage.has('token')
};

// User data management
export const userStorage = {
  set: (user) => storage.set('user', user),
  get: () => storage.get('user'),
  remove: () => storage.remove('user'),
  has: () => storage.has('user')
};

// Settings management
export const settingsStorage = {
  set: (settings) => storage.set('settings', settings),
  get: () => storage.get('settings', {}),
  update: (updates) => {
    const current = settingsStorage.get();
    return settingsStorage.set({ ...current, ...updates });
  },
  remove: () => storage.remove('settings')
};

// Theme management
export const themeStorage = {
  set: (theme) => storage.set('theme', theme),
  get: () => storage.get('theme', 'light'),
  remove: () => storage.remove('theme')
};

// Language management
export const languageStorage = {
  set: (language) => storage.set('language', language),
  get: () => storage.get('language', 'en'),
  remove: () => storage.remove('language')
};

// Cache management
export const cacheStorage = {
  set: (key, data, ttl = 3600000) => { // Default 1 hour TTL
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    return storage.set(`cache_${key}`, item);
  },

  get: (key) => {
    const item = storage.get(`cache_${key}`);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      storage.remove(`cache_${key}`);
      return null;
    }

    return item.data;
  },

  remove: (key) => storage.remove(`cache_${key}`),
  clear: () => {
    const keys = storage.keys();
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        storage.remove(key);
      }
    });
  }
};

// Form data management
export const formStorage = {
  set: (formId, data) => storage.set(`form_${formId}`, data),
  get: (formId) => storage.get(`form_${formId}`),
  remove: (formId) => storage.remove(`form_${formId}`),
  clear: () => {
    const keys = storage.keys();
    keys.forEach(key => {
      if (key.startsWith('form_')) {
        storage.remove(key);
      }
    });
  }
};

// Recent searches
export const searchStorage = {
  add: (query) => {
    const searches = storage.get('recent_searches', []);
    const filtered = searches.filter(s => s !== query);
    const updated = [query, ...filtered].slice(0, 10); // Keep last 10
    return storage.set('recent_searches', updated);
  },
  get: () => storage.get('recent_searches', []),
  clear: () => storage.remove('recent_searches')
};

// Favorites
export const favoritesStorage = {
  add: (item) => {
    const favorites = storage.get('favorites', []);
    if (!favorites.find(f => f.id === item.id)) {
      favorites.push(item);
      return storage.set('favorites', favorites);
    }
    return true;
  },
  remove: (id) => {
    const favorites = storage.get('favorites', []);
    const filtered = favorites.filter(f => f.id !== id);
    return storage.set('favorites', filtered);
  },
  get: () => storage.get('favorites', []),
  has: (id) => {
    const favorites = storage.get('favorites', []);
    return favorites.some(f => f.id === id);
  },
  clear: () => storage.remove('favorites')
};
