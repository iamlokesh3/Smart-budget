import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Plus, Trash2, Wallet } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

const BUDGET_TYPES = ['Daily', 'Weekly', 'Monthly'];

export default function BudgetPlanner() {
  const { budgets, addBudget, deleteBudget, transactions, currency, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const [selectedType, setSelectedType] = useState('Monthly');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const cur = currency || '₹';

  const now = new Date();

  const getSpent = (type) => {
    let from = new Date();
    if (type === 'Daily') {
      from.setHours(0, 0, 0, 0);
    } else if (type === 'Weekly') {
      from.setDate(from.getDate() - from.getDay());
      from.setHours(0, 0, 0, 0);
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return transactions
      .filter(t => new Date(t.date) >= from)
      .reduce((s, t) => s + t.amount, 0);
  };

  const handleAdd = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    addBudget({
      id: Date.now().toString(),
      type: selectedType,
      amount: num,
      createdAt: new Date().toISOString(),
    });
    setAmount('');
    setError('');
  };

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer} keyboardShouldPersistTaps="handled">
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={[themeStyles.title, { marginBottom: 4 }]}>Budget Planner</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Set daily, weekly, or monthly spending limits. Progress bars appear once you have transactions.
        </Text>
      </View>

      {/* Create Budget Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[themeStyles.flexRow, { marginBottom: 16 }]}>
          <Wallet size={16} color={colors.blue} />
          <Text style={[styles.cardHeader, { color: colors.textPrimary, marginLeft: 6 }]}>Create Budget</Text>
        </View>

        {/* Budget Type buttons */}
        <View style={styles.budgetTypesRow}>
          {BUDGET_TYPES.map(t => {
            const isSelected = selectedType === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeBtn, 
                  { borderColor: colors.border },
                  isSelected && [styles.typeBtnSelected, { backgroundColor: colors.blueLight, borderColor: colors.blue }]
                ]}
                onPress={() => setSelectedType(t)}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? colors.blue : colors.textSecondary }}>
                  {t === 'Daily' ? '📅 ' : t === 'Weekly' ? '📆 ' : '📊 '}
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input & Add Button */}
        <View style={[themeStyles.inputGroup, { marginBottom: 0 }]}>
          <Text style={themeStyles.label}>{selectedType} Budget Amount</Text>
          <View style={themeStyles.flexRow}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={[styles.currencyText, { color: colors.textMuted }]}>{cur}</Text>
              <TextInput
                style={[themeStyles.input, { paddingLeft: 28, height: 46 }]}
                keyboardType="numeric"
                placeholder="e.g. 5000"
                placeholderTextColor={colors.textMuted}
                value={amount}
                onChangeText={val => { setAmount(val); setError(''); }}
              />
            </View>
            <TouchableOpacity 
              style={[themeStyles.btn, themeStyles.btnPrimary, styles.addBtn, { backgroundColor: colors.blue }]}
              onPress={handleAdd}
            >
              <Plus size={16} color="#fff" />
              <Text style={[themeStyles.btnText, { marginLeft: 4 }]}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!!error && (
          <Text style={{ color: colors.danger, fontSize: 12, marginTop: 8, fontWeight: '500' }}>{error}</Text>
        )}
      </View>

      {/* Budgets List Content */}
      {budgets.length === 0 ? (
        <View style={[themeStyles.card, styles.emptyCard, { backgroundColor: colors.card }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>📋</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No budgets yet</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
            Create your first budget above. Progress bars will appear automatically once you have matching transactions.
          </Text>
        </View>
      ) : (
        <View style={styles.budgetsList}>
          {budgets.map(b => {
            const spent = getSpent(b.type);
            const pct = Math.min(100, b.amount > 0 ? (spent / b.amount) * 100 : 0);
            const over = spent > b.amount;
            const hasTransactions = transactions.length > 0;

            return (
              <View key={b.id} style={[themeStyles.card, { backgroundColor: colors.card }]}>
                <View style={themeStyles.flexBetween}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={themeStyles.flexRow}>
                      <Text style={{ fontSize: 20 }}>
                        {b.type === 'Daily' ? '📅' : b.type === 'Weekly' ? '📆' : '📊'}
                      </Text>
                      <Text style={[styles.cardHeader, { color: colors.textPrimary, marginLeft: 6 }]}>
                        {b.type} Budget
                      </Text>
                      {over && (
                        <View style={[themeStyles.badge, { backgroundColor: colors.danger + '15', marginLeft: 8 }]}>
                          <Text style={{ color: colors.danger, fontSize: 10, fontWeight: '700' }}>Exceeded</Text>
                        </View>
                      )}
                    </View>

                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 6 }}>
                      Limit: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{cur}{b.amount.toLocaleString('en-IN')}</Text>
                    </Text>

                    {hasTransactions && (
                      <View style={{ marginTop: 4 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                          Spent: <Text style={{ fontWeight: '700', color: over ? colors.danger : colors.textPrimary }}>
                            {cur}{spent.toLocaleString('en-IN')}
                          </Text>
                          {' · '}Remaining:{' '}
                          <Text style={{ fontWeight: '700', color: over ? colors.danger : colors.emerald }}>
                            {over ? `-${cur}${(spent - b.amount).toLocaleString('en-IN')}` : `${cur}${(b.amount - spent).toLocaleString('en-IN')}`}
                          </Text>
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity onPress={() => deleteBudget(b.id)} style={styles.trashBtn}>
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                {hasTransactions ? (
                  <View style={{ marginTop: 16 }}>
                    {/* Progress Bar Track */}
                    <View style={[styles.progressTrack, { backgroundColor: colors.input }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${pct}%` },
                          over ? { backgroundColor: colors.danger } : { backgroundColor: colors.blue }
                        ]} 
                      />
                    </View>
                    
                    <View style={[themeStyles.flexBetween, { marginTop: 6 }]}>
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{pct.toFixed(1)}% used</Text>
                      <Text style={{ color: over ? colors.danger : colors.emerald, fontSize: 11, fontWeight: '700' }}>
                        {over ? '⚠️ Over budget' : '✅ On track'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.tipBox, { backgroundColor: colors.bgSubtle }]}>
                    <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                      Add transactions to see your progress bar
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700'
  },
  budgetTypesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: 'transparent'
  },
  typeBtnSelected: {
    borderWidth: 1.5
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center'
  },
  currencyText: {
    position: 'absolute',
    left: 12,
    fontSize: 15,
    fontWeight: '700',
    zIndex: 10
  },
  addBtn: {
    marginLeft: 8,
    height: 46,
    borderRadius: 8,
    paddingHorizontal: 16
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
  budgetsList: {
    gap: 12
  },
  trashBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignSelf: 'flex-start'
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  tipBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 8
  }
});
