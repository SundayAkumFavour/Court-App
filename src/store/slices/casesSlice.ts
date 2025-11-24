import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CaseService } from '../../lib/services/caseService';
import { Case, CaseAssignment } from '../../types';

interface CasesState {
  cases: Case[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CasesState = {
  cases: [],
  isLoading: false,
  error: null,
};

export const fetchCases = createAsyncThunk('cases/fetchCases', async () => {
  const { data, error } = await CaseService.getCases();
  if (error) throw error;
  return data || [];
});

export const createCase = createAsyncThunk(
  'cases/createCase',
  async ({ caseNumber, title, description, createdBy }: { caseNumber: string; title: string; description?: string; createdBy: string }) => {
    const { data, error } = await CaseService.createCase(caseNumber, title, description, createdBy);
    if (error) throw error;
    return data;
  }
);

export const updateCase = createAsyncThunk(
  'cases/updateCase',
  async ({ id, updates }: { id: string; updates: Partial<Case> }) => {
    const { data, error } = await CaseService.updateCase(id, updates);
    if (error) throw error;
    return data;
  }
);

export const deleteCase = createAsyncThunk('cases/deleteCase', async (id: string) => {
  const { error } = await CaseService.deleteCase(id);
  if (error) throw error;
  return id;
});

export const assignCase = createAsyncThunk(
  'cases/assignCase',
  async ({ caseId, userId, assignedBy }: { caseId: string; userId: string; assignedBy: string }) => {
    const { data, error } = await CaseService.assignCase(caseId, userId, assignedBy);
    if (error) throw error;
    return data;
  }
);

export const unassignCase = createAsyncThunk(
  'cases/unassignCase',
  async ({ caseId, userId }: { caseId: string; userId: string }) => {
    const { error } = await CaseService.unassignCase(caseId, userId);
    if (error) throw error;
    return { caseId, userId };
  }
);

export const searchCases = createAsyncThunk('cases/searchCases', async (query: string) => {
  const { data, error } = await CaseService.searchCases(query);
  if (error) throw error;
  return data || [];
});

const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCases.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.cases = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch cases';
      })
      .addCase(createCase.fulfilled, (state, action) => {
        if (action.payload) {
          state.cases.unshift(action.payload);
        }
      })
      .addCase(updateCase.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.cases.findIndex((c) => c.id === action.payload!.id);
          if (index !== -1) {
            state.cases[index] = action.payload;
          }
        }
      })
      .addCase(deleteCase.fulfilled, (state, action) => {
        state.cases = state.cases.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearError } = casesSlice.actions;
export default casesSlice.reducer;

