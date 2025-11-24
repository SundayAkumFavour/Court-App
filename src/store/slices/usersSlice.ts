import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserService } from '../../lib/services/userService';
import { User } from '../../types';

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const { data, error } = await UserService.getUsers();
  if (error) throw error;
  return data || [];
});

export const createUser = createAsyncThunk(
  'users/createUser',
  async ({ userId, email, role, createdBy }: { userId: string; email: string; role: string; createdBy: string }) => {
    const { data, error } = await UserService.createUser(userId, email, role as any, createdBy);
    if (error) throw error;
    return data;
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, updates }: { id: string; updates: Partial<User> }) => {
    const { data, error } = await UserService.updateUser(id, updates);
    if (error) throw error;
    return data;
  }
);

export const deleteUser = createAsyncThunk('users/deleteUser', async (id: string) => {
  const { error } = await UserService.deleteUser(id);
  if (error) throw error;
  return id;
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.users.unshift(action.payload);
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.users.findIndex((u) => u.id === action.payload!.id);
          if (index !== -1) {
            state.users[index] = action.payload;
          }
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;

