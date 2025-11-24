import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Switch } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../hooks';
import { signOut, setBiometricEnabled } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { AuthService } from '../lib/services/authService';
import { useTheme } from '../hooks/useTheme';
import { Typography } from './Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Logger from '../utils/logger';

const LOG_SOURCE = 'SettingsScreen';

export const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, biometricEnabled } = useAppSelector((state) => state.auth);
  const { mode } = useAppSelector((state) => state.theme);
  const theme = useTheme();
  const [signingOut, setSigningOut] = React.useState(false);

  const handleToggleBiometric = async () => {
    if (!user) return;
    
    Logger.info(LOG_SOURCE, 'Toggling biometric', { userId: user.id, currentState: biometricEnabled });
    
    if (!biometricEnabled) {
      const available = await AuthService.isBiometricAvailable();
      if (!available) {
        Logger.warn(LOG_SOURCE, 'Biometric not available');
        alert('Biometric authentication is not available on this device');
        return;
      }
      const success = await AuthService.authenticateWithBiometric();
      if (success) {
        await AuthService.enableBiometric(user.id);
        dispatch(setBiometricEnabled(true));
        Logger.info(LOG_SOURCE, 'Biometric enabled', { userId: user.id });
      }
    } else {
      await AuthService.enableBiometric(user.id);
      dispatch(setBiometricEnabled(false));
      Logger.info(LOG_SOURCE, 'Biometric disabled', { userId: user.id });
    }
  };

  const handleSignOut = async () => {
    Logger.info(LOG_SOURCE, 'Sign out initiated', { userId: user?.id });
    setSigningOut(true);
    try {
      await dispatch(signOut());
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Typography variant="h2" style={[styles.title, { color: theme.colors.text }]}>
        Settings
      </Typography>

      <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            Logger.debug(LOG_SOURCE, 'Toggling theme', { currentMode: mode });
            dispatch(toggleTheme());
          }}
        >
          <View style={styles.settingContent}>
            <MaterialCommunityIcons
              name={mode === 'dark' ? 'weather-night' : 'weather-sunny'}
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.settingText}>
              <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>
                Dark Mode
              </Typography>
              <Typography variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                Toggle dark theme
              </Typography>
            </View>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={() => {
              Logger.debug(LOG_SOURCE, 'Toggling theme', { currentMode: mode });
              dispatch(toggleTheme());
            }}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        {(user?.role === 'super_admin' || user?.role === 'admin') && (
          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemBorder, { borderColor: theme.colors.border }]}
            onPress={handleToggleBiometric}
          >
            <View style={styles.settingContent}>
              <MaterialCommunityIcons
                name="fingerprint"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.settingText}>
                <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>
                  Biometric Authentication
                </Typography>
                <Typography variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                  Enable biometric login
                </Typography>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={theme.colors.textSecondary}
            />
            <View style={styles.settingText}>
              <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>
                User
              </Typography>
              <Typography variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                {user?.email}
              </Typography>
            </View>
          </View>
        </View>

        <View style={[styles.settingItem, styles.settingItemBorder, { borderColor: theme.colors.border }]}>
          <View style={styles.settingContent}>
            <MaterialCommunityIcons
              name="shield-account"
              size={24}
              color={theme.colors.textSecondary}
            />
            <View style={styles.settingText}>
              <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>
                Role
              </Typography>
              <Typography variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                {user?.role?.replace('_', ' ')}
              </Typography>
            </View>
          </View>
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleSignOut}
        loading={signingOut}
        disabled={signingOut}
        style={[styles.button, { backgroundColor: theme.colors.error }]}
        contentStyle={styles.buttonContent}
        labelStyle={{ color: '#fff', fontWeight: '600' }}
      >
        Sign Out
      </Button>
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
  title: {
    marginBottom: 32,
    fontWeight: '700',
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderTopWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
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
