import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Check for saved theme preference
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) {
      return savedMode;
    }
    
    // Check browser preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme-mode', mode);
    
    // Apply theme to document
    const htmlElement = document.documentElement;
    if (mode === 'dark') {
      htmlElement.setAttribute('data-bs-theme', 'dark');
    } else {
      htmlElement.setAttribute('data-bs-theme', 'light');
    }
  }, [mode]);

  // Apply theme on initial load
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (mode === 'dark') {
      htmlElement.setAttribute('data-bs-theme', 'dark');
    } else {
      htmlElement.setAttribute('data-bs-theme', 'light');
    }
  }, []);

  // Listen for browser theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedMode = localStorage.getItem('theme-mode');
      if (!savedMode) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const theme = {
    mode,
    isDark: mode === 'dark',
    colors: {
      primary: mode === 'light' ? '#0d6efd' : '#0d6efd',
      secondary: mode === 'light' ? '#6c757d' : '#6c757d',
      success: mode === 'light' ? '#198754' : '#198754',
      danger: mode === 'light' ? '#dc3545' : '#dc3545',
      warning: mode === 'light' ? '#ffc107' : '#ffc107',
      info: mode === 'light' ? '#0dcaf0' : '#0dcaf0',
      light: mode === 'light' ? '#f8f9fa' : '#212529',
      dark: mode === 'light' ? '#212529' : '#f8f9fa',
      background: mode === 'light' ? '#ffffff' : '#212529',
      surface: mode === 'light' ? '#f8f9fa' : '#343a40',
      text: mode === 'light' ? '#212529' : '#f8f9fa',
      textSecondary: mode === 'light' ? '#6c757d' : '#adb5bd',
    },
    gradients: {
      primary: mode === 'light' 
        ? 'linear-gradient(135deg, #0d6efd, #0b5ed7)'
        : 'linear-gradient(135deg, #0d6efd, #0b5ed7)',
      background: mode === 'light'
        ? 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
        : 'linear-gradient(135deg, #212529, #343a40)',
      card: mode === 'light'
        ? 'linear-gradient(135deg, #ffffff, #f8f9fa)'
        : 'linear-gradient(135deg, #343a40, #495057)',
    }
  };

  const value = {
    mode,
    toggleTheme,
    theme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}; 