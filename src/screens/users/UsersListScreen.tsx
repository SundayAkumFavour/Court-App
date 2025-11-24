import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Searchbar, FAB, Chip, Menu } from 'react-native-paper';
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

export const UsersListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreate = canCreateUsers(user?.role || null);

  const renderUser = ({ item }: { item: User }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Typography variant="body">{item.email}</Typography>
            <View style={styles.roleRow}>
              <Chip
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      item.role === 'super_admin'
                        ? theme.colors.error
                        : item.role === 'admin'
                        ? theme.colors.primary
                        : theme.colors.secondary,
                  },
                ]}
                textStyle={{ color: '#fff', fontSize: 10 }}
              >
                {item.role}
              </Chip>
              <Chip
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      item.status === 'active'
                        ? theme.colors.success
                        : item.status === 'suspended'
                        ? theme.colors.warning
                        : theme.colors.error,
                  },
                ]}
                textStyle={{ color: '#fff', fontSize: 10 }}
              >
                {item.status}
              </Chip>
            </View>
          </View>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(item.id)}>
                <Typography>⋮</Typography>
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                navigation.navigate('EditUser' as never, { userId: item.id } as never);
              }}
              title="Edit"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                // Handle suspend/activate
              }}
              title={item.status === 'active' ? 'Suspend' : 'Activate'}
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                // Handle delete
              }}
              title="Delete"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        </View>
      </Card.Content>
    </Card>
  );

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => dispatch(fetchUsers())}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search users..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
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
        />
      )}

      {canCreate && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('CreateUser' as never)}
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
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
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
    height: 20,
  },
  loadingContainer: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

