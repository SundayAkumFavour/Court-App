import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Switch, List } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../hooks';
import { signOut, setBiometricEnabled } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { AuthService } from '../lib/services/authService';
import { useTheme } from '../hooks/useTheme';
import { Typography } from './Typography';

export const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, biometricEnabled } = useAppSelector((state) => state.auth);
  const { mode } = useAppSelector((state) => state.theme);
  const theme = useTheme();

  const handleToggleBiometric = async () => {
    if (!user) return;
    if (!biometricEnabled) {
      const available = await AuthService.isBiometricAvailable();
      if (!available) {
        alert('Biometric authentication is not available on this device');
        return;
      }
      const success = await AuthService.authenticateWithBiometric();
      if (success) {
        await AuthService.enableBiometric(user.id);
        dispatch(setBiometricEnabled(true));
      }
    } else {
      await AuthService.enableBiometric(user.id);
      dispatch(setBiometricEnabled(false));
    }
  };

  const handleSignOut = () => {
    dispatch(signOut());
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Typography variant="h2" style={styles.title}>
            Settings
          </Typography>

          <List.Item
            title="Dark Mode"
            description="Toggle dark theme"
            right={() => (
              <Switch value={mode === 'dark'} onValueChange={() => dispatch(toggleTheme())} />
            )}
          />

          {(user?.role === 'super_admin' || user?.role === 'admin') && (
            <List.Item
              title="Biometric Authentication"
              description="Enable biometric login"
              right={() => (
                <Switch value={biometricEnabled} onValueChange={handleToggleBiometric} />
              )}
            />
          )}

          <List.Item
            title="User"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="account" />}
          />

          <List.Item
            title="Role"
            description={user?.role}
            left={(props) => <List.Icon {...props} icon="shield-account" />}
          />

          <Button
            mode="contained"
            onPress={handleSignOut}
            style={[styles.button, { backgroundColor: theme.colors.error }]}
          >
            Sign Out
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
  button: {
    marginTop: 24,
  },
});

