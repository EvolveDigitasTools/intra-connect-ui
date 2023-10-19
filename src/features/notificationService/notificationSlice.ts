import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../interface';

const initialState: Notification[] = [];

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => [...state, action.payload],
    removeNotification: (state, action: PayloadAction<number>) => state.filter(notif => notif.id !== action.payload)
  }
});

export const { addNotification, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
