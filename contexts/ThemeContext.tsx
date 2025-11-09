
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { colors, darkColors } from '@/styles/commonStyles';
import { saveDarkMode, getDarkMode } from '@/utils/storage';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof colors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await getDarkMode();
    setIsDark(savedTheme);
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await saveDarkMode(newTheme);
  };

  const currentColors = isDark ? darkColors : colors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: currentColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};
