import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { uploadDocument } from '../../store/slices/documentsSlice';
import { DocumentService } from '../../lib/services/documentService';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { useRoute, useNavigation } from '@react-navigation/native';

export const UploadDocumentScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { caseId } = route.params as { caseId: string };
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string } | null>(null);
  const [filename, setFilename] = useState('');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  const handlePickDocument = async () => {
    const { uri, name, error } = await DocumentService.pickDocument();
    if (error || !uri) return;
    setSelectedFile({ uri, name: name || 'document' });
    setFilename(name || 'document');
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    await dispatch(
      uploadDocument({
        caseId,
        fileUri: selectedFile.uri,
        filename: filename || selectedFile.name,
        uploadedBy: user.id,
      })
    );
    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Typography variant="h2" style={styles.title}>
            Upload Document
          </Typography>

          <Button
            mode="outlined"
            onPress={handlePickDocument}
            icon="file-document"
            style={styles.button}
          >
            {selectedFile ? 'Change File' : 'Select File'}
          </Button>

          {selectedFile && (
            <Typography variant="caption" style={{ marginTop: 8, color: theme.colors.textSecondary }}>
              Selected: {selectedFile.name}
            </Typography>
          )}

          <TextInput
            label="Filename"
            value={filename}
            onChangeText={setFilename}
            mode="outlined"
            style={styles.input}
            placeholder={selectedFile?.name}
          />

          <Button
            mode="contained"
            onPress={handleUpload}
            disabled={!selectedFile}
            style={styles.button}
          >
            Upload
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    marginTop: 16,
  },
  button: {
    marginTop: 8,
  },
});

