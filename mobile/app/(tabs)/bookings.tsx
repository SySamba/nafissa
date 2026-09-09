import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';

type BookingRow = {
  id: string | number;
  status: string;
  booking_date: string;
  booking_time: string;
  total_price: string | number;
  service?: { title?: string };
};

type LaravelPaged<T> = { data: T[]; total?: number };

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  en_attente_admin: { label: 'En attente admin', bg: '#FEF9C3', fg: '#854D0E' },
  en_attente_prestataire: { label: 'Prestataire', bg: '#FFEDD5', fg: '#9A3412' },
  acceptee: { label: 'Acceptée', bg: '#DBEAFE', fg: '#1E40AF' },
  refusee: { label: 'Refusée', bg: '#FEE2E2', fg: '#B91C1C' },
  payee: { label: 'Payée', bg: '#F3E8FF', fg: '#6B21A8' },
  en_cours: { label: 'En cours', bg: '#ECEDE3', fg: Colors.light.primary },
  terminee: { label: 'Terminée', bg: '#DCFCE7', fg: Colors.light.secondary },
  annulee: { label: 'Annulée', bg: '#FEE2E2', fg: '#B91C1C' },
};

export default function BookingsTab() {
  const router = useRouter();
  const { loading: authLoading, isMaman, isPrestataire } = useAuth();
  const [list, setList] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<LaravelPaged<BookingRow>>('/bookings');
      setList(data.data ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const emptyHelp =
    isMaman || isPrestataire
      ? 'Vous n‘avez encore aucune réservation liée à votre compte.'
      : 'Connectez-vous avec un compte cliente ou prestataire.';

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={list}
      keyExtractor={(b) => String(b.id)}
      contentContainerStyle={list.length === 0 ? styles.emptyContainer : styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Aucune réservation</Text>
          <Text style={styles.emptySub}>{emptyHelp}</Text>
        </View>
      }
      renderItem={({ item }) => {
        const st = STATUS[item.status] ?? STATUS.en_attente_admin;
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/booking/${item.id}`)}
            activeOpacity={0.7}>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>{item.service?.title ?? 'Service'}</Text>
              <Text style={styles.dateLine}>
                {item.booking_date} · {item.booking_time}
              </Text>
              <Text style={styles.amount}>{Number(item.total_price).toLocaleString('fr-FR')} FCFA</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: st.bg }]}>
              <Text style={[styles.pillTxt, { color: st.fg }]}>{st.label}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background },
  listContent: { padding: 16, paddingBottom: 40 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  emptyBox: { paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
  emptySub: { marginTop: 10, fontSize: 14, color: Colors.light.textMuted, lineHeight: 21 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 16,
    marginBottom: 12,
  },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  dateLine: { marginTop: 4, fontSize: 13, color: Colors.light.textMuted },
  amount: { marginTop: 8, fontSize: 15, fontWeight: '800', color: Colors.light.primary },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, maxWidth: '38%' },
  pillTxt: { fontSize: 11, fontWeight: '700' },
});
