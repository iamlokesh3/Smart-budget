import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { ArrowLeft, Sparkles, User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

export default function Auth() {
  const { login, loginExisting, setPage, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const [tab, setTab] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = () => {
    setError('');

    if (tab === 'register') {
      if (!form.name.trim()) return setError('Please enter your name.');
      if (!form.email.includes('@')) return setError('Please enter a valid email.');
      if (form.password.length < 6) return setError('Password must be at least 6 characters.');
      if (form.password !== form.confirm) return setError('Passwords do not match.');
    } else {
      if (!form.email.includes('@')) return setError('Please enter a valid email.');
      if (!form.password) return setError('Please enter your password.');
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        if (tab === 'register') {
          const name = form.name;
          await login({
            id: Date.now().toString(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: form.email,
            joinedAt: new Date().toISOString(),
          }, true);
        } else {
          await loginExisting(form.email);
        }
      } catch (err) {
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    }, 900);
  };

  return (
    <SafeAreaView style={[themeStyles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={themeStyles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <TouchableOpacity 
          style={[themeStyles.btn, themeStyles.btnOutline, styles.backBtn, { borderColor: colors.border }]} 
          onPress={() => setPage('landing')}
        >
          <ArrowLeft size={16} color={colors.textPrimary} />
          <Text style={[themeStyles.btnTextOutline, { color: colors.textPrimary, marginLeft: 4 }]}>Back</Text>
        </TouchableOpacity>

        <View style={styles.authCard}>
          {/* Header Banner */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.blue }]}>
              <Sparkles size={24} color="#fff" />
            </View>
            <Text style={[themeStyles.title, { textAlign: 'center' }]}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </Text>
            <Text style={[themeStyles.subtitle, { textAlign: 'center', marginBottom: 0 }]}>
              {tab === 'login' ? 'Sign in to your workspace' : 'Start your financial journey'}
            </Text>
          </View>

          {/* Authentication Tabs */}
          <View style={[styles.tabsContainer, { backgroundColor: colors.bgInput }]}>
            <TouchableOpacity 
              style={[styles.tab, tab === 'login' && [styles.activeTab, { backgroundColor: colors.bg }]]}
              onPress={() => { setTab('login'); setError(''); }}
            >
              <Text style={[styles.tabText, { color: tab === 'login' ? colors.blue : colors.textMuted }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, tab === 'register' && [styles.activeTab, { backgroundColor: colors.bg }]]}
              onPress={() => { setTab('register'); setError(''); }}
            >
              <Text style={[styles.tabText, { color: tab === 'register' ? colors.blue : colors.textMuted }]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {tab === 'register' && (
              <View style={themeStyles.inputGroup}>
                <Text style={themeStyles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={colors.textMuted} style={styles.fieldIcon} />
                  <TextInput 
                    style={[themeStyles.input, { paddingLeft: 40 }]}
                    placeholder="Priya Sharma"
                    placeholderTextColor={colors.textMuted}
                    value={form.name}
                    onChangeText={val => updateForm('name', val)}
                  />
                </View>
              </View>
            )}

            <View style={themeStyles.inputGroup}>
              <Text style={themeStyles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput 
                  style={[themeStyles.input, { paddingLeft: 40 }]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="you@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={form.email}
                  onChangeText={val => updateForm('email', val)}
                />
              </View>
            </View>

            <View style={themeStyles.inputGroup}>
              <Text style={themeStyles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput 
                  style={[themeStyles.input, { paddingLeft: 40, paddingRight: 40 }]}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={form.password}
                  onChangeText={val => updateForm('password', val)}
                />
                <TouchableOpacity 
                  style={styles.eyeBtn}
                  onPress={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                </TouchableOpacity>
              </View>
            </View>

            {tab === 'register' && (
              <View style={themeStyles.inputGroup}>
                <Text style={themeStyles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={colors.textMuted} style={styles.fieldIcon} />
                  <TextInput 
                    style={[themeStyles.input, { paddingLeft: 40 }]}
                    secureTextEntry={!showPw}
                    autoCapitalize="none"
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={form.confirm}
                    onChangeText={val => updateForm('confirm', val)}
                  />
                </View>
              </View>
            )}

            {/* Error Message */}
            {!!error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.danger + '15', borderColor: colors.danger }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity 
              style={[themeStyles.btn, themeStyles.btnPrimary, styles.submitBtn, { backgroundColor: colors.blue }]} 
              disabled={loading}
              onPress={handleSubmit}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={[themeStyles.btnText, { marginLeft: 8 }]}>
                    {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                  </Text>
                </View>
              ) : (
                <Text style={themeStyles.btnText}>
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer toggle */}
          <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => setTab(tab === 'login' ? 'register' : 'login')}>
              <Text style={[styles.footerLink, { color: colors.blue }]}>
                {tab === 'login' ? 'Sign up' : 'Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20
  },
  authCard: {
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700'
  },
  form: {
    width: '100%'
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center'
  },
  fieldIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 10
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
    zIndex: 10
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 12
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500'
  },
  submitBtn: {
    marginTop: 16,
    paddingVertical: 14
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4
  }
});
