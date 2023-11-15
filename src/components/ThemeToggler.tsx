import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { setTheme } from '../features/theme/themeSlice';
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';
import { Tooltip } from 'flowbite-react';
const ThemeToggler: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);

  const themeOption = {
    'light': {
      'icon': <SunIcon onClick={() => toggleTheme()} className='h-6 w-6 mx-6 text-light-text dark:text-dark-text' />,
      'text': 'Light Mode'
    },
    'dark': {
      'icon': <MoonIcon onClick={() => toggleTheme()} className='h-6 w-6 mx-6 text-light-text dark:text-dark-text' />,
      'text': 'Dark Mode'
    }
  }

  const toggleTheme = () => {
    let newTheme: "light" | "dark" = 'dark';
    if (theme === 'light')
      newTheme = 'dark';
    else if (theme === 'dark')
      newTheme = 'light';
    dispatch(setTheme(newTheme));
  };

  return (
    <Tooltip content={themeOption[theme].text}>
      {themeOption[theme].icon}
    </Tooltip>
  );
};

export default ThemeToggler;
