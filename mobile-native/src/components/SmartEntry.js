import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Send, Sparkles, Trash2, Edit2, Check, X } from 'lucide-react-native';
import { parseEntry, getCategoryMeta } from '../utils/aiParser';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

export default function SmartEntry() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction, renameCategory, currency, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [renameInput, setRenameInput] = useState('');

  const cur = currency || '₹';

  useEffect(() => {
    setRenameInput(filter !== 'all' ? filter : '');
  }, [filter]);

  const handleInputChange = (val) => {
    setInput(val);
    setError('');
    if (val.trim().length > 5) {
      const result = parseEntry(val);
      setParsed(result);
    } else {
      setParsed(null);
    }
  };

  const handleSubmit = () => {
    if (!parsed) {
      setError('Could not extract a valid amount. Try: "Spent ₹300 on pizza"');
      return;
    }
    addTransaction(parsed);
    setInput('');
    setParsed(null);
    setError('');
  };

  const startEdit = (tx) => {
    setEditId(tx.id);
    setEditTitle(tx.title);
  };

  const saveEdit = (id) => {
    updateTransaction(id, { title: editTitle });
    setEditId(null);
  };

  const handleRenameCategory = () => {
    if (!renameInput.trim() || filter === 'all') return;
    const newName = renameInput.trim();
    const meta = getCategoryMeta(newName);
    renameCategory(filter, newName, meta.icon, meta.color);
    setFilter(newName);
    setRenameInput('');
  };

  // Filtered transactions
  const categories = [...new Set(transactions.map(t => t.category))];
  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.category === filter);
  const totalFiltered = filtered.reduce((s, t) => s + t.amount, 0);

  const renderTransactionItem = ({ item }) => {
    const isEditing = editId === item.id;

    return (
      <View style={[themeStyles.flexBetween, styles.tableRow, { borderBottomColor: colors.border }]}>
        <View style={[themeStyles.flexRow, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.catEmoji}>{item.categoryIcon}</Text>
          <View style={{ flex: 1, marginLeft: 8 }}>
            {isEditing ? (
              <View style={themeStyles.flexRow}>
                <TextInput
                  style={[themeStyles.input, styles.editInput, { color: colors.textPrimary }]}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  autoFocus
                />
                <TouchableOpacity onPress={() => saveEdit(item.id)} style={styles.actionIcon}>
                  <Check size={18} color={colors.emerald} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditId(null)} style={styles.actionIcon}>
                  <X size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={[styles.txTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }} numberOfLines={1}>
                  {item.raw}
                </Text>
              </>
            )}
          </View>
        </View>
        
        {/* Right side items */}
        <View style={[themeStyles.flexRow, { alignItems: 'center' }]}>
          <Text style={[styles.txAmount, { color: colors.danger }]}>
            -{cur}{item.amount.toLocaleString('en-IN')}
          </Text>
          
          <View style={[themeStyles.flexRow, { marginLeft: 8 }]}>
            <TouchableOpacity onPress={() => startEdit(item)} style={styles.btnIconTiny}>
              <Edit2 size={13} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTransaction(item.id)} style={[styles.btnIconTiny, { marginLeft: 4 }]}>
              <Trash2 size={13} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer} keyboardShouldPersistTaps="handled">
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={[themeStyles.title, { marginBottom: 4 }]}>Smart Entries</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Type naturally — AI extracts amount, title, and category automatically.
        </Text>
      </View>

      {/* Smart input Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[themeStyles.flexRow, { marginBottom: 12 }]}>
          <Sparkles size={16} color={colors.blue} />
          <Text style={[styles.cardHeader, { color: colors.textPrimary, marginLeft: 6 }]}>Add Entry</Text>
        </View>

        <View style={styles.entryInputContainer}>
          <TextInput
            style={[themeStyles.input, styles.nleInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder='Try: "Spent ₹300 on pizza"'
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={handleInputChange}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: colors.blue }]} 
            onPress={handleSubmit}
          >
            <Send size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* AI Extracted preview */}
        {parsed && (
          <View style={[styles.previewContainer, { backgroundColor: colors.emeraldLight, borderColor: colors.emerald + '40' }]}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>{parsed.categoryIcon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: colors.emeraldDark, fontSize: 12, marginBottom: 4 }}>
                AI extracted:
              </Text>
              <View style={styles.chipsContainer}>
                <Text style={styles.chip}>💰 {cur}{parsed.amount}</Text>
                <Text style={styles.chip}>📝 {parsed.title}</Text>
                <Text style={styles.chip}>🏷️ {parsed.category}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Error message */}
        {!!error && (
          <View style={[styles.errorBox, { backgroundColor: colors.danger + '15', borderColor: colors.danger }]}>
            <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text>
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.tipsRow}>
          {['Spent ₹300 on pizza', 'Paid ₹1500 for books', 'Bought shoes for ₹2500'].map(tip => (
            <TouchableOpacity 
              key={tip} 
              style={[styles.tipBtn, { backgroundColor: colors.bgSubtle, borderColor: colors.border }]}
              onPress={() => handleInputChange(tip)}
            >
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction List content */}
      {transactions.length === 0 ? (
        <View style={[themeStyles.card, styles.emptyCard, { backgroundColor: colors.card }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>📝</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No entries yet</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
            Start by typing a transaction above. Your spending history will appear here.
          </Text>
        </View>
      ) : (
        <>
          {/* Filters Card */}
          <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>Filter by Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <TouchableOpacity
                style={[
                  styles.filterBadge,
                  filter === 'all' ? { backgroundColor: colors.blueLight } : { backgroundColor: colors.bgSubtle }
                ]}
                onPress={() => setFilter('all')}
              >
                <Text style={{ color: filter === 'all' ? colors.blue : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>All</Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterBadge,
                    filter === cat ? { backgroundColor: colors.blueLight } : { backgroundColor: colors.bgSubtle }
                  ]}
                  onPress={() => setFilter(cat)}
                >
                  <Text style={{ color: filter === cat ? colors.blue : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Rename Category Section */}
            {filter !== 'all' && (
              <View style={[styles.renameSection, { borderTopColor: colors.border }]}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>
                  Rename Category "{filter}":
                </Text>
                <View style={themeStyles.flexRow}>
                  <TextInput
                    style={[themeStyles.input, styles.renameInput, { color: colors.textPrimary }]}
                    placeholder="New name..."
                    placeholderTextColor={colors.textMuted}
                    value={renameInput}
                    onChangeText={setRenameInput}
                  />
                  <TouchableOpacity 
                    style={[styles.renameBtn, { backgroundColor: colors.emerald }]}
                    onPress={handleRenameCategory}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Transactions List Card */}
          <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.cardHeader, { color: colors.textPrimary }]}>All Entries</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                {filtered.length} entries · Total: <Text style={{ color: colors.danger, fontWeight: '700' }}>-{cur}{totalFiltered.toLocaleString('en-IN')}</Text>
              </Text>
            </View>

            <FlatList
              data={filtered}
              renderItem={renderTransactionItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        </>
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
  entryInputContainer: {
    position: 'relative',
    justifyContent: 'center'
  },
  nleInput: {
    paddingRight: 48
  },
  sendBtn: {
    position: 'absolute',
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginTop: 12
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  chip: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
    fontSize: 11,
    fontWeight: '600'
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12
  },
  tipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6
  },
  tipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1
  },
  tipText: {
    fontSize: 11
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
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 4
  },
  filterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99
  },
  renameSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1
  },
  renameInput: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 13
  },
  renameBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableRow: {
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  catEmoji: {
    fontSize: 20
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700'
  },
  editInput: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 13
  },
  actionIcon: {
    padding: 6,
    marginLeft: 4
  },
  btnIconTiny: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
