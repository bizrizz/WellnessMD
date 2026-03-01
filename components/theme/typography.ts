import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  title: { fontSize: 26, fontWeight: '600', letterSpacing: -0.3 },
  headline: { fontSize: 20, fontWeight: '600', letterSpacing: -0.2 },
  subheadline: { fontSize: 17, fontWeight: '500' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '500' },
  small: { fontSize: 11, fontWeight: '400' },
  large: { fontSize: 40, fontWeight: '600', letterSpacing: -0.5 },
};
