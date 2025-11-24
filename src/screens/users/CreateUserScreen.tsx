import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createUser } from '../../store/slices/usersSlice';
import { supabase } from '../../lib/supabase';
import { UserService } from '../../lib/services/userService';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { useNavigation } from '@react-navigation/native';
import { UserRole } from '../../types';
import { canCreateAdmins } from '../../utils/permissions';

export const CreateUserScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const navigation = useNavigation();

  const canCreateAdmin = canCreateAdmins(user?.role || null);

  const handleCreate = async () => {
    if (!email || !user) return;

    // Generate password if not provided
    const userPassword = password || UserService.generatePassword();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      // Handle error
      return;
    }

    // Create user record
    await dispatch(createUser({ userId: authData.user.id, email, role, createdBy: user.id }));

    // Show password to user (in production, send via email/SMS)
    alert(`User created. Password: ${userPassword}`);

    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Typography variant="h2" style={styles.title}>
            Create New User
          </Typography>

          <TextInput
            label="Email *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <SegmentedButtons
            value={role}
            onValueChange={(value) => setRole(value as UserRole)}
            buttons={[
              { value: 'staff', label: 'Staff' },
              ...(canCreateAdmin ? [{ value: 'admin', label: 'Admin' }] : []),
            ]}
            style={styles.input}
          />

          <TextInput
            label="Password (leave empty to generate)"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleCreate}
            disabled={!email}
            style={styles.button}
          >
            Create User
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

