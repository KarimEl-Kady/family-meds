/**
 * TimePicker component
 * Lets users add/remove HH:MM time chips.
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface Props {
  value: string[];
  onChange: (times: string[]) => void;
  addLabel?: string;
}

export function TimePicker({ value, onChange, addLabel = 'Add Time' }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [hh, setHh] = useState('');
  const [mm, setMm] = useState('');
  const [err, setErr] = useState('');

  const confirm = () => {
    const h = parseInt(hh, 10);
    const m = parseInt(mm, 10);
    if (isNaN(h) || h < 0 || h > 23) { setErr('Hours: 0–23'); return; }
    if (isNaN(m) || m < 0 || m > 59) { setErr('Minutes: 0–59'); return; }
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (value.includes(time)) { setErr('Already added'); return; }
    onChange([...value, time].sort());
    setHh(''); setMm(''); setErr(''); setShowForm(false);
  };

  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  return (
    <View>
      {/* Chips */}
      <View style={s.chips}>
        {value.map((t) => (
          <View key={t} style={s.chip}>
            <Text style={s.chipText}>{t}</Text>
            <TouchableOpacity onPress={() => remove(t)} hitSlop={8}>
              <Text style={s.chipX}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={s.addChip}
          onPress={() => { setShowForm(!showForm); setErr(''); }}
          accessibilityLabel="add-time-button"
        >
          <Text style={s.addChipText}>+ {addLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Inline form */}
      {showForm && (
        <View style={s.form}>
          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.colLabel}>HH</Text>
              <TextInput
                style={s.inp}
                value={hh}
                onChangeText={(v) => { setHh(v.replace(/\D/g, '').slice(0, 2)); setErr(''); }}
                placeholder="08"
                placeholderTextColor="#475569"
                keyboardType="number-pad"
                maxLength={2}
                accessibilityLabel="hour-input"
              />
            </View>
            <Text style={s.colon}>:</Text>
            <View style={s.col}>
              <Text style={s.colLabel}>MM</Text>
              <TextInput
                style={s.inp}
                value={mm}
                onChangeText={(v) => { setMm(v.replace(/\D/g, '').slice(0, 2)); setErr(''); }}
                placeholder="00"
                placeholderTextColor="#475569"
                keyboardType="number-pad"
                maxLength={2}
                accessibilityLabel="minute-input"
              />
            </View>
            <TouchableOpacity style={s.confirmBtn} onPress={confirm} accessibilityLabel="confirm-time">
              <Text style={s.confirmText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => { setShowForm(false); setErr(''); setHh(''); setMm(''); }}
            >
              <Text style={s.cancelText}>✕</Text>
            </TouchableOpacity>
          </View>
          {err ? <Text style={s.err}>{err}</Text> : null}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#312e81',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 6,
  },
  chipText: { color: '#c7d2fe', fontWeight: '700', fontSize: 14 },
  chipX: { color: '#818cf8', fontSize: 13, fontWeight: '700' },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderStyle: 'dashed',
  },
  addChipText: { color: '#818cf8', fontWeight: '600', fontSize: 14 },
  form: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  col: { alignItems: 'center' },
  colLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  inp: {
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    borderRadius: 8,
    padding: 10,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    width: 56,
    borderWidth: 1,
    borderColor: '#334155',
  },
  colon: { color: '#6366f1', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  confirmBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 4,
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cancelText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
  err: { color: '#f87171', fontSize: 12, marginTop: 6 },
});
