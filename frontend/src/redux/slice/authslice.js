import { createSlice } from '@reduxjs/toolkit';
import { decodedToken } from '../../utils/storageHandler';

const token = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!token,
    token: token || null,
    user: decodedToken() || null, // { id, name, role, etc. }
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      sessionStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem("salesRepShiftStart");
      sessionStorage.removeItem("salesRepShiftEnd");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
