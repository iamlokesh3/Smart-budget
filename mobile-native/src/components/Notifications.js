import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

export default function Notifications() {
  const { notifications, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const typeStyle = {
    danger: { bg: '#fef2f2', border: '#fecaca', iconBg: '#fee2e2', color: '#b91c1c' },
    warning: { bg: '#fffbeb', border: '#fde68a', iconBg: '#fef3c7', color: '#b45309' },
    success: { bg: '#ecfdf5', border: '#a7f3d0', iconBg: '#d1fae5', color: '#065f46' },
  };

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={themeStyles.title}>Notifications</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Alerts and updates based on your spending behavior.
        </Text>
      </View>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <View style={[themeStyles.card, styles.emptyCard, { backgroundColor: colors.card }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🔔</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No notifications</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
            Alerts are generated automatically based on your spending — budget overruns, goal completions, and spending increases will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {notifications.map((n) => {
            const s = typeStyle[n.type] || typeStyle.warning;
            const dateStr = new Date(n.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

            return (
              <View 
                key={n.id} 
                style={[
                  styles.notifItem, 
                  { backgroundColor: s.bg, borderColor: s.border }
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: s.iconBg }]}>
                  <Text style={{ fontSize: 16 }}>{n.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.notifTitle, { color: s.color }]}>{n.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{n.message}</Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>{dateStr}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Legends Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.blueLight, borderColor: colors.blue + '30' }]}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.blue, marginBottom: 12 }}>
          How notifications work
        </Text>
        <View style={styles.legendList}>
          {[
            ['⚠️', 'Budget Exceeded — when spending surpasses a budget limit'],
            ['🔔', 'Budget Alert — when 80%+ of a budget is used'],
            ['🎉', 'Goal Achieved — when a savings goal is completed'],
          ].map(([icon, text], i) => (
            <View key={i} style={themeStyles.flexRow}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>{icon}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  list: {
    gap: 10,
    marginBottom: 20
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  legendList: {
    gap: 8
  }
});
