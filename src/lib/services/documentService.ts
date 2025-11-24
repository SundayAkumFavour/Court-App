import { supabase } from '../supabase';
import { Document } from '../../types';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'DocumentService';

export class DocumentService {
  // Get documents for a case
  static async getDocumentsByCase(caseId: string): Promise<{ data: Document[] | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Fetching documents for case', { caseId });
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) {
        Logger.error(LOG_SOURCE, 'Error fetching documents', { error: error.message, caseId });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Documents fetched successfully', { caseId, count: data?.length || 0 });
      return { data: data as Document[], error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception fetching documents', error);
      return { data: null, error: error as Error };
    }
  }

  // Get all documents (role-based filtering handled by RLS)
  static async getDocuments(): Promise<{ data: Document[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Document[], error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Get document by ID
  static async getDocumentById(id: string): Promise<{ data: Document | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Logger.error(LOG_SOURCE, 'Error fetching document', { error: error.message, documentId: id });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Document fetched successfully', { documentId: id, filename: data?.filename });
      return { data: data as Document, error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception fetching document', error);
      return { data: null, error: error as Error };
    }
  }

  // Upload document
  static async uploadDocument(
    caseId: string,
    fileUri: string,
    filename: string,
    uploadedBy: string
  ): Promise<{ data: Document | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Uploading document', { caseId, filename, uploadedBy });
    try {
      // Read file
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // Get file extension and determine content type
      const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
      const contentType = this.getContentType(fileExtension);

      // Upload to Supabase Storage
      const filePath = `${caseId}/${Date.now()}_${filename}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, this.base64ToArrayBuffer(fileContent), {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        Logger.error(LOG_SOURCE, 'Error uploading to storage', { error: uploadError.message, caseId, filename });
        throw uploadError;
      }

      Logger.debug(LOG_SOURCE, 'File uploaded to storage', { filePath, caseId });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          case_id: caseId,
          filename,
          file_path: filePath,
          file_type: contentType,
          file_size: fileInfo.size,
          uploaded_by: uploadedBy,
        })
        .select()
        .single();

      if (error) {
        Logger.error(LOG_SOURCE, 'Error creating document record', { error: error.message, caseId, filename });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Document uploaded successfully', { documentId: data.id, caseId, filename });
      return { data: data as Document, error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception uploading document', error);
      return { data: null, error: error as Error };
    }
  }

  // Pick document from device
  static async pickDocument(): Promise<{ uri: string | null; name: string | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Picking document from device');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.*', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        Logger.debug(LOG_SOURCE, 'Document picker canceled');
        return { uri: null, name: null, error: null };
      }

      Logger.info(LOG_SOURCE, 'Document picked successfully', { filename: result.assets[0].name });
      return {
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        error: null,
      };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception picking document', error);
      return { uri: null, name: null, error: error as Error };
    }
  }

  // Update document
  static async updateDocument(
    id: string,
    updates: Partial<Pick<Document, 'filename'>>
  ): Promise<{ data: Document | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Updating document', { documentId: id, updates });
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        Logger.error(LOG_SOURCE, 'Error updating document', { error: error.message, documentId: id });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Document updated successfully', { documentId: id });
      return { data: data as Document, error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception updating document', error);
      return { data: null, error: error as Error };
    }
  }

  // Delete document
  static async deleteDocument(id: string, filePath: string): Promise<{ error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Deleting document', { documentId: id, filePath });
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        Logger.error(LOG_SOURCE, 'Error deleting from storage', { error: storageError.message, filePath });
        throw storageError;
      }

      Logger.debug(LOG_SOURCE, 'File deleted from storage', { filePath });

      // Delete record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        Logger.error(LOG_SOURCE, 'Error deleting document record', { error: error.message, documentId: id });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Document deleted successfully', { documentId: id });
      return { error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception deleting document', error);
      return { error: error as Error };
    }
  }

  // Get document download URL
  static getDocumentUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  // Helper: Get content type from extension
  private static getContentType(extension: string): string {
    const types: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
    };
    return types[extension] || 'application/octet-stream';
  }

  // Helper: Convert base64 to ArrayBuffer
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

