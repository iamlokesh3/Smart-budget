import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Edit2, Check, X } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import { groupByCategory, groupByDay, groupByMonth } from '../utils/analytics';
import { getCategoryMeta } from '../utils/aiParser';
import { getTheme } from '../styles/theme';

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#06b6d4'];
const screenWidth = Dimensions.get('window').width;

export default function Analytics() {
  const { transactions, currency, renameCategory, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const [editCategoryName, setEditCategoryName] = useState(null);
  const [renameInputValue, setRenameInputValue] = useState('');
  const cur = currency || '₹';

  if (transactions.length < 3) {
    return (
      <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
        <View style={styles.header}>
          <Text style={themeStyles.title}>Analytics</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Charts and insights generated from your actual spending data.
          </Text>
        </View>
        <View style={[themeStyles.card, styles.emptyCard, { backgroundColor: colors.card }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>📊</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No analytics available yet</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
            Add at least 3 transactions to unlock charts and insights. All charts are generated dynamically from your own categories.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const categoryData = groupByCategory(transactions);
  const dailyData = groupByDay(transactions, 7); // Show last 7 days for mobile layout readability
  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);

  const startRename = (catName) => {
    setEditCategoryName(catName);
    setRenameInputValue(catName);
  };

  const handleSaveRename = (oldName) => {
    if (!renameInputValue.trim()) return;
    const newName = renameInputValue.trim();
    const meta = getCategoryMeta(newName);
    renameCategory(oldName, newName, meta.icon, meta.color);
    setEditCategoryName(null);
    setRenameInputValue('');
  };

  // Setup Line Chart Data
  const chartLabels = dailyData.map(d => d.date.split(',')[0]); // Month/day format
  const chartDataPoints = dailyData.map(d => d.amount);

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartDataPoints,
        strokeWidth: 2, // optional
      }
    ]
  };

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => colors.blue,
    labelColor: (opacity = 1) => colors.textSecondary,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.blue
    }
  };

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer} keyboardShouldPersistTaps="handled">
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={themeStyles.title}>Analytics</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Dynamic charts generated from your {transactions.length} entries across {categoryData.length} categories.
        </Text>
      </View>

      {/* Summary grid */}
      <View style={styles.summaryGrid}>
        {[
          { label: 'Total Spent', value: `${cur}${totalSpent.toLocaleString('en-IN')}`, color: colors.blue },
          { label: 'Avg / Entry', value: `${cur}${(totalSpent / transactions.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: colors.emerald },
          { label: 'Top Category', value: categoryData[0]?.name || '—', color: '#8b5cf6' },
          { label: 'Categories', value: categoryData.length, color: '#f97316' },
        ].map((s, i) => (
          <View key={i} style={[themeStyles.card, styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Daily trend line chart */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartHeader, { color: colors.textPrimary }]}>Daily Spending (Last 7 Days)</Text>
        <LineChart
          data={lineChartData}
          width={screenWidth - 48} // card has padding
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Category break downs custom native widgets */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartHeader, { color: colors.textPrimary }]}>Category Breakdown</Text>
        <View style={styles.categoryBreakdownContainer}>
          {categoryData.map((cat, i) => {
            const pct = (cat.value / totalSpent) * 100;
            const barColor = CHART_COLORS[i % CHART_COLORS.length];

            return (
              <View key={cat.name} style={styles.breakdownItem}>
                <View style={themeStyles.flexBetween}>
                  <Text style={[styles.breakdownText, { color: colors.textPrimary }]}>
                    {cat.icon} {cat.name}
                  </Text>
                  <Text style={[styles.breakdownText, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {cur}{cat.value.toLocaleString('en-IN')} ({pct.toFixed(0)}%)
                  </Text>
                </View>
                {/* Horizontal Progress Fill */}
                <View style={[styles.barTrack, { backgroundColor: colors.input }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Category Details Table */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartHeader, { color: colors.textPrimary, marginBottom: 12 }]}>Category Details</Text>
        
        {categoryData.map((cat, i) => {
          const isEditing = editCategoryName === cat.name;
          const share = ((cat.value / totalSpent) * 100).toFixed(1);

          return (
            <View key={cat.name} style={[themeStyles.flexBetween, styles.tableRow, { borderBottomColor: colors.border }]}>
              <View style={[themeStyles.flexRow, { flex: 1 }]}>
                <View style={[styles.bullet, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                <Text style={{ fontSize: 16, marginRight: 4 }}>{cat.icon}</Text>
                {isEditing ? (
                  <View style={themeStyles.flexRow}>
                    <TextInput
                      style={[themeStyles.input, styles.editInput, { color: colors.textPrimary }]}
                      value={renameInputValue}
                      onChangeText={setRenameInputValue}
                      autoFocus
                    />
                    <TouchableOpacity onPress={() => handleSaveRename(cat.name)} style={styles.actionIcon}>
                      <Check size={16} color={colors.emerald} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditCategoryName(null)} style={styles.actionIcon}>
                      <X size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>{cat.name}</Text>
                )}
              </View>

              <View style={themeStyles.flexRow}>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginRight: 12 }}>{cat.count} txs</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 14, minWidth: 60, textAlign: 'right' }}>
                  {cur}{cat.value.toLocaleString('en-IN')}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, minWidth: 45, textAlign: 'right', marginLeft: 8 }}>
                  {share}%
                </Text>
                {!isEditing && (
                  <TouchableOpacity onPress={() => startRename(cat.name)} style={styles.editBtn}>
                    <Edit2 size={13} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 0
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '800'
  },
  chartHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8
  },
  categoryBreakdownContainer: {
    gap: 16
  },
  breakdownItem: {
    width: '100%'
  },
  breakdownText: {
    fontSize: 13,
    fontWeight: '500'
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 3
  },
  tableRow: {
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  editInput: {
    width: 100,
    paddingVertical: 2,
    fontSize: 12,
    height: 28
  },
  actionIcon: {
    padding: 4,
    marginLeft: 2
  },
  editBtn: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9'
  }
});
