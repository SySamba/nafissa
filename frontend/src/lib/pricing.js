/** Libellés d'affichage du mode de tarification d'un service. */
const UNIT_SUFFIX = {
  heure: ' / heure',
  jour: ' / jour',
  mission: ' / mission',
  forfait: ' forfait',
};

const UNIT_OPTION_LABEL = {
  heure: 'Par heure',
  jour: 'Par jour',
  mission: 'Par mission',
  forfait: 'Forfait',
};

export function priceUnitSuffix(unit) {
  return UNIT_SUFFIX[unit] ?? ' / mission';
}

export function priceUnitOptions() {
  return Object.entries(UNIT_OPTION_LABEL).map(([value, label]) => ({ value, label }));
}
