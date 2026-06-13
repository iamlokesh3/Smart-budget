import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

const actionCards = [
  { id: 'entries',  icon: '✍️', color: '#eff6ff', border: '#3b82f6', title: 'Add Entry', desc: 'Record a transaction naturally', page: 'entries' },
  { id: 'chatbot', icon: '🤖', color: '#ecfdf5', border: '#10b981', title: 'Ask AI Advisor', desc: 'Get personalized financial guidance', page: 'chatbot' },
  { id: 'budgets', icon: '📋', color: '#f3e8ff', border: '#8b5cf6', title: 'Create Budget', desc: 'Set daily, weekly, or monthly limits', page: 'budgets' },
  { id: 'goals',   icon: '🎯', color: '#fff7ed', border: '#f97316', title: 'Create Goal', desc: 'Save towards something special', page: 'goals' },
];

export default function Dashboard() {
  const { user, setPage, transactions, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);
  
  const userName = user?.name || 'User';

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
      {/* Welcome Hero */}
      <View style={styles.welcomeHero}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={[themeStyles.title, styles.welcomeTitle]}>
          Welcome, <Text style={{ color: colors.blue }}>{userName}</Text>
        </Text>
        <Text style={[styles.welcomeDesc, { color: colors.textSecondary }]}>
          {transactions.length === 0
            ? 'You have not added any financial information yet. Start by recording your first transaction or chatting with your AI advisor.'
            : `You have successfully started building your financial ecosystem with ${transactions.length} entries. Keep recording or chat with your AI advisor.`
          }
        </Text>
      </View>

      {/* Action cards Grid */}
      <View style={styles.gridContainer}>
        {actionCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.8}
            style={[
              themeStyles.card,
              styles.actionCard,
              { borderColor: colors.border, backgroundColor: colors.card }
            ]}
            onPress={() => setPage(card.page)}
          >
            <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
              <Text style={{ fontSize: 28 }}>{card.icon}</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{card.title}</Text>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{card.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  welcomeHero: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center'
  },
  welcomeDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 8
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4
  },
  actionCard: {
    width: '48%', // double-column layout
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    marginBottom: 16
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center'
  },
  cardDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16
  }
});
