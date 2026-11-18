/**
 * Classement des catégories par type de services + textes explicatifs.
 * Un prestataire ne propose qu'un seul type (règle aussi appliquée côté API).
 * Le classement se fait sur le nom de la catégorie : une nouvelle catégorie
 * créée en base est automatiquement rangée dans le bon type.
 */

export const SERVICE_GROUPS = [
  {
    key: 'personnel',
    label: 'Services à la personne',
    desc: 'Pour le quotidien de la maison et de la famille.',
  },
  {
    key: 'technique',
    label: 'Services techniques',
    desc: 'Dépannages, installations et réparations à domicile.',
  },
  {
    key: 'soutien',
    label: 'Soutien scolaire',
    desc: 'Accompagnement et cours particuliers pour vos enfants.',
  },
];

const GROUP_RULES = [
  [/scolaire|soutien|cours|devoirs/i, 'soutien'],
  [/plomb|[ée]lectri|menuis|r[ée]paration|d[ée]pann|bricol|peint|ma[çc]on|clim|froid/i, 'technique'],
];

export function serviceGroupOf(category) {
  const name = String(category?.name || '');
  const hit = GROUP_RULES.find(([re]) => re.test(name));
  return hit ? hit[1] : 'personnel';
}

export function groupLabel(key) {
  return SERVICE_GROUPS.find((g) => g.key === key)?.label ?? '';
}

/** [{ key, label, desc, categories: [...] }] — types vides exclus. */
export function groupCategories(categories) {
  return SERVICE_GROUPS
    .map((g) => ({ ...g, categories: categories.filter((c) => serviceGroupOf(c) === g.key) }))
    .filter((g) => g.categories.length > 0);
}

const DETAILS = [
  [/m[ée]nage|nettoyage/i, {
    text: 'Un intérieur propre sans y passer vos week-ends : entretien courant ou grand nettoyage.',
    points: ['Sols, cuisine et sanitaires', 'Rangement et poussière', 'Ponctuel ou régulier'],
  }],
  [/garde|nounou|enfant/i, {
    text: 'Une personne de confiance pour veiller sur vos enfants, le jour, le soir ou le week-end.',
    points: ['Garde à domicile', 'Sorties d\u2019école et repas', 'Profils vérifiés'],
  }],
  [/couture|retouche/i, {
    text: 'Confection et retouches de vos tenues, du boubou traditionnel au vêtement du quotidien.',
    points: ['Confection sur mesure', 'Retouches et ourlets', 'Wax, bazin et tissus fins'],
  }],
  [/coiff/i, {
    text: 'Votre coiffure réalisée chez vous, à l\u2019heure qui vous convient.',
    points: ['Tresses et tissages', 'Soins capillaires', 'Coiffures d\u2019événement'],
  }],
  [/scolaire|soutien|cours/i, {
    text: 'Un accompagnement personnalisé pour aider votre enfant à progresser et reprendre confiance.',
    points: ['Aide aux devoirs', 'Maths, français, sciences', 'Primaire au lycée'],
  }],
  [/plomb/i, {
    text: 'Fuite, robinet ou installation sanitaire : un plombier intervient rapidement chez vous.',
    points: ['Fuites et débouchage', 'Robinetterie', 'Chauffe-eau et sanitaires'],
  }],
  [/[ée]lectri/i, {
    text: 'Panne, prise ou installation neuve : un électricien qualifié en toute sécurité.',
    points: ['Dépannage de pannes', 'Prises et éclairage', 'Mise aux normes'],
  }],
  [/menuis|bois/i, {
    text: 'Montage, réparation ou fabrication de mobilier et de boiseries.',
    points: ['Montage de meubles', 'Portes et placards', 'Réparations bois'],
  }],
  [/lavage|repassage|linge/i, {
    text: 'Votre linge lavé, séché et repassé avec soin.',
    points: ['Lavage et séchage', 'Repassage', 'Linge délicat'],
  }],
];

/** Texte explicatif d'une catégorie (repli : description en base). */
export function serviceDetails(category) {
  const name = String(category?.name || '');
  const hit = DETAILS.find(([re]) => re.test(name));
  return hit ? hit[1] : { text: category?.description || '', points: [] };
}
