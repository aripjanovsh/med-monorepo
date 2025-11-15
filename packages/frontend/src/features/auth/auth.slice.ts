import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "@/features/auth";
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "@/lib/auth.utils";

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

// Initialize with token from cookies if available
const storedToken = getStoredToken();
const initialState: AuthState = {
  token: storedToken,
  isAuthenticated: !!storedToken,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      setStoredToken(action.payload);
    },
    clearAuth: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      removeStoredToken();
    },
  },
  extraReducers: (builder) => {
    // Handle login success
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        setStoredToken(action.payload.access_token);
      },
    );

    // Handle logout or auth errors
    builder.addMatcher(
      authApi.endpoints.getMe.matchRejected,
      (state, action) => {
        if (action.payload?.status === 401) {
          state.token = null;
          state.isAuthenticated = false;
          removeStoredToken();
        }
      },
    );
  },
});

export const { setToken, clearAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;
