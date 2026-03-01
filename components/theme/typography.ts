import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  title: { fontSize: 26, fontWeight: '600', letterSpacing: -0.3, fontFamily: 'Playfair Display' },
  headline: { fontSize: 20, fontWeight: '600', letterSpacing: -0.2, fontFamily: 'Playfair Display' },
  subheadline: { fontSize: 17, fontWeight: '500', fontFamily: 'Playfair Display' },
  body: { fontSize: 15, fontWeight: '400', fontFamily: 'Lato' },
  caption: { fontSize: 13, fontWeight: '500', fontFamily: 'Lato' },
  small: { fontSize: 11, fontWeight: '400', fontFamily: 'Lato' },
  large: { fontSize: 40, fontWeight: '600', letterSpacing: -0.5, fontFamily: 'Playfair Display' },
};
