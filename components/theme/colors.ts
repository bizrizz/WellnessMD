export interface ColorPalette {
  background: string;
  backgroundSecondary: string;
  cardBackground: string;
  cardBorder: string;

  accent: string;
  accentSecondary: string;
  accentGlow: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  sosBlue: string;
  urgentRed: string;

  warm: string;
  warmLight: string;
}

export const DarkColors: ColorPalette = {
  background: '#121212',
  backgroundSecondary: '#1A1A1A',
  cardBackground: '#1E1E1E',
  cardBorder: '#2A2A2A',

  accent: '#7CB8A4',
  accentSecondary: '#5A9E88',
  accentGlow: 'rgba(124, 184, 164, 0.2)',

  textPrimary: '#F5F5F5',
  textSecondary: 'rgba(245, 245, 245, 0.65)',
  textMuted: 'rgba(245, 245, 245, 0.4)',

  sosBlue: '#6B9FD4',
  urgentRed: '#D97777',

  warm: '#D4A574',
  warmLight: 'rgba(212, 165, 116, 0.15)',
};

export const LightColors: ColorPalette = {
  background: '#F7F5F2',
  backgroundSecondary: '#EDEAE5',
  cardBackground: '#FFFFFF',
  cardBorder: '#E2DDD6',

  accent: '#5A9E88',
  accentSecondary: '#7CB8A4',
  accentGlow: 'rgba(90, 158, 136, 0.15)',

  textPrimary: '#1C1C1E',
  textSecondary: 'rgba(28, 28, 30, 0.6)',
  textMuted: 'rgba(28, 28, 30, 0.35)',

  sosBlue: '#4A80B4',
  urgentRed: '#C45555',

  warm: '#B8864A',
  warmLight: 'rgba(184, 134, 74, 0.12)',
};

export const Colors = DarkColors;
