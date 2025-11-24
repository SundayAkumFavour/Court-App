import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '../hooks';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { CasesListScreen } from '../screens/cases/CasesListScreen';
import { CreateCaseScreen } from '../screens/cases/CreateCaseScreen';
import { CaseDetailScreen } from '../screens/cases/CaseDetailScreen';
import { UsersListScreen } from '../screens/users/UsersListScreen';
import { CreateUserScreen } from '../screens/users/CreateUserScreen';
import { EditUserScreen } from '../screens/users/EditUserScreen';
import { UploadDocumentScreen } from '../screens/documents/UploadDocumentScreen';
import { SettingsScreen } from '../components/SettingsScreen';
import { useTheme } from '../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../components/Typography';
import { canCreateUsers } from '../utils/permissions';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CasesStack = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen name="CasesList" component={CasesListScreen} options={{ title: 'Cases' }} />
      <Stack.Screen name="CreateCase" component={CreateCaseScreen} options={{ title: 'Create Case' }} />
      <Stack.Screen name="CaseDetail" component={CaseDetailScreen} options={{ title: 'Case Details' }} />
      <Stack.Screen name="UploadDocument" component={UploadDocumentScreen} options={{ title: 'Upload Document' }} />
    </Stack.Navigator>
  );
};

const UsersStack = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen name="UsersList" component={UsersListScreen} options={{ title: 'Users' }} />
      <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{ title: 'Create User' }} />
      <Stack.Screen name="EditUser" component={EditUserScreen} options={{ title: 'Edit User' }} />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const canManageUsers = canCreateUsers(user?.role || null);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      <Tab.Screen
        name="Cases"
        component={CasesStack}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="briefcase" size={24} color={color} />,
        }}
      />
      {canManageUsers && (
        <Tab.Screen
          name="Users"
          component={UsersStack}
          options={{
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={24} color={color} />,
          }}
        />
      )}
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.mode === 'dark',
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.error,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400' as const,
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500' as const,
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700' as const,
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900' as const,
          },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

