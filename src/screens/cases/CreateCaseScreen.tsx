import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createCase } from '../../store/slices/casesSlice';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { useNavigation } from '@react-navigation/native';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'CreateCaseScreen';

export const CreateCaseScreen: React.FC = () => {
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const navigation = useNavigation();

  const handleCreate = async () => {
    if (!caseNumber || !title || !user) return;

    Logger.info(LOG_SOURCE, 'Creating new case', { caseNumber, title });
    setLoading(true);

    try {
      await dispatch(createCase({ caseNumber, title, description, createdBy: user.id }));
      Logger.info(LOG_SOURCE, 'Case created successfully', { caseNumber });
      navigation.goBack();
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Exception creating case', error);
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
          Create New Case
        </Typography>

        <TextInput
          label="Case Number *"
          value={caseNumber}
          onChangeText={setCaseNumber}
          mode="flat"
          autoCapitalize="characters"
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          contentStyle={{ backgroundColor: theme.colors.surface }}
          underlineColor={theme.colors.border}
          activeUnderlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />

        <TextInput
          label="Title *"
          value={title}
          onChangeText={setTitle}
          mode="flat"
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          contentStyle={{ backgroundColor: theme.colors.surface }}
          underlineColor={theme.colors.border}
          activeUnderlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="flat"
          multiline
          numberOfLines={4}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          contentStyle={{ backgroundColor: theme.colors.surface }}
          underlineColor={theme.colors.border}
          activeUnderlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading || !caseNumber || !title}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={{ color: '#fff', fontWeight: '600' }}
        >
          Create Case
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
