import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authslice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // you can add more slices here
  },
});
