import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { API_ORIGIN } from '@/lib/api';
import Colors from '@/constants/Colors';

const ROLE_LABEL: Record<string, string> = {
  maman: 'Cliente',
  etudiant: 'Étudiant',
  artisan: 'Artisan',
  admin: 'Administrateur',
};

export default function ProfileTab() {
  const { user, logout, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  const photoUrl = user.profile?.photo_url;
  const fullPhoto =
    typeof photoUrl === 'string'
      ? photoUrl.startsWith('http')
        ? photoUrl
        : `${API_ORIGIN}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`
      : null;

  const signOut = () => {
    Alert.alert('Déconnexion', 'Quitter votre session sur cet appareil ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 48 }}>
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          {fullPhoto ? (
            <Image source={{ uri: fullPhoto }} style={styles.avatarImg} resizeMode="cover" />
          ) : (
            <Ionicons name="person" size={40} color={Colors.light.primary} />
          )}
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleTxt}>{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</Text>
        </View>
      </View>

      <Text style={styles.section}>Compte</Text>
      <View style={styles.card}>
        <Row icon="mail-outline" label="Email" value={user?.email ?? '—'} />
        <Divider />
        <Row icon="call-outline" label="Téléphone" value={user.profile?.phone || 'Non renseigné'} />
        <Divider />
        <Row icon="location-outline" label="Adresse" value={user.profile?.address || 'Non renseignée'} last />
      </View>

      {user?.role === 'admin' ? (
        <Text style={styles.adminNote}>Compte administrateur : actions avancées restent disponibles sur le web.</Text>
      ) : null}

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={Colors.light.danger} />
        <Text style={styles.logoutTxt}>Déconnexion</Text>
      </TouchableOpacity>

      <Text style={styles.foot}>Nafissa · même compte que le site web</Text>
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  value,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.rowInner, last && { borderBottomWidth: 0 }]}>
      <View style={styles.rowIconBg}>
        <Ionicons name={icon} size={18} color={Colors.light.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowVal}>{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: Colors.light.border, marginLeft: 54 }} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.light.background },
  headerCard: {
    margin: 16,
    paddingVertical: 28,
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  avatarImg: { width: 82, height: 82, borderRadius: 41 },
  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.4,
  },
  rolePill: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.light.secondary + '22',
    borderWidth: 1,
    borderColor: Colors.light.secondary + '44',
  },
  roleTxt: { fontWeight: '700', color: Colors.light.secondary, fontSize: 12 },
  section: {
    marginHorizontal: 20,
    marginTop: 18,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  rowIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 11, fontWeight: '600', color: Colors.light.textMuted, marginBottom: 2 },
  rowVal: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
  adminNote: {
    marginHorizontal: 20,
    marginTop: 16,
    fontSize: 13,
    color: Colors.light.textMuted,
    lineHeight: 19,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 16,
  },
  logoutTxt: { fontSize: 16, fontWeight: '700', color: Colors.light.danger },
  foot: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    color: Colors.light.textMuted,
    paddingHorizontal: 24,
  },
});
