import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';

type BookingDetail = {
  id: string | number;
  status: string;
  booking_date: string;
  booking_time: string;
  total_price: string | number;
  notes?: string | null;
  service?: {
    title?: string;
    description?: string | null;
    category?: { name?: string };
  };
  provider?: { name?: string };
  client?: { name?: string };
};

export default function BookingDetailScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<{ booking: BookingDetail }>(`/bookings/${id}`);
      setBooking(data.booking);
      const title = data.booking.service?.title;
      navigation.setOptions({ title: title ? title.slice(0, 42) : 'Réservation' });
    } catch {
      setError('Impossible de charger cette réservation.');
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} size="large" />
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: Colors.light.danger }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <View style={styles.card}>
        <Text style={styles.label}>Statut</Text>
        <Text style={styles.status}>{booking.status}</Text>
        <Divider />
        <Text style={styles.label}>Date & heure</Text>
        <Text style={styles.value}>
          {booking.booking_date} à {booking.booking_time}
        </Text>
        <Divider />
        <Text style={styles.label}>Montant</Text>
        <Text style={styles.amount}>{Number(booking.total_price).toLocaleString('fr-FR')} FCFA</Text>
      </View>

      <Text style={styles.section}>Service</Text>
      <View style={styles.card}>
        <Text style={styles.value}>{booking.service?.title ?? '—'}</Text>
        {booking.service?.category?.name ? (
          <Text style={styles.small}>Catégorie : {booking.service.category.name}</Text>
        ) : null}
        {booking.service?.description ? (
          <Text style={styles.desc}>{booking.service.description}</Text>
        ) : null}
      </View>

      <Text style={styles.section}>Intervenants</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Cliente</Text>
        <Text style={styles.value}>{booking.client?.name ?? '—'}</Text>
        <Divider />
        <Text style={styles.label}>Prestataire</Text>
        <Text style={styles.value}>{booking.provider?.name ?? 'À attribuer'}</Text>
      </View>

      {booking.notes ? (
        <>
          <Text style={styles.section}>Notes</Text>
          <View style={styles.card}>
            <Text style={styles.desc}>{booking.notes}</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function Divider() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  section: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: '600', color: Colors.light.textMuted, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '700', color: Colors.light.text, lineHeight: 22 },
  status: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  amount: { fontSize: 22, fontWeight: '900', color: Colors.light.secondary, marginBottom: 0 },
  small: { marginTop: 8, fontSize: 13, color: Colors.light.textMuted },
  desc: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.textMuted,
    lineHeight: 21,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.border,
    marginVertical: 14,
  },
});
