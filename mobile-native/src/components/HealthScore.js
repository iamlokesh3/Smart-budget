import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { computeHealthScore } from '../utils/analytics';
import { getTheme } from '../styles/theme';

function ScoreRing({ score, color, colors }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <View style={styles.ringContainer}>
      <Svg width={180} height={180}>
        {/* Background circle */}
        <Circle
          cx={90}
          cy={90}
          r={r}
          fill="none"
          stroke={colors.border}
          strokeWidth={12}
        />
        {/* Fill circle */}
        <Circle
          cx={90}
          cy={90}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </Svg>
      {/* Centered score text, counter-rotated back to normal */}
      <View style={styles.scoreTextWrapper}>
        <Text style={[styles.scoreValue, { color: colors.textPrimary }]}>
          {score}
        </Text>
      </View>
    </View>
  );
}

export default function HealthScore() {
  const { transactions, budgets, goals, darkMode } = useApp();
  const { colors, styles: themeStyles } = getTheme(darkMode);
  const result = computeHealthScore(transactions, budgets, goals);

  const levelInfo = {
    poor: {
      emoji: '😟',
      desc: 'Your finances need significant attention. Focus on budgeting and reducing unnecessary spending.',
      color: colors.danger,
    },
    average: {
      emoji: '😐',
      desc: "You're on track but there's room to improve. Try setting budgets and saving goals.",
      color: colors.warning,
    },
    good: {
      emoji: '😊',
      desc: 'Great financial habits! Keep up the budgeting and work towards your goals.',
      color: colors.emerald,
    },
    excellent: {
      emoji: '🌟',
      desc: "Outstanding financial health! You're on top of your spending, budgets, and savings goals.",
      color: colors.blue,
    },
  };

  if (!result) {
    return (
      <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
        <View style={styles.header}>
          <Text style={themeStyles.title}>Financial Health Score</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            A dynamic score computed from your real financial data.
          </Text>
        </View>

        <View style={[themeStyles.card, styles.emptyCard, { backgroundColor: colors.card }]}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>💪</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Score not available yet</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
            Add at least 3 transactions to unlock your financial health score. The score considers your spending habits, budgets, and goals.
          </Text>
        </View>

        <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
            How the score is calculated
          </Text>
          <View style={{ gap: 12 }}>
            {[
              ['📝', 'Transaction tracking — the more you track, the better'],
              ['📋', 'Budget creation and adherence'],
              ['🎯', 'Savings goals and progress'],
              ['📉', 'Budget overruns reduce your score'],
            ].map(([icon, text], i) => (
              <View key={i} style={themeStyles.flexRow}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>{icon}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>{text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  const info = levelInfo[result.levelClass] || levelInfo.average;

  return (
    <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
      <View style={styles.header}>
        <Text style={themeStyles.title}>Financial Health Score</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Computed from your real transactions, budgets, and goals.
        </Text>
      </View>

      {/* Ring Score Card */}
      <View style={[themeStyles.card, styles.ringCard, { backgroundColor: colors.card }]}>
        <ScoreRing score={result.score} color={info.color} colors={colors} />
        <View style={[themeStyles.flexRow, { justifyContent: 'center', marginVertical: 12 }]}>
          <Text style={{ fontSize: 24, marginRight: 6 }}>{info.emoji}</Text>
          <Text style={[styles.levelText, { color: info.color }]}>{result.level}</Text>
        </View>
        <Text style={[styles.descText, { color: colors.textSecondary }]}>{info.desc}</Text>
      </View>

      {/* Score Factors */}
      <View style={[themeStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
          Score Factors
        </Text>
        <View style={{ gap: 14 }}>
          {[
            { label: 'Transaction Tracking', value: Math.min(15, Math.floor(transactions.length / 2)), max: 15, icon: '📝' },
            { label: 'Budget Setup', value: budgets.length > 0 ? 10 : 0, max: 10, icon: '📋' },
            { label: 'Goals Created', value: goals.length > 0 ? 10 : 0, max: 10, icon: '🎯' },
            { label: 'Budget Adherence', value: result.score > 60 ? 15 : result.score > 40 ? 5 : 0, max: 15, icon: '✅' },
          ].map((f, i) => (
            <View key={i}>
              <View style={[themeStyles.flexBetween, { marginBottom: 6 }]}>
                <View style={themeStyles.flexRow}>
                  <Text style={{ fontSize: 14, marginRight: 6 }}>{f.icon}</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500' }}>{f.label}</Text>
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                  {f.value}/{f.max}
                </Text>
              </View>
              {/* Progress bar */}
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(f.value / f.max) * 100}%`,
                      backgroundColor: info.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Improvement Tips */}
      <View
        style={[
          themeStyles.card,
          {
            backgroundColor: darkMode ? '#1e3a5f' : '#eff6ff',
            borderColor: colors.blue + '40',
            borderWidth: 1.5,
            marginTop: 12,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.blue, marginBottom: 10 }]}>
          💡 How to improve your score
        </Text>
        <View style={{ gap: 8 }}>
          {[
            !budgets.length && '📋 Create a monthly budget to track your limits',
            !goals.length && '🎯 Add a savings goal to boost your score',
            transactions.length < 10 && '📝 Track more transactions for better accuracy',
            '🤖 Ask the AI advisor for personalized savings tips',
          ]
            .filter(Boolean)
            .map((tip, i) => (
              <View key={i} style={themeStyles.flexRow}>
                <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 }}>{tip}</Text>
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  ringCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12,
  },
  ringContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  scoreTextWrapper: {
    position: 'absolute',
    transform: [{ rotate: '90deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
  },
  levelText: {
    fontSize: 18,
    fontWeight: '800',
  },
  descText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
