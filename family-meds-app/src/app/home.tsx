import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl, Platform, Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';

import { api } from '../api/client';
import { deleteToken } from '../storage/token';
import { registerNotifications } from '../notifications/register';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface Medicine {
  id: string;
  name: string;
  quantity: number;
  dosagePerIntake: number;
  lowStockThreshold: number;
  unit: string;
  scheduleTimes: string[];
  notes: string | null;
  isActive: boolean;
}

function webConfirm(message: string): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.confirm(message);
  }
  return false;
}

async function scheduleReminder(medicine: Medicine): Promise<void> {
  if (!medicine.scheduleTimes?.length) return;
  for (const time of medicine.scheduleTimes) {
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: '💊 Reminder', body: `Time to take ${medicine.name}` },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: h, minute: m },
    });
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMedicines = useCallback(async () => {
    try {
      const res = await api.get<Medicine[]>('/medicines');
      setMedicines(res.data);
      await Notifications.cancelAllScheduledNotificationsAsync();
      for (const m of res.data) await scheduleReminder(m);
    } catch (e) {
      console.log('Load medicines failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadMedicines();
    }, [loadMedicines]),
  );

  useEffect(() => { registerNotifications().catch(() => null); }, []);

  const takeMedicine = async (id: string) => {
    try {
      const res = await api.post<Medicine>(`/medicines/${id}/take`);
      setMedicines((prev) => prev.map((m) => (m.id === res.data.id ? res.data : m)));
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('medicines.outOfStock');
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert(t('common.error'), msg);
      }
    }
  };

  const deleteMedicine = async (id: string, name: string) => {
    if (Platform.OS === 'web') {
      const ok = webConfirm(`${t('medicines.deleteConfirm')} "${name}"?`);
      if (!ok) return;
      try {
        await api.delete(`/medicines/${id}`);
        setMedicines((prev) => prev.filter((m) => m.id !== id));
      } catch (e: any) {
        window.alert(e?.response?.data?.message || 'Failed to delete');
      }
      return;
    }

    Alert.alert(
      t('medicines.deleteMedicine'),
      `${t('medicines.deleteConfirm')} "${name}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/medicines/${id}`);
              setMedicines((prev) => prev.filter((m) => m.id !== id));
            } catch (e: any) {
              Alert.alert(t('common.error'), e?.response?.data?.message || 'Failed to delete');
            }
          },
        },
      ],
    );
  };

  const logout = async () => {
    await deleteToken();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={[s.header, isRTL && s.rowReverse]}>
        <View>
          <Text style={s.headerTitle}>{t('medicines.title')}</Text>
          <Text style={s.headerSub}>{medicines.length} {isRTL ? 'دواء' : 'medicines'}</Text>
        </View>
        <View style={[s.headerRight, isRTL && s.rowReverse]}>
          <LanguageSwitcher />
          <TouchableOpacity onPress={logout} style={s.iconCircle} accessibilityLabel="logout-button">
            <Text style={{ fontSize: 18 }}>↩</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Action Row ── */}
      <View style={[s.actionRow, isRTL && s.rowReverse]}>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/add-medicine')}
          accessibilityLabel="add-medicine-button"
        >
          <Text style={s.addBtnText}>＋ {t('medicines.addMedicine')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.familyBtn}
          onPress={() => router.push('/family' as never)}
          accessibilityLabel="family-button"
        >
          <Text style={s.familyBtnText}>👨‍👩‍👧</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.histBtn}
          onPress={() => router.push('/dose-logs' as never)}
          accessibilityLabel="dose-history-button"
        >
          <Text style={s.histBtnText}>📋</Text>
        </TouchableOpacity>
      </View>

      {/* ── List ── */}
      <ScrollView
        style={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMedicines(); }} tintColor="#6366f1" />}
      >
        {medicines.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>💊</Text>
            <Text style={s.emptyText}>{t('medicines.noMedicines')}</Text>
          </View>
        ) : (
          medicines.map((item) => {
            const isLow = item.quantity <= (item.lowStockThreshold ?? 5);
            const isEmpty = item.quantity <= 0;
            return (
              <View key={item.id} style={[s.card, isLow && s.cardLow]}>
                {/* Card top row */}
                <View style={[s.cardTop, isRTL && s.rowReverse]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardName, isRTL && s.textRight]}>{item.name}</Text>
                    {isLow && (
                      <View style={[s.badge, isEmpty ? s.badgeRed : s.badgeAmber]}>
                        <Text style={s.badgeText}>
                          {isEmpty ? t('medicines.outOfStock') : t('medicines.lowStock')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={s.cardBtns}>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/edit-medicine', params: { id: item.id } })}
                      style={s.iconBtn}
                      accessibilityLabel={`edit-${item.id}`}
                    >
                      <Text>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteMedicine(item.id, item.name)}
                      style={s.iconBtn}
                      accessibilityLabel={`delete-${item.id}`}
                    >
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Stats */}
                <View style={[s.stats, isRTL && s.rowReverse]}>
                  <View style={s.stat}>
                    <Text style={s.statLabel}>{t('medicines.remaining')}</Text>
                    <Text style={[s.statVal, isLow && { color: '#f59e0b' }]}>
                      {item.quantity} {item.unit || 'pcs'}
                    </Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statLabel}>{t('medicines.dosageLabel')}</Text>
                    <Text style={s.statVal}>{item.dosagePerIntake} {item.unit || 'pcs'}</Text>
                  </View>
                </View>

                {/* Schedule */}
                <View style={s.schedRow}>
                  {item.scheduleTimes?.map((t) => (
                    <View key={t} style={s.timeChip}>
                      <Text style={s.timeChipText}>🕐 {t}</Text>
                    </View>
                  ))}
                </View>

                {item.notes ? <Text style={[s.notes, isRTL && s.textRight]}>📝 {item.notes}</Text> : null}

                <TouchableOpacity
                  onPress={() => takeMedicine(item.id)}
                  style={[s.takeBtn, isEmpty && s.takeBtnOff]}
                  disabled={isEmpty}
                  accessibilityLabel={`take-${item.id}`}
                >
                  <Text style={s.takeBtnText}>
                    {isEmpty ? t('medicines.outOfStock') : `✓  ${t('medicines.takeMedicine')}`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  headerSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#334155',
  },

  actionRow: {
    flexDirection: 'row', gap: 8, padding: 14,
  },
  addBtn: {
    flex: 1, backgroundColor: '#6366f1', borderRadius: 12,
    padding: 13, alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  familyBtn: {
    width: 46, backgroundColor: '#1e293b', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#334155',
  },
  familyBtnText: { fontSize: 20 },
  histBtn: {
    width: 46, backgroundColor: '#1e293b', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#334155',
  },
  histBtnText: { fontSize: 20 },

  list: { flex: 1, paddingHorizontal: 14 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 60 },
  emptyText: { color: '#64748b', fontSize: 16, textAlign: 'center' },

  card: {
    backgroundColor: '#1e293b', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#334155',
  },
  cardLow: { borderColor: '#f59e0b' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardName: { fontSize: 17, fontWeight: '700', color: '#f1f5f9' },
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  badgeAmber: { backgroundColor: '#78350f' },
  badgeRed: { backgroundColor: '#450a0a' },
  badgeText: { color: '#fef3c7', fontSize: 11, fontWeight: '700' },
  cardBtns: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    padding: 7, backgroundColor: '#0f172a', borderRadius: 8,
    borderWidth: 1, borderColor: '#334155',
  },

  stats: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  stat: { flex: 1 },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  statVal: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', marginTop: 2 },

  schedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  timeChip: {
    backgroundColor: '#312e81', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  timeChipText: { color: '#c7d2fe', fontSize: 12, fontWeight: '600' },
  notes: { fontSize: 12, color: '#64748b', marginBottom: 8, fontStyle: 'italic' },

  takeBtn: {
    backgroundColor: '#059669', borderRadius: 10,
    padding: 12, alignItems: 'center', marginTop: 4,
  },
  takeBtnOff: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  takeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
