import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

const CURRENCIES = [
  { symbol: '₹', name: 'Indian Rupee (INR)' },
  { symbol: '$', name: 'US Dollar (USD)' },
  { symbol: '€', name: 'Euro (EUR)' },
  { symbol: '£', name: 'British Pound (GBP)' },
  { symbol: '¥', name: 'Japanese Yen (JPY)' },
];

export default function Settings() {
  const { darkMode, setDarkMode, currency, setCurrency, notifSettings, setNotifSettings } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const toggleNotif = (key) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={themeStyles.title}>Settings</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Customize your Smart Budget experience.
        </Text>
      </View>

      {/* Appearance Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardHeader, { color: colors.textPrimary, borderBottomColor: colors.border }]}>🎨 Appearance</Text>
        <View style={[themeStyles.flexBetween, styles.settingsRow]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>Switch to a dark color scheme</Text>
          </View>
          <Switch 
            value={darkMode} 
            onValueChange={() => setDarkMode(!darkMode)}
            thumbColor="#ffffff"
            trackColor={{ false: '#cbd5e1', true: colors.blue }}
          />
        </View>
      </View>

      {/* Currency Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardHeader, { color: colors.textPrimary, borderBottomColor: colors.border }]}>💱 Currency</Text>
        <Text style={[themeStyles.label, { marginTop: 12, marginBottom: 8 }]}>Display Currency</Text>
        
        {/* Currency Select list of touchable rows */}
        <View style={styles.currencyList}>
          {CURRENCIES.map(c => {
            const isSelected = currency === c.symbol;
            return (
              <TouchableOpacity
                key={c.symbol}
                style={[
                  styles.currencyRow, 
                  { borderBottomColor: colors.border },
                  isSelected && { backgroundColor: colors.blueLight }
                ]}
                onPress={() => setCurrency(c.symbol)}
              >
                <Text style={{ fontSize: 14, fontWeight: isSelected ? '700' : '500', color: isSelected ? colors.blue : colors.textPrimary }}>
                  {c.symbol} — {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 12, lineHeight: 16 }}>
          Changing currency updates the display symbol only. Your stored amounts remain the same.
        </Text>
      </View>

      {/* Notifications Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardHeader, { color: colors.textPrimary, borderBottomColor: colors.border }]}>🔔 Notifications</Text>
        {[
          { key: 'budget', label: 'Budget Alerts', desc: 'Notify when spending approaches or exceeds budget' },
          { key: 'goals', label: 'Goal Updates', desc: 'Notify when a savings goal is completed' },
          { key: 'weekly', label: 'Weekly Summary', desc: 'Receive a weekly spending overview' },
        ].map(({ key, label, desc }) => (
          <View style={[themeStyles.flexBetween, styles.settingsRow, { borderBottomColor: colors.border, borderBottomWidth: 1 }]} key={key}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{label}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{desc}</Text>
            </View>
            <Switch 
              value={notifSettings[key]} 
              onValueChange={() => toggleNotif(key)}
              thumbColor="#ffffff"
              trackColor={{ false: '#cbd5e1', true: colors.blue }}
            />
          </View>
        ))}
      </View>

      {/* About Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardHeader, { color: colors.textPrimary, borderBottomColor: colors.border }]}>ℹ️ About</Text>
        <View style={styles.aboutList}>
          {[
            ['Version', '2.0.0'],
            ['Built with', 'React Native (Expo)'],
            ['AI Engine', 'Client-side NLP'],
            ['Storage', 'Memory Context (private)'],
          ].map(([k, v]) => (
            <View key={k} style={[themeStyles.flexBetween, { paddingVertical: 8 }]}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{k}</Text>
              <Text style={{ fontWeight: '600', color: colors.textPrimary, fontSize: 13 }}>{v}</Text>
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
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    paddingBottom: 10,
    borderBottomWidth: 1
  },
  settingsRow: {
    paddingVertical: 14
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600'
  },
  currencyList: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    overflow: 'hidden'
  },
  currencyRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1
  },
  aboutList: {
    marginTop: 10
  }
});
