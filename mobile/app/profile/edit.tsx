import { useState } from 'react';
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

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, loadUser } = useAuth();

  const profile = (user?.profile ?? {}) as { phone?: string; address?: string; bio?: string };

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [address, setAddress] = useState(profile.address ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Nom requis', 'Merci d’indiquer votre nom (2 caractères minimum).');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        bio: bio.trim() || null,
      });
      await loadUser();
      Alert.alert('Profil mis à jour', 'Vos informations ont bien été enregistrées.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Impossible d’enregistrer. Réessayez.';
      Alert.alert('Erreur', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingBottom: 48 }}>
        <Text style={styles.intro}>Mettez à jour vos informations personnelles.</Text>

        <Field label="Nom complet" icon="person-outline">
          <TextInput value={name} onChangeText={setName} placeholder="Votre nom" placeholderTextColor="#94a3b8" style={styles.input} />
        </Field>

        <Field label="Téléphone" icon="call-outline">
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Ex. 77 000 00 00"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            style={styles.input}
          />
        </Field>

        <Field label="Adresse" icon="location-outline">
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Votre quartier / adresse"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </Field>

        <Text style={styles.label}>À propos (optionnel)</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Quelques mots sur vous…"
          placeholderTextColor="#94a3b8"
          style={styles.textarea}
          multiline
        />

        <TouchableOpacity
          style={[styles.cta, saving && { opacity: 0.6 }]}
          onPress={save}
          disabled={saving}
          activeOpacity={0.85}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.ctaTxt}>Enregistrer</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Votre email sert d’identifiant de connexion et ne peut pas être modifié ici.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={Colors.light.textMuted} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.light.background },
  intro: { fontSize: 14, color: Colors.light.textMuted, marginBottom: 18, lineHeight: 20 },
  field: { marginBottom: 16 },
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
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 8,
  },
  cta: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 16,
  },
  ctaTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  note: { marginTop: 14, fontSize: 12, color: Colors.light.textMuted, lineHeight: 18, textAlign: 'center' },
});
