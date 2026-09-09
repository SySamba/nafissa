import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useRouter } from 'expo-router';

import { api } from '@/lib/api';
import Colors from '@/constants/Colors';
import { categoryVisual } from '@/constants/categoryImages';

type Category = { id: string | number; name: string; icon?: string | null };

export default function ServiceCreateScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [available, setAvailable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingCats, setFetchingCats] = useState(true);

  useEffect(() => {
    api
      .get<{ categories?: Category[] }>('/categories')
      .then(({ data }) => setCategories(data.categories ?? []))
      .catch(() => {})
      .finally(() => setFetchingCats(false));
  }, []);

  const submit = async () => {
    if (!categoryId) {
      setError('Veuillez sélectionner une catégorie.');
      return;
    }
    if (!title.trim()) {
      setError('Veuillez saisir un titre.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Veuillez saisir un prix valide.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post('/services', {
        category_id: Number(categoryId),
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        location: location.trim() || undefined,
        available,
      });
      Alert.alert('Service publié', 'Votre service a été créé avec succès.', [
        { text: 'Voir mes services', onPress: () => router.replace('/(tabs)/services') },
      ]);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = err.response?.data?.message;
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstKey = Object.keys(fieldErrors)[0];
        if (firstKey && fieldErrors[firstKey]) {
          setError(`${firstKey}: ${fieldErrors[firstKey][0]}`);
          setBusy(false);
          return;
        }
      }
      setError(msg || 'Erreur lors de la création.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 48 }}>
        <Text style={styles.title}>Nouveau service</Text>
        <Text style={styles.subtitle}>Publiez une nouvelle offre pour vos clients.</Text>

        {error ? (
          <View style={styles.banner}>
            <Ionicons name="alert-circle" size={20} color={Colors.light.danger} />
            <Text style={styles.bannerText}>{error}</Text>
          </View>
        ) : null}

        {fetchingCats ? (
          <ActivityIndicator color={Colors.light.primary} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.field}>
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.chipsWrap}>
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
                    {active ? <Ionicons name="checkmark-circle" size={16} color={Colors.light.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Titre du service</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="pricetag-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Soutien scolaire en mathématiques"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez votre service en détail..."
            placeholderTextColor="#94a3b8"
            multiline
          />
        </View>

        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Prix (FCFA)</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="wallet-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="Ex: 2000"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.label}>Localisation</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="location-outline" size={18} color={Colors.light.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Ex: Mermoz, Dakar"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.availRow}
          onPress={() => setAvailable((a) => !a)}
          activeOpacity={0.7}>
          <Ionicons
            name={available ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={available ? Colors.light.primary : Colors.light.textMuted}
          />
          <Text style={styles.availTxt}>Service disponible</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cta, busy && { opacity: 0.6 }]}
          onPress={submit}
          disabled={busy}
          activeOpacity={0.85}>
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.ctaTxt}>Publier le service</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.light.background, padding: 18 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.light.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: Colors.light.textMuted, marginTop: 4, marginBottom: 18 },
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
  bannerText: { flex: 1, color: Colors.light.danger, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  field: { marginBottom: 16 },
  fieldRow: { flexDirection: 'row', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.light.text, marginBottom: 8 },
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
  catChipActive: { borderColor: Colors.light.primary, backgroundColor: '#ECEDE3' },
  catEmoji: { fontSize: 15 },
  catChipTxt: { fontSize: 13, fontWeight: '600', color: Colors.light.textMuted, maxWidth: 130 },
  catChipTxtActive: { color: Colors.light.primary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.light.text },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    marginBottom: 16,
  },
  availTxt: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.secondary,
    borderRadius: 16,
    paddingVertical: 16,
  },
  ctaTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
