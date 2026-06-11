/**
 * Dose History Screen
 *
 * Features:
 * - i18n
 * - Grouped by date
 * - Empty state
 * - Premium dark UI
 */
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { api } from '../api/client';

interface DoseLog {
  id: string;
  medicineName: string;
  quantityTaken: number;
  takenAt: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function groupByDate(logs: DoseLog[]): Record<string, DoseLog[]> {
  return logs.reduce(
    (acc, log) => {
      const key = new Date(log.takenAt).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(log);
      return acc;
    },
    {} as Record<string, DoseLog[]>,
  );
}

export default function DoseLogsScreen() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<DoseLog[]>('/dose-logs');
      setLogs(res.data);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const grouped = groupByDate(logs);
  const dateKeys = Object.keys(grouped);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('doseLogs.title')}</Text>
        <Text style={styles.headerSub}>{logs.length} total doses</Text>
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
      >
        {dateKeys.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>{t('doseLogs.noLogs')}</Text>
          </View>
        ) : (
          dateKeys.map((dateKey) => (
            <View key={dateKey} style={styles.group}>
              <Text style={styles.dateLabel}>{formatDate(grouped[dateKey][0].takenAt)}</Text>

              {grouped[dateKey].map((log) => (
                <View key={log.id} style={styles.logCard}>
                  <View style={styles.logLeft}>
                    <Text style={styles.logEmoji}>💊</Text>
                    <View>
                      <Text style={styles.logName}>{log.medicineName}</Text>
                      <Text style={styles.logTime}>
                        {new Date(log.takenAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.logRight}>
                    <Text style={styles.logQuantity}>{log.quantityTaken}</Text>
                    <Text style={styles.logQuantityLabel}>{t('doseLogs.taken')}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },

  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#f1f5f9' },
  headerSub: { fontSize: 13, color: '#64748b', marginTop: 2 },

  list: { flex: 1, padding: 16 },

  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyEmoji: { fontSize: 64 },
  emptyText: { color: '#64748b', fontSize: 16, textAlign: 'center' },

  group: { marginBottom: 24 },
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  logCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logEmoji: { fontSize: 24 },
  logName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  logTime: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  logRight: { alignItems: 'flex-end' },
  logQuantity: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6366f1',
  },
  logQuantityLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});