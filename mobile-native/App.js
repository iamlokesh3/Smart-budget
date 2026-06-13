import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MessageSquare } from 'lucide-react-native';

import { AppProvider, useApp } from './src/context/AppContext';
import { getTheme } from './src/styles/theme';

import Landing from './src/components/Landing';
import Auth from './src/components/Auth';
import Sidebar from './src/components/Sidebar';
import Topbar from './src/components/Topbar';
import Dashboard from './src/components/Dashboard';
import SmartEntry from './src/components/SmartEntry';
import BudgetPlanner from './src/components/BudgetPlanner';
import Goals from './src/components/Goals';
import Analytics from './src/components/Analytics';
import Chatbot from './src/components/Chatbot';
import Notifications from './src/components/Notifications';
import Reports from './src/components/Reports';
import HealthScore from './src/components/HealthScore';
import Profile from './src/components/Profile';
import Settings from './src/components/Settings';

function AppShell() {
  const { user, page, setPage, darkMode } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { colors } = getTheme(darkMode);

  // Public/Unauthenticated Screens
  if (!user) {
    if (page === 'auth') {
      return (
        <>
          <StatusBar style={darkMode ? 'light' : 'dark'} />
          <Auth />
        </>
      );
    }
    return (
      <>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
        <Landing />
      </>
    );
  }

  // Page Routing Map
  const pageMap = {
    dashboard: <Dashboard />,
    entries: <SmartEntry />,
    chatbot: <Chatbot />,
    budgets: <BudgetPlanner />,
    goals: <Goals />,
    analytics: <Analytics />,
    health: <HealthScore />,
    reports: <Reports />,
    notifications: <Notifications />,
    profile: <Profile />,
    settings: <Settings />,
  };

  const currentPage = pageMap[page] || <Dashboard />;

  return (
    <SafeAreaView style={[styles.appShell, { backgroundColor: colors.bg }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      
      {/* Drawer navigation menu */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <View style={[styles.mainContent, { backgroundColor: colors.bgSubtle }]}>
        {/* Header toolbar */}
        <Topbar onMenuClick={() => setMobileOpen(prev => !prev)} />
        
        {/* Screen container */}
        <View style={styles.pageContainer}>
          {currentPage}
        </View>
      </View>

      {/* Floating Action Button (FAB) for AI Advisor (not visible on chatbot screen itself) */}
      {page !== 'chatbot' && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.fab, { backgroundColor: colors.blue }]}
          onPress={() => setPage('chatbot')}
        >
          <MessageSquare size={22} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
