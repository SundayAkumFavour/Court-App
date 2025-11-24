import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Button, Chip, FAB } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchDocumentsByCase } from '../../store/slices/documentsSlice';
import { CaseService } from '../../lib/services/caseService';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../components/Typography';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Document } from '../../types';
import { useRoute, useNavigation } from '@react-navigation/native';
import { canDeleteDocuments } from '../../utils/permissions';

export const CaseDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { caseId } = route.params as { caseId: string };
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { documents, isLoading } = useAppSelector((state) => state.documents);
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  useEffect(() => {
    loadCase();
    dispatch(fetchDocumentsByCase(caseId));
  }, [caseId, dispatch]);

  const loadCase = async () => {
    setLoading(true);
    const { data } = await CaseService.getCaseById(caseId);
    setCaseData(data);
    setLoading(false);
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Typography variant="body">{item.filename}</Typography>
        <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
          {new Date(item.created_at).toLocaleDateString()}
        </Typography>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate('ViewDocument' as never, { documentId: item.id } as never)}>
          View
        </Button>
        {canDeleteDocuments(user?.role || null) && (
          <Button
            onPress={() => {
              // Handle delete
            }}
            textColor={theme.colors.error}
          >
            Delete
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSkeleton height={200} style={{ margin: 16 }} />
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState message="Case not found" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.header}>
              <Typography variant="h2">{caseData.case_number}</Typography>
              <Chip
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      caseData.status === 'open'
                        ? theme.colors.success
                        : caseData.status === 'closed'
                        ? theme.colors.error
                        : theme.colors.warning,
                  },
                ]}
                textStyle={{ color: '#fff' }}
              >
                {caseData.status}
              </Chip>
            </View>
            <Typography variant="h3" style={{ marginTop: 16 }}>
              {caseData.title}
            </Typography>
            {caseData.description && (
              <Typography variant="body" style={{ marginTop: 8, color: theme.colors.textSecondary }}>
                {caseData.description}
              </Typography>
            )}
          </Card.Content>
        </Card>

        <Typography variant="h3" style={{ margin: 16 }}>
          Documents
        </Typography>

        {isLoading ? (
          <LoadingSkeleton height={100} style={{ margin: 16 }} />
        ) : documents.length === 0 ? (
          <EmptyState message="No documents" />
        ) : (
          <FlatList
            data={documents}
            renderItem={renderDocument}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
          />
        )}
      </ScrollView>

      <FAB
        icon="upload"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('UploadDocument' as never, { caseId } as never)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    height: 24,
  },
  list: {
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

