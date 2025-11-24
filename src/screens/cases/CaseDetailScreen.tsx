import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Button, Chip, FAB } from 'react-native-paper';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'CaseDetailScreen';

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
    Logger.info(LOG_SOURCE, 'Case detail screen mounted', { caseId });
    loadCase();
    dispatch(fetchDocumentsByCase(caseId));
  }, [caseId, dispatch]);

  const loadCase = async () => {
    Logger.debug(LOG_SOURCE, 'Loading case data', { caseId });
    setLoading(true);
    try {
      const { data, error } = await CaseService.getCaseById(caseId);
      if (error) {
        Logger.error(LOG_SOURCE, 'Error loading case', { error: error.message, caseId });
      }
      setCaseData(data);
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Exception loading case', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.documentCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <View style={styles.documentContent}>
        <View style={styles.documentInfo}>
          <MaterialCommunityIcons
            name="file-document"
            size={24}
            color={theme.colors.primary}
          />
          <View style={styles.documentText}>
            <Typography variant="body" style={{ color: theme.colors.text, fontWeight: '600' }}>
              {item.filename}
            </Typography>
            <Typography variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
              {new Date(item.created_at).toLocaleDateString()}
            </Typography>
          </View>
        </View>
        <View style={styles.documentActions}>
          <TouchableOpacity
            onPress={() => {
              Logger.debug(LOG_SOURCE, 'Viewing document', { documentId: item.id });
              navigation.navigate('ViewDocument' as never, { documentId: item.id } as never);
            }}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name="eye"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          {canDeleteDocuments(user?.role || null) && (
            <TouchableOpacity
              onPress={() => {
                Logger.debug(LOG_SOURCE, 'Deleting document', { documentId: item.id });
                // Handle delete
              }}
              style={styles.actionButton}
            >
              <MaterialCommunityIcons
                name="delete"
                size={20}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.caseCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.caseHeader}>
            <View style={styles.caseInfo}>
              <Typography variant="h2" style={{ color: theme.colors.text, fontWeight: '700' }}>
                {caseData.case_number}
              </Typography>
              <Typography variant="h3" style={{ marginTop: 8, color: theme.colors.text }}>
                {caseData.title}
              </Typography>
              {caseData.description && (
                <Typography variant="body" style={{ marginTop: 12, color: theme.colors.textSecondary }}>
                  {caseData.description}
                </Typography>
              )}
            </View>
            <Chip
              mode="flat"
              style={[
                styles.chip,
                {
                  backgroundColor:
                    caseData.status === 'open'
                      ? theme.colors.success + '20'
                      : caseData.status === 'closed'
                      ? theme.colors.error + '20'
                      : theme.colors.warning + '20',
                },
              ]}
              textStyle={{
                color:
                  caseData.status === 'open'
                    ? theme.colors.success
                    : caseData.status === 'closed'
                    ? theme.colors.error
                    : theme.colors.warning,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {caseData.status}
            </Chip>
          </View>
        </View>

        <Typography variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
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
            contentContainerStyle={styles.documentsList}
          />
        )}
      </ScrollView>

      <FAB
        icon="upload"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          Logger.debug(LOG_SOURCE, 'Navigating to upload document', { caseId });
          navigation.navigate('UploadDocument' as never, { caseId } as never);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  caseCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
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
    height: 28,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  documentsList: {
    paddingBottom: 16,
  },
  documentCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  documentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentText: {
    marginLeft: 12,
    flex: 1,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});
