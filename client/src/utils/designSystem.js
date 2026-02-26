// Design System - Colors, Typography, Spacing
export const colors = {
  // Primary
  primary: '#4F46E5', // Indigo/Blue
  primary_light: '#EEF2FF',
  primary_dark: '#4338CA',

  // Secondary
  secondary: '#10B981',
  secondary_light: '#ECFDF5',
  secondary_dark: '#059669',

  // Success
  success: '#10B981',
  success_light: '#ECFDF5',
  success_dark: '#059669',

  // Warning
  warning: '#F59E0B',
  warning_light: '#FFFBEB',
  warning_dark: '#D97706',

  // Danger
  danger: '#EF4444',
  danger_light: '#FEE2E2',
  danger_dark: '#DC2626',

  // Neutral
  white: '#FFFFFF',
  gray_50: '#F9FAFB',
  gray_100: '#F3F4F6',
  gray_200: '#E5E7EB',
  gray_300: '#D1D5DB',
  gray_400: '#9CA3AF',
  gray_500: '#6B7280',
  gray_600: '#4B5563',
  gray_700: '#374151',
  gray_800: '#1F2937',
  gray_900: '#111827',

  // Backgrounds
  bg_primary: '#FFFFFF',
  bg_secondary: '#F9FAFB',
  bg_tertiary: '#F3F4F6',

  // Shadows
  shadow_sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  shadow_md: '0 4px 6px -1px rgba(0,0,0,0.1)',
  shadow_lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  shadow_xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
};

export const typography = {
  // Headings - Improved readability with increased sizes
  h1: {
    fontSize: '36px',
    fontWeight: '700',
    lineHeight: '1.4',
    letterSpacing: '-0.5px',
  },
  h2: {
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '1.4',
    letterSpacing: '0.2px',
  },
  h3: {
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.5',
    letterSpacing: '0.2px',
  },
  h4: {
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '1.5',
    letterSpacing: '0.2px',
  },

  // Body - Increased from 14px to 16px for better readability
  body_lg: {
    fontSize: '18px',
    fontWeight: '400',
    lineHeight: '1.6',
    letterSpacing: '0.2px',
  },
  body: {
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '0.2px',
  },
  body_sm: {
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '0.2px',
  },

  // Labels/Tags - Improved visibility
  label: {
    fontSize: '13px',
    fontWeight: '600',
    lineHeight: '1.5',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '40px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Status badge colors
export const statusColors = {
  pending: {
    bg: colors.warning_light,
    text: '#92400E',
    border: '#FCD34D',
  },
  test_assigned: {
    bg: colors.primary_light,
    text: '#3730A3',
    border: '#C7D2FE',
  },
  approved: {
    bg: colors.success_light,
    text: '#065F46',
    border: '#A7F3D0',
  },
  rejected: {
    bg: colors.danger_light,
    text: '#7F1D1D',
    border: '#FECACA',
  },
};

// Component presets
export const componentStyles = {
  card: {
    background: colors.white,
    borderRadius: borderRadius.lg,
    boxShadow: colors.shadow_md,
    border: `1px solid ${colors.gray_200}`,
    padding: spacing.lg,
    transition: `all ${transitions.base}`,
  },
  card_hover: {
    boxShadow: colors.shadow_lg,
    borderColor: colors.gray_300,
  },
  stat_card: {
    background: colors.white,
    borderRadius: borderRadius.lg,
    boxShadow: colors.shadow_md,
    border: `1px solid ${colors.gray_200}`,
    padding: spacing.xl,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  table_header: {
    background: colors.gray_50,
    borderBottom: `2px solid ${colors.gray_200}`,
    padding: `${spacing.md} ${spacing.lg}`,
  },
  table_row: {
    borderBottom: `1px solid ${colors.gray_200}`,
    padding: `${spacing.lg}`,
    transition: `background ${transitions.base}`,
    '&:hover': {
      background: colors.gray_50,
    },
  },
};
