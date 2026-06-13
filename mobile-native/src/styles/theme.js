import { StyleSheet } from 'react-native';

export const COLORS = {
  light: {
    bg: '#ffffff',
    bgSubtle: '#f8fafc',
    card: '#ffffff',
    input: '#f1f5f9',
    border: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    blue: '#3b82f6',
    blueDark: '#2563eb',
    blueLight: '#eff6ff',
    emerald: '#10b981',
    emeraldDark: '#059669',
    emeraldLight: '#ecfdf5',
    warning: '#f59e0b',
    danger: '#ef4444',
    success: '#10b981'
  },
  dark: {
    bg: '#0f172a',
    bgSubtle: '#1e293b',
    card: '#1e293b',
    input: '#334155',
    border: '#334155',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    blue: '#60a5fa',
    blueDark: '#3b82f6',
    blueLight: '#1e3a5f',
    emerald: '#34d399',
    emeraldDark: '#10b981',
    emeraldLight: '#064e3b',
    warning: '#f59e0b',
    danger: '#ef4444',
    success: '#34d399'
  }
};

export const getTheme = (isDark) => {
  const colors = isDark ? COLORS.dark : COLORS.light;

  const baseStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg
    },
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: colors.bgSubtle,
      padding: 16
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2
    },
    title: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 8
    },
    subtitle: {
      fontFamily: 'System',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16
    },
    inputGroup: {
      marginBottom: 12
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 6
    },
    input: {
      backgroundColor: colors.input,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.textPrimary
    },
    btn: {
      borderRadius: 9999,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
    },
    btnPrimary: {
      backgroundColor: colors.blue
    },
    btnEmerald: {
      backgroundColor: colors.emerald
    },
    btnOutline: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
      borderWidth: 1.5
    },
    btnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#ffffff'
    },
    btnTextOutline: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 9999,
      alignSelf: 'flex-start'
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700'
    },
    flexRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    flexBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  });

  return { colors, styles: baseStyles };
};
