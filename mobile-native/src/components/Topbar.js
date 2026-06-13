import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Moon, Sun, Menu } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

const pageTitles = {
  dashboard: 'Dashboard',
  entries: 'Smart Entries',
  chatbot: 'AI Advisor',
  budgets: 'Budget Planner',
  goals: 'Savings Goals',
  analytics: 'Analytics',
  health: 'Financial Health',
  reports: 'Reports',
  notifications: 'Notifications',
  profile: 'Profile',
  settings: 'Settings',
};

export default function Topbar({ onMenuClick }) {
  const { user, page, darkMode, setDarkMode, notifications, setPage } = useApp();
  const { colors } = getTheme(darkMode);

  const userInitial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <View style={[styles.topbar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onMenuClick} style={[styles.btnIcon, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Menu size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {pageTitles[page] || 'Dashboard'}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {/* Dark Mode Switcher */}
        <TouchableOpacity 
          style={[styles.btnIcon, { backgroundColor: colors.input, borderColor: colors.border }]} 
          onPress={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun size={17} color={colors.textPrimary} /> : <Moon size={17} color={colors.textPrimary} />}
        </TouchableOpacity>

        {/* Notifications Trigger */}
        <TouchableOpacity 
          style={[styles.btnIcon, { backgroundColor: colors.input, borderColor: colors.border }]} 
          onPress={() => setPage('notifications')}
        >
          <Bell size={17} color={colors.textPrimary} />
          {notifications.length > 0 && (
            <View style={[styles.unreadDot, { backgroundColor: colors.danger, borderColor: colors.card }]} />
          )}
        </TouchableOpacity>

        {/* Profile Avatar Trigger */}
        {user && (
          <TouchableOpacity 
            style={[styles.avatar, { backgroundColor: colors.blue }]} 
            onPress={() => setPage('profile')}
          >
            <Text style={styles.avatarText}>{userInitial}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    height: 60,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '700'
  },
  btnIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  }
});
