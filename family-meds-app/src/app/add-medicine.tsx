import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { api } from '../api/client';
import { TimePicker } from '../components/ui/TimePicker';

export default function AddMedicineScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dosage, setDosage] = useState('1');
  const [unit, setUnit] = useState('tablet');
  const [scheduleTimes, setScheduleTimes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [lowStock, setLowStock] = useState('5');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t('medicines.nameRequired');
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) e.quantity = t('medicines.quantityRequired');
    if (scheduleTimes.length === 0) e.times = t('medicines.timesRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/medicines', {
        name: name.trim(),
        quantity: Number(quantity),
        dosagePerIntake: Number(dosage) || 1,
        unit: unit.trim() || 'tablet',
        scheduleTimes,
        notes: notes.trim() || undefined,
        lowStockThreshold: Number(lowStock) || 5,
      });
      router.replace('/home');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Save failed. Try again.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: string, input: React.ReactNode) => (
    <View style={f.field}>
      <Text style={[f.label, isRTL && f.right]}>{label}</Text>
      {input}
      {errors[key] ? <Text style={f.err}>{errors[key]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={f.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={f.scroll}>
        <Text style={[f.title, isRTL && f.right]}>{t('medicines.addMedicine')}</Text>

        {/* Name */}
        {field(
          `${t('medicines.name')} *`, 'name',
          <TextInput
            style={[f.input, isRTL && f.right, errors.name && f.inputErr]}
            placeholder={t('medicines.namePlaceholder')}
            placeholderTextColor="#475569"
            value={name}
            onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
            textAlign={isRTL ? 'right' : 'left'}
            accessibilityLabel="name-input"
          />,
        )}

        {/* Quantity + Unit */}
        <View style={f.row}>
          <View style={f.half}>
            {field(
              `${t('medicines.quantity')} *`, 'quantity',
              <TextInput
                style={[f.input, errors.quantity && f.inputErr]}
                placeholder="30"
                placeholderTextColor="#475569"
                value={quantity}
                onChangeText={(v) => { setQuantity(v.replace(/\D/g, '')); setErrors((e) => ({ ...e, quantity: '' })); }}
                keyboardType="number-pad"
                accessibilityLabel="quantity-input"
              />,
            )}
          </View>
          <View style={f.half}>
            {field(
              t('medicines.unit'), 'unit',
              <TextInput
                style={f.input}
                placeholder="tablet / ml"
                placeholderTextColor="#475569"
                value={unit}
                onChangeText={setUnit}
                autoCapitalize="none"
                accessibilityLabel="unit-input"
              />,
            )}
          </View>
        </View>

        {/* Dosage + Low Stock */}
        <View style={f.row}>
          <View style={f.half}>
            {field(
              t('medicines.dosage'), 'dosage',
              <TextInput
                style={f.input}
                placeholder="1"
                placeholderTextColor="#475569"
                value={dosage}
                onChangeText={setDosage}
                keyboardType="number-pad"
                accessibilityLabel="dosage-input"
              />,
            )}
          </View>
          <View style={f.half}>
            {field(
              t('medicines.lowStockThreshold'), 'lowStock',
              <TextInput
                style={f.input}
                placeholder="5"
                placeholderTextColor="#475569"
                value={lowStock}
                onChangeText={setLowStock}
                keyboardType="number-pad"
                accessibilityLabel="low-stock-input"
              />,
            )}
          </View>
        </View>

        {/* Schedule Times */}
        <View style={f.field}>
          <Text style={[f.label, isRTL && f.right]}>{t('medicines.times')} *</Text>
          <TimePicker
            value={scheduleTimes}
            onChange={(v) => { setScheduleTimes(v); setErrors((e) => ({ ...e, times: '' })); }}
            addLabel={t('medicines.times')}
          />
          {errors.times ? <Text style={f.err}>{errors.times}</Text> : null}
        </View>

        {/* Notes */}
        {field(
          t('medicines.notes'), 'notes',
          <TextInput
            style={[f.input, f.textarea, isRTL && f.right]}
            placeholder={t('medicines.notesPlaceholder')}
            placeholderTextColor="#475569"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            textAlign={isRTL ? 'right' : 'left'}
            accessibilityLabel="notes-input"
          />,
        )}

        <TouchableOpacity
          style={[f.saveBtn, loading && { opacity: 0.6 }]}
          onPress={save}
          disabled={loading}
          accessibilityLabel="save-medicine-button"
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={f.saveTxt}>{t('medicines.saveMedicine')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const f = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 20 },
  right: { textAlign: 'right' },
  field: { marginBottom: 4 },
  label: {
    color: '#94a3b8', fontSize: 12, fontWeight: '700',
    marginBottom: 6, marginTop: 16,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  input: {
    backgroundColor: '#1e293b', color: '#f1f5f9',
    borderRadius: 12, padding: 14, fontSize: 15,
    borderWidth: 1, borderColor: '#334155',
  },
  inputErr: { borderColor: '#dc2626' },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  err: { color: '#f87171', fontSize: 12, marginTop: 4 },
  saveBtn: {
    backgroundColor: '#6366f1', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 28,
  },
  saveTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
