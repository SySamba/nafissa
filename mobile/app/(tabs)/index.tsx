import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';

const STATUS: Record<
  string,
  { label: string; bg: string; fg: string }
> = {
  en_attente_admin: { label: 'En attente admin', bg: '#FEF9C3', fg: '#854D0E' },
  en_attente_prestataire: { label: 'En attente prestataire', bg: '#FFEDD5', fg: '#9A3412' },
  acceptee: { label: 'Acceptée', bg: '#DBEAFE', fg: '#1E40AF' },
  refusee: { label: 'Refusée', bg: '#FEE2E2', fg: '#B91C1C' },
  payee: { label: 'Payée', bg: '#F3E8FF', fg: '#6B21A8' },
  en_cours: { label: 'En cours', bg: '#E8EEF9', fg: Colors.light.primary },
  terminee: { label: 'Terminée', bg: '#DCFCE7', fg: Colors.light.secondary },
  annulee: { label: 'Annulée', bg: '#FEE2E2', fg: '#B91C1C' },
};

export default function HomeTab() {
  const router = useRouter();
  const { user, isMaman, isPrestataire } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [stats, setStats] = useState({ bookings: 0, payments: 0, services: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [bk, pay] = await Promise.all([
        api.get<LaravelPaged<BookingRow>>('/bookings', { params: { per_page: 5 } }),
        api.get<LaravelPaged<unknown>>('/payments/history', { params: { per_page: 1 } }),
      ]);
      const list = bk.data.data ?? [];
      setBookings(list);
      setStats((prev) => ({
        ...prev,
        bookings: bk.data.total ?? list.length,
        payments: pay.data.total ?? 0,
      }));
      if (isPrestataire) {
        const mine = await api.get<{ services?: unknown[] }>('/my-services');
        const n = mine.data.services?.length ?? 0;
        setStats((s) => ({ ...s, services: n }));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isPrestataire]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} size="large" />
      </View>
    );
  }

  const verifiedNote = user?.verified === false && isPrestataire;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />}>
      <WelcomeHero name={user?.name ?? ''} role={user?.role} />

      {verifiedNote ? (
        <View style={styles.banner}>
          <Ionicons name="time-outline" size={22} color="#854D0E" />
          <Text style={styles.bannerText}>
            Votre compte est en attente de validation par un administrateur.
          </Text>
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <StatCard icon="calendar-outline" label="Réservations" value={String(stats.bookings)} />
        {isPrestataire ? (
          <StatCard icon="briefcase-outline" label="Mes services" value={String(stats.services)} />
        ) : null}
        <StatCard icon="wallet-outline" label="Paiements" value={String(stats.payments)} />
      </View>

      <Text style={styles.sectionTitle}>Raccourcis</Text>
      <View style={styles.actions}>
        {isMaman ? (
          <ActionRow
            title="Trouver un service"
            subtitle="Parcourir les offres disponibles"
            icon="search"
            accent={Colors.light.primary}
            onPress={() => router.push('/services')}
          />
        ) : null}
        <ActionRow
          title={isPrestataire ? 'Mes services & offres' : 'Voir les services'}
          subtitle={isPrestataire ? 'Ajuster prix et disponibilités' : 'Liste des prestataires vérifiés'}
          icon="grid-outline"
          accent={Colors.light.secondary}
          onPress={() => router.push('/services')}
        />
        <ActionRow
          title="Réservations"
          subtitle="Suivi des missions et statuts"
          icon="calendar"
          accent={Colors.light.primary}
          onPress={() => router.push('/bookings')}
          last
        />
      </View>

      {bookings.length > 0 ? (
        <>
          <View style={[styles.sectionHead, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>Récentes</Text>
            <TouchableOpacity onPress={() => router.push('/bookings')}>
              <Text style={styles.link}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardList}>
            {bookings.map((b) => {
              const st = STATUS[b.status] ?? STATUS.en_attente_admin;
              return (
                <TouchableOpacity
                  key={String(b.id)}
                  style={styles.bookingRow}
                  onPress={() => router.push(`/booking/${b.id}`)}
                  activeOpacity={0.7}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={styles.bTitle}>
                      {b.service?.title ?? 'Service'}
                    </Text>
                    <Text style={styles.bMeta}>
                      {b.booking_date} · {b.booking_time}
                    </Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.pillText, { color: st.fg }]}>{st.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function WelcomeHero({ name, role }: { name: string; role?: string }) {
  const roleLabel =
    role === 'maman'
      ? 'Cliente'
      : role === 'etudiant'
        ? 'Étudiant'
        : role === 'artisan'
          ? 'Artisan'
          : role === 'admin'
            ? 'Administrateur'
            : '';
  return (
    <View style={styles.hero}>
      <View>
        <Text style={styles.heroHi}>Bonjour,</Text>
        <Text style={styles.heroName}>{name || '—'}</Text>
        {roleLabel ? <Text style={styles.heroRole}>{roleLabel}</Text> : null}
      </View>
      <View style={styles.heroBadge}>
        <Ionicons name="shield-checkmark" size={18} color="#fff" />
      </View>
    </View>
  );
}

function StatCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={Colors.light.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionRow({
  title,
  subtitle,
  icon,
  accent,
  onPress,
  last,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionRow, last && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.65}>
      <View style={[styles.actionIcon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
    </TouchableOpacity>
  );
}

type LaravelPaged<T> = {
  data: T[];
  total?: number;
  last_page?: number;
};

type BookingRow = {
  id: string | number;
  status: string;
  booking_date: string;
  booking_time: string;
  service?: { title?: string };
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.light.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background },
  hero: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 22,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 8,
  },
  heroHi: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '500' },
  heroName: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4, letterSpacing: -0.4 },
  heroRole: { color: 'rgba(255,255,255,0.75)', marginTop: 6, fontSize: 13, fontWeight: '500' },
  heroBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  bannerText: { flex: 1, color: '#713F12', fontSize: 13, lineHeight: 19, fontWeight: '500' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'flex-start',
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.light.text },
  statLabel: { fontSize: 11, color: Colors.light.textMuted, fontWeight: '600' },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 22,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 22,
  },
  link: { color: Colors.light.primary, fontWeight: '700', fontSize: 14 },
  actions: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
    gap: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  actionSub: { fontSize: 12, color: Colors.light.textMuted, marginTop: 2 },
  cardList: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
    gap: 12,
  },
  bTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  bMeta: { fontSize: 12, color: Colors.light.textMuted, marginTop: 3 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: '700' },
});
