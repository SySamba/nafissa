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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { api } from '@/lib/api';
import Colors from '@/constants/Colors';

type NotificationRow = {
  id: string | number;
  type: string;
  title: string;
  message: string;
  read?: boolean;
  is_read?: boolean;
  action_link?: string | null;
  created_at?: string;
};

type LaravelPaged<T> = { data: T[]; last_page?: number };

const TYPE_ICON: Record<string, { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }> = {
  booking: { icon: 'calendar', bg: '#ECEDE3', fg: Colors.light.primary },
  payment: { icon: 'card', bg: '#DCFCE7', fg: Colors.light.secondary },
  reminder: { icon: 'alarm', bg: '#FEF3C7', fg: '#B45309' },
  dispute: { icon: 'warning', bg: '#FEE2E2', fg: Colors.light.danger },
  account: { icon: 'person', bg: '#ECEDE3', fg: Colors.light.primary },
};

function isRead(n: NotificationRow) {
  return Boolean(n.read ?? n.is_read);
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [list, setList] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<LaravelPaged<NotificationRow>>('/notifications');
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

  const markRead = async (id: string | number) => {
    setList((prev) => prev.map((n) => (String(n.id) === String(id) ? { ...n, read: true, is_read: true } : n)));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    setList((prev) => prev.map((n) => ({ ...n, read: true, is_read: true })));
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // ignore
    }
  };

  const onPressItem = (n: NotificationRow) => {
    if (!isRead(n)) markRead(n.id);
    const link = n.action_link?.trim();
    if (link && link.startsWith('/bookings/')) {
      const bid = link.split('/').pop();
      if (bid) router.push(`/booking/${bid}`);
    }
  };

  const unread = list.filter((n) => !isRead(n)).length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={list}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={list.length === 0 ? styles.emptyContainer : styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />}
      ListHeaderComponent={
        list.length > 0 && unread > 0 ? (
          <View style={styles.headerRow}>
            <Text style={styles.headerCount}>{unread} non lue{unread > 1 ? 's' : ''}</Text>
            <TouchableOpacity onPress={markAllRead}>
              <Text style={styles.markAll}>Tout marquer comme lu</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Ionicons name="notifications-off-outline" size={42} color={Colors.light.border} />
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptySub}>Vous serez prévenu(e) des événements importants ici.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const cfg = TYPE_ICON[item.type] ?? TYPE_ICON.account;
        const read = isRead(item);
        return (
          <TouchableOpacity
            style={[styles.row, !read && styles.rowUnread]}
            activeOpacity={0.7}
            onPress={() => onPressItem(item)}>
            <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={18} color={cfg.fg} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !read && styles.titleUnread]} numberOfLines={2}>
                  {item.title}
                </Text>
                {!read ? <View style={styles.dot} /> : null}
              </View>
              <Text style={styles.message}>{item.message}</Text>
              {item.created_at ? (
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              ) : null}
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
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerCount: { fontSize: 13, fontWeight: '700', color: Colors.light.textMuted },
  markAll: { fontSize: 13, fontWeight: '700', color: Colors.light.primary },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 14,
    marginBottom: 10,
  },
  rowUnread: { backgroundColor: '#F1F6FE', borderColor: '#D9E6FB' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.light.text, lineHeight: 19 },
  titleUnread: { fontWeight: '800' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.light.primary, marginTop: 5 },
  message: { marginTop: 3, fontSize: 13, color: Colors.light.textMuted, lineHeight: 19 },
  date: { marginTop: 6, fontSize: 11, color: Colors.light.textMuted },
  emptyBox: { alignItems: 'center' },
  emptyTitle: { marginTop: 14, fontSize: 17, fontWeight: '700', color: Colors.light.text },
  emptySub: { marginTop: 8, fontSize: 14, color: Colors.light.textMuted, textAlign: 'center', lineHeight: 21 },
});
