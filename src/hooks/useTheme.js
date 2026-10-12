import { useState, useEffect, useMemo } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('VMC_THEME') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    try {
      localStorage.setItem('VMC_THEME', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = useMemo(() => {
    return () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme
  };
};
