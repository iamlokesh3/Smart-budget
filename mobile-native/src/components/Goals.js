import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Plus, Trash2, PlusCircle } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, currency, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const cur = currency || '₹';
  const [form, setForm] = useState({ name: '', target: '', current: '' });
  const [error, setError] = useState('');
  const [addingFunds, setAddingFunds] = useState(null);
  const [fundAmt, setFundAmt] = useState('');

  const updateField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setError('');
  };

  const handleAdd = () => {
    if (!form.name.trim()) return setError('Please enter a goal name.');
    const target = parseFloat(form.target);
    if (!target || target <= 0) return setError('Please enter a valid target amount.');
    const current = parseFloat(form.current) || 0;

    addGoal({
      id: Date.now().toString(),
      name: form.name.trim(),
      target,
      current,
      createdAt: new Date().toISOString(),
    });
    setForm({ name: '', target: '', current: '' });
    setError('');
  };

  const addFunds = (id) => {
    const amt = parseFloat(fundAmt);
    if (!amt || amt <= 0) return;
    const goal = goals.find(g => g.id === id);
    if (goal) {
      updateGoal(id, { current: Math.min(goal.target, goal.current + amt) });
    }
    setAddingFunds(null);
    setFundAmt('');
  };

  const estimateETA = (goal) => {
    if (goal.current >= goal.target) return 'Completed! 🎉';
    const remaining = goal.target - goal.current;
    // Assume user adds ~₹3000/month if no specific saving rate known
    const monthlyRate = 3000;
    const months = Math.ceil(remaining / monthlyRate);
    const eta = new Date();
    eta.setMonth(eta.getMonth() + months);
    return `~${eta.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
  };

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer} keyboardShouldPersistTaps="handled">
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={[themeStyles.title, { marginBottom: 4 }]}>Savings Goals</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Create goals and track your progress towards financial targets.
        </Text>
      </View>

      {/* Create Goal Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[themeStyles.flexRow, { marginBottom: 16 }]}>
          <Text style={{ fontSize: 20 }}>🎯</Text>
          <Text style={[styles.cardHeader, { color: colors.textPrimary, marginLeft: 6 }]}>Create New Goal</Text>
        </View>

        <View style={themeStyles.inputGroup}>
          <Text style={themeStyles.label}>Goal Name</Text>
          <TextInput
            style={[themeStyles.input, { color: colors.textPrimary }]}
            placeholder="e.g. Laptop, Vacation, Emergency Fund"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={val => updateField('name', val)}
          />
        </View>

        <View style={styles.row}>
          <View style={[themeStyles.inputGroup, { flex: 1 }]}>
            <Text style={themeStyles.label}>Target ({cur})</Text>
            <TextInput
              style={[themeStyles.input, { color: colors.textPrimary }]}
              keyboardType="numeric"
              placeholder="e.g. 50000"
              placeholderTextColor={colors.textMuted}
              value={form.target}
              onChangeText={val => updateField('target', val)}
            />
          </View>
          <View style={[themeStyles.inputGroup, { flex: 1 }]}>
            <Text style={themeStyles.label}>Current ({cur}) <Text style={{ color: colors.textMuted, fontSize: 11 }}>opt</Text></Text>
            <TextInput
              style={[themeStyles.input, { color: colors.textPrimary }]}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={form.current}
              onChangeText={val => updateField('current', val)}
            />
          </View>
        </View>

        {!!error && (
          <Text style={{ color: colors.danger, fontSize: 12, marginBottom: 12, fontWeight: '500' }}>{error}</Text>
        )}

        <TouchableOpacity 
          style={[themeStyles.btn, themeStyles.btnEmerald, styles.addBtn, { backgroundColor: colors.emerald }]}
          onPress={handleAdd}
        >
          <Plus size={16} color="#fff" />
          <Text style={[themeStyles.btnText, { marginLeft: 4 }]}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <View style={[themeStyles.card, styles.emptyCard, { backgroundColor: colors.card }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🎯</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No goals yet</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
            Create your first savings goal above — whether it's a laptop, vacation, or emergency fund.
          </Text>
        </View>
      ) : (
        <View style={styles.goalsContainer}>
          {goals.map((g) => {
            const pct = Math.min(100, g.target > 0 ? (g.current / g.target) * 100 : 0);
            const done = g.current >= g.target;
            const isAdding = addingFunds === g.id;

            return (
              <View key={g.id} style={[themeStyles.card, { backgroundColor: colors.card }]}>
                <View style={[themeStyles.flexBetween, { marginBottom: 12 }]}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.goalName, { color: colors.textPrimary }]}>{g.name}</Text>
                    {done ? (
                      <View style={[themeStyles.badge, { backgroundColor: colors.emerald + '15', marginTop: 4 }]}>
                        <Text style={{ color: colors.emerald, fontSize: 10, fontWeight: '700' }}>✅ Completed</Text>
                      </View>
                    ) : (
                      <Text style={[styles.etaText, { color: colors.emerald }]}>{estimateETA(g)}</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => deleteGoal(g.id)} style={styles.trashBtn}>
                    <Trash2 size={15} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                {/* Progress metrics */}
                <View style={[themeStyles.flexBetween, { marginBottom: 8 }]}>
                  <View>
                    <Text style={[styles.goalAmount, { color: colors.textPrimary }]}>
                      {cur}{g.current.toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                      saved of {cur}{g.target.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.pctText, { color: done ? colors.emerald : colors.blue }]}>
                      {pct.toFixed(0)}%
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>complete</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={[styles.progressTrack, { backgroundColor: colors.input, marginBottom: 16 }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${pct}%` },
                      done ? { backgroundColor: colors.emerald } : { backgroundColor: colors.blue }
                    ]} 
                  />
                </View>

                {/* Funds panel */}
                {!done && (
                  isAdding ? (
                    <View style={themeStyles.flexRow}>
                      <TextInput
                        style={[themeStyles.input, styles.fundInput, { color: colors.textPrimary }]}
                        keyboardType="numeric"
                        placeholder={`Amount (${cur})`}
                        placeholderTextColor={colors.textMuted}
                        value={fundAmt}
                        onChangeText={setFundAmt}
                        autoFocus
                      />
                      <TouchableOpacity 
                        style={[themeStyles.btn, themeStyles.btnEmerald, styles.miniBtn, { backgroundColor: colors.emerald }]}
                        onPress={() => addFunds(g.id)}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[themeStyles.btn, themeStyles.btnOutline, styles.miniBtn, { borderColor: colors.border }]}
                        onPress={() => setAddingFunds(null)}
                      >
                        <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[themeStyles.btn, themeStyles.btnOutline, styles.addFundsBtn, { borderColor: colors.blue }]}
                      onPress={() => setAddingFunds(g.id)}
                    >
                      <PlusCircle size={14} color={colors.blue} />
                      <Text style={[themeStyles.btnTextOutline, { color: colors.blue, marginLeft: 4, fontSize: 12 }]}>
                        Add Funds
                      </Text>
                    </TouchableOpacity>
                  )
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
  row: {
    flexDirection: 'row',
    gap: 12
  },
  addBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
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
  goalsContainer: {
    gap: 12
  },
  goalName: {
    fontSize: 15,
    fontWeight: '700'
  },
  etaText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  trashBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignSelf: 'flex-start'
  },
  goalAmount: {
    fontSize: 18,
    fontWeight: '800'
  },
  pctText: {
    fontSize: 20,
    fontWeight: '800'
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
  addFundsBtn: {
    width: '100%',
    paddingVertical: 10,
    borderWidth: 1.5,
    borderRadius: 8
  },
  fundInput: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 13,
    height: 38
  },
  miniBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 6,
    borderRadius: 6,
    height: 38
  }
});
