import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { api } from '../api/client';

export default function Home() {
  const [medicines, setMedicines] = useState([]);

  const load = async () => {
    const res = await api.get('/medicines');
    setMedicines(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 22 }}>My Medicines</Text>

      <FlatList
        data={medicines}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            <Text>Quantity: {item.quantity}</Text>
            <Text>Times: {item.scheduleTimes.join(', ')}</Text>
          </View>
        )}
      />
    </View>
  );
}