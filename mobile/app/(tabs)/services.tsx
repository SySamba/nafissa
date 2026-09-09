import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';
import { categoryVisual } from '@/constants/categoryImages';

type Category = { id: string | number; name: string; icon?: string | null };

type ServiceRow = {
  id: string | number;
  title: string;
  description?: string | null;
  price: string | number;
  location?: string | null;
  available?: boolean;
  category?: { name?: string; icon?: string | null };
  provider?: { name?: string; profile?: unknown };
};

type LaravelPaged<T> = {
  data: T[];
  last_page?: number;
  total?: number;
};

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Plus récents' },
  { value: 'price', label: 'Prix' },
  { value: 'title', label: 'Nom' },
];

export default function ServicesTab() {
  const router = useRouter();
  const { isPrestataire, user } = useAuth();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    api
      .get<{ categories?: Category[] }>('/categories')
      .then(({ data }) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      if (isPrestataire) {
        const { data } = await api.get<{ services?: ServiceRow[] }>('/my-services');
        setServices(data.services ?? []);
      } else {
        const params: Record<string, string> = {};
        if (search.trim()) params.search = search.trim();
        if (categoryId) params.category_id = categoryId;
        if (sortBy) params.sort_by = sortBy;
        const { data } = await api.get<LaravelPaged<ServiceRow>>('/services', { params });
        setServices(data.data ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isPrestataire, search, categoryId, sortBy]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleDelete = (serviceId: string | number) => {
    Alert.alert(
      'Supprimer le service',
      'Voulez-vous vraiment supprimer ce service ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/services/${serviceId}`);
              setServices((prev) => prev.filter((s) => s.id !== serviceId));
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer ce service.');
            }
          },
        },
      ],
    );
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
      {isPrestataire ? (
        <>
          <Text style={styles.hintPresta}>Ce sont vos offres publiées sur la plateforme.</Text>
          {user?.verified ? (
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/service/create' as Href)}
              activeOpacity={0.85}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.createBtnTxt}>Nouveau service</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : (
        <>
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

          {/* Category chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catScroll}
            contentContainerStyle={styles.catScrollContent}>
            <TouchableOpacity
              style={[styles.catChip, !categoryId && styles.catChipActive]}
              onPress={() => setCategoryId('')}>
              <Text style={[styles.catChipTxt, !categoryId && styles.catChipTxtActive]}>Tous</Text>
            </TouchableOpacity>
            {categories.map((cat) => {
              const visual = categoryVisual(cat);
              const active = String(categoryId) === String(cat.id);
              return (
                <TouchableOpacity
                  key={String(cat.id)}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => setCategoryId(String(cat.id))}>
                  <Text style={styles.catEmoji}>{visual.emoji}</Text>
                  <Text style={[styles.catChipTxt, active && styles.catChipTxtActive]} numberOfLines={1}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sort */}
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setShowSort(!showSort)}
            activeOpacity={0.7}>
            <Ionicons name="options-outline" size={16} color={Colors.light.textMuted} />
            <Text style={styles.sortBtnTxt}>
              Trier : {SORT_OPTIONS.find((s) => s.value === sortBy)?.label ?? 'Plus récents'}
            </Text>
            <Ionicons name={showSort ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.light.textMuted} />
          </TouchableOpacity>
          {showSort ? (
            <View style={styles.sortPanel}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.sortOption, sortBy === opt.value && styles.sortOptionActive]}
                  onPress={() => {
                    setSortBy(opt.value);
                    setShowSort(false);
                  }}>
                  <Text style={[styles.sortOptionTxt, sortBy === opt.value && styles.sortOptionTxtActive]}>
                    {opt.label}
                  </Text>
                  {sortBy === opt.value ? <Ionicons name="checkmark" size={16} color={Colors.light.primary} /> : null}
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </>
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
      renderItem={({ item }) => {
        const visual = categoryVisual(item.category);
        const CardWrap: typeof TouchableOpacity | typeof View = isPrestataire ? View : TouchableOpacity;
        const wrapProps = isPrestataire
          ? {}
          : { activeOpacity: 0.85, onPress: () => router.push(`/service/${item.id}` as Href) };
        return (
        <CardWrap style={[styles.card, styles.cardElevated]} {...wrapProps}>
          <View style={[styles.cardHero, { backgroundColor: visual.colors[0] }]}>
            {visual.image ? (
              <Image source={visual.image} style={styles.cardHeroImg} resizeMode="cover" />
            ) : (
              <>
                <View style={[styles.cardHeroAccent, { backgroundColor: visual.colors[1] }]} />
                <Text style={styles.heroEmoji}>{visual.emoji}</Text>
              </>
            )}
            <View style={styles.cardHeroShade} />
            {item.category?.name ? (
              <Text style={styles.heroCat} numberOfLines={1}>
                {item.category.name}
              </Text>
            ) : null}
          </View>
          <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.pricePill}>
              <Text style={styles.priceTxt}>{priceFmt(item.price)}</Text>
              <Text style={styles.currency}> FCFA</Text>
            </View>
          </View>
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
          {!isPrestataire ? (
            <View style={styles.ctaRow}>
              <Text style={styles.ctaTxt}>Demander ce service</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.light.primary} />
            </View>
          ) : (
            <View style={styles.ownerActions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push(`/service/edit/${item.id}` as Href)}
                activeOpacity={0.7}>
                <Ionicons name="create-outline" size={15} color={Colors.light.primary} />
                <Text style={styles.editBtnTxt}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
                activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={15} color={Colors.light.danger} />
                <Text style={styles.deleteBtnTxt}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
          </View>
        </CardWrap>
        );
      }}
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: Colors.light.surface,
  },
  cardElevated: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHero: {
    height: 140,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  cardHeroImg: { width: '100%', height: '100%' },
  cardHeroAccent: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.55,
  },
  heroEmoji: {
    position: 'absolute',
    right: 14,
    top: 10,
    fontSize: 46,
  },
  cardHeroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  heroCat: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    right: 12,
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.light.text, lineHeight: 22 },
  pricePill: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#ECEDE3', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  priceTxt: { fontSize: 14, fontWeight: '800', color: Colors.light.primary },
  currency: { fontSize: 10, fontWeight: '600', color: Colors.light.primary },
  providerTxt: { marginTop: 6, fontSize: 13, color: Colors.light.textMuted, fontWeight: '500' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  locTxt: { flex: 1, fontSize: 12, color: Colors.light.textMuted },
  desc: { marginTop: 10, fontSize: 13, color: Colors.light.textMuted, lineHeight: 19 },
  ctaRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaTxt: { fontSize: 13, fontWeight: '800', color: Colors.light.primary },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: { marginTop: 16, fontSize: 17, fontWeight: '700', color: Colors.light.text },
  emptySub: { marginTop: 8, fontSize: 14, color: Colors.light.textMuted, textAlign: 'center', lineHeight: 21 },

  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.secondary,
    borderRadius: 14,
    paddingVertical: 13,
    marginBottom: 14,
  },
  createBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

  catScroll: { marginBottom: 8 },
  catScrollContent: { gap: 8, paddingRight: 16 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  catChipActive: { borderColor: Colors.light.primary, backgroundColor: '#ECEDE3' },
  catEmoji: { fontSize: 14 },
  catChipTxt: { fontSize: 13, fontWeight: '600', color: Colors.light.textMuted },
  catChipTxtActive: { color: Colors.light.primary },

  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  sortBtnTxt: { fontSize: 13, fontWeight: '600', color: Colors.light.textMuted, flex: 1 },
  sortPanel: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  sortOptionActive: { backgroundColor: '#ECEDE3' },
  sortOptionTxt: { fontSize: 14, fontWeight: '600', color: Colors.light.textMuted },
  sortOptionTxtActive: { color: Colors.light.primary, fontWeight: '800' },

  ownerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(68,81,47,0.10)',
    borderRadius: 10,
    paddingVertical: 9,
  },
  editBtnTxt: { fontSize: 12, fontWeight: '700', color: Colors.light.primary },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 9,
  },
  deleteBtnTxt: { fontSize: 12, fontWeight: '700', color: Colors.light.danger },
});
