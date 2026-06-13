import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Zap, LayoutDashboard, PenLine, Wallet, Target, BarChart3, FileText, Bell, User, Settings, Heart, MessageSquare, LogOut, X } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

const screenWidth = Dimensions.get('window').width;

const getIcon = (id, color) => {
  const map = {
    dashboard: <LayoutDashboard size={18} color={color} />,
    entries: <PenLine size={18} color={color} />,
    chatbot: <MessageSquare size={18} color={color} />,
    budgets: <Wallet size={18} color={color} />,
    goals: <Target size={18} color={color} />,
    analytics: <BarChart3 size={18} color={color} />,
    health: <Heart size={18} color={color} />,
    reports: <FileText size={18} color={color} />,
    notifications: <Bell size={18} color={color} />,
    profile: <User size={18} color={color} />,
    settings: <Settings size={18} color={color} />
  };
  return map[id] || <Zap size={18} color={color} />;
};

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',     section: 'main' },
  { id: 'entries',      label: 'Smart Entries',  section: 'main' },
  { id: 'chatbot',      label: 'AI Advisor',     section: 'main' },
  { id: 'budgets',      label: 'Budgets',        section: 'finance' },
  { id: 'goals',        label: 'Goals',          section: 'finance' },
  { id: 'analytics',   label: 'Analytics',      section: 'finance' },
  { id: 'health',       label: 'Health Score',   section: 'finance' },
  { id: 'reports',      label: 'Reports',        section: 'insights' },
  { id: 'notifications',label: 'Notifications',  section: 'insights' },
  { id: 'profile',      label: 'Profile',        section: 'account' },
  { id: 'settings',     label: 'Settings',       section: 'account' },
];

const sectionLabels = { main: 'Main', finance: 'Finance', insights: 'Insights', account: 'Account' };

export default function Sidebar({ mobileOpen, onClose }) {
  const { page, setPage, user, logout, notifications, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const sections = ['main', 'finance', 'insights', 'account'];

  const navigate = (id) => {
    setPage(id);
    onClose?.();
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <Modal
      transparent
      visible={mobileOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Clickable backdrop */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        {/* Drawer Panel */}
        <View style={[styles.drawerPanel, { backgroundColor: colors.bg, borderRightColor: colors.border }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={[styles.logoHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.logoIcon, { backgroundColor: colors.blue }]}>
                <Zap size={14} color="#fff" />
              </View>
              <Text style={[styles.logoText, { color: colors.textPrimary }]}>
                Smart<Text style={{ color: colors.blue }}>Budget</Text>
              </Text>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.input }]}>
                <X size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Nav Menu */}
            <ScrollView contentContainerStyle={styles.navScroll}>
              {sections.map(sec => {
                const items = navItems.filter(n => n.section === sec);
                return (
                  <View key={sec} style={styles.sectionBlock}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{sectionLabels[sec]}</Text>
                    {items.map(item => {
                      const isActive = page === item.id;
                      const iconColor = isActive ? colors.blue : colors.textSecondary;

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.navItem, 
                            isActive && [styles.activeNavItem, { backgroundColor: colors.blueLight }]
                          ]}
                          onPress={() => navigate(item.id)}
                        >
                          {getIcon(item.id, iconColor)}
                          <Text style={[
                            styles.navText, 
                            { color: isActive ? colors.blue : colors.textSecondary, fontWeight: isActive ? '700' : '500' }
                          ]}>
                            {item.label}
                          </Text>
                          {item.id === 'notifications' && notifications.length > 0 && (
                            <View style={[styles.badgeContainer, { backgroundColor: colors.danger }]}>
                              <Text style={styles.badgeText}>{notifications.length}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>

            {/* Footer Profiler */}
            {user && (
              <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
                <View style={[styles.avatar, { backgroundColor: colors.blue }]}>
                  <Text style={styles.avatarText}>{userInitial}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                  <LogOut size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.45)'
  },
  backdrop: {
    flex: 1
  },
  drawerPanel: {
    width: screenWidth * 0.75,
    maxWidth: 280,
    height: '100%',
    borderRightWidth: 1,
    elevation: 16
  },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1
  },
  logoIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800'
  },
  closeBtn: {
    marginLeft: 'auto',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navScroll: {
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  sectionBlock: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    paddingLeft: 8,
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2
  },
  activeNavItem: {
    borderRadius: 8
  },
  navText: {
    fontSize: 13,
    marginLeft: 10
  },
  badgeContainer: {
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700'
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  userInfo: {
    flex: 1,
    marginRight: 6
  },
  userName: {
    fontSize: 12,
    fontWeight: '600'
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2'
  }
});
