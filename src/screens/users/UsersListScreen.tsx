import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Searchbar, FAB, Chip, Menu } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchUsers } from '../../store/slices/usersSlice';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { LoadingSkeletonList } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { User } from '../../types';
import { canCreateUsers } from '../../utils/permissions';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'UsersListScreen';

export const UsersListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<Record<string, boolean>>({});
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    Logger.info(LOG_SOURCE, 'Users list screen mounted');
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreate = canCreateUsers(user?.role || null);

  const renderUser = ({ item }: { item: User }) => (
    <View style={[styles.userCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>
            {item.email}
          </Typography>
          <View style={styles.roleRow}>
            <Chip
              mode="flat"
              style={[
                styles.chip,
                {
                  backgroundColor:
                    item.role === 'super_admin'
                      ? theme.colors.error + '20'
                      : item.role === 'admin'
                      ? theme.colors.primary + '20'
                      : theme.colors.secondary + '20',
                },
              ]}
              textStyle={{
                color:
                  item.role === 'super_admin'
                    ? theme.colors.error
                    : item.role === 'admin'
                    ? theme.colors.primary
                    : theme.colors.secondary,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              {item.role.replace('_', ' ')}
            </Chip>
            <Chip
              mode="flat"
              style={[
                styles.chip,
                {
                  backgroundColor:
                    item.status === 'active'
                      ? theme.colors.success + '20'
                      : item.status === 'suspended'
                      ? theme.colors.warning + '20'
                      : theme.colors.error + '20',
                },
              ]}
              textStyle={{
                color:
                  item.status === 'active'
                    ? theme.colors.success
                    : item.status === 'suspended'
                    ? theme.colors.warning
                    : theme.colors.error,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              {item.status}
            </Chip>
          </View>
        </View>
        <Menu
          visible={menuVisible[item.id] || false}
          onDismiss={() => setMenuVisible({ ...menuVisible, [item.id]: false })}
          anchor={
            <TouchableOpacity
              onPress={() => {
                Logger.debug(LOG_SOURCE, 'Opening menu', { userId: item.id });
                setMenuVisible({ ...menuVisible, [item.id]: true });
              }}
              style={styles.menuButton}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              Logger.debug(LOG_SOURCE, 'Editing user', { userId: item.id });
              setMenuVisible({ ...menuVisible, [item.id]: false });
              (navigation as any).navigate('EditUser', { userId: item.id });
            }}
            title="Edit"
          />
          <Menu.Item
            onPress={() => {
              Logger.debug(LOG_SOURCE, 'Toggling user status', { userId: item.id, currentStatus: item.status });
              setMenuVisible({ ...menuVisible, [item.id]: false });
              // Handle suspend/activate
            }}
            title={item.status === 'active' ? 'Suspend' : 'Activate'}
          />
          <Menu.Item
            onPress={() => {
              Logger.debug(LOG_SOURCE, 'Deleting user', { userId: item.id });
              setMenuVisible({ ...menuVisible, [item.id]: false });
              // Handle delete
            }}
            title="Delete"
            titleStyle={{ color: theme.colors.error }}
          />
        </Menu>
      </View>
    </View>
  );

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          Logger.info(LOG_SOURCE, 'Retrying fetch users');
          dispatch(fetchUsers());
        }}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search users..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        inputStyle={{ color: theme.colors.text }}
        iconColor={theme.colors.textSecondary}
        placeholderTextColor={theme.colors.textSecondary}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingSkeletonList />
        </View>
      ) : filteredUsers.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {canCreate && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            Logger.debug(LOG_SOURCE, 'Navigating to create user');
            navigation.navigate('CreateUser' as never);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 16,
    borderRadius: 16,
    elevation: 0,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  roleRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  chip: {
    height: 35,
    justifyContent: 'center',
  },
  menuButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});
