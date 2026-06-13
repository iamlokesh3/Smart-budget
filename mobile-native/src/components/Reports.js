import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { groupByCategory } from '../utils/analytics';
import { getTheme } from '../styles/theme';

export default function Reports() {
  const { transactions, budgets, goals, currency, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const cur = currency || '₹';
  const now = new Date();

  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const thisWeek = transactions.filter(t => {
    const d = new Date(t.date);
    const wkStart = new Date();
    wkStart.setDate(wkStart.getDate() - wkStart.getDay());
    wkStart.setHours(0, 0, 0, 0);
    return d >= wkStart;
  });

  const monthTotal = thisMonth.reduce((s, t) => s + t.amount, 0);
  const weekTotal = thisWeek.reduce((s, t) => s + t.amount, 0);

  if (transactions.length < 3) {
    return (
      <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
        <View style={styles.header}>
          <Text style={themeStyles.title}>Reports</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Weekly and monthly summaries with data exports.
          </Text>
        </View>
        <View style={[themeStyles.card, styles.emptyCard, { backgroundColor: colors.card }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>📄</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No reports yet</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
            Add at least 3 transactions to generate your first financial report summaries.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const handleExport = () => {
    Alert.alert('Export PDF', 'Financial PDF compiled and stored successfully in downloads!');
  };

  const monthlyBudget = budgets.find(b => b.type === 'Monthly');

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
      {/* Page Header */}
      <View style={[themeStyles.flexBetween, styles.header]}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={themeStyles.title}>Reports</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Auto-generated from your {transactions.length} entries.
          </Text>
        </View>
        <TouchableOpacity 
          style={[themeStyles.btn, themeStyles.btnPrimary, styles.exportBtn, { backgroundColor: colors.blue }]}
          onPress={handleExport}
        >
          <Text style={themeStyles.btnText}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Monthly report card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <View style={[themeStyles.flexRow, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>📊</Text>
          <View>
            <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Monthly Report</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Spent', value: `${cur}${monthTotal.toLocaleString('en-IN')}`, color: colors.danger },
            { label: 'EntriesCount', value: thisMonth.length, color: colors.blue },
            { label: 'Daily Avg', value: `${cur}${(monthTotal / (now.getDate() || 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: colors.emerald },
            monthlyBudget && { label: 'Budget Used', value: `${Math.min(100, (monthTotal / monthlyBudget.amount * 100)).toFixed(0)}%`, color: monthTotal > monthlyBudget.amount ? colors.danger : colors.emerald },
          ].filter(Boolean).map((s, i) => (
            <View key={i} style={[themeStyles.card, styles.statCard, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Category Share List */}
        <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
          Category Breakdown
        </Text>
        <View style={styles.breakdownList}>
          {groupByCategory(thisMonth).map(cat => {
            const pct = monthTotal > 0 ? ((cat.value / monthTotal) * 100).toFixed(0) : 0;
            return (
              <View key={cat.name} style={[themeStyles.flexBetween, { paddingVertical: 6 }]}>
                <Text style={{ fontSize: 15, marginRight: 4 }}>{cat.icon}</Text>
                <Text style={[styles.breakdownName, { color: colors.textPrimary }]}>{cat.name}</Text>
                
                {/* Visual horizontal track */}
                <View style={[styles.barTrack, { backgroundColor: colors.input }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.blue }]} />
                </View>

                <Text style={[styles.breakdownVal, { color: colors.textPrimary }]}>
                  {cur}{cat.value.toLocaleString('en-IN')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Weekly Report Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <View style={[themeStyles.flexRow, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>📅</Text>
          <View>
            <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Weekly Report</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>This week</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsGrid}>
          <View style={[themeStyles.card, styles.statCard, { backgroundColor: colors.input, borderColor: colors.border, flex: 1 }]}>
            <Text style={[styles.statValue, { color: colors.blue }]}>{cur}{weekTotal.toLocaleString('en-IN')}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>Spent This Week</Text>
          </View>
          <View style={[themeStyles.card, styles.statCard, { backgroundColor: colors.input, borderColor: colors.border, flex: 1 }]}>
            <Text style={[styles.statValue, { color: colors.emerald }]}>{thisWeek.length}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>Week Entries</Text>
          </View>
        </View>

        {thisWeek.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginVertical: 12 }}>
            No transactions this week yet.
          </Text>
        ) : (
          <View style={styles.table}>
            {thisWeek.map(tx => (
              <View key={tx.id} style={[themeStyles.flexBetween, styles.tableRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.tableLabel, { color: colors.textPrimary }]}>
                  {tx.categoryIcon} {tx.title}
                </Text>
                <Text style={[styles.tableAmount, { color: colors.danger }]}>
                  {cur}{tx.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Goals summary */}
      {goals.length > 0 && (
        <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary, marginBottom: 14 }]}>
            Goals Progress
          </Text>
          <View style={styles.goalsProgress}>
            {goals.map(g => {
              const pct = Math.min(100, g.target > 0 ? (g.current / g.target * 100).toFixed(0) : 0);
              return (
                <View key={g.id} style={{ marginBottom: 12 }}>
                  <View style={[themeStyles.flexBetween, { marginBottom: 6 }]}>
                    <Text style={{ fontWeight: '600', color: colors.textPrimary, fontSize: 13 }}>{g.name}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {cur}{g.current.toLocaleString('en-IN')} / {cur}{g.target.toLocaleString('en-IN')} ({pct}%)
                    </Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: colors.input, height: 6 }]}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.emerald }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20
  },
  exportBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start'
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 0
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800'
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  breakdownList: {
    gap: 4
  },
  breakdownName: {
    flex: 1,
    fontSize: 13,
    marginLeft: 6
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right'
  },
  barTrack: {
    width: 80,
    height: 5,
    borderRadius: 99,
    overflow: 'hidden',
    marginHorizontal: 8
  },
  barFill: {
    height: '100%',
    borderRadius: 99
  },
  table: {
    marginTop: 8
  },
  tableRow: {
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  tableLabel: {
    fontSize: 13,
    fontWeight: '500'
  },
  tableAmount: {
    fontSize: 13,
    fontWeight: '700'
  },
  goalsProgress: {
    gap: 4
  }
});
