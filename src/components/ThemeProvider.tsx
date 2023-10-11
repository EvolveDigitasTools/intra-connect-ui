import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

interface ThemeProviderProps {
    children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  React.useEffect(() => {
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const targetTheme = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme;

    document.body.classList.remove('light', 'dark');
    document.body.classList.add(targetTheme);
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
