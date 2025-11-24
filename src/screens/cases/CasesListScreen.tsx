import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Searchbar, FAB, Chip } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchCases, searchCases } from '../../store/slices/casesSlice';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { LoadingSkeletonList } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Case } from '../../types';
import { useNavigation } from '@react-navigation/native';

export const CasesListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  const { cases, isLoading, error } = useAppSelector((state) => state.cases);
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery) {
      dispatch(searchCases(searchQuery));
    } else {
      dispatch(fetchCases());
    }
  }, [searchQuery, dispatch]);

  const canCreateCase = user?.role === 'super_admin' || user?.role === 'admin';

  const renderCase = ({ item }: { item: Case }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CaseDetail' as never, { caseId: item.id } as never)}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.caseHeader}>
            <Typography variant="h3">{item.case_number}</Typography>
            <Chip
              style={[
                styles.chip,
                {
                  backgroundColor:
                    item.status === 'open'
                      ? theme.colors.success
                      : item.status === 'closed'
                      ? theme.colors.error
                      : theme.colors.warning,
                },
              ]}
              textStyle={{ color: '#fff' }}
            >
              {item.status}
            </Chip>
          </View>
          <Typography variant="body" style={{ marginTop: 8 }}>
            {item.title}
          </Typography>
          {item.description && (
            <Typography variant="caption" style={{ marginTop: 4, color: theme.colors.textSecondary }}>
              {item.description.substring(0, 100)}...
            </Typography>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => dispatch(fetchCases())}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search cases..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingSkeletonList />
        </View>
      ) : cases.length === 0 ? (
        <EmptyState message="No cases found" />
      ) : (
        <FlatList
          data={cases}
          renderItem={renderCase}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {canCreateCase && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('CreateCase' as never)}
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
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    height: 24,
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

