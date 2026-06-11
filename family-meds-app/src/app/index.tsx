import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { api } from '../api/client';
import { saveToken } from '../storage/token';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      await saveToken(res.data.accessToken);

      router.replace('/home');
    } catch (err) {
      console.log('Login failed', err);
    }
  };
  
  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Login
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <Button title="Login" onPress={login} />
    </View>
  );
}