/**
 * Family Screen
 *
 * Two sections:
 *   1. "My Patients" — caregiver view: see followed patients, invite by email
 *   2. "My Caregivers" — patient view: see who follows you + pending invites to accept/reject
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Platform, RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

interface Caregiver { id: string; name: string; email: string }
interface Patient { id: string; name: string; email: string }
interface PendingInvite { id: string; caregiver: Caregiver; createdAt: string }
interface PatientLink { linkId: string; patient: Patient }
interface CaregiverLink { linkId: string; caregiver: Caregiver }

type Tab = 'caregiver' | 'patient';

function showAlert(title: string, msg: string) {
  if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
  else Alert.alert(title, msg);
}

export default function FamilyScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [tab, setTab] = useState<Tab>('caregiver');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Caregiver tab state
  const [patients, setPatients] = useState<PatientLink[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Patient tab state
  const [caregivers, setCaregivers] = useState<CaregiverLink[]>([]);
  const [pending, setPending] = useState<PendingInvite[]>([]);

  const load = useCallback(async () => {
    try {
      const [patientsRes, caregiversRes, pendingRes] = await Promise.all([
        api.get<PatientLink[]>('/family/patients'),
        api.get<CaregiverLink[]>('/family/caregivers'),
        api.get<PendingInvite[]>('/family/pending'),
      ]);
      setPatients(patientsRes.data);
      setCaregivers(caregiversRes.data);
      setPending(pendingRes.data);
    } catch (e) {
      console.log('Family load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.post('/family/invite', { patientEmail: inviteEmail.trim() });
      setInviteEmail('');
      showAlert('✓', `Invite sent to ${inviteEmail.trim()}`);
    } catch (e: any) {
      showAlert('Error', e?.response?.data?.message || 'Could not send invite');
    } finally {
      setInviting(false);
    }
  };

  const accept = async (id: string) => {
    try {
      await api.post(`/family/${id}/accept`);
      setPending((p) => p.filter((x) => x.id !== id));
      load();
    } catch (e: any) {
      showAlert('Error', e?.response?.data?.message || 'Failed');
    }
  };

  const reject = async (id: string) => {
    try {
      await api.post(`/family/${id}/reject`);
      setPending((p) => p.filter((x) => x.id !== id));
    } catch (e: any) {
      showAlert('Error', e?.response?.data?.message || 'Failed');
    }
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
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>{isRTL ? 'إدارة العائلة' : 'Family'}</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === 'caregiver' && s.tabActive]}
          onPress={() => setTab('caregiver')}
          accessibilityLabel="caregiver-tab"
        >
          <Text style={[s.tabText, tab === 'caregiver' && s.tabTextActive]}>
            👩‍⚕️ {isRTL ? 'أنا مقدم رعاية' : 'I\'m a Caregiver'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'patient' && s.tabActive]}
          onPress={() => setTab('patient')}
          accessibilityLabel="patient-tab"
        >
          <Text style={[s.tabText, tab === 'patient' && s.tabTextActive]}>
            🧑‍🦽 {isRTL ? 'أنا مريض' : 'I\'m a Patient'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#6366f1" />
        }
      >
        {/* ── CAREGIVER TAB ── */}
        {tab === 'caregiver' && (
          <>
            {/* Invite card */}
            <View style={s.card}>
              <Text style={[s.cardTitle, isRTL && s.right]}>
                {isRTL ? 'دعوة مريض' : 'Invite a Patient'}
              </Text>
              <Text style={[s.cardSub, isRTL && s.right]}>
                {isRTL
                  ? 'أدخل البريد الإلكتروني للمريض لمتابعة أدويته'
                  : "Enter patient's email to follow their medication"}
              </Text>
              <View style={s.inviteRow}>
                <TextInput
                  style={[s.inviteInput, isRTL && s.right]}
                  placeholder={isRTL ? 'البريد الإلكتروني' : 'patient@email.com'}
                  placeholderTextColor="#475569"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textAlign={isRTL ? 'right' : 'left'}
                  accessibilityLabel="invite-email-input"
                />
                <TouchableOpacity
                  style={[s.inviteBtn, inviting && { opacity: 0.6 }]}
                  onPress={sendInvite}
                  disabled={inviting}
                  accessibilityLabel="send-invite-button"
                >
                  {inviting
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={s.inviteBtnText}>{isRTL ? 'إرسال' : 'Send'}</Text>}
                </TouchableOpacity>
              </View>
            </View>

            {/* Patient list */}
            <Text style={[s.sectionTitle, isRTL && s.right]}>
              {isRTL ? `مرضاي (${patients.length})` : `My Patients (${patients.length})`}
            </Text>

            {patients.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyEmoji}>👥</Text>
                <Text style={s.emptyText}>
                  {isRTL ? 'لا يوجد مرضى بعد. أرسل دعوة!' : 'No patients yet. Send an invite!'}
                </Text>
              </View>
            ) : (
              patients.map((item) => (
                <View key={item.linkId} style={s.personCard}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{item.patient.name?.[0]?.toUpperCase() ?? '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.personName, isRTL && s.right]}>{item.patient.name}</Text>
                    <Text style={[s.personEmail, isRTL && s.right]}>{item.patient.email}</Text>
                  </View>
                  <View style={s.accepted}>
                    <Text style={s.acceptedText}>✓</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── PATIENT TAB ── */}
        {tab === 'patient' && (
          <>
            {/* Pending invites */}
            {pending.length > 0 && (
              <>
                <Text style={[s.sectionTitle, isRTL && s.right]}>
                  {isRTL ? `دعوات في الانتظار (${pending.length})` : `Pending Invites (${pending.length})`}
                </Text>
                {pending.map((inv) => (
                  <View key={inv.id} style={[s.pendingCard]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.personName, isRTL && s.right]}>{inv.caregiver.name}</Text>
                      <Text style={[s.personEmail, isRTL && s.right]}>{inv.caregiver.email}</Text>
                      <Text style={s.pendingSub}>
                        {isRTL ? 'يريد متابعة أدويتك' : 'wants to follow your medications'}
                      </Text>
                    </View>
                    <View style={s.pendingActions}>
                      <TouchableOpacity
                        style={s.acceptBtn}
                        onPress={() => accept(inv.id)}
                        accessibilityLabel={`accept-${inv.id}`}
                      >
                        <Text style={s.acceptBtnText}>{isRTL ? 'قبول' : 'Accept'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.rejectBtn}
                        onPress={() => reject(inv.id)}
                        accessibilityLabel={`reject-${inv.id}`}
                      >
                        <Text style={s.rejectBtnText}>{isRTL ? 'رفض' : 'Reject'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Accepted caregivers */}
            <Text style={[s.sectionTitle, isRTL && s.right]}>
              {isRTL ? `من يتابعني (${caregivers.length})` : `My Caregivers (${caregivers.length})`}
            </Text>

            {caregivers.length === 0 && pending.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyEmoji}>🔒</Text>
                <Text style={s.emptyText}>
                  {isRTL
                    ? 'لا يتابعك أحد بعد. شارك بريدك الإلكتروني مع مقدم الرعاية.'
                    : 'No one following you yet.\nShare your email with a caregiver.'}
                </Text>
              </View>
            ) : (
              caregivers.map((item) => (
                <View key={item.linkId} style={s.personCard}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{item.caregiver.name?.[0]?.toUpperCase() ?? '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.personName, isRTL && s.right]}>{item.caregiver.name}</Text>
                    <Text style={[s.personEmail, isRTL && s.right]}>{item.caregiver.email}</Text>
                  </View>
                  <View style={s.accepted}>
                    <Text style={s.acceptedText}>✓</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  right: { textAlign: 'right' },

  tabs: {
    flexDirection: 'row', backgroundColor: '#1e293b',
    paddingHorizontal: 16, paddingBottom: 12, gap: 8,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', backgroundColor: '#0f172a',
    borderWidth: 1, borderColor: '#334155',
  },
  tabActive: { backgroundColor: '#312e81', borderColor: '#6366f1' },
  tabText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#c7d2fe' },

  scroll: { flex: 1, padding: 16 },

  card: {
    backgroundColor: '#1e293b', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#334155',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  inviteRow: { flexDirection: 'row', gap: 8 },
  inviteInput: {
    flex: 1, backgroundColor: '#0f172a', color: '#f1f5f9',
    borderRadius: 10, padding: 12, fontSize: 14,
    borderWidth: 1, borderColor: '#334155',
  },
  inviteBtn: {
    backgroundColor: '#6366f1', borderRadius: 10,
    paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center',
  },
  inviteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: '#6366f1',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 10, marginTop: 8,
  },

  empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  personCard: {
    backgroundColor: '#1e293b', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#334155',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#312e81', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#c7d2fe', fontWeight: '800', fontSize: 18 },
  personName: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  personEmail: { fontSize: 12, color: '#64748b', marginTop: 2 },
  accepted: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#064e3b', justifyContent: 'center', alignItems: 'center',
  },
  acceptedText: { color: '#6ee7b7', fontWeight: '800' },

  pendingCard: {
    backgroundColor: '#1e293b', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#f59e0b',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  pendingSub: { fontSize: 12, color: '#f59e0b', marginTop: 2, fontStyle: 'italic' },
  pendingActions: { gap: 6 },
  acceptBtn: {
    backgroundColor: '#059669', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  rejectBtn: {
    backgroundColor: '#450a0a', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#dc2626',
  },
  rejectBtnText: { color: '#fca5a5', fontWeight: '700', fontSize: 13 },
});
