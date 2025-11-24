import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DocumentService } from '../../lib/services/documentService';
import { Document } from '../../types';

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  isLoading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async () => {
  const { data, error } = await DocumentService.getDocuments();
  if (error) throw error;
  return data || [];
});

export const fetchDocumentsByCase = createAsyncThunk('documents/fetchDocumentsByCase', async (caseId: string) => {
  const { data, error } = await DocumentService.getDocumentsByCase(caseId);
  if (error) throw error;
  return data || [];
});

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ caseId, fileUri, filename, uploadedBy }: { caseId: string; fileUri: string; filename: string; uploadedBy: string }) => {
    const { data, error } = await DocumentService.uploadDocument(caseId, fileUri, filename, uploadedBy);
    if (error) throw error;
    return data;
  }
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, updates }: { id: string; updates: Partial<Document> }) => {
    const { data, error } = await DocumentService.updateDocument(id, updates);
    if (error) throw error;
    return data;
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async ({ id, filePath }: { id: string; filePath: string }) => {
    const { error } = await DocumentService.deleteDocument(id, filePath);
    if (error) throw error;
    return id;
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDocuments: (state) => {
      state.documents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      .addCase(fetchDocumentsByCase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentsByCase.fulfilled, (state, action) => {
        state.documents = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchDocumentsByCase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        if (action.payload) {
          state.documents.unshift(action.payload);
        }
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.documents.findIndex((d) => d.id === action.payload!.id);
          if (index !== -1) {
            state.documents[index] = action.payload;
          }
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((d) => d.id !== action.payload);
      });
  },
});

export const { clearError, clearDocuments } = documentsSlice.actions;
export default documentsSlice.reducer;

