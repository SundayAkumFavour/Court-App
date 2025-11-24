import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createUser } from '../../store/slices/usersSlice';
import { supabase } from '../../lib/supabase';
import { UserService } from '../../lib/services/userService';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { useNavigation } from '@react-navigation/native';
import { UserRole } from '../../types';
import { canCreateAdmins } from '../../utils/permissions';
import Logger from '../../utils/logger';
import { EmailService } from '../../lib/services/emailService';

const LOG_SOURCE = 'CreateUserScreen';

export const CreateUserScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const navigation = useNavigation();

  const canCreateAdmin = canCreateAdmins(user?.role || null);

  const handleCreate = async () => {
    if (!email || !user) return;

    Logger.info(LOG_SOURCE, 'Creating new user', { email, role });
    setLoading(true);

    try {
      // Generate password if not provided
      const userPassword = password || UserService.generatePassword();

      Logger.debug(LOG_SOURCE, 'Creating auth user', { email });

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: userPassword,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        Logger.error(LOG_SOURCE, 'Error creating auth user', { error: authError?.message, email });
        // Handle error - show alert or toast
        return;
      }

      Logger.info(LOG_SOURCE, 'Auth user created', { userId: authData.user.id, email });

      // Create user record
      await dispatch(createUser({ userId: authData.user.id, email, role, createdBy: user.id }));

      Logger.info(LOG_SOURCE, 'User created successfully', { email, role });

      // Try to send welcome email (optional - requires Edge Function setup)
      const emailResult = await EmailService.sendWelcomeEmail(email, userPassword, role);
      
      if (emailResult.success) {
        Logger.info(LOG_SOURCE, 'Welcome email sent', { email });
        alert('User created successfully. Welcome email sent with credentials.');
      } else {
        Logger.info(LOG_SOURCE, 'Email not configured, showing password in app', { email });
        // Show password in app (this is the default behavior)
        alert(`User created successfully!\n\nEmail: ${email}\nPassword: ${userPassword}\nRole: ${role.replace('_', ' ')}\n\nPlease share these credentials securely with the user.`);
      }

      navigation.goBack();
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Exception creating user', error);
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
          Create New User
        </Typography>

        <TextInput
          label="Email *"
          value={email}
          onChangeText={setEmail}
          mode="flat"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          contentStyle={{ backgroundColor: theme.colors.surface }}
          underlineColor={theme.colors.border}
          activeUnderlineColor={theme.colors.primary}
          textColor={theme.colors.text}
        />

        <View style={styles.section}>
          <Typography variant="body" style={[styles.label, { color: theme.colors.text }]}>
            Role
          </Typography>
          <SegmentedButtons
            value={role}
            onValueChange={(value) => setRole(value as UserRole)}
            buttons={[
              { value: 'staff', label: 'Staff' },
              ...(canCreateAdmin ? [{ value: 'admin', label: 'Admin' }] : []),
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        <TextInput
          label="Password (leave empty to generate)"
          value={password}
          onChangeText={setPassword}
          mode="flat"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          contentStyle={{ backgroundColor: theme.colors.surface }}
          underlineColor={theme.colors.border}
          activeUnderlineColor={theme.colors.primary}
          textColor={theme.colors.text}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
              iconColor={theme.colors.textSecondary}
            />
          }
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading || !email}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={{ color: '#fff', fontWeight: '600' }}
        >
          Create User
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
  section: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 12,
    fontWeight: '600',
    fontSize: 15,
  },
  segmentedButtons: {
    marginTop: 4,
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
