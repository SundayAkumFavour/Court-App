import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../../lib/services/authService';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  biometricEnabled: false,
  error: null,
};

// Async thunks
export const checkSession = createAsyncThunk('auth/checkSession', async () => {
  const session = await AuthService.getSession();
  if (session.data.session) {
    const user = await AuthService.getCurrentUser();
    const biometricEnabled = user
      ? await AuthService.isBiometricEnabled(user.id)
      : false;
    return { user, session: session.data.session, biometricEnabled };
  }
  return { user: null, session: null, biometricEnabled: false };
});

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const { user, error } = await AuthService.signIn(email, password);
    if (error) throw error;
    const biometricEnabled = user
      ? await AuthService.isBiometricEnabled(user.id)
      : false;
    return { user, biometricEnabled };
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await AuthService.signOut();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isAuthenticated = !!action.payload.user;
        state.biometricEnabled = action.payload.biometricEnabled;
        state.isLoading = false;
      })
      .addCase(checkSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
        state.biometricEnabled = action.payload.biometricEnabled;
        state.isLoading = false;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
        state.biometricEnabled = false;
      });
  },
});

export const { setUser, setBiometricEnabled, clearError } = authSlice.actions;
export default authSlice.reducer;

