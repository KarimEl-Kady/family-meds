import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { api } from '../api/client';

export default function DoseLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/dose-logs').then((res) => {
      setLogs(res.data);
    });
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Dose History</Text>

      {logs.map((log: any) => (
        <View key={log.id} style={{ marginTop: 10 }}>
          <Text>{log.medicineName}</Text>
          <Text>{log.quantityTaken} taken</Text>
          <Text>{new Date(log.takenAt).toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
}