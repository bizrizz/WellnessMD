export interface ColorPalette {
  background: string;
  backgroundSecondary: string;
  cardBackground: string;
  cardBorder: string;
  cardDark: string;
  cardDarkText: string;
  cardPeach: string;

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

export const LightColors: ColorPalette = {
  background: '#F5EFE6',
  backgroundSecondary: '#EDE7DC',
  cardBackground: '#FDFAF6',
  cardBorder: '#E0D8CC',
  cardDark: '#4A5D4A',
  cardDarkText: '#F5EFE6',
  cardPeach: '#F2DDD0',

  accent: '#6B8E6B',
  accentSecondary: '#8EAE8E',
  accentGlow: 'rgba(107, 142, 107, 0.15)',

  textPrimary: '#2C3530',
  textSecondary: 'rgba(44, 53, 48, 0.6)',
  textMuted: 'rgba(44, 53, 48, 0.38)',

  sosBlue: '#5C8AAE',
  urgentRed: '#C45555',

  warm: '#C4956A',
  warmLight: 'rgba(196, 149, 106, 0.12)',
};

export const DarkColors: ColorPalette = {
  background: '#1E2720',
  backgroundSecondary: '#252E27',
  cardBackground: '#2C362E',
  cardBorder: '#3A463C',
  cardDark: '#3A4A3A',
  cardDarkText: '#E8E0D4',
  cardPeach: 'rgba(210, 170, 140, 0.12)',

  accent: '#8EAE8E',
  accentSecondary: '#6B8E6B',
  accentGlow: 'rgba(142, 174, 142, 0.18)',

  textPrimary: '#E8E0D4',
  textSecondary: 'rgba(232, 224, 212, 0.6)',
  textMuted: 'rgba(232, 224, 212, 0.38)',

  sosBlue: '#6B9FD4',
  urgentRed: '#D97777',

  warm: '#D4A574',
  warmLight: 'rgba(212, 165, 116, 0.15)',
};

export const Colors = LightColors;
