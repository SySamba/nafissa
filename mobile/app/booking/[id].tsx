import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Colors from '@/constants/Colors';

type Payment = {
  id?: string | number;
  amount?: string | number;
  method?: string | null;
  status?: string | null;
  escrow_status?: string | null;
  transaction_ref?: string | null;
};

type BookingDetail = {
  id: string | number;
  status: string;
  client_id?: string | number;
  provider_id?: string | number | null;
  booking_date: string;
  booking_time: string;
  total_price: string | number;
  notes?: string | null;
  location?: string | null;
  description?: string | null;
  rating?: number | null;
  review?: string | null;
  payment?: Payment | null;
  service?: { title?: string; description?: string | null; category?: { name?: string } };
  provider?: { name?: string };
  client?: { name?: string };
};

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  en_attente_admin: { label: 'En attente admin', bg: '#FEF9C3', fg: '#854D0E' },
  en_attente_prestataire: { label: 'En attente prestataire', bg: '#FFEDD5', fg: '#9A3412' },
  acceptee: { label: 'Acceptée', bg: '#DBEAFE', fg: '#1E40AF' },
  refusee: { label: 'Refusée', bg: '#FEE2E2', fg: '#B91C1C' },
  payee: { label: 'Payée', bg: '#F3E8FF', fg: '#6B21A8' },
  en_cours: { label: 'En cours', bg: '#ECEDE3', fg: Colors.light.primary },
  terminee: { label: 'Terminée', bg: '#DCFCE7', fg: Colors.light.secondary },
  annulee: { label: 'Annulée', bg: '#FEE2E2', fg: '#B91C1C' },
};

const PAYMENT_METHODS = [
  { value: 'wave', label: 'Wave', emoji: '🌊' },
  { value: 'orange_money', label: 'Orange Money', emoji: '🟠' },
  { value: 'free_money', label: 'Free Money', emoji: '🟢' },
  { value: 'stripe', label: 'Carte bancaire', emoji: '💳' },
];

const DISPUTE_REASONS = [
  'Retard ou absence',
  'Travail non conforme',
  'Comportement inapproprié',
  'Problème de paiement',
  'Autre',
];

export default function BookingDetailScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const [showPayment, setShowPayment] = useState(false);
  const [method, setMethod] = useState('wave');

  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState(DISPUTE_REASONS[0]);
  const [disputeText, setDisputeText] = useState('');

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

  const fail = (e: unknown, fallback: string) => {
    const msg =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
    Alert.alert('Erreur', msg);
  };

  const changeStatus = async (status: string) => {
    setBusy(status);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      await load();
    } catch (e) {
      fail(e, 'Action impossible.');
    } finally {
      setBusy('');
    }
  };

  const confirmCancel = () => {
    Alert.alert('Annuler la demande', 'Voulez-vous vraiment annuler cette demande ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: () => changeStatus('annulee') },
    ]);
  };

  const pay = async () => {
    setBusy('payment');
    try {
      await api.post('/payments', { booking_id: Number(id), method });
      setShowPayment(false);
      Alert.alert('Paiement effectué', 'Votre paiement a bien été enregistré.');
      await load();
    } catch (e) {
      fail(e, 'Erreur de paiement.');
    } finally {
      setBusy('');
    }
  };

  const release = async () => {
    if (!booking?.payment?.id) return;
    setBusy('release');
    try {
      await api.patch(`/payments/${booking.payment.id}/release`);
      Alert.alert('Paiement libéré', 'Le paiement a été libéré au prestataire.');
      await load();
    } catch (e) {
      fail(e, 'Erreur.');
    } finally {
      setBusy('');
    }
  };

  const rate = async () => {
    if (ratingValue < 1) return;
    setBusy('rate');
    try {
      await api.post(`/bookings/${id}/rate`, { rating: ratingValue, review: reviewText.trim() || null });
      setShowRating(false);
      Alert.alert('Merci !', 'Votre évaluation a bien été enregistrée.');
      await load();
    } catch (e) {
      fail(e, 'Erreur.');
    } finally {
      setBusy('');
    }
  };

  const sendDispute = async () => {
    if (disputeText.trim().length < 5) {
      Alert.alert('Décrivez le problème', 'Merci de détailler le problème (au moins 5 caractères).');
      return;
    }
    setBusy('dispute');
    try {
      await api.post(`/bookings/${id}/dispute`, { reason: disputeReason, message: disputeText.trim() });
      setShowDispute(false);
      setDisputeText('');
      setDisputeReason(DISPUTE_REASONS[0]);
      Alert.alert('Signalement envoyé', 'Votre signalement a été transmis à notre équipe. Merci.');
    } catch (e) {
      fail(e, "Erreur lors de l'envoi.");
    } finally {
      setBusy('');
    }
  };

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

  const st = STATUS[booking.status] ?? STATUS.en_attente_admin;
  const isClient = String(booking.client_id) === String(user?.id);
  const isProvider =
    booking.provider_id != null && String(booking.provider_id) === String(user?.id);
  const pay_ = booking.payment;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingBottom: 48 }}>
      <View style={styles.card}>
        <View style={styles.statusHeader}>
          <Text style={styles.cardLabel}>Demande #{booking.id}</Text>
          <View style={[styles.pill, { backgroundColor: st.bg }]}>
            <Text style={[styles.pillTxt, { color: st.fg }]}>{st.label}</Text>
          </View>
        </View>
        <Divider />
        <Text style={styles.label}>Date &amp; heure</Text>
        <Text style={styles.value}>
          {booking.booking_date} à {booking.booking_time}
        </Text>
        {booking.location ? (
          <>
            <Divider />
            <Text style={styles.label}>Lieu</Text>
            <Text style={styles.value}>{booking.location}</Text>
          </>
        ) : null}
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
        {booking.description ? <Text style={styles.desc}>{booking.description}</Text> : null}
      </View>

      <Text style={styles.section}>Intervenants</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Client</Text>
        <Text style={styles.value}>{booking.client?.name ?? '—'}</Text>
        <Divider />
        <Text style={styles.label}>Prestataire</Text>
        <Text style={styles.value}>{booking.provider?.name ?? 'À attribuer'}</Text>
      </View>

      {pay_ ? (
        <>
          <Text style={styles.section}>Paiement</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Méthode</Text>
            <Text style={[styles.value, { textTransform: 'capitalize' }]}>
              {pay_.method?.replace('_', ' ') ?? '—'}
            </Text>
            <Divider />
            <Text style={styles.label}>Séquestre</Text>
            <Text style={styles.value}>
              {pay_.escrow_status === 'held'
                ? 'Retenu (en sécurité)'
                : pay_.escrow_status === 'released'
                  ? 'Libéré au prestataire'
                  : 'Remboursé'}
            </Text>
          </View>
        </>
      ) : null}

      {/* ── Actions ─────────────────────────────────────────────── */}
      <Text style={styles.section}>Actions</Text>
      <View style={styles.card}>
        {isClient && booking.status === 'en_attente_admin' ? (
          <>
            <Text style={styles.helper}>⏳ Votre demande est en cours d&apos;analyse par l&apos;administrateur.</Text>
            <OutlineButton danger label="Annuler la demande" loading={busy === 'annulee'} onPress={confirmCancel} />
          </>
        ) : null}

        {isClient && booking.status === 'en_attente_prestataire' ? (
          <Text style={styles.helper}>⏳ Un prestataire a été attribué. En attente de sa confirmation.</Text>
        ) : null}

        {isProvider && booking.status === 'en_attente_prestataire' ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <FillButton
              style={{ flex: 1 }}
              color={Colors.light.secondary}
              label="Accepter"
              loading={busy === 'acceptee'}
              onPress={() => changeStatus('acceptee')}
            />
            <FillButton
              style={{ flex: 1 }}
              color={Colors.light.danger}
              label="Refuser"
              loading={busy === 'refusee'}
              onPress={() => changeStatus('refusee')}
            />
          </View>
        ) : null}

        {isClient && booking.status === 'acceptee' && !pay_ ? (
          !showPayment ? (
            <FillButton
              color={Colors.light.primary}
              label={`Payer ${Number(booking.total_price).toLocaleString('fr-FR')} FCFA`}
              onPress={() => setShowPayment(true)}
            />
          ) : (
            <View style={{ gap: 10 }}>
              <Text style={styles.helper}>Choisissez votre moyen de paiement</Text>
              {PAYMENT_METHODS.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.methodRow, method === m.value && styles.methodRowActive]}
                  onPress={() => setMethod(m.value)}
                  activeOpacity={0.7}>
                  <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
                  <Text style={styles.methodTxt}>{m.label}</Text>
                  <Ionicons
                    name={method === m.value ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={method === m.value ? Colors.light.primary : Colors.light.border}
                  />
                </TouchableOpacity>
              ))}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <OutlineButton style={{ flex: 1 }} label="Annuler" onPress={() => setShowPayment(false)} />
                <FillButton
                  style={{ flex: 1 }}
                  color={Colors.light.primary}
                  label="Confirmer"
                  loading={busy === 'payment'}
                  onPress={pay}
                />
              </View>
            </View>
          )
        ) : null}

        {isProvider && booking.status === 'acceptee' && !pay_ ? (
          <Text style={styles.helper}>⏳ En attente du paiement du client.</Text>
        ) : null}

        {isProvider && (booking.status === 'payee' || booking.status === 'en_cours') ? (
          <FillButton
            color={Colors.light.secondary}
            label={booking.status === 'payee' ? 'Démarrer le service' : 'Marquer comme terminée'}
            loading={busy === 'en_cours' || busy === 'terminee'}
            onPress={() => changeStatus(booking.status === 'payee' ? 'en_cours' : 'terminee')}
          />
        ) : null}

        {isClient && booking.status === 'terminee' && pay_?.escrow_status === 'held' ? (
          <FillButton
            color={Colors.light.secondary}
            label="Confirmer et libérer le paiement"
            loading={busy === 'release'}
            onPress={release}
          />
        ) : null}

        {booking.status === 'terminee' && pay_?.escrow_status === 'released' ? (
          <Text style={[styles.helper, { color: Colors.light.secondary }]}>
            ✓ Mission terminée et paiement libéré.
          </Text>
        ) : null}

        {booking.rating ? (
          <View style={styles.ratingBox}>
            <Text style={styles.ratingTitle}>Votre évaluation : {booking.rating}/5</Text>
            <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={s <= (booking.rating ?? 0) ? 'star' : 'star-outline'}
                  size={18}
                  color="#F59E0B"
                />
              ))}
            </View>
            {booking.review ? <Text style={styles.reviewTxt}>« {booking.review} »</Text> : null}
          </View>
        ) : null}

        {isClient && booking.status === 'terminee' && pay_?.escrow_status === 'released' && !booking.rating ? (
          !showRating ? (
            <FillButton color="#F59E0B" label="Évaluer le prestataire" onPress={() => setShowRating(true)} />
          ) : (
            <View style={{ gap: 10 }}>
              <Text style={styles.helper}>Notez le prestataire</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setRatingValue(s)}>
                    <Ionicons name={s <= ratingValue ? 'star' : 'star-outline'} size={32} color="#F59E0B" />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Laissez un commentaire (optionnel)…"
                placeholderTextColor="#94a3b8"
                style={styles.textarea}
                multiline
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <OutlineButton style={{ flex: 1 }} label="Annuler" onPress={() => setShowRating(false)} />
                <FillButton
                  style={{ flex: 1 }}
                  color="#F59E0B"
                  label="Envoyer"
                  loading={busy === 'rate'}
                  onPress={rate}
                />
              </View>
            </View>
          )
        ) : null}

        {booking.status === 'annulee' ? (
          <Text style={[styles.helper, { color: Colors.light.danger }]}>✕ Cette demande a été annulée.</Text>
        ) : null}
        {booking.status === 'refusee' ? (
          <Text style={[styles.helper, { color: Colors.light.danger }]}>
            ✕ Le prestataire a refusé. L&apos;administrateur cherchera un autre prestataire.
          </Text>
        ) : null}
      </View>

      {booking.notes ? (
        <>
          <Text style={styles.section}>Notes</Text>
          <View style={styles.card}>
            <Text style={styles.desc}>{booking.notes}</Text>
          </View>
        </>
      ) : null}

      {/* ── Signaler un problème ────────────────────────────────── */}
      {isClient || isProvider ? (
        <>
          <Text style={styles.section}>Un problème ?</Text>
          <View style={styles.card}>
            {!showDispute ? (
              <>
                <Text style={styles.desc}>
                  Retard, travail non conforme, comportement… Signalez-le et notre équipe interviendra rapidement.
                </Text>
                <OutlineButton
                  danger
                  label="Signaler un problème"
                  icon="warning-outline"
                  onPress={() => setShowDispute(true)}
                  style={{ marginTop: 12 }}
                />
              </>
            ) : (
              <View style={{ gap: 12 }}>
                <Text style={styles.label}>Type de problème</Text>
                <View style={styles.chipsRow}>
                  {DISPUTE_REASONS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.chip, disputeReason === r && styles.chipActive]}
                      onPress={() => setDisputeReason(r)}>
                      <Text style={[styles.chipTxt, disputeReason === r && styles.chipTxtActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  value={disputeText}
                  onChangeText={setDisputeText}
                  placeholder="Expliquez ce qui s'est passé…"
                  placeholderTextColor="#94a3b8"
                  style={styles.textarea}
                  multiline
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <OutlineButton
                    style={{ flex: 1 }}
                    label="Annuler"
                    onPress={() => {
                      setShowDispute(false);
                      setDisputeText('');
                    }}
                  />
                  <FillButton
                    style={{ flex: 1 }}
                    color={Colors.light.danger}
                    label="Envoyer"
                    loading={busy === 'dispute'}
                    onPress={sendDispute}
                  />
                </View>
              </View>
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function Divider() {
  return <View style={styles.separator} />;
}

function FillButton(props: {
  label: string;
  color: string;
  onPress: () => void;
  loading?: boolean;
  style?: object;
}) {
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: props.color }, props.loading && { opacity: 0.6 }, props.style]}
      onPress={props.onPress}
      disabled={props.loading}
      activeOpacity={0.85}>
      {props.loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>{props.label}</Text>}
    </TouchableOpacity>
  );
}

function OutlineButton(props: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  danger?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: object;
}) {
  const color = props.danger ? Colors.light.danger : Colors.light.textMuted;
  return (
    <TouchableOpacity
      style={[styles.btnOutline, { borderColor: color }, props.loading && { opacity: 0.6 }, props.style]}
      onPress={props.onPress}
      disabled={props.loading}
      activeOpacity={0.85}>
      {props.loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {props.icon ? <Ionicons name={props.icon} size={16} color={color} /> : null}
          <Text style={[styles.btnOutlineTxt, { color }]}>{props.label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background },
  screen: { flex: 1, backgroundColor: Colors.light.background },
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
    gap: 0,
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 16, fontWeight: '900', color: Colors.light.text },
  label: { fontSize: 12, fontWeight: '600', color: Colors.light.textMuted, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '700', color: Colors.light.text, lineHeight: 22 },
  amount: { fontSize: 22, fontWeight: '900', color: Colors.light.secondary },
  small: { marginTop: 8, fontSize: 13, color: Colors.light.textMuted },
  desc: { marginTop: 6, fontSize: 14, color: Colors.light.textMuted, lineHeight: 21 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillTxt: { fontSize: 11, fontWeight: '800' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.light.border, marginVertical: 14 },
  helper: { fontSize: 13, color: Colors.light.textMuted, lineHeight: 20, marginBottom: 10 },
  btn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  btnOutline: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginTop: 4,
  },
  btnOutlineTxt: { fontSize: 15, fontWeight: '800' },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  methodRowActive: { borderColor: Colors.light.primary, backgroundColor: '#F1F6FE' },
  methodTxt: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.light.text },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.light.text,
  },
  ratingBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
    marginBottom: 10,
  },
  ratingTitle: { fontSize: 14, fontWeight: '800', color: Colors.light.text },
  reviewTxt: { marginTop: 8, fontSize: 13, fontStyle: 'italic', color: Colors.light.textMuted },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: { borderColor: Colors.light.danger, backgroundColor: '#FEE2E2' },
  chipTxt: { fontSize: 12, fontWeight: '600', color: Colors.light.textMuted },
  chipTxtActive: { color: Colors.light.danger },
});
