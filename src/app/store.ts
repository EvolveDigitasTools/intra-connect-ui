import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';
import authReducer from '../features/auth/authSlice';
import notificationReducer from '../features/notificationService/notificationSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    notification: notificationReducer
    // add other reducers here
  },
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export default store;
