import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Zap, ChevronRight, Sparkles, MessageSquare, Target, BarChart3, Shield } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../styles/theme';

export default function Landing() {
  const { setPage, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);

  const keyFeatures = [
    { icon: <Sparkles size={20} color={colors.blue} />, title: 'AI-Powered Insights', desc: 'Get personalized financial advice powered by smart algorithms.' },
    { icon: <MessageSquare size={20} color={colors.emerald} />, title: 'Natural Language Entry', desc: 'Just type "Spent ₹300 on pizza" — AI extracts amounts automatically.' },
    { icon: <Target size={20} color={colors.blue} />, title: 'Smart Goal Tracking', desc: 'Set savings goals and watch AI calculate your completion target dates.' },
  ];

  return (
    <SafeAreaView style={[themeStyles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
        {/* Brand Logo Header */}
        <View style={styles.brandContainer}>
          <View style={[styles.brandIcon, { backgroundColor: colors.blue }]}>
            <Zap size={16} color="#fff" />
          </View>
          <Text style={[styles.brandText, { color: colors.textPrimary }]}>
            Smart<Text style={{ color: colors.blue }}>Budget</Text>
          </Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroEmoji]}>✨</Text>
          <Text style={[themeStyles.title, styles.heroTitle, { color: colors.textPrimary }]}>
            Your Personal AI{'\n'}Financial Advisor
          </Text>
          <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>
            Track expenses naturally, receive intelligent financial guidance, and achieve your goals with AI.
          </Text>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={[themeStyles.btn, themeStyles.btnPrimary, styles.ctaBtn, { backgroundColor: colors.blue }]}
              onPress={() => setPage('auth')}
            >
              <Text style={themeStyles.btnText}>Get Started</Text>
              <ChevronRight size={16} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[themeStyles.btn, themeStyles.btnOutline, styles.loginBtn, { borderColor: colors.border }]}
              onPress={() => setPage('auth')}
            >
              <Text style={[themeStyles.btnTextOutline, { color: colors.textPrimary }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Checklist */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.blue }]}>FEATURES</Text>
          {keyFeatures.map((f, i) => (
            <View key={i} style={[themeStyles.card, styles.featureCard, { backgroundColor: colors.card }]}>
              <View style={styles.featureIconContainer}>
                {f.icon}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{f.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
            © 2025 SmartBudget. Built with ❤️ for smarter finances.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 20
  },
  brandIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800'
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34
  },
  heroDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 24
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12
  },
  ctaBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  loginBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5
  },
  featuresSection: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16
  },
  featureCard: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 10
  },
  featureIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9'
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 20,
    alignItems: 'center'
  }
});
