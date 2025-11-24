import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { uploadDocument } from '../../store/slices/documentsSlice';
import { DocumentService } from '../../lib/services/documentService';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'UploadDocumentScreen';

export const UploadDocumentScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { caseId } = route.params as { caseId: string };
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string } | null>(null);
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  const handlePickDocument = async () => {
    Logger.info(LOG_SOURCE, 'Picking document', { caseId });
    const { uri, name, error } = await DocumentService.pickDocument();
    if (error) {
      Logger.error(LOG_SOURCE, 'Error picking document', error);
      return;
    }
    if (!uri) {
      Logger.debug(LOG_SOURCE, 'Document picker canceled');
      return;
    }
    
    Logger.info(LOG_SOURCE, 'Document picked', { filename: name });
    setSelectedFile({ uri, name: name || 'document' });
    setFilename(name || 'document');
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    Logger.info(LOG_SOURCE, 'Uploading document', { caseId, filename: filename || selectedFile.name });
    setLoading(true);

    try {
      await dispatch(
        uploadDocument({
          caseId,
          fileUri: selectedFile.uri,
          filename: filename || selectedFile.name,
          uploadedBy: user.id,
        })
      );
      
      Logger.info(LOG_SOURCE, 'Document uploaded successfully', { caseId });
      navigation.goBack();
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Exception uploading document', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.form}>
        <Typography variant="h2" style={[styles.title, { color: theme.colors.text }]}>
          Upload Document
        </Typography>

        <TouchableOpacity
          onPress={handlePickDocument}
          style={[styles.fileButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <MaterialCommunityIcons
            name={selectedFile ? 'file-check' : 'file-document-outline'}
            size={32}
            color={selectedFile ? theme.colors.success : theme.colors.primary}
          />
          <Typography variant="body" style={{ marginTop: 12, color: theme.colors.text, fontWeight: '600' }}>
            {selectedFile ? 'Change File' : 'Select File'}
          </Typography>
          {selectedFile && (
            <Typography variant="caption" style={{ marginTop: 4, color: theme.colors.textSecondary }}>
              {selectedFile.name}
            </Typography>
          )}
        </TouchableOpacity>

        <TextInput
          label="Filename"
          value={filename}
          onChangeText={setFilename}
          mode="flat"
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          contentStyle={{ backgroundColor: theme.colors.surface }}
          underlineColor={theme.colors.border}
          activeUnderlineColor={theme.colors.primary}
          textColor={theme.colors.text}
          placeholder={selectedFile?.name}
        />

        <Button
          mode="contained"
          onPress={handleUpload}
          loading={loading}
          disabled={loading || !selectedFile}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={{ color: '#fff', fontWeight: '600' }}
        >
          Upload
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  form: {
    width: '100%',
  },
  title: {
    marginBottom: 32,
    fontWeight: '700',
  },
  fileButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  input: {
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    elevation: 0,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
