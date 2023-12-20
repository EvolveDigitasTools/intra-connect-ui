import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: { [key: string]: any } | null;
}

const initialState: AuthState = {
  isAuthenticated: (localStorage.getItem('token') && localStorage.getItem('token') != 'undefined') ? true : false,
  token: localStorage.getItem('token'),
  user: (localStorage.getItem('user') && localStorage.getItem('user') != 'undefined') ? JSON.parse(localStorage.getItem('user') || "") : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, null, {
        headers: {
          Authorization: `Bearer ${state.token}`
        }
      });
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    },
    // More actions...
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
