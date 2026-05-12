const primary = '#1B5FAD';
const secondary = '#2D8E41';
const muted = '#64748B';

const light = {
  primary,
  secondary,
  muted,
  text: '#0f172a',
  textMuted: '#64748B',
  tint: primary,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  danger: '#EF4444',
  tabIconDefault: '#94A3B8',
};

const dark = {
  ...light,
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  background: '#0B1221',
  surface: '#111827',
  border: '#1E293B',
  tabIconDefault: '#64748B',
};

export default {
  light,
  dark,
};
