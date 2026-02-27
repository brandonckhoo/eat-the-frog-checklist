// ElevenLabs-inspired pastel / light mode palette
export const colors = {
  // Backgrounds
  black900: '#EEECEA',    // subtle bg variant
  black800: '#F5F4F1',    // primary screen background (warm off-white)

  // Surfaces & structure
  grey800: '#FFFFFF',     // cards, modals, sheets
  grey700: '#EFEEEA',     // inputs, secondary surfaces
  grey600: '#E5E3DE',     // borders, dividers
  grey400: '#AEADA7',     // muted / placeholder text
  grey300: '#69696A',     // secondary text
  grey100: '#F5F4F1',     // (kept for compat)

  // Brand amber (replaces yellow — readable on light bg)
  yellow500: '#D4880C',   // primary accent — 4.6:1 contrast on white
  yellow600: '#B87208',   // darker amber
  yellow100: '#FEF3DC',   // ambient tint

  // Column accents — muted pastels
  coral: '#D46B5A',
  coralDim: 'rgba(212,107,90,0.1)',
  coralBorder: 'rgba(212,107,90,0.3)',

  skyBlue: '#5C8DC5',
  skyBlueDim: 'rgba(92,141,197,0.1)',
  skyBlueBorder: 'rgba(92,141,197,0.3)',

  mint: '#5EA87A',
  mintDim: 'rgba(94,168,122,0.1)',
  mintBorder: 'rgba(94,168,122,0.3)',

  // Text
  white: '#1A1A17',       // PRIMARY TEXT (dark in light mode — semantic inversion)
  dark: '#1A1A17',        // explicit dark for text-on-accent buttons

  error: '#D46B5A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
} as const;

export const COLUMN_CONFIG = {
  do_first: {
    label: 'Do First',
    subtitle: 'Urgent',
    accent: colors.coral,
    dim: colors.coralDim,
    border: colors.coralBorder,
  },
  do_later: {
    label: 'Do Later',
    subtitle: 'Less urgent but important',
    accent: colors.skyBlue,
    dim: colors.skyBlueDim,
    border: colors.skyBlueBorder,
  },
  do_free: {
    label: 'Do When Free',
    subtitle: 'Neither urgent nor important',
    accent: colors.mint,
    dim: colors.mintDim,
    border: colors.mintBorder,
  },
} as const;

export const COLUMNS: Array<keyof typeof COLUMN_CONFIG> = [
  'do_first',
  'do_later',
  'do_free',
];
