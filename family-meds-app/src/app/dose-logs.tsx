import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { api } from '../api/client';

export default function DoseLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  const load = async () => {
    try {
      const res = await api.get('/dose-logs');
      setLogs(res.data);
    } catch (err) {
      console.log('Failed to load logs', err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Dose History
      </Text>

      {logs.map((log) => (
        <View
          key={log.id}
          style={{
            padding: 12,
            marginBottom: 10,
            borderWidth: 1,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>
            {log.medicineName}
          </Text>

          <Text>
            Taken: {log.quantityTaken}
          </Text>

          <Text>
            Time: {new Date(log.takenAt).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}