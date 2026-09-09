import { useEffect, useState } from 'react';
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
import { api, API_BASE_URL } from '@/lib/api';
import Colors from '@/constants/Colors';
import { categoryVisual } from '@/constants/categoryImages';

type Category = { id: string | number; name: string; icon?: string | null };

const PRIMARY = Colors.light.primary;
const PRIMARY_D = '#333D24';

const ROLES = [
  { value: 'maman' as const, label: 'Client' },
  { value: 'artisan' as const, label: 'Prestataire' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { user, loading: authLoading, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]['value']>('maman');
  const [secure, setSecure] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    api
      .get<{ categories?: Category[] }>('/categories')
      .then(({ data }) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  const toggleCategory = (id: string | number) => {
    const key = String(id);
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  if (!authLoading && user) return <Redirect href="/(tabs)" />;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        role,
        category_ids: role === 'artisan' && selectedCategories.length ? selectedCategories : undefined,
      });
      router.replace('/(tabs)');
    } catch (e: unknown) {
      type AxiosLike = {
        code?: string;
        message?: string;
        response?: { data?: { message?: string; errors?: Record<string, string[] | string> } };
      };
      const err = e as AxiosLike;
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError(
          `Impossible de joindre l’API (${API_BASE_URL}). Pour l’émulateur Android utilisez souvent EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api dans mobile/.env puis redémarrez Expo (npx expo start -c).`
        );
      } else {
        const msg = err.response?.data?.message;
        const flat = err.response?.data?.errors;
        let extra = '';
        if (flat && typeof flat === 'object') {
          const first = Object.entries(flat).find(([_, v]) => v != null);
          if (first) {
            const val = Array.isArray(first[1]) ? first[1][0] : String(first[1]);
            extra = val ? `\n(${first[0]}: ${val})` : '';
          }
        }
        setError((msg || 'Inscription impossible.') + extra);
      }
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
        style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 24 }}>
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

          <Text style={styles.h1}>Créer un compte</Text>
          <Text style={styles.lead}>
            Client ou prestataire : même compte gratuit qu&apos;en ligne. Les prestataires complètent leurs pièces
            d&apos;identité sur le navigateur après l&apos;inscription.
          </Text>

          <Image
            source={require('@/assets/images/hero-nafissa.jpg')}
            style={styles.heroImg}
            resizeMode="cover"
          />

          <View style={styles.card}>
            {error ? (
              <View style={styles.banner}>
                <Ionicons name="alert-circle" size={20} color={Colors.light.danger} />
                <Text style={styles.bannerText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.miniLabel}>Je suis…</Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <Pressable
                  key={r.value}
                  onPress={() => setRole(r.value)}
                  style={[styles.roleChip, role === r.value && styles.roleChipActive]}>
                  <Text style={[styles.roleChipTxt, role === r.value && styles.roleChipTxtActive]}>{r.label}</Text>
                </Pressable>
              ))}
            </View>

            {role === 'artisan' ? (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.miniLabel}>Quels services proposez-vous ?</Text>
                <Text style={styles.sectionHint}>
                  Choisissez une ou plusieurs catégories. Vous fixerez les prix après validation de votre compte.
                </Text>
                <View style={styles.chipsWrap}>
                  {categories.map((cat) => {
                    const active = selectedCategories.includes(String(cat.id));
                    const visual = categoryVisual(cat);
                    return (
                      <Pressable
                        key={String(cat.id)}
                        onPress={() => toggleCategory(cat.id)}
                        style={[styles.catChip, active && styles.catChipActive]}>
                        <Text style={styles.catEmoji}>{visual.emoji}</Text>
                        <Text style={[styles.catChipTxt, active && styles.catChipTxtActive]} numberOfLines={1}>
                          {cat.name}
                        </Text>
                        {active ? <Ionicons name="checkmark-circle" size={16} color={Colors.light.secondary} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <Text style={styles.label}>Nom complet</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Votre nom"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder="vous@email.com"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={styles.label}>Téléphone (recommandé)</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholder="+221 …"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={styles.label}>Adresse (facultatif)</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="location-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Ville / quartier"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={styles.label}>Mot de passe (min. 8)</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={secure}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
              />
              <Pressable onPress={() => setSecure((s) => !s)} hitSlop={10}>
                <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.light.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.label}>Confirmation</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={secure}
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                placeholder="Confirmez le mot de passe"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Pressable style={[styles.cta, busy && styles.ctaDisabled]} onPress={submit} disabled={busy}>
              <Text style={styles.ctaSecondaryText}>{busy ? 'Création…' : 'Créer mon compte'}</Text>
              {!busy ? <Ionicons name="checkmark-circle" size={18} color="#fff" /> : null}
            </Pressable>
          </View>

          <View style={{ marginTop: 24 }}>
            <Link href="/login" asChild>
              <Pressable>
                <Text style={styles.footer}>
                  Déjà un compte ? <Text style={styles.footerLink}>Se connecter</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PRIMARY_D },
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
  h1: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
    maxWidth: 360,
  },
  heroImg: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 22,
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
    marginBottom: 16,
  },
  bannerText: { flex: 1, color: Colors.light.danger, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  miniLabel: { fontSize: 12, fontWeight: '700', color: Colors.light.text, marginBottom: 8 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: '#f8fafc',
  },
  roleChipActive: { borderColor: PRIMARY, backgroundColor: '#ECEDE3' },
  roleChipTxt: { fontSize: 13, fontWeight: '600', color: Colors.light.textMuted },
  roleChipTxtActive: { color: PRIMARY },
  sectionHint: { fontSize: 12, color: Colors.light.textMuted, lineHeight: 18, marginBottom: 10 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: '#f8fafc',
  },
  catChipActive: { borderColor: Colors.light.secondary, backgroundColor: '#F2E9D6' },
  catEmoji: { fontSize: 15 },
  catChipTxt: { fontSize: 13, fontWeight: '600', color: Colors.light.textMuted, maxWidth: 130 },
  catChipTxtActive: { color: Colors.light.secondary },
  label: { fontSize: 13, fontWeight: '600', color: Colors.light.text, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    marginBottom: 14,
    minHeight: 48,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 11, fontSize: 15, color: Colors.light.text },
  cta: {
    marginTop: 8,
    backgroundColor: Colors.light.secondary,
    borderRadius: 14,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.light.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaSecondaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  footerLink: { color: '#E7DCC0', fontWeight: '800', textDecorationLine: 'underline' },
});
