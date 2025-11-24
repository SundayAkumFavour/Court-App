import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../../lib/services/authService';
import { User } from '../../types';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'AuthSlice';

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
  Logger.info(LOG_SOURCE, 'Checking session on app start');
  const session = await AuthService.getSession();
  if (session.data.session) {
    Logger.debug(LOG_SOURCE, 'Session found, fetching user data');
    const user = await AuthService.getCurrentUser();
    const biometricEnabled = user
      ? await AuthService.isBiometricEnabled(user.id)
      : false;
    
    Logger.info(LOG_SOURCE, 'Session check complete', {
      hasUser: !!user,
      userId: user?.id,
      role: user?.role,
      biometricEnabled,
    });
    
    return { user, session: session.data.session, biometricEnabled };
  }
  
  Logger.info(LOG_SOURCE, 'No active session found');
  return { user: null, session: null, biometricEnabled: false };
});

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    Logger.info(LOG_SOURCE, 'Redux: Sign in action dispatched', { email });
    const { user, error } = await AuthService.signIn(email, password);
    if (error) {
      Logger.error(LOG_SOURCE, 'Redux: Sign in failed', { email, error: error.message });
      throw error;
    }
    
    const biometricEnabled = user
      ? await AuthService.isBiometricEnabled(user.id)
      : false;
    
    Logger.info(LOG_SOURCE, 'Redux: Sign in successful', {
      userId: user?.id,
      email: user?.email,
      role: user?.role,
      biometricEnabled,
    });
    
    return { user, biometricEnabled };
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  Logger.info(LOG_SOURCE, 'Redux: Sign out action dispatched');
  await AuthService.signOut();
  Logger.info(LOG_SOURCE, 'Redux: Sign out completed');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      Logger.debug(LOG_SOURCE, 'Redux: setUser reducer called', {
        userId: action.payload?.id,
        role: action.payload?.role,
      });
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      Logger.debug(LOG_SOURCE, 'Redux: setBiometricEnabled reducer called', {
        enabled: action.payload,
      });
      state.biometricEnabled = action.payload;
    },
    clearError: (state) => {
      Logger.debug(LOG_SOURCE, 'Redux: clearError reducer called');
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
      .addCase(checkSession.rejected, (state, action) => {
        Logger.error(LOG_SOURCE, 'Redux: checkSession rejected', action.error);
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      .addCase(signIn.pending, (state) => {
        Logger.debug(LOG_SOURCE, 'Redux: signIn pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        Logger.info(LOG_SOURCE, 'Redux: signIn fulfilled', {
          userId: action.payload.user?.id,
        });
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
        state.biometricEnabled = action.payload.biometricEnabled;
        state.isLoading = false;
      })
      .addCase(signIn.rejected, (state, action) => {
        Logger.error(LOG_SOURCE, 'Redux: signIn rejected', {
          error: action.error.message,
        });
        state.isLoading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      .addCase(signOut.fulfilled, (state) => {
        Logger.info(LOG_SOURCE, 'Redux: signOut fulfilled');
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
        state.biometricEnabled = false;
      });
  },
});

export const { setUser, setBiometricEnabled, clearError } = authSlice.actions;
export default authSlice.reducer;

