import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';
import { categoryVisual } from '@/constants/categoryImages';

type ServiceDetail = {
  id: string | number;
  title: string;
  description?: string | null;
  price: string | number;
  location?: string | null;
  category?: { name?: string; icon?: string | null };
  provider?: { name?: string };
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { isMaman } = useAuth();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<{ service: ServiceDetail }>(`/services/${id}`);
      setService(data.service);
      if (data.service.location) setLocation(data.service.location);
      navigation.setOptions({
        title: data.service.title ? data.service.title.slice(0, 40) : 'Service',
      });
    } catch {
      setError('Impossible de charger ce service.');
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const validate = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Date invalide. Format attendu : AAAA-MM-JJ.';
    if (!/^\d{2}:\d{2}$/.test(time)) return 'Heure invalide. Format attendu : HH:MM.';
    const chosen = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosen < today) return "La date doit être aujourd'hui ou ultérieure.";
    return null;
  };

  const submit = async () => {
    const v = validate();
    if (v) {
      Alert.alert('Vérifiez votre demande', v);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        service_id: Number(id),
        booking_date: date,
        booking_time: time,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      Alert.alert(
        'Demande envoyée',
        "Votre demande a bien été envoyée. L'administrateur va attribuer un prestataire.",
        [{ text: 'Voir mes réservations', onPress: () => router.replace('/(tabs)/bookings') }],
      );
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Une erreur est survenue. Réessayez.';
      Alert.alert('Erreur', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} size="large" />
      </View>
    );
  }

  if (error || !service) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: Colors.light.danger }}>{error}</Text>
      </View>
    );
  }

  const visual = categoryVisual(service.category);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={[styles.hero, { backgroundColor: visual.colors[0] }]}>
          {visual.image ? (
            <Image source={visual.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
          <View style={styles.heroShade} />
          <View style={styles.heroContent}>
            {service.category?.name ? (
              <Text style={styles.heroCat}>{service.category.name}</Text>
            ) : null}
            <Text style={styles.heroTitle}>{service.title}</Text>
            <Text style={styles.heroPrice}>
              {Number(service.price).toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {service.provider?.name ? (
            <View style={styles.metaRow}>
              <Ionicons name="person-circle-outline" size={18} color={Colors.light.textMuted} />
              <Text style={styles.metaTxt}>Par {service.provider.name}</Text>
            </View>
          ) : null}
          {service.location ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={18} color={Colors.light.textMuted} />
              <Text style={styles.metaTxt}>{service.location}</Text>
            </View>
          ) : null}
          {service.description ? (
            <Text style={styles.desc}>{service.description}</Text>
          ) : null}

          {isMaman ? (
            <>
              <Text style={styles.section}>Demander ce service</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Date souhaitée</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.light.textMuted} />
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Heure souhaitée</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="time-outline" size={18} color={Colors.light.textMuted} />
                  <TextInput
                    value={time}
                    onChangeText={setTime}
                    placeholder="HH:MM"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Adresse d&apos;intervention</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="home-outline" size={18} color={Colors.light.textMuted} />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Votre adresse"
                    placeholderTextColor="#94a3b8"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Détail du besoin (optionnel)</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Décrivez ce dont vous avez besoin…"
                  placeholderTextColor="#94a3b8"
                  style={[styles.input, styles.textarea]}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[styles.cta, submitting && { opacity: 0.6 }]}
                onPress={submit}
                disabled={submitting}
                activeOpacity={0.85}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                    <Text style={styles.ctaTxt}>Envoyer ma demande</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.note}>
                Votre demande sera étudiée par notre équipe qui attribuera un prestataire vérifié.
              </Text>
            </>
          ) : (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.light.primary} />
              <Text style={styles.infoTxt}>
                Seuls les comptes clients peuvent demander un service.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background },
  screen: { flex: 1, backgroundColor: Colors.light.background },
  hero: { height: 200, justifyContent: 'flex-end', position: 'relative' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  heroContent: { padding: 18 },
  heroCat: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.9,
    marginBottom: 6,
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 28 },
  heroPrice: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 8 },
  body: { padding: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metaTxt: { fontSize: 14, color: Colors.light.textMuted, flex: 1 },
  desc: { marginTop: 8, fontSize: 14, color: Colors.light.text, lineHeight: 22 },
  section: {
    marginTop: 26,
    marginBottom: 14,
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.text,
  },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.light.text, marginBottom: 7 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, color: Colors.light.text, paddingVertical: 13 },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cta: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 16,
  },
  ctaTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  note: { marginTop: 12, fontSize: 12, color: Colors.light.textMuted, lineHeight: 18, textAlign: 'center' },
  infoBox: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#ECEDE3',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  infoTxt: { flex: 1, fontSize: 13, color: Colors.light.primary, fontWeight: '600', lineHeight: 19 },
});
