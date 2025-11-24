import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { signIn } from '../../store/slices/authSlice';
import { AuthService } from '../../lib/services/authService';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { ErrorState } from '../../components/ErrorState';

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Typography variant="h1" style={styles.title}>
              Court Management
            </Typography>
            <Typography variant="body" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sign in to continue
            </Typography>

            {error && <ErrorState message={error} style={styles.error} />}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Password"
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
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading || !email || !password}
              style={styles.button}
            >
              Sign In
            </Button>

            {isBiometricAvailable && (
              <Button
                mode="outlined"
                onPress={handleBiometricLogin}
                icon="fingerprint"
                style={styles.button}
              >
                Use Biometric
              </Button>
            )}
          </Card.Content>
        </Card>
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
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  error: {
    marginBottom: 16,
  },
});

