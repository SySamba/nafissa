import { Redirect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { categoryVisual } from '@/constants/categoryImages';

const PRIORITY_SERVICES = [
  { key: 'home', name: 'Ménage', desc: 'Nettoyage professionnel' },
  { key: 'laundry', name: 'Lavage & Repassage', desc: 'Linge lavé et repassé' },
  { key: 'shopping', name: 'Courses', desc: 'Achats du quotidien livrés' },
  { key: 'baby', name: "Garde d'enfant", desc: 'Nounous de confiance' },
  { key: 'utensils', name: 'Cuisine', desc: 'Repas faits maison' },
];

const SECONDARY_SERVICES = [
  { key: 'book-open', name: 'Soutien scolaire', desc: 'Cours particuliers' },
  { key: 'zap', name: 'Électricien', desc: 'Installation & dépannage' },
  { key: 'plumber', name: 'Plombier', desc: 'Fuites & sanitaires' },
  { key: 'carpenter', name: 'Menuisier', desc: 'Bois & réparations' },
];

const FEATURES = [
  { icon: 'shield-checkmark' as const, title: 'Prestataires vérifiés', sub: "Pièces d'identité contrôlées" },
  { icon: 'lock-closed' as const, title: 'Paiement sécurisé', sub: 'Séquestre libéré après le service' },
  { icon: 'time' as const, title: 'Réponse rapide', sub: 'Sous 24h en moyenne' },
  { icon: 'star' as const, title: 'Qualité garantie', sub: 'Évaluations après chaque mission' },
];

const STATS = [
  { value: '500+', label: 'Familles' },
  { value: '200+', label: 'Prestataires' },
  { value: '1 000+', label: 'Missions' },
  { value: '4.8/5', label: 'Satisfaction' },
];

const TESTIMONIALS = [
  {
    name: 'Fatima Ba',
    role: 'Cliente · Mermoz',
    text: "J'ai trouvé une nounou de confiance en moins de 24h. Service impeccable, je recommande.",
    rating: 5,
  },
  {
    name: 'Oumar Sy',
    role: 'Prestataire · étudiant',
    text: "Grâce à NAFISSA je finance mes études tout en aidant les familles. Paiements toujours à l'heure.",
    rating: 5,
  },
];

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* ── Header ────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Image source={require('@/assets/images/logo-nafissa.png')} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerBrand}>NAFISSA</Text>
        </View>

        {/* ── Hero ──────────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Services à domicile de confiance</Text>
          </View>
          <Text style={styles.heroTitle}>
            Votre quotidien,{'\n'}
            <Text style={styles.heroTitleAccent}>simplifié</Text>
          </Text>
          <Text style={styles.heroSub}>
            Ménage, garde d'enfants, cuisine, lavage… Trouvez des prestataires{' '}
            <Text style={{ fontWeight: '800', color: Colors.light.text }}>vérifiés et notés</Text> pour tous vos
            besoins, en toute confiance.
          </Text>

          <View style={styles.heroImgWrap}>
            <Image source={require('@/assets/images/hero-cover.png')} style={styles.heroImg} resizeMode="cover" />
            <View style={styles.heroFloatBadge}>
              <View style={styles.heroFloatIcon}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.light.secondary} />
              </View>
              <View>
                <Text style={styles.heroFloatTitle}>Prestataires vérifiés</Text>
                <Text style={styles.heroFloatSub}>Pièces d'identité contrôlées</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── CTA ───────────────────────────────────────────── */}
        <View style={styles.ctaBlock}>
          <Pressable style={styles.ctaPrimary} onPress={() => router.push('/register')}>
            <Text style={styles.ctaPrimaryTxt}>Trouver un prestataire</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
          <Pressable style={styles.ctaSecondary} onPress={() => router.push('/register')}>
            <Ionicons name="briefcase-outline" size={16} color={Colors.light.secondaryDark} />
            <Text style={styles.ctaSecondaryTxt}>Devenir prestataire</Text>
          </Pressable>
          <Pressable style={styles.ctaTertiary} onPress={() => router.push('/login')}>
            <Text style={styles.ctaTertiaryTxt}>J'ai déjà un compte</Text>
          </Pressable>
        </View>

        {/* ── Stats ─────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Services prioritaires ─────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.eyebrow}>NOS SERVICES</Text>
          <Text style={styles.sectionTitle}>Tout pour votre famille</Text>
          <Text style={styles.sectionSub}>
            Des intervenants de confiance, près de chez vous — parce que NAFISSA, c'est votre foyer d'abord.
          </Text>
        </View>
        <View style={styles.tagRow}>
          <Ionicons name="star" size={13} color={Colors.light.primary} />
          <Text style={styles.tagText}>Services prioritaires</Text>
          <View style={styles.tagLine} />
        </View>
        <View style={styles.grid}>
          {PRIORITY_SERVICES.map((c) => {
            const visual = categoryVisual({ icon: c.key });
            return (
              <Pressable key={c.key} style={styles.catCard} onPress={() => router.push('/register')}>
                <View style={styles.catImgWrap}>
                  {visual.image ? (
                    <Image source={visual.image} style={styles.catImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.catImg, { backgroundColor: visual.colors[0] }]} />
                  )}
                  <View style={styles.catShade} />
                  <Text style={styles.catEmoji}>{visual.emoji}</Text>
                  <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
                </View>
                <Text style={styles.catDesc} numberOfLines={2}>{c.desc}</Text>
                <View style={styles.catCta}>
                  <Text style={styles.catCtaText}>Voir les offres</Text>
                  <Ionicons name="arrow-forward" size={13} color={Colors.light.textMuted} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── Services secondaires ──────────────────────────── */}
        <View style={styles.tagRowSecondary}>
          <Ionicons name="sparkles" size={13} color={Colors.light.secondaryDark} />
          <Text style={styles.tagTextSecondary}>Services secondaires</Text>
          <View style={styles.tagLineSecondary} />
        </View>
        <View style={styles.grid}>
          {SECONDARY_SERVICES.map((c) => {
            const visual = categoryVisual({ icon: c.key });
            return (
              <Pressable key={c.key} style={styles.catCard} onPress={() => router.push('/register')}>
                <View style={styles.catImgWrap}>
                  {visual.image ? (
                    <Image source={visual.image} style={styles.catImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.catImg, { backgroundColor: visual.colors[0] }]} />
                  )}
                  <View style={styles.catShade} />
                  <Text style={styles.catEmoji}>{visual.emoji}</Text>
                  <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
                </View>
                <Text style={styles.catDesc} numberOfLines={2}>{c.desc}</Text>
                <View style={styles.catCta}>
                  <Text style={styles.catCtaText}>Voir les offres</Text>
                  <Ionicons name="arrow-forward" size={13} color={Colors.light.textMuted} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── Stats bandeau sombre ──────────────────────────── */}
        <View style={styles.darkStats}>
          <Text style={styles.darkStatsTitle}>Des chiffres qui parlent</Text>
          <View style={styles.darkStatsGrid}>
            {STATS.map((s) => (
              <View key={s.label} style={styles.darkStatItem}>
                <Text style={styles.darkStatValue}>{s.value}</Text>
                <Text style={styles.darkStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Pourquoi NAFISSA ──────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.eyebrow}>NOS GARANTIES</Text>
          <Text style={styles.sectionTitle}>Pourquoi choisir NAFISSA ?</Text>
          <Text style={styles.sectionSub}>La confiance et la qualité au cœur de chaque service.</Text>
        </View>
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={f.title} style={[styles.featureRow, i === FEATURES.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={22} color={Colors.light.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.light.secondary} />
            </View>
          ))}
        </View>

        {/* ── Témoignages ───────────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Text style={styles.eyebrow}>TÉMOIGNAGES</Text>
          <Text style={styles.sectionTitle}>Ils nous font confiance</Text>
        </View>
        <View style={styles.testimonials}>
          {TESTIMONIALS.map((t) => (
            <View key={t.name} style={styles.testimonialCard}>
              <Text style={styles.quoteMark}>"</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name={s <= t.rating ? 'star' : 'star-outline'} size={16} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.testimonialText}>{t.text}</Text>
              <View style={styles.testimonialAuthor}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{t.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{t.name}</Text>
                  <Text style={styles.authorRole}>{t.role}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ── CTA final ─────────────────────────────────────── */}
        <View style={styles.finalCta}>
          <View style={styles.finalCtaDeco} />
          <View style={styles.finalBadge}>
            <Ionicons name="sparkles" size={13} color="#fff" />
            <Text style={styles.finalBadgeTxt}>Rejoignez la communauté</Text>
          </View>
          <Text style={styles.finalTitle}>Prêt(e) à simplifier{'\n'}votre quotidien ?</Text>
          <Text style={styles.finalSub}>
            Accédez à des services de qualité, rendus par des prestataires vérifiés, en toute confiance.
          </Text>
          <Pressable style={styles.finalBtn} onPress={() => router.push('/register')}>
            <Text style={styles.finalBtnTxt}>Créer mon compte gratuitement</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.light.primary} />
          </Pressable>
          <Pressable style={styles.finalLogin} onPress={() => router.push('/login')}>
            <Text style={styles.finalLoginTxt}>J'ai déjà un compte</Text>
          </Pressable>
        </View>

        {/* ── Footer ────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Image source={require('@/assets/images/logo-nafissa.png')} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.footerText}>La plateforme de confiance pour les{'\n'}services à domicile au Sénégal.</Text>
          <View style={styles.footerRow}>
            <Ionicons name="location-outline" size={13} color={Colors.light.textMuted} />
            <Text style={styles.footerMeta}>Dakar, Sénégal</Text>
          </View>
          <Text style={styles.footerCopy}>© {new Date().getFullYear()} NAFISSA. Tous droits réservés.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const PRIMARY = Colors.light.primary;
const PRIMARY_D = Colors.light.primaryDark;
const SECONDARY = Colors.light.secondary;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 8 },
  headerLogo: { width: 34, height: 34, borderRadius: 9 },
  headerBrand: { fontSize: 17, fontWeight: '900', color: Colors.light.text, letterSpacing: 0.5 },

  /* Hero */
  hero: { paddingHorizontal: 20, paddingTop: 18 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.surface,
    borderColor: 'rgba(201,161,90,0.4)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  badgeText: { color: Colors.light.text, fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 36, fontWeight: '900', letterSpacing: -1, lineHeight: 42, color: Colors.light.text },
  heroTitleAccent: { color: PRIMARY },
  heroSub: { fontSize: 15, lineHeight: 23, marginTop: 14, color: Colors.light.textMuted },

  heroImgWrap: { marginTop: 24, marginBottom: 10 },
  heroImg: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    backgroundColor: Colors.light.border,
  },
  heroFloatBadge: {
    position: 'absolute',
    bottom: -18,
    left: 16,
    right: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  heroFloatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(201,161,90,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFloatTitle: { fontSize: 13, fontWeight: '800', color: Colors.light.text },
  heroFloatSub: { fontSize: 11, color: Colors.light.textMuted, marginTop: 1 },

  /* CTA */
  ctaBlock: { paddingHorizontal: 20, marginTop: 34, gap: 10 },
  ctaPrimary: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 6,
  },
  ctaPrimaryTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  ctaSecondary: {
    borderRadius: 16,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(201,161,90,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201,161,90,0.3)',
  },
  ctaSecondaryTxt: { color: Colors.light.secondaryDark, fontSize: 15, fontWeight: '700' },
  ctaTertiary: { alignItems: 'center', paddingVertical: 8 },
  ctaTertiaryTxt: { color: Colors.light.textMuted, fontSize: 14, fontWeight: '600' },

  /* Stats */
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginTop: 26 },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '900', color: PRIMARY },
  statLabel: { fontSize: 11, fontWeight: '600', color: Colors.light.textMuted, marginTop: 4 },

  /* Sections */
  sectionHead: { paddingHorizontal: 20, marginTop: 36 },
  eyebrow: { fontSize: 11, fontWeight: '800', color: Colors.light.secondaryDark, letterSpacing: 1 },
  sectionTitle: { fontSize: 23, fontWeight: '900', color: Colors.light.text, letterSpacing: -0.5, marginTop: 6 },
  sectionSub: { fontSize: 14, color: Colors.light.textMuted, marginTop: 6, lineHeight: 20 },

  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginTop: 20 },
  tagText: { fontSize: 11, fontWeight: '800', color: PRIMARY, letterSpacing: 0.4 },
  tagLine: { flex: 1, height: 1, backgroundColor: 'rgba(68,81,47,0.15)' },
  tagRowSecondary: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginTop: 30 },
  tagTextSecondary: { fontSize: 11, fontWeight: '800', color: Colors.light.secondaryDark, letterSpacing: 0.4 },
  tagLineSecondary: { flex: 1, height: 1, backgroundColor: 'rgba(201,161,90,0.25)' },

  /* Grille services */
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginTop: 14, gap: 12 },
  catCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  catImgWrap: {
    height: 110,
    justifyContent: 'flex-end',
    backgroundColor: Colors.light.border,
  },
  catImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  catShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)' },
  catEmoji: { position: 'absolute', top: 10, right: 12, fontSize: 22 },
  catName: { color: '#fff', fontSize: 14, fontWeight: '800', paddingHorizontal: 12, paddingBottom: 10 },
  catDesc: { fontSize: 11.5, color: Colors.light.textMuted, paddingHorizontal: 12, marginTop: 8, lineHeight: 16 },
  catCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
  },
  catCtaText: { fontSize: 11, fontWeight: '800', color: PRIMARY },

  /* Bandeau stats sombre */
  darkStats: {
    marginHorizontal: 20,
    marginTop: 36,
    backgroundColor: PRIMARY_D,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  darkStatsTitle: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 18 },
  darkStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  darkStatItem: { alignItems: 'center', width: '40%' },
  darkStatValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  darkStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' },

  /* Features */
  features: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(68,81,47,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  featureSub: { fontSize: 12, color: Colors.light.textMuted, marginTop: 3 },

  /* Témoignages */
  testimonials: { paddingHorizontal: 20, marginTop: 18, gap: 12 },
  testimonialCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  quoteMark: {
    position: 'absolute',
    top: 4,
    right: 14,
    fontSize: 56,
    fontWeight: '900',
    color: 'rgba(68,81,47,0.08)',
  },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 10 },
  testimonialText: { fontSize: 14, color: Colors.light.text, lineHeight: 21 },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.light.border },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#fff', fontSize: 16, fontWeight: '800' },
  authorName: { fontSize: 14, fontWeight: '700', color: Colors.light.text },
  authorRole: { fontSize: 12, color: Colors.light.textMuted, marginTop: 1 },

  /* CTA final */
  finalCta: {
    marginHorizontal: 20,
    marginTop: 36,
    backgroundColor: PRIMARY_D,
    borderRadius: 26,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  finalCtaDeco: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(201,161,90,0.15)',
  },
  finalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
    zIndex: 1,
  },
  finalBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  finalTitle: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', lineHeight: 30, zIndex: 1 },
  finalSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 12, zIndex: 1 },
  finalBtn: {
    marginTop: 22,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 24,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1,
  },
  finalBtnTxt: { color: PRIMARY, fontSize: 15, fontWeight: '800' },
  finalLogin: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 16, zIndex: 1 },
  finalLoginTxt: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600' },

  /* Footer */
  footer: { alignItems: 'center', paddingHorizontal: 20, marginTop: 40 },
  footerLogo: { width: 44, height: 44, borderRadius: 12, marginBottom: 12 },
  footerText: { fontSize: 12.5, color: Colors.light.textMuted, textAlign: 'center', lineHeight: 18 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12 },
  footerMeta: { fontSize: 12, color: Colors.light.textMuted, fontWeight: '600' },
  footerCopy: { fontSize: 11, color: Colors.light.textMuted, marginTop: 16, opacity: 0.7 },
});
