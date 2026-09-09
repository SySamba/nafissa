// NAFISSA — Identité visuelle
const primary = '#44512F';   // Vert olive profond
const secondary = '#C9A15A'; // Doré sable
const muted = '#6B6456';

const light = {
  primary,
  primaryDark: '#333D24',
  secondary,
  secondaryDark: '#A8843F',
  muted,
  text: '#2A2A22',
  textMuted: '#6B6456',
  tint: primary,
  background: '#F7F5F2', // Blanc cassé
  surface: '#FFFFFF',
  border: '#E5E0D6',
  danger: '#DC4C3F',
  tabIconDefault: '#A8A293',
};

const dark = {
  ...light,
  text: '#F7F5F2',
  textMuted: '#B5AE9E',
  background: '#1E2117',
  surface: '#2A2E20',
  border: '#3A3F2C',
  tabIconDefault: '#8A8470',
};

export default {
  light,
  dark,
};
