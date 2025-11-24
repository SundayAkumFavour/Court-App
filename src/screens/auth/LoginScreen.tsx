import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { signIn } from '../../store/slices/authSlice';
import { AuthService } from '../../lib/services/authService';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  React.useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const available = await AuthService.isBiometricAvailable();
    setIsBiometricAvailable(available);
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    await dispatch(signIn({ email, password }));
  };

  const handleBiometricLogin = async () => {
    const success = await AuthService.authenticateWithBiometric();
    if (success) {
      // After biometric success, user still needs to sign in with credentials
      // This would typically retrieve stored credentials or use a token
      // For now, we'll just show that biometric was successful
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Typography variant="h1" style={[styles.title, { color: theme.colors.text }]}>
              Court Management
            </Typography>
            <Typography variant="body" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sign in to continue
            </Typography>
          </View>

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '15' }]}>
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={20} 
                color={theme.colors.error} 
                style={styles.errorIcon}
              />
              <Typography variant="caption" style={{ color: theme.colors.error, flex: 1 }}>
                {error}
              </Typography>
            </View>
          )}

          <View style={styles.form}>
            <TextInput
              label="Email"
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

            <TextInput
              label="Password"
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
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading || !email || !password}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={{ color: '#fff', fontWeight: '600' }}
            >
              Sign In
            </Button>

            {isBiometricAvailable && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={[styles.biometricButton, { borderColor: theme.colors.border }]}
              >
                <MaterialCommunityIcons 
                  name="fingerprint" 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Typography variant="body" style={{ color: theme.colors.primary, marginLeft: 8 }}>
                  Use Biometric
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    elevation: 0,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorIcon: {
    marginRight: 8,
  },
});
