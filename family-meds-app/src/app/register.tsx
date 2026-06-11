/**
 * Register Screen
 *
 * Features:
 * - i18n support
 * - Validation (name, email, password)
 * - Loading + error states
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { api } from '../api/client';
import { saveToken } from '../storage/token';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string | null => {
    if (!name.trim()) return t('auth.nameRequired');
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return t('auth.invalidEmail');
    if (password.length < 8) return t('auth.passwordTooShort');
    return null;
  };

  const register = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Register then auto-login
      await api.post('/auth/register', { name, email, password });
      const res = await api.post('/auth/login', { email, password });
      await saveToken(res.data.accessToken);
      router.replace('/home');
    } catch {
      setError(t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>💊</Text>
          <Text style={styles.title}>Family Meds</Text>
          <Text style={styles.subtitle}>{t('auth.register')}</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>{t('auth.name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('auth.namePlaceholder')}
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={(v) => { setName(v); setError(''); }}
            autoCapitalize="words"
            accessibilityLabel="name-input"
          />

          <Text style={styles.label}>{t('auth.email')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="email-input"
          />

          <Text style={styles.label}>{t('auth.password')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(''); }}
            secureTextEntry
            accessibilityLabel="password-input"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={register}
            disabled={loading}
            accessibilityLabel="register-button"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.registerButton')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={() => router.push('/')}
            accessibilityLabel="go-to-login"
          >
            <Text style={styles.linkText}>
              {t('auth.haveAccount')}{' '}
              <Text style={styles.link}>{t('auth.loginButton')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f172a' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 6,
  },
  form: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    gap: 4,
  },
  errorBox: {
    backgroundColor: '#450a0a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  divider: { height: 20 },
  linkText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    color: '#818cf8',
    fontWeight: '700',
  },
});
