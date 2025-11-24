import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Searchbar, FAB, Chip } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchCases, searchCases } from '../../store/slices/casesSlice';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { LoadingSkeletonList } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Case } from '../../types';
import { useNavigation } from '@react-navigation/native';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'CasesListScreen';

export const CasesListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  const { cases, isLoading, error } = useAppSelector((state) => state.cases);
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    Logger.info(LOG_SOURCE, 'Cases list screen mounted');
    dispatch(fetchCases());
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery) {
      Logger.debug(LOG_SOURCE, 'Searching cases', { query: searchQuery });
      dispatch(searchCases(searchQuery));
    } else {
      dispatch(fetchCases());
    }
  }, [searchQuery, dispatch]);

  const canCreateCase = user?.role === 'super_admin' || user?.role === 'admin';

  const renderCase = ({ item }: { item: Case }) => (
    <TouchableOpacity
      onPress={() => {
        Logger.debug(LOG_SOURCE, 'Navigating to case detail', { caseId: item.id });
        navigation.navigate('CaseDetail' as never, { caseId: item.id } as never);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.caseCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.caseHeader}>
          <View style={styles.caseInfo}>
            <Typography variant="h3" style={{ color: theme.colors.text, fontWeight: '700' }}>
              {item.case_number}
            </Typography>
            <Typography variant="body" style={{ marginTop: 4, color: theme.colors.text }}>
              {item.title}
            </Typography>
            {item.description && (
              <Typography variant="caption" style={{ marginTop: 4, color: theme.colors.textSecondary }}>
                {item.description.substring(0, 100)}...
              </Typography>
            )}
          </View>
          <Chip
            mode="flat"
            style={[
              styles.chip,
              {
                backgroundColor:
                  item.status === 'open'
                    ? theme.colors.success + '20'
                    : item.status === 'closed'
                    ? theme.colors.error + '20'
                    : theme.colors.warning + '20',
              },
            ]}
            textStyle={{
              color:
                item.status === 'open'
                  ? theme.colors.success
                  : item.status === 'closed'
                  ? theme.colors.error
                  : theme.colors.warning,
              fontSize: 11,
              fontWeight: '600',
            }}
          >
            {item.status}
          </Chip>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          Logger.info(LOG_SOURCE, 'Retrying fetch cases');
          dispatch(fetchCases());
        }}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search cases..."
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
      ) : cases.length === 0 ? (
        <EmptyState message="No cases found" />
      ) : (
        <FlatList
          data={cases}
          renderItem={renderCase}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {canCreateCase && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            Logger.debug(LOG_SOURCE, 'Navigating to create case');
            navigation.navigate('CreateCase' as never);
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
  caseCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  caseInfo: {
    flex: 1,
    marginRight: 12,
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
    borderRadius: 28,
  },
});
