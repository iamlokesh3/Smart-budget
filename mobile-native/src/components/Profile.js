import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Camera, Check, LogOut } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

export default function Profile() {
  const { user, logout, login, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const handleSave = () => {
    login({ ...user, name: form.name, email: form.email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePw = () => {
    if (pw.newPw.length < 6) return setPwMsg('Password must be at least 6 characters.');
    if (pw.newPw !== pw.confirm) return setPwMsg('Passwords do not match.');
    setPwMsg('✅ Password changed successfully!');
    setPw({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setPwMsg(''), 3000);
  };

  const initial = user?.name?.charAt(0).toUpperCase() || '?';
  const joined = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer} keyboardShouldPersistTaps="handled">
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={themeStyles.title}>Profile</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Manage your account information and password.
        </Text>
      </View>

      {/* Profile Info Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card, alignItems: 'center' }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarBig, { backgroundColor: colors.blue }]}>
            <Text style={styles.avatarBigText}>{initial}</Text>
          </View>
          <TouchableOpacity style={[styles.avatarEdit, { backgroundColor: colors.emerald }]}>
            <Camera size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>{user?.email}</Text>
        
        <View style={[themeStyles.badge, { backgroundColor: colors.emerald + '15', marginBottom: 20 }]}>
          <Text style={{ color: colors.emerald, fontSize: 11, fontWeight: '700' }}>Member since {joined}</Text>
        </View>

        {/* Input Details */}
        <View style={[themeStyles.inputGroup, { width: '100%' }]}>
          <Text style={themeStyles.label}>Full Name</Text>
          <TextInput
            style={[themeStyles.input, { color: colors.textPrimary }]}
            value={form.name}
            onChangeText={val => setForm(prev => ({ ...prev, name: val }))}
          />
        </View>

        <View style={[themeStyles.inputGroup, { width: '100%' }]}>
          <Text style={themeStyles.label}>Email</Text>
          <TextInput
            style={[themeStyles.input, { color: colors.textPrimary }]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={val => setForm(prev => ({ ...prev, email: val }))}
          />
        </View>

        <TouchableOpacity 
          style={[themeStyles.btn, themeStyles.btnPrimary, styles.saveBtn, { backgroundColor: colors.blue }]}
          onPress={handleSave}
        >
          {saved ? (
            <View style={styles.btnRow}>
              <Check size={16} color="#fff" />
              <Text style={[themeStyles.btnText, { marginLeft: 6 }]}>Saved!</Text>
            </View>
          ) : (
            <Text style={themeStyles.btnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Change Password Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardHeader, { color: colors.textPrimary, marginBottom: 16 }]}>Change Password</Text>
        
        {['current', 'newPw', 'confirm'].map((field, i) => (
          <View style={themeStyles.inputGroup} key={field}>
            <Text style={themeStyles.label}>
              {['Current Password', 'New Password', 'Confirm New Password'][i]}
            </Text>
            <TextInput
              style={[themeStyles.input, { color: colors.textPrimary }]}
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={pw[field]}
              onChangeText={val => setPw(prev => ({ ...prev, [field]: val }))}
            />
          </View>
        ))}

        {!!pwMsg && (
          <View 
            style={[
              styles.msgBox, 
              { 
                backgroundColor: pwMsg.startsWith('✅') ? colors.emeraldLight : colors.danger + '15',
                borderColor: pwMsg.startsWith('✅') ? colors.emerald : colors.danger
              }
            ]}
          >
            <Text style={{ color: pwMsg.startsWith('✅') ? colors.emeraldDark : colors.danger, fontSize: 13, fontWeight: '500' }}>
              {pwMsg}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[themeStyles.btn, themeStyles.btnOutline, styles.pwBtn, { borderColor: colors.border }]}
          onPress={handlePw}
        >
          <Text style={[themeStyles.btnTextOutline, { color: colors.textPrimary }]}>Update Password</Text>
        </TouchableOpacity>
      </View>

      {/* Danger/Log Out Card */}
      <View style={[themeStyles.card, { backgroundColor: colors.card, borderColor: '#fecaca' }]}>
        <Text style={[styles.cardHeader, { color: colors.danger, marginBottom: 4 }]}>Account Action</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 16 }}>
          Sign out of your Smart Budget account.
        </Text>
        <TouchableOpacity 
          style={[themeStyles.btn, styles.logoutBtn, { borderColor: '#fecaca' }]}
          onPress={logout}
        >
          <LogOut size={16} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14, marginLeft: 6 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 16
  },
  avatarBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarBigText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800'
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800'
  },
  saveBtn: {
    width: '100%',
    paddingVertical: 12,
    marginTop: 8
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pwBtn: {
    width: '100%',
    paddingVertical: 12,
    borderWidth: 1.5,
    marginTop: 8
  },
  msgBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12
  },
  logoutBtn: {
    width: '100%',
    paddingVertical: 12,
    borderWidth: 1,
    backgroundColor: '#fef2f2'
  }
});
