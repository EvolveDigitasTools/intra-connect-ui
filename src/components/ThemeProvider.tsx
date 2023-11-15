import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

interface ThemeProviderProps {
    children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  React.useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
