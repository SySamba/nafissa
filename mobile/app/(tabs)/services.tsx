import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';

type ServiceRow = {
  id: string | number;
  title: string;
  description?: string | null;
  price: string | number;
  location?: string | null;
  category?: { name?: string };
  provider?: { name?: string; profile?: unknown };
};

type LaravelPaged<T> = {
  data: T[];
  last_page?: number;
  total?: number;
};

export default function ServicesTab() {
  const { isPrestataire } = useAuth();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      if (isPrestataire) {
        const { data } = await api.get<{ services?: ServiceRow[] }>('/my-services');
        setServices(data.services ?? []);
      } else {
        const { data } = await api.get<LaravelPaged<ServiceRow>>('/services', {
          params: { search: search.trim() || undefined },
        });
        setServices(data.data ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isPrestataire, search]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.light.primary} size="large" />
      </View>
    );
  }

  const header = (
    <>
      {!isPrestataire ? (
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.light.textMuted} />
          <TextInput
            placeholder="Rechercher un service..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      ) : (
        <Text style={styles.hintPresta}>Ce sont vos offres publiées sur la plateforme.</Text>
      )}
      <Text style={styles.sectionCount}>
        {services.length} service{services.length !== 1 ? 's' : ''}
      </Text>
    </>
  );

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={header}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="folder-open-outline" size={42} color={Colors.light.border} />
          <Text style={styles.emptyTitle}>Aucun service pour le moment</Text>
          <Text style={styles.emptySub}>Modifiez la recherche ou réessayez plus tard.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.pricePill}>
              <Text style={styles.priceTxt}>{priceFmt(item.price)}</Text>
              <Text style={styles.currency}> FCFA</Text>
            </View>
          </View>
          {item.category?.name ? (
            <View style={styles.catRow}>
              <Ionicons name="pricetag-outline" size={14} color={Colors.light.secondary} />
              <Text style={styles.catTxt}>{item.category.name}</Text>
            </View>
          ) : null}
          {!isPrestataire && item.provider?.name ? (
            <Text style={styles.providerTxt}>Par {item.provider.name}</Text>
          ) : null}
          {item.location ? (
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={14} color={Colors.light.textMuted} />
              <Text style={styles.locTxt} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          ) : null}
          {item.description ? (
            <Text style={styles.desc} numberOfLines={isPrestataire ? 4 : 2}>
              {item.description}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}

function priceFmt(n: string | number) {
  return Number(n).toLocaleString('fr-FR');
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  listContent: { padding: 16, paddingBottom: 40 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.light.text },
  hintPresta: { fontSize: 13, color: Colors.light.textMuted, marginBottom: 10, lineHeight: 19 },
  sectionCount: { fontWeight: '700', color: Colors.light.textMuted, fontSize: 12, marginBottom: 14 },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.light.text, lineHeight: 22 },
  pricePill: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#E8EEF9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  priceTxt: { fontSize: 14, fontWeight: '800', color: Colors.light.primary },
  currency: { fontSize: 10, fontWeight: '600', color: Colors.light.primary },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  catTxt: { fontSize: 12, fontWeight: '600', color: Colors.light.secondary },
  providerTxt: { marginTop: 6, fontSize: 13, color: Colors.light.textMuted, fontWeight: '500' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  locTxt: { flex: 1, fontSize: 12, color: Colors.light.textMuted },
  desc: { marginTop: 10, fontSize: 13, color: Colors.light.textMuted, lineHeight: 19 },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: { marginTop: 16, fontSize: 17, fontWeight: '700', color: Colors.light.text },
  emptySub: { marginTop: 8, fontSize: 14, color: Colors.light.textMuted, textAlign: 'center', lineHeight: 21 },
});
