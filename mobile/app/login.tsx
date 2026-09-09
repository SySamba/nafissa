import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const looksPhone = /^[+\d]/.test(identifier.trim()) && !identifier.trim().includes('@');

  if (!authLoading && user) return <Redirect href="/(tabs)" />;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await login({ login: identifier.trim(), password });
      router.replace('/(tabs)');
    } catch (e: unknown) {
      type AxiosLike = { code?: string; message?: string; response?: { data?: { message?: string } } };
      const err = e as AxiosLike;
      const fallback =
        err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? `Serveur inaccessible. URL configurée : ${API_BASE_URL}. Sur émulateur Android essayez dans mobile/.env : EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api puis npx expo start -c`
          : 'Erreur de connexion.';
      setError(err.response?.data?.message || fallback);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Link href="/" asChild>
            <Pressable style={styles.backHome} hitSlop={10}>
              <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.backHomeTxt}>Retour à l&apos;accueil</Text>
            </Pressable>
          </Link>

          <Image
            source={require('@/assets/images/logo-nafissa.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />

          <Text style={styles.h1}>Connexion</Text>
          <Text style={styles.lead}>
            Utilisez l&apos;e-mail créé lors de l&apos;inscription ou le téléphone renseigné sur votre profil web.
          </Text>

          <View style={styles.card}>
            {error ? (
              <View style={styles.banner}>
                <Ionicons name="alert-circle" size={20} color={Colors.light.danger} />
                <Text style={styles.bannerText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>E-mail ou numéro de téléphone</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name={looksPhone ? 'call-outline' : 'mail-outline'}
                size={18}
                color={Colors.light.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                keyboardType={looksPhone ? 'phone-pad' : 'email-address'}
                placeholder="vous@email.com ou +221 …"
                placeholderTextColor="#94a3b8"
                value={identifier}
                onChangeText={(t) => {
                  setIdentifier(t);
                  setError(null);
                }}
              />
            </View>

            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={secure}
                autoComplete="password"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError(null);
                }}
              />
              <Pressable
                onPress={() => setSecure((s) => !s)}
                hitSlop={10}
                accessibilityLabel={secure ? 'Afficher le mot de passe' : 'Masquer'}>
                <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.light.textMuted} />
              </Pressable>
            </View>

            <Pressable style={[styles.cta, busy && styles.ctaDisabled]} onPress={submit} disabled={busy}>
              <Text style={styles.ctaText}>{busy ? 'Connexion…' : 'Se connecter'}</Text>
              {!busy ? <Ionicons name="arrow-forward" size={18} color="#fff" /> : null}
            </Pressable>
          </View>

          <Link href="/register" asChild>
            <Pressable style={{ marginBottom: 12 }}>
              <Text style={styles.footer}>
                Pas de compte ? <Text style={styles.footerCta}>S&apos;inscrire</Text>
              </Text>
            </Pressable>
          </Link>
          <Text style={styles.hint}>Même mot de passe web & mobile — saisissez le même identifiant que sur votre compte.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const PRIMARY = Colors.light.primary;
const PRIMARY_D = '#333D24';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PRIMARY_D,
  },
  blob1: {
    position: 'absolute',
    top: '-12%',
    right: '-25%',
    width: 340,
    height: 340,
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  blob2: {
    position: 'absolute',
    bottom: '5%',
    left: '-18%',
    width: 260,
    height: 260,
    borderRadius: 160,
    backgroundColor: 'rgba(201,161,90,0.25)',
  },
  brandLogo: { width: 140, height: 140, borderRadius: 32, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.95)' },
  backHome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 6,
  },
  backHomeTxt: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  footerCta: {
    color: '#E7DCC0',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 28,
    maxWidth: 340,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e8eef5',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 18,
  },
  bannerText: {
    flex: 1,
    color: Colors.light.danger,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    marginBottom: 16,
    minHeight: 50,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  cta: {
    marginTop: 8,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  hint: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
});
