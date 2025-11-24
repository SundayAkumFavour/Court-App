import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateUser, fetchUsers } from '../../store/slices/usersSlice';
import { UserService } from '../../lib/services/userService';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserRole, UserStatus } from '../../types';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'EditUserScreen';

export const EditUserScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params as { userId: string };
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [status, setStatus] = useState<UserStatus>('active');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  const canCreateAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    Logger.info(LOG_SOURCE, 'Loading user for edit', { userId });
    setLoading(true);
    try {
      const { data, error } = await UserService.getUserById(userId);
      if (error || !data) {
        Logger.error(LOG_SOURCE, 'Failed to load user', error);
        navigation.goBack();
        return;
      }

      Logger.info(LOG_SOURCE, 'User loaded successfully', {
        userId: data.id,
        email: data.email,
        role: data.role,
        status: data.status,
      });

      setEmail(data.email);
      setRole(data.role);
      setStatus(data.status);
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Exception loading user', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    Logger.info(LOG_SOURCE, 'Saving user changes', { userId, role, status });
    setSaving(true);

    try {
      await dispatch(updateUser({
        id: userId,
        updates: { role, status },
      }));

      Logger.info(LOG_SOURCE, 'User updated successfully', { userId });
      
      // Refresh users list
      await dispatch(fetchUsers());
      
      navigation.goBack();
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Failed to update user', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Typography variant="body" style={{ textAlign: 'center', marginTop: 24 }}>
          Loading...
        </Typography>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.form}>
        <Typography variant="h2" style={[styles.title, { color: theme.colors.text }]}>
          Edit User
        </Typography>

        <TextInput
          label="Email"
          value={email}
          editable={false}
          mode="flat"
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          contentStyle={{ backgroundColor: theme.colors.surface }}
          underlineColor={theme.colors.border}
          textColor={theme.colors.textSecondary}
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

        <View style={styles.section}>
          <Typography variant="body" style={[styles.label, { color: theme.colors.text }]}>
            Status
          </Typography>
          <SegmentedButtons
            value={status}
            onValueChange={(value) => setStatus(value as UserStatus)}
            buttons={[
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'deactivated', label: 'Deactivated' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          labelStyle={{ color: '#fff', fontWeight: '600' }}
        >
          Save Changes
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
    marginBottom: 32,
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
    borderRadius: 12,
    elevation: 0,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

