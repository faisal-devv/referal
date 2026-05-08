import React, { createContext, useContext } from 'react';

const AppThemeContext = createContext({ isDark: true, toggle: () => {} });

export const useAppTheme = () => useContext(AppThemeContext);

export const AppThemeProvider = ({ children, isDark, toggle }) => (
  <AppThemeContext.Provider value={{ isDark, toggle }}>
    {children}
  </AppThemeContext.Provider>
);
