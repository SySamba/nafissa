import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadJakarta } from '@remotion/google-fonts/PlusJakartaSans';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';

const fontOpts = { weights: ['500', '700', '800'], subsets: ['latin'], ignoreTooManyRequestsWarning: true };
const { fontFamily: jakarta } = loadJakarta('normal', fontOpts);
const { fontFamily: inter } = loadInter('normal', fontOpts);

const C = {
  primary: '#44512F',
  primaryDark: '#333D24',
  gold: '#C9A15A',
  goldLight: '#E7D3A5',
  cream: '#F7F7F4',
  ink: '#1F2937',
  muted: '#6B7280',
  green: '#22C55E',
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const fade = (f, start, dur = 14) => interpolate(f, [start, start + dur], [0, 1], clamp);
const rise = (f, start, dist = 34, dur = 16) => interpolate(f, [start, start + dur], [dist, 0], clamp);
const pop = (f, fps, start) =>
  spring({ frame: f - start, fps, config: { damping: 14, stiffness: 140, mass: 0.7 } });

/** Fondu entrée/sortie local à la scène. */
const Scene = ({ durationInFrames, children, style }) => {
  const f = useCurrentFrame();
  const opacity = Math.min(
    interpolate(f, [0, 14], [0, 1], clamp),
    interpolate(f, [durationInFrames - 12, durationInFrames - 2], [1, 0], clamp)
  );
  return (
    <AbsoluteFill style={{ opacity, ...style }}>{children}</AbsoluteFill>
  );
};

const Grain = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(1200px 800px at 80% -10%, rgba(201,161,90,.20), transparent 60%), radial-gradient(900px 700px at -10% 110%, rgba(201,161,90,.14), transparent 55%)',
    }}
  />
);

/* ───────── Téléphone & mini-écrans ───────── */

const Phone = ({ children, scale = 1, rotate = 0 }) => (
  <div
    style={{
      width: 320 * scale,
      height: 640 * scale,
      borderRadius: 44 * scale,
      background: C.ink,
      padding: 10 * scale,
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 40px 80px rgba(0,0,0,.35)',
    }}
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 36 * scale,
        background: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: inter,
      }}
    >
      <div style={{ height: 26 * scale, display: 'flex', justifyContent: 'center', paddingTop: 6 * scale }}>
        <div style={{ width: 88 * scale, height: 9 * scale, borderRadius: 99, background: '#E5E7EB' }} />
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, value, scale = 1 }) => (
  <div style={{ marginBottom: 10 * scale }}>
    <div style={{ fontSize: 11 * scale, fontWeight: 700, color: C.muted, marginBottom: 4 * scale }}>{label}</div>
    <div
      style={{
        border: `${1.5 * scale}px solid #E5E7EB`,
        borderRadius: 10 * scale,
        padding: `${8 * scale}px ${10 * scale}px`,
        fontSize: 12.5 * scale,
        fontWeight: 600,
        color: C.ink,
        background: '#F9FAFB',
      }}
    >
      {value}
    </div>
  </div>
);

const ScreenForm = ({ scale = 1 }) => (
  <div style={{ flex: 1, padding: 12 * scale }}>
    <div style={{ fontSize: 15 * scale, fontWeight: 800, color: C.ink, marginBottom: 12 * scale }}>
      Nouvelle demande
    </div>
    <Field scale={scale} label="Type de service" value="Ménage ▾" />
    <Field scale={scale} label="Date" value="Samedi 8 novembre" />
    <Field scale={scale} label="Heure" value="10:00" />
    <Field scale={scale} label="Durée estimée" value="Demi-journée (4 h) ▾" />
    <Field scale={scale} label="Lieu" value="Mermoz, Dakar" />
    <div
      style={{
        marginTop: 12 * scale,
        background: C.primary,
        borderRadius: 12 * scale,
        padding: `${11 * scale}px 0`,
        textAlign: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: 13 * scale,
      }}
    >
      Envoyer ma demande
    </div>
  </div>
);

const ScreenAssign = ({ scale = 1 }) => (
  <div style={{ flex: 1, padding: 12 * scale }}>
    <div style={{ fontSize: 15 * scale, fontWeight: 800, color: C.ink, marginBottom: 12 * scale }}>
      Prestataire attribuée
    </div>
    <div
      style={{
        border: `${1.5 * scale}px solid #E5E7EB`,
        borderRadius: 16 * scale,
        padding: 14 * scale,
        background: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 * scale }}>
        <div
          style={{
            width: 44 * scale,
            height: 44 * scale,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.primary}, ${C.gold})`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 16 * scale,
          }}
        >
          AD
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14 * scale, fontWeight: 800, color: C.ink }}>Aissata D.</div>
          <div style={{ fontSize: 11 * scale, color: C.gold, fontWeight: 700 }}>★★★★★ 4,9 · 2,3 km</div>
        </div>
        <div
          style={{
            background: '#DCFCE7',
            color: '#15803D',
            fontSize: 10 * scale,
            fontWeight: 800,
            padding: `${4 * scale}px ${8 * scale}px`,
            borderRadius: 99,
          }}
        >
          Vérifiée ✓
        </div>
      </div>
      <div style={{ marginTop: 12 * scale, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11 * scale, color: C.muted, fontWeight: 600 }}>Prix confirmé</span>
        <span style={{ fontSize: 16 * scale, fontWeight: 800, color: C.primary }}>15 000 FCFA</span>
      </div>
    </div>
    <div
      style={{
        marginTop: 14 * scale,
        background: '#EFF6FF',
        borderRadius: 12 * scale,
        padding: 10 * scale,
        fontSize: 11 * scale,
        color: '#1D4ED8',
        fontWeight: 600,
        lineHeight: 1.5,
      }}
    >
      Sélectionnée par notre équipe selon votre besoin, la distance et ses évaluations.
    </div>
  </div>
);

const ScreenNotif = ({ scale = 1 }) => (
  <div style={{ flex: 1, padding: 12 * scale, background: '#ECE5DD' }}>
    <div style={{ fontSize: 13 * scale, fontWeight: 800, color: C.ink, marginBottom: 10 * scale }}>WhatsApp</div>
    <div
      style={{
        alignSelf: 'flex-start',
        maxWidth: '88%',
        background: '#fff',
        borderRadius: `4px ${12 * scale}px ${12 * scale}px ${12 * scale}px`,
        padding: `${9 * scale}px ${11 * scale}px`,
        boxShadow: '0 2px 6px rgba(0,0,0,.08)',
      }}
    >
      <div style={{ fontSize: 11.5 * scale, color: C.ink, lineHeight: 1.5 }}>
        <b>NAFISSA</b> — Bonne nouvelle ! Votre demande n°24 a été acceptée par <b>Aissata</b>.
        Intervention samedi à 10h. ✅
      </div>
      <div style={{ fontSize: 9 * scale, color: C.muted, textAlign: 'right', marginTop: 3 * scale }}>09:41 ✓✓</div>
    </div>
    <div
      style={{
        marginTop: 12 * scale,
        background: '#fff',
        borderRadius: 12 * scale,
        padding: 10 * scale,
      }}
    >
      {['Demande reçue', 'Prestataire attribuée', 'Mission confirmée'].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 * scale, padding: `${5 * scale}px 0` }}>
          <div
            style={{
              width: 16 * scale,
              height: 16 * scale,
              borderRadius: '50%',
              background: C.green,
              color: '#fff',
              fontSize: 10 * scale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            ✓
          </div>
          <span style={{ fontSize: 11.5 * scale, fontWeight: 600, color: C.ink }}>{s}</span>
        </div>
      ))}
    </div>
  </div>
);

const ScreenPay = ({ scale = 1 }) => (
  <div style={{ flex: 1, padding: 12 * scale }}>
    <div style={{ fontSize: 15 * scale, fontWeight: 800, color: C.ink, marginBottom: 12 * scale }}>Paiement</div>
    <div
      style={{
        background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
        borderRadius: 16 * scale,
        padding: 16 * scale,
        color: '#fff',
      }}
    >
      <div style={{ fontSize: 10 * scale, opacity: 0.8, fontWeight: 600 }}>MONTANT SÉQUESTRÉ</div>
      <div style={{ fontSize: 24 * scale, fontWeight: 800, marginTop: 4 * scale }}>15 000 FCFA</div>
      <div style={{ fontSize: 10.5 * scale, marginTop: 8 * scale, opacity: 0.9 }}>Wave ···· 9088</div>
    </div>
    <div
      style={{
        marginTop: 14 * scale,
        display: 'flex',
        gap: 8 * scale,
        alignItems: 'center',
        background: '#F0FDF4',
        borderRadius: 12 * scale,
        padding: 10 * scale,
      }}
    >
      <div style={{ fontSize: 16 * scale }}>🛡️</div>
      <div style={{ fontSize: 11 * scale, color: '#15803D', fontWeight: 600, lineHeight: 1.5 }}>
        Fonds libérés au prestataire uniquement après confirmation de la mission.
      </div>
    </div>
  </div>
);

/* ───────── Scènes ───────── */

const Intro = ({ vertical }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, fps, 6);
  const logoSize = vertical ? 200 : 170;
  return (
    <Scene durationInFrames={95} style={{ background: C.primaryDark }}>
      <Grain />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            transform: `scale(${s})`,
            width: logoSize,
            height: logoSize,
            borderRadius: 36,
            background: '#fff',
            padding: 14,
            boxShadow: '0 30px 90px rgba(0,0,0,.45)',
          }}
        >
          <Img src={staticFile('logo.png')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: jakarta,
            fontWeight: 800,
            fontSize: vertical ? 88 : 76,
            letterSpacing: 14,
            color: '#fff',
            opacity: fade(f, 20),
            transform: `translateY(${rise(f, 20)}px)`,
          }}
        >
          NAFISSA
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: inter,
            fontSize: vertical ? 32 : 26,
            color: C.goldLight,
            fontWeight: 500,
            opacity: fade(f, 32),
            transform: `translateY(${rise(f, 32)}px)`,
          }}
        >
          Services à domicile de confiance · Dakar
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const CHIPS = ['Ménage', "Garde d'enfants", 'Couture', 'Soutien scolaire', 'Coiffure', 'Plomberie', 'Électricité'];

const Need = ({ vertical }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene durationInFrames={165} style={{ background: C.cream }}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60 }}>
        <div
          style={{
            fontFamily: jakarta,
            fontSize: vertical ? 74 : 68,
            fontWeight: 800,
            color: C.ink,
            textAlign: 'center',
            lineHeight: 1.15,
            opacity: fade(f, 4),
            transform: `translateY(${rise(f, 4)}px)`,
          }}
        >
          Besoin d&apos;aide <span style={{ color: C.primary }}>à la maison</span> ?
        </div>
        <div
          style={{
            marginTop: 44,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 18,
            justifyContent: 'center',
            maxWidth: vertical ? 900 : 1200,
          }}
        >
          {CHIPS.map((chip, i) => {
            const p = pop(f, fps, 22 + i * 6);
            return (
              <div
                key={chip}
                style={{
                  transform: `scale(${p})`,
                  background: '#fff',
                  border: `2px solid ${i === 0 ? C.primary : '#E5E7EB'}`,
                  color: i === 0 ? C.primary : C.ink,
                  fontFamily: inter,
                  fontWeight: 700,
                  fontSize: vertical ? 32 : 27,
                  padding: '14px 28px',
                  borderRadius: 99,
                  boxShadow: '0 10px 30px rgba(0,0,0,.07)',
                }}
              >
                {chip}
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: inter,
            fontSize: vertical ? 30 : 25,
            color: C.muted,
            opacity: fade(f, 90),
          }}
        >
          Décrivez votre besoin — <b style={{ color: C.ink }}>nous nous occupons du reste.</b>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const STEPS = [
  {
    n: '01',
    title: 'Décrivez votre besoin',
    sub: "Service, date, heure, lieu, durée — le formulaire prend tout, sans compte si vous préférez.",
    Screen: ScreenForm,
  },
  {
    n: '02',
    title: 'Notre équipe attribue le bon prestataire',
    sub: 'Chaque dossier est vérifié : identité, évaluations, distance et disponibilité.',
    Screen: ScreenAssign,
  },
  {
    n: '03',
    title: 'Suivi en temps réel sur WhatsApp',
    sub: "Vous êtes informée à chaque étape : attribution, confirmation, intervention.",
    Screen: ScreenNotif,
  },
  {
    n: '04',
    title: 'Paiement 100 % sécurisé',
    sub: "Le montant est séquestré et libéré au prestataire seulement après la mission.",
    Screen: ScreenPay,
  },
];

const StepBlock = ({ step, duration, vertical }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = f;
  const phoneScale = vertical ? 1.0 : 0.82;
  return (
    <Scene durationInFrames={duration} style={{ background: C.primaryDark }}>
      <Grain />
      <AbsoluteFill
        style={{
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: vertical ? 40 : 90,
          padding: vertical ? 40 : 80,
        }}
      >
        <div style={{ maxWidth: vertical ? 880 : 760, opacity: fade(local, 4), transform: `translateY(${rise(local, 4)}px)`, textAlign: vertical ? 'center' : 'left' }}>
          <div
            style={{
              fontFamily: jakarta,
              fontSize: vertical ? 110 : 96,
              fontWeight: 800,
              color: 'rgba(201,161,90,.35)',
              lineHeight: 1,
            }}
          >
            {step.n}
          </div>
          <div
            style={{
              fontFamily: jakarta,
              fontSize: vertical ? 56 : 50,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              marginTop: 8,
            }}
          >
            {step.title}
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: vertical ? 30 : 25,
              color: 'rgba(255,255,255,.75)',
              lineHeight: 1.6,
              marginTop: 18,
            }}
          >
            {step.sub}
          </div>
        </div>
        <div style={{ transform: `scale(${pop(local, fps, 8)})`, marginTop: vertical ? -30 : 0 }}>
          <Phone scale={phoneScale}>
            <step.Screen scale={phoneScale} />
          </Phone>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const HOW_INTRO = 55;
const STEP_DUR = 140;

const HowItWorks = ({ vertical }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.primaryDark }}>
      <Sequence durationInFrames={HOW_INTRO}>
        <Scene durationInFrames={HOW_INTRO} style={{ background: C.primaryDark }}>
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
              style={{
                fontFamily: inter,
                fontSize: vertical ? 26 : 22,
                fontWeight: 800,
                letterSpacing: 6,
                color: C.gold,
                opacity: fade(f, 4),
              }}
            >
              COMMENT ÇA MARCHE
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: jakarta,
                fontSize: vertical ? 68 : 60,
                fontWeight: 800,
                color: '#fff',
                textAlign: 'center',
                opacity: fade(f, 12),
                transform: `translateY(${rise(f, 12)}px)`,
                padding: '0 40px',
              }}
            >
              Simple, humain, sécurisé.
            </div>
          </AbsoluteFill>
        </Scene>
      </Sequence>
      {STEPS.map((step, i) => (
        <Sequence key={step.n} from={HOW_INTRO + i * STEP_DUR} durationInFrames={STEP_DUR}>
          <StepBlock step={step} duration={STEP_DUR} vertical={vertical} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const FEATURES = [
  { icon: '🛡️', title: 'Prestataires vérifiés', sub: "Pièces d'identité contrôlées, profils validés" },
  { icon: '💰', title: 'Prix confirmé à l\u2019avance', sub: "Aucune surprise : le montant est fixé avant la mission" },
  { icon: '📲', title: 'Suivi WhatsApp', sub: 'Notifications automatiques à chaque étape' },
  { icon: '🔒', title: 'Paiement séquestré', sub: 'Fonds libérés uniquement après le service' },
];

const Features = ({ vertical }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene durationInFrames={300} style={{ background: C.cream }}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: vertical ? 50 : 70 }}>
        <div
          style={{
            fontFamily: jakarta,
            fontSize: vertical ? 62 : 56,
            fontWeight: 800,
            color: C.ink,
            textAlign: 'center',
            marginBottom: 56,
            opacity: fade(f, 4),
          }}
        >
          Pourquoi les familles <span style={{ color: C.primary }}>nous font confiance</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: vertical ? '1fr' : '1fr 1fr',
            gap: 26,
            maxWidth: vertical ? 880 : 1150,
            width: '100%',
          }}
        >
          {FEATURES.map((feat, i) => {
            const p = pop(f, fps, 16 + i * 14);
            return (
              <div
                key={feat.title}
                style={{
                  transform: `scale(${p})`,
                  background: '#fff',
                  borderRadius: 28,
                  padding: vertical ? '30px 34px' : '34px 38px',
                  boxShadow: '0 18px 50px rgba(0,0,0,.08)',
                  border: '1px solid rgba(0,0,0,.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                }}
              >
                <div
                  style={{
                    width: vertical ? 84 : 76,
                    height: vertical ? 84 : 76,
                    borderRadius: 22,
                    background: `${C.primary}14`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: vertical ? 40 : 36,
                    flexShrink: 0,
                  }}
                >
                  {feat.icon}
                </div>
                <div>
                  <div style={{ fontFamily: jakarta, fontSize: vertical ? 33 : 28, fontWeight: 800, color: C.ink }}>
                    {feat.title}
                  </div>
                  <div style={{ fontFamily: inter, fontSize: vertical ? 25 : 21, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
                    {feat.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const Mobile = ({ vertical }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene durationInFrames={300} style={{ background: C.primaryDark }}>
      <Grain />
      <AbsoluteFill
        style={{
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: vertical ? 50 : 100,
          padding: 60,
        }}
      >
        <div style={{ transform: `rotate(${interpolate(f, [0, 60], [-6, -3], clamp)}deg)` }}>
          <Phone scale={vertical ? 1.05 : 0.85}>
            <div style={{ flex: 1, padding: 14, background: C.cream }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Img src={staticFile('logo.png')} style={{ width: 34, height: 34, objectFit: 'contain' }} />
                <span style={{ fontFamily: jakarta, fontWeight: 800, fontSize: 15, color: C.ink }}>NAFISSA</span>
              </div>
              {['Tableau de bord', 'Nouvelle demande', 'Mes demandes', 'Mon planning', 'Notifications'].map((m, i) => (
                <div
                  key={m}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: i === 1 ? `${C.primary}` : '#fff',
                    color: i === 1 ? '#fff' : C.ink,
                    borderRadius: 12,
                    padding: '10px 12px',
                    marginBottom: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,.05)',
                    opacity: fade(f, 20 + i * 8),
                  }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 6, background: i === 1 ? 'rgba(255,255,255,.25)' : `${C.primary}18` }} />
                  {m}
                </div>
              ))}
              <div
                style={{
                  marginTop: 14,
                  background: '#111827',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '10px 0',
                  textAlign: 'center',
                  fontSize: 12.5,
                  fontWeight: 800,
                  opacity: fade(f, 70),
                }}
              >
                ⬇ Installer l&apos;app
              </div>
            </div>
          </Phone>
        </div>
        <div style={{ maxWidth: vertical ? 880 : 720, textAlign: vertical ? 'center' : 'left' }}>
          <div
            style={{
              fontFamily: inter,
              fontSize: vertical ? 26 : 22,
              fontWeight: 800,
              letterSpacing: 6,
              color: C.gold,
              opacity: fade(f, 8),
            }}
          >
            AUSSI SUR MOBILE
          </div>
          <div
            style={{
              fontFamily: jakarta,
              fontSize: vertical ? 58 : 52,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              marginTop: 14,
              opacity: fade(f, 16),
              transform: `translateY(${rise(f, 16)}px)`,
            }}
          >
            Votre espace NAFISSA, dans la poche.
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: vertical ? 30 : 24,
              color: 'rgba(255,255,255,.75)',
              lineHeight: 1.65,
              marginTop: 20,
              opacity: fade(f, 30),
            }}
          >
            Installez l&apos;application en un appui, directement depuis votre navigateur.
            <b style={{ color: '#fff' }}> Aucun store, aucun téléchargement lourd.</b>
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: vertical ? 'center' : 'flex-start' }}>
            {['Demandes & suivi', 'Notifications', 'Hors-ligne'].map((t, i) => (
              <div
                key={t}
                style={{
                  opacity: fade(f, 44 + i * 10),
                  transform: `translateY(${rise(f, 44 + i * 10, 20)}px)`,
                  border: '1.5px solid rgba(255,255,255,.3)',
                  color: '#fff',
                  borderRadius: 99,
                  padding: '10px 22px',
                  fontFamily: inter,
                  fontWeight: 700,
                  fontSize: vertical ? 25 : 20,
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const Cta = ({ vertical }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 1 + 0.035 * Math.sin(f / 8);
  return (
    <Scene durationInFrames={325} style={{ background: C.primaryDark }}>
      <AbsoluteFill>
        <Img
          src={staticFile('hero.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }}
        />
      </AbsoluteFill>
      <Grain />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60 }}>
        <Img
          src={staticFile('logo.png')}
          style={{
            width: vertical ? 150 : 120,
            height: vertical ? 150 : 120,
            objectFit: 'contain',
            background: '#fff',
            borderRadius: 28,
            padding: 10,
            opacity: fade(f, 4),
            transform: `scale(${pop(f, fps, 4)})`,
          }}
        />
        <div
          style={{
            marginTop: 40,
            fontFamily: jakarta,
            fontSize: vertical ? 72 : 66,
            fontWeight: 800,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.15,
            opacity: fade(f, 14),
            transform: `translateY(${rise(f, 14)}px)`,
          }}
        >
          Votre maison mérite<br />le <span style={{ color: C.gold }}>meilleur</span>.
        </div>
        <div
          style={{
            marginTop: 44,
            transform: `scale(${pulse})`,
            opacity: fade(f, 26),
            background: `linear-gradient(135deg, ${C.gold}, #B98E3F)`,
            color: '#1F2937',
            fontFamily: jakarta,
            fontWeight: 800,
            fontSize: vertical ? 40 : 34,
            padding: '24px 56px',
            borderRadius: 99,
            boxShadow: '0 20px 60px rgba(201,161,90,.45)',
          }}
        >
          nafissa.sambasy.com
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: inter,
            fontSize: vertical ? 30 : 24,
            color: 'rgba(255,255,255,.8)',
            opacity: fade(f, 40),
            textAlign: 'center',
            lineHeight: 1.7,
          }}
        >
          Décrivez votre besoin en 2 minutes — notre équipe s&apos;occupe du reste.
          <br />
          <span style={{ color: C.goldLight, fontWeight: 700 }}>+221 33 830 61 57 · +221 71 058 90 88</span>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

export const LaunchVideo = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;

  // 95 + 165 + 615 (HOW_INTRO + 4 × STEP_DUR) + 300 + 300 + 325 = 1800 frames
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Sequence durationInFrames={95}>
        <Intro vertical={vertical} />
      </Sequence>
      <Sequence from={95} durationInFrames={165}>
        <Need vertical={vertical} />
      </Sequence>
      <Sequence from={260} durationInFrames={HOW_INTRO + STEPS.length * STEP_DUR}>
        <HowItWorks vertical={vertical} />
      </Sequence>
      <Sequence from={875} durationInFrames={300}>
        <Features vertical={vertical} />
      </Sequence>
      <Sequence from={1175} durationInFrames={300}>
        <Mobile vertical={vertical} />
      </Sequence>
      <Sequence from={1475} durationInFrames={325}>
        <Cta vertical={vertical} />
      </Sequence>
    </AbsoluteFill>
  );
};
