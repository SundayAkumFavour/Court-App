import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createCase } from '../../store/slices/casesSlice';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { useNavigation } from '@react-navigation/native';

export const CreateCaseScreen: React.FC = () => {
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const navigation = useNavigation();

  const handleCreate = async () => {
    if (!caseNumber || !title || !user) return;
    await dispatch(createCase({ caseNumber, title, description, createdBy: user.id }));
    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Typography variant="h2" style={styles.title}>
            Create New Case
          </Typography>

          <TextInput
            label="Case Number *"
            value={caseNumber}
            onChangeText={setCaseNumber}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleCreate}
            disabled={!caseNumber || !title}
            style={styles.button}
          >
            Create Case
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
  },
  button: {
    marginTop: 8,
  },
});

