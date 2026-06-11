import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { api } from '../api/client';

export default function Home() {
  const [medicines, setMedicines] = useState<any[]>([]);

  const load = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      console.log('Load failed', err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function takeMedicine(id: string) {
    try {
      const res = await api.post(`/medicines/${id}/take`);
      return res.data;
    } catch (err) {
      console.log('Take failed', err);
    }
  }

  return (
    <ScrollView style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        My Medicines
      </Text>

      {medicines.map((item) => (
        <View
          key={item.id}
          style={{
            padding: 12,
            marginBottom: 10,
            borderWidth: 1,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>{item.name}</Text>
          <Text>Remaining: {item.quantity}</Text>
          <Text>Times: {item.scheduleTimes?.join(', ')}</Text>

          <TouchableOpacity
            onPress={async () => {
              const updated = await takeMedicine(item.id);
              if (!updated) return;

              setMedicines((prev) =>
                prev.map((m) =>
                  m.id === updated.id ? updated : m
                )
              );
            }}
            style={{
              backgroundColor: 'green',
              padding: 10,
              marginTop: 8,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: 'white' }}>Take</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}