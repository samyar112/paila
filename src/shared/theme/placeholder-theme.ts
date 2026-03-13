export const colors = {
  background: '#F5F3EE',
  card: '#FFFFFF',
  border: '#DDE2D6',
  primary: '#2E3A2E',
  text: '#2E3A2E',
  mutedText: '#7C8B6F',
  accent: '#6AB04C',
  accentDeep: '#4A9B3F',
  sage: '#B8C5A2',
  error: '#b42318',
  errorBackground: '#FFF3F0',
  overlay: 'rgba(46, 58, 46, 0.5)',
  adBanner: '#E8EDE2',
  adBannerBorder: '#D0D9C6',
  notification: '#4A9B3F',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  button: 14,
  lg: 16,
  xl: 20,
  pill: 24,
} as const;

export const typography = {
  caption: { fontSize: 11, fontWeight: '500' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 24 },
  bodyLarge: { fontSize: 17, fontWeight: '600' as const },
  heading: { fontSize: 20, fontWeight: '700' as const },
  title: { fontSize: 28, fontWeight: '800' as const },
  hero: { fontSize: 48, fontWeight: '800' as const },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

// Alias for backwards compatibility with navigator + scaffold
export const placeholderTheme = colors;

