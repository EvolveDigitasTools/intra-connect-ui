import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  theme: 'light' | 'dark';
}
const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialState: ThemeState = {
  theme: localStorage.getItem('themeMode') || 'dark',//TODO improve colours of light theme
} as ThemeState;

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('themeMode', action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
